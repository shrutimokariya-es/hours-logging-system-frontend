import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TabNavigation } from '../components/common';
import { Axios } from '../utils/axios';
import { 
  ChevronDown, 
  ChevronRight, 
  Calendar, 
  Users, 
  Clock, 
  Briefcase,
  FileText,
  Mail,
  Building2,
  DollarSign
} from 'lucide-react';

interface ClientHoursData {
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientRole: number;
  totalHours: number;
  weeklyHours: Record<string, number>;
  monthlyHours: Record<string, number>;
  totalProjects: any[];
  developers: Array<{
    _id: string;
    client: any;
    developer: any;
    project: any;
    date: string;
    hours: number;
    description: string;
  }>;
  logs: Array<{
    _id: string;
    client: any;
    developer: any;
    project: any;
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
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [timelineFilter, setTimelineFilter] = useState({
    start: new Date(2020, 0, 1).toISOString().split('T')[0], // Start from 2020 to show all historical data
    end: new Date().toISOString().split('T')[0]
  });
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
  const [expandedDevelopers, setExpandedDevelopers] = useState<Set<string>>(new Set());

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'projects', label: 'Projects' },
    { key: 'developers', label: 'Developers' },
    { key: 'timeline', label: 'Timeline' },
  ];

  const fetchClientDetails = useCallback(async () => {
    try {
      const response = await Axios.get(`/clients/${id}`);
      if (response.data.success) {
        setClient(response.data.data.client);
      }
    } catch (error: any) {
      console.error('Error fetching client details:', error);
    }
  }, [id]);

  const fetchProjectHours = useCallback(async () => {
    try {
      // Don't apply date filter for initial load - fetch all data
      const response = await Axios.get(
        `/reports/clients/hours?clientId=${id}`
      );
      if (response.data.success) {
        setClientHours(response.data.data.clientHours);
      }
    } catch (error: any) {
      console.error('Error fetching project hours:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchClientDetails();
    fetchProjectHours();
  }, [fetchClientDetails, fetchProjectHours]);

  const handleTimelineFilterChange = (type: 'start' | 'end', value: string) => {
    setTimelineFilter(prev => ({ ...prev, [type]: value }));
  };

  const applyTimelineFilter = () => {
    // Timeline filter is applied in groupLogsByDate function
    // No need to refetch data
  };

  const resetTimelineFilter = () => {
    const defaultStart = new Date(2020, 0, 1).toISOString().split('T')[0]; // Show all historical data
    const defaultEnd = new Date().toISOString().split('T')[0];
    setTimelineFilter({ start: defaultStart, end: defaultEnd });
  };

  const getTotalHours = () => clientHours.length > 0 ? clientHours[0].totalHours : 0;
  const getProjects = () => clientHours.length > 0 ? clientHours[0].totalProjects : [];
  const getLogs = useCallback(() => clientHours.length > 0 ? clientHours[0].logs : [], [clientHours]);

  const getUniqueDevelopers = useMemo(() => {
    const logs = getLogs();
    const developerMap = new Map();
    
    logs.forEach((log: any) => {
      if (!log.developer?._id) return; // Safety check
      
      const devId = log.developer._id;
      if (!developerMap.has(devId)) {
        developerMap.set(devId, {
          ...log.developer,
          totalHours: 0,
          logs: []
        });
      }
      const dev = developerMap.get(devId);
      dev.totalHours += log.hours;
      dev.logs.push(log);
    });
    
    return Array.from(developerMap.values());
  }, [getLogs]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800 border-green-200';
      case 'Inactive': return 'bg-red-100 text-red-800 border-red-200';
      case 'On Hold': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const toggleProjectExpansion = (projectId: string) => {
    const newExpanded = new Set(expandedProjects);
    if (newExpanded.has(projectId)) {
      newExpanded.delete(projectId);
    } else {
      newExpanded.add(projectId);
    }
    setExpandedProjects(newExpanded);
  };

  const toggleDeveloperExpansion = (developerId: string) => {
    const newExpanded = new Set(expandedDevelopers);
    if (newExpanded.has(developerId)) {
      newExpanded.delete(developerId);
    } else {
      newExpanded.add(developerId);
    }
    setExpandedDevelopers(newExpanded);
  };

  const groupLogsByDate = useCallback(() => {
    const logs = getLogs();
    const grouped = new Map();
    
    // Filter logs by timeline date range
    const filteredLogs = logs.filter((log: any) => {
      if (!log.date) return false; // Safety check
      const logDate = new Date(log.date).toISOString().split('T')[0];
      return logDate >= timelineFilter.start && logDate <= timelineFilter.end;
    });
    
    filteredLogs.forEach((log: any) => {
      const date = new Date(log.date).toISOString().split('T')[0];
      if (!grouped.has(date)) {
        grouped.set(date, []);
      }
      grouped.get(date).push(log);
    });
    
    return Array.from(grouped.entries())
      .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime());
  }, [timelineFilter, getLogs]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading client details...</p>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <FileText size={48} className="text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Client not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="bg-white bg-opacity-20 p-3 rounded-lg">
              <Building2 size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{client.name}</h1>
              <p className="text-green-100 mt-1 flex items-center">
                <Mail size={14} className="mr-2" />
                {client.email}
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/clients')}
            className="bg-white text-green-700 hover:bg-green-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
          >
            ← Back
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Total Hours</p>
                <p className="text-2xl font-bold mt-1">{getTotalHours().toFixed(1)}</p>
              </div>
              <Clock className="text-green-200" size={24} />
            </div>
          </div>
          <div className="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Projects</p>
                <p className="text-2xl font-bold mt-1">{getProjects().length}</p>
              </div>
              <Briefcase className="text-green-200" size={24} />
            </div>
          </div>
          <div className="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Developers</p>
                <p className="text-2xl font-bold mt-1">{getUniqueDevelopers.length}</p>
              </div>
              <Users className="text-green-200" size={24} />
            </div>
          </div>
          <div className="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Billing Type</p>
                <p className="text-lg font-bold mt-1">{client.billingType}</p>
              </div>
              <DollarSign className="text-green-200" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <TabNavigation
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="p-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Client Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-500 mb-1">Company Email</p>
                  <p className="text-base font-medium text-gray-900">{client.companyEmail}</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-500 mb-1">Status</p>
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full border ${getStatusColor(client.status)}`}>
                    {client.status}
                  </span>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-500 mb-1">Member Since</p>
                  <p className="text-base font-medium text-gray-900">
                    {new Date(client.createdAt).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              {getLogs().length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <Clock size={48} className="text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No activity in selected date range</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {getLogs().slice(0, 5).map((log: any) => (
                    <div key={log._id} className="border border-gray-200 rounded-lg p-4 hover:border-green-300 transition-colors">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="font-medium text-gray-900">{log.developer?.name || 'Unknown Developer'}</span>
                            <span className="text-gray-400">•</span>
                            <span className="text-sm text-gray-600">
                              {typeof log.project === 'object' ? log.project?.name : 'Project'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{log.description || 'No description'}</p>
                        </div>
                        <div className="text-right ml-4">
                          <div className="text-lg font-bold text-green-600">{log.hours}h</div>
                          <div className="text-xs text-gray-500">
                            {log.date ? new Date(log.date).toLocaleDateString() : 'N/A'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Projects Tab */}
        {activeTab === 'projects' && (
          <div className="p-6">
            {getProjects().length === 0 ? (
              <div className="text-center py-12">
                <Briefcase size={48} className="text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No projects found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {getProjects().map((project: any) => {
                  const projectLogs = getLogs().filter((log: any) => {
                    const logProjectId = typeof log.project === 'string' ? log.project : log.project?._id;
                    return logProjectId === project._id;
                  });
                  const isExpanded = expandedProjects.has(project._id);

                  return (
                    <div key={project._id} className="border border-gray-200 rounded-lg overflow-hidden">
                      <div
                        className="p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => toggleProjectExpansion(project._id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3 flex-1">
                            {isExpanded ? (
                              <ChevronDown className="text-gray-400" size={20} />
                            ) : (
                              <ChevronRight className="text-gray-400" size={20} />
                            )}
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900">{project.name}</h4>
                              <p className="text-sm text-gray-600 mt-1">
                                {project.developers?.length || 0} developer(s) • {projectLogs.length} log(s)
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-600">Estimated: {project.estimatedHours || 0}h</div>
                            <div className="text-lg font-bold text-green-600">Actual: {project.actualHours || 0}h</div>
                          </div>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="p-4 bg-white border-t border-gray-200">
                          {projectLogs.length === 0 ? (
                            <p className="text-center text-gray-500 py-4">No hour logs for this project</p>
                          ) : (
                            <div className="space-y-3">
                              {projectLogs.map((log: any) => (
                                <div key={log._id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                  <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                      <div className="font-medium text-gray-900">{log.developer?.name || 'Unknown Developer'}</div>
                                      <p className="text-sm text-gray-600 mt-1">{log.description || 'No description'}</p>
                                    </div>
                                    <div className="text-right ml-4">
                                      <div className="text-lg font-bold text-green-600">{log.hours}h</div>
                                      <div className="text-xs text-gray-500">
                                        {log.date ? new Date(log.date).toLocaleDateString() : 'N/A'}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Developers Tab */}
        {activeTab === 'developers' && (
          <div className="p-6">
            {getUniqueDevelopers.length === 0 ? (
              <div className="text-center py-12">
                <Users size={48} className="text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No developers found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {getUniqueDevelopers.map((developer: any) => {
                  const isExpanded = expandedDevelopers.has(developer._id);

                  return (
                    <div key={developer._id} className="border border-gray-200 rounded-lg overflow-hidden">
                      <div
                        className="p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => toggleDeveloperExpansion(developer._id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3 flex-1">
                            {isExpanded ? (
                              <ChevronDown className="text-gray-400" size={20} />
                            ) : (
                              <ChevronRight className="text-gray-400" size={20} />
                            )}
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900">{developer.name}</h4>
                              <p className="text-sm text-gray-600 mt-1">{developer.email}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-600">{developer.logs.length} log(s)</div>
                            <div className="text-lg font-bold text-green-600">{developer.totalHours.toFixed(1)}h</div>
                          </div>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="p-4 bg-white border-t border-gray-200">
                          <div className="space-y-3">
                            {developer.logs.map((log: any) => (
                              <div key={log._id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <div className="font-medium text-gray-900">
                                      {typeof log.project === 'object' ? log.project?.name : 'Project'}
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">{log.description || 'No description'}</p>
                                  </div>
                                  <div className="text-right ml-4">
                                    <div className="text-lg font-bold text-green-600">{log.hours}h</div>
                                    <div className="text-xs text-gray-500">
                                      {log.date ? new Date(log.date).toLocaleDateString() : 'N/A'}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Timeline Tab */}
        {activeTab === 'timeline' && (
          <div className="p-6">
            {/* Timeline Date Filter */}
            <div className="mb-6 bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <h3 className="text-sm font-semibold text-gray-700 flex items-center">
                  <Calendar size={18} className="mr-2 text-green-600" />
                  Filter Timeline
                </h3>
                <div className="flex items-center space-x-3 flex-wrap gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">From</label>
                    <input
                      type="date"
                      value={timelineFilter.start}
                      onChange={(e) => handleTimelineFilterChange('start', e.target.value)}
                      className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">To</label>
                    <input
                      type="date"
                      value={timelineFilter.end}
                      onChange={(e) => handleTimelineFilterChange('end', e.target.value)}
                      className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div className="flex items-end space-x-2">
                    <button
                      onClick={applyTimelineFilter}
                      className="px-4 py-1.5 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      Apply
                    </button>
                    <button
                      onClick={resetTimelineFilter}
                      className="px-4 py-1.5 bg-gray-200 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {groupLogsByDate().length === 0 ? (
              <div className="text-center py-12">
                <Calendar size={48} className="text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No activity in selected date range</p>
                <p className="text-sm text-gray-500 mt-2">Try adjusting the date filter above</p>
              </div>
            ) : (
              <div className="space-y-6">
                {groupLogsByDate().map(([date, logs]: [string, any]) => {
                  const totalHoursForDay = logs.reduce((sum: number, log: any) => sum + log.hours, 0);
                  
                  return (
                    <div key={date} className="relative">
                      <div className="flex items-center mb-4">
                        <div className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold">
                          {new Date(date).toLocaleDateString('en-US', { 
                            weekday: 'short', 
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </div>
                        <div className="ml-4 text-sm text-gray-600">
                          {logs.length} log(s) • {totalHoursForDay.toFixed(1)} hours
                        </div>
                      </div>
                      
                      <div className="ml-8 space-y-3">
                        {logs.map((log: any) => (
                          <div key={log._id} className="border-l-4 border-green-500 bg-gray-50 rounded-r-lg p-4">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  <span className="font-medium text-gray-900">{log.developer?.name || 'Unknown Developer'}</span>
                                  <span className="text-gray-400">•</span>
                                  <span className="text-sm text-gray-600">
                                    {typeof log.project === 'object' ? log.project?.name : 'Project'}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600">{log.description || 'No description'}</p>
                              </div>
                              <div className="text-lg font-bold text-green-600 ml-4">{log.hours}h</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientDetails;
