import { Axios } from '../utils/axios';

export interface Developer {
  _id: string;
  name: string;
  email: string;
  hourlyRate: number;
  role: string;
  status: 'Active' | 'Inactive';
  createdAt: string;
  updatedAt: string;
}

export interface DeveloperFormData {
  name: string;
  email: string;
  hourlyRate: number;
  status?: 'Active' | 'Inactive';
}

export interface DeveloperListResponse {
  developers: Developer[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const developerService = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }): Promise<DeveloperListResponse> => {
    const response = await Axios.get('/developers', { params });
    return response.data.data;
  },

  getById: async (id: string): Promise<Developer> => {
    const response = await Axios.get(`/developers/${id}`);
    return response.data.data.developer;
  },

  create: async (developerData: DeveloperFormData): Promise<Developer> => {
    const response = await Axios.post('/developers', developerData);
    return response.data.data.developer;
  },

  update: async (id: string, developerData: Partial<DeveloperFormData>): Promise<Developer> => {
    const response = await Axios.put(`/developers/${id}`, developerData);
    return response.data.data.developer;
  },

  delete: async (id: string): Promise<Developer> => {
    const response = await Axios.delete(`/developers/${id}`);
    return response.data.data.developer;
  },
};
