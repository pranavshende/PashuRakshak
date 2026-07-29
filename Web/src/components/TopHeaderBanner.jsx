import { Bell, User } from 'lucide-react';

export default function TopHeaderBanner({ title, subtitle, subSubtitle = "Department of Animal Husbandry & Dairying", children }) {
  return (
    <div className="top-header-banner">
      <div className="top-header-left">
        <div className="top-header-emblem">
          <img src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" alt="Emblem" style={{ height: 48, objectFit: 'contain' }} />
        </div>
        <div className="top-header-text">
          <div className="top-header-title">{title}</div>
          {subtitle && <div className="top-header-sub">{subtitle}</div>}
          {subSubtitle && <div className="top-header-sub2">{subSubtitle}</div>}
        </div>
      </div>
      <div className="top-header-right">
        {children && <div className="top-header-actions">{children}</div>}
        <div className="top-header-icon-btn">
          <Bell size={20} color="#0F172A" />
          <span className="top-header-badge">1</span>
        </div>
        <div className="top-header-avatar">
          <User size={20} color="#fff" />
        </div>
      </div>
    </div>
  );
}
