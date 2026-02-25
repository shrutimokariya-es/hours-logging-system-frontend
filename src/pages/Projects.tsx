import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { toast } from 'react-toastify';
import { Axios } from '../utils/axios';
import hourLogService from '../services/hourLogService';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface HourLogDetails {
  _id: string;
  date: string;
  hours: number;
  description: string;
  developer: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
}

interface Project {
  _id: string;
  name: string;
  description?: string;
  client: {
    _id: string;
    name: string;
    email: string;
  };
  developers: Array<{
    _id: string;
    name: string;
  }>;
  status: 'Planning' | 'Active' | 'On Hold' | 'Completed' | 'Cancelled';
  startDate?: string;
  endDate?: string;
  estimatedHours?: number;
  actualHours?: number;
  hourlyRate?: number;
  billingType: 'Hourly' | 'Fixed';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: number;
  status?: string;
}

interface ProjectFormData {
  name: string;
  description: string;
  client: string;
  developers: string[];
  status: 'Planning' | 'Active' | 'On Hold' | 'Completed' | 'Cancelled';
  startDate: string;
  endDate: string;
  estimatedHours: number;
  hourlyRate: number;
  billingType: 'Hourly' | 'Fixed';
}

const Projects: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<User[]>([]);
  const [developers, setDevelopers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
  const [projectHourLogs, setProjectHourLogs] = useState<Record<string, HourLogDetails[]>>({});
  const [loadingHourLogs, setLoadingHourLogs] = useState<Record<string, boolean>>({});
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    description: '',
    client: '',
    developers: [],
    status: 'Planning',
    startDate: '',
    endDate: '',
    estimatedHours: 0,
    hourlyRate: 0,
    billingType: 'Hourly'
  });

  useEffect(() => {
    fetchProjects();
    if (user?.role === 0) {
      fetchClients();
      fetchDevelopers();
    }
  }, [user?.role]);

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
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await Axios.get('/clients');
      console.log('Clients API response:', response.data);
      if (response.data.success) {
        setClients(response.data.data.clients);
      } else {
        toast.error(response.data.message || 'Failed to fetch clients');
      }
    } catch (error: any) {
      console.error('Error fetching clients:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch clients');
    }
  };

  const fetchDevelopers = async () => {
    try {
      const response = await Axios.get('/developers');
      console.log('Developers API response:', response.data);
      if (response.data.success) {
        setDevelopers(response.data.data.developers);
      } else {
        toast.error(response.data.message || 'Failed to fetch developers');
      }
    } catch (error: any) {
      console.error('Error fetching developers:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch developers');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingProject 
        ? `/projects/${editingProject._id}`
        : '/projects';
      
      const response = editingProject 
        ? await Axios.put(url, formData)
        : await Axios.post(url, formData);
      
      console.log('Submit response:', response.data);
      
      if (response.data.success) {
        toast.success(editingProject ? 'Project updated successfully' : 'Project created successfully');
        setShowModal(false);
        setEditingProject(null);
        resetForm();
        fetchProjects();
      } else {
        toast.error(response.data.message || 'Failed to save project');
      }
    } catch (error: any) {
      console.error('Error saving project:', error);
      toast.error(error.response?.data?.message || 'Failed to save project');
    }
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      description: project.description || '',
      client: project.client._id,
      developers: project.developers.map(d => d._id),
      status: project.status,
      startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
      endDate: project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : '',
      estimatedHours: project.estimatedHours || 0,
      hourlyRate: project.hourlyRate || 0,
      billingType: project.billingType
    });
    setShowModal(true);
  };

  const handleDelete = async (projectId: string) => {
    if (!window.confirm('Are you sure you want to delete this project?')) {
      return;
    }

    try {
      const response = await Axios.delete(`/projects/${projectId}`);
      console.log('Delete response:', response.data);
      
      if (response.data.success) {
        toast.success('Project deleted successfully');
        fetchProjects();
      } else {
        toast.error(response.data.message || 'Failed to delete project');
      }
    } catch (error: any) {
      console.error('Error deleting project:', error);
      toast.error(error.response?.data?.message || 'Failed to delete project');
    }
  };

  const toggleProjectExpansion = async (projectId: string) => {
    const newExpanded = new Set(expandedProjects);
    
    if (newExpanded.has(projectId)) {
      // Collapse project
      newExpanded.delete(projectId);
      setExpandedProjects(newExpanded);
    } else {
      // Expand project and fetch hour logs
      newExpanded.add(projectId);
      setExpandedProjects(newExpanded);
      
      if (!projectHourLogs[projectId]) {
        setLoadingHourLogs(prev => ({ ...prev, [projectId]: true }));
        
        try {
          const response = await hourLogService.getByProject(projectId, { limit: 50 });
          
          // Transform the data to match our interface
          const transformedLogs: HourLogDetails[] = response.hourLogs.map(log => ({
            _id: log._id,
            date: log.date,
            hours: log.hours,
            description: log.description,
            developer: typeof log.developer === 'object' ? log.developer : {
              _id: log.developer,
              name: 'Unknown',
              email: ''
            },
            createdAt: log.createdAt
          }));
          
          setProjectHourLogs(prev => ({ ...prev, [projectId]: transformedLogs }));
        } catch (error: any) {
          console.error('Error fetching hour logs:', error);
          toast.error('Failed to fetch hour logs for this project');
        } finally {
          setLoadingHourLogs(prev => ({ ...prev, [projectId]: false }));
        }
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      client: '',
      developers: [],
      status: 'Planning',
      startDate: '',
      endDate: '',
      estimatedHours: 0,
      hourlyRate: 0,
      billingType: 'Hourly'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Planning': return 'bg-gray-100 text-gray-800';
      case 'Active': return 'bg-green-100 text-green-800';
      case 'On Hold': return 'bg-yellow-100 text-yellow-800';
      case 'Completed': return 'bg-blue-100 text-blue-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading projects...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-600">Manage your projects and track progress</p>
        </div>
        {user?.role === 0 && (
          <button
            onClick={() => {
              resetForm();
              setEditingProject(null);
              setShowModal(true);
            }}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Add Project
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Project Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Developers
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hours
                </th>
                {user?.role === 0 && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {projects.length === 0 ? (
                <tr>
                  <td colSpan={user?.role === 0 ? 6 : 5} className="px-6 py-12 text-center text-gray-500">
                    No projects found
                  </td>
                </tr>
              ) : (
                projects.map((project) => (
                  <React.Fragment key={project._id}>
                    <tr 
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => toggleProjectExpansion(project._id)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {expandedProjects.has(project._id) ? (
                            <ChevronDown className="w-4 h-4 mr-2 text-gray-400" />
                          ) : (
                            <ChevronRight className="w-4 h-4 mr-2 text-gray-400" />
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">{project.name}</div>
                            {project.description && (
                              <div className="text-sm text-gray-500 truncate max-w-xs">{project.description}</div>
                            )}
                          </div>
                        </div>
                      </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{project.client.name}</div>
                      <div className="text-sm text-gray-500">{project.client.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(project.status)}`}>
                        {project.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {project.developers.length} developer{project.developers.length !== 1 ? 's' : ''}
                      </div>
                      <div className="text-sm text-gray-500">
                        {project.developers.slice(0, 2).map((d: any) => d.name).join(', ')}
                        {project.developers.length > 2 && '...'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        Est: {project.estimatedHours || 0}h
                      </div>
                      <div className="text-sm text-gray-500">
                        Actual: {project.actualHours || 0}h
                      </div>
                    </td>
                      {user?.role === 0 && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleEdit(project)}
                            className="text-green-600 hover:text-green-900 mr-3"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(project._id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      )}
                    </tr>
                    
                    {/* Expandable row for hour logs */}
                    {expandedProjects.has(project._id) && (
                      <tr>
                        <td colSpan={user?.role === 0 ? 6 : 5} className="px-0 py-0">
                          <div className="bg-gray-50 border-l-4 border-green-500">
                            {loadingHourLogs[project._id] ? (
                              <div className="px-6 py-4 text-center text-gray-500">
                                Loading hour logs...
                              </div>
                            ) : projectHourLogs[project._id]?.length > 0 ? (
                              <div className="p-4">
                                <h4 className="text-sm font-semibold text-gray-700 mb-3">Logged Hours</h4>
                                <div className="space-y-2">
                                  {projectHourLogs[project._id].map((log) => (
                                    <div key={log._id} className="bg-white p-3 rounded border border-gray-200">
                                      <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                          <div className="text-sm font-medium text-gray-900">
                                            {log.developer.name}
                                          </div>
                                          <div className="text-sm text-gray-600 mt-1">
                                            {log.description}
                                          </div>
                                        </div>
                                        <div className="text-right ml-4">
                                          <div className="text-sm font-semibold text-green-600">
                                            {log.hours}h
                                          </div>
                                          <div className="text-xs text-gray-500">
                                            {new Date(log.date).toLocaleDateString()}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <div className="px-6 py-4 text-center text-gray-500">
                                No hour logs found for this project
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-lg bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingProject ? 'Edit Project' : 'Add New Project'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Project Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Client
                  </label>
                  <select
                    required
                    value={formData.client}
                    onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="">Select a client</option>
                    {clients.map((client: any) => (
                      <option key={client._id} value={client._id}>
                        {client.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Developers
                  </label>
                  <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2">
                    {developers.map((developer: any) => (
                      <label key={developer._id} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.developers.includes(developer._id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({ ...formData, developers: [...formData.developers, developer._id] });
                            } else {
                              setFormData({ ...formData, developers: formData.developers.filter(id => id !== developer._id) });
                            }
                          }}
                          className="mr-2"
                        />
                        <span className="text-sm">{developer.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="Planning">Planning</option>
                    <option value="Active">Active</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estimated Hours
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.estimatedHours}
                      onChange={(e) => setFormData({ ...formData, estimatedHours: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hourly Rate
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.hourlyRate}
                      onChange={(e) => setFormData({ ...formData, hourlyRate: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Billing Type
                  </label>
                  <select
                    value={formData.billingType}
                    onChange={(e) => setFormData({ ...formData, billingType: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="Hourly">Hourly</option>
                    <option value="Fixed">Fixed</option>
                  </select>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    {editingProject ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
