import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../store/store';
import { PageHeader, StatsCard, DataTable, Card } from '../components/common';
import ImportHoursModal from '../components/common/ImportHoursModal';
import dashboardService, { DashboardSummary } from '../services/dashboardService';
import { downloadCSVReport, ReportData } from '../utils/csvGenerator';
import { FileDown, Download, Upload, Clock, Users, Briefcase, Activity, TrendingUp, Calendar } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardSummary | null>(null);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [reportDateRange, setReportDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const data = await dashboardService.getSummary();
      setDashboardData(data);
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReportClick = () => {
    if (!dashboardData) {
      return;
    }
    setShowDownloadModal(true);
  };

  const handleConfirmDownload = async () => {
    if (!dashboardData) {
      return;
    }

    try {
      setGeneratingReport(true);
      setShowDownloadModal(false);
      
      // Fetch filtered data based on date range
      const filteredData = await dashboardService.getSummary(reportDateRange.start, reportDateRange.end);
      
      const reportData: ReportData = {
        title: 'Hours Logging Report',
        dateRange: `${new Date(reportDateRange.start).toLocaleDateString()} - ${new Date(reportDateRange.end).toLocaleDateString()}`,
        totalHours: filteredData.totalHoursOverall,
        totalClients: filteredData.totalClients,
        totalDevelopers: filteredData.totalDevelopers,
        activities: filteredData.recentLogs.map(log => ({
          project: log.project || 'N/A',
          clientName: log.clientName,
          developerName: log.developerName,
          hours: log.hours,
          date: log.date,
          description: log.description
        })),
        topClients: filteredData.topClientsThisMonth.map(client => ({
          clientName: client.clientName,
          totalHours: client.totalHours
        }))
      };

      downloadCSVReport(reportData, `hours-report-${reportDateRange.start}-to-${reportDateRange.end}.csv`);
    } catch (error: any) {
      console.error('Error generating PDF report:', error);
    } finally {
      setGeneratingReport(false);
    }
  };

  const handleImportSuccess = () => {
    // Refresh dashboard data after successful import
    fetchDashboardData();
  };

  const stats = dashboardData ? [
    { 
      label: 'Your Total Hours', 
      value: dashboardData.totalHoursOverall.toString(), 
      change: dashboardData.totalHoursThisMonth > 0 ? `+${dashboardData.totalHoursThisMonth} this month` : 'No hours this month', 
      positive: dashboardData.totalHoursThisMonth >= 0,
      icon: <Clock size={24} />,
      color: 'blue' as const
    },
    { 
      label: 'This Month Hours', 
      value: dashboardData.totalHoursThisMonth.toString(), 
      change: dashboardData.totalHoursThisMonth > 0 ? 'Current month' : 'No hours this month', 
      positive: dashboardData.totalHoursThisMonth > 0,
      icon: <Calendar size={24} />,
      color: 'green' as const
    },
    { 
      label: 'Active Clients', 
      value: dashboardData.totalClients.toString(), 
      change: dashboardData.totalClients > 0 ? `${dashboardData.totalClients} clients` : 'No clients', 
      positive: dashboardData.totalClients > 0,
      icon: <Users size={24} />,
      color: 'purple' as const
    },
    { 
      label: 'Your Activities', 
      value: dashboardData.recentLogs.length.toString(), 
      change: dashboardData.recentLogs.length > 0 ? `${dashboardData.recentLogs.length} logged` : 'No activities', 
      positive: dashboardData.recentLogs.length > 0,
      icon: <Activity size={24} />,
      color: 'yellow' as const
    },
  ] : [];

  const recentActivities = dashboardData?.recentLogs.slice(0, 20).map(log => ({
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
    <div className="space-y-8 animate-fadeIn">
      {/* Hero Section with Gradient */}
      <div className="relative overflow-hidden bg-gradient-to-br from-green-600 via-green-700 to-emerald-800 rounded-2xl shadow-2xl p-8 text-white">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-48 h-48 bg-white opacity-5 rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Welcome back, {user?.name}! 👋</h1>
              <p className="text-green-100 text-lg">Here's your productivity overview</p>
            </div>
            <div className="hidden md:block">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <TrendingUp size={48} className="text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid with Animation */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div 
            key={index}
            className="transform transition-all duration-300 hover:scale-105 animate-slideUp"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <StatsCard
              title={stat.label}
              value={stat.value}
              change={stat.change}
              positive={stat.positive}
              icon={stat.icon}
              color={stat.color}
            />
          </div>
        ))}
      </div>

      {/* Recent Activities with Enhanced Design */}
      <Card>
        <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Briefcase className="text-green-600" size={20} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Your Logged Hours</h3>
                <p className="text-sm text-gray-500">Recent 20 activities</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/my-hour-logs')}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium shadow-md hover:shadow-lg transform hover:scale-105"
            >
              <Activity size={16} />
              <span>View All Logs</span>
            </button>
          </div>
        </div>
        <div className="p-6">
          {recentActivities.length > 0 ? (
            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
              <DataTable
                data={recentActivities}
                columns={columns}
                emptyMessage="No hours logged yet. Start logging your work hours to see them here."
              />
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <Clock className="text-gray-400" size={32} />
              </div>
              <p className="text-gray-500 text-lg">No hours logged yet</p>
              <p className="text-gray-400 text-sm mt-2">Start logging your work hours to see them here</p>
            </div>
          )}
        </div>
      </Card>

      {/* Quick Actions with Enhanced Design */}
      {user?.role === 0 && (
        <Card>
          <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
            <p className="text-sm text-gray-500 mt-1">Manage your reports and data</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={handleGenerateReportClick}
                disabled={generatingReport || !dashboardData}
                className="group relative flex items-center justify-center space-x-3 px-6 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                {generatingReport ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span className="font-medium">Generating...</span>
                  </>
                ) : (
                  <>
                    <FileDown size={20} />
                    <span className="font-medium">Generate Report</span>
                  </>
                )}
              </button>
              <button
                onClick={() => setShowImportModal(true)}
                className="group relative flex items-center justify-center space-x-3 px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <Upload size={20} />
                <span className="font-medium">Import Hours</span>
              </button>
              <button
                onClick={() => navigate('/reports')}
                className="group relative flex items-center justify-center space-x-3 px-6 py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <TrendingUp size={20} />
                <span className="font-medium">View Reports</span>
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* Download Confirmation Modal */}
      {showDownloadModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto animate-fadeIn">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div 
              className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-75 backdrop-blur-sm"
              onClick={() => setShowDownloadModal(false)}
            ></div>

            {/* Modal panel */}
            <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full animate-slideUp">
              <div className="bg-gradient-to-br from-green-50 to-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
                    <Download className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
                    <h3 className="text-lg leading-6 font-semibold text-gray-900">
                      Download Report
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 mb-4">
                        Select date range for the report:
                      </p>
                      
                      {/* Date Range Filter */}
                      <div className="space-y-3 mb-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Start Date
                          </label>
                          <input
                            type="date"
                            value={reportDateRange.start}
                            onChange={(e) => setReportDateRange(prev => ({ ...prev, start: e.target.value }))}
                            max={reportDateRange.end}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            End Date
                          </label>
                          <input
                            type="date"
                            value={reportDateRange.end}
                            onChange={(e) => setReportDateRange(prev => ({ ...prev, end: e.target.value }))}
                            min={reportDateRange.start}
                            max={new Date().toISOString().split('T')[0]}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                          />
                        </div>
                      </div>

                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-sm font-medium text-blue-900 mb-2">
                          📊 This report will include:
                        </p>
                        <ul className="text-sm text-blue-800 space-y-1">
                          <li className="flex items-center space-x-2">
                            <span className="text-blue-600">•</span>
                            <span>Total hours for selected period</span>
                          </li>
                          <li className="flex items-center space-x-2">
                            <span className="text-blue-600">•</span>
                            <span>Client and developer statistics</span>
                          </li>
                          <li className="flex items-center space-x-2">
                            <span className="text-blue-600">•</span>
                            <span>Activity logs within date range</span>
                          </li>
                          <li className="flex items-center space-x-2">
                            <span className="text-blue-600">•</span>
                            <span>Top clients for the period</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-3">
                <button
                  type="button"
                  onClick={handleConfirmDownload}
                  className="w-full inline-flex justify-center items-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:w-auto sm:text-sm transition-all transform hover:scale-105"
                >
                  <Download size={16} className="mr-2" />
                  Download CSV
                </button>
                <button
                  type="button"
                  onClick={() => setShowDownloadModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:mt-0 sm:w-auto sm:text-sm transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      <ImportHoursModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImportSuccess={handleImportSuccess}
      />
    </div>
  );
};

export default Dashboard;
