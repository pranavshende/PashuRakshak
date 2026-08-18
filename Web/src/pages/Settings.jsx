import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, CheckCircle, Save, LogOut } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

export default function Settings() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { t, i18n } = useTranslation();
  const [cleared, setCleared] = useState(false);
  const [profile, setProfile] = useState({ name: '', phone: '', email: '', farmName: '', language: 'English', notificationsEnabled: true });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await api.getCurrentUser();
      if (data.user) {
        setProfile({
          name: data.user.name || '',
          phone: data.user.phone || '',
          email: data.user.email || '',
          farmName: data.user.farmName || '',
          language: data.user.language || 'English',
          notificationsEnabled: data.user.notificationsEnabled !== false
        });
        
        // Sync i18n with initial fetched profile language
        if (data.user.language === 'Hindi') i18n.changeLanguage('hi');
        else if (data.user.language === 'Marathi') i18n.changeLanguage('mr');
        else i18n.changeLanguage('en');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleClearCache = () => {
    const token = localStorage.getItem('userToken');
    const u = localStorage.getItem('user');
    localStorage.clear();
    if (token) localStorage.setItem('userToken', token);
    if (u) localStorage.setItem('user', u);

    setCleared(true);
    setTimeout(() => setCleared(false), 3000);
  };

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setProfile({...profile, language: newLang});
    
    // Instantly update UI language globally
    if (newLang === 'Hindi') i18n.changeLanguage('hi');
    else if (newLang === 'Marathi') i18n.changeLanguage('mr');
    else i18n.changeLanguage('en');
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const data = await api.updateProfile(profile);
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (e) {
      console.error(e);
      alert(e.message || t('common.error'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-content-container" style={{ padding: '40px 24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
        {t('common.loading')}
      </div>
    );
  }

  return (
    <div className="page-content-container" style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      
      {/* Header Section */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
        <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', color: 'var(--text-sub)', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', padding: 0, fontWeight: 600 }}>
          <ArrowLeft size={16} /> {t('settings.backToDashboard')}
        </button>
      </div>

      <div style={{ paddingBottom: '16px', borderBottom: '1px solid var(--border)', marginBottom: '32px' }}>
        <h1 style={{ margin: '0 0 4px 0', fontSize: '24px', fontWeight: 700, color: 'var(--text-main)' }}>{t('settings.configTitle')}</h1>
        <p style={{ margin: 0, color: 'var(--text-sub)', fontSize: '14px' }}>{t('settings.configSub')}</p>
      </div>

      {/* Profile Settings */}
      <div style={{ marginBottom: '40px' }}>
        <h3 style={{ margin: '0 0 16px 0', color: 'var(--text-main)', fontSize: '16px', fontWeight: 600 }}>{t('settings.farmerProfile')}</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '24px', borderRadius: '4px' }}>
          
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>{t('settings.fullName')}</label>
              <input 
                className="input"
                value={profile.name} 
                onChange={e => setProfile({...profile, name: e.target.value})} 
              />
            </div>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>{t('settings.contactNumber')}</label>
              <input 
                className="input"
                value={profile.phone} 
                onChange={e => setProfile({...profile, phone: e.target.value})} 
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>{t('settings.emailAddress')}</label>
              <input 
                className="input"
                value={profile.email} 
                onChange={e => setProfile({...profile, email: e.target.value})} 
                placeholder="farmer@example.com"
              />
            </div>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>{t('settings.farmNameLocation')}</label>
              <input 
                className="input"
                value={profile.farmName} 
                onChange={e => setProfile({...profile, farmName: e.target.value})} 
              />
            </div>
          </div>

          <div style={{ marginTop: '8px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>{t('settings.appLanguage')}</label>
            <select 
              className="input"
              style={{ width: '240px' }}
              value={profile.language}
              onChange={handleLanguageChange}
            >
              <option value="English">English</option>
              <option value="Hindi">हिन्दी (Hindi)</option>
              <option value="Marathi">मराठी (Marathi)</option>
            </select>
          </div>

          <div style={{ marginTop: '8px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: 500, color: 'var(--text-main)' }}>
              <input 
                type="checkbox" 
                checked={profile.notificationsEnabled} 
                onChange={e => setProfile({...profile, notificationsEnabled: e.target.checked})}
                style={{ width: '16px', height: '16px' }}
              />
              {t('settings.subscribeAlerts')}
            </label>
          </div>

          <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '16px', borderTop: '1px solid var(--border)', paddingTop: '24px' }}>
            <button onClick={handleSaveProfile} disabled={saving} className="btn btn-primary">
              <Save size={16} /> {saving ? t('settings.saving') : t('settings.saveConfig')}
            </button>
            {saved && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--risk-low)', fontSize: '13px', fontWeight: 600 }}>
                <CheckCircle size={16} /> {t('settings.infoUpdated')}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* System Settings */}
      <div style={{ marginBottom: '40px' }}>
        <h3 style={{ margin: '0 0 16px 0', color: 'var(--text-main)', fontSize: '16px', fontWeight: 600 }}>{t('settings.sysMaintenance')}</h3>
        
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '24px', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>{t('settings.clearCache')}</div>
            <div style={{ fontSize: '13px', color: 'var(--text-sub)' }}>{t('settings.clearCacheSub')}</div>
            {cleared && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--risk-low)', fontSize: '12px', fontWeight: 600, marginTop: '8px' }}>
                <CheckCircle size={12} /> {t('settings.cacheCleared')}
              </div>
            )}
          </div>
          <button onClick={handleClearCache} className="btn btn-secondary">
            <Trash2 size={16} /> {t('settings.clearCacheBtn')}
          </button>
        </div>
      </div>

      {/* Security */}
      <div>
        <h3 style={{ margin: '0 0 16px 0', color: 'var(--text-main)', fontSize: '16px', fontWeight: 600 }}>{t('settings.accSecurity')}</h3>
        
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '24px', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>{t('settings.endSession')}</div>
            <div style={{ fontSize: '13px', color: 'var(--text-sub)' }}>{t('settings.endSessionSub')}</div>
          </div>
          <button onClick={logout} className="btn" style={{ background: 'var(--risk-critical)', color: '#fff', border: 'none' }}>
            <LogOut size={16} /> {t('settings.logoutBtn')}
          </button>
        </div>
      </div>

    </div>
  );
}
