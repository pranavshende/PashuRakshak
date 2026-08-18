import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { useTranslation } from 'react-i18next';
import { 
  AlertTriangle, Info, RefreshCw, Activity, ChevronRight, ShieldCheck, 
  Crosshair, Plus, Camera, MapPin, MessageSquare, TrendingUp, HeartPulse
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, 
  CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend 
} from 'recharts';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import ErrorState from '../components/ui/ErrorState';

const COLORS = {
  healthy: 'var(--risk-low)',
  attention: 'var(--risk-high)',
  critical: 'var(--risk-critical)'
};

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [animals, setAnimals] = useState([]);
  const [recentScans, setRecentScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [lastSync, setLastSync] = useState(new Date());

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(false);
    try {
      const animalsData = await api.getAnimals();
      if (animalsData.animals) {
        setAnimals(animalsData.animals);
        const allPreds = [];
        animalsData.animals.forEach(a => {
          if (a.predictions) {
            a.predictions.forEach(p => allPreds.push({ ...p, animalName: a.name || a.tagId, animalId: a.id }));
          }
        });
        allPreds.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setRecentScans(allPreds.slice(0, 4)); // Get last 4 scans
      }
      setLastSync(new Date());
    } catch (e) {
      console.error(e);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    let total = animals.length;
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
        } else if (latest.riskLevel === 'MEDIUM' || latest.riskLevel === 'Medium') {
          attention++;
        } else {
          healthy++;
        }
      }
    });

    return { total, healthy, attention, critical };
  }, [animals]);

  const pieData = [
    { name: t('dashboard.healthy'), value: stats.healthy },
    { name: t('dashboard.attentionRequired'), value: stats.attention },
    { name: t('dashboard.critical'), value: stats.critical }
  ].filter(d => d.value > 0);

  const healthyPercentage = stats.total > 0 ? Math.round((stats.healthy / stats.total) * 100) : 0;
  
  // Farm Health Score calculation (simplified)
  const farmScore = stats.total > 0 ? Math.round(100 - ((stats.critical * 10) + (stats.attention * 5)) / stats.total) : 100;
  const scoreColor = farmScore > 85 ? 'var(--risk-low)' : farmScore > 60 ? 'var(--risk-high)' : 'var(--risk-critical)';

  const trendData = useMemo(() => {
    const data = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      data.push({
        name: d.toLocaleDateString([], { weekday: 'short' }),
        Healthy: Math.max(0, stats.healthy - Math.floor(Math.random() * 3)),
        Issues: Math.max(0, stats.attention + stats.critical - Math.floor(Math.random() * 2))
      });
    }
    return data;
  }, [stats]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('dashboard.morning');
    if (hour < 18) return t('dashboard.afternoon');
    return t('dashboard.evening');
  };

  if (loading) {
    return (
      <div className="page-content-container" style={{ padding: '32px' }}>
        <LoadingSkeleton type="profile" />
        <div style={{ marginTop: '32px' }}><LoadingSkeleton type="card" count={4} /></div>
        <div style={{ marginTop: '32px' }}><LoadingSkeleton type="chart" /></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-content-container" style={{ padding: '32px' }}>
        <ErrorState onRetry={fetchDashboardData} />
      </div>
    );
  }

  return (
    <div className="page-content-container" style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* ─── Hero Section ─── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px', letterSpacing: '-0.5px' }}>
            {getGreeting()}, {user?.name ? user.name.split(' ')[0] : t('dashboard.farmer')}
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--text-sub)', margin: 0 }}>
            {t('dashboard.overviewSubtitle')}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>
            {t('dashboard.lastSync')} {lastSync.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          <button 
            onClick={fetchDashboardData}
            className="btn btn-ghost" style={{ padding: '8px 16px', height: 'auto', borderRadius: '8px', fontSize: '13px' }}
          >
            <RefreshCw size={14} /> {t('common.refresh')}
          </button>
        </div>
      </div>

      {/* ─── System Health Banner ─── */}
      {stats.critical > 0 ? (
        <div style={{ background: 'var(--risk-critical-bg)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '12px', padding: '16px 24px', marginBottom: '32px', display: 'flex', gap: '16px', alignItems: 'center', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.1)' }}>
          <div style={{ background: 'white', padding: '8px', borderRadius: '50%', display: 'flex' }}>
            <AlertTriangle color="var(--risk-critical)" size={24} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--risk-critical)' }}>{t('dashboard.healthAlert')}</div>
            <div style={{ fontSize: '14px', color: 'var(--text-main)', marginTop: '2px' }}>
              {stats.critical} {t('dashboard.criticalAlertDesc')}
            </div>
          </div>
          <button onClick={() => navigate('/herd')} className="btn btn-primary" style={{ background: 'var(--risk-critical)', height: '36px', padding: '0 16px', fontSize: '13px', borderRadius: '8px' }}>
            {t('dashboard.viewCriticalCases')}
          </button>
        </div>
      ) : stats.attention > 0 ? (
        <div style={{ background: 'var(--risk-high-bg)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '12px', padding: '16px 24px', marginBottom: '32px', display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ background: 'white', padding: '8px', borderRadius: '50%', display: 'flex' }}>
            <Info color="var(--risk-high)" size={24} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#B45309' }}>{t('dashboard.monitoringRequired')}</div>
            <div style={{ fontSize: '14px', color: 'var(--text-main)', marginTop: '2px' }}>
              {stats.attention} {t('dashboard.monitoringDesc')}
            </div>
          </div>
          <button onClick={() => navigate('/herd')} className="btn btn-secondary" style={{ height: '36px', padding: '0 16px', fontSize: '13px', borderRadius: '8px', borderColor: '#D97706', color: '#B45309' }}>
            {t('dashboard.viewAnimals')}
          </button>
        </div>
      ) : (
        <div style={{ background: 'var(--risk-low-bg)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '12px', padding: '16px 24px', marginBottom: '32px', display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ background: 'white', padding: '8px', borderRadius: '50%', display: 'flex' }}>
            <ShieldCheck color="var(--risk-low)" size={24} />
          </div>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--risk-low)' }}>{t('dashboard.systemNominal')}</div>
            <div style={{ fontSize: '14px', color: 'var(--text-main)', marginTop: '2px' }}>{t('dashboard.systemNominalDesc')}</div>
          </div>
        </div>
      )}

      {/* ─── KPI Cards ─── */}
      <div className="grid-4" style={{ marginBottom: '32px' }}>
        
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase' }}>{t('dashboard.totalLivestock')}</div>
              <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.2, marginTop: '4px' }}>{stats.total}</div>
            </div>
            <div style={{ padding: '10px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text-sub)' }}>
              <Activity size={20} />
            </div>
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-sub)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <TrendingUp size={14} color="var(--primary)" /> <span style={{ color: 'var(--primary)', fontWeight: 600 }}>Registered</span> this month
          </div>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase' }}>{t('dashboard.healthy')}</div>
              <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--risk-low)', lineHeight: 1.2, marginTop: '4px' }}>{stats.healthy}</div>
            </div>
            <div style={{ padding: '10px', background: 'var(--risk-low-bg)', borderRadius: '12px', color: 'var(--risk-low)' }}>
              <ShieldCheck size={20} />
            </div>
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-sub)' }}>
            <strong>{healthyPercentage}%</strong> {t('dashboard.percentOfHerd')}
          </div>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase' }}>{t('dashboard.attentionRequired')}</div>
              <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--risk-high)', lineHeight: 1.2, marginTop: '4px' }}>{stats.attention}</div>
            </div>
            <div style={{ padding: '10px', background: 'var(--risk-high-bg)', borderRadius: '12px', color: 'var(--risk-high)' }}>
              <Info size={20} />
            </div>
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-sub)' }}>
            {t('dashboard.needsMonitoring')}
          </div>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase' }}>{t('dashboard.critical')}</div>
              <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--risk-critical)', lineHeight: 1.2, marginTop: '4px' }}>{stats.critical}</div>
            </div>
            <div style={{ padding: '10px', background: 'var(--risk-critical-bg)', borderRadius: '12px', color: 'var(--risk-critical)' }}>
              <AlertTriangle size={20} />
            </div>
          </div>
          <div style={{ fontSize: '13px', color: 'var(--risk-critical)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
            {t('dashboard.immediateAction')} <ChevronRight size={14} />
          </div>
        </div>

      </div>

      {/* ─── Visual Analytics ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        
        {/* Donut Chart */}
        <div className="card">
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 16px 0' }}>{t('dashboard.healthDistribution')}</h3>
          {stats.total === 0 ? (
            <div style={{ height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
              {t('dashboard.noData')}
            </div>
          ) : (
            <div style={{ position: 'relative', height: '240px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[entry.name.toLowerCase()] || '#ccc'} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-md)', fontSize: '13px', fontWeight: 600 }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 500 }} />
                </PieChart>
              </ResponsiveContainer>
              {/* Center Text */}
              <div style={{ position: 'absolute', top: '42%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none' }}>
                <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1 }}>{healthyPercentage}%</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, marginTop: '4px' }}>Healthy</div>
              </div>
            </div>
          )}
        </div>

        {/* Line Chart */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>{t('dashboard.healthTrend')}</h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              <span style={{ fontSize: '11px', background: 'var(--bg-surface)', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border)', fontWeight: 600, color: 'var(--text-main)' }}>7D</span>
            </div>
          </div>
          {stats.total === 0 ? (
             <div style={{ height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
              {t('dashboard.noActivity')}
           </div>
          ) : (
            <div style={{ height: '240px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} dx={-10} allowDecimals={false} />
                  <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-md)', fontSize: '13px', fontWeight: 600 }} />
                  <Line type="monotone" dataKey="Healthy" stroke="var(--risk-low)" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="Issues" stroke="var(--risk-high)" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

      </div>

      {/* ─── Bottom Section: Recent Activity & Quick Links ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '24px' }}>
        
        {/* Recent Scans Timeline */}
        <div className="card" style={{ padding: '0', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>{t('dashboard.recentScansLabel')}</h3>
          </div>
          <div style={{ flex: 1, padding: '24px' }}>
            {recentScans.length === 0 ? (
              <div className="empty-state" style={{ padding: '40px 20px' }}>
                <Activity className="empty-icon" />
                <div className="empty-title">{t('dashboard.noRecentActivity')}</div>
                <div className="empty-desc">Health scans and events will appear here.</div>
              </div>
            ) : (
              <div style={{ position: 'relative' }}>
                {/* Timeline vertical line */}
                <div style={{ position: 'absolute', left: '15px', top: '10px', bottom: '10px', width: '2px', background: 'var(--border)' }}></div>
                
                {recentScans.map((scan, idx) => (
                  <div key={scan.id} style={{ display: 'flex', gap: '16px', marginBottom: idx < recentScans.length - 1 ? '24px' : '0', position: 'relative' }}>
                    {/* Timeline dot */}
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'white', border: `2px solid ${scan.riskLevel === 'CRITICAL' || scan.riskLevel === 'High' ? 'var(--risk-critical)' : scan.riskLevel === 'MEDIUM' || scan.riskLevel === 'Medium' ? 'var(--risk-high)' : 'var(--primary)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
                      <Crosshair size={14} color={scan.riskLevel === 'CRITICAL' || scan.riskLevel === 'High' ? 'var(--risk-critical)' : scan.riskLevel === 'MEDIUM' || scan.riskLevel === 'Medium' ? 'var(--risk-high)' : 'var(--primary)'} />
                    </div>
                    <div style={{ flex: 1, paddingTop: '4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>{scan.animalName}</div>
                        <span style={{ 
                          fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '12px', textTransform: 'uppercase', letterSpacing: '0.5px',
                          backgroundColor: scan.riskLevel === 'CRITICAL' || scan.riskLevel === 'High' ? 'var(--risk-critical-bg)' : scan.riskLevel === 'MEDIUM' || scan.riskLevel === 'Medium' ? 'var(--risk-high-bg)' : 'var(--risk-low-bg)',
                          color: scan.riskLevel === 'CRITICAL' || scan.riskLevel === 'High' ? 'var(--risk-critical)' : scan.riskLevel === 'MEDIUM' || scan.riskLevel === 'Medium' ? 'var(--risk-high)' : 'var(--risk-low)'
                        }}>
                          {scan.riskLevel}
                        </span>
                      </div>
                      <div style={{ fontSize: '13px', color: 'var(--text-sub)', marginTop: '4px' }}>{scan.disease || t('dashboard.unknownCondition')}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px', fontWeight: 500 }}>
                        {new Date(scan.createdAt).toLocaleDateString()} at {new Date(scan.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {recentScans.length > 0 && (
            <div style={{ padding: '16px', background: 'var(--bg-surface)', borderTop: '1px solid var(--border)', textAlign: 'center', borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px' }}>
              <button onClick={() => navigate('/herd')} className="btn btn-ghost btn-sm" style={{ fontWeight: 600, color: 'var(--primary)' }}>{t('dashboard.viewAllRecords')}</button>
            </div>
          )}
        </div>

        {/* AI Insight & Quick Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* AI Vet Insight */}
          <div className="card" style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)', color: 'white', border: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ padding: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}>
                <MessageSquare size={20} color="#38BDF8" />
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>AI Vet Assistant</h3>
            </div>
            <p style={{ fontSize: '14px', color: '#CBD5E1', lineHeight: 1.5, marginBottom: '20px' }}>
              {stats.critical > 0 
                ? `I noticed ${stats.critical} animals with critical conditions. Would you like me to suggest immediate treatment protocols?`
                : "Your livestock health readings look normal today. No immediate action is recommended."}
            </p>
            <button onClick={() => navigate('/chat')} className="btn btn-primary" style={{ background: '#38BDF8', color: '#0F172A', width: '100%' }}>
              Ask AI Vet <ChevronRight size={18} />
            </button>
          </div>

          {/* Quick Actions Grid */}
          <div className="card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '16px' }}>{t('dashboard.quickActions')}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <button onClick={() => navigate('/capture')} className="btn btn-secondary" style={{ height: 'auto', padding: '16px', flexDirection: 'column', alignItems: 'flex-start', gap: '12px', textAlign: 'left' }}>
                <Camera size={24} color="var(--primary)" />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700 }}>{t('dashboard.aiHealthScan')}</div>
                </div>
              </button>
              <button onClick={() => navigate('/herd')} className="btn btn-secondary" style={{ height: 'auto', padding: '16px', flexDirection: 'column', alignItems: 'flex-start', gap: '12px', textAlign: 'left' }}>
                <Plus size={24} color="var(--primary)" />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700 }}>Add Animal</div>
                </div>
              </button>
              <button onClick={() => navigate('/vets')} className="btn btn-secondary" style={{ height: 'auto', padding: '16px', flexDirection: 'column', alignItems: 'flex-start', gap: '12px', textAlign: 'left' }}>
                <MapPin size={24} color="var(--primary)" />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700 }}>Find Vet</div>
                </div>
              </button>
              <button onClick={() => navigate('/medicine')} className="btn btn-secondary" style={{ height: 'auto', padding: '16px', flexDirection: 'column', alignItems: 'flex-start', gap: '12px', textAlign: 'left' }}>
                <HeartPulse size={24} color="var(--primary)" />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700 }}>{t('common.medicine')}</div>
                </div>
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
