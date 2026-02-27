import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { clientService, Client } from '../../services/clientService';
import { developerService, Developer } from '../../services/developerService';
import hourLogService from '../../services/hourLogService';
import taskService, { Task } from '../../services/taskService';
import { Axios } from '../../utils/axios';
import { useForm } from '../../hooks/useForm';
import { hourLogSchema } from '../../validation/authValidation';
import { X } from 'lucide-react';

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

interface AddHourLogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddHourLogModal: React.FC<AddHourLogModalProps> = ({ isOpen, onClose }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [clients, setClients] = useState<Client[]>([]);
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [fetchLoading, setFetchLoading] = useState(true);

  const {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    setFieldValue,
    resetForm
  } = useForm({
    initialValues: {
      client: '',
      developer: user?.role === 2 ? user._id : '',
      project: '',
      task: '',
      date: new Date().toISOString().split('T')[0],
      hours: '' as any,
      description: ''
    },
    validationSchema: hourLogSchema,
    context: { isDeveloper: user?.role === 2 },
    onSubmit: async (formData) => {
      try {
        // For developers, ensure task is selected
        if (user?.role === 2 && !formData.task) {
          throw new Error('Task is required for developers');
        }
        
        // Prevent submission if developer and no tasks available
        if (user?.role === 2 && tasks.length === 0) {
          throw new Error('No tasks available. Please contact your BA to create tasks for this project.');
        }
        
        await hourLogService.create(formData);
        
        // Reset form and close modal
        resetForm();
        setFieldValue('developer', user?.role === 2 ? user._id : '');
        setFieldValue('date', new Date().toISOString().split('T')[0]);
        onClose();
      } catch (error: any) {
        console.error('Error adding hour log:', error);
        throw error;
      }
    }
  });

  const fetchClientsAndDevelopers = useCallback(async () => {
    setFetchLoading(true);
    try {
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
        setClients([]);
      } else {
        const developersResponse = await developerService.getAll({ limit: 1000 });
        setDevelopers(developersResponse.developers);
      }

      if (user?.role === 0) {
        const clientsResponse = await clientService.getAll({ limit: 1000 });
        setClients(clientsResponse.clients);
      }
    } catch (error: any) {
      console.error('Error fetching data:', error);
    } finally {
      setFetchLoading(false);
    }
  }, [user?.role, user?.id, user?.name, user?.email, setFieldValue]);

  useEffect(() => {
    if (isOpen) {
      fetchProjects();
      if (user?.role === 0) {
        fetchClientsAndDevelopers();
      } else if (user?.role === 2) {
        setFieldValue('developer', user._id);
        fetchClientsAndDevelopers();
      }
    }
  }, [isOpen, fetchClientsAndDevelopers, setFieldValue, user?._id, user?.role]);

  const fetchProjects = async () => {
    try {
      const response = await Axios.get('/projects');
      if (response.data.success) {
        setProjects(response.data.data.projects);
      }
    } catch (error: any) {
      console.error('Error fetching projects:', error);
    }
  };

  const fetchProjectTasks = useCallback(async (projectId: string) => {
    try {
      const projectTasks = await taskService.getByProject(projectId);
      // Filter tasks assigned to the current developer if developer role
      if (user?.role === 2) {
        const myTasks = projectTasks.filter(task => 
          task.assignedTo.some(dev => dev._id === user._id)
        );
        setTasks(myTasks);
      } else {
        setTasks(projectTasks);
      }
    } catch (error: any) {
      console.error('Error fetching tasks:', error);
      setTasks([]);
    }
  }, [user?.role, user?._id]);

  useEffect(() => {
    if (values.project) {
      const selectedProject = projects.find(p => p._id === values.project);
      if (selectedProject) {
        setFieldValue('client', selectedProject.client._id);
        
        if (user?.role === 0) {
          const projectDevelopers = developers.filter((d: any) => 
            selectedProject.developers.some((pd: any) => pd._id === d._id)
          );
          if (projectDevelopers.length > 0 && !projectDevelopers.some((d: any) => d._id === values.developer)) {
            setFieldValue('developer', projectDevelopers[0]._id);
          }
        }
        
        // Fetch tasks for the selected project
        fetchProjectTasks(values.project);
      }
    } else {
      setTasks([]);
      setFieldValue('task', '');
    }
  }, [values.project, developers, projects, setFieldValue, user?.role, values.developer, fetchProjectTasks]);

  if (!isOpen) return null;
console.log("???",tasks)
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        ></div>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          {/* Header */}
          <div className="bg-green-600 px-6 py-4 flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">Add Hour Log</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="bg-white px-6 py-6 max-h-[calc(100vh-200px)] overflow-y-auto">
            {fetchLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="text-center">
                  <div className="text-gray-400 text-2xl mb-4">⏳</div>
                  <p className="text-gray-600">Loading...</p>
                </div>
              </div>
            ) : (
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

                {/* Task Dropdown - Show if project is selected */}
                {values.project && (
                  <div>
                    <label htmlFor="task" className="block text-sm font-medium text-gray-700 mb-2">
                      Task {user?.role === 2 ? '*' : '(Optional)'}
                    </label>
                    {tasks.length > 0 ? (
                      <>
                        <select
                          id="task"
                          name="task"
                          value={values.task}
                          onChange={handleChange}
                          required={user?.role === 2}
                          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                            errors.task ? 'border-red-300' : 'border-gray-300'
                          }`}
                        >
                          <option value="">
                            {user?.role === 2 ? 'Select a task' : 'Select a task (optional)'}
                          </option>
                          {tasks.map((task) => (
                            <option key={task._id} value={task._id}>
                              {task.title} - {task.status}
                            </option>
                          ))}
                        </select>
                        {errors.task && (
                          <p className="mt-1 text-sm text-red-600">{errors.task}</p>
                        )}
                        {user?.role === 2 && (
                          <p className="mt-1 text-sm text-blue-600">
                            ℹ️ Developers must log hours against specific tasks
                          </p>
                        )}
                      </>
                    ) : (
                      <div className="w-full px-3 py-2 border border-yellow-300 bg-yellow-50 rounded-md text-sm text-yellow-800">
                        <p className="font-medium">⚠️ No tasks available for this project</p>
                        {user?.role === 2 ? (
                          <p className="mt-1">Developers must log hours against tasks. Please contact your BA to create tasks for this project.</p>
                        ) : (
                          <p className="mt-1">Create tasks in the Projects page to enable task-based hour logging.</p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Client Dropdown */}
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

                  {/* Project Client Info */}
                  {values.project && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Client *
                      </label>
                      <div className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100">
                        {projects.find(p => p._id === values.project)?.client.name || 'Loading...'}
                      </div>
                      <p className="mt-1 text-sm text-gray-500">Auto-selected from project</p>
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

                {/* Footer Buttons */}
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || (user?.role === 2 && (!values.task || tasks.length === 0))}
                    className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Adding...' : 'Add Hour Log'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddHourLogModal;
