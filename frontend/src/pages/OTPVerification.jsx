import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const OTPVerification = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(30);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const email = localStorage.getItem('pendingEmail');

  useEffect(() => {
    if (!email) {
      navigate('/register');
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [email, navigate]);

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return;
    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    // Focus next input
    if (element.nextSibling && element.value) {
      element.nextSibling.focus();
    }
  };

  const handleBackspace = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && e.target.previousSibling) {
      e.target.previousSibling.focus();
    }
  };

  const handleVerify = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) return setError('Please enter a valid 6-digit OTP');

    setError('');
    setLoading(true);

    try {
      const { data } = await api.post('/auth/verify-otp', { email, otp: otpString });
      localStorage.removeItem('pendingEmail');
      login(data.user, data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const resendOTP = async () => {
    if (timeLeft > 0) return;
    try {
      await api.post('/auth/resend-otp', { email });
      setTimeLeft(30);
      setError('');
    } catch (err) {
      setError('Failed to resend OTP');
    }
  };

  return (
    <div className="card" style={{ padding: '48px 40px', textAlign: 'center' }}>
      <h1 style={{ marginBottom: '8px', fontSize: '24px', fontWeight: 800 }}>
        STUDENT SUPPORT HUB
      </h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>
        Enter OTP sent to <b>{email}</b>
      </p>

      {error && <div style={{ background: 'var(--danger-light)', color: 'var(--danger)', padding: '12px', borderRadius: 'var(--radius-sm)', marginBottom: '24px', fontSize: '14px' }}>{error}</div>}

      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '32px' }}>
        {otp.map((digit, index) => (
          <input
            key={index}
            type="text"
            maxLength="1"
            value={digit}
            onChange={e => handleChange(e.target, index)}
            onKeyDown={e => handleBackspace(e, index)}
            onFocus={e => e.target.select()}
            style={{
              width: '48px', height: '56px',
              fontSize: '24px', fontWeight: 'bold', textAlign: 'center',
              border: '2px solid var(--border)', borderRadius: 'var(--radius-md)',
              outline: 'none', transition: 'border-color 0.2s', background: 'var(--bg-main)'
            }}
            onFocusCapture={e => e.target.style.borderColor = 'var(--primary)'}
            onBlurCapture={e => e.target.style.borderColor = 'var(--border)'}
          />
        ))}
      </div>

      <button onClick={handleVerify} className="btn btn-primary" style={{ width: '100%', marginBottom: '24px' }} disabled={loading}>
        {loading ? 'VERIFYING...' : 'VERIFY'}
      </button>

      <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
        {timeLeft > 0 ? (
          `Didn't receive OTP? You can request again in ${timeLeft} seconds`
        ) : (
          <span>Didn't receive OTP? <button onClick={resendOTP} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer' }}>Request again</button></span>
        )}
      </p>
    </div>
  );
};

export default OTPVerification;
