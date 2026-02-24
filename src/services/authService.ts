import { Axios } from '../utils/axios';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await Axios.post('/auth/login', credentials);
    return response.data.data;
  },

  register: async (userData: RegisterData): Promise<AuthResponse> => {
    const response = await Axios.post('/auth/register', userData);
    console.log("Register response:", response.data.data);
    return response.data.data;
  },

 

  getCurrentUser: async (): Promise<AuthResponse['user']> => {
    const response = await Axios.get('/auth/me');
    return response.data.data;
  },
};
