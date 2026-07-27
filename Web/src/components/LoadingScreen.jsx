export default function LoadingScreen({ message = 'Loading...' }) {
  return (
    <div className="loading-screen">
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>🐄</div>
        <div className="spinner" style={{ margin: '0 auto 16px' }} />
        <div style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 500 }}>{message}</div>
      </div>
    </div>
  );
}
