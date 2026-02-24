import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button } from '../components/common';
import { Axios } from '../utils/axios';

interface ClientHoursData {
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientRole: number;
  totalHours: number;
  weeklyHours: Record<string, number>;
  monthlyHours: Record<string, number>;
  developers: Array<{
    _id: string;
    client: {
      _id: string;
      name: string;
      email: string;
      role: number;
    };
    developer: {
      _id: string;
      name: string;
      email: string;
      role: number;
      billingType: string;
      hourlyRate: number;
      developerRole: string;
      status: string;
    };
    project: string;
    date: string;
    hours: number;
    description: string;
  }>;
  logs: Array<{
    _id: string;
    client: {
      _id: string;
      name: string;
      email: string;
      role: number;
    };
    developer: {
      _id: string;
      name: string;
      email: string;
      role: number;
      billingType: string;
      hourlyRate: number;
      developerRole: string;
      status: string;
    };
    project: string;
    date: string;
    hours: number;
    description: string;
  }>;
}

interface Client {
  _id: string;
  name: string;
  email: string;
  companyEmail: string;
  billingType: string;
  status: string;
  createdAt: string;
}

const ClientDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [client, setClient] = useState<Client | null>(null);
  const [clientHours, setClientHours] = useState<ClientHoursData[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  const fetchClientDetails = useCallback(async () => {
    try {
      const response = await Axios.get(`/clients/${id}`);
      console.log('Client details API response:', response.data);
      if (response.data.success) {
        setClient(response.data.data.client);
      } else {
        toast.error(response.data.message || 'Failed to fetch client details');
      }
    } catch (error: any) {
      console.error('Error fetching client details:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch client details');
    }
  }, [id]);

  const fetchProjectHours = useCallback(async () => {
    try {
      const response = await Axios.get(`/reports/clients/hours?clientId=${id}&startDate=${dateRange.start}&endDate=${dateRange.end}`);
      console.log('Client hours API response:', response.data.data.clientHours);
      if (response.data.success) {
        setClientHours(response.data.data.clientHours);
      } else {
        toast.error(response.data.message || 'Failed to fetch project hours');
      }
    } catch (error: any) {
      console.error('Error fetching project hours:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch project hours');
    } finally {
      setLoading(false);
    }
  }, [id, dateRange]);

  useEffect(() => {
    fetchClientDetails();
    fetchProjectHours();
  }, [fetchClientDetails, fetchProjectHours]);

  const handleDateRangeChange = (type: 'start' | 'end', value: string) => {
    setDateRange(prev => ({
      ...prev,
      [type]: value
    }));
  };

  console.log(clientHours)
  const getTotalHours = () => {
    return clientHours.length > 0 ? clientHours[0].totalHours : 0;
  };

  const getDeveloperHours = () => {
    console.log("getDeveloperHours", clientHours.length > 0 ? clientHours[0].developers : [])
    return clientHours.length > 0 ? clientHours[0].developers : [];
  };

  const getLogs = () => {
    return clientHours.length > 0 ? clientHours[0].logs : [];
  };

  const getProjectDetails = () => {
    const logs = getLogs();
    const projectMap = new Map();
    
    logs.forEach((log: any) => {
      const projectId = log.project;
      const projectName = log.project?.name || `Project ${projectId}`; // Try to get project name
      if (!projectMap.has(projectId)) {
        projectMap.set(projectId, {
          id: projectId,
          name: projectName,
          totalHours: 0,
          logs: []
        });
      }
      const project = projectMap.get(projectId);
      project.totalHours += log.hours;
      project.logs.push(log);
    });
    
    return Array.from(projectMap.values());
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading client details...</div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Client not found</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{client.name}</h1>
            <p className="text-gray-600 mt-1">Client Details & Project Hours</p>
          </div>
          <Button
            variant="secondary"
            onClick={() => navigate('/clients')}
          >
            ← Back to Clients
          </Button>
        </div>
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="text-lg font-medium">{client.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Company Email</p>
            <p className="text-lg font-medium">{client.companyEmail}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Billing Type</p>
            <p className="text-lg font-medium">{client.billingType}</p>
          </div>
        </div>
        
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
              client.status === 'Active' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {client.status}
            </span>
          </div>
          <div>
            <p className="text-sm text-gray-500">Member Since</p>
            <p className="text-lg font-medium">{new Date(client.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Date Range Filter</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => handleDateRangeChange('start', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => handleDateRangeChange('end', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
        </div>
      </div>

      {/* Project Hours Summary */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Project Hours Breakdown</h2>
          <div className="text-right">
            <p className="text-sm text-gray-500">Total Hours</p>
            <p className="text-2xl font-bold text-green-600">{getTotalHours().toFixed(1)}</p>
          </div>
        </div>

        {clientHours.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg">📊</div>
            <p className="text-gray-600 mt-2">No project hours found for selected date range</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-500">Total Hours</p>
                  <p className="text-2xl font-bold text-blue-600">{getTotalHours().toFixed(1)}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500">Active Developers</p>
                  <p className="text-2xl font-bold text-green-600">{getDeveloperHours().length}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500">Total Projects</p>
                  <p className="text-2xl font-bold text-purple-600">{getProjectDetails().length}</p>
                </div>
              </div>
            </div>

            {/* Project Details */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Project Details</h3>
              {getProjectDetails().length === 0 ? (
                <p className="text-gray-500 text-sm">No projects found</p>
              ) : (
                <div className="space-y-4">
                  {getProjectDetails().map((project) => (
                    <div key={project.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="text-md font-medium text-gray-900">{project.name}</h4>
                          <p className="text-sm text-gray-500">Total Hours: {project.totalHours.toFixed(1)}h</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-blue-600">{project.totalHours.toFixed(1)}h</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Developers Breakdown */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Developer Hours</h3>
              {getDeveloperHours().length === 0 ? (
                <p className="text-gray-500 text-sm">No developers found</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getDeveloperHours().map((dev) => (
                    <div key={dev._id} className="bg-gray-50 rounded p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-gray-900">{dev.developer.name}</p>
                        <p className="text-lg font-bold text-green-600">{dev.hours.toFixed(1)}h</p>
                      </div>
                      <p className="text-sm text-gray-500">{dev.developer.email}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(dev.date).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientDetails;
