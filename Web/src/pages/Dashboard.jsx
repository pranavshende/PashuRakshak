import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Camera, Activity, AlertTriangle } from 'lucide-react';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="dashboard-container">
      {/* Header Profile Section */}
      <header className="dashboard-header">
        <div className="header-text">
          <h1 className="greeting">Hello, {user?.name?.split(' ')[0] || 'Farmer'} 👋</h1>
          <p className="subtitle">Let's check your cattle's health today.</p>
        </div>
        <button onClick={logout} className="logout-btn" title="Logout">
          <LogOut size={24} />
        </button>
      </header>

      {/* Main Action Area */}
      <main className="dashboard-main">
        <button className="scan-button" onClick={() => navigate('/capture')}>
          <div className="scan-icon-wrapper">
            <Camera size={48} color="white" />
          </div>
          <h2 className="scan-title">Scan Cattle</h2>
          <p className="scan-subtitle">Take a photo for instant AI analysis</p>
        </button>

        {/* Stats / Quick Info */}
        <div className="stats-container">
          <div className="stat-card">
            <Activity size={32} className="stat-icon success" />
            <span className="stat-value">12</span>
            <span className="stat-label">Healthy Scans</span>
          </div>
          <div className="stat-card">
            <AlertTriangle size={32} className="stat-icon warning" />
            <span className="stat-value">2</span>
            <span className="stat-label">Issues Found</span>
          </div>
        </div>
      </main>
    </div>
  );
}
