import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Camera, Activity, AlertTriangle, Pill, Settings, MessageSquare, Map, TrendingUp, PawPrint } from 'lucide-react';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="container" style={{ padding: '40px 24px', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header Profile Section */}
      <header className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ margin: 0, color: 'var(--text-main)', fontSize: '24px' }}>
            Hello, <span style={{ color: 'var(--primary-dark)' }}>{user?.name?.split(' ')[0] || 'Farmer'}</span> 👋
          </h1>
          <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)', fontSize: '14px' }}>
            PashuRakshak Livestock Intelligence Platform
          </p>
        </div>
        <button onClick={logout} className="btn btn-ghost" title="Logout" style={{ padding: '0 12px' }}>
          <LogOut size={20} />
        </button>
      </header>

      {/* Main Scan Button */}
      <div style={{ marginBottom: '40px' }}>
        <button 
          onClick={() => navigate('/capture')}
          className="btn btn-primary"
          style={{
            width: '100%',
            height: 'auto',
            padding: '32px',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: '24px',
            boxShadow: 'var(--shadow-hover)'
          }}
        >
          <div style={{ background: 'rgba(255,255,255,0.25)', padding: '20px', borderRadius: 'var(--radius-md)' }}>
            <Camera size={40} color="#fff" />
          </div>
          <div style={{ textAlign: 'left' }}>
            <h2 style={{ margin: 0, fontSize: '24px', color: '#fff' }}>Scan Cattle</h2>
            <p style={{ margin: '6px 0 0 0', opacity: 0.9, fontSize: '15px', color: '#fff' }}>
              Take a photo for instant offline AI diagnosis & disease detection
            </p>
          </div>
        </button>
      </div>

      {/* Feature Grid */}
      <h2 style={{ fontSize: '18px', color: 'var(--text-main)', marginBottom: '20px' }}>Intelligence Modules</h2>
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
        
        <div onClick={() => navigate('/herd')} className="card" style={styles.moduleCard}>
          <div style={styles.iconWrapper}><PawPrint size={24} color="var(--primary)" /></div>
          <div>
            <strong style={styles.cardTitle}>My Herd</strong>
            <p style={styles.cardDesc}>Animal profiles & medical records</p>
          </div>
        </div>

        <div onClick={() => navigate('/chat')} className="card" style={styles.moduleCard}>
          <div style={styles.iconWrapper}><MessageSquare size={24} color="var(--secondary)" /></div>
          <div>
            <strong style={styles.cardTitle}>AI Vet Assistant</strong>
            <p style={styles.cardDesc}>24/7 intelligent consultation</p>
          </div>
        </div>

        <div onClick={() => navigate('/heatmap')} className="card" style={styles.moduleCard}>
          <div style={styles.iconWrapper}><Map size={24} color="#8B5CF6" /></div>
          <div>
            <strong style={styles.cardTitle}>Disease Outbreak Map</strong>
            <p style={styles.cardDesc}>Predictive GIS heatmaps</p>
          </div>
        </div>

        <div onClick={() => navigate('/farm-score')} className="card" style={styles.moduleCard}>
          <div style={styles.iconWrapper}><TrendingUp size={24} color="var(--warning)" /></div>
          <div>
            <strong style={styles.cardTitle}>Farm Score</strong>
            <p style={styles.cardDesc}>Productivity & health metrics</p>
          </div>
        </div>

        <div onClick={() => navigate('/medicine')} className="card" style={styles.moduleCard}>
          <div style={styles.iconWrapper}><Pill size={24} color="#EC4899" /></div>
          <div>
            <strong style={styles.cardTitle}>Medicine Reference</strong>
            <p style={styles.cardDesc}>First-aid & treatment guides</p>
          </div>
        </div>

        <div onClick={() => navigate('/settings')} className="card" style={styles.moduleCard}>
          <div style={styles.iconWrapper}><Settings size={24} color="var(--text-muted)" /></div>
          <div>
            <strong style={styles.cardTitle}>Settings</strong>
            <p style={styles.cardDesc}>Manage app preferences</p>
          </div>
        </div>

      </div>
    </div>
  );
}

const styles = {
  moduleCard: {
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '24px'
  },
  iconWrapper: {
    background: 'var(--bg-base)',
    padding: '12px',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border-light)'
  },
  cardTitle: { display: 'block', color: 'var(--text-main)', fontSize: '16px', fontWeight: '600', marginBottom: '4px' },
  cardDesc: { margin: 0, color: 'var(--text-muted)', fontSize: '13px' }
};
