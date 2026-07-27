import { useState, useEffect } from 'react';
import TopHeaderBanner from '../components/TopHeaderBanner';

const SENSORS = [
  { id: 'temp', label: 'Body Temperature', value: 38.6, unit: '°C', icon: '🌡️', normal: '38.0–39.5°C', status: 'normal', color: '#22C55E', min: 35, max: 42 },
  { id: 'humid', label: 'Shed Humidity', value: 72, unit: '%', icon: '💧', normal: '50–75%', status: 'normal', color: '#38BDF8', min: 0, max: 100 },
  { id: 'activity', label: 'Activity Level', value: 64, unit: 'steps/hr', icon: '🏃', normal: '50–80 steps/hr', status: 'normal', color: '#8B5CF6', min: 0, max: 100 },
  { id: 'milk', label: 'Milk Yield', value: 14.2, unit: 'L/day', icon: '🥛', normal: '12–18 L/day', status: 'normal', color: '#F59E0B', min: 0, max: 25 },
  { id: 'rumination', label: 'Rumination Time', value: 5.8, unit: 'hrs/day', icon: '🐄', normal: '6–9 hrs/day', status: 'warning', color: '#F97316', min: 0, max: 12 },
  { id: 'heart', label: 'Heart Rate', value: 68, unit: 'bpm', icon: '❤️', normal: '60–80 bpm', status: 'normal', color: '#EF4444', min: 40, max: 100 },
];

export default function IoT() {
  const [data, setData] = useState(SENSORS);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Simulate live data refresh every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => prev.map(s => ({
        ...s,
        value: parseFloat((s.value + (Math.random() - 0.5) * 0.5).toFixed(1))
      })));
      setLastUpdate(new Date());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const getBarPct = (s) => ((s.value - s.min) / (s.max - s.min)) * 100;

  return (
    <div>
      <TopHeaderBanner title="IoT Sensor Dashboard" subtitle="Real-time livestock health monitoring">
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', marginBottom: 4 }}>Last updated</div>
          <div style={{ fontSize: 12, color: '#fff', fontWeight: 700 }}>{lastUpdate.toLocaleTimeString()}</div>
        </div>
      </TopHeaderBanner>

      {/* Status Bar */}
      <div style={{
        background: 'linear-gradient(90deg, rgba(22,163,74,0.1), rgba(22,163,74,0.05))',
        border: '1px solid rgba(22,163,74,0.2)',
        borderRadius: 'var(--radius-md)',
        padding: '10px 16px',
        display: 'flex', alignItems: 'center', gap: 12,
        marginBottom: 20,
      }}>
        <div style={{ width: 10, height: 10, borderRadius: 5, background: '#22C55E', animation: 'pulse-dot 1.5s infinite' }} />
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--primary)' }}>Live Sensors Active</span>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>6 sensors · Auto-refresh every 5s</span>
        <div style={{ marginLeft: 'auto' }}>
          <span className="badge badge-low">All Systems Normal</span>
        </div>
      </div>

      <div className="grid-3" style={{ gap: 14 }}>
        {data.map(sensor => (
          <div key={sensor.id} className="card" style={{
            borderTop: `3px solid ${sensor.color}`,
            borderRadius: 'var(--radius-lg)',
          }}>
            <div className="flex-between mb-3">
              <div style={{ fontSize: 28 }}>{sensor.icon}</div>
              <span className={`badge ${sensor.status === 'warning' ? 'badge-moderate' : 'badge-low'}`}>
                {sensor.status === 'warning' ? '⚠️ Low' : '✓ Normal'}
              </span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 900, color: sensor.color, lineHeight: 1 }}>
              {sensor.value}
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-muted)', marginLeft: 4 }}>{sensor.unit}</span>
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-sub)', marginTop: 4 }}>{sensor.label}</div>
            <div style={{ marginTop: 12 }}>
              <div className="confidence-bar-track">
                <div
                  className="confidence-bar-fill"
                  style={{ width: `${Math.min(100, Math.max(0, getBarPct(sensor)))}%`, background: sensor.color }}
                />
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>Normal: {sensor.normal}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Warning Panel */}
      {data.some(s => s.status === 'warning') && (
        <div className="card mt-4 animate-fade-in" style={{ background: 'var(--risk-moderate-bg)', border: '1px solid rgba(234,179,8,0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 24 }}>⚠️</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#FCD34D' }}>Attention Required</div>
              <div style={{ fontSize: 13, color: 'var(--text-sub)', marginTop: 4 }}>
                Rumination time is below normal (5.8 hrs/day vs 6–9 hrs/day target). This may indicate digestive discomfort or early stress. Monitor closely.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
