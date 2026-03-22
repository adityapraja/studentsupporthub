import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Mail, Lock, UserCircle, GraduationCap } from 'lucide-react';
import api from '../services/api';

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [role, setRole] = useState('student');
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await api.post('/auth/login', { ...formData, role });
      login(data.user, data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ padding: '48px 40px', textAlign: 'center' }}>
      <h1 style={{ marginBottom: '32px', fontSize: '24px', fontWeight: 800 }}>
        STUDENT SUPPORT HUB
      </h1>

      <div style={{ display: 'flex', background: 'var(--gray-100)', borderRadius: 'var(--radius-md)', padding: '4px', marginBottom: '32px' }}>
        <button 
          type="button"
          onClick={() => setRole('student')}
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
          type="button"
          onClick={() => setRole('teacher')}
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

      <form onSubmit={handleLogin} style={{ textAlign: 'left' }}>
        <div className="form-group">
          <label className="form-label">Email</label>
          <div style={{ position: 'relative' }}>
            <Mail size={18} style={{ position: 'absolute', left: '16px', top: '14px', color: 'var(--text-muted)' }} />
            <input 
              type="email" 
              className="form-input" 
              style={{ paddingLeft: '44px' }}
              placeholder="Enter your email" 
              value={formData.email} 
              onChange={e => setFormData({...formData, email: e.target.value})} 
              required 
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Password</label>
          <div style={{ position: 'relative' }}>
            <Lock size={18} style={{ position: 'absolute', left: '16px', top: '14px', color: 'var(--text-muted)' }} />
            <input 
              type="password" 
              className="form-input" 
              style={{ paddingLeft: '44px' }}
              placeholder="Enter your password" 
              value={formData.password} 
              onChange={e => setFormData({...formData, password: e.target.value})} 
              required 
            />
          </div>
        </div>

        <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }} disabled={loading}>
          {loading ? 'LOGGING IN...' : 'LOGIN'}
        </button>
      </form>

      <p style={{ marginTop: '24px', fontSize: '14px', color: 'var(--text-muted)' }}>
        Don't have an Account? <Link to="/register" style={{ fontWeight: 600 }}>Register Here</Link>
      </p>
    </div>
  );
};

export default Login;
