import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Camera, Users, MessageSquare, Map, Pill,
  Users2, Cpu, TrendingUp, Settings, LogOut, Activity
} from 'lucide-react';

const NAV = [
  { label: 'Core', items: [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/capture', icon: Camera, label: 'Scan Cattle' },
  ]},
  { label: 'Herd Management', items: [
    { path: '/herd', icon: Users, label: 'My Herd' },
    { path: '/medicine', icon: Pill, label: 'Medicine' },
    { path: '/farm-score', icon: TrendingUp, label: 'Farm Score' },
  ]},
  { label: 'Intelligence', items: [
    { path: '/chat', icon: MessageSquare, label: 'AI Vet Chat' },
    { path: '/heatmap', icon: Map, label: 'Disease Map' },
    { path: '/community', icon: Users2, label: 'Community' },
    { path: '/vets', icon: Activity, label: 'Nearby Vets' },
    { path: '/iot', icon: Cpu, label: 'IoT Sensors' },
  ]},
  { label: 'Account', items: [
    { path: '/settings', icon: Settings, label: 'Settings' },
  ]},
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const initials = (user?.name || 'F').charAt(0).toUpperCase();

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">🐄</div>
        <div>
          <div className="sidebar-brand-name">PashuRakshak</div>
          <div className="sidebar-brand-sub">Livestock Intelligence</div>
        </div>
      </div>

      {/* User */}
      <div className="sidebar-user">
        <div className="sidebar-avatar">{initials}</div>
        <div>
          <div className="sidebar-user-name">{user?.name?.split(' ')[0] || 'Farmer'}</div>
          <div className="sidebar-user-role">🌾 Farmer</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        {NAV.map(section => (
          <div key={section.label}>
            <div className="sidebar-section-label">{section.label}</div>
            {section.items.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
              >
                <span className="nav-item-icon"><item.icon size={16} /></span>
                {item.label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Logout */}
      <div className="sidebar-footer">
        <button className="sidebar-logout" onClick={logout}>
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
