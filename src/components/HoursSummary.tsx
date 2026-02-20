import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { reportService } from '../services/reportService';

interface HoursSummary {
  totalHours: number;
  totalLogs: number;
  uniqueClients: number;
  uniqueDevelopers: number;
  clientBreakdown: any[];
  developerBreakdown: any[];
  recentLogs: Array<{
    id: string;
    clientName: string;
    developerName: string;
    hours: number;
    date: string;
    description: string;
  }>;
}

interface HoursSummaryProps {
  // No props needed - will use internal date range state
}

const HoursSummary: React.FC<HoursSummaryProps> = () => {
  const [summary, setSummary] = useState<HoursSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<string>('this-month');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');

  useEffect(() => {
    fetchHoursSummary();
  }, [dateRange, customStartDate, customEndDate]);

  const fetchHoursSummary = async () => {
    try {
      setLoading(true);
      let params: any = {};
      
      if (dateRange === 'custom' && customStartDate && customEndDate) {
        params.startDate = customStartDate;
        params.endDate = customEndDate;
      } else {
        // Map frontend date range to backend period
        const periodMap: Record<string, string> = {
          'this-week': 'weekly',
          'this-month': 'this-month',
          'last-month': 'last-month',
          'this-quarter': 'this-quarter',
          'this-year': 'this-year'
        };
        params.period = periodMap[dateRange] || 'monthly';
      }
      
      const summary = await reportService.getHoursSummary(params);
      setSummary(summary);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch hours summary');
      toast.error('Failed to fetch hours summary');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Hours Summary</h3>
        <div className="text-center py-8">
          <div className="text-gray-500">Loading hours summary...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Hours Summary</h3>
        <div className="text-center py-8">
          <div className="text-red-500">{error}</div>
          <button 
            onClick={fetchHoursSummary}
            className="mt-2 text-blue-600 hover:text-blue-800"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!summary) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Date Range Selector */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Hours Summary</h3>
          <div className="flex items-center space-x-4">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="this-week">This Week</option>
              <option value="this-month">This Month</option>
              <option value="last-month">Last Month</option>
              <option value="this-quarter">This Quarter</option>
              <option value="this-year">This Year</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
        </div>
        
        {dateRange === 'custom' && (
          <div className="flex items-center space-x-4 mt-4">
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="Start Date"
            />
            <span className="text-gray-500">to</span>
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="End Date"
            />
            <button
              onClick={fetchHoursSummary}
              className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700 transition-colors"
            >
              Apply
            </button>
          </div>
        )}
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
              <div className="text-blue-600 text-2xl font-bold">{summary.totalHours}</div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Hours</p>
              <p className="text-lg font-semibold text-gray-900">Logged</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-100 rounded-lg p-3">
              <div className="text-green-600 text-2xl font-bold">{summary.totalLogs}</div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Logs</p>
              <p className="text-lg font-semibold text-gray-900">Entries</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-purple-100 rounded-lg p-3">
              <div className="text-purple-600 text-2xl font-bold">{summary.uniqueClients}</div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Clients</p>
              <p className="text-lg font-semibold text-gray-900">Unique</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-orange-100 rounded-lg p-3">
              <div className="text-orange-600 text-2xl font-bold">{summary.uniqueDevelopers}</div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Developers</p>
              <p className="text-lg font-semibold text-gray-900">Unique</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Developer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hours
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {summary.recentLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No recent activity found
                  </td>
                </tr>
              ) : (
                summary.recentLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{log.clientName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{log.developerName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-semibold">{log.hours}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{log.date}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 truncate max-w-xs">
                        {log.description || 'No description'}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">
              {summary.totalLogs > 0 ? (summary.totalHours / summary.totalLogs).toFixed(1) : '0'}
            </div>
            <div className="text-sm text-gray-500">Avg Hours per Log</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">
              {summary.uniqueClients > 0 ? (summary.totalHours / summary.uniqueClients).toFixed(1) : '0'}
            </div>
            <div className="text-sm text-gray-500">Avg Hours per Client</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">
              {summary.uniqueDevelopers > 0 ? (summary.totalHours / summary.uniqueDevelopers).toFixed(1) : '0'}
            </div>
            <div className="text-sm text-gray-500">Avg Hours per Developer</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HoursSummary;
