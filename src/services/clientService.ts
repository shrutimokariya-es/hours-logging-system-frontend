import { Axios } from '../utils/axios';

export interface Client {
  _id: string;
  name: string;
  companyEmail: string;
  billingType: 'Hourly' | 'Fixed';
  status: 'Active' | 'Inactive';
  createdAt: string;
  updatedAt: string;
}

export interface ClientFormData {
  name: string;
  companyEmail: string;
  password: string;
  billingType: 'Hourly' | 'Fixed';
  status?: 'Active' | 'Inactive';
}

export interface ClientListResponse {
  clients: Client[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const clientService = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }): Promise<ClientListResponse> => {
    const response = await Axios.get('/clients', { params });
    return response.data.data;
  },

  getById: async (id: string): Promise<Client> => {
    const response = await Axios.get(`/clients/${id}`);
    return response.data.data.client;
  },

  create: async (clientData: ClientFormData): Promise<Client> => {
    const response = await Axios.post('/clients', clientData);
    return response.data.data.client;
  },

  update: async (id: string, clientData: Partial<ClientFormData>): Promise<Client> => {
    const response = await Axios.put(`/clients/${id}`, clientData);
    return response.data.data.client;
  },

  delete: async (id: string): Promise<Client> => {
    const response = await Axios.delete(`/clients/${id}`);
    return response?.data?.data?.client;
  },
};
