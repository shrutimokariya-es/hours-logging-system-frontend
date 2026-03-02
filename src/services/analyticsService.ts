import { Axios } from '../utils/axios';

export interface ClientHoursAnalytics {
  clientId: string;
  clientName: string;
  totalHours: number;
  projectCount: number;
  averageHoursPerProject: number;
  percentage: number;
}

export interface DeveloperWorkloadAnalytics {
  developerId: string;
  developerName: string;
  totalHours: number;
  projectCount: number;
  taskCount: number;
  averageHoursPerDay: number;
  workloadStatus: 'Underutilized' | 'Optimal' | 'Overloaded' | 'Critical';
  utilizationPercentage: number;
}

export interface TaskCompletionAnalytics {
  averageCompletionTime: number;
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  averageEstimatedVsActual: number;
  tasksByStatus: {
    status: string;
    count: number;
    percentage: number;
  }[];
}

export interface DeadlineAnalytics {
  totalTasksWithDeadlines: number;
  missedDeadlines: number;
  upcomingDeadlines: number;
  onTimeCompletions: number;
  missedDeadlineRatio: number;
  criticalUpcoming: {
    taskId: string;
    taskTitle: string;
    projectName: string;
    dueDate: string;
    daysRemaining: number;
    assignedTo: string[];
  }[];
}

export interface PredictiveInsights {
  clientHoursAnalytics: ClientHoursAnalytics[];
  developerWorkloadAnalytics: DeveloperWorkloadAnalytics[];
  taskCompletionAnalytics: TaskCompletionAnalytics;
  deadlineAnalytics: DeadlineAnalytics;
  trends: {
    hoursThisMonth: number;
    hoursLastMonth: number;
    growthPercentage: number;
    projectedNextMonth: number;
  };
}

const analyticsService = {
  getPredictiveInsights: async (startDate?: string, endDate?: string): Promise<PredictiveInsights> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const url = `/analytics/insights${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await Axios.get(url);
    return response.data.data;
  }
};

export default analyticsService;
