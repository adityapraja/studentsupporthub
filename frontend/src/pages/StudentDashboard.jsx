import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { MessageSquare, BookOpen, Users, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const StudentDashboard = () => {
  const { user } = useContext(AuthContext);

  if (!user) return null;

  return (
    <>
      {/* Hero Section */}
      <div style={{ padding: '40px', background: 'var(--primary-light)', borderRadius: 'var(--radius-lg)', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--primary-active)', marginBottom: '8px' }}>
          Welcome back, {user.name}!
        </h1>
        <p style={{ color: 'var(--primary-active)', fontSize: '18px', opacity: 0.8 }}>
          Here's your academic hub overview
        </p>
        
        <div style={{ display: 'flex', gap: '24px', marginTop: '24px', flexWrap: 'wrap' }}>
          <div style={{ background: 'white', padding: '12px 24px', borderRadius: 'var(--radius-md)', fontWeight: 600 }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '13px', display: 'block' }}>College ID</span>
            {user.collegeId}
          </div>
          <div style={{ background: 'white', padding: '12px 24px', borderRadius: 'var(--radius-md)', fontWeight: 600 }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '13px', display: 'block' }}>Department</span>
            INFT
          </div>
          <div style={{ background: 'white', padding: '12px 24px', borderRadius: 'var(--radius-md)', fontWeight: 600 }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '13px', display: 'block' }}>Semester</span>
            {user.semester}
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
          <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>Grievances</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px', flex: 1 }}>Submit and track your academic or facility complaints with administration.</p>
          <div style={{ color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>View Grievances <ArrowRight size={16} /></div>
        </Link>
        
        <Link to="/notes" className="card" style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', padding: '32px' }}>
          <div style={{ width: '48px', height: '48px', background: 'var(--warning-light)', color: 'var(--warning)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
            <BookOpen size={24} />
          </div>
          <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>Study Materials</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px', flex: 1 }}>Access lecture notes, past papers, and study guides uploaded by teachers & peers.</p>
          <div style={{ color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>Browse Notes <ArrowRight size={16} /></div>
        </Link>

        <Link to="/alumni" className="card" style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', padding: '32px' }}>
          <div style={{ width: '48px', height: '48px', background: 'var(--success-light)', color: 'var(--success)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
            <Users size={24} />
          </div>
          <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>Alumni Network</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px', flex: 1 }}>Connect with graduated seniors for career guidance, referrals, and networking.</p>
          <div style={{ color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>View Directory <ArrowRight size={16} /></div>
        </Link>

      </div>
    </>
  );
};

export default StudentDashboard;
