import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../store/store';
import { Button, PageHeader, StatsCard, DataTable, Card } from '../components/common';
import dashboardService, { DashboardSummary } from '../services/dashboardService';
import { toast } from 'react-toastify';
import { downloadPDFReport, ReportData } from '../utils/pdfGenerator';
import { ROUTES } from '../router/constant/routes.path';

const Dashboard: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardSummary | null>(null);
  const [generatingReport, setGeneratingReport] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const data = await dashboardService.getSummary();
      setDashboardData(data);
    } catch (error: any) {
      toast.error('Failed to fetch dashboard data');
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePDFReport = async () => {
    if (!dashboardData) {
      toast.error('No data available for report generation');
      return;
    }

    try {
      setGeneratingReport(true);
      
      const reportData: ReportData = {
        title: 'Hours Logging Report',
        dateRange: new Date().toLocaleDateString(),
        totalHours: dashboardData.totalHoursOverall,
        totalClients: dashboardData.totalClients,
        totalDevelopers: dashboardData.totalDevelopers,
        activities: dashboardData.recentLogs.map(log => ({
          project: log.project || 'N/A',
          clientName: log.clientName,
          developerName: log.developerName,
          hours: log.hours,
          date: log.date,
          description: log.description
        })),
        topClients: dashboardData.topClientsThisMonth.map(client => ({
          clientName: client.clientName,
          totalHours: client.totalHours
        }))
      };

      await downloadPDFReport(reportData, `hours-report-${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('PDF report generated and downloaded successfully');
    } catch (error: any) {
      toast.error('Failed to generate PDF report');
      console.error('Error generating PDF report:', error);
    } finally {
      setGeneratingReport(false);
    }
  };

  const stats = dashboardData ? [
    { 
      label: 'Your Total Hours', 
      value: dashboardData.totalHoursOverall.toString(), 
      change: dashboardData.totalHoursThisMonth > 0 ? `+${dashboardData.totalHoursThisMonth} this month` : 'No hours this month', 
      positive: dashboardData.totalHoursThisMonth >= 0 
    },
    { 
      label: 'This Month Hours', 
      value: dashboardData.totalHoursThisMonth.toString(), 
      change: dashboardData.totalHoursThisMonth > 0 ? 'Current month' : 'No hours this month', 
      positive: dashboardData.totalHoursThisMonth > 0 
    },
    { 
      label: 'Active Clients', 
      value: dashboardData.totalClients.toString(), 
      change: dashboardData.totalClients > 0 ? `${dashboardData.totalClients} clients` : 'No clients', 
      positive: dashboardData.totalClients > 0 
    },
    { 
      label: 'Your Activities', 
      value: dashboardData.recentLogs.length.toString(), 
      change: dashboardData.recentLogs.length > 0 ? `${dashboardData.recentLogs.length} logged` : 'No activities', 
      positive: dashboardData.recentLogs.length > 0 
    },
  ] : [];

  const recentActivities = dashboardData?.recentLogs.map(log => ({
    id: parseInt(log.id),
    clientName: log.clientName,
    projectName: log.project || 'N/A',
    hours: log.hours,
    date: log.date,
    description: log.description || '',
    status: 'completed' as const
  })) || [];

  const columns = [
    { key: 'clientName', label: 'Client Name' },
    { key: 'projectName', label: 'Project' },
    { key: 'hours', label: 'Hours' },
    { key: 'date', label: 'Date' },
    { 
      key: 'status', 
      label: 'Status',
      render: (value: string) => (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
          value === 'completed' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          {value}
        </span>
      )
    }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Dashboard" subtitle="Loading your dashboard data..." />
        <Card>
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 w-8 h-8"></div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Dashboard" 
        subtitle={`Welcome back, ${user?.name}! Here's your overview.`}
      >
        <div className="flex items-center space-x-4">
          <img 
            src="/ba_logo.svg" 
            alt="HoursLog Logo" 
            className="h-12 w-auto"
          />
        </div>
      </PageHeader>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatsCard
            key={index}
            title={stat.label}
            value={stat.value}
            change={stat.change}
            positive={stat.positive}
          />
        ))}
      </div>

      {/* Recent Activities */}
      <Card>
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Your Logged Hours</h3>
        </div>
        <div className="p-6">
          <DataTable
            data={recentActivities}
            columns={columns}
            emptyMessage="No hours logged yet. Start logging your work hours to see them here."
          />
        </div>
      </Card>

      {/* Quick Actions */}
      <Card>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button 
            variant="primary" 
            onClick={() => navigate(ROUTES.ADD_HOUR_LOG)}
          >
            Log Hours
          </Button>
          <Button 
            variant="secondary" 
            onClick={() => navigate('/reports')}
          >
            View Reports
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;
