import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { reportService } from '../services/reportService';

interface HoursSummaryI {
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
    project?: string;
    hours: number;
    date: string;
    description: string;
  }>;
}

interface HoursSummaryProps {
  // No props needed - will use internal date range state
}

const HoursSummary: React.FC<HoursSummaryProps> = () => {
  const [summary, setSummary] = useState<HoursSummaryI | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<string>('this-month');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');

  // useEffect(() => {
  //   fetchHoursSummary();
  // }, [dateRange, customStartDate, customEndDate]);

  // const fetchHoursSummary = async () => {
  //   try {
  //     setLoading(true);
  //     let params: any = {};
      
  //     if (dateRange === 'custom' && customStartDate && customEndDate) {
  //       params.startDate = customStartDate;
  //       params.endDate = customEndDate;
  //     } else {
  //       // Map frontend date range to backend period
  //       const periodMap: Record<string, string> = {
  //         'this-week': 'weekly',
  //         'this-month': 'this-month',
  //         'last-month': 'last-month',
  //         'this-quarter': 'this-quarter',
  //         'this-year': 'this-year'
  //       };
  //       params.period = periodMap[dateRange] || 'monthly';
  //     }
      
  //     const summary = await reportService.getHoursSummary(params);
  //     console.log("summary",summary)
  //     setSummary(summary);
  //     setError(null);
  //   } catch (err: any) {
  //     setError(err.message || 'Failed to fetch hours summary');
  //     toast.error('Failed to fetch hours summary');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const fetchHoursSummary = useCallback(async () => {
    try {
      setLoading(true);
      let params: any = {};

      if (dateRange === 'custom' && customStartDate && customEndDate) {
        params.startDate = customStartDate;
        params.endDate = customEndDate;
      } else {
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
      console.log("summary", summary);
      setSummary(summary);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch hours summary');
      toast.error('Failed to fetch hours summary');
    } finally {
      setLoading(false);
    }
  }, [dateRange, customStartDate, customEndDate]);

  useEffect(() => {
    fetchHoursSummary();
  }, [fetchHoursSummary]);

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
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Hours Summary</h3>
            <p className="text-sm text-gray-600 mt-1">Overview of all hours and activity</p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white shadow-sm"
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
          <div className="flex items-center space-x-4 mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Start Date"
            />
            <span className="text-gray-500 font-medium">to</span>
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="End Date"
            />
            <button
              onClick={fetchHoursSummary}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors shadow-sm font-medium"
            >
              Apply
            </button>
          </div>
        )}
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-100 uppercase tracking-wide">Total Hours</p>
              <p className="text-3xl font-bold mt-2">{summary.totalHours}</p>
              <p className="text-xs text-blue-100 mt-1">Logged</p>
            </div>
            <div className="bg-blue-400 bg-opacity-30 rounded-full p-3">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-100 uppercase tracking-wide">Total Logs</p>
              <p className="text-3xl font-bold mt-2">{summary.totalLogs}</p>
              <p className="text-xs text-green-100 mt-1">Entries</p>
            </div>
            <div className="bg-green-400 bg-opacity-30 rounded-full p-3">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-100 uppercase tracking-wide">Active Clients</p>
              <p className="text-3xl font-bold mt-2">{summary.uniqueClients}</p>
              <p className="text-xs text-purple-100 mt-1">Unique</p>
            </div>
            <div className="bg-purple-400 bg-opacity-30 rounded-full p-3">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-100 uppercase tracking-wide">Active Developers</p>
              <p className="text-3xl font-bold mt-2">{summary.uniqueDevelopers}</p>
              <p className="text-xs text-orange-100 mt-1">Unique</p>
            </div>
            <div className="bg-orange-400 bg-opacity-30 rounded-full p-3">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
          <p className="text-sm text-gray-600 mt-1">Latest hour logs across all projects</p>
        </div>
        <div className="max-h-[400px] overflow-y-auto overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Project
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
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No recent activity found
                  </td>
                </tr>
              ) : (
                summary.recentLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{log.clientName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {log.project || 'N/A'}
                        </span>
                      </div>
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
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Performance Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-4xl font-bold text-blue-600">
              {summary.totalLogs > 0 ? (summary.totalHours / summary.totalLogs).toFixed(1) : '0'}
            </div>
            <div className="text-sm text-gray-600 mt-2 font-medium">Avg Hours per Log</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="text-4xl font-bold text-green-600">
              {summary.uniqueClients > 0 ? (summary.totalHours / summary.uniqueClients).toFixed(1) : '0'}
            </div>
            <div className="text-sm text-gray-600 mt-2 font-medium">Avg Hours per Client</div>
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
