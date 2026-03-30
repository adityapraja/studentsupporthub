import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Search, Download, FileText, Upload } from 'lucide-react';

const SEM_IV_SUBJECTS = [
  'Applied mathematics-II',
  'Operating System',
  'Computer Network & Network Design',
  'Microprocessor and Microcontroller.',
  'Management Skills.',
  'Programming Paradigm',
  'Design Thinking'
];

const Notes = () => {
  const { user } = useContext(AuthContext);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Upload state
  const [showUpload, setShowUpload] = useState(false);
  const [file, setFile] = useState(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadSubject, setUploadSubject] = useState('');
  const [uploadSemester, setUploadSemester] = useState('');
  const [uploadTags, setUploadTags] = useState('');
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
    form.append('subject', uploadSubject);
    if (uploadSemester) form.append('semester', uploadSemester);
    if (uploadTags) form.append('tags', uploadTags);
    form.append('file', file);

    try {
      await api.post('/notes', form);
      setShowUpload(false);
      setFile(null);
      setUploadTitle('');
      setUploadSubject('');
      setUploadSemester('');
      setUploadTags('');
      fetchNotes();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to upload note');
    } finally {
      setUploadLoading(false);
    }
  };

  const filteredNotes = notes.filter(n =>
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.uploadedBy?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.subject?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedNotes = filteredNotes.reduce((groups, note) => {
    const subject = note.subject?.trim() || 'Uncategorized';
    if (!groups[subject]) groups[subject] = [];
    groups[subject].push(note);
    return groups;
  }, {});

  const sortedSubjects = Object.keys(groupedNotes).sort((a, b) => {
    const aIndex = SEM_IV_SUBJECTS.indexOf(a);
    const bIndex = SEM_IV_SUBJECTS.indexOf(b);

    const aInList = aIndex !== -1;
    const bInList = bIndex !== -1;

    if (aInList && bInList) return aIndex - bIndex;
    if (aInList) return -1;
    if (bInList) return 1;
    return a.localeCompare(b);
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800 }}>Study Resources</h1>
          <p style={{ color: 'var(--text-muted)' }}>Browse study materials uploaded by faculty and students.</p>
        </div>

        <button className="btn btn-primary" onClick={() => setShowUpload(!showUpload)}>
          <Upload size={18} /> Upload Material
        </button>
      </div>

      {showUpload && (
        <div className="card animate-fade-in" style={{ marginBottom: '32px', backgroundColor: 'white' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '30px' }}>Upload Notes</h2>
          {error && <div style={{ background: 'var(--danger-light)', color: 'var(--danger)', padding: '12px', borderRadius: 'var(--radius-sm)', marginBottom: '16px' }}>{error}</div>}

          <form onSubmit={handleUpload} style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600 }}>Title</label>
              <input type="text" className="form-input" style={{ backgroundColor: '#ccc', border: 'none', padding: '12px', borderRadius: '8px' }} value={uploadTitle} onChange={e => setUploadTitle(e.target.value)} required />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600 }}>Subject</label>
                <select
                  className="form-input"
                  style={{ backgroundColor: '#ccc', border: 'none', padding: '12px', borderRadius: '8px' }}
                  value={uploadSubject}
                  onChange={e => setUploadSubject(e.target.value)}
                  required
                >
                  <option value="" disabled>Select Semester IV subject</option>
                  {SEM_IV_SUBJECTS.map((subject) => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600 }}>Semester</label>
                <input type="text" className="form-input" style={{ backgroundColor: '#ccc', border: 'none', padding: '12px', borderRadius: '8px' }} value={uploadSemester} onChange={e => setUploadSemester(e.target.value)} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600 }}>Tags</label>
              <input type="text" className="form-input" style={{ backgroundColor: '#ccc', border: 'none', padding: '12px', borderRadius: '8px' }} value={uploadTags} onChange={e => setUploadTags(e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600 }}>Attach a file</label>
              <input type="file" className="form-input" style={{ backgroundColor: '#ccc', border: 'none', padding: '8px', borderRadius: '8px' }} onChange={e => setFile(e.target.files[0])} required />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '10px' }}>
              <button type="submit" style={{ backgroundColor: '#555', color: 'white', padding: '10px 24px', borderRadius: '8px', border: 'none', fontWeight: 600, cursor: 'pointer' }} disabled={uploadLoading}>
                {uploadLoading ? 'UPLOADING...' : 'UPLOAD'}
              </button>
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

      {/* Notes by Subject */}
      {loading ? (
        <div className="spinner" style={{ margin: '40px auto' }}></div>
      ) : filteredNotes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)' }}>
          <p style={{ color: 'var(--text-muted)' }}>No study materials found.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '28px' }}>
          {sortedSubjects.map((subject) => (
            <section key={subject}>
              <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '14px', color: 'var(--text-main)' }}>
                {subject}
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
                {groupedNotes[subject].map(n => (
                  <div key={n._id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                      <div style={{ width: '48px', height: '48px', background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <FileText size={24} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '4px' }}>
                          <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-main)', lineHeight: '1.4', margin: 0 }}>{n.title}</h3>
                          {n.isOfficial && (
                            <span style={{ fontSize: '11px', fontWeight: 700, backgroundColor: 'var(--success-light)', color: 'var(--success)', padding: '2px 8px', borderRadius: '12px', whiteSpace: 'nowrap' }}>
                              ✓ Official
                            </span>
                          )}
                        </div>
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>By: {n.uploadedBy?.name || 'Unknown'}</p>
                        <p style={{ fontSize: '13px', color: 'var(--text-light)', margin: 0 }}>{new Date(n.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <a
                      href={n.fileLink}
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
            </section>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notes;
