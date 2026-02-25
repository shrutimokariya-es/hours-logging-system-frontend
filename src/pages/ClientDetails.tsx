import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button } from '../components/common';
import { Axios } from '../utils/axios';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface ClientHoursData {
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientRole: number;
  totalHours: number;
  weeklyHours: Record<string, number>;
  monthlyHours: Record<string, number>;
  totalProjects:any[],
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
    project: string | {
      _id: string;
      name: string;
    };
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
    project: string | {
      _id: string;
      name: string;
    };
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
  const [projectDetails, setProjectDetails] = useState<Record<string, { name: string }>>({});
  const [processedProjectDetails, setProcessedProjectDetails] = useState<any[]>([]);
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
  const [projectHourLogs, setProjectHourLogs] = useState<Record<string, any[]>>({});

  // Client details fields array
  const clientFields = [
    {
      label: 'Email',
      value: client?.email || '',
      type: 'text'
    },
    {
      label: 'Company Email',
      value: client?.companyEmail || '',
      type: 'text'
    },
    {
      label: 'Billing Type',
      value: client?.billingType || '',
      type: 'text'
    },
    {
      label: 'Status',
      value: client?.status || '',
      type: 'badge'
    },
    {
      label: 'Member Since',
      value: client?.createdAt ? new Date(client.createdAt).toLocaleDateString() : '',
      type: 'date'
    }
  ];

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

  
  const getTotalHours = () => {
    return clientHours.length > 0 ? clientHours[0].totalHours : 0;
  };

  const getDeveloperHours = () => {
    
    return clientHours.length > 0 ? clientHours[0].developers : [];
  };

  const getLogs = () => {
    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>",clientHours)
    // return clientHours.length > 0 ? clientHours[0].logs : [];
    return clientHours.length > 0 ? clientHours[0].logs : [];
  };
const getClientProject = () =>{
  return clientHours.length > 0 ? clientHours[0].totalProjects : [];
}

const getProjectHours = (projectId: string) => {
  const logs = getLogs();
  const projectLogs = logs.filter((log: any) => {
    const logProjectId = typeof log.project === 'string' ? log.project : log.project?._id;
    return logProjectId === projectId;
  });
  return projectLogs.reduce((total, log) => total + log.hours, 0);
}

const getProjectDevelopers = (projectId: string) => {
  const projects = getClientProject();
  const project = projects.find(p => p._id === projectId);
  return project?.developers || [];
}

const getLoggedDevelopers = (projectId: string) => {
  const logs = getLogs();
  const projectLogs = logs.filter((log: any) => {
    const logProjectId = typeof log.project === 'string' ? log.project : log.project?._id;
    return logProjectId === projectId;
  });
  return Array.from(new Set(projectLogs.map((log: any) => log.developer.name)));
}
  const getProjectDetails = () => {
    const logs = getLogs();
    const projectMap = new Map();
    // Process the logs with the project information
    logs.forEach((log: any) => {
      console.log("logs",log.project,typeof log.project)
      let projectId: string;
      let projectName: string;
      
      if (typeof log.project === 'string') {
        projectId = log.project;
        projectName = projectDetails[projectId]?.name || `Project ${projectId}`;
      } else if (log.project && typeof log.project === 'object') {
        projectId = log.project._id || log.project.id;
        projectName = log.project.name || projectDetails[projectId]?.name || `Project ${projectId}`;
      } else {
        projectId = 'unknown';
        projectName = 'Unknown Project';
      }
      
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

  // Effect to fetch project details when logs are available
  useEffect(() => {
    const fetchProjectDetailsIfNeeded = async () => {
      const logs = getLogs();
      if (logs.length === 0) return;
      
      // Collect all unique project IDs
      const projectIds = new Set<string>();
      logs.forEach((log: any) => {
        if (typeof log.project === 'string') {
          projectIds.add(log.project);
        } else if (log.project && typeof log.project === 'object') {
          projectIds.add(log.project._id || log.project.id);
        }
      });
      
      // Fetch project details for any IDs we don't have cached
      const uncachedIds = Array.from(projectIds).filter(id => !projectDetails[id]);
      if (uncachedIds.length > 0) {
        try {
          // Fetch all projects
          const response = await Axios.get('/projects');
          if (response.data.success) {
            const projects = response.data.data.projects;
            const newProjectDetails: Record<string, { name: string }> = {};
            
            projects.forEach((project: any) => {
              newProjectDetails[project._id] = { name: project.name };
            });
            
            setProjectDetails(prev => ({ ...prev, ...newProjectDetails }));
          }
        } catch (error) {
          console.error('Error fetching project details:', error);
        }
      }
    };

    fetchProjectDetailsIfNeeded();
  }, [clientHours]); // Re-run when clientHours change

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Planning': return 'bg-gray-100 text-gray-800';
      case 'Active': return 'bg-green-100 text-green-800';
      case 'On Hold': return 'bg-yellow-100 text-yellow-800';
      case 'Completed': return 'bg-blue-100 text-blue-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const toggleProjectExpansion = (projectId: string) => {
    const newExpanded = new Set(expandedProjects);
    
    if (newExpanded.has(projectId)) {
      // Collapse project
      newExpanded.delete(projectId);
      setExpandedProjects(newExpanded);
    } else {
      // Expand project
      newExpanded.add(projectId);
      setExpandedProjects(newExpanded);
      
      // Get hour logs for this project
      const logs = getLogs();
      const projectLogs = logs.filter((log: any) => {
        const logProjectId = typeof log.project === 'string' ? log.project : log.project?._id;
        return logProjectId === projectId;
      });
      
      setProjectHourLogs(prev => ({ ...prev, [projectId]: projectLogs }));
    }
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
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clientFields.map((field, index) => (
            <div key={index}>
              <p className="text-sm text-gray-500">{field.label}</p>
              {field.type === 'badge' ? (
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  field.value === 'Active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {field.value}
                </span>
              ) : (
                <p className="text-lg font-medium">{field.value}</p>
              )}
            </div>
          ))}
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
                  <p className="text-2xl font-bold text-purple-600">{getClientProject().length}</p>
                </div>
              </div>
            </div>

            {/* Project Details Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Project Details</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Project Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Client
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Developers
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Hours
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {getClientProject().length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                          No projects found
                        </td>
                      </tr>
                    ) : (
                      getClientProject().map((project) => {
                        const projectHours = getProjectHours(project._id);
                        const projectLogs = getLogs().filter((log: any) => {
                          const logProjectId = typeof log.project === 'string' ? log.project : log.project?._id;
                          return logProjectId === project._id;
                        });
                        
                        return (
                          <React.Fragment key={project._id}>
                            <tr 
                              className="hover:bg-gray-50 cursor-pointer"
                              onClick={() => toggleProjectExpansion(project._id)}
                            >
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  {expandedProjects.has(project._id) ? (
                                    <ChevronDown className="w-4 h-4 mr-2 text-gray-400" />
                                  ) : (
                                    <ChevronRight className="w-4 h-4 mr-2 text-gray-400" />
                                  )}
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">{project.name}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{client?.name}</div>
                                <div className="text-sm text-gray-500">{client?.email}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor('Active')}`}>
                                  Active
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {getProjectDevelopers(project._id).length} developer{getProjectDevelopers(project._id).length !== 1 ? 's' : ''}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {getProjectDevelopers(project._id).slice(0, 2).map((dev: any) => dev.name).join(', ')}
                                  {getProjectDevelopers(project._id).length > 2 && '...'}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  Est: {projectHours.toFixed(1)}h
                                </div>
                                <div className="text-sm text-gray-500">
                                  Actual: {projectHours.toFixed(1)}h
                                </div>
                              </td>
                            </tr>
                            
                            {/* Expandable row for hour logs */}
                            {expandedProjects.has(project._id) && (
                              <tr>
                                <td colSpan={5} className="px-0 py-0">
                                  <div className="bg-gray-50 border-l-4 border-green-500">
                                    {projectLogs.length > 0 ? (
                                      <div className="p-4">
                                        <h4 className="text-sm font-semibold text-gray-700 mb-3">Logged Hours</h4>
                                        <div className="space-y-2">
                                          {projectLogs.map((log) => (
                                            <div key={log._id} className="bg-white p-3 rounded border border-gray-200">
                                              <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                  <div className="text-sm font-medium text-gray-900">
                                                    {log.developer.name}
                                                  </div>
                                                  <div className="text-sm text-gray-600 mt-1">
                                                    {log.description}
                                                  </div>
                                                </div>
                                                <div className="text-right ml-4">
                                                  <div className="text-sm font-semibold text-green-600">
                                                    {log.hours}h
                                                  </div>
                                                  <div className="text-xs text-gray-500">
                                                    {new Date(log.date).toLocaleDateString()}
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="px-6 py-4 text-center text-gray-500">
                                        No hour logs found for this project
                                      </div>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Developers Breakdown */}
            {/* <div className="bg-white rounded-lg shadow p-6">
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
            </div> */}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientDetails;
