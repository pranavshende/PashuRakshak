import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100dvh' }}>Loading...</div>;
  if (user) return <Navigate to="/dashboard" replace />;

  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100dvh', background: 'var(--bg-gradient)', padding: '20px', textAlign: 'center' }}>
      <h1 style={{ color: 'var(--primary-dark)', marginBottom: '16px', fontSize: '3rem' }}>PashuRakshak</h1>
      <p style={{ fontSize: '1.2rem', marginBottom: '32px', maxWidth: '600px' }}>
        AI-Powered Disease Diagnosis and Herd Management for Cattle Farmers.
      </p>
      
      <div style={{ display: 'flex', gap: '16px' }}>
        <Link to="/login" className="btn btn-primary" style={{ padding: '12px 24px', textDecoration: 'none' }}>
          Login
        </Link>
        <Link to="/register" className="btn btn-secondary" style={{ padding: '12px 24px', textDecoration: 'none', background: 'white', color: 'var(--primary)', border: '1px solid var(--primary)' }}>
          Register
        </Link>
      </div>
    </div>
  );
}
