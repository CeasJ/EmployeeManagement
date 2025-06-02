import React, { useState, useEffect } from 'react';
import { Search, Bell, User, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import Layout from '../layout/Layout';
import CreateEmployeeModal from '../modal/CreateEmployee';

const EmployeeManagement = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please sign in');
        navigate('/');
        return;
      }

      try {
        const response = await axios.get('http://localhost:5000/api/user/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setRole(response.data.role);
      } catch (error) {
        toast.error('Failed to fetch user profile');
        localStorage.removeItem('token');
        navigate('/');
      }
    };

    fetchUserProfile();
  }, [navigate]);

  useEffect(() => {
    if (role === 'Manager') {
      const fetchEmployees = async () => {
        const token = localStorage.getItem('token');
        try {
          const response = await axios.get('http://localhost:5000/api/employee/getEmployee', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setEmployees(response.data);
        } catch (error) {
          if (error.response?.status === 403) {
            toast.error('Access denied: Manager role required');
          } else {
            toast.error('Failed to fetch employees');
          }
        } finally {
          setLoading(false);
        }
      };

      fetchEmployees();
    } else if (role) {
      setLoading(false);
    }
  }, [role]);

  const handleEdit = (id) => {
    console.log('Edit employee', id);
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`http://localhost:5000/api/employee/deleteEmployee/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEmployees(employees.filter((emp) => emp.id !== id));
      toast.success('Employee deleted successfully');
    } catch (error) {
      toast.error('Failed to delete employee');
    }
  };

  const handleCreate = (newEmployee) => {
    setEmployees((prev) => [...prev, newEmployee]);
  };

  if (loading) {
    return <Layout><div className="p-8">Loading...</div></Layout>;
  }

  if (role !== 'Manager') {
    return <Layout><div className="p-8 text-gray-600">Access denied: This page is for Managers only.</div></Layout>;
  }

  return (
    <Layout>
      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Manage Employee</h1>
              <p className="text-gray-600">{employees.length} Employee</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setModalOpen(true)}
                className="px-4 py-2 bg-white border border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50 flex items-center space-x-2"
              >
                <span>+</span>
                <span>Create Employee</span>
              </button>
              <CreateEmployeeModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onCreate={handleCreate}
              />
              <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center space-x-2">
                <Filter className="w-4 h-4" />
                <span>Filter</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Employee Name</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {employees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{employee.name}</td>
                    <td className="px-6 py-4 text-sm text-blue-600">{employee.email}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {employee.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(employee.id)}
                          className="px-4 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(employee.id)}
                          className="px-4 py-2 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {employees.length === 0 && (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <div className="text-gray-400 mb-4">
                <User className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No employees found</h3>
              <p className="text-gray-600 mb-6">Get started by creating your first employee.</p>
              <button
                onClick={() => setModalOpen(true)}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Create Employee
              </button>
            </div>
          )}
        </div>
      </main>
    </Layout>
  );
};

export default EmployeeManagement;