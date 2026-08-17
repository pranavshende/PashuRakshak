import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, CheckCircle, Save, LogOut } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Settings() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [cleared, setCleared] = useState(false);
  const [profile, setProfile] = useState({ name: '', phone: '', email: '', farmName: '', language: 'English', notificationsEnabled: true });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await api.getCurrentUser();
      if (data.user) {
        setProfile({
          name: data.user.name || '',
          phone: data.user.phone || '',
          email: data.user.email || '',
          farmName: data.user.farmName || '',
          language: data.user.language || 'English',
          notificationsEnabled: data.user.notificationsEnabled !== false
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleClearCache = () => {
    const token = localStorage.getItem('userToken');
    const u = localStorage.getItem('user');
    localStorage.clear();
    if (token) localStorage.setItem('userToken', token);
    if (u) localStorage.setItem('user', u);

    setCleared(true);
    setTimeout(() => setCleared(false), 3000);
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const data = await api.updateProfile(profile);
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (e) {
      console.error(e);
      alert(e.message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-content-container" style={{ padding: '40px 24px', textAlign: 'center' }}>
        <div className="spinner" style={{ margin: '40px auto' }}></div>
        <p style={{ color: 'var(--text-muted)' }}>Loading account configurations...</p>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in-fast" style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <button onClick={() => navigate('/dashboard')} className="btn btn-ghost" style={{ padding: '0 8px' }}>
          <ArrowLeft size={20} /> Back to Dashboard
        </button>
      </div>

      <h1 style={{ marginBottom: '8px', fontSize: '24px', fontWeight: 800 }}>⚙️ Settings & Configuration</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '32px', fontSize: '14px' }}>Manage farm details, preferences, local cache, and security.</p>

      {/* Profile Settings */}
      <div className="card" style={{ padding: '32px', marginBottom: '24px', background: 'white' }}>
        <h3 style={{ margin: '0 0 24px 0', color: 'var(--text-main)', fontSize: '18px', borderBottom: '1px solid var(--border-light)', paddingBottom: '16px' }}>Farm Profile</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '500px' }}>
          <div className="grid-2" style={{ gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600 }}>Full Name</label>
              <input 
                className="input w-full" 
                value={profile.name} 
                onChange={e => setProfile({...profile, name: e.target.value})} 
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600 }}>Phone Number</label>
              <input 
                className="input w-full" 
                value={profile.phone} 
                onChange={e => setProfile({...profile, phone: e.target.value})} 
              />
            </div>
          </div>
          <div className="grid-2" style={{ gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600 }}>Email Address</label>
              <input 
                className="input w-full" 
                value={profile.email} 
                onChange={e => setProfile({...profile, email: e.target.value})} 
                placeholder="farmer@example.com"
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600 }}>Farm Location / Name</label>
              <input 
                className="input w-full" 
                value={profile.farmName} 
                onChange={e => setProfile({...profile, farmName: e.target.value})} 
                placeholder="Ramesh Dairy Farm"
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}>
              <input 
                type="checkbox" 
                checked={profile.notificationsEnabled} 
                onChange={e => setProfile({...profile, notificationsEnabled: e.target.checked})}
                style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
              />
              Enable Outbreak & Health Alerts
            </label>
          </div>

          <div style={{ marginTop: '8px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600 }}>App Language</label>
            <select 
              className="input" 
              style={{ width: '180px' }}
              value={profile.language}
              onChange={e => setProfile({...profile, language: e.target.value})}
            >
              <option value="English">English</option>
              <option value="Hindi">हिन्दी (Hindi)</option>
              <option value="Marathi">मराठी (Marathi)</option>
            </select>
          </div>

          <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button onClick={handleSaveProfile} className="btn btn-primary" disabled={saving}>
              <Save size={18} /> {saving ? 'Saving...' : 'Save Configuration'}
            </button>
            {saved && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10B981', fontSize: '14px', fontWeight: 600 }}>
                <CheckCircle size={16} /> Preferences persisted successfully!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cache Settings */}
      <div className="card" style={{ padding: '32px', marginBottom: '24px', background: 'white' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
          <div>
            <h3 style={{ margin: '0 0 8px 0', color: 'var(--text-main)', fontSize: '18px' }}>Offline Cache Management</h3>
            <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              Clear cached offline diagnoses and medicine guides to free up local browser space.
            </p>
          </div>
          <button onClick={handleClearCache} className="btn" style={{ background: 'var(--error)', color: '#fff', padding: '0 20px', height: '44px' }}>
            <Trash2 size={18} /> Clear Cache
          </button>
        </div>

        {cleared && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#D1FAE5', color: '#065F46', padding: '16px', borderRadius: 'var(--radius-md)', marginTop: '24px', fontWeight: '600' }}>
            <CheckCircle size={20} color="#10B981" />
            <span>Local cache cleared successfully!</span>
          </div>
        )}
      </div>

      {/* Security settings */}
      <div className="card" style={{ padding: '32px', background: 'white' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
          <div>
            <h3 style={{ margin: '0 0 8px 0', color: 'var(--text-main)', fontSize: '18px' }}>Account Security</h3>
            <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              Securely sign out of your current farm portal session.
            </p>
          </div>
          <button onClick={logout} className="btn btn-danger" style={{ padding: '0 20px', height: '44px' }}>
            <LogOut size={18} /> Logout Session
          </button>
        </div>
      </div>
    </div>
  );
}
