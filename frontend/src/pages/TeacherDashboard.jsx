import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { MessageSquare, Upload, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const TeacherDashboard = () => {
  const { user } = useContext(AuthContext);

  if (!user) return null;

  return (
    <>
      {/* Hero Section */}
      <div
        style={{
          padding: '40px',
          background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)',
          borderRadius: 'var(--radius-lg)',
          marginBottom: '32px'
        }}
      >
        <h1 style={{ fontSize: '32px', fontWeight: 800, color: 'white', marginBottom: '8px' }}>
          Welcome back, Prof. {user.name}
        </h1>
        <p style={{ color: 'var(--primary-light)', fontSize: '18px' }}>
          Teacher Dashboard
        </p>
        
        <div style={{ display: 'flex', gap: '24px', marginTop: '24px', flexWrap: 'wrap' }}>
          <div style={{ background: 'rgba(255,255,255,0.16)', color: 'white', padding: '12px 24px', borderRadius: 'var(--radius-md)', fontWeight: 600 }}>
            <span style={{ color: 'var(--primary-light)', fontSize: '13px', display: 'block' }}>Faculty ID</span>
            {user.collegeId}
          </div>
          <div style={{ background: 'rgba(255,255,255,0.16)', color: 'white', padding: '12px 24px', borderRadius: 'var(--radius-md)', fontWeight: 600 }}>
            <span style={{ color: 'var(--primary-light)', fontSize: '13px', display: 'block' }}>Department</span>
            INFT
          </div>
        </div>
      </div>

      {/* Grid Menu */}
      <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '20px' }}>Quick Actions</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        
        <Link to="/grievances" className="card" style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', padding: '32px' }}>
          <div style={{ width: '48px', height: '48px', background: 'var(--danger-light)', color: 'var(--danger)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
            <MessageSquare size={24} />
          </div>
          <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>Student Grievances</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px', flex: 1 }}>Review, update status, and reply to complaints raised by students.</p>
          <div style={{ color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>Manage Grievances <ArrowRight size={16} /></div>
        </Link>
        
        <Link to="/notes" className="card" style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', padding: '32px' }}>
          <div style={{ width: '48px', height: '48px', background: 'var(--success-light)', color: 'var(--success)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
            <Upload size={24} />
          </div>
          <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>Manage Notes</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px', flex: 1 }}>Upload new study materials, presentations, and guides for your classes.</p>
          <div style={{ color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>Upload Notes <ArrowRight size={16} /></div>
        </Link>

      </div>
    </>
  );
};

export default TeacherDashboard;
