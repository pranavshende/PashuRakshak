import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, ShieldCheck, Heart, Droplets } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

export default function FarmScore() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchScore();
  }, []);

  const fetchScore = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/farm/score`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Calculating Farm Score...</div>;

  const score = data?.score || 0;
  const getScoreColor = (s) => s >= 80 ? '#10B981' : s >= 50 ? '#F59E0B' : '#EF4444';

  return (
    <div className="page-container" style={{ padding: '20px', maxWidth: '750px', margin: '0 auto' }}>
      <button onClick={() => navigate('/')} style={styles.backBtn}>
        <ArrowLeft size={20} /> Back to Dashboard
      </button>

      <h1 style={{ color: '#111827', marginTop: '15px' }}>📈 AI Farm Productivity Score</h1>
      <p style={{ color: '#6B7280', marginBottom: '20px' }}>Holistic performance index combining health, vaccination coverage, and milk yield.</p>

      <div style={styles.mainCard}>
        <div style={{ ...styles.circle, borderColor: getScoreColor(score) }}>
          <span style={{ ...styles.scoreVal, color: getScoreColor(score) }}>{score}</span>
          <span style={{ fontSize: '14px', color: '#6B7280' }}>out of 100</span>
        </div>
        <h3 style={{ margin: '15px 0 5px 0', color: '#1F2937' }}>AI Farm Recommendation</h3>
        <p style={{ color: '#4B5563', margin: 0 }}>{data?.suggestion || 'No recommendation available.'}</p>
      </div>

      <h2 style={{ marginTop: '30px', color: '#111827' }}>Score Breakdown</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '10px' }}>
        <div style={styles.metricCard}>
          <ShieldCheck size={24} color="#3B82F6" />
          <div style={{ flex: 1 }}>
            <strong style={{ color: '#111827' }}>Vaccination Index</strong>
            <p style={{ margin: 0, color: '#6B7280', fontSize: '14px' }}>{data?.details?.vaccinationScore || 0} / 40 Points</p>
          </div>
        </div>

        <div style={styles.metricCard}>
          <Heart size={24} color="#EF4444" />
          <div style={{ flex: 1 }}>
            <strong style={{ color: '#111827' }}>Herd Health Rate</strong>
            <p style={{ margin: 0, color: '#6B7280', fontSize: '14px' }}>{data?.details?.healthScore || 0} / 40 Points</p>
          </div>
        </div>

        <div style={styles.metricCard}>
          <Droplets size={24} color="#8B5CF6" />
          <div style={{ flex: 1 }}>
            <strong style={{ color: '#111827' }}>Milk Production Trajectory</strong>
            <p style={{ margin: 0, color: '#6B7280', fontSize: '14px' }}>{data?.details?.milkScore || 0} / 20 Points</p>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  backBtn: { display: 'flex', alignItems: 'center', gap: '8px', border: 'none', background: 'none', cursor: 'pointer', color: '#4B5563', fontWeight: 'bold' },
  mainCard: { background: '#fff', padding: '30px', borderRadius: '16px', border: '1px solid #E5E7EB', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' },
  circle: { width: '120px', height: '120px', borderRadius: '60px', border: '6px solid', margin: '0 auto', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' },
  scoreVal: { fontSize: '36px', fontWeight: 'bold' },
  metricCard: { display: 'flex', alignItems: 'center', gap: '15px', background: '#fff', padding: '15px', borderRadius: '10px', border: '1px solid #E5E7EB' }
};
