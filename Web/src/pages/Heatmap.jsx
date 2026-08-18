import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';

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

      // CartoDB Positron Tile Layer
      window.L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
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

  // Update Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !window.L) return;

    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    if (data.length === 0) return;

    const map = mapInstanceRef.current;
    const markerGroup = [];

    data.forEach(report => {
      const colors = getColors(report);
      const markerSize = showPredictions ? 12 : report.severity === 'High' ? 15 : 10;

      const circle = window.L.circleMarker([report.latitude, report.longitude], {
        radius: markerSize,
        fillColor: colors.dot,
        color: colors.border,
        weight: 2,
        opacity: 0.9,
        fillOpacity: 0.4
      }).addTo(map);

      circle.bindTooltip(`
        <div style="padding: 4px; font-size: 12px; line-height: 1.4;">
          <strong>${report.diseaseName}</strong><br/>
          <span>Severity: ${report.severity || report.riskLevel || 'Medium'}</span>
        </div>
      `, { direction: 'top', offset: [0, -5] });

      circle.on('click', () => setHoveredReport(report));
      circle.on('mouseover', () => setHoveredReport(report));

      markersRef.current.push(circle);
      markerGroup.push([report.latitude, report.longitude]);
    });

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
      return { border: isHigh ? '#7C3AED' : '#A78BFA', dot: isHigh ? '#6D28D9' : '#8B5CF6' };
    }
    
    switch (report.severity) {
      case 'High':
      case 'CRITICAL':
        return { border: 'var(--risk-critical)', dot: 'var(--risk-critical)' };
      case 'Medium':
      case 'MODERATE':
        return { border: 'var(--risk-high)', dot: 'var(--risk-high)' };
      default:
        return { border: 'var(--primary)', dot: 'var(--primary)' };
    }
  };

  return (
    <div className="page-content-container" style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 4px' }}>
          AI Disease Outbreak Surveillance Map
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-sub)', margin: 0 }}>
          Real-time GIS surveillance visualization, historical clusters, and 14-day predictive hotspot forecasts.
        </p>
      </div>

      {/* Control Bar */}
      <div style={{ padding: '16px 20px', marginBottom: '24px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '4px', display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>View Mode:</label>
          <select 
            value={showPredictions ? 'forecast' : 'historical'} 
            onChange={e => setShowPredictions(e.target.value === 'forecast')}
            style={{ padding: '6px 12px', fontSize: '13px', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--bg-base)', outline: 'none' }}
          >
            <option value="historical">Historical Surveillance</option>
            <option value="forecast">14-Day AI Forecast</option>
          </select>
        </div>

        {!showPredictions && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>Disease Type:</label>
            <select 
              style={{ padding: '6px 12px', fontSize: '13px', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--bg-base)', outline: 'none' }}
              value={selectedDisease}
              onChange={e => setSelectedDisease(e.target.value)}
            >
              {DISEASES.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        )}

        {!showPredictions && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>Time Window:</label>
            <select 
              style={{ padding: '6px 12px', fontSize: '13px', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--bg-base)', outline: 'none' }}
              value={days}
              onChange={e => setDays(Number(e.target.value))}
            >
              <option value={7}>Last 7 Days</option>
              <option value={14}>Last 14 Days</option>
              <option value={30}>Last 30 Days</option>
            </select>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '24px', flexDirection: 'row', flexWrap: 'wrap' }}>
        
        {/* Visual Map Area */}
        <div style={{ flex: 2, minWidth: '350px', background: 'var(--bg-card)', borderRadius: '4px', overflow: 'hidden', height: '600px', position: 'relative', border: '1px solid var(--border)' }}>
          <div ref={mapContainerRef} style={{ width: '100%', height: '100%', position: 'relative', zIndex: 1 }} />

          <div style={{ position: 'absolute', top: '16px', left: '16px', background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-main)', padding: '6px 12px', borderRadius: '4px', fontSize: '12px', fontWeight: '600', zIndex: 10, boxShadow: 'var(--shadow)' }}>
            Live Interactive GIS Map
          </div>

          {loading && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(255, 255, 255, 0.8)', zIndex: 15 }}>
              <LoadingSkeleton type="chart" />
            </div>
          )}

          {!loading && data.length === 0 && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 15, background: 'rgba(255, 255, 255, 0.9)' }}>
              <AlertCircle size={40} color="var(--text-muted)" style={{ marginBottom: '12px' }} />
              <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)', margin: '0 0 4px' }}>No surveillance data available</h3>
              <p style={{ color: 'var(--text-sub)', fontSize: '13px', margin: 0 }}>There are no reported outbreak clusters matching the selected filters.</p>
            </div>
          )}
        </div>

        {/* Sidebar Panel */}
        <div style={{ flex: 1, minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-base)' }}>
              <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: 'var(--text-main)' }}>Cluster Information</h3>
            </div>
            
            <div style={{ padding: '20px' }}>
              {hoveredReport ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-sub)', textTransform: 'uppercase', marginBottom: '4px' }}>Disease Diagnosis</div>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)' }}>{hoveredReport.diseaseName}</div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-sub)', textTransform: 'uppercase', marginBottom: '4px' }}>Cases</div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>{hoveredReport.confirmedCases || 1} Cases</div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-sub)', textTransform: 'uppercase', marginBottom: '4px' }}>Severity</div>
                      <span style={{ 
                        padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700, 
                        backgroundColor: hoveredReport.severity === 'High' ? 'var(--risk-critical-bg)' : hoveredReport.severity === 'Medium' ? 'var(--risk-high-bg)' : 'var(--risk-low-bg)', 
                        color: hoveredReport.severity === 'High' ? 'var(--risk-critical)' : hoveredReport.severity === 'Medium' ? 'var(--risk-high)' : 'var(--risk-low)' 
                      }}>
                        {hoveredReport.severity || hoveredReport.riskLevel || 'Low'}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-sub)', textTransform: 'uppercase', marginBottom: '4px' }}>Location Coordinates</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <MapPin size={14} color="var(--text-muted)" />
                      {hoveredReport.latitude.toFixed(4)}° N, {hoveredReport.longitude.toFixed(4)}° E
                    </div>
                  </div>
                  
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-sub)', textTransform: 'uppercase', marginBottom: '4px' }}>Reported Time</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={14} color="var(--text-muted)" />
                      {new Date(hoveredReport.reportedAt || hoveredReport.predictedFor || hoveredReport.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  {hoveredReport.weather && (
                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', marginTop: '8px' }}>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-sub)', textTransform: 'uppercase', marginBottom: '12px' }}>Climate Vector Intel</div>
                      <div style={{ display: 'flex', gap: '16px', marginBottom: '12px' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '12px', color: 'var(--text-sub)', marginBottom: '4px' }}>Temperature</div>
                          <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>{hoveredReport.weather.temperature}°C</div>
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '12px', color: 'var(--text-sub)', marginBottom: '4px' }}>Humidity</div>
                          <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>{hoveredReport.weather.humidity}%</div>
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', color: 'var(--text-sub)', marginBottom: '4px' }}>Vector Risk Index</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '16px', fontWeight: 700, color: hoveredReport.weather.vectorRiskIndex > 50 ? 'var(--risk-critical)' : 'var(--risk-low)' }}>
                            {hoveredReport.weather.vectorRiskIndex}
                          </span>
                          <span style={{ fontSize: '11px', color: 'var(--text-sub)' }}>
                            {hoveredReport.weather.vectorRiskIndex > 52 ? 'High Insect Spread' : 'Low Activity'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                  Click or hover over any map marker to view detailed cluster statistics.
                </div>
              )}
            </div>
          </div>

          {/* Color Code Legend */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-base)' }}>
              <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: 'var(--text-main)' }}>Map Legend</h3>
            </div>
            
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--risk-critical)', border: '1px solid var(--risk-critical)' }} />
                <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-main)' }}>High / Critical Severity</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--risk-high)', border: '1px solid var(--risk-high)' }} />
                <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-main)' }}>Medium / Moderate Severity</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--risk-low)', border: '1px solid var(--risk-low)' }} />
                <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-main)' }}>Low / Healthy Baseline</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#8B5CF6', border: '1px solid #7C3AED' }} />
                <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-main)' }}>AI Predictive Hotspots</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
