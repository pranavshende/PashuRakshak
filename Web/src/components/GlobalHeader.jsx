import React, { useEffect, useState } from 'react';
import { Bell, User, Shield, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../services/api';
import { useTranslation } from 'react-i18next';

export default function GlobalHeader() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  
  const [notifications, setNotifications] = useState([]);
  const [readIds, setReadIds] = useState(() => {
    try {
      const stored = localStorage.getItem('read_notifications');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      // Poll every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const data = await api.getNotifications();
      if (data && data.notifications) {
        setNotifications(data.notifications);
      }
    } catch (err) {
      console.warn('Failed to load notifications:', err);
    }
  };

  const markAsRead = (id) => {
    const updated = [...readIds, id];
    setReadIds(updated);
    localStorage.setItem('read_notifications', JSON.stringify(updated));
  };

  const markAllAsRead = () => {
    const allIds = notifications.map(n => n.id);
    const updated = Array.from(new Set([...readIds, ...allIds]));
    setReadIds(updated);
    localStorage.setItem('read_notifications', JSON.stringify(updated));
  };

  const unreadNotifications = notifications.filter(n => !readIds.includes(n.id));
  const unreadCount = unreadNotifications.length;

  const getPageContext = () => {
    const path = location.pathname.split('/')[1] || 'dashboard';
    const contextMap = {
      'dashboard': { title: t('common.dashboard'), sub: 'Overview of your livestock health' },
      'herd': { title: t('common.animals'), sub: 'Manage your registered livestock' },
      'capture': { title: t('common.diagnose'), sub: 'AI-powered health scanning' },
      'medicine': { title: t('common.medicine'), sub: 'Prescriptions and inventory' },
      'vets': { title: t('common.vets'), sub: 'Nearby veterinary support' },
      'heatmap': { title: t('common.iot'), sub: 'Live sensor monitoring' },
      'chat': { title: t('common.aiVet'), sub: 'Intelligent veterinary assistant' },
      'community': { title: t('common.community'), sub: 'Farmer discussions and alerts' },
      'settings': { title: t('common.settings'), sub: 'Account and application preferences' }
    };
    return contextMap[path] || { title: 'PashuRakshak', sub: '' };
  };

  const pageContext = getPageContext();

  return (
    <header className="top-header-banner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '72px', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 105, borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-surface)', padding: '0 32px' }}>
      <div className="top-header-left" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div className="top-header-text">
          <div className="top-header-title">{pageContext.title}</div>
          {pageContext.sub && <div className="top-header-sub">{pageContext.sub}</div>}
        </div>
      </div>

      <div className="top-header-right" style={{ display: 'flex', alignItems: 'center', gap: '24px', position: 'relative' }}>
        {/* Language Selector */}
        <select 
          value={i18n.language} 
          onChange={(e) => {
            const lang = e.target.value;
            i18n.changeLanguage(lang);
            if (user) {
              let langName = 'English';
              if (lang === 'hi') langName = 'Hindi';
              if (lang === 'mr') langName = 'Marathi';
              api.updateProfile({ language: langName }).catch(e => console.error('Failed to update language', e));
            }
          }}
          style={{ padding: '6px 10px', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-main)', fontSize: '13px', cursor: 'pointer', outline: 'none' }}
        >
          <option value="en">English</option>
          <option value="hi">हिन्दी</option>
          <option value="mr">मराठी</option>
        </select>

        {/* Notification Bell */}
        <div className="top-header-icon-btn" style={{ position: 'relative', cursor: 'pointer', padding: '8px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => setShowDropdown(!showDropdown)}>
          <Bell size={20} color="var(--text-sub)" />
          <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-sub)' }} className="hide-mobile">Notifications</span>
          {unreadCount > 0 && (
            <span className="top-header-badge" style={{ position: 'absolute', top: '2px', left: '16px', background: 'var(--risk-critical)', color: '#fff', fontSize: '10px', width: '16px', height: '16px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
              {unreadCount}
            </span>
          )}
        </div>

        {/* Notifications Dropdown */}
        {showDropdown && (
          <div style={{ position: 'absolute', top: '48px', right: '150px', width: '320px', maxHeight: '400px', overflowY: 'auto', zIndex: 120, padding: '16px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '4px', boxShadow: 'var(--shadow)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '12px' }}>
              <span style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-main)' }}>{t('settings.notifications')}</span>
              {unreadCount > 0 && (
                <button onClick={markAllAsRead} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '12px', cursor: 'pointer', fontWeight: 600 }}>
                  Mark all as read
                </button>
              )}
            </div>
            
            {notifications.length === 0 ? (
              <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                No notifications available.
              </div>
            ) : unreadCount === 0 ? (
              <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                No new notifications
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {unreadNotifications.map((notif) => (
                  <div key={notif.id} className="p-2" style={{ borderRadius: '4px', backgroundColor: notif.severity === 'high' ? 'var(--risk-critical-bg)' : 'var(--bg-base)', borderLeft: notif.severity === 'high' ? '3px solid var(--risk-critical)' : '3px solid var(--primary)', padding: '10px' }}>
                    <div className="flex-between" style={{ gap: '8px' }}>
                      <span style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-main)' }}>{notif.title}</span>
                      <button onClick={() => markAsRead(notif.id)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)' }} title="Mark as read">
                        <Check size={14} />
                      </button>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-sub)', marginTop: '4px' }}>{notif.message}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px', textAlign: 'right' }}>
                      {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* User Profile */}
        <div className="flex-center" style={{ gap: '10px', cursor: 'pointer', borderLeft: '1px solid var(--border)', paddingLeft: '24px' }} onClick={() => navigate('/settings')}>
          <div className="top-header-avatar" style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--bg-base)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {user?.name ? user.name.charAt(0).toUpperCase() : <User size={18} color="var(--secondary)" />}
          </div>
          <div style={{ textAlign: 'left' }} className="user-profile-header">
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)' }}>{user?.name || t('dashboard.farmer')}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-sub)' }}>{t('settings.profile')}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
