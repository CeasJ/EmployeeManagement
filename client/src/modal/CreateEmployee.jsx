import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { v4 as uuidv4 } from 'uuid';

const CreateEmployeeModal = ({ isOpen, onClose, onCreate }) => {
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    email: '',
    userId: '',
    address: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.email || !formData.name) {
      toast.error('Email and name are required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error('Invalid email format');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please sign in');
      return;
    }

    if (!validateForm()) return;


    try {
      const response = await axios.post(
        'http://localhost:5000/api/employee/createEmployee',
        {
          email: formData.email,
          name: formData.name,
          phoneNumber: formData.phoneNumber || null,
          userId: formData.userId || null,
          address: formData.address || null
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      toast.success('Employee created successfully!');

      const tempId = uuidv4();
      onCreate({
        id: tempId,
        name: formData.name,
        email: formData.email,
        status: 'Inactive',
        phoneNumber: formData.phoneNumber || null,
        userId: formData.userId || null,
        address: formData.address || null
      });

      onClose();
      setFormData({ name: '', phoneNumber: '', email: '', userId: '', address: '' });
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create employee');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl p-8">
        <h2 className="text-xl font-semibold mb-6 text-center">Create New Employee</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-x-8 gap-y-6">
          <div className="flex flex-col">
            <label htmlFor="name" className="mb-1 font-medium text-gray-700">
              Employee Name
            </label>
            <input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="userId" className="mb-1 font-medium text-gray-700">
              User ID
            </label>
            <input
              id="userId"
              name="userId"
              value={formData.userId}
              onChange={handleChange}
              // placeholder=""
              className="border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="phoneNumber" className="mb-1 font-medium text-gray-700">
              Phone Number
            </label>
            <input
              id="phoneNumber"
              name="phoneNumber"
              type="tel"
              value={formData.phoneNumber}
              onChange={handleChange}
              // placeholder="+"
              className="border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="email" className="mb-1 font-medium text-gray-700">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="flex flex-col col-span-2">
            <label htmlFor="address" className="mb-1 font-medium text-gray-700">
              Address
            </label>
            <input
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="col-span-2 flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEmployeeModal;