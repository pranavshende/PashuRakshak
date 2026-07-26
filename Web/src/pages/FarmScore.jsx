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
    <div className="container" style={{ padding: '40px 24px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <button onClick={() => navigate('/')} className="btn btn-ghost" style={{ padding: '0 8px' }}>
          <ArrowLeft size={20} /> Back to Dashboard
        </button>
      </div>

      <h1 style={{ marginBottom: '8px' }}>📈 AI Farm Productivity Score</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Holistic performance index combining health, vaccination coverage, and milk yield.</p>

      <div className="card" style={{ padding: '48px 32px', textAlign: 'center', marginBottom: '40px' }}>
        <div style={{ 
          width: '160px', height: '160px', borderRadius: '50%', border: '8px solid', 
          borderColor: getScoreColor(score), margin: '0 auto 32px', display: 'flex', 
          flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
          boxShadow: `0 0 32px ${getScoreColor(score)}40`
        }}>
          <span style={{ fontSize: '48px', fontWeight: '800', color: getScoreColor(score), lineHeight: '1' }}>{score}</span>
          <span style={{ fontSize: '15px', color: 'var(--text-muted)', fontWeight: '600', marginTop: '4px' }}>out of 100</span>
        </div>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '20px', color: 'var(--text-main)' }}>AI Farm Recommendation</h3>
        <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '16px', lineHeight: '1.6' }}>{data?.suggestion || 'No recommendation available.'}</p>
      </div>

      <h2 style={{ marginBottom: '24px' }}>Score Breakdown</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '24px' }}>
          <div style={{ background: 'var(--secondary-light)', padding: '16px', borderRadius: 'var(--radius-sm)' }}>
            <ShieldCheck size={28} color="var(--secondary)" />
          </div>
          <div style={{ flex: 1 }}>
            <strong style={{ color: 'var(--text-main)', fontSize: '18px', display: 'block', marginBottom: '4px' }}>Vaccination Index</strong>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '15px' }}>{data?.details?.vaccinationScore || 0} / 40 Points</p>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '24px' }}>
          <div style={{ background: '#FEE2E2', padding: '16px', borderRadius: 'var(--radius-sm)' }}>
            <Heart size={28} color="var(--error)" />
          </div>
          <div style={{ flex: 1 }}>
            <strong style={{ color: 'var(--text-main)', fontSize: '18px', display: 'block', marginBottom: '4px' }}>Herd Health Rate</strong>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '15px' }}>{data?.details?.healthScore || 0} / 40 Points</p>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '24px' }}>
          <div style={{ background: '#EDE9FE', padding: '16px', borderRadius: 'var(--radius-sm)' }}>
            <Droplets size={28} color="#8B5CF6" />
          </div>
          <div style={{ flex: 1 }}>
            <strong style={{ color: 'var(--text-main)', fontSize: '18px', display: 'block', marginBottom: '4px' }}>Milk Production Trajectory</strong>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '15px' }}>{data?.details?.milkScore || 0} / 20 Points</p>
          </div>
        </div>
      </div>
    </div>
  );
}
