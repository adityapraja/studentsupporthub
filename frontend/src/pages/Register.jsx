import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, UserCircle } from 'lucide-react';
import api from '../services/api';

const Register = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('student');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '', email: '', collegeId: '', 
    semester: 'I', phone: '', 
    password: '', confirmPassword: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }
    
    setError('');
    setLoading(true);

    try {
      await api.post('/auth/register', { ...formData, role });
      localStorage.setItem('pendingEmail', formData.email);
      navigate('/otp');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ padding: '48px 40px', margin: '40px 0' }}>
      <h1 style={{ marginBottom: '32px', fontSize: '24px', fontWeight: 800, textAlign: 'center' }}>
        CREATE ACCOUNT
      </h1>

      <div style={{ display: 'flex', background: 'var(--gray-100)', borderRadius: 'var(--radius-md)', padding: '4px', marginBottom: '32px' }}>
        <button 
          type="button" onClick={() => setRole('student')}
          style={{
            flex: 1, padding: '10px 0', border: 'none', background: role === 'student' ? 'white' : 'transparent',
            borderRadius: 'var(--radius-sm)', fontWeight: 600, fontSize: '14px', 
            color: role === 'student' ? 'var(--text-main)' : 'var(--text-muted)',
            boxShadow: role === 'student' ? 'var(--shadow-sm)' : 'none', cursor: 'pointer', transition: 'all 0.2s',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
          }}
        >
          <GraduationCap size={18} /> Student
        </button>
        <button 
          type="button" onClick={() => setRole('teacher')}
          style={{
            flex: 1, padding: '10px 0', border: 'none', background: role === 'teacher' ? 'white' : 'transparent',
            borderRadius: 'var(--radius-sm)', fontWeight: 600, fontSize: '14px',
            color: role === 'teacher' ? 'var(--text-main)' : 'var(--text-muted)',
            boxShadow: role === 'teacher' ? 'var(--shadow-sm)' : 'none', cursor: 'pointer', transition: 'all 0.2s',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
          }}
        >
          <UserCircle size={18} /> Teacher
        </button>
      </div>

      {error && <div style={{ background: 'var(--danger-light)', color: 'var(--danger)', padding: '12px', borderRadius: 'var(--radius-sm)', marginBottom: '24px', fontSize: '14px' }}>{error}</div>}

      <form onSubmit={handleRegister}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Full Name</label>
            <input type="text" className="form-input" name="name" value={formData.name} onChange={handleChange} required placeholder="Enter full name" />
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" className="form-input" name="email" value={formData.email} onChange={handleChange} required placeholder="Enter college email" />
          </div>

          <div className="form-group">
            <label className="form-label">College ID</label>
            <input type="text" className="form-input" name="collegeId" value={formData.collegeId} onChange={handleChange} required placeholder="Enter ID" />
          </div>

          {role === 'student' && (
            <div className="form-group">
              <label className="form-label">Semester</label>
              <select className="form-input" name="semester" value={formData.semester} onChange={handleChange}>
                {['I','II','III','IV','V','VI','VII','VIII'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          )}

          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Phone Number</label>
            <input type="tel" className="form-input" name="phone" value={formData.phone} onChange={handleChange} required placeholder="Enter phone" />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input type="password" className="form-input" name="password" value={formData.password} onChange={handleChange} required minLength={6} placeholder="Password" />
          </div>

          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input type="password" className="form-input" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required minLength={6} placeholder="Confirm" />
          </div>
        </div>

        <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '16px' }} disabled={loading}>
          {loading ? 'REGISTERING...' : 'REGISTER'}
        </button>
      </form>

      <p style={{ marginTop: '24px', fontSize: '14px', color: 'var(--text-muted)', textAlign: 'center' }}>
        Already have an account? <Link to="/" style={{ fontWeight: 600 }}>Login Here</Link>
      </p>
    </div>
  );
};

export default Register;
