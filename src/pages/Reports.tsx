import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import ClientHours from '../components/ClientHours';
import DeveloperHours from '../components/DeveloperHours';
import HoursSummary from '../components/HoursSummary';

const Reports: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [activeView, setActiveView] = useState<'summary' | 'clients' | 'developers'>('summary');
  const [loading, setLoading] = useState();
  const [error, setError] = useState<string | null>(null);

  // Fetch reports on component mount (not needed anymore but keeping for structure)
  useEffect(() => {
    // No need to fetch reports since we removed the reports tab
  }, []);

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500">{error}</div>
        <button 
          onClick={() => window.location.reload()}
          className="mt-2 text-blue-600 hover:text-blue-800"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-600">Generate and manage your reports</p>
      </div>

      {/* Report Generation Form */}
      {/* <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-6">Generate New Report</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Report Type
            </label>
            <select
              value={selectedReportType}
              onChange={(e) => setSelectedReportType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              {reportTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-sm text-gray-500">
              {reportTypes.find(t => t.value === selectedReportType)?.description}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Range
            </label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              {dateRanges.map((range) => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-6">
          <button
            onClick={handleGenerateReport}
            disabled={isGenerating}
            className="bg-primary-600 text-white px-6 py-2 rounded hover:bg-primary-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isGenerating ? 'Generating...' : 'Generate Report'}
          </button>
        </div>
      </div> */}

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            {[
              { key: 'summary', label: 'Hours Summary', description: 'Overview of all hours and activity' },
              { key: 'clients', label: 'Client Hours', description: 'Client-wise hours breakdown' },
              { key: 'developers', label: 'Developer Hours', description: 'Developer performance metrics' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveView(tab.key as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeView === tab.key
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content based on active view */}
      {activeView === 'summary' && (
        <HoursSummary />
      )}
      
      {activeView === 'clients' && (
        <ClientHours />
      )}
      
      {activeView === 'developers' && (
        <DeveloperHours />
      )}
    </div>
  );
};

export default Reports;
