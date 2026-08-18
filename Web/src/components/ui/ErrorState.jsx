import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function ErrorState({ 
  title = "Failed to load data", 
  message = "An error occurred while communicating with the server. Please check your connection and try again.", 
  onRetry 
}) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 24px',
      textAlign: 'center',
      background: 'var(--risk-critical-bg)',
      border: '1px solid rgba(217, 45, 32, 0.2)',
      borderRadius: 'var(--radius-md)',
      width: '100%'
    }}>
      <div style={{
        width: '48px',
        height: '48px',
        borderRadius: '50%',
        background: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '16px',
        color: 'var(--risk-critical)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <AlertCircle size={24} />
      </div>
      <h3 style={{ margin: '0 0 8px', fontSize: '16px', fontWeight: 600, color: 'var(--risk-critical)' }}>
        {title}
      </h3>
      <p style={{ margin: '0 0 24px', fontSize: '14px', color: 'var(--text-sub)', maxWidth: '400px', lineHeight: 1.5 }}>
        {message}
      </p>
      {onRetry && (
        <button 
          onClick={onRetry}
          className="btn"
          style={{ background: '#fff', color: 'var(--risk-critical)', border: '1px solid rgba(217, 45, 32, 0.3)' }}
        >
          <RefreshCw size={16} /> Retry
        </button>
      )}
    </div>
  );
}
