import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
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

  useEffect(() => {
    fetchClientHours();
  }, [dateRange, customStartDate, customEndDate]);

  const fetchClientHours = async () => {
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
      
      const clientHours = await reportService.getClientHours(params);
      setClientData(clientHours);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch client hours');
      toast.error('Failed to fetch client hours');
    } finally {
      setLoading(false);
    }
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

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Client Hours</h3>
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
            onClick={fetchClientHours}
            className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700 transition-colors"
          >
            Apply
          </button>
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
                        {client.developers.slice(0, 2).join(', ')}
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
