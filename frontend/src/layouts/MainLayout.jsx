import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

const MainLayout = () => {
  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="container animate-fade-in">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
