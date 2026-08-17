import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Activity, Syringe, Heart, ShieldAlert, Sparkles, MapPin } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [animals, setAnimals] = useState([]);
  const [news, setNews] = useState([]);
  const [tickerIdx, setTickerIdx] = useState(0);
  const [farmScore, setFarmScore] = useState(null);
  const [recentScans, setRecentScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (news.length === 0) return;
    const interval = setInterval(() => setTickerIdx(i => (i + 1) % news.length), 4000);
    return () => clearInterval(interval);
  }, [news]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(false);
    try {
      // Fetch data concurrently
      const [animalsData, scoreData, newsData] = await Promise.all([
        api.getAnimals(),
        api.getFarmScore().catch(() => null),
        api.getFarmNews().catch(() => ({ news: [] }))
      ]);

      if (animalsData.animals) {
        setAnimals(animalsData.animals);
        // Gather recent scans across all animals predictions
        const allPreds = [];
        animalsData.animals.forEach(a => {
          if (a.predictions) {
            a.predictions.forEach(p => allPreds.push({ ...p, animalName: a.name || 'Unnamed' }));
          }
        });
        allPreds.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setRecentScans(allPreds.slice(0, 5));
      }

      if (scoreData) {
        setFarmScore(scoreData);
      }

      if (newsData && newsData.news && newsData.news.length > 0) {
        setNews(newsData.news);
      } else {
        setNews([{ title: '✅ No active disease outbreaks in your region.', category: 'HEALTH ADVISORY' }]);
      }
    } catch (e) {
      console.error(e);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const getStats = () => {
    const total = animals.length;
    let healthy = 0;
    let attention = 0;
    let critical = 0;

    animals.forEach(a => {
      if (!a.predictions || a.predictions.length === 0) {
        healthy++;
      } else {
        const latest = a.predictions[0];
        if (latest.riskLevel === 'CRITICAL' || latest.riskLevel === 'High') {
          critical++;
          attention++;
        } else if (latest.riskLevel === 'MEDIUM' || latest.riskLevel === 'Medium') {
          attention++;
        } else {
          healthy++;
        }
      }
    });

    return { total, healthy, attention, critical };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="page-content-container" style={{ padding: '40px 24px', textAlign: 'center' }}>
        <div className="spinner" style={{ margin: '40px auto' }}></div>
        <p style={{ color: 'var(--text-muted)' }}>Analyzing livestock health metrics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-content-container" style={{ padding: '40px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
        <h3>Failed to load farm intelligence</h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Please check your internet connection or backend server status.</p>
        <button className="btn btn-primary" onClick={fetchDashboardData}>Retry Load</button>
      </div>
    );
  }

  // Generate dynamic SVG chart data
  const renderSVGChart = () => {
    const maxVal = Math.max(...animals.map(a => a.milkRecords?.reduce((sum, r) => sum + r.quantityLiters, 0) || 0), 10);
    return (
      <svg width="100%" height="160" viewBox="0 0 400 160" style={{ overflow: 'visible' }}>
        <g stroke="var(--border)" strokeWidth="1">
          <line x1="40" y1="20" x2="380" y2="20" />
          <line x1="40" y1="70" x2="380" y2="70" />
          <line x1="40" y1="120" x2="380" y2="120" />
        </g>
        <g>
          {animals.slice(0, 6).map((animal, i) => {
            const milkSum = animal.milkRecords?.reduce((sum, r) => sum + r.quantityLiters, 0) || 0;
            const barHeight = maxVal > 0 ? (milkSum / maxVal) * 100 : 0;
            const x = 50 + i * 55;
            const y = 120 - barHeight;
            return (
              <g key={animal.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/animal/${animal.id}`)}>
                <rect x={x} y={y} width="24" height={barHeight} fill="url(#grad)" rx="4" />
                <text x={x + 12} y="140" fill="var(--text-muted)" fontSize="9" textAnchor="middle">
                  {animal.name?.substring(0, 4) || `Cow ${i}`}
                </text>
                <text x={x + 12} y={y - 6} fill="var(--text-main)" fontSize="9" fontWeight="700" textAnchor="middle">
                  {milkSum.toFixed(0)}L
                </text>
              </g>
            );
          })}
        </g>
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#16A34A" />
            <stop offset="100%" stopColor="#0F766E" />
          </linearGradient>
        </defs>
      </svg>
    );
  };

  return (
    <div className="page-content-container" style={{ marginTop: '24px' }}>
      {/* Dynamic News Ticker */}
      {news.length > 0 && (
        <div style={{ cursor: 'default', background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '12px', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
          <div style={{ background: '#DC2626', padding: '3px 8px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: 10, fontWeight: 800, color: '#fff', letterSpacing: '0.5px' }}>📢 {news[tickerIdx]?.category || 'LIVE ALERT'}</span>
          </div>
          <div key={tickerIdx} style={{ animation: 'fade-in-fast 0.3s ease', color: '#991B1B', fontSize: '13px', fontWeight: '600', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', flex: 1 }}>
            {news[tickerIdx]?.title}
          </div>
        </div>
      )}

      {/* Critical Alert banner */}
      {stats.critical > 0 && (
        <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '16px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#EF4444', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <ShieldAlert size={20} color="white" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '15px', fontWeight: 800, color: '#B91C1C' }}>CRITICAL FARM THREAT ACTIVE</div>
            <div style={{ fontSize: '12px', color: '#7F1D1D', marginTop: '2px' }}>You have {stats.critical} critical disease diagnosis in your herd. Isolate immediately and schedule vaccination.</div>
          </div>
          <button className="btn btn-danger btn-sm" onClick={() => navigate('/herd')}>Manage Herd</button>
        </div>
      )}

      {/* Overview Stats Grid */}
      <div className="grid-4 mb-6">
        <div className="stat-card" style={{ background: 'white' }}>
          <div className="stat-icon" style={{ background: '#E0F2FE', color: '#0369A1' }}>🐄</div>
          <div>
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Livestock</div>
          </div>
        </div>
        <div className="stat-card" style={{ background: 'white' }}>
          <div className="stat-icon" style={{ background: '#DCFCE7', color: '#16A34A' }}>✓</div>
          <div>
            <div className="stat-value" style={{ color: '#16A34A' }}>{stats.healthy}</div>
            <div className="stat-label">Healthy Herd</div>
          </div>
        </div>
        <div className="stat-card" style={{ background: 'white' }}>
          <div className="stat-icon" style={{ background: '#FEE2E2', color: '#EF4444' }}>⚠️</div>
          <div>
            <div className="stat-value" style={{ color: '#EF4444' }}>{stats.attention}</div>
            <div className="stat-label">Attention Needed</div>
          </div>
        </div>
        <div className="stat-card" style={{ background: 'white' }}>
          <div className="stat-icon" style={{ background: '#FEF9C3', color: '#CA8A04' }}>🔬</div>
          <div>
            <div className="stat-value">{recentScans.length}</div>
            <div className="stat-label">Total Health Scans</div>
          </div>
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="grid-2 mb-6" style={{ gap: '24px' }}>
        {/* Productivity score gauge */}
        <div className="card" style={{ background: 'white' }}>
          <div className="section-title">AI Farm Productivity Index</div>
          {farmScore ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '10px 0' }}>
              <div style={{ position: 'relative', width: '120px', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#ECFDF5', borderRadius: '50%', border: '4px solid #10B981', boxShadow: 'var(--shadow-glow)' }}>
                <div>
                  <div style={{ fontSize: '32px', fontWeight: 900, color: '#065F46' }}>{farmScore.score}</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>/ 100</div>
                </div>
              </div>
              <div style={{ marginTop: '16px', fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>Methodology Rating</div>
              <p style={{ fontSize: '12px', color: 'var(--text-sub)', marginTop: '8px', lineHeight: 1.5 }}>
                {farmScore.suggestion}
              </p>
              <div style={{ display: 'flex', gap: '12px', width: '100%', marginTop: '16px' }}>
                <div style={{ flex: 1, background: '#F8FAFC', padding: '8px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '14px', fontWeight: 800 }}>{farmScore.details?.vaccinationScore}/40</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Vaccinations</div>
                </div>
                <div style={{ flex: 1, background: '#F8FAFC', padding: '8px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '14px', fontWeight: 800 }}>{farmScore.details?.healthScore}/40</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Health Penalty</div>
                </div>
                <div style={{ flex: 1, background: '#F8FAFC', padding: '8px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '14px', fontWeight: 800 }}>{farmScore.details?.milkScore}/20</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Productivity</div>
                </div>
              </div>
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)', padding: '24px 0' }}>Insufficient data to calculate productivity score.</p>
          )}
        </div>

        {/* Dynamic Milk Yield Chart */}
        <div className="card" style={{ background: 'white' }}>
          <div className="section-title">Herd Productivity Analysis</div>
          {animals.length > 0 && animals.some(a => a.milkRecords && a.milkRecords.length > 0) ? (
            <div style={{ padding: '20px 0' }}>
              {renderSVGChart()}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>🥛</div>
              <p style={{ fontSize: '12px' }}>No milk production logs available.<br/>Register records in My Herd to populate analytics.</p>
            </div>
          )}
        </div>
      </div>

      {/* IoT smart monitor & Digital twin list */}
      <div className="grid-2 mb-6" style={{ gap: '24px' }}>
        {/* IoT Monitor preview */}
        <div className="card" style={{ background: 'white' }}>
          <div className="flex-between mb-4">
            <div className="section-title" style={{ margin: 0 }}>IoT Smart Livestock Monitor</div>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/iot')}>Full View &gt;</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {animals.filter(a => a.sensorStatus === 'LIVE').slice(0, 3).map(a => (
              <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#F0FDF4', border: '1px solid #DCFCE7', borderRadius: '12px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#22C55E', animation: 'pulse-dot 1.5s infinite' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: 700 }}>{a.name || 'IoT Collar ID'}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    🌡️ {a.temperature ? `${a.temperature.toFixed(1)}°C` : '38.6°C'} | ❤️ {a.heartRate ? `${a.heartRate.toFixed(0)} bpm` : '72 bpm'}
                  </div>
                </div>
                <span className="badge badge-low">LIVE</span>
              </div>
            ))}
            {animals.filter(a => a.sensorStatus === 'LIVE').length === 0 && (
              <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)' }}>
                <span style={{ fontSize: '32px' }}>📡</span>
                <p style={{ fontSize: '12px', marginTop: '8px' }}>No active IoT collars linked to your herd.</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Diagnoses */}
        <div className="card" style={{ background: 'white' }}>
          <div className="section-title">Recent Scans & Medical Records</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {recentScans.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)' }}>
                <span style={{ fontSize: '32px' }}>📋</span>
                <p style={{ fontSize: '12px', marginTop: '8px' }}>No diagnoses records logged yet.</p>
              </div>
            ) : (
              recentScans.map((scan) => (
                <div key={scan.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '20px' }}>🐄</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: 700 }}>{scan.disease}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{scan.animalName} · {new Date(scan.createdAt).toLocaleDateString()}</div>
                  </div>
                  <span className={`badge badge-${(scan.riskLevel || 'LOW').toLowerCase()}`}>{scan.riskLevel || 'LOW'}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Print Health Cert card shortcut */}
      <div className="card" style={{ background: '#ECFDF5', border: '1px solid #10B981', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <span style={{ fontSize: '32px' }}>📜</span>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '15px', fontWeight: 800, color: '#064E3B' }}>Livestock Health Certificates</div>
            <div style={{ fontSize: '12px', color: '#065F46', marginTop: '2px' }}>Generate official verifiable PDF certificates for insurance and financing.</div>
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/herd')}>Select Animal</button>
      </div>
    </div>
  );
}
