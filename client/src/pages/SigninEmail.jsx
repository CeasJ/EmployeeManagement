import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const SignInEmail = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Email is required');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/auth/loginEmail', {
        email
      });
      toast.success('Verification code sent to your email');
      navigate('/email-verify', { state: { email } });
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to send verification code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  const handleSignUp = () => {
    console.log('Go to sign up');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <button 
          onClick={handleBack}
          className="flex items-center text-gray-600 hover:text-gray-800 mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          <span className="text-sm font-medium">Back</span>
        </button>

        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">Sign In</h1>
            <p className="text-gray-500 text-sm">
              Please enter your email to sign in
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSubmit(e);
                  }
                }}
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={!email || isLoading}
              className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Loading...
                </div>
              ) : (
                'Next'
              )}
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-gray-500 text-sm">
              passwordless authentication methods
            </p>
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-600 text-sm">
              Don't have an account?{' '}
              <button 
                onClick={handleSignUp}
                className="text-blue-500 hover:text-blue-600 font-medium transition-colors"
              >
                Sign up
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInEmail;