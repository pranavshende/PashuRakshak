import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import TopHeaderBanner from '../components/TopHeaderBanner';
import { API_BASE_URL } from '../config/api';

const QUICK_SERVICES = [
  { icon: '🐄', label: 'My Herd', path: '/herd' },
  { icon: '💬', label: 'AI Vet Chat', path: '/chat' },
  { icon: '🗺️', label: 'Disease Map', path: '/heatmap' },
  { icon: '💊', label: 'Medicine', path: '/medicine' },
  { icon: '📊', label: 'Farm Score', path: '/farm-score' },
  { icon: '👥', label: 'Community', path: '/community' },
  { icon: '📘', label: 'Guidelines', path: '/guidelines' },
  { icon: '🎧', label: 'Helpline', path: '/helpline' },
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

      <div style={{ padding: '0 24px 24px', maxWidth: 1200, margin: '0 auto' }}>
        {/* Flash News Ticker */}
        <div className="news-ticker" style={{ cursor: 'default', background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <div className="news-ticker-badge" style={{ background: '#EF4444' }}>
            <span style={{ fontSize: 10, fontWeight: 800, color: '#fff' }}>📢 FLASH NEWS</span>
          </div>
          <div className="news-ticker-text" key={tickerIdx} style={{ animation: 'fade-in-fast 0.3s ease', color: '#0F172A' }}>
            {NEWS[tickerIdx].text}
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid-4 mb-4" style={{ gap: 8 }}>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#16A34A', color: '#fff' }}>🐄</div>
            <div>
              <div className="stat-value">{stats.animals}</div>
              <div className="stat-label">Total Animals</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#3B82F6', color: '#fff' }}>🔬</div>
            <div>
              <div className="stat-value">{stats.scans}</div>
              <div className="stat-label">AI Scans Done</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#F97316', color: '#fff' }}>⚠️</div>
            <div>
              <div className="stat-value" style={{ color: '#EA580C' }}>{stats.alerts}</div>
              <div className="stat-label">Active Alerts</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#0F766E', color: '#fff' }}>💉</div>
            <div>
              <div className="stat-value">0</div>
              <div className="stat-label">Vaccinations Due</div>
            </div>
          </div>
        </div>

        {/* Disease Alert Banner */}
        <div style={{
          background: 'rgba(239,68,68,0.05)',
          border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: 'var(--radius-md)',
          padding: '16px',
          display: 'flex', alignItems: 'center', gap: 12,
          marginBottom: 20,
        }}>
          <div style={{ width: 40, height: 40, borderRadius: 20, background: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: 20, color: 'white' }}>⚠️</span>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#B91C1C' }}>LSD Disease Alert — Local District</div>
            <div style={{ fontSize: 12, color: 'var(--text-sub)', marginTop: 2 }}>Lumpy Skin Disease cases reported nearby. Vaccinate your herd immediately.</div>
          </div>
          <button style={{ background: 'transparent', border: '1px solid #EF4444', color: '#EF4444', borderRadius: 20, padding: '6px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
            View Details &gt;
          </button>
        </div>

        {/* Scan Cattle Card */}
        <div className="scan-card w-full" onClick={() => navigate('/capture')} style={{ background: '#ECFDF5', border: '1px solid #16A34A', boxShadow: 'none' }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(22,163,74,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 24 }}>📸</span>
          </div>
          <div style={{ textAlign: 'left', flex: 1 }}>
            <div className="scan-card-title" style={{ color: '#064E3B' }}>Scan Cattle for Disease</div>
            <div className="scan-card-sub" style={{ color: '#065F46' }}>AI-powered instant diagnosis — Gemini Vision & TFLite ML</div>
          </div>
          <button style={{ background: '#0F766E', color: 'white', border: 'none', borderRadius: 20, padding: '8px 16px', fontSize: 12, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
            Start Scan &gt;
          </button>
        </div>

        {/* Quick Services */}
        <div className="mb-4">
          <div className="section-title">QUICK SERVICES</div>
          <div className="grid-services" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
            {QUICK_SERVICES.map(s => (
              <div key={s.path} className="service-tile" onClick={() => navigate(s.path)} style={{ background: '#fff', border: '1px solid var(--border)' }}>
                <div className="service-icon" style={{ background: 'transparent' }}>
                  <span style={{ fontSize: 28 }}>{s.icon}</span>
                </div>
                <div className="service-label" style={{ color: '#0F172A', fontWeight: 600 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity + Health Tip */}
        <div className="grid-2" style={{ gap: 16 }}>
          {/* Recent Scans */}
          <div className="card" style={{ background: '#fff' }}>
            <div className="section-title">RECENT SCANS</div>
            {recentScans.length === 0 ? (
              <div className="empty-state" style={{ padding: '20px 10px' }}>
                <div style={{ fontSize: 32, marginBottom: 8, opacity: 0.2 }}>📋</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>No scans yet.<br/>Use Scan Cattle to get started.</div>
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
          <div className="card" style={{ background: 'rgba(22,163,74,0.05)', border: '1px solid rgba(22,163,74,0.2)' }}>
            <div className="section-title" style={{ color: '#0F766E' }}>WEEKLY HEALTH TIP</div>
            <div style={{ display: 'flex', gap: 12, marginBottom: 12, alignItems: 'flex-start' }}>
              <div style={{ width: 28, height: 28, background: '#0F766E', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>
                💡
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', marginBottom: 4 }}>Deworming Schedule Reminder</div>
                <div style={{ fontSize: 12, color: '#334155', lineHeight: 1.5 }}>
                  Deworm all cattle every 3 months. Use Albendazole (7.5mg/kg body weight).
                </div>
              </div>
            </div>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#16A34A', marginTop: 16 }}>Stay Healthy. Protect Your Herd.</div>
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
    </div>
  );
}
