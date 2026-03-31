import React, { useContext, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';

// Layouts
import AuthLayout from './layouts/AuthLayout';
import MainLayout from './layouts/MainLayout';

// Pages
// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import OTPVerification from './pages/OTPVerification';
import Dashboard from './pages/Dashboard';
import Grievances from './pages/Grievances';
import GrievanceDetails from './pages/GrievanceDetails';
import Notes from './pages/Notes';
import Alumni from './pages/Alumni';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useContext(AuthContext);
  
  if (!user) return <Navigate to="/" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

const PublicRoute = ({ children }) => {
  const { user } = useContext(AuthContext);
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
};

const RouteTitleManager = () => {
  const location = useLocation();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const appName = 'Student Support Hub';
    let pageTitle = appName;

    if (location.pathname === '/') {
      pageTitle = `Login | ${appName}`;
    } else if (location.pathname === '/register') {
      pageTitle = `Register | ${appName}`;
    } else if (location.pathname === '/otp') {
      pageTitle = `OTP Verification | ${appName}`;
    } else if (location.pathname === '/dashboard') {
      pageTitle = user?.role === 'teacher'
        ? `Teacher Dashboard | ${appName}`
        : `Student Dashboard | ${appName}`;
    } else if (location.pathname === '/grievances') {
      pageTitle = `Grievances | ${appName}`;
    } else if (location.pathname.startsWith('/grievances/')) {
      pageTitle = `Grievance Details | ${appName}`;
    } else if (location.pathname === '/notes') {
      pageTitle = `Notes | ${appName}`;
    } else if (location.pathname === '/alumni') {
      pageTitle = `Alumni | ${appName}`;
    }

    document.title = pageTitle;
  }, [location.pathname, user?.role]);

  return null;
};

function App() {
  return (
    <BrowserRouter>
      <RouteTitleManager />
      <Routes>
        {/* Public Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/otp" element={<PublicRoute><OTPVerification /></PublicRoute>} />
        </Route>

        {/* Protected Routes */}
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/grievances" element={
            <ProtectedRoute>
              <Grievances />
            </ProtectedRoute>
          } />

          <Route path="/grievances/:id" element={
            <ProtectedRoute>
              <GrievanceDetails />
            </ProtectedRoute>
          } />
          
          <Route path="/notes" element={
            <ProtectedRoute>
              <Notes />
            </ProtectedRoute>
          } />
          
          <Route path="/alumni" element={
            <ProtectedRoute allowedRoles={['student']}>
              <Alumni />
            </ProtectedRoute>
          } />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
