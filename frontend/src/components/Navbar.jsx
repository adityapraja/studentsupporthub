import React, { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogOut, Home, MessageSquare, BookOpen, Users } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: <Home size={18} /> },
    { name: 'Grievances', path: '/grievances', icon: <MessageSquare size={18} /> },
    { name: 'Notes', path: '/notes', icon: <BookOpen size={18} /> },
  ];

  if (user?.role === 'student') {
    navLinks.push({ name: 'Alumni', path: '/alumni', icon: <Users size={18} /> });
  }

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={{
      position: 'fixed',
      top: 0, left: 0, right: 0,
      height: '70px',
      background: 'var(--bg-nav)',
      boxShadow: 'var(--shadow-sm)',
      display: 'flex',
      alignItems: 'center',
      zIndex: 100
    }}>
      <div className="container" style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        width: '100%' 
      }}>
        {/* Brand */}
        <Link to="/dashboard" style={{ 
          fontSize: '20px', 
          fontWeight: 800, 
          color: 'var(--text-main)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <div style={{
            width: '32px', height: '32px', 
            background: 'var(--primary)', 
            borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 'bold'
          }}>S</div>
          SupportHub
        </Link>

        {/* Links */}
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              to={link.path}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                color: isActive(link.path) ? 'var(--primary)' : 'var(--text-muted)',
                fontWeight: isActive(link.path) ? 600 : 500,
                fontSize: '15px'
              }}
            >
              {link.icon}
              {link.name}
            </Link>
          ))}
          
          <button 
            onClick={handleLogout}
            className="btn btn-ghost"
            style={{ padding: '6px 12px', marginLeft: '8px', color: 'var(--danger)' }}
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
