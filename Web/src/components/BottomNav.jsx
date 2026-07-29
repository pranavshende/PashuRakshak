import { NavLink } from 'react-router-dom';
import { Home, Bell, FileText, BookOpen, User } from 'lucide-react';

const NAV_ITEMS = [
  { path: '/dashboard', icon: Home, label: 'Home' },
  { path: '/alerts', icon: Bell, label: 'Alerts' },
  { path: '/reports', icon: FileText, label: 'Reports' },
  { path: '/resources', icon: BookOpen, label: 'Resources' },
  { path: '/profile', icon: User, label: 'Profile' },
];

export default function BottomNav() {
  return (
    <nav className="bottom-nav">
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
        >
          <item.icon className="bottom-nav-icon" size={24} />
          <span className="bottom-nav-label">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
