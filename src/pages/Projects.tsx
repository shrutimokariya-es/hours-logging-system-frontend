import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
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
      }
    } catch (error: any) {
      console.error('Error fetching projects:', error);
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
      }
    } catch (error: any) {
      console.error('Error fetching clients:', error);
    }
  };

  const fetchDevelopers = async () => {
    try {
      const response = await Axios.get('/developers');
      console.log('Developers API response:', response.data);
      if (response.data.success) {
        setDevelopers(response.data.data.developers);
      } else {
      }
    } catch (error: any) {
      console.error('Error fetching developers:', error);
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
        setShowModal(false);
        setEditingProject(null);
        resetForm();
        fetchProjects();
      } else {
      }
    } catch (error: any) {
      console.error('Error saving project:', error);
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
        fetchProjects();
      } else {
      }
    } catch (error: any) {
      console.error('Error deleting project:', error);
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
console.log("projects",projects)
  return (
    <div className="space-y-6">
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-lg shadow-lg p-6 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Projects</h1>
            <p className="text-green-100 mt-1">Manage your projects and track progress</p>
            <div className="flex items-center space-x-4 mt-3">
              <div className="flex items-center space-x-2">
                <div className="bg-white bg-opacity-20 rounded-full p-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                  </svg>
                </div>
                <div>
                  <div className="text-2xl font-bold">{projects.length}</div>
                  <div className="text-xs text-green-100">Total Projects</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="bg-white bg-opacity-20 rounded-full p-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <div className="text-2xl font-bold">{projects.filter(p => p.status === 'Active').length}</div>
                  <div className="text-xs text-green-100">Active</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="bg-white bg-opacity-20 rounded-full p-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <div className="text-2xl font-bold">{projects.reduce((sum, p) => sum + (p.actualHours || 0), 0)}</div>
                  <div className="text-xs text-green-100">Total Hours</div>
                </div>
              </div>
            </div>
          </div>
          {user?.role === 0 && (
            <button
              onClick={() => {
                resetForm();
                setEditingProject(null);
                setShowModal(true);
              }}
              className="bg-white text-green-600 hover:bg-green-50 px-6 py-3 rounded-lg font-semibold shadow-md transform hover:scale-105 transition-all duration-200 flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Add Project</span>
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Project Details
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Team
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Progress
                </th>
                {user?.role === 0 && (
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {projects.length === 0 ? (
                <tr>
                  <td colSpan={user?.role === 0 ? 6 : 5} className="px-6 py-16 text-center">
                    <div className="text-6xl mb-4">📁</div>
                    <p className="text-gray-600 text-lg font-medium">No projects found</p>
                    <p className="text-gray-500 text-sm mt-2">Create your first project to get started</p>
                    {user?.role === 0 && (
                      <button
                        onClick={() => {
                          resetForm();
                          setEditingProject(null);
                          setShowModal(true);
                        }}
                        className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Create Project
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                projects.map((project) => (
                  <React.Fragment key={project._id}>
                    <tr 
                      className="hover:bg-green-50 cursor-pointer transition-colors duration-150"
                      onClick={() => toggleProjectExpansion(project._id)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            {expandedProjects.has(project._id) ? (
                              <ChevronDown className="w-5 h-5 text-green-600" />
                            ) : (
                              <ChevronRight className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-semibold text-gray-900">{project.name}</div>
                            {project.description && (
                              <div className="text-xs text-gray-500 truncate max-w-xs mt-1">{project.description}</div>
                            )}
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="text-xs text-gray-400">
                                {project.billingType === 'Hourly' ? '⏱️ Hourly' : '💰 Fixed'}
                              </span>
                              {project.hourlyRate && (
                                <span className="text-xs text-gray-400">• ${project.hourlyRate}/hr</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                            {project.client.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">{project.client.name}</div>
                            <div className="text-xs text-gray-500">{project.client.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusColor(project.status)}`}>
                          {project.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex -space-x-2">
                            {project.developers.slice(0, 3).map((dev: any, idx) => (
                              <div 
                                key={dev._id}
                                className="h-8 w-8 rounded-full bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center text-white font-bold text-xs border-2 border-white"
                                title={dev.name}
                              >
                                {dev.name.charAt(0).toUpperCase()}
                              </div>
                            ))}
                            {project.developers.length > 3 && (
                              <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-xs border-2 border-white">
                                +{project.developers.length - 3}
                              </div>
                            )}
                          </div>
                          <div className="ml-3 text-xs text-gray-500">
                            {project.developers.length} dev{project.developers.length !== 1 ? 's' : ''}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-600 font-medium">Est: {project.estimatedHours || 0}h</span>
                            <span className="text-green-600 font-semibold">Act: {project.actualHours || 0}h</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                (project.actualHours || 0) > (project.estimatedHours || 0) 
                                  ? 'bg-red-500' 
                                  : 'bg-green-500'
                              }`}
                              style={{ 
                                width: `${Math.min(100, ((project.actualHours || 0) / (project.estimatedHours || 1)) * 100)}%` 
                              }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      {user?.role === 0 && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleEdit(project)}
                            className="text-green-600 hover:text-green-900 mr-4 font-semibold"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => handleDelete(project._id)}
                            className="text-red-600 hover:text-red-900 font-semibold"
                          >
                            🗑️ Delete
                          </button>
                        </td>
                      )}
                    </tr>
                    
                    {/* Expandable row for hour logs */}
                    {expandedProjects.has(project._id) && (
                      <tr>
                        <td colSpan={user?.role === 0 ? 6 : 5} className="px-0 py-0">
                          <div className="bg-gradient-to-r from-green-50 to-teal-50 border-l-4 border-green-500">
                            {loadingHourLogs[project._id] ? (
                              <div className="px-6 py-8 text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                                <p className="text-gray-600 mt-2">Loading hour logs...</p>
                              </div>
                            ) : projectHourLogs[project._id]?.length > 0 ? (
                              <div className="p-6">
                                <h4 className="text-sm font-bold text-gray-800 mb-4 flex items-center">
                                  <svg className="w-5 h-5 mr-2 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                  </svg>
                                  Logged Hours ({projectHourLogs[project._id].length})
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {projectHourLogs[project._id].map((log) => (
                                    <div key={log._id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                      <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                          <div className="flex items-center space-x-2 mb-2">
                                            <div className="h-6 w-6 rounded-full bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center text-white font-bold text-xs">
                                              {log.developer.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="text-sm font-semibold text-gray-900">
                                              {log.developer.name}
                                            </div>
                                          </div>
                                          <div className="text-sm text-gray-600 mt-2">
                                            {log.description}
                                          </div>
                                        </div>
                                        <div className="text-right ml-4">
                                          <div className="text-lg font-bold text-green-600">
                                            {log.hours}h
                                          </div>
                                          <div className="text-xs text-gray-500 mt-1">
                                            {new Date(log.date).toLocaleDateString('en-US', { 
                                              month: 'short', 
                                              day: 'numeric' 
                                            })}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <div className="px-6 py-8 text-center">
                                <div className="text-4xl mb-2">📝</div>
                                <p className="text-gray-600 font-medium">No hour logs found</p>
                                <p className="text-gray-500 text-sm mt-1">Start logging hours for this project</p>
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
