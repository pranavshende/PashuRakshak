import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, CheckCircle, RefreshCw } from 'lucide-react';

export default function Settings() {
  const navigate = useNavigate();
  const [cleared, setCleared] = useState(false);

  const handleClearCache = () => {
    // Keep user token, clear temporary offline prediction/cache items
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    localStorage.clear();
    if (token) localStorage.setItem('token', token);
    if (user) localStorage.setItem('user', user);

    setCleared(true);
    setTimeout(() => setCleared(false), 3000);
  };

  return (
    <div className="container" style={{ padding: '40px 24px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <button onClick={() => navigate('/')} className="btn btn-ghost" style={{ padding: '0 8px' }}>
          <ArrowLeft size={20} /> Back to Dashboard
        </button>
      </div>

      <h1 style={{ marginBottom: '8px' }}>⚙️ Settings & Offline Data</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Manage local storage, offline disease rules, and sync settings.</p>

      <div className="card" style={{ padding: '32px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
          <div>
            <h3 style={{ margin: '0 0 8px 0', color: 'var(--text-main)', fontSize: '18px' }}>Offline Cache Management</h3>
            <p style={{ margin: 0, fontSize: '15px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
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

      <div className="card" style={{ padding: '32px' }}>
        <h3 style={{ margin: '0 0 24px 0', color: 'var(--text-main)', fontSize: '18px', borderBottom: '1px solid var(--border-light)', paddingBottom: '16px' }}>System Status</h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '15px', color: 'var(--text-main)' }}>
          <span style={{ color: 'var(--text-muted)' }}>Rule Engine Sync:</span>
          <strong style={{ color: 'var(--primary-dark)', background: 'var(--primary-light)', padding: '4px 12px', borderRadius: '16px' }}>Up to date</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', color: 'var(--text-main)' }}>
          <span style={{ color: 'var(--text-muted)' }}>Local Storage Usage:</span>
          <strong style={{ color: 'var(--secondary-dark)' }}>~1.2 KB</strong>
        </div>
      </div>
    </div>
  );
}
