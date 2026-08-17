import React from 'react';
import { Bell, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function GlobalHeader() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="top-header-banner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '92px' }}>
      <div className="top-header-left" style={{ display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
        <div className="top-header-emblem">
          <img src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" alt="Emblem" style={{ height: '48px', objectFit: 'contain' }} />
        </div>
        <div className="top-header-text">
          <div className="top-header-title" style={{ fontSize: '20px', fontWeight: 800 }}>PashuRakshak</div>
          <div className="top-header-sub" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--primary-dark)' }}>AI Livestock Intelligence Platform</div>
        </div>
      </div>

      <div className="top-header-right" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div className="top-header-icon-btn" style={{ position: 'relative', cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
          <Bell size={20} color="#0F172A" />
          <span className="top-header-badge" style={{ position: 'absolute', top: '-2px', right: '-2px', background: '#EF4444', color: '#fff', fontSize: '10px', width: '16px', height: '16px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>1</span>
        </div>
        <div className="flex-center" style={{ gap: '10px', cursor: 'pointer' }} onClick={() => navigate('/settings')}>
          <div className="top-header-avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User size={20} color="#fff" />
          </div>
          <div style={{ textAlign: 'left', display: 'none', md: 'block' }} className="user-profile-header">
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>{user?.name || 'Farmer'}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{user?.role || 'Farmer'}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
