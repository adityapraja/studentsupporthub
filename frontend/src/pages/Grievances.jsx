import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Plus, Filter, MessageSquareWarning } from 'lucide-react';

const Grievances = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Submit Form State
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', category: 'Academics', priority: 'Medium', description: '' });
  const [file, setFile] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');

  // Filters (for teachers)
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  useEffect(() => {
    fetchGrievances();
  }, []);

  const fetchGrievances = async () => {
    try {
      const { data } = await api.get('/grievances');
      setGrievances(data.grievances || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setError('');

    const formPayload = new FormData();
    formPayload.append('title', formData.title);
    formPayload.append('category', formData.category);
    formPayload.append('priority', formData.priority);
    formPayload.append('description', formData.description);
    if (file) formPayload.append('attachment', file);

    try {
      await api.post('/grievances', formPayload);
      setShowForm(false);
      setFormData({ title: '', category: 'Academics', priority: 'Medium', description: '' });
      setFile(null);
      fetchGrievances();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit grievance');
    } finally {
      setSubmitLoading(false);
    }
  };

  const filteredGrievances = grievances.filter(g => {
    if (filterStatus && g.status !== filterStatus) return false;
    if (filterCategory && g.category !== filterCategory) return false;
    return true;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Submitted': return 'badge badge-primary';
      case 'Under Review': return 'badge badge-warning';
      case 'Resolved': return 'badge badge-success';
      default: return 'badge';
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800 }}>Grievances</h1>
          <p style={{ color: 'var(--text-muted)' }}>{user?.role === 'student' ? 'Track and submit your academic complaints' : 'Manage student complaints'}</p>
        </div>
        
        {user?.role === 'student' && (
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            <Plus size={18} /> New Complaint
          </button>
        )}
      </div>

      {/* Student Submit Form */}
      {showForm && user?.role === 'student' && (
        <div className="card animate-fade-in" style={{ marginBottom: '32px', borderTop: '4px solid var(--primary)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>Submit a Grievance</h2>
          {error && <div style={{ background: 'var(--danger-light)', color: 'var(--danger)', padding: '12px', borderRadius: 'var(--radius-sm)', marginBottom: '16px' }}>{error}</div>}
          
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Subject Title</label>
              <input type="text" className="form-input" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required placeholder="Short description of the issue" />
            </div>
            
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-input" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                <option value="Academics">Academics</option>
                <option value="Facilities">Facilities</option>
                <option value="Administration">Administration</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Priority Level</label>
              <select className="form-input" value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})}>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Detailed Description</label>
              <textarea className="form-input" rows="4" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required placeholder="Provide full details here" />
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Attachment (Optional PDF/Image)</label>
              <input type="file" className="form-input" style={{ padding: '8px' }} onChange={handleFileChange} />
            </div>

            <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={submitLoading}>{submitLoading ? 'Submitting...' : 'Submit Complaint'}</button>
            </div>
          </form>
        </div>
      )}

      {/* Teacher Filters */}
      {user?.role === 'teacher' && (
        <div className="card" style={{ display: 'flex', gap: '16px', marginBottom: '24px', alignItems: 'center' }}>
          <Filter size={20} color="var(--text-muted)" />
          <select className="form-input" style={{ width: '200px' }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="Submitted">Submitted</option>
            <option value="Under Review">Under Review</option>
            <option value="Resolved">Resolved</option>
          </select>
          <select className="form-input" style={{ width: '200px' }} value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
            <option value="">All Categories</option>
            <option value="Academics">Academics</option>
            <option value="Facilities">Facilities</option>
            <option value="Administration">Administration</option>
          </select>
        </div>
      )}

      {/* Grievances List */}
      <div>
        {loading ? (
          <div className="spinner" style={{ margin: '40px auto' }}></div>
        ) : filteredGrievances.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border)' }}>
            <MessageSquareWarning size={48} color="var(--gray-300)" style={{ marginBottom: '16px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-main)' }}>No Grievances Found</h3>
            <p style={{ color: 'var(--text-muted)' }}>{user?.role === 'student' ? 'You have not submitted any complaints yet.' : 'There are no active complaints matching your filters.'}</p>
          </div>
        ) : (
          filteredGrievances.map(g => (
            <div 
              key={g._id} 
              className="card" 
              style={{ cursor: 'pointer' }}
              onClick={() => navigate(`/grievances/${g._id}`)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>{g.title}</h3>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <span>{new Date(g.createdAt).toLocaleDateString()}</span>
                    <span>&bull;</span>
                    <span>{g.category}</span>
                    <span>&bull;</span>
                    <span style={{ color: g.priority === 'High' ? 'var(--danger)' : g.priority === 'Low' ? 'var(--success)' : 'var(--warning)', fontWeight: 600 }}>
                      {g.priority || 'Medium'} Priority
                    </span>
                  </div>
                </div>
                <span className={getStatusBadge(g.status)}>{g.status}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Grievances;
