import { Axios } from '../utils/axios';

export interface Project {
  _id: string;
  name: string;
  client: string;
  clientName: string;
  developer: string;
  developerName: string;
  totalHours: number;
  status: 'Active' | 'Completed' | 'On Hold';
  startDate: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectFormData {
  name: string;
  client: string;
  developer: string;
  status: 'Active' | 'Completed' | 'On Hold';
  startDate: string;
  endDate?: string;
}

export interface ProjectListResponse {
  projects: Project[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const projectService = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
    client?: string;
    developer?: string;
  }): Promise<ProjectListResponse> => {
    const response = await Axios.get('/projects', { params });
    return response.data.data;
  },

  getById: async (id: string): Promise<Project> => {
    const response = await Axios.get(`/projects/${id}`);
    return response.data.data.project;
  },

  create: async (projectData: ProjectFormData): Promise<Project> => {
    const response = await Axios.post('/projects', projectData);
    return response.data.data.project;
  },

  update: async (id: string, projectData: Partial<ProjectFormData>): Promise<Project> => {
    const response = await Axios.put(`/projects/${id}`, projectData);
    return response.data.data.project;
  },

  delete: async (id: string): Promise<Project> => {
    const response = await Axios.delete(`/projects/${id}`);
    return response.data.data.project;
  },

  // Get projects by client
  getByClient: async (clientId: string): Promise<Project[]> => {
    const response = await Axios.get(`/projects/client/${clientId}`);
    return response.data.data.projects;
  },

  // Get projects by developer
  getByDeveloper: async (developerId: string): Promise<Project[]> => {
    const response = await Axios.get(`/projects/developer/${developerId}`);
    return response.data.data.projects;
  },
};
