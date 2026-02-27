import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { Axios } from '../utils/axios';
import taskService, { Task } from '../services/taskService';
import { useForm } from '../hooks/useForm';
import { projectSchema, taskSchema, ProjectFormData as ProjectFormValidation, TaskFormData as TaskFormValidation } from '../validation';
import { ChevronDown, ChevronRight, Plus, Edit, Trash2, CheckCircle, Clock, AlertCircle } from 'lucide-react';

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

// interface ProjectFormData {
//   name: string;
//   description: string;
//   client: string;
//   developers: string[];
//   status: 'Planning' | 'Active' | 'On Hold' | 'Completed' | 'Cancelled';
//   startDate: string;
//   endDate: string;
//   estimatedHours: number;
//   hourlyRate: number;
//   billingType: 'Hourly' | 'Fixed';
// }

// interface TaskFormData {
//   title: string;
//   description: string;
//   project: string;
//   assignedTo: string[];
//   status: 'Todo' | 'In Progress' | 'Review' | 'Completed' | 'Blocked';
//   priority: 'Low' | 'Medium' | 'High' | 'Urgent';
//   estimatedHours: number;
//   startDate: string;
//   dueDate: string;
// }

const ProjectsWithTasks: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<User[]>([]);
  const [developers, setDevelopers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
  const [projectTasks, setProjectTasks] = useState<Record<string, Task[]>>({});
  const [loadingTasks, setLoadingTasks] = useState<Record<string, boolean>>({});
  // Project form with validation
  const projectForm = useForm<ProjectFormValidation>({
    initialValues: {
      name: '',
      description: '',
      client: '',
      developers: [],
      status: 'Planning',
      startDate: '',
      endDate: '',
      estimatedHours: 0,
      hourlyRate: 0,
      billingType: 'Hourly',
    },
    validationSchema: projectSchema,
    onSubmit: async (formData) => {
      try {
        const url = editingProject 
          ? `/projects/${editingProject._id}`
          : '/projects';
        
        const response = editingProject 
          ? await Axios.put(url, formData)
          : await Axios.post(url, formData);
        
        if (response.data.success) {
          setShowProjectModal(false);
          setEditingProject(null);
          projectForm.resetForm();
          fetchProjects();
        } else {
        }
      } catch (error: any) {
        console.error('Error saving project:', error);
        throw error;
      }
    }
  });

  // Task form with validation
  const taskForm = useForm<TaskFormValidation>({
    initialValues: {
      title: '',
      description: '',
      project: '',
      assignedTo: [],
      status: 'Todo',
      priority: 'Medium',
      estimatedHours: 0,
      startDate: '',
      dueDate: ''
    },
    validationSchema: taskSchema,
    onSubmit: async (formData) => {
      try {
        if (editingTask) {
          await taskService.update(editingTask._id, formData);
        } else {
          await taskService.create(formData);
        }
        
        setShowTaskModal(false);
        setEditingTask(null);
        taskForm.resetForm();
        
        // Refresh tasks for the project
        if (formData.project) {
          await fetchProjectTasks(formData.project);
        }
      } catch (error: any) {
        console.error('Error saving task:', error);
        throw error;
      }
    }
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
      if (response.data.success) {
        setClients(response.data.data.clients);
      }
    } catch (error: any) {
      console.error('Error fetching clients:', error);
    }
  };

  const fetchDevelopers = async () => {
    try {
      const response = await Axios.get('/developers');
      if (response.data.success) {
        setDevelopers(response.data.data.developers);
      }
    } catch (error: any) {
      console.error('Error fetching developers:', error);
    }
  };

  const fetchProjectTasks = async (projectId: string) => {
    setLoadingTasks(prev => ({ ...prev, [projectId]: true }));
    try {
      const tasks = await taskService.getByProject(projectId);
      setProjectTasks(prev => ({ ...prev, [projectId]: tasks }));
    } catch (error: any) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoadingTasks(prev => ({ ...prev, [projectId]: false }));
    }
  };

  const toggleProjectExpansion = async (projectId: string) => {
    const newExpanded = new Set(expandedProjects);
    
    if (newExpanded.has(projectId)) {
      newExpanded.delete(projectId);
      setExpandedProjects(newExpanded);
    } else {
      newExpanded.add(projectId);
      setExpandedProjects(newExpanded);
      
      if (!projectTasks[projectId]) {
        await fetchProjectTasks(projectId);
      }
    }
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    // Set form values individually
    projectForm.setFieldValue('name', project.name);
    projectForm.setFieldValue('description', project.description || '');
    projectForm.setFieldValue('client', project.client._id);
    projectForm.setFieldValue('developers', project.developers.map(d => d._id));
    projectForm.setFieldValue('status', project.status);
    projectForm.setFieldValue('startDate', project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '');
    projectForm.setFieldValue('endDate', project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : '');
    projectForm.setFieldValue('estimatedHours', project.estimatedHours || 0);
    projectForm.setFieldValue('hourlyRate', project.hourlyRate || 0);
    projectForm.setFieldValue('billingType', project.billingType);
    setShowProjectModal(true);
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!window.confirm('Are you sure you want to delete this project?')) {
      return;
    }

    try {
      const response = await Axios.delete(`/projects/${projectId}`);
      if (response.data.success) {
        fetchProjects();
      } else {
      }
    } catch (error: any) {
      console.error('Error deleting project:', error);
    }
  };

  const handleAddTask = (project: Project) => {
    setSelectedProject(project);
    taskForm.setFieldValue('project', project._id);
    taskForm.setFieldValue('assignedTo', []);
    setShowTaskModal(true);
  };

  const handleEditTask = (task: Task, project: Project) => {
    setEditingTask(task);
    setSelectedProject(project);
    // Set all task form values
    taskForm.setFieldValue('title', task.title);
    taskForm.setFieldValue('description', task.description || '');
    // Use the project parameter which is always available and correct
    taskForm.setFieldValue('project', project._id);
    taskForm.setFieldValue('assignedTo', task.assignedTo.map(d => d._id));
    taskForm.setFieldValue('status', task.status);
    taskForm.setFieldValue('priority', task.priority);
    taskForm.setFieldValue('estimatedHours', task.estimatedHours || 0);
    taskForm.setFieldValue('startDate', task.startDate ? new Date(task.startDate).toISOString().split('T')[0] : '');
    taskForm.setFieldValue('dueDate', task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '');
    setShowTaskModal(true);
  };

  const handleDeleteTask = async (taskId: string, projectId: string) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      await taskService.delete(taskId);
      await fetchProjectTasks(projectId);
    } catch (error: any) {
      console.error('Error deleting task:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Planning': return 'bg-gray-100 text-gray-800';
      case 'Active': return 'bg-green-100 text-green-800';
      case 'On Hold': return 'bg-yellow-100 text-yellow-800';
      case 'Completed': return 'bg-blue-100 text-blue-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      case 'Todo': return 'bg-gray-100 text-gray-700';
      case 'In Progress': return 'bg-blue-100 text-blue-700';
      case 'Review': return 'bg-purple-100 text-purple-700';
      case 'Blocked': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Low': return 'bg-gray-100 text-gray-600';
      case 'Medium': return 'bg-blue-100 text-blue-600';
      case 'High': return 'bg-orange-100 text-orange-600';
      case 'Urgent': return 'bg-red-100 text-red-600';
      default: return 'bg-gray-100 text-gray-600';
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
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Projects & Tasks</h1>
            <p className="text-green-100 mt-1">Manage projects and assign tasks to developers</p>
          </div>
          {user?.role === 0 && (
            <button
              onClick={() => {
                projectForm.resetForm();
                setEditingProject(null);
                setShowProjectModal(true);
              }}
              className="bg-white text-green-600 hover:bg-green-50 px-6 py-3 rounded-lg font-semibold shadow-md transform hover:scale-105 transition-all duration-200 flex items-center space-x-2"
            >
              <Plus size={20} />
              <span>Add Project</span>
            </button>
          )}
        </div>
      </div>

      {/* Projects List */}
      <div className="space-y-4">
        {projects.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-16 text-center">
            <div className="text-6xl mb-4">📁</div>
            <p className="text-gray-600 text-lg font-medium">No projects found</p>
            <p className="text-gray-500 text-sm mt-2">Create your first project to get started</p>
          </div>
        ) : (
          projects.map((project) => (
            <div key={project._id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
              {/* Project Header */}
              <div 
                className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleProjectExpansion(project._id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <div>
                      {expandedProjects.has(project._id) ? (
                        <ChevronDown className="w-6 h-6 text-green-600" />
                      ) : (
                        <ChevronRight className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-xl font-semibold text-gray-900">{project.name}</h3>
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(project.status)}`}>
                          {project.status}
                        </span>
                      </div>
                      {project.description && (
                        <p className="text-gray-600 mt-1">{project.description}</p>
                      )}
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <span>Client: {project.client.name}</span>
                        <span>•</span>
                        <span>{project.developers.length} Developer{project.developers.length !== 1 ? 's' : ''}</span>
                        <span>•</span>
                        <span>{project.actualHours || 0}h / {project.estimatedHours || 0}h</span>
                      </div>
                    </div>
                  </div>
                  {user?.role === 0 && (
                    <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleEditProject(project)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit Project"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteProject(project._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Project"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Tasks Section */}
              {expandedProjects.has(project._id) && (
                <div className="border-t border-gray-200 bg-gray-50 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                      <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                      Tasks
                    </h4>
                    {user?.role === 0 && (
                      <button
                        onClick={() => handleAddTask(project)}
                        className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                      >
                        <Plus size={16} />
                        <span>Add Task</span>
                      </button>
                    )}
                  </div>

                  {loadingTasks[project._id] ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                      <p className="text-gray-600 mt-2">Loading tasks...</p>
                    </div>
                  ) : projectTasks[project._id]?.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {projectTasks[project._id].map((task) => (
                        <div key={task._id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h5 className="font-semibold text-gray-900 mb-1">{task.title}</h5>
                              <div className="flex items-center space-x-2 mb-2">
                                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
                                  {task.status}
                                </span>
                                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
                                  {task.priority}
                                </span>
                              </div>
                            </div>
                            {user?.role === 0 && (
                              <div className="flex items-center space-x-1">
                                <button
                                  onClick={() => handleEditTask(task, project)}
                                  className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                  title="Edit Task"
                                >
                                  <Edit size={14} />
                                </button>
                                <button
                                  onClick={() => handleDeleteTask(task._id, project._id)}
                                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                                  title="Delete Task"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            )}
                          </div>
                          
                          {task.description && (
                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{task.description}</p>
                          )}
                          
                          <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                            <div className="flex items-center">
                              <Clock size={12} className="mr-1" />
                              <span>{task.actualHours || 0}h / {task.estimatedHours || 0}h</span>
                            </div>
                            {task.dueDate && (
                              <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-1">
                            {task.assignedTo.slice(0, 3).map((dev) => (
                              <div 
                                key={dev._id}
                                className="h-6 w-6 rounded-full bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center text-white font-bold text-xs border border-white"
                                title={dev.name}
                              >
                                {dev.name.charAt(0).toUpperCase()}
                              </div>
                            ))}
                            {task.assignedTo.length > 3 && (
                              <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-xs">
                                +{task.assignedTo.length - 3}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
                      <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600 font-medium">No tasks yet</p>
                      <p className="text-gray-500 text-sm mt-1">Create tasks to assign work to developers</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Project Modal */}
      {showProjectModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-green-600 to-teal-600 px-6 py-4 rounded-t-2xl">
              <h3 className="text-xl font-semibold text-white">
                {editingProject ? 'Edit Project' : 'Add New Project'}
              </h3>
            </div>
            
            <form onSubmit={projectForm.handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Name *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={projectForm.values.name}
                  onChange={projectForm.handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    projectForm.errors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {projectForm.errors.name && (
                  <p className="mt-1 text-sm text-red-600">{projectForm.errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={projectForm.values.description}
                  onChange={projectForm.handleChange}
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    projectForm.errors.description ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {projectForm.errors.description && (
                  <p className="mt-1 text-sm text-red-600">{projectForm.errors.description}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Client *
                </label>
                <select
                  name="client"
                  required
                  value={projectForm.values.client}
                  onChange={projectForm.handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    projectForm.errors.client ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select a client</option>
                  {clients.map((client: any) => (
                    <option key={client._id} value={client._id}>
                      {client.name}
                    </option>
                  ))}
                </select>
                {projectForm.errors.client && (
                  <p className="mt-1 text-sm text-red-600">{projectForm.errors.client}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Developers
                </label>
                <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-300 rounded-lg p-3">
                  {developers.map((developer: any) => (
                    <label key={developer._id} className="flex items-center hover:bg-gray-50 p-1 rounded">
                      <input
                        type="checkbox"
                        checked={projectForm.values.developers.includes(developer._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            projectForm.setFieldValue('developers', [...projectForm.values.developers, developer._id]);
                          } else {
                            projectForm.setFieldValue('developers', projectForm.values.developers.filter((id: string) => id !== developer._id));
                          }
                        }}
                        className="mr-2 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                      <span className="text-sm">{developer.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    value={projectForm.values.status}
                    onChange={projectForm.handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="Planning">Planning</option>
                    <option value="Active">Active</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Billing Type
                  </label>
                  <select
                    name="billingType"
                    value={projectForm.values.billingType}
                    onChange={projectForm.handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="Hourly">Hourly</option>
                    <option value="Fixed">Fixed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={projectForm.values.startDate}
                    onChange={projectForm.handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                      projectForm.errors.startDate ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {projectForm.errors.startDate && (
                    <p className="mt-1 text-sm text-red-600">{projectForm.errors.startDate}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={projectForm.values.endDate}
                    onChange={projectForm.handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                      projectForm.errors.endDate ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {projectForm.errors.endDate && (
                    <p className="mt-1 text-sm text-red-600">{projectForm.errors.endDate}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estimated Hours
                  </label>
                  <input
                    type="number"
                    name="estimatedHours"
                    min="0"
                    value={projectForm.values.estimatedHours}
                    onChange={projectForm.handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                      projectForm.errors.estimatedHours ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {projectForm.errors.estimatedHours && (
                    <p className="mt-1 text-sm text-red-600">{projectForm.errors.estimatedHours}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hourly Rate ($)
                  </label>
                  <input
                    type="number"
                    name="hourlyRate"
                    min="0"
                    value={projectForm.values.hourlyRate}
                    onChange={projectForm.handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                      projectForm.errors.hourlyRate ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {projectForm.errors.hourlyRate && (
                    <p className="mt-1 text-sm text-red-600">{projectForm.errors.hourlyRate}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowProjectModal(false);
                    setEditingProject(null);
                    projectForm.resetForm();
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={projectForm.isSubmitting}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {projectForm.isSubmitting ? 'Saving...' : (editingProject ? 'Update Project' : 'Create Project')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Modal */}
      {showTaskModal && selectedProject && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 rounded-t-2xl">
              <h3 className="text-xl font-semibold text-white">
                {editingTask ? 'Edit Task' : 'Add New Task'}
              </h3>
              <p className="text-blue-100 text-sm mt-1">Project: {selectedProject.name}</p>
            </div>
            
            <form onSubmit={taskForm.handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  value={taskForm.values.title}
                  onChange={taskForm.handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    taskForm.errors.title ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter task title"
                />
                {taskForm.errors.title && (
                  <p className="mt-1 text-sm text-red-600">{taskForm.errors.title}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={taskForm.values.description}
                  onChange={taskForm.handleChange}
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    taskForm.errors.description ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Describe the task..."
                />
                {taskForm.errors.description && (
                  <p className="mt-1 text-sm text-red-600">{taskForm.errors.description}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assign To *
                </label>
                <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-300 rounded-lg p-3">
                  {selectedProject?.developers.map((developer) => (
                    <label key={developer._id} className="flex items-center hover:bg-gray-50 p-1 rounded">
                      <input
                        type="checkbox"
                        checked={taskForm.values.assignedTo.includes(developer._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            taskForm.setFieldValue('assignedTo', [...taskForm.values.assignedTo, developer._id]);
                          } else {
                            taskForm.setFieldValue('assignedTo', taskForm.values.assignedTo.filter((id: string) => id !== developer._id));
                          }
                        }}
                        className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-sm">{developer.name}</span>
                    </label>
                  ))}
                </div>
                {taskForm.errors.assignedTo && (
                  <p className="mt-1 text-sm text-red-600">{taskForm.errors.assignedTo}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    value={taskForm.values.status}
                    onChange={taskForm.handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Todo">Todo</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Review">Review</option>
                    <option value="Completed">Completed</option>
                    <option value="Blocked">Blocked</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    name="priority"
                    value={taskForm.values.priority}
                    onChange={taskForm.handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={taskForm.values.startDate}
                    onChange={taskForm.handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      taskForm.errors.startDate ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {taskForm.errors.startDate && (
                    <p className="mt-1 text-sm text-red-600">{taskForm.errors.startDate}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    name="dueDate"
                    value={taskForm.values.dueDate}
                    onChange={taskForm.handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      taskForm.errors.dueDate ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {taskForm.errors.dueDate && (
                    <p className="mt-1 text-sm text-red-600">{taskForm.errors.dueDate}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estimated Hours
                </label>
                <input
                  type="number"
                  name="estimatedHours"
                  min="0"
                  step="0.5"
                  value={taskForm.values.estimatedHours}
                  onChange={taskForm.handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    taskForm.errors.estimatedHours ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="0"
                />
                {taskForm.errors.estimatedHours && (
                  <p className="mt-1 text-sm text-red-600">{taskForm.errors.estimatedHours}</p>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowTaskModal(false);
                    setEditingTask(null);
                    setSelectedProject(null);
                    taskForm.resetForm();
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={taskForm.isSubmitting}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {taskForm.isSubmitting ? 'Saving...' : (editingTask ? 'Update Task' : 'Create Task')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsWithTasks;
