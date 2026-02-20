import { Axios } from '../utils/axios';

export interface DashboardSummary {
  totalClients: number;
  totalDevelopers: number;
  totalHoursThisMonth: number;
  totalHoursOverall: number;
  recentLogs: Array<{
    id: string;
    project: string;
    clientName: string;
    developerName: string;
    hours: number;
    date: string;
    description?: string;
  }>;
  topClientsThisMonth: Array<{
    clientId: string;
    clientName: string;
    totalHours: number;
  }>;
}

const dashboardService = {
  getSummary: async (): Promise<DashboardSummary> => {
    const response = await Axios.get('/dashboard/summary');
    console.log("Dashboard response:", response.data);
    return response.data.data;
  }
};

export default dashboardService;
