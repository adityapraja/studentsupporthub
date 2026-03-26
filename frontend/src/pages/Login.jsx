import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail } from 'lucide-react';
import api from '../services/api';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    const email = formData.email?.trim();
    if (!email) return setError('Please enter your email');

    setError('');
    setLoading(true);
    try {
      // Password login is replaced by OTP flow:
      // 1) Send OTP to the email
      // 2) Navigate to /otp for verification
      await api.post('/auth/resend-otp', { email });
      localStorage.setItem('pendingEmail', email.toLowerCase());
      navigate('/otp');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ padding: '48px 40px', textAlign: 'center' }}>
      <h1 style={{ marginBottom: '32px', fontSize: '24px', fontWeight: 800 }}>
        STUDENT SUPPORT HUB
      </h1>

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

        <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }} disabled={loading}>
          {loading ? 'SENDING OTP...' : 'LOGIN'}
        </button>
      </form>

      <p style={{ marginTop: '24px', fontSize: '14px', color: 'var(--text-muted)' }}>
        Don't have an Account? <Link to="/register" style={{ fontWeight: 600 }}>Register Here</Link>
      </p>
    </div>
  );
};

export default Login;
