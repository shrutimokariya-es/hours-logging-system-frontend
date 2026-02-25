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
  getSummary: async (startDate?: string, endDate?: string): Promise<DashboardSummary> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const url = `/dashboard/summary${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await Axios.get(url);
    console.log("Dashboard response:", response.data);
    return response.data.data;
  }
};

export default dashboardService;
