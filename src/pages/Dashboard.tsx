import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../store/store';
import { PageHeader, StatsCard, DataTable, Card } from '../components/common';
import dashboardService, { DashboardSummary } from '../services/dashboardService';
import { downloadPDFReport, ReportData } from '../utils/pdfGenerator';
import { FileDown, Download } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardSummary | null>(null);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
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

      await downloadPDFReport(reportData, `hours-report-${reportDateRange.start}-to-${reportDateRange.end}.pdf`);
    } catch (error: any) {
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
        {/* <div className="flex items-center space-x-4">
          <img 
            src="/ba_logo.svg" 
            alt="HoursLog Logo" 
            className="h-12 w-auto"
          />
        </div> */}
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
          {user?.role === 0 && (
            <>
              <button
                onClick={handleGenerateReportClick}
                disabled={generatingReport || !dashboardData}
                className="flex items-center justify-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                {generatingReport ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <FileDown size={20} />
                    <span>Generate Report (PDF)</span>
                  </>
                )}
              </button>
              <button
                onClick={() => navigate('/reports')}
                className="flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <span>📈</span>
                <span>View Reports</span>
              </button>
            </>
          )}
        </div>
      </Card>

      {/* Download Confirmation Modal */}
      {showDownloadModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div 
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
              onClick={() => setShowDownloadModal(false)}
            ></div>

            {/* Modal panel */}
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
                    <Download className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          />
                        </div>
                      </div>

                      <p className="text-sm text-gray-500 mb-2">
                        This report will include:
                      </p>
                      <ul className="text-sm text-gray-500 list-disc list-inside space-y-1">
                        <li>Total hours for selected period</li>
                        <li>Client and developer statistics</li>
                        <li>Activity logs within date range</li>
                        <li>Top clients for the period</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleConfirmDownload}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Download PDF
                </button>
                <button
                  type="button"
                  onClick={() => setShowDownloadModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
