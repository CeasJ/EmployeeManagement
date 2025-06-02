import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const Navbar = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) return null;

      if (!token || token === 'null' || token === 'undefined') {
        toast.error('No session found. Please sign in.');
        navigate('/');
        return;
      }

      try {
        const response = await axios.get('http://localhost:5000/api/user/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(response.data);
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

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
          </div>
          <div className="flex items-center">
            {user && (
              <span className="text-gray-700 mr-4">
                {user.userId || 'User'}
              </span>
            )}
            <button
              onClick={() => {
                localStorage.removeItem('token');
                localStorage.removeItem('userId');
                navigate('/');
              }}
              className="text-gray-600 hover:text-gray-800"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;