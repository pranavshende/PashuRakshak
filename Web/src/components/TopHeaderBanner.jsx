import React from 'react';

export default function TopHeaderBanner({ title, subtitle, children }) {
  return (
    <div 
      className="page-header" 
      style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '24px',
        padding: '0 8px'
      }}
    >
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px', margin: 0 }}>
            {subtitle}
          </p>
        )}
      </div>
      {children && (
        <div className="page-header-actions" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {children}
        </div>
      )}
    </div>
  );
}
