import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import TopHeaderBanner from '../components/TopHeaderBanner';
import { API_BASE_URL } from '../config/api';

const QUICK_SERVICES = [
  { icon: '🐄', label: 'My Herd', path: '/herd', color: '#16A34A', bg: 'rgba(22,163,74,0.12)' },
  { icon: '💬', label: 'AI Vet Chat', path: '/chat', color: '#38BDF8', bg: 'rgba(56,189,248,0.12)' },
  { icon: '🗺️', label: 'Disease Map', path: '/heatmap', color: '#8B5CF6', bg: 'rgba(139,92,246,0.12)' },
  { icon: '💊', label: 'Medicine', path: '/medicine', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
  { icon: '📊', label: 'Farm Score', path: '/farm-score', color: '#EC4899', bg: 'rgba(236,72,153,0.12)' },
  { icon: '👥', label: 'Community', path: '/community', color: '#06B6D4', bg: 'rgba(6,182,212,0.12)' },
];

const NEWS = [
  { text: '🚨 [DISEASE ALERT] NADCP Free Vaccination Drive Active in local districts — DAHD' },
  { text: '🚨 [HEALTH ADVISORY] Lumpy Skin Disease Prevention Advisory for Cattle Farmers — ICAR' },
  { text: '🏛️ [GOVT SCHEME] Pashu Kisan Credit Card: Up to ₹1.6 Lakh @ 4% Interest — NABARD' },
  { text: '🏛️ [POLICY] Rashtriya Gokul Mission: Subsidies for Indigenous Livestock — DAHD' },
];

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recentScans, setRecentScans] = useState([]);
  const [stats, setStats] = useState({ animals: 0, scans: 0, alerts: 1 });
  const [tickerIdx, setTickerIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTickerIdx(i => (i + 1) % NEWS.length), 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('userToken');
    if (!token) return;
    // Fetch recent predictions
    fetch(`${API_BASE_URL}/animals`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => { if (d.animals) setStats(s => ({ ...s, animals: d.animals.length })); })
      .catch(() => {});
  }, []);

  const firstName = user?.name?.split(' ')[0] || 'Farmer';

  return (
    <div>
      <TopHeaderBanner
        title={`Namaste, ${firstName} 👋`}
        subtitle="PashuRakshak Livestock Intelligence Platform"
      />

      {/* Flash News Ticker */}
      <div className="news-ticker" style={{ cursor: 'default' }}>
        <div className="news-ticker-badge">
          <div className="news-ticker-dot" />
          <span style={{ fontSize: 9, fontWeight: 800, color: '#fff' }}>FLASH NEWS</span>
        </div>
        <div className="news-ticker-text" key={tickerIdx} style={{ animation: 'fade-in-fast 0.3s ease' }}>
          {NEWS[tickerIdx].text}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid-3 mb-4" style={{ gap: 12 }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(22,163,74,0.15)', fontSize: 22 }}>🐄</div>
          <div>
            <div className="stat-value">{stats.animals}</div>
            <div className="stat-label">Total Animals</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(56,189,248,0.15)', fontSize: 22 }}>🔬</div>
          <div>
            <div className="stat-value">{stats.scans}</div>
            <div className="stat-label">AI Scans Done</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(239,68,68,0.15)', fontSize: 22 }}>⚠️</div>
          <div>
            <div className="stat-value" style={{ color: '#EF4444' }}>{stats.alerts}</div>
            <div className="stat-label">Active Alerts</div>
          </div>
        </div>
      </div>

      {/* Disease Alert Banner */}
      <div style={{
        background: 'linear-gradient(90deg, rgba(127,29,29,0.4), rgba(220,38,38,0.15))',
        border: '1px solid rgba(239,68,68,0.3)',
        borderRadius: 'var(--radius-md)',
        padding: '12px 16px',
        display: 'flex', alignItems: 'center', gap: 12,
        marginBottom: 20,
      }}>
        <div style={{ width: 32, height: 32, borderRadius: 16, background: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span style={{ fontSize: 14 }}>⚠️</span>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#FCA5A5' }}>LSD Disease Alert — Local District</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Lumpy Skin Disease cases reported nearby. Vaccinate your herd immediately.</div>
        </div>
        <button style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 16 }}>✕</button>
      </div>

      {/* Scan Cattle Card */}
      <button className="scan-card w-full" onClick={() => navigate('/capture')}>
        <div className="scan-card-icon">📸</div>
        <div style={{ textAlign: 'left', flex: 1, position: 'relative', zIndex: 1 }}>
          <div className="scan-card-title">Scan Cattle for Disease</div>
          <div className="scan-card-sub">AI-powered instant diagnosis — Gemini Vision & TFLite ML</div>
        </div>
        <div style={{ position: 'relative', zIndex: 1, color: 'rgba(255,255,255,0.7)', fontSize: 20 }}>›</div>
      </button>

      {/* Quick Services */}
      <div className="mb-4">
        <div className="section-title">Quick Services</div>
        <div className="grid-services">
          {QUICK_SERVICES.map(s => (
            <div key={s.path} className="service-tile" onClick={() => navigate(s.path)}>
              <div className="service-icon" style={{ background: s.bg }}>
                <span style={{ fontSize: 18 }}>{s.icon}</span>
              </div>
              <div className="service-label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity + Health Tip */}
      <div className="grid-2" style={{ gap: 16 }}>
        {/* Recent Scans */}
        <div className="card">
          <div className="section-title">Recent Scans</div>
          {recentScans.length === 0 ? (
            <div className="empty-state" style={{ padding: '20px 10px' }}>
              <div style={{ fontSize: 32, marginBottom: 8, opacity: 0.4 }}>🔬</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>No scans yet. Use Scan Cattle to get started.</div>
            </div>
          ) : recentScans.map((scan, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontSize: 20 }}>🐄</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{scan.disease}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{new Date(scan.createdAt).toLocaleDateString()}</div>
              </div>
              <span className={`badge badge-${scan.riskLevel?.toLowerCase()}`}>{scan.riskLevel}</span>
            </div>
          ))}
        </div>

        {/* Weekly Health Tip */}
        <div className="card" style={{ background: 'linear-gradient(135deg, rgba(22,163,74,0.08), rgba(15,118,110,0.12))', border: '1px solid rgba(22,163,74,0.2)' }}>
          <div className="section-title" style={{ color: 'var(--primary)' }}>Weekly Health Tip</div>
          <div style={{ fontSize: 28, marginBottom: 12 }}>💡</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-main)', marginBottom: 8 }}>Deworming Schedule Reminder</div>
          <div style={{ fontSize: 13, color: 'var(--text-sub)', lineHeight: 1.6 }}>
            Deworm all cattle every 3 months. Use Albendazole (7.5mg/kg body weight). Deworm young calves at 3, 6, and 9 weeks of age.
          </div>
          <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
            <span className="badge badge-primary">📅 July Tip</span>
            <span className="badge badge-low">Preventive</span>
          </div>
        </div>
      </div>

      {/* Government Footer */}
      <div style={{
        marginTop: 24,
        background: 'var(--bg-card)',
        border: '1px solid var(--border-card)',
        borderRadius: 'var(--radius-md)',
        padding: '12px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16,
      }}>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>🏛️ Ministry of Fisheries, Animal Husbandry & Dairying</span>
        <span style={{ color: 'var(--border)' }}>|</span>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>🐄 NDDB</span>
        <span style={{ color: 'var(--border)' }}>|</span>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>🔬 ICAR</span>
      </div>
    </div>
  );
}
