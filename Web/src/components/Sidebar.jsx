import { NavLink } from 'react-router-dom';
import { Home, MessageSquare, Map, Settings, User, LogOut, Grid } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

const NAV_ITEMS = [
  { path: '/dashboard', icon: Home, label: 'Dashboard' },
  { path: '/chat', icon: MessageSquare, label: 'AI Vet' },
  { path: '/heatmap', icon: Map, label: 'Map' },
  { path: '/community', icon: Grid, label: 'Community' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
  const { logout, user } = useAuth();

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <item.icon size={22} className="sidebar-icon" />
            <span className="sidebar-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="user-avatar">
            <User size={20} />
          </div>
          <div className="user-info">
            <span className="user-name">{user?.name || 'User'}</span>
          </div>
        </div>
        <button onClick={logout} className="logout-btn">
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
