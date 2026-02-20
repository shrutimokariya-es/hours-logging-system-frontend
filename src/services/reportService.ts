import { Axios } from '../utils/axios';

export interface Report {
  _id: string;
  title: string;
  type: string;
  status: 'generating' | 'completed' | 'failed';
  dateRange: {
    startDate: string;
    endDate: string;
  };
  totalHours: number;
  totalClients: number;
  totalDevelopers: number;
  reportData?: {
    activities: Array<{
      clientName: string;
      developerName: string;
      hours: number;
      date: string;
      description?: string;
    }>;
    topClients: Array<{
      clientName: string;
      totalHours: number;
    }>;
  };
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReportFormData {
  title: string;
  type?: string;
  startDate: string;
  endDate: string;
}

export interface ReportListResponse {
  reports: Report[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ReportStatsResponse {
  totalReports: number;
  completedReports: number;
  generatingReports: number;
  thisWeekReports: number;
}

export const reportService = {
  // Get all reports
  getAll: async (params?: {
    page?: number;
    limit?: number;
    type?: string;
    status?: string;
  }): Promise<ReportListResponse> => {
    const response = await Axios.get('/reports', { params });
    return response.data.data;
  },

  // Get report by ID
  getById: async (id: string): Promise<Report> => {
    const response = await Axios.get(`/reports/${id}`);
    return response.data.data.report;
  },

  // Generate new report
  generate: async (formData: ReportFormData): Promise<Report> => {
    const response = await Axios.post('/reports', formData);
    return response.data.data.report;
  },

  // Delete report
  deleteReport: async (id: string): Promise<void> => {
    await Axios.delete(`/reports/${id}`);
  },

  // Get report statistics
  getStats: async (): Promise<ReportStatsResponse> => {
    const response = await Axios.get('/reports/stats/summary');
    return response.data.data.stats;
  },

  // Get client hours data
  getClientHours: async (params?: {
    period?: 'weekly' | 'monthly';
    clientId?: string;
  }): Promise<any[]> => {
    const response = await Axios.get('/reports/clients/hours', { params });
    return response.data.data.clientHours;
  },

  // Get developer hours data
  getDeveloperHours: async (params?: {
    period?: 'weekly' | 'monthly';
    developerId?: string;
  }): Promise<any[]> => {
    const response = await Axios.get('/reports/developers/hours', { params });
    return response.data.data.developerHours;
  },

  // Get hours summary
  getHoursSummary: async (params?: {
    period?: 'weekly' | 'monthly';
    startDate?: string;
    endDate?: string;
  }): Promise<any> => {
    const response = await Axios.get('/reports/hours-summary', { params });
    return response.data.data.summary;
  }
};
