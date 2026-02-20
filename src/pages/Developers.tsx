import React, { useState, useEffect } from 'react';
import AddDeveloperModal from '../components/developers/AddDeveloperModal';
import EditDeveloperModal from '../components/developers/EditDeveloperModal';
import { developerService, Developer, DeveloperFormData, DeveloperListResponse } from '../services/developerService';
import { Button } from '../components/common';
import { toast } from 'react-toastify';

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

  const fetchDevelopers = async () => {
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
      toast.error('Failed to fetch developers');
      console.error('Error fetching developers:', error);
    } finally {
      setLoading(false);
    }
  };

  // useEffect(() => {
  //   fetchDevelopers();
  // }, [fetchDevelopers, pagination.page, filterStatus]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (pagination.page === 1) {
        fetchDevelopers();
      } else {
        setPagination(prev => ({ ...prev, page: 1 }));
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [ searchTerm, pagination.page]);

  const handleAddDeveloper = async (developerData: DeveloperFormData) => {
    try {
      await developerService.create(developerData);
      toast.success('Developer created successfully');
      setIsAddModalOpen(false);
      fetchDevelopers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create developer');
      console.error('Error creating developer:', error);
    }
  };

  const handleEditDeveloper = async (developerData: Partial<DeveloperFormData>) => {
    if (!selectedDeveloper) return;
    
    try {
      await developerService.update(selectedDeveloper._id, developerData);
      toast.success('Developer updated successfully');
      setIsEditModalOpen(false);
      setSelectedDeveloper(null);
      fetchDevelopers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update developer');
      console.error('Error updating developer:', error);
    }
  };

  const handleDeleteDeveloper = async (developer: Developer) => {
    if (!window.confirm(`Are you sure you want to delete ${developer.name}?`)) {
      return;
    }

    try {
      await developerService.delete(developer._id);
      toast.success('Developer deleted successfully');
      fetchDevelopers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete developer');
      console.error('Error deleting developer:', error);
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Developers</h1>
          <p className="text-gray-600">Manage your development team</p>
        </div>
        <Button 
          onClick={() => setIsAddModalOpen(true)}
          variant="primary"
        >
          Add New Developer
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Developers
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Search by name or email..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'all' | 'Active' | 'Inactive')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Developers List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg">⏳</div>
          <p className="text-gray-600 mt-2">Loading developers...</p>
        </div>
      ) : filteredDevelopers.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg">👨‍💻</div>
          <p className="text-gray-600 mt-2">No developers found</p>
          <p className="text-gray-500 text-sm mt-1">Add your first developer to get started</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hourly Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDevelopers.map((developer) => (
                <tr key={developer._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{developer.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {developer.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {developer.role}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${developer.hourlyRate}/hr
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      developer.status === 'Active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {developer.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => openEditModal(developer)}
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteDeveloper(developer)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                  disabled={pagination.page === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: Math.min(pagination.pages, prev.page + 1) }))}
                  disabled={pagination.page === pagination.pages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
                    <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of{' '}
                    <span className="font-medium">{pagination.total}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                      disabled={pagination.page === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                      Previous
                    </button>
                    <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                      {pagination.page}
                    </span>
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, page: Math.min(pagination.pages, prev.page + 1) }))}
                      disabled={pagination.page === pagination.pages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
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
