import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Activity, Sliders } from 'lucide-react';

export default function Heatmap() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [days, setDays] = useState(30);
  const [showPredictions, setShowPredictions] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [days, showPredictions]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const endpoint = showPredictions ? 'predict' : `historical?days=${days}`;
      const res = await fetch(`http://localhost:5000/outbreaks/${endpoint}`);
      const json = await res.json();
      if (json.data) setData(json.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container" style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
      <button onClick={() => navigate('/')} style={styles.backBtn}>
        <ArrowLeft size={20} /> Back to Dashboard
      </button>

      <h1 style={{ color: '#111827', marginTop: '15px' }}>🛰️ AI Disease Outbreak Prediction Map</h1>
      <p style={{ color: '#6B7280', marginBottom: '20px' }}>Interactive GIS surveillance visualization and 14-day AI forecast.</p>

      {/* Control Bar */}
      <div style={styles.controlBar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input 
            type="checkbox" 
            id="predToggle" 
            checked={showPredictions} 
            onChange={e => setShowPredictions(e.target.checked)} 
            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
          />
          <label htmlFor="predToggle" style={{ fontWeight: 'bold', color: '#8B5CF6', cursor: 'pointer' }}>
            Enable AI 14-Day Forecast Mode
          </label>
        </div>

        {!showPredictions && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sliders size={18} color="#6B7280" />
            <span style={{ fontSize: '14px', color: '#374151' }}>Time Window: <strong>{days} Days</strong></span>
            <input 
              type="range" 
              min="1" 
              max="365" 
              value={days} 
              onChange={e => setDays(e.target.value)} 
              style={{ cursor: 'pointer' }}
            />
          </div>
        )}
      </div>

      {/* Visual GIS Grid Representation */}
      <div style={styles.mapContainer}>
        <div style={styles.mapCanvas}>
          <div style={styles.mapOverlayText}>
            Region: Maharashtra & Surrounding Districts
          </div>
          {loading ? (
            <p style={{ color: '#fff', textAlign: 'center', paddingTop: '150px' }}>Fetching GIS data...</p>
          ) : data.length === 0 ? (
            <p style={{ color: '#fff', textAlign: 'center', paddingTop: '150px' }}>No outbreaks reported in this timeframe. Run backend seed to view hotspots.</p>
          ) : (
            data.map(report => (
              <div 
                key={report.id} 
                style={{
                  ...styles.hotspot,
                  left: `${((report.longitude - 72) / 10) * 100}%`,
                  top: `${((22 - report.latitude) / 5) * 100}%`,
                  background: showPredictions ? 'rgba(139, 92, 246, 0.7)' : report.severity === 'High' ? 'rgba(239, 68, 68, 0.7)' : 'rgba(245, 158, 11, 0.7)',
                  borderColor: showPredictions ? '#8B5CF6' : report.severity === 'High' ? '#EF4444' : '#F59E0B'
                }}
              >
                <MapPin size={16} color="#fff" />
                <span style={styles.tooltip}>{report.diseaseName} ({showPredictions ? 'Predicted Risk' : report.severity})</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  backBtn: { display: 'flex', alignItems: 'center', gap: '8px', border: 'none', background: 'none', cursor: 'pointer', color: '#4B5563', fontWeight: 'bold' },
  controlBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '15px 20px', borderRadius: '10px', border: '1px solid #E5E7EB', marginBottom: '20px' },
  mapContainer: { background: '#1E293B', borderRadius: '16px', overflow: 'hidden', height: '450px', position: 'relative', border: '2px solid #334155' },
  mapCanvas: { width: '100%', height: '100%', position: 'relative' },
  mapOverlayText: { position: 'absolute', top: '15px', left: '15px', background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '6px 12px', borderRadius: '6px', fontSize: '12px' },
  hotspot: { position: 'absolute', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', transform: 'translate(-50%, -50%)', cursor: 'pointer', border: '2px solid', transition: 'all 0.3s' },
  tooltip: { position: 'absolute', bottom: '-25px', whiteSpace: 'nowrap', background: '#000', color: '#fff', fontSize: '11px', padding: '2px 6px', borderRadius: '4px' }
};
