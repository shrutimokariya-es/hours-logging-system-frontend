import { Axios } from '../utils/axios';

export interface Task {
  _id: string;
  title: string;
  description?: string;
  project: {
    _id: string;
    name: string;
  };
  assignedTo: Array<{
    _id: string;
    name: string;
    email: string;
  }>;
  status: 'Todo' | 'In Progress' | 'Review' | 'Completed' | 'Blocked';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  estimatedHours?: number;
  actualHours?: number;
  startDate?: string;
  dueDate?: string;
  createdBy: {
    _id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
  hourLogsCount?: number;
}

export interface TaskFormData {
  title: string;
  description?: string;
  project: string;
  assignedTo: string[];
  status: 'Todo' | 'In Progress' | 'Review' | 'Completed' | 'Blocked';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  estimatedHours?: number;
  startDate?: string;
  dueDate?: string;
}

export interface TaskListResponse {
  tasks: Task[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const taskService = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    priority?: string;
    project?: string;
  }): Promise<TaskListResponse> => {
    const response = await Axios.get('/tasks', { params });
    return response.data.data;
  },

  getById: async (id: string): Promise<Task> => {
    const response = await Axios.get(`/tasks/${id}`);
    return response.data.data.task;
  },

  getByProject: async (projectId: string): Promise<Task[]> => {
    const response = await Axios.get(`/tasks/project/${projectId}`);
    return response.data.data.tasks;
  },

  create: async (taskData: TaskFormData): Promise<Task> => {
    const response = await Axios.post('/tasks', taskData);
    return response.data.data.task;
  },

  update: async (id: string, taskData: Partial<TaskFormData>): Promise<Task> => {
    const response = await Axios.put(`/tasks/${id}`, taskData);
    return response.data.data.task;
  },

  delete: async (id: string): Promise<void> => {
    await Axios.delete(`/tasks/${id}`);
  },

  updateStatus: async (id: string, status: string): Promise<Task> => {
    const response = await Axios.put(`/tasks/${id}`, { status });
    return response.data.data.task;
  }
};

export default taskService;
