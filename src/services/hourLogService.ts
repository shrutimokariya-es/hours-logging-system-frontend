import { Axios } from '../utils/axios';

export interface HourLog {
  _id: string;
  client: string | Client;
  developer: string | Developer;
  project: string | Project;
  date: string;
  hours: number;
  description: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Client {
  _id: string;
  name: string;
  companyEmail: string;
  billingType: string;
  status: string;
}

export interface Developer {
  _id: string;
  name: string;
  email: string;
  hourlyRate: number;
  status: string;
}

export interface Project {
  _id: string;
  name: string;
  description?: string;
  client: string | Client;
  developers: string[] | Developer[];
  status: string;
  startDate?: string;
  endDate?: string;
  estimatedHours?: number;
  actualHours?: number;
  hourlyRate?: number;
  billingType: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface HourLogFormData {
  client: string;
  developer: string;
  project: string;
  date: string;
  hours: number;
  description: string;
}

export interface HourLogListResponse {
  hourLogs: HourLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

const hourLogService = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    client?: string;
    developer?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<HourLogListResponse> => {
    const response = await Axios.get('/hour-logs', { params });
    return response.data;
  },

  getById: async (id: string): Promise<HourLog> => {
    const response = await Axios.get(`/hour-logs/${id}`);
    return response.data;
  },

  create: async (data: HourLogFormData): Promise<HourLog> => {
    const response = await Axios.post('/hour-logs', data);
    return response.data;
  },

  update: async (id: string, data: Partial<HourLogFormData>): Promise<HourLog> => {
    const response = await Axios.put(`/hour-logs/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await Axios.delete(`/hour-logs/${id}`);
  },

  getByDeveloper: async (developerId: string, params?: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
  }): Promise<HourLogListResponse> => {
    const response = await Axios.get(`/hour-logs/developer/${developerId}`, { params });
    return response.data;
  },

  getByClient: async (clientId: string, params?: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
  }): Promise<HourLogListResponse> => {
    const response = await Axios.get(`/hour-logs/client/${clientId}`, { params });
    return response.data;
  },

  getByProject: async (projectId: string, params?: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
  }): Promise<HourLogListResponse> => {
    const response = await Axios.get(`/hour-logs/project/${projectId}`, { params });
    console.log("resposne dlvndfnvlkn", response.data)
    return response.data.data;
  }
};

export default hourLogService;
