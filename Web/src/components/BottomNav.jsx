import { NavLink } from 'react-router-dom';
import { Home, Activity, Camera, MapPin, Menu } from 'lucide-react';

const NAV_ITEMS = [
  { path: '/dashboard', icon: Home, label: 'Home' },
  { path: '/herd', icon: Activity, label: 'Herd' },
  { path: '/capture', icon: Camera, label: 'Scan' },
  { path: '/vets', icon: MapPin, label: 'Vets' },
  { path: '/settings', icon: Menu, label: 'More' },
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
