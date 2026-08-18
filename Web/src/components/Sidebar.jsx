import { NavLink } from 'react-router-dom';
import { Home, MessageSquare, Map, Settings, User, LogOut, Grid, Activity, HeartPulse, MapPin, Camera } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import './Sidebar.css';

const NAV_GROUPS = [
  {
    title: 'OVERVIEW',
    items: [
      { path: '/dashboard', icon: Home, tKey: 'common.dashboard' },
      { path: '/herd', icon: Activity, tKey: 'common.animals' },
    ]
  },
  {
    title: 'HEALTH',
    items: [
      { path: '/capture', icon: Camera, tKey: 'common.diagnose' },
      { path: '/medicine', icon: HeartPulse, tKey: 'common.medicine' },
    ]
  },
  {
    title: 'SERVICES',
    items: [
      { path: '/vets', icon: MapPin, tKey: 'common.vets' },
      { path: '/heatmap', icon: Map, tKey: 'common.iot' },
      { path: '/chat', icon: MessageSquare, tKey: 'common.aiVet' },
    ]
  },
  {
    title: 'COMMUNITY',
    items: [
      { path: '/community', icon: Grid, tKey: 'common.community' },
    ]
  },
  {
    title: 'SYSTEM',
    items: [
      { path: '/settings', icon: Settings, tKey: 'common.settings' },
    ]
  }
];

export default function Sidebar() {
  const { logout, user } = useAuth();
  const { t } = useTranslation();

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span className="logo-icon">🌿</span>
        <span className="logo-text">PashuRakshak</span>
      </div>
      <nav className="sidebar-nav">
        {NAV_GROUPS.map((group, idx) => (
          <div key={idx} className="sidebar-group">
            <h4 className="sidebar-group-title">{group.title}</h4>
            {group.items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              >
                <item.icon size={20} className="sidebar-icon" />
                <span className="sidebar-label">{t(item.tKey)}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="user-avatar">
            {user?.name ? user.name.charAt(0).toUpperCase() : <User size={18} />}
          </div>
          <div className="user-info">
            <span className="user-name">{user?.name || t('common.loading')}</span>
            <span className="user-sub">{user?.role || ''}</span>
          </div>
        </div>
        <button onClick={logout} className="logout-btn">
          <LogOut size={16} />
          <span>{t('settings.logout')}</span>
        </button>
      </div>
    </aside>
  );
}
