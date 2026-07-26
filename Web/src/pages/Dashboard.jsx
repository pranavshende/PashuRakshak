import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Camera, Activity, AlertTriangle, Pill, Settings, MessageSquare, Map, TrendingUp, PawPrint } from 'lucide-react';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="dashboard-container" style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
      {/* Header Profile Section */}
      <header className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div className="header-text">
          <h1 className="greeting" style={{ margin: 0, color: '#111827' }}>Hello, <span style={{ color: '#10B981' }}>{user?.name?.split(' ')[0] || 'Farmer'}</span> 👋</h1>
          <p className="subtitle" style={{ margin: '5px 0 0 0', color: '#6B7280' }}>PashuRakshak V3 Livestock Intelligence Platform</p>
        </div>
        <button onClick={logout} className="logout-btn" title="Logout" style={{ border: 'none', background: '#F3F4F6', padding: '10px', borderRadius: '8px', cursor: 'pointer' }}>
          <LogOut size={20} color="#4B5563" />
        </button>
      </header>

      {/* Main Scan Button */}
      <div style={{ marginBottom: '30px' }}>
        <button 
          onClick={() => navigate('/capture')}
          style={{
            width: '100%',
            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: '16px',
            padding: '25px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)'
          }}
        >
          <div style={{ background: 'rgba(255,255,255,0.2)', padding: '15px', borderRadius: '12px' }}>
            <Camera size={36} color="#fff" />
          </div>
          <div style={{ textAlign: 'left' }}>
            <h2 style={{ margin: 0, fontSize: '22px' }}>Scan Cattle</h2>
            <p style={{ margin: '4px 0 0 0', opacity: 0.9, fontSize: '14px' }}>Take a photo for instant offline AI diagnosis</p>
          </div>
        </button>
      </div>

      {/* Feature Grid */}
      <h2 style={{ fontSize: '18px', color: '#1F2937', marginBottom: '15px' }}>Intelligence Modules</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px' }}>
        
        <div onClick={() => navigate('/herd')} style={styles.moduleCard}>
          <PawPrint size={24} color="#10B981" />
          <div>
            <strong style={styles.cardTitle}>My Herd (Digital Twins)</strong>
            <p style={styles.cardDesc}>Animal profiles & records</p>
          </div>
        </div>

        <div onClick={() => navigate('/chat')} style={styles.moduleCard}>
          <MessageSquare size={24} color="#3B82F6" />
          <div>
            <strong style={styles.cardTitle}>AI Vet Assistant</strong>
            <p style={styles.cardDesc}>24/7 Gemini chatbot</p>
          </div>
        </div>

        <div onClick={() => navigate('/heatmap')} style={styles.moduleCard}>
          <Map size={24} color="#8B5CF6" />
          <div>
            <strong style={styles.cardTitle}>Disease Outbreak Map</strong>
            <p style={styles.cardDesc}>GIS predictive heatmaps</p>
          </div>
        </div>

        <div onClick={() => navigate('/farm-score')} style={styles.moduleCard}>
          <TrendingUp size={24} color="#F59E0B" />
          <div>
            <strong style={styles.cardTitle}>Farm Score</strong>
            <p style={styles.cardDesc}>Holistic productivity score</p>
          </div>
        </div>

        <div onClick={() => navigate('/medicine')} style={styles.moduleCard}>
          <Pill size={24} color="#EC4899" />
          <div>
            <strong style={styles.cardTitle}>Medicine Reference</strong>
            <p style={styles.cardDesc}>First-aid & quarantine guides</p>
          </div>
        </div>

        <div onClick={() => navigate('/settings')} style={styles.moduleCard}>
          <Settings size={24} color="#6B7280" />
          <div>
            <strong style={styles.cardTitle}>Settings & Cache</strong>
            <p style={styles.cardDesc}>Manage offline data storage</p>
          </div>
        </div>

      </div>
    </div>
  );
}

const styles = {
  moduleCard: {
    background: '#fff',
    padding: '15px',
    borderRadius: '12px',
    border: '1px solid #E5E7EB',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    transition: 'all 0.2s',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
  },
  cardTitle: { display: 'block', color: '#111827', fontSize: '15px' },
  cardDesc: { margin: '2px 0 0 0', color: '#6B7280', fontSize: '12px' }
};
