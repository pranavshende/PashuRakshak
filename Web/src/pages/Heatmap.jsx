import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sliders, Activity } from 'lucide-react';
import { api } from '../services/api';

const DISEASES = ['All', 'Lumpy Skin Disease', 'Foot & Mouth Disease', 'Bovine Mastitis', 'Blackquarter (BQ)', 'Haemorrhagic Septicaemia'];

export default function Heatmap() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [days, setDays] = useState(30);
  const [selectedDisease, setSelectedDisease] = useState('All');
  const [showPredictions, setShowPredictions] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [days, showPredictions, selectedDisease]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (showPredictions) {
        const json = await api.getOutbreakPredictions();
        if (json.data) setData(json.data);
      } else {
        const json = await api.getOutbreaks(days, selectedDisease);
        if (json.data) setData(json.data);
      }
    } catch (e) {
      console.error(e);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <button onClick={() => navigate('/dashboard')} className="btn btn-ghost" style={{ padding: '0 8px' }}>
          <ArrowLeft size={20} /> Back to Dashboard
        </button>
      </div>

      <h1 style={{ marginBottom: '8px', fontSize: '24px', fontWeight: 800 }}>🛰️ AI Disease Outbreak Surveillance Map</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '32px', fontSize: '14px' }}>Interactive GIS surveillance visualization and 14-day AI forecast.</p>

      {/* Control Bar */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px', marginBottom: '32px', flexWrap: 'wrap', gap: '16px', background: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
            <div style={{ position: 'relative', width: '48px', height: '24px' }}>
              <input 
                type="checkbox" 
                checked={showPredictions} 
                onChange={e => setShowPredictions(e.target.checked)} 
                style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }}
              />
              <div style={{ 
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, 
                background: showPredictions ? 'var(--secondary)' : 'var(--border-medium)', 
                borderRadius: '24px', transition: '0.3s' 
              }}>
                <div style={{ 
                  position: 'absolute', top: '2px', left: showPredictions ? '26px' : '2px', 
                  width: '20px', height: '20px', background: '#fff', borderRadius: '50%', transition: '0.3s' 
                }} />
              </div>
            </div>
            <span style={{ fontWeight: '600', color: showPredictions ? 'var(--secondary-dark)' : 'var(--text-main)', transition: '0.3s', fontSize: '14px' }}>
              Enable AI 14-Day Forecast Mode
            </span>
          </label>

          {!showPredictions && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600 }}>Disease Filter:</span>
              <select 
                className="input" 
                style={{ width: '180px', height: '36px', padding: '0 8px', fontSize: '12px' }}
                value={selectedDisease}
                onChange={e => setSelectedDisease(e.target.value)}
              >
                {DISEASES.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {!showPredictions && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, maxWidth: '320px' }}>
            <Sliders size={18} color="var(--text-muted)" />
            <span style={{ fontSize: '13px', color: 'var(--text-main)', whiteSpace: 'nowrap' }}>Time Window: <strong style={{ color: 'var(--primary-dark)' }}>{days} Days</strong></span>
            <input 
              type="range" 
              min="1" 
              max="365" 
              value={days} 
              onChange={e => setDays(e.target.value)} 
              style={{ flex: 1, cursor: 'pointer', accentColor: 'var(--primary)' }}
            />
          </div>
        )}
      </div>

      {/* Visual GIS Grid Representation */}
      <div style={{ background: '#0F172A', borderRadius: 'var(--radius-lg)', overflow: 'hidden', height: '500px', position: 'relative', border: '1px solid var(--border-medium)', boxShadow: 'var(--shadow-hover)' }}>
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '20px', left: '20px', background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '8px 16px', borderRadius: 'var(--radius-sm)', fontSize: '13px', fontWeight: '500', backdropFilter: 'blur(4px)', zIndex: 10 }}>
            Region: Maharashtra & Surrounding Districts
          </div>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <div className="spinner" style={{ borderColor: '#fff', borderTopColor: 'var(--primary)' }}></div>
            </div>
          ) : data.length === 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <p style={{ color: '#94A3B8', fontSize: '16px' }}>No outbreaks reported in this timeframe.</p>
            </div>
          ) : (
            data.map(report => (
              <div 
                key={report.id} 
                style={{
                  position: 'absolute', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', transform: 'translate(-50%, -50%)', cursor: 'pointer', border: '2px solid', transition: 'all 0.3s',
                  left: `${((report.longitude - 72) / 10) * 100}%`,
                  top: `${((22 - report.latitude) / 5) * 100}%`,
                  background: showPredictions ? 'rgba(139, 92, 246, 0.4)' : report.severity === 'High' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(245, 158, 11, 0.4)',
                  borderColor: showPredictions ? '#8B5CF6' : report.severity === 'High' ? '#EF4444' : '#F59E0B',
                  boxShadow: showPredictions ? '0 0 16px rgba(139, 92, 246, 0.6)' : report.severity === 'High' ? '0 0 16px rgba(239, 68, 68, 0.6)' : '0 0 16px rgba(245, 158, 11, 0.6)'
                }}
              >
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: showPredictions ? '#8B5CF6' : report.severity === 'High' ? '#EF4444' : '#F59E0B' }} />
                <span style={{ position: 'absolute', bottom: '-28px', whiteSpace: 'nowrap', background: '#000', color: '#fff', fontSize: '12px', padding: '4px 8px', borderRadius: '4px', fontWeight: '500', zIndex: 20 }}>
                  {report.diseaseName} ({showPredictions ? 'Predicted Risk' : report.severity})
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
