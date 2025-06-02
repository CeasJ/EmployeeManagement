import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Layout from './layout/Layout';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import App from './App';
import Navbar from './layout/Navbar';
import SignInPhone from './pages/SigninPhone';
import SignInEmail from './pages/SigninEmail';
import SignInGeneral from './pages/SigninGeneral';
import PhoneVerify from './pages/PhoneVerify';
import EmailVerify from './pages/EmailVerify';
import { ToastContainer } from 'react-toastify';



const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    
    <BrowserRouter>
    <ToastContainer position="top-right" autoClose={3000} />
   <Routes>
      <Route path="/" element={<SignInGeneral />} />
      <Route path="/signin-phone" element={<SignInPhone />} />
      <Route path="/email-verify" element={<EmailVerify />} />
      <Route path="/signin-email" element={<SignInEmail />} />
      <Route path="/phone-verify" element={<PhoneVerify />} />


      <Route
        path="/*"
        element={
          <>
            <Navbar />
            <Layout>
              <App />
            </Layout>
          </>
        }
      />
    </Routes>
   
  </BrowserRouter>,
      
  </React.StrictMode>
);

