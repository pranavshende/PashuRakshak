import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Phone, Lock, ArrowLeft, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function Login() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        await login(data.token, data.user);
        navigate('/dashboard');
      } else {
        alert(data.error || 'Invalid credentials');
      }
    } catch (error) {
      console.error(error);
      alert('Unable to connect to server');
    }
  };

  return (
    <div className="split-layout">
      {/* ─── Left Side: Branding & Trust ─── */}
      <div className="split-left">
        <Link to="/" style={{ position: 'absolute', top: '40px', left: '40px', color: 'white', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
          <ArrowLeft size={20} /> Back to Home
        </Link>
        
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
            <img src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" alt="Emblem" style={{ height: '64px', filter: 'brightness(0) invert(1)' }} />
            <div>
              <h1 style={{ fontSize: '2.5rem', fontWeight: 900, lineHeight: 1.1 }}>PashuRakshak</h1>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.1rem' }}>Government of India Initiative</p>
            </div>
          </div>
          
          <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '24px', lineHeight: 1.2 }}>
            Empowering Farmers.<br />Securing Livestock.
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.1rem' }}>
              <CheckCircle2 color="#A7F3D0" /> <span>Offline Edge AI Diagnostics</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.1rem' }}>
              <CheckCircle2 color="#A7F3D0" /> <span>Real-time Outbreak Heatmaps</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.1rem' }}>
              <CheckCircle2 color="#A7F3D0" /> <span>Digital Twin Health Records</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ─── Right Side: Login Form ─── */}
      <div className="split-right">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }} 
          transition={{ duration: 0.4 }}
          style={{ width: '100%', maxWidth: '440px', background: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.04)' }}
        >
          {/* Mobile Back Button (Only visible when split-left is hidden) */}
          <div className="mobile-back" style={{ display: 'none', marginBottom: '24px' }}>
            <Link to="/" style={{ color: 'var(--text-sub)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
              <ArrowLeft size={18} /> Back
            </Link>
          </div>

          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'var(--bg-elevated)', padding: '6px 12px', borderRadius: '100px', color: 'var(--text-main)', fontSize: '12px', fontWeight: 600, marginBottom: '16px' }}>
              <ShieldCheck size={14} color="var(--primary)" /> Secure Portal Login
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px' }}>Welcome Back</h2>
            <p style={{ color: 'var(--text-sub)' }}>Sign in to manage your livestock health records.</p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="input-group" style={{ marginBottom: '20px' }}>
              <label className="input-label">Registered Phone Number</label>
              <div style={{ position: 'relative' }}>
                <Phone size={20} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="tel"
                  className="input"
                  style={{ paddingLeft: '44px' }}
                  placeholder="+91 00000 00000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="input-group" style={{ marginBottom: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="input-label" style={{ marginBottom: 0 }}>Password / OTP</label>
                <a href="#" style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>Forgot?</a>
              </div>
              <div style={{ position: 'relative', marginTop: '6px' }}>
                <Lock size={20} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="password"
                  className="input"
                  style={{ paddingLeft: '44px' }}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '48px', fontSize: '16px' }}>
              Access Account
            </button>
          </form>

          <div style={{ marginTop: '32px', textAlign: 'center' }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-sub)' }}>
              Don't have a farm registered?{' '}
              <Link to="/register" style={{ color: 'var(--primary)', fontWeight: '700', textDecoration: 'none' }}>
                Register Now
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
      <style>{`
        @media (max-width: 1024px) {
          .mobile-back { display: block !important; }
        }
      `}</style>
    </div>
  );
}
