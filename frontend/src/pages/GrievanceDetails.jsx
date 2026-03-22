import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { ArrowLeft, Clock, Paperclip, Send } from 'lucide-react';

const GrievanceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [grievance, setGrievance] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [replyText, setReplyText] = useState('');
  const [status, setStatus] = useState('Under Review');
  const [replyLoading, setReplyLoading] = useState(false);

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    try {
      const { data } = await api.get(`/grievances/${id}`);
      setGrievance(data.grievance);
      setStatus(data.grievance.status);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    setReplyLoading(true);

    try {
      await api.put(`/grievances/${id}/reply`, { reply: replyText, status });
      fetchDetail();
      setReplyText('');
    } catch (err) {
      console.error('Failed to submit reply', err);
    } finally {
      setReplyLoading(false);
    }
  };

  if (loading) return <div className="spinner" style={{ margin: '60px auto' }}></div>;
  if (!grievance) return <div className="container">Grievance not found.</div>;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Submitted': return 'badge badge-primary';
      case 'Under Review': return 'badge badge-warning';
      case 'Resolved': return 'badge badge-success';
      default: return 'badge';
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <button className="btn btn-ghost" onClick={() => navigate('/grievances')} style={{ marginBottom: '24px', padding: '8px 0' }}>
        <ArrowLeft size={18} /> Back to List
      </button>

      {/* Main Ticket */}
      <div className="card" style={{ padding: '32px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '12px' }}>{grievance.title}</h1>
            <div style={{ display: 'flex', gap: '16px', color: 'var(--text-muted)', fontSize: '13px', alignItems: 'center' }}>
              <span className={getStatusBadge(grievance.status)}>{grievance.status}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={14} /> {new Date(grievance.createdAt).toLocaleString()}
              </span>
              <span>Category: <b>{grievance.category}</b></span>
              <span>Priority: <b>{grievance.priority || 'Medium'}</b></span>
            </div>
          </div>
        </div>

        <div style={{ padding: '24px', background: 'var(--bg-main)', borderRadius: 'var(--radius-md)', fontSize: '15px', color: 'var(--text-main)', whiteSpace: 'pre-wrap' }}>
          {grievance.description}
        </div>

        {grievance.attachmentLink && (
          <div style={{ marginTop: '24px' }}>
            <a href={grievance.attachmentLink} target="_blank" rel="noreferrer" className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '13px', padding: '8px 16px' }}>
              <Paperclip size={16} /> View Attached File
            </a>
          </div>
        )}
      </div>

      {/* Thread */}
      <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Discussion Thread</h3>
      
      {grievance.teacherReply ? (
        <div className="card" style={{ padding: '24px', borderLeft: '4px solid var(--primary)', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>Administration / Faculty</span>
          </div>
          <div style={{ fontSize: '15px', color: 'var(--text-muted)' }}>{grievance.teacherReply}</div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', marginBottom: '24px', border: '1px solid var(--border)' }}>
          No replies yet.
        </div>
      )}

      {/* Teacher Action Box */}
      {user?.role === 'teacher' && (
        <div className="card" style={{ padding: '24px', background: 'var(--bg-card)' }}>
          <h4 style={{ fontWeight: 600, marginBottom: '16px' }}>{grievance.teacherReply ? 'Update Reply' : 'Submit Reply'}</h4>
          <form onSubmit={handleReplySubmit}>
            <div className="form-group">
              <textarea 
                className="form-input" 
                rows="4" 
                placeholder="Write your response to the student..." 
                value={replyText} 
                onChange={e => setReplyText(e.target.value)} 
                required 
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '14px', fontWeight: 500 }}>Update Status:</span>
                <select className="form-input" style={{ width: '160px', padding: '8px 12px' }} value={status} onChange={e => setStatus(e.target.value)}>
                  <option value="Under Review">Under Review</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>
              <button type="submit" className="btn btn-primary" disabled={replyLoading}>
                {replyLoading ? 'Sending...' : <><Send size={16} /> Send Reply</>}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default GrievanceDetails;
