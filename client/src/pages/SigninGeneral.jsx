import React from 'react'
import { useNavigate } from 'react-router-dom'

const SignInGeneral = () => {

    const navigate = useNavigate();

    const handlePhone = () => { 
        navigate("/signin-phone");
    };

    const handleEmail = () => {
        navigate("/signin-email");
    };
  return (
   <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              Choose Role to Sign In
            </h1>
          </div>

    
          <div className="space-y-4">
            <button
              onClick={handlePhone}
              className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              You are a Manager
            </button>
            <button
              onClick={handleEmail}
              className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              You are an Employee
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignInGeneral