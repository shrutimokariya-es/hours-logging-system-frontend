import React, { useState, useEffect, useCallback } from 'react';
import analyticsService, { PredictiveInsights } from '../services/analyticsService';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Clock, 
  Activity,
  BarChart3,
  Calendar,
  Zap
} from 'lucide-react';

const Analytics: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState<PredictiveInsights | null>(null);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [tempDateRange, setTempDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  const fetchInsights = useCallback(async () => { 
    setLoading(true);
    try {
      const data = await analyticsService.getPredictiveInsights(dateRange.start, dateRange.end);
      setInsights(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  }, [dateRange.start, dateRange.end]);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  const handleApply = () => {
    setDateRange(tempDateRange);
    fetchInsights();
  };

  const handleClear = () => {
    const defaultRange = {
      start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0]
    };
    setTempDateRange(defaultRange);
    setDateRange(defaultRange);
    fetchInsights();
  };

  const getWorkloadColor = (status: string) => {
    switch (status) {
      case 'Underutilized': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'Optimal': return 'text-green-600 bg-green-100 border-green-200';
      case 'Overloaded': return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'Critical': return 'text-red-600 bg-red-100 border-red-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!insights) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-600">No analytics data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-lg p-6 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <BarChart3 className="mr-3" size={32} />
              Predictive Insights
            </h1>
            <p className="text-blue-100 mt-1">Analytics and performance metrics</p>
          </div>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Date Range Filter</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleClear}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              Clear
            </button>
            <button
              onClick={handleApply}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Loading...' : 'Apply'}
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={tempDateRange.start}
              onChange={(e) => setTempDateRange(prev => ({ ...prev, start: e.target.value }))}
              max={tempDateRange.end}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={tempDateRange.end}
              onChange={(e) => setTempDateRange(prev => ({ ...prev, end: e.target.value }))}
              min={tempDateRange.start}
              max={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Trends Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-gray-900">{insights.trends.hoursThisMonth}h</p>
            </div>
            <Clock className="text-blue-500" size={32} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Last Month</p>
              <p className="text-2xl font-bold text-gray-900">{insights.trends.hoursLastMonth}h</p>
            </div>
            <Calendar className="text-purple-500" size={32} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Growth</p>
              <p className={`text-2xl font-bold ${insights.trends.growthPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {insights.trends.growthPercentage >= 0 ? '+' : ''}{insights.trends.growthPercentage.toFixed(1)}%
              </p>
            </div>
            {insights.trends.growthPercentage >= 0 ? (
              <TrendingUp className="text-green-500" size={32} />
            ) : (
              <TrendingDown className="text-red-500" size={32} />
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Projected Next</p>
              <p className="text-2xl font-bold text-gray-900">{insights.trends.projectedNextMonth.toFixed(0)}h</p>
            </div>
            <Zap className="text-yellow-500" size={32} />
          </div>
        </div>
      </div>

      {/* Client Hours Analytics */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
        <div className="px-6 py-4 bg-gradient-to-r from-purple-50 to-white border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <Users className="mr-2 text-purple-600" size={24} />
            Client Hours Distribution
          </h2>
          <p className="text-sm text-gray-600 mt-1">Which clients consume the most hours</p>
        </div>
        <div className="p-6">
          {insights.clientHoursAnalytics.length > 0 ? (
            <div className="space-y-4">
              {insights.clientHoursAnalytics.map((client, index) => (
                <div key={client.clientId} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{client.clientName}</h3>
                        <p className="text-sm text-gray-500">{client.projectCount} projects</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-purple-600">{client.totalHours}h</p>
                      <p className="text-sm text-gray-500">{client.percentage.toFixed(1)}% of total</p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${client.percentage}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Avg: {client.averageHoursPerProject.toFixed(1)}h per project
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">No client data available</p>
          )}
        </div>
      </div>

      {/* Developer Workload */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
        <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-white border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <Activity className="mr-2 text-blue-600" size={24} />
            Developer Workload Analysis
          </h2>
          <p className="text-sm text-gray-600 mt-1">Who is overloaded or underutilized</p>
        </div>
        <div className="p-6">
          {insights.developerWorkloadAnalytics.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Developer</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Total Hours</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Avg/Day</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Projects</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Tasks</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Utilization</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {insights.developerWorkloadAnalytics.map((dev) => (
                    <tr key={dev.developerId} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{dev.developerName}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{dev.totalHours}h</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{dev.averageHoursPerDay}h</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{dev.projectCount}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{dev.taskCount}</td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                dev.utilizationPercentage > 100 ? 'bg-red-500' : 
                                dev.utilizationPercentage > 80 ? 'bg-green-500' : 
                                'bg-yellow-500'
                              }`}
                              style={{ width: `${Math.min(dev.utilizationPercentage, 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-xs font-medium">{dev.utilizationPercentage}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getWorkloadColor(dev.workloadStatus)}`}>
                          {dev.workloadStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">No developer data available</p>
          )}
        </div>
      </div>

    
    </div>
  );
};

export default Analytics;
