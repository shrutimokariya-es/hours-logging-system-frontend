import React, { useState, useEffect, useCallback } from 'react';
import AddDeveloperModal from '../components/developers/AddDeveloperModal';
import EditDeveloperModal from '../components/developers/EditDeveloperModal';
import { developerService, Developer, DeveloperFormData, DeveloperListResponse } from '../services/developerService';
import { Users, Code, DollarSign, Activity, Search, Filter, Edit, Trash2, Plus } from 'lucide-react';

const Developers: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'Active' | 'Inactive'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedDeveloper, setSelectedDeveloper] = useState<Developer | null>(null);
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  const [loading, setLoading] = useState(false);

  const fetchDevelopers = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {
        page: pagination.page,
        limit: pagination.limit
      };
      
      if (filterStatus !== 'all') {
        params.status = filterStatus;
      }
      
      if (searchTerm) {
        params.search = searchTerm;
      }

      const response: DeveloperListResponse = await developerService.getAll(params);
      setDevelopers(response.developers);
      setPagination(response.pagination);
    } catch (error: any) {
      console.error('Error fetching developers:', error);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filterStatus, searchTerm]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (pagination.page === 1) {
        fetchDevelopers();
      } else {
        setPagination(prev => ({ ...prev, page: 1 }));
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, pagination.page, fetchDevelopers]);

  const handleAddDeveloper = async (developerData: DeveloperFormData) => {
    try {
      await developerService.create(developerData);
      setIsAddModalOpen(false);
      fetchDevelopers();
    } catch (error: any) {
      console.error('Error creating developer:', error);
    }
  };

  const handleEditDeveloper = async (developerData: Partial<DeveloperFormData>) => {
    if (!selectedDeveloper) return;
    
    try {
      await developerService.update(selectedDeveloper._id, developerData);
      setIsEditModalOpen(false);
      setSelectedDeveloper(null);
      fetchDevelopers();
    } catch (error: any) {
      console.error('Error updating developer:', error);
    }
  };

  const handleDeleteDeveloper = async (developer: Developer) => {
    if (!window.confirm(`Are you sure you want to delete ${developer.name}?`)) {
      return;
    }

    try {
      await developerService.delete(developer._id);
      fetchDevelopers();
    } catch (error: any) {
    }
  };

  const openEditModal = (developer: Developer) => {
    setSelectedDeveloper(developer);
    setIsEditModalOpen(true);
  };

  const filteredDevelopers = developers.filter(developer => {
    const matchesSearch = !searchTerm || 
      developer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      developer.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || developer.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const activeDevelopers = developers.filter(d => d.status === 'Active').length;
  const avgHourlyRate = developers.length > 0 
    ? (developers.reduce((sum, d) => sum + d.hourlyRate, 0) / developers.length).toFixed(2)
    : '0';

  return (
    <div className="space-y-6">
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-lg p-6 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Developers</h1>
            <p className="text-blue-100 mt-1">Manage your development team</p>
            <div className="flex items-center space-x-4 mt-3">
              <div className="flex items-center space-x-2">
                <div className="bg-white bg-opacity-20 rounded-full p-2">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{developers.length}</div>
                  <div className="text-xs text-blue-100">Total Developers</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="bg-white bg-opacity-20 rounded-full p-2">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{activeDevelopers}</div>
                  <div className="text-xs text-blue-100">Active</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="bg-white bg-opacity-20 rounded-full p-2">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-2xl font-bold">${avgHourlyRate}</div>
                  <div className="text-xs text-blue-100">Avg Rate/hr</div>
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-lg font-semibold shadow-md transform hover:scale-105 transition-all duration-200 flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>Add Developer</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Search size={16} className="mr-2 text-gray-400" />
              Search Developers
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder="Search by name or email..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Filter size={16} className="mr-2 text-gray-400" />
              Filter by Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'all' | 'Active' | 'Inactive')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            >
              <option value="all">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Developers List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading developers...</p>
          </div>
        </div>
      ) : filteredDevelopers.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-16 text-center">
          <div className="text-6xl mb-4">👨‍💻</div>
          <p className="text-gray-600 text-lg font-medium">No developers found</p>
          <p className="text-gray-500 text-sm mt-2">
            {searchTerm || filterStatus !== 'all' 
              ? 'Try adjusting your filters' 
              : 'Add your first developer to get started'}
          </p>
          {!searchTerm && filterStatus === 'all' && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Developer
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Developer
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Hourly Rate
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDevelopers.map((developer) => (
                  <tr key={developer._id} className="hover:bg-blue-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {developer.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-semibold text-gray-900">{developer.name}</div>
                          <div className="text-xs text-gray-500 flex items-center mt-1">
                            <Code size={12} className="mr-1" />
                            Developer
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{developer.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                        {developer.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm font-semibold text-gray-900">
                        <DollarSign size={14} className="mr-1 text-green-600" />
                        {developer.hourlyRate}/hr
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${
                        developer.status === 'Active' 
                          ? 'bg-green-100 text-green-800 border-green-200' 
                          : 'bg-red-100 text-red-800 border-red-200'
                      }`}>
                        {developer.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => openEditModal(developer)}
                        className="text-blue-600 hover:text-blue-900 mr-4 font-semibold inline-flex items-center"
                        title="Edit Developer"
                      >
                        <Edit size={16} className="mr-1" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteDeveloper(developer)}
                        className="text-red-600 hover:text-red-900 font-semibold inline-flex items-center"
                        title="Delete Developer"
                      >
                        <Trash2 size={16} className="mr-1" />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                  disabled={pagination.page === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: Math.min(pagination.pages, prev.page + 1) }))}
                  disabled={pagination.page === pagination.pages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-semibold">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
                    <span className="font-semibold">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of{' '}
                    <span className="font-semibold">{pagination.total}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-lg shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                      disabled={pagination.page === 1}
                      className="relative inline-flex items-center px-3 py-2 rounded-l-lg border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Previous
                    </button>
                    <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-blue-50 text-sm font-semibold text-blue-600">
                      Page {pagination.page} of {pagination.pages}
                    </span>
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, page: Math.min(pagination.pages, prev.page + 1) }))}
                      disabled={pagination.page === pagination.pages}
                      className="relative inline-flex items-center px-3 py-2 rounded-r-lg border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <AddDeveloperModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddDeveloper={handleAddDeveloper}
      />
      
      {selectedDeveloper && (
        <EditDeveloperModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedDeveloper(null);
          }}
          onEditDeveloper={handleEditDeveloper}
          developer={selectedDeveloper}
        />
      )}
    </div>
  );
};

export default Developers;
