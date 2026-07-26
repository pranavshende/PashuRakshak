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
    <div className="page-container" style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <button onClick={() => navigate('/')} className="back-btn" style={styles.backBtn}>
        <ArrowLeft size={20} /> Back to Dashboard
      </button>

      <h1 style={{ color: '#111827', marginTop: '15px' }}>⚙️ Settings & Offline Data</h1>
      <p style={{ color: '#6B7280', marginBottom: '30px' }}>Manage local storage, offline disease rules, and sync settings.</p>

      <div style={styles.card}>
        <div style={styles.row}>
          <div>
            <h3 style={{ margin: 0, color: '#1F2937' }}>Offline Cache Management</h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#6B7280' }}>
              Clear cached offline diagnoses and medicine guides to free up local browser space.
            </p>
          </div>
          <button onClick={handleClearCache} style={styles.clearBtn}>
            <Trash2 size={18} /> Clear Cache
          </button>
        </div>

        {cleared && (
          <div style={styles.successBox}>
            <CheckCircle size={20} color="#10B981" />
            <span>Local cache cleared successfully!</span>
          </div>
        )}
      </div>

      <div style={{ ...styles.card, marginTop: '20px' }}>
        <h3 style={{ margin: 0, color: '#1F2937' }}>System Status</h3>
        <div style={styles.statusItem}>
          <span>Rule Engine Sync:</span>
          <strong style={{ color: '#10B981' }}>Up to date</strong>
        </div>
        <div style={styles.statusItem}>
          <span>Local Storage Usage:</span>
          <strong style={{ color: '#3B82F6' }}>~1.2 KB</strong>
        </div>
      </div>
    </div>
  );
}

const styles = {
  backBtn: { display: 'flex', alignItems: 'center', gap: '8px', border: 'none', background: 'none', cursor: 'pointer', color: '#4B5563', fontWeight: 'bold' },
  card: { background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #E5E7EB' },
  row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '15px' },
  clearBtn: { display: 'flex', alignItems: 'center', gap: '6px', background: '#EF4444', color: '#fff', border: 'none', padding: '10px 15px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', whiteSpace: 'nowrap' },
  successBox: { display: 'flex', alignItems: 'center', gap: '10px', background: '#D1FAE5', color: '#065F46', padding: '10px', borderRadius: '8px', marginTop: '15px', fontWeight: 'bold' },
  statusItem: { display: 'flex', justifyContent: 'space-between', marginTop: '12px', fontSize: '14px', color: '#4B5563' }
};
