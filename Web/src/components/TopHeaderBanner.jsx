export default function TopHeaderBanner({ title, subtitle, children }) {
  return (
    <div className="top-header-banner">
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div className="top-header-title">{title}</div>
        {subtitle && <div className="top-header-sub">{subtitle}</div>}
      </div>
      {children && <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>}
    </div>
  );
}
