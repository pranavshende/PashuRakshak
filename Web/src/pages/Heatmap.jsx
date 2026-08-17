import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sliders, MapPin, Calendar, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

const DISEASES = ['All', 'Lumpy Skin Disease', 'FMD', 'Mastitis', 'Blackquarter (BQ)', 'Haemorrhagic Septicaemia'];

export default function Heatmap() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [days, setDays] = useState(30);
  const [selectedDisease, setSelectedDisease] = useState('All');
  const [showPredictions, setShowPredictions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hoveredReport, setHoveredReport] = useState(null);

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    fetchData();
  }, [days, showPredictions, selectedDisease]);

  // Initializing the Leaflet Map
  useEffect(() => {
    if (!mapInstanceRef.current && mapContainerRef.current && window.L) {
      // Center on Maharashtra coordinates [19.75, 75.7]
      const map = window.L.map(mapContainerRef.current, {
        zoomControl: true,
        scrollWheelZoom: true
      }).setView([19.75, 75.7], 6.5);

      // CartoDB Positron Tile Layer (Premium, light, clean slate aesthetics)
      window.L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Markers when data or showPredictions changes
  useEffect(() => {
    if (!mapInstanceRef.current || !window.L) return;

    // Clear previous markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    if (data.length === 0) return;

    const map = mapInstanceRef.current;
    const markerGroup = [];

    data.forEach(report => {
      const colors = getColors(report);
      
      // Dynamic sizes for high severity/predictions
      const markerSize = showPredictions ? 12 : report.severity === 'High' ? 15 : 10;

      const circle = window.L.circleMarker([report.latitude, report.longitude], {
        radius: markerSize,
        fillColor: colors.dot,
        color: colors.border,
        weight: 2,
        opacity: 0.9,
        fillOpacity: 0.4
      }).addTo(map);

      // Styled Tooltip Popup
      circle.bindTooltip(`
        <div style="font-family: Inter, sans-serif; padding: 4px; font-size: 12px; line-height: 1.4;">
          <strong style="color: var(--primary-dark);">${report.diseaseName}</strong><br/>
          <span>Severity: ${report.severity || report.riskLevel || 'Medium'}</span>
        </div>
      `, { direction: 'top', offset: [0, -5] });

      // Click / hover behavior to show info in sidebar
      circle.on('click', () => {
        setHoveredReport(report);
      });
      circle.on('mouseover', () => {
        setHoveredReport(report);
      });

      markersRef.current.push(circle);
      markerGroup.push([report.latitude, report.longitude]);
    });

    // Auto-fit map viewport boundaries if markers exist
    if (markerGroup.length > 0) {
      try {
        const bounds = window.L.latLngBounds(markerGroup);
        map.fitBounds(bounds, { padding: [40, 40] });
      } catch (e) {
        console.warn('Map fitBounds failed:', e);
      }
    }
  }, [data, showPredictions]);

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

  const getColors = (report) => {
    if (showPredictions) {
      const isHigh = report.riskLevel === 'High';
      return {
        bg: 'rgba(139, 92, 246, 0.2)',
        border: isHigh ? '#7C3AED' : '#A78BFA',
        dot: isHigh ? '#6D28D9' : '#8B5CF6'
      };
    }
    
    switch (report.severity) {
      case 'High':
      case 'CRITICAL':
        return { bg: 'rgba(239, 68, 68, 0.2)', border: '#EF4444', dot: '#DC2626' };
      case 'Medium':
      case 'MODERATE':
        return { bg: 'rgba(245, 158, 11, 0.2)', border: '#F59E0B', dot: '#D97706' };
      default:
        return { bg: 'rgba(59, 130, 246, 0.2)', border: '#3B82F6', dot: '#2563EB' };
    }
  };

  return (
    <div className="page-content-container" style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Back button */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
        <button onClick={() => navigate('/dashboard')} className="btn btn-ghost" style={{ padding: '0 8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          🗺️ AI Disease Outbreak Surveillance Map
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
          Real-time GIS surveillance visualization, historical clusters, and 14-day predictive hotspot forecasts.
        </p>
      </div>

      {/* Control Bar */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', marginBottom: '24px', flexWrap: 'wrap', gap: '20px', background: '#fff', border: '1px solid var(--border)', borderRadius: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
          
          {/* Toggle Switch */}
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
                background: showPredictions ? 'var(--primary-dark)' : '#CBD5E1', 
                borderRadius: '24px', transition: '0.3s' 
              }}>
                <div style={{ 
                  position: 'absolute', top: '2px', left: showPredictions ? '26px' : '2px', 
                  width: '20px', height: '20px', background: '#fff', borderRadius: '50%', transition: '0.3s' 
                }} />
              </div>
            </div>
            <span style={{ fontWeight: '700', color: showPredictions ? 'var(--primary-dark)' : 'var(--text-main)', fontSize: '13px' }}>
              Enable AI 14-Day Forecast Mode
            </span>
          </label>

          {/* Disease Filter */}
          {!showPredictions && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>Disease Filter:</span>
              <select 
                className="input" 
                style={{ width: '180px', height: '36px', padding: '0 8px', fontSize: '12px', borderRadius: '8px', border: '1px solid var(--border)' }}
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

        {/* Time Slider */}
        {!showPredictions && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, maxWidth: '340px' }}>
            <Sliders size={16} color="var(--text-muted)" />
            <span style={{ fontSize: '13px', color: 'var(--text-main)', whiteSpace: 'nowrap' }}>
              Time Window: <strong style={{ color: 'var(--primary-dark)' }}>{days} Days</strong>
            </span>
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

      {/* Main Layout containing Map + Info Panel */}
      <div style={{ display: 'flex', gap: '24px', flexDirection: 'row', flexWrap: 'wrap' }}>
        
        {/* Visual Map Area */}
        <div style={{ flex: 2, minWidth: '350px', background: '#F8FAFC', borderRadius: '16px', overflow: 'hidden', height: '520px', position: 'relative', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
          
          {/* Map canvas node */}
          <div 
            ref={mapContainerRef} 
            style={{ width: '100%', height: '100%', position: 'relative', zIndex: 1 }} 
          />

          {/* Region HUD Overlay */}
          <div style={{ position: 'absolute', top: '16px', left: '16px', background: 'rgba(255, 255, 255, 0.9)', border: '1px solid var(--border)', color: 'var(--text-main)', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', backdropFilter: 'blur(4px)', zIndex: 10 }}>
            📍 Live Interactive GIS Map
          </div>

          {loading && (
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(248, 250, 252, 0.8)', zIndex: 15 }}>
              <div className="spinner"></div>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '12px' }}>Updating GIS surveillance markers...</p>
            </div>
          )}

          {!loading && data.length === 0 && (
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 15, padding: '24px', textAlign: 'center', background: '#F8FAFC' }}>
              <AlertCircle size={40} color="var(--text-muted)" style={{ marginBottom: '12px' }} />
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)' }}>No surveillance data available</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px', maxWidth: '300px' }}>
                There are no reported outbreak clusters matching the selected filters.
              </p>
            </div>
          )}
        </div>

        {/* Legend / Hover Card Sidebar Panel */}
        <div style={{ flex: 1, minWidth: '280px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Detail display for hovered report */}
          <div className="card" style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px', flex: 1 }}>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-main)', borderBottom: '1px solid var(--border-light)', paddingBottom: '10px', marginBottom: '14px' }}>
              Cluster Information
            </h3>
            {hoveredReport ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Disease Diagnosis</div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--primary-dark)', marginTop: '2px' }}>{hoveredReport.diseaseName}</div>
                </div>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Confirmed Cases</div>
                    <div style={{ fontSize: '14px', fontWeight: 700, marginTop: '2px' }}>{hoveredReport.confirmedCases || 1} Cases</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Severity</div>
                    <span className={`badge badge-${(hoveredReport.severity || hoveredReport.riskLevel || 'LOW').toLowerCase()}`} style={{ display: 'inline-block', marginTop: '2px' }}>
                      {hoveredReport.severity || hoveredReport.riskLevel || 'Low'}
                    </span>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Location Coordinates</div>
                  <div style={{ fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                    <MapPin size={12} color="var(--text-muted)" />
                    {hoveredReport.latitude.toFixed(4)}° N, {hoveredReport.longitude.toFixed(4)}° E
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Reported Time</div>
                  <div style={{ fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                    <Calendar size={12} color="var(--text-muted)" />
                    {new Date(hoveredReport.reportedAt || hoveredReport.predictedFor || hoveredReport.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                💡 Click or hover over any map marker to view detailed cluster statistics.
              </div>
            )}
          </div>

          {/* Color Code Legend */}
          <div className="card" style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-main)', borderBottom: '1px solid var(--border-light)', paddingBottom: '10px', marginBottom: '14px' }}>
              Map Legend
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: '#DC2626', border: '1px solid #EF4444' }} />
                <span style={{ fontSize: '12px', fontWeight: 600 }}>High / Critical Severity</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: '#D97706', border: '1px solid #F59E0B' }} />
                <span style={{ fontSize: '12px', fontWeight: 600 }}>Medium / Moderate Severity</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: '#2563EB', border: '1px solid #3B82F6' }} />
                <span style={{ fontSize: '12px', fontWeight: 600 }}>Low / Healthy Baseline</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: '#7C3AED', border: '1px solid #8B5CF6' }} />
                <span style={{ fontSize: '12px', fontWeight: 600 }}>AI Predictive Hotspots</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
