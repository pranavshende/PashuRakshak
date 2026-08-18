import React from 'react';

export default function LoadingSkeleton({ type = 'card', count = 1 }) {
  const skeletons = Array.from({ length: count });

  if (type === 'table') {
    return (
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
        <div style={{ height: '48px', borderBottom: '1px solid var(--border)', background: 'var(--bg-base)' }} />
        {skeletons.map((_, i) => (
          <div key={i} style={{ display: 'flex', padding: '16px 24px', gap: '24px', borderBottom: '1px solid var(--border)' }}>
            <div className="skeleton-line" style={{ flex: 2, height: '16px', borderRadius: '4px' }} />
            <div className="skeleton-line" style={{ flex: 1, height: '16px', borderRadius: '4px' }} />
            <div className="skeleton-line" style={{ flex: 1, height: '16px', borderRadius: '4px' }} />
            <div className="skeleton-line" style={{ flex: 1, height: '16px', borderRadius: '4px' }} />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'chart') {
    return (
      <div style={{ padding: '24px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', height: '300px', display: 'flex', flexDirection: 'column' }}>
        <div className="skeleton-line" style={{ height: '24px', width: '150px', borderRadius: '4px', marginBottom: '24px' }} />
        <div className="skeleton-line" style={{ flex: 1, borderRadius: '8px' }} />
      </div>
    );
  }

  if (type === 'profile') {
    return (
      <div style={{ padding: '24px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          <div className="skeleton-line" style={{ width: '80px', height: '80px', borderRadius: '50%' }} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="skeleton-line" style={{ height: '24px', width: '200px', borderRadius: '4px' }} />
            <div className="skeleton-line" style={{ height: '16px', width: '120px', borderRadius: '4px' }} />
          </div>
        </div>
      </div>
    );
  }

  // Default 'card'
  return (
    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
      {skeletons.map((_, i) => (
        <div key={i} style={{ flex: 1, minWidth: '250px', padding: '24px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
          <div className="skeleton-line" style={{ height: '20px', width: '40%', borderRadius: '4px', marginBottom: '16px' }} />
          <div className="skeleton-line" style={{ height: '36px', width: '80%', borderRadius: '4px', marginBottom: '12px' }} />
          <div className="skeleton-line" style={{ height: '16px', width: '60%', borderRadius: '4px' }} />
        </div>
      ))}
    </div>
  );
}
