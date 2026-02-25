import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import ClientHours from '../components/ClientHours';
import DeveloperHours from '../components/DeveloperHours';
import HoursSummary from '../components/HoursSummary';
import { PageHeader, TabNavigation } from '../components/common';

const Reports: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [activeView, setActiveView] = useState<'summary' | 'clients' | 'developers'>('summary');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const tabs = [
    { key: 'summary', label: 'Hours Summary', description: 'Overview of all hours and activity' },
    { key: 'clients', label: 'Client Hours', description: 'Client-wise hours breakdown' },
    ...(user?.role !== 2 ? [{ key: 'developers', label: 'Developer Hours', description: 'Developer performance metrics' }] : [])
  ];

  // Initialize reports data
  useEffect(() => {
    const initializeReports = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Simulate initial data loading or validation
        // Individual components will handle their own data fetching
        await new Promise(resolve => setTimeout(resolve, 500)); // Minimal loading state
      } catch (err: any) {
        setError(err.message || 'Failed to initialize reports');
      } finally {
        setLoading(false);
      }
    };

    initializeReports();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Reports" subtitle="Loading your reports..." />
        <div className="text-center py-8">
          <div className="animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 w-6 h-6"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Reports" subtitle="Error loading reports" />
        <div className="text-center py-8">
          <div className="text-red-500">{error}</div>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 text-blue-600 hover:text-blue-800"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Reports" 
        subtitle="Generate and manage your reports"
      />

      {/* Navigation Tabs */}
      <TabNavigation
        tabs={tabs}
        activeTab={activeView}
        onTabChange={(key) => setActiveView(key as 'summary' | 'clients' | 'developers')}
      />

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
