import React, { useState } from 'react';
import { ClientFormData } from '../../services/clientService';
import { Button, FormInput, FormTextArea } from '../common';

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddClient: (client: ClientFormData) => Promise<void>;
}

const AddClientModal: React.FC<AddClientModalProps> = ({ isOpen, onClose, onAddClient }) => {
  const [formData, setFormData] = useState<ClientFormData>({
    name: '',
    companyEmail: '',
    billingType: 'Hourly',
    status: 'Active'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Client name is required';
    }

    if (!formData.companyEmail.trim()) {
      newErrors.companyEmail = 'Company email is required';
    } else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(formData.companyEmail)) {
      newErrors.companyEmail = 'Please enter a valid email';
    }

    if (!formData.billingType) {
      newErrors.billingType = 'Billing type is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const isValid = validateForm();
    if (!isValid) {
      return;
    }

    onAddClient(formData);
  };
const closeFunc = () => {
  onClose();
  setFormData({
    name: '',
    companyEmail: '',
    billingType: 'Hourly',
    status: 'Active'
  });
  setErrors({});
}
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={closeFunc}></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="mb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Add New Client
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Create a new client for your business
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Client Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm ${
                      errors.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter client name"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="companyEmail" className="block text-sm font-medium text-gray-700">
                    Company Email *
                  </label>
                  <input
                    type="email"
                    name="companyEmail"
                    id="companyEmail"
                    value={formData.companyEmail}
                    onChange={handleChange}
                    className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm ${
                      errors.companyEmail ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter company email"
                  />
                  {errors.companyEmail && (
                    <p className="mt-1 text-sm text-red-600">{errors.companyEmail}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="billingType" className="block text-sm font-medium text-gray-700">
                    Billing Type *
                  </label>
                  <select
                    name="billingType"
                    id="billingType"
                    value={formData.billingType}
                    onChange={handleChange}
                    className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm ${
                      errors.billingType ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="Hourly">Hourly</option>
                    <option value="Fixed">Fixed</option>
                  </select>
                  {errors.billingType && (
                    <p className="mt-1 text-sm text-red-600">{errors.billingType}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                    Status *
                  </label>
                  <select
                    name="status"
                    id="status"
                    value={formData.status}
                    onChange={handleChange}
                    className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm ${
                      errors.status ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                  {errors.status && (
                    <p className="mt-1 text-sm text-red-600">{errors.status}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Add Client
              </button>
              <button
                type="button"
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                onClick={closeFunc}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddClientModal;
