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

  const features = [
    'Offline Edge AI Diagnostics',
    'Real-time Outbreak Heatmaps',
    'Digital Twin Health Records',
  ];

  const FormCard = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{
        width: '100%',
        maxWidth: '420px',
        marginLeft: 'auto',
        marginRight: 'auto',
        marginBottom: '32px',
        background: 'white',
        borderRadius: '20px',
        padding: '32px 28px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.08)',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          background: '#F1F5F9', padding: '6px 14px', borderRadius: '100px',
          color: '#0F172A', fontSize: '12px', fontWeight: 600, marginBottom: '16px',
        }}>
          <ShieldCheck size={14} color="#059669" /> Secure Portal Login
        </div>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0F172A', marginBottom: '6px' }}>
          Welcome Back
        </h2>
        <p style={{ color: '#64748B', fontSize: '14px' }}>
          Sign in to manage your livestock health records.
        </p>
      </div>

      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: '18px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
            Registered Phone Number
          </label>
          <div style={{ position: 'relative' }}>
            <Phone size={18} color="#94A3B8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="tel"
              className="input"
              style={{ paddingLeft: '44px', width: '100%' }}
              placeholder="+91 00000 00000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
        </div>

        <div style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>Password / OTP</label>
            <a href="#" style={{ fontSize: '12px', color: '#059669', fontWeight: 700, textDecoration: 'none' }}>Forgot?</a>
          </div>
          <div style={{ position: 'relative' }}>
            <Lock size={18} color="#94A3B8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="password"
              className="input"
              style={{ paddingLeft: '44px', width: '100%' }}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </div>

        <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '50px', fontSize: '16px', fontWeight: 700 }}>
          Access Account
        </button>
      </form>

      <div style={{ marginTop: '24px', textAlign: 'center' }}>
        <p style={{ fontSize: '14px', color: '#64748B' }}>
          Don't have a farm registered?{' '}
          <Link to="/register" style={{ color: '#059669', fontWeight: 700, textDecoration: 'none' }}>
            Register Now
          </Link>
        </p>
      </div>
    </motion.div>
  );

  return (
    <>
      {/* ─── MOBILE LAYOUT (hidden on desktop) ─── */}
      <div className="login-mobile-layout" style={{ minHeight: '100vh', background: '#F1F5F9', flexDirection: 'column' }}>

        {/* Green header — compact */}
        <div style={{
          background: 'linear-gradient(135deg, #064E3B 0%, #059669 100%)',
          padding: '16px 20px 60px',
          flexShrink: 0,
        }}>
          <Link to="/" style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            color: 'rgba(255,255,255,0.85)', textDecoration: 'none',
            fontSize: '13px', fontWeight: 600, marginBottom: '20px',
          }}>
            <ArrowLeft size={16} /> Back to Home
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShieldCheck size={32} color="white" />
            <div>
              <div style={{ fontSize: '20px', fontWeight: 900, color: 'white', lineHeight: 1 }}>PashuRakshak</div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.75)', marginTop: '2px' }}>Trusted AI Livestock Care</div>
            </div>
          </div>
        </div>

        {/* Card pulled up over green strip */}
        <div style={{ padding: '0 16px', marginTop: '-40px', flex: 1 }}>
          <FormCard />
        </div>
      </div>

      {/* ─── DESKTOP LAYOUT (hidden on mobile) ─── */}
      <div className="login-desktop-layout">
        {/* Left: Branding panel */}
        <div style={{
          flex: 1,
          background: 'linear-gradient(135deg, #064E3B 0%, #059669 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          color: 'white',
          position: 'relative',
        }}>
          <Link to="/" style={{ position: 'absolute', top: '32px', left: '32px', color: 'white', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '14px' }}>
            <ArrowLeft size={18} /> Back to Home
          </Link>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '28px' }}>
              <ShieldCheck size={52} color="white" />
              <div>
                <h1 style={{ fontSize: '2rem', fontWeight: 900, lineHeight: 1.1 }}>PashuRakshak</h1>
                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1rem' }}>Trusted AI Livestock Care</p>
              </div>
            </div>

            <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '24px', lineHeight: 1.3 }}>
              Empowering Farmers.<br />Securing Livestock.
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '32px' }}>
              {features.map((item) => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1rem' }}>
                  <CheckCircle2 size={20} color="#A7F3D0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right: Form panel */}
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px',
          background: '#F8FAFC',
        }}>
          <FormCard />
        </div>
      </div>

      <style>{`
        .login-mobile-layout  { display: none; }
        .login-desktop-layout { display: flex; min-height: 100vh; }

        @media (max-width: 768px) {
          .login-mobile-layout  { display: flex; flex-direction: column; min-height: 100vh; background: #F1F5F9; }
          .login-desktop-layout { display: none; }
        }
      `}</style>
    </>
  );
}
