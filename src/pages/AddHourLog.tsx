import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { clientService, Client } from '../services/clientService';
import { developerService, Developer } from '../services/developerService';
import hourLogService, { HourLogFormData } from '../services/hourLogService';
import { toast } from 'react-toastify';
import { Axios } from '../utils/axios';
import { useForm } from '../hooks/useForm';
import { FormSelect, FormInput, Button } from '../components/common';

interface Project {
  _id: string;
  name: string;
  client: {
    _id: string;
    name: string;
  };
  developers: Array<{
    _id: string;
    name: string;
  }>;
}

const AddHourLog: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [clients, setClients] = useState<Client[]>([]);
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [fetchLoading, setFetchLoading] = useState(true);

  const {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    setFieldValue,
    setErrors,
    resetForm
  } = useForm({
    initialValues: {
      client: '',
      developer: user?.role === 2 ? user._id : '',
      project: '',
      date: new Date().toISOString().split('T')[0],
      hours: 0,
      description: ''
    },
    validationSchema: {
      validate: (formData: HourLogFormData) => {
        const newErrors: Record<string, string> = {};

        if (!formData.project) {
          newErrors.project = 'Please select a project';
        }

        // Client validation - only required if no project is selected
        if (!formData.project && !formData.client) {
          newErrors.client = 'Please select a client';
        }

        if (!formData.developer) {
          newErrors.developer = 'Please select a developer';
        }

        if (!formData.date) {
          newErrors.date = 'Please select a date';
        }

        if (!formData.hours || formData.hours <= 0) {
          newErrors.hours = 'Hours must be greater than 0';
        }

        if (formData.hours > 24) {
          newErrors.hours = 'Hours cannot exceed 24';
        }

        if (!formData.description.trim()) {
          newErrors.description = 'Description is required';
        }

        return newErrors;
      }
    },
    onSubmit: async (formData) => {
      try {
        await hourLogService.create(formData);
        toast.success('Hour log added successfully');
        
        // Reset form
        resetForm();
        setFieldValue('developer', user?.role === 2 ? user._id : '');
        setFieldValue('date', new Date().toISOString().split('T')[0]);
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to add hour log');
        console.error('Error adding hour log:', error);
        throw error; // Re-throw to let useForm handle isSubmitting state
      }
    }
  });

  useEffect(() => {
    fetchProjects();
    // Only fetch clients if no project-based workflow
    // For developers, they can work with projects directly
    if (user?.role === 0) {
      // BA can see all clients for manual selection
      fetchClientsAndDevelopers();
    } else if (user?.role === 2) {
      // Developers only need their own info
      console.log("user", user);
      setFieldValue('developer', user._id);
      console.log("formData", values);
      fetchClientsAndDevelopers();
    }
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await Axios.get('/projects');
      console.log('Projects API response:', response.data);
      if (response.data.success) {
        setProjects(response.data.data.projects);
      } else {
        toast.error(response.data.message || 'Failed to fetch projects');
      }
    } catch (error: any) {
      console.error('Error fetching projects:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch projects');
    }
  };

  const fetchClientsAndDevelopers = async () => {
    setFetchLoading(true);
    try {
      // For developers, only fetch their own info - NO CLIENTS
      if (user?.role === 2) {
        setDevelopers([{
          _id: user.id,
          name: user.name,
          email: user.email,
          hourlyRate: 0,
          role: '2',
          status: 'Active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }]);
        setFieldValue('developer', user.id);
        // Developers don't need to fetch clients - they work with projects
        setClients([]);
      } else {
        const developersResponse = await developerService.getAll({ limit: 1000 });
        setDevelopers(developersResponse.developers);
      }

      // For clients, only BA can fetch them
      if (user?.role === 0) {
        const clientsResponse = await clientService.getAll({ limit: 1000 });
        setClients(clientsResponse.clients);
      }
    } catch (error: any) {
      toast.error('Failed to fetch clients and developers');
      console.error('Error fetching data:', error);
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    if (values.project) {
      const selectedProject = projects.find(p => p._id === values.project);
      if (selectedProject) {
        setFieldValue('client', selectedProject.client._id);
        
        // Filter developers based on project assignment
        if (user?.role === 0) {
          const projectDevelopers = developers.filter((d: any) => 
            selectedProject.developers.some((pd: any) => pd._id === d._id)
          );
          if (projectDevelopers.length > 0 && !projectDevelopers.some((d: any) => d._id === values.developer)) {
            setFieldValue('developer', projectDevelopers[0]._id);
          }
        }
      }
    }
  }, [values.project]);

  if (fetchLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="text-gray-400 text-2xl mb-4">⏳</div>
          <p className="text-gray-600">Loading clients and developers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Add Hour Log</h1>
          <p className="text-gray-600 mt-2">Log hours worked for a specific client and developer</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Project Dropdown */}
          <div>
            <label htmlFor="project" className="block text-sm font-medium text-gray-700 mb-2">
              Project *
            </label>
            <select
              id="project"
              name="project"
              value={values.project}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                errors.project ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Select a project</option>
              {projects.map((project) => (
                <option key={project._id} value={project._id}>
                  {project.name} - {project.client.name}
                </option>
              ))}
            </select>
            {errors.project && (
              <p className="mt-1 text-sm text-red-600">{errors.project}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Client Dropdown - Only show if no project is selected */}
            {!values.project && (
              <div>
                <label htmlFor="client" className="block text-sm font-medium text-gray-700 mb-2">
                  Client *
                </label>
                <select
                  id="client"
                  name="client"
                  value={values.client}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    errors.client ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select a client</option>
                  {clients.map((client) => (
                    <option key={client._id} value={client._id}>
                      {client.name}
                    </option>
                  ))}
                </select>
                {errors.client && (
                  <p className="mt-1 text-sm text-red-600">{errors.client}</p>
                )}
              </div>
            )}

            {/* Project Client Info - Show when project is selected */}
            {values.project && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Client *
                </label>
                <div className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100">
                  {projects.find(p => p._id === values.project)?.client.name || 'Loading...'}
                </div>
                <p className="mt-1 text-sm text-gray-500">Client auto-selected from project</p>
              </div>
            )}

            {/* Developer Dropdown */}
            <div className={values.project ? "md:col-span-2" : ""}>
              <label htmlFor="developer" className="block text-sm font-medium text-gray-700 mb-2">
                Developer *
              </label>
              <select
                id="developer"
                name="developer"
                value={values.developer}
                onChange={handleChange}
                disabled={user?.role === 2}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.developer ? 'border-red-300' : 'border-gray-300'
                } ${user?.role === 2 ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              >
                <option value="">Select a developer</option>
                {developers.map((developer) => (
                  <option key={developer._id} value={developer._id}>
                    {developer.name}
                  </option>
                ))}
              </select>
              {errors.developer && (
                <p className="mt-1 text-sm text-red-600">{errors.developer}</p>
              )}
              {user?.role === 2 && (
                <p className="mt-1 text-sm text-gray-500">Only your own profile is available</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Date Picker */}
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                Date *
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={values.date}
                onChange={handleChange}
                max={new Date().toISOString().split('T')[0]}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.date ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.date && (
                <p className="mt-1 text-sm text-red-600">{errors.date}</p>
              )}
            </div>

            {/* Hours Input */}
            <div>
              <label htmlFor="hours" className="block text-sm font-medium text-gray-700 mb-2">
                Hours *
              </label>
              <input
                type="number"
                id="hours"
                name="hours"
                value={values.hours}
                onChange={handleChange}
                min="0.5"
                max="24"
                step="0.5"
                placeholder="Enter hours worked"
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.hours ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.hours && (
                <p className="mt-1 text-sm text-red-600">{errors.hours}</p>
              )}
            </div>
          </div>

          {/* Description Textarea */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={values.description}
              onChange={handleChange}
              rows={4}
              placeholder="Describe the work performed..."
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                errors.description ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Adding...' : 'Add Hour Log'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddHourLog;
