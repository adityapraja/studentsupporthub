import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Search, Download, FileText, Upload } from 'lucide-react';

const Notes = () => {
  const { user } = useContext(AuthContext);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Upload state
  const [showUpload, setShowUpload] = useState(false);
  const [file, setFile] = useState(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadLoading, setUploadLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const { data } = await api.get('/notes');
      setNotes(data.notes || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return setError('Please select a file');
    
    setUploadLoading(true);
    setError('');

    const form = new FormData();
    form.append('title', uploadTitle);
    form.append('file', file);

    try {
      await api.post('/notes', form);
      setShowUpload(false);
      setFile(null);
      setUploadTitle('');
      fetchNotes();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to upload note');
    } finally {
      setUploadLoading(false);
    }
  };

  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    n.uploadedBy?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800 }}>Study Resources</h1>
          <p style={{ color: 'var(--text-muted)' }}>Browse study materials uploaded by faculty and students.</p>
        </div>
        
        {user?.role === 'teacher' && (
          <button className="btn btn-primary" onClick={() => setShowUpload(!showUpload)}>
            <Upload size={18} /> Upload Material
          </button>
        )}
      </div>

      {showUpload && user?.role === 'teacher' && (
        <div className="card animate-fade-in" style={{ marginBottom: '32px', borderTop: '4px solid var(--primary)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>Upload New Resource</h2>
          {error && <div style={{ background: 'var(--danger-light)', color: 'var(--danger)', padding: '12px', borderRadius: 'var(--radius-sm)', marginBottom: '16px' }}>{error}</div>}
          
          <form onSubmit={handleUpload} style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
            <div className="form-group">
              <label className="form-label">Resource Title</label>
              <input type="text" className="form-input" value={uploadTitle} onChange={e => setUploadTitle(e.target.value)} required placeholder="e.g. Chapter 4: Data Structures" />
            </div>
            
            <div className="form-group">
              <label className="form-label">Document (PDF/Doc/PPT)</label>
              <input type="file" className="form-input" style={{ padding: '8px' }} onChange={e => setFile(e.target.files[0])} required />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button type="button" className="btn btn-ghost" onClick={() => setShowUpload(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={uploadLoading}>{uploadLoading ? 'Uploading...' : 'Upload File'}</button>
            </div>
          </form>
        </div>
      )}

      {/* Search Bar */}
      <div style={{ position: 'relative', marginBottom: '32px', maxWidth: '500px' }}>
        <Search size={20} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '12px' }} />
        <input 
          type="text" 
          className="form-input" 
          placeholder="Search materials by title or author..." 
          style={{ paddingLeft: '48px' }}
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Notes Grid */}
      {loading ? (
        <div className="spinner" style={{ margin: '40px auto' }}></div>
      ) : filteredNotes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)' }}>
          <p style={{ color: 'var(--text-muted)' }}>No study materials found.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
          {filteredNotes.map(n => (
            <div key={n._id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                <div style={{ width: '48px', height: '48px', background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <FileText size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-main)', lineHeight: '1.4' }}>{n.title}</h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>By: {n.uploadedBy?.name || 'Unknown'}</p>
                  <p style={{ fontSize: '13px', color: 'var(--text-light)' }}>{new Date(n.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <a 
                href={n.link} 
                target="_blank" 
                rel="noreferrer" 
                className="btn btn-primary" 
                style={{ marginTop: 'auto', width: '100%' }}
              >
                <Download size={16} /> Download
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notes;
