import React, { useState, useEffect, useCallback } from 'react';
import { reportService } from '../services/reportService';

interface ClientData {
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientRole: string;
  totalHours: number;
  weeklyHours?: Record<string, number>;
  monthlyHours?: Record<string, number>;
  developers: string[];
  logs: any[];
}

interface ClientHoursProps {
  // No props needed - will use internal date range state
}

const ClientHours: React.FC<ClientHoursProps> = () => {
  const [clientData, setClientData] = useState<ClientData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<string>('this-month');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [appliedDateRange, setAppliedDateRange] = useState<string>('this-month');
  const [appliedCustomDates, setAppliedCustomDates] = useState({ start: '', end: '' });

  const fetchClientHours = useCallback(async () => {
    try {
      setLoading(true);
      let params: any = {};
      
      if (appliedDateRange === 'custom' && appliedCustomDates.start && appliedCustomDates.end) {
        params.startDate = appliedCustomDates.start;
        params.endDate = appliedCustomDates.end;
      } else {
        // Map frontend date range to backend period
        const periodMap: Record<string, string> = {
          'this-week': 'weekly',
          'this-month': 'this-month',
          'last-month': 'last-month',
          'this-quarter': 'this-quarter',
          'this-year': 'this-year'
        };
        params.period = periodMap[appliedDateRange] || 'monthly';
      }
      
      const clientHours = await reportService.getClientHours(params);
      setClientData(clientHours);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch client hours');
    } finally {
      setLoading(false);
    }
  }, [appliedDateRange, appliedCustomDates]);

  useEffect(() => {
    fetchClientHours();
  }, [fetchClientHours]);

  const handleApplyDateRange = () => {
    if (dateRange === 'custom') {
      if (!customStartDate || !customEndDate) {
        return; // Don't apply if dates are not selected
      }
      setAppliedCustomDates({ start: customStartDate, end: customEndDate });
    }
    setAppliedDateRange(dateRange);
  };

  const handleClearDateRange = () => {
    setDateRange('this-month');
    setCustomStartDate('');
    setCustomEndDate('');
    setAppliedDateRange('this-month');
    setAppliedCustomDates({ start: '', end: '' });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Client Hours</h3>
        <div className="text-center py-8">
          <div className="text-gray-500">Loading client hours...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Client Hours</h3>
        <div className="text-center py-8">
          <div className="text-red-500">{error}</div>
          <button 
            onClick={fetchClientHours}
            className="mt-2 text-blue-600 hover:text-blue-800"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
console.log("??",clientData)
  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Client Hours</h3>
          <p className="text-sm text-gray-600 mt-1">Client-wise hours breakdown</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={dateRange}
            onChange={(e) => {
              setDateRange(e.target.value);
              // Auto-apply for non-custom ranges
              if (e.target.value !== 'custom') {
                setAppliedDateRange(e.target.value);
              }
            }}
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
        <div className="flex items-center space-x-3 mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              max={customEndDate || undefined}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              min={customStartDate || undefined}
              max={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div className="flex items-end space-x-2">
            <button
              onClick={handleApplyDateRange}
              disabled={!customStartDate || !customEndDate}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              Apply
            </button>
            <button
              onClick={handleClearDateRange}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              Clear
            </button>
          </div>
        </div>
      )}
      
      {clientData.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-500">No client hours data found</div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {clientData.slice(0, 3).map((client) => (
              <div key={client.clientId} className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900">{client.clientName}</h4>
                <p className="text-sm text-gray-500">{client.clientEmail}</p>
                <div className="mt-2">
                  <span className="text-2xl font-bold text-blue-600">{client.totalHours}</span>
                  <span className="text-sm text-gray-500 ml-1">hours total</span>
                </div>
                <div className="mt-1 text-sm text-gray-500">
                  {client.developers.length} developer{client.developers.length !== 1 ? 's' : ''}
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
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Hours
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Developers
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {dateRange === 'this-week' ? 'Weekly' : 'Monthly'} Breakdown
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {clientData.map((client) => (
                  <tr key={client.clientId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{client.clientName}</div>
                        <div className="text-sm text-gray-500">{client.clientEmail}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-semibold">{client.totalHours}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {Array.from(new Set(
                          client.developers.slice(0, 2).map((dev: any) => {
                            // Handle different possible data structures
                            if (typeof dev === 'string') return dev;
                            if (typeof dev === 'object' && dev.name) return dev.name;
                            if (typeof dev === 'object' && dev.developer && dev.developer.name) return dev.developer.name;
                            return 'Unknown';
                          })
                        )).join(', ')}
                        {client.developers.length > 2 && ` +${client.developers.length - 2} more`}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {dateRange === 'this-week' 
                          ? Object.entries(client.weeklyHours || {}).map(([week, hours]) => (
                              <span key={week} className="mr-3">
                                {week}: {hours}h
                              </span>
                            ))
                          : Object.entries(client.monthlyHours || {}).map(([month, hours]) => (
                              <span key={month} className="mr-3">
                                {month}: {hours}h
                              </span>
                            ))
                        }
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientHours;
