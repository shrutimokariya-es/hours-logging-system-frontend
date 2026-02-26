import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AddClientModal from '../components/clients/AddClientModal';
import EditClientModal from '../components/clients/EditClientModal';
import { clientService, Client, ClientFormData, ClientListResponse } from '../services/clientService';

const Clients: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'Active' | 'Inactive'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  const [loading, setLoading] = useState(false);

  const fetchClients = useCallback(async () => {
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

      const response: ClientListResponse = await clientService.getAll(params);
      setClients(response.clients);
      setPagination(response.pagination);
    } catch (error: any) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filterStatus, searchTerm]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (pagination.page === 1) {
        fetchClients();
      } else {
        setPagination(prev => ({ ...prev, page: 1 }));
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, fetchClients, pagination.page]);

  const handleAddClient = async (clientData: ClientFormData) => {
    try {
      await clientService.create(clientData);
      setIsAddModalOpen(false);
      fetchClients();
    } catch (error: any) {
      console.error('Error creating client:', error);
    }
  };

  const handleEditClient = async (clientData: Partial<ClientFormData>) => {
    if (!selectedClient) return;
    
    try {
      await clientService.update(selectedClient._id, clientData);
      setIsEditModalOpen(false);
      setSelectedClient(null);
      fetchClients();
    } catch (error: any) {
      console.error('Error updating client:', error);
    }
  };

  const handleDeleteClient = async (client: Client) => {
    if (!window.confirm(`Are you sure you want to delete ${client.name}?`)) {
      return;
    }

    try {
      await clientService.delete(client._id);
      fetchClients();
    } catch (error: any) {
      console.error('Error deleting client:', error);
    }
  };

  const openEditModal = (client: Client) => {
    setSelectedClient(client);
    setIsEditModalOpen(true);
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch = !searchTerm || 
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.companyEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || client.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg shadow-lg p-6 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Clients</h1>
            <p className="text-purple-100 mt-1">Manage your client portfolio</p>
            <div className="flex items-center space-x-4 mt-3">
              <div className="flex items-center space-x-2">
                <div className="bg-white bg-opacity-20 rounded-full p-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                  </svg>
                </div>
                <div>
                  <div className="text-2xl font-bold">{pagination.total}</div>
                  <div className="text-xs text-purple-100">Total Clients</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="bg-white bg-opacity-20 rounded-full p-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <div className="text-2xl font-bold">{clients.filter(c => c.status === 'Active').length}</div>
                  <div className="text-xs text-purple-100">Active</div>
                </div>
              </div>
            </div>
          </div>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-white text-purple-600 hover:bg-purple-50 px-6 py-3 rounded-lg font-semibold shadow-md transform hover:scale-105 transition-all duration-200 flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Add New Client</span>
          </button>
        </div>
      </div>

      {/* Filters with improved design */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              🔍 Search Clients
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm"
              placeholder="Search by name or email..."
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              📊 Filter by Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'all' | 'Active' | 'Inactive')}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm"
            >
              <option value="all">All Clients</option>
              <option value="Active">Active Only</option>
              <option value="Inactive">Inactive Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Clients List with cards */}
      {loading ? (
        <div className="text-center py-16 bg-white rounded-lg shadow-md">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="text-gray-600 mt-4 font-medium">Loading clients...</p>
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg shadow-md border-2 border-dashed border-gray-300">
          <div className="text-6xl mb-4">👥</div>
          <p className="text-gray-600 text-lg font-medium">No clients found</p>
          <p className="text-gray-500 text-sm mt-2">Add your first client to get started</p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="mt-4 bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Add Client
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Client Info
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Billing
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredClients.map((client) => (
                  <tr 
                    key={client._id} 
                    className="hover:bg-purple-50 cursor-pointer transition-colors duration-150" 
                    onClick={() => navigate(`/clients/${client._id}`)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
                          {client.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-semibold text-gray-900">{client.name}</div>
                          <div className="text-xs text-gray-500">ID: {client._id.slice(-6)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{client.companyEmail}</div>
                      <div className="text-xs text-gray-500">📧 Email</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        client.billingType === 'Hourly' 
                          ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                          : 'bg-purple-100 text-purple-800 border border-purple-200'
                      }`}>
                        {client.billingType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        client.status === 'Active' 
                          ? 'bg-green-100 text-green-800 border border-green-200' 
                          : 'bg-red-100 text-red-800 border border-red-200'
                      }`}>
                        {client.status === 'Active' ? '✓ Active' : '✗ Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(client.createdAt).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditModal(client);
                        }}
                        className="text-indigo-600 hover:text-indigo-900 mr-4 font-semibold"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClient(client);
                        }}
                        className="text-red-600 hover:text-red-900 font-semibold"
                      >
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Enhanced Pagination */}
          {pagination.pages > 1 && (
            <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                  disabled={pagination.page === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: Math.min(pagination.pages, prev.page + 1) }))}
                  disabled={pagination.page === pagination.pages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700 font-medium">
                    Showing <span className="font-bold text-purple-600">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
                    <span className="font-bold text-purple-600">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of{' '}
                    <span className="font-bold text-purple-600">{pagination.total}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                      disabled={pagination.page === 1}
                      className="relative inline-flex items-center px-3 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      ← Previous
                    </button>
                    <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-purple-50 text-sm font-bold text-purple-600">
                      Page {pagination.page} of {pagination.pages}
                    </span>
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, page: Math.min(pagination.pages, prev.page + 1) }))}
                      disabled={pagination.page === pagination.pages}
                      className="relative inline-flex items-center px-3 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Next →
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <AddClientModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddClient={handleAddClient}
      />
      
      {selectedClient && (
        <EditClientModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedClient(null);
          }}
          onEditClient={handleEditClient}
          client={selectedClient}
        />
      )}
    </div>
  );
};

export default Clients;
