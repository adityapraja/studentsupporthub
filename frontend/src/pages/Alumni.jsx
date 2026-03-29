import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Search, Mail, Phone, Briefcase, GraduationCap, MapPin } from 'lucide-react';

const Alumni = () => {
  const [alumniItems, setAlumniItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchAlumni();
  }, []);

  const fetchAlumni = async () => {
    try {
      const { data } = await api.get('/alumni');
      setAlumniItems(data.alumni || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredAlumni = alumniItems.filter(a => 
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    a.company?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800 }}>Alumni Directory</h1>
        <p style={{ color: 'var(--text-muted)' }}>Connect with graduates for mentoring, referrals, and career insight.</p>
      </div>

      {/* Search Bar */}
      <div style={{ position: 'relative', marginBottom: '32px', maxWidth: '500px' }}>
        <Search size={20} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '12px' }} />
        <input 
          type="text" 
          className="form-input" 
          placeholder="Search by name or company..." 
          style={{ paddingLeft: '48px' }}
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Alumni Grid */}
      {loading ? (
        <div className="spinner" style={{ margin: '40px auto' }}></div>
      ) : filteredAlumni.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)' }}>
          <p style={{ color: 'var(--text-muted)' }}>No alumni found matching your search.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
          {filteredAlumni.map(a => (
            <div key={a._id} className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 800 }}>
                  {a.name.charAt(0)}
                </div>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {a.name}
                  </h3>
                  <span style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Briefcase size={14} /> {a.currentRole || 'Professional'} {a.company && `at ${a.company}`}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', color: 'var(--text-muted)', marginBottom: '24px', flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <GraduationCap size={16} /> B.E. INFT (Batch of {a.graduationYear || a.batch})
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MapPin size={16} /> {a.location || 'Not Specified'}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <a href={`mailto:${a.email}`} className="btn btn-outline" style={{ flex: 1, padding: '8px', fontSize: '13px' }}>
                  <Mail size={16} /> Email
                </a>
                {a.linkedinProfile && (
                  <a href={a.linkedinProfile} target="_blank" rel="noreferrer" className="btn btn-primary" style={{ flex: 1, padding: '8px', fontSize: '13px' }}>
                    LinkedIn
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Alumni;
