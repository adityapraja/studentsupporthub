import React from 'react';
import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div className="auth-shell">
      <div className="auth-content animate-fade-in">
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
