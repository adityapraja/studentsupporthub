import React from 'react';
import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, var(--primary-light) 0%, var(--bg-main) 100%)',
      padding: '24px'
    }}>
      <div className="animate-fade-in" style={{ width: '100%', maxWidth: '480px' }}>
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
