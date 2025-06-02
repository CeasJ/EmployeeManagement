import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const SideMenu = () => {
  const [role, setRole] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Determine active tab based on current pathname
  const getActiveTab = (pathname) => {
    switch (pathname) {
      case '/employees':
        return 'Manage Employee';
      case '/manage-task':
        return 'Manage Task';
      case '/message':
        return 'Message';
      default:
        return 'Manage Task'; // Default tab
    }
  };

  const [activeTab, setActiveTab] = useState(getActiveTab(location.pathname));

  // Update activeTab when the pathname changes
  useEffect(() => {
    setActiveTab(getActiveTab(location.pathname));
  }, [location.pathname]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token || token === 'null' || token === 'undefined') {
        toast.error('No session found. Please sign in.');
        navigate('/');
        return;
      }

      try {
        const response = await axios.get('http://localhost:5000/api/user/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setRole(response.data.role);
      } catch (error) {
        const errorData = error.response?.data || { error: error.message };
        if (error.response?.status === 403) {
          toast.error('Access denied: Manager role required');
        } else if (error.response?.status === 401) {
          toast.error('Session expired. Please sign in again.');
          if (errorData.error === 'Token expired') {
            localStorage.removeItem('token');
          }
          navigate('/');
        } else {
          toast.error('Failed to fetch user profile');
          navigate('/');
        }
      }
    };

    fetchUserProfile();
  }, [navigate]);

  if (!role) {
    return <div className="w-64 bg-white shadow-sm min-h-screen p-4">Loading...</div>;
  }

  return (
    <aside className="w-64 bg-white shadow-sm min-h-screen">
      <nav className="p-4">
        <ul className="space-y-2">
          {role === 'Manager' && (
            <li>
              <Link to="/employees">
                <button
                  className={`w-full text-left px-4 py-3 rounded-lg font-medium ${
                    activeTab === 'Manage Employee'
                      ? 'bg-blue-100 text-blue-700 border-r-4 border-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Manage Employee
                </button>
              </Link>
            </li>
          )}
          <li>
            <Link to="/manage-task">
              <button
                className={`w-full text-left px-4 py-3 rounded-lg font-medium ${
                  activeTab === 'Manage Task'
                    ? 'bg-blue-100 text-blue-700 border-r-4 border-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Manage Task
              </button>
            </Link>
          </li>
          <li>
            <Link to="/message">
              <button
                className={`w-full text-left px-4 py-3 rounded-lg font-medium ${
                  activeTab === 'Message'
                    ? 'bg-blue-100 text-blue-700 border-r-4 border-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Message
                </button>
              </Link>
            </li>
          </ul>
        </nav>
      </aside>
    );
};

export default SideMenu;