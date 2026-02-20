import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../store/store';
import { Button } from '../components/common';
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
      label: 'Total Hours Logged', 
      value: dashboardData.totalHoursOverall.toString(), 
      change: dashboardData.totalHoursThisMonth > 0 ? `+${dashboardData.totalHoursThisMonth} this month` : 'No hours this month', 
      positive: dashboardData.totalHoursThisMonth >= 0 
    },
    { 
      label: 'Active Clients', 
      value: dashboardData.totalClients.toString(), 
      change: dashboardData.totalClients > 0 ? `${dashboardData.totalClients} active` : 'No clients', 
      positive: dashboardData.totalClients > 0 
    },
    { 
      label: 'Active Developers', 
      value: dashboardData.totalDevelopers.toString(), 
      change: dashboardData.totalDevelopers > 0 ? `${dashboardData.totalDevelopers} active` : 'No developers', 
      positive: dashboardData.totalDevelopers > 0 
    },
    { 
      label: 'This Month Hours', 
      value: dashboardData.totalHoursThisMonth.toString(), 
      change: dashboardData.totalHoursThisMonth > 0 ? 'Current month' : 'No hours this month', 
      positive: dashboardData.totalHoursThisMonth > 0 
    },
  ] : [];

  const recentActivities = dashboardData?.recentLogs.map(log => ({
    id: parseInt(log.id),
    clientName: log.clientName,
    developerName: log.developerName,
    hours: log.hours,
    date: log.date,
    status: 'completed' as const
  })) || [];

  return (
    <div className="space-y-6">
      {/* Header with Logo */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <img 
            src="/ba_logo.svg" 
            alt="HoursLog Logo" 
            className="h-12 w-auto"
          />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user?.name}! Here's your overview.</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="text-gray-400 text-2xl mb-4">⏳</div>
            <p className="text-gray-600">Loading dashboard data...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`text-sm font-medium ${
                    stat.positive ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.change}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Activities */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Recent Activities</h2>
            </div>
            <div className="overflow-hidden">
              {recentActivities.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-lg">📋</div>
                  <p className="text-gray-600 mt-2">No activities logged yet</p>
                  <p className="text-gray-500 text-sm mt-1">Start logging your work hours to see them here</p>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Client Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Developer Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Hours
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentActivities.map((activity) => (
                      <tr key={activity.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {activity.clientName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {activity.developerName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {activity.hours}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {activity.date}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            activity.status === 'completed' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {activity.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Top Clients This Month */}
          {dashboardData?.topClientsThisMonth && dashboardData.topClientsThisMonth.length > 0 && (
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Top Clients This Month</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {dashboardData.topClientsThisMonth.map((client, index) => (
                    <div key={client.clientId} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-green-800 text-sm font-medium">{index + 1}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{client.clientName}</p>
                          <p className="text-sm text-gray-500">{client.totalHours} hours</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{client.totalHours}h</p>
                        <p className="text-xs text-gray-500">This month</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button 
                variant="primary" 
                onClick={() => navigate(ROUTES.ADD_HOUR_LOG)}
              >
                Log Hours
              </Button>
              <Button 
                variant="primary" 
                onClick={handleGeneratePDFReport}
                disabled={generatingReport}
              >
                {generatingReport ? 'Generating...' : 'Generate Report'}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
