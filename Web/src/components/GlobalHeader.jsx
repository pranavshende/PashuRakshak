import React, { useEffect, useState } from 'react';
import { Bell, User, Shield, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

export default function GlobalHeader() {
  const { user } = useAuth();
  const navigate = useNavigate();
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

  return (
    <header className="top-header-banner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '92px', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 105, borderBottom: '1px solid var(--border)' }}>
      <div className="top-header-left" style={{ display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
        <div className="top-header-emblem" style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Shield size={24} color="var(--primary-dark)" />
        </div>
        <div className="top-header-text">
          <div className="top-header-title" style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-main)' }}>PashuRakshak</div>
          <div className="top-header-sub" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--primary-dark)' }}>AI Livestock Intelligence Platform</div>
        </div>
      </div>

      <div className="top-header-right" style={{ display: 'flex', alignItems: 'center', gap: '16px', position: 'relative' }}>
        {/* Notification Bell */}
        <div className="top-header-icon-btn" style={{ position: 'relative', cursor: 'pointer', padding: '8px', borderRadius: '50%', background: '#F1F5F9' }} onClick={() => setShowDropdown(!showDropdown)}>
          <Bell size={20} color="#0F172A" />
          {unreadCount > 0 && (
            <span className="top-header-badge" style={{ position: 'absolute', top: '2px', right: '2px', background: '#EF4444', color: '#fff', fontSize: '10px', width: '16px', height: '16px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
              {unreadCount}
            </span>
          )}
        </div>

        {/* Notifications Dropdown */}
        {showDropdown && (
          <div className="card shadow-lg" style={{ position: 'absolute', top: '60px', right: '50px', width: '320px', maxHeight: '400px', overflowY: 'auto', zIndex: 120, padding: '16px', backgroundColor: '#fff', border: '1px solid var(--border)', borderRadius: '12px' }}>
            <div className="flex-between mb-3" style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '8px' }}>
              <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-main)' }}>Notifications</span>
              {unreadCount > 0 && (
                <button onClick={markAllAsRead} style={{ background: 'none', border: 'none', color: 'var(--primary-dark)', fontSize: '12px', cursor: 'pointer', fontWeight: 600 }}>
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {unreadNotifications.map((notif) => (
                  <div key={notif.id} className="p-2" style={{ borderRadius: '8px', backgroundColor: notif.severity === 'high' ? 'rgba(239, 68, 68, 0.05)' : '#F8FAFC', borderLeft: notif.severity === 'high' ? '4px solid #EF4444' : '4px solid var(--primary-dark)', padding: '10px' }}>
                    <div className="flex-between" style={{ gap: '8px' }}>
                      <span style={{ fontWeight: 700, fontSize: '12px', color: 'var(--text-main)' }}>{notif.title}</span>
                      <button onClick={() => markAsRead(notif.id)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)' }} title="Mark as read">
                        <Check size={14} />
                      </button>
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>{notif.message}</div>
                    <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginTop: '6px', textAlign: 'right' }}>
                      {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* User Profile */}
        <div className="flex-center" style={{ gap: '10px', cursor: 'pointer' }} onClick={() => navigate('/settings')}>
          <div className="top-header-avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User size={20} color="#fff" />
          </div>
          <div style={{ textAlign: 'left' }} className="user-profile-header">
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>{user?.name || 'Farmer'}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{user?.role || 'Farmer'}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
