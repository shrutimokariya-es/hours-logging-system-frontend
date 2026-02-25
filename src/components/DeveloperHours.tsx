import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { reportService } from '../services/reportService';

interface DeveloperData {
  developerId: string;
  developerName: string;
  developerEmail: string;
  developerRole: string;
  totalHours: number;
  weeklyHours?: Record<string, number>;
  monthlyHours?: Record<string, number>;
  clients: string[];
  logs: any[];
}

interface DeveloperHoursProps {
  // No props needed - will use internal date range state
}

const DeveloperHours: React.FC<DeveloperHoursProps> = () => {
  const [developerData, setDeveloperData] = useState<DeveloperData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<string>('this-month');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');

  // useEffect(() => {
  //   fetchDeveloperHours();
  // }, [dateRange, customStartDate, customEndDate]);

  // const fetchDeveloperHours = async () => {
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
      
  //     const developerHours = await reportService.getDeveloperHours(params);
  //     setDeveloperData(developerHours);
  //     setError(null);
  //   } catch (err: any) {
  //     setError(err.message || 'Failed to fetch developer hours');
  //     toast.error('Failed to fetch developer hours');
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  const fetchDeveloperHours = useCallback(async () => {
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

    const developerHours = await reportService.getDeveloperHours(params);
    setDeveloperData(developerHours);
    setError(null);
  } catch (err: any) {
    setError(err.message || 'Failed to fetch developer hours');
    toast.error('Failed to fetch developer hours');
  } finally {
    setLoading(false);
  }
}, [dateRange, customStartDate, customEndDate]);

useEffect(() => {
  fetchDeveloperHours();
}, [fetchDeveloperHours]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Developer Hours</h3>
        <div className="text-center py-8">
          <div className="text-gray-500">Loading developer hours...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Developer Hours</h3>
        <div className="text-center py-8">
          <div className="text-red-500">{error}</div>
          <button 
            onClick={fetchDeveloperHours}
            className="mt-2 text-blue-600 hover:text-blue-800"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Developer Hours</h3>
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
        <div className="flex items-center space-x-4 mb-4">
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
            onClick={fetchDeveloperHours}
            className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700 transition-colors"
          >
            Apply
          </button>
        </div>
      )}
      
      {developerData.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-500">No developer hours data found</div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Top Performers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {developerData.slice(0, 3).map((developer, index) => (
              <div key={developer.developerId} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{developer.developerName}</h4>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    index === 0 ? 'bg-yellow-100 text-yellow-800' :
                    index === 1 ? 'bg-gray-100 text-gray-800' :
                    'bg-orange-100 text-orange-800'
                  }`}>
                    #{index + 1}
                  </span>
                </div>
                <p className="text-sm text-gray-500">{developer.developerEmail}</p>
                <div className="mt-2">
                  <span className="text-2xl font-bold text-green-600">{developer.totalHours}</span>
                  <span className="text-sm text-gray-500 ml-1">hours total</span>
                </div>
                <div className="mt-1 text-sm text-gray-500">
                  {developer.clients.length} client{developer.clients.length !== 1 ? 's' : ''}
                </div>
              </div>
            ))}
          </div>

          {/* Detailed Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Developer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Hours
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Clients
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {dateRange === 'this-week' ? 'Weekly' : 'Monthly'} Breakdown
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Performance
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {developerData.map((developer, index) => (
                  <tr key={developer.developerId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{developer.developerName}</div>
                        <div className="text-sm text-gray-500">{developer.developerEmail}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-semibold">{developer.totalHours}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {developer.clients.slice(0, 2).join(', ')}
                        {developer.clients.length > 2 && ` +${developer.clients.length - 2} more`}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {dateRange === 'this-week' 
                          ? Object.entries(developer.weeklyHours || {}).map(([week, hours]) => (
                              <span key={week} className="mr-3">
                                {week}: {hours}h
                              </span>
                            ))
                          : Object.entries(developer.monthlyHours || {}).map(([month, hours]) => (
                              <span key={month} className="mr-3">
                                {month}: {hours}h
                              </span>
                            ))
                        }
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full mr-2 ${
                          developer.totalHours > 100 ? 'bg-green-500' :
                          developer.totalHours > 50 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}></div>
                        <span className="text-sm text-gray-900">
                          {developer.totalHours > 100 ? 'High' :
                           developer.totalHours > 50 ? 'Medium' : 'Low'}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Performance Summary */}
          <div className="border-t border-gray-200 pt-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Performance Summary</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {developerData.filter(d => d.totalHours > 100).length}
                </div>
                <div className="text-sm text-gray-500">High Performers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {developerData.filter(d => d.totalHours > 50 && d.totalHours <= 100).length}
                </div>
                <div className="text-sm text-gray-500">Medium Performers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {developerData.filter(d => d.totalHours <= 50).length}
                </div>
                <div className="text-sm text-gray-500">Low Performers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {Math.round(developerData.reduce((sum, d) => sum + d.totalHours, 0) / developerData.length)}
                </div>
                <div className="text-sm text-gray-500">Average Hours</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeveloperHours;
