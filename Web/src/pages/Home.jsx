import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { 
  User, ShieldCheck, CheckCircle2, AlertTriangle, IndianRupee, MapPin, 
  Users, Camera, Stethoscope, Pill, FolderOpen, Bell, WifiOff, Cloud, 
  Map, ChevronRight, Check
} from 'lucide-react';

export default function Home() {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div className="loading-screen"><div className="spinner"></div></div>;
  if (user) return <Navigate to="/dashboard" replace />;

  return (
    <div style={{ backgroundColor: '#FFFFFF', minHeight: '100vh', overflowX: 'hidden' }}>
      
      {/* ─── Navigation ─── */}
      <nav className="mockup-nav">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ShieldCheck size={36} color="#059669" />
          <div>
            <div style={{ fontWeight: 800, fontSize: '18px', color: '#1E293B', lineHeight: 1.1 }}>PashuRakshak</div>
            <div style={{ fontSize: '10px', color: '#059669', fontWeight: 700, letterSpacing: '1px' }}>AI LIVESTOCK CARE</div>
          </div>
        </div>
        <div className="mockup-nav-links">
          <a href="#" className="mockup-nav-link active">Home</a>
          <a href="#features" className="mockup-nav-link">Features</a>
          <a href="#" className="mockup-nav-link">How It Works</a>
          <a href="#" className="mockup-nav-link">Impact</a>
          <a href="#" className="mockup-nav-link">About Us</a>
          <a href="#" className="mockup-nav-link">Contact</a>
        </div>
        <Link to="/login" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 24px', borderRadius: '8px', background: '#064E3B' }}>
          <User size={18} /> Login / Register
        </Link>
      </nav>

      {/* ─── Red News Ticker ─── */}
      <div className="news-ticker">
        <div className="news-ticker-content">
          🚨 LIVE ALERT: High risk of Lumpy Skin Disease reported in western districts. Vaccinate your cattle immediately. • 📉 Government announces subsidy for rapid diagnostic test kits. • 🩺 Find nearby veterinary camps in the 'Medicine Guidance' section today.
        </div>
      </div>

      {/* ─── Hero Section ─── */}
      <section className="mockup-hero">
        <div className="mockup-hero-content">
          <div style={{ maxWidth: '500px' }}>
            <h1 style={{ fontSize: '42px', fontWeight: 800, color: '#0F172A', lineHeight: 1.2, marginBottom: '24px' }}>
              Your Livestock. Our Responsibility.
            </h1>
            <p style={{ fontSize: '18px', color: '#475569', marginBottom: '40px', lineHeight: 1.6 }}>
              An AI-powered, offline-first platform for early disease detection, expert guidance and better healthcare for your animals.
            </p>

            <div className="hero-cta-row" style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
              <Link to="/login" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '14px 28px', background: '#059669', borderRadius: '8px' }}>
                <User size={20} /> Login to Get Started
              </Link>
              <a href="#features" className="btn btn-secondary" style={{ padding: '14px 28px', background: 'transparent', border: '1px solid #059669', color: '#059669', borderRadius: '8px' }}>
                Learn More
              </a>
            </div>

            <div className="hero-badges" style={{ display: 'flex', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'white', padding: '10px 14px', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', flex: '1' }}>
                <WifiOff size={18} color="#059669" />
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A' }}>Offline First</div>
                  <div style={{ fontSize: '10px', color: '#64748B' }}>Works without internet</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'white', padding: '10px 14px', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', flex: '1' }}>
                <Camera size={18} color="#059669" />
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A' }}>AI Powered</div>
                  <div style={{ fontSize: '10px', color: '#64748B' }}>Edge AI on your device</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'white', padding: '10px 14px', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', flex: '1' }}>
                <ShieldCheck size={18} color="#059669" />
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A' }}>Secure & Trusted</div>
                  <div style={{ fontSize: '10px', color: '#64748B' }}>Government Aligned</div>
                </div>
              </div>
            </div>
          </div>
          
          <div style={{ width: '320px', height: '620px', background: 'white', borderRadius: '40px', border: '12px solid #1E293B', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ height: '100%', background: '#F8FAFC', padding: '24px' }}>
               <div style={{ textAlign: 'center', fontWeight: 700, color: '#059669', marginBottom: '8px' }}>Scan Cattle for Disease</div>
               <div style={{ textAlign: 'center', fontSize: '12px', color: '#64748B', marginBottom: '24px' }}>Instant AI diagnosis in your phone</div>
               <div style={{ width: '180px', height: '180px', margin: '0 auto', borderRadius: '50%', border: '4px dashed #059669', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px' }}>
                 <img src="https://images.unsplash.com/photo-1596733430284-f7437764b1a9?auto=format&fit=crop&w=300&q=80" alt="Scanning" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
               </div>
               <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#94A3B8', marginTop: '16px' }}>
                 <span>Scanning...</span>
                 <span>80%</span>
               </div>
               <div style={{ marginTop: '32px', background: 'white', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                 <div style={{ fontSize: '11px', color: '#059669', fontWeight: 700, marginBottom: '4px' }}>Prediction</div>
                 <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>Lumpy Skin Disease (LSD)</div>
                 <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '12px' }}>Confidence: 92%</div>
                 <div style={{ fontSize: '12px', color: '#059669', fontWeight: 700 }}>View Details →</div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Problem / Solution Bridge ─── */}
      <section className="mockup-bridge-section">
        <div className="mockup-bridge-container">
          <div className="mockup-bridge-center">
            <ShieldCheck size={48} color="#059669" style={{ marginBottom: '8px' }} />
            <div style={{ fontWeight: 800, color: '#059669', fontSize: '16px' }}>PashuRakshak</div>
            <div style={{ fontSize: '12px', color: '#0F172A', fontWeight: 600 }}>Solves This</div>
          </div>
          
          <div className="mockup-bridge-left">
            <div style={{ color: '#DC2626', fontWeight: 800, fontSize: '14px', marginBottom: '16px', letterSpacing: '1px' }}>THE PROBLEM</div>
            <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', marginBottom: '24px', lineHeight: 1.4 }}>
              Livestock diseases cause heavy<br/>economic losses and suffering.
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {['Delayed detection & treatment', 'Lack of expert access in rural areas', 'Outbreaks spread rapidly', 'High treatment costs'].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '15px', color: '#475569' }}>
                  <Check size={18} color="#059669" /> {item}
                </div>
              ))}
            </div>
          </div>

          <div className="mockup-bridge-right">
             <div style={{ color: '#059669', fontWeight: 800, fontSize: '14px', marginBottom: '16px', letterSpacing: '1px' }}>OUR SOLUTION</div>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
              {['AI-powered instant disease detection', 'Offline-first — works anywhere', 'Nearest vet & medicine guidance', 'Health records & outbreak alerts', 'Empowering farmers, protecting livestock'].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '15px', color: '#475569' }}>
                  <Check size={18} color="#059669" /> {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Stats Section ─── */}
      <section className="mockup-stats">
        <div className="mockup-stat-card">
          <div className="mockup-stat-icon"><AlertTriangle size={32} /></div>
          <div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#0F172A' }}>60%</div>
            <div style={{ fontSize: '13px', color: '#475569' }}>Losses due to delayed<br/>disease detection</div>
          </div>
        </div>
        <div className="mockup-stat-card">
          <div className="mockup-stat-icon"><IndianRupee size={32} /></div>
          <div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#0F172A' }}>₹20,000 Cr+</div>
            <div style={{ fontSize: '13px', color: '#475569' }}>Annual loss in livestock<br/>industry (India)</div>
          </div>
        </div>
        <div className="mockup-stat-card">
          <div className="mockup-stat-icon"><CheckCircle2 size={32} /></div>
          <div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#0F172A' }}>15+</div>
            <div style={{ fontSize: '13px', color: '#475569' }}>Major diseases<br/>monitored</div>
          </div>
        </div>
        <div className="mockup-stat-card">
          <div className="mockup-stat-icon"><Users size={32} /></div>
          <div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#0F172A' }}>1.3 Billion+</div>
            <div style={{ fontSize: '13px', color: '#475569' }}>Livestock population<br/>in India</div>
          </div>
        </div>
      </section>

      {/* ─── Features Grid ─── */}
      <section id="features" className="mockup-features">
        <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#0F172A', display: 'inline-block', borderBottom: '4px solid #059669', paddingBottom: '8px' }}>
          Powerful Features for Farmers & Communities
        </h2>
        <div className="mockup-features-grid">
          {[
            { icon: <Camera size={24} />, title: 'AI Disease Detection', desc: 'Scan animal images and get instant AI diagnosis on your phone.' },
            { icon: <Stethoscope size={24} />, title: 'Symptom Checker', desc: 'Answer simple questions based on symptoms & get possible diseases.' },
            { icon: <MapPin size={24} />, title: 'Nearby Veterinarians', desc: 'Find the nearest vets & clinics with directions and contact details.' },
            { icon: <Pill size={24} />, title: 'Medicine Guidance', desc: 'Get recommended medicines, dosages & usage guidelines.' },
            { icon: <FolderOpen size={24} />, title: 'Health Records', desc: 'Maintain digital health records for your herd.' },
            { icon: <Bell size={24} />, title: 'Outbreak Alerts', desc: 'Receive real-time alerts about disease outbreaks in your area.' },
            { icon: <Users size={24} />, title: 'Community Support', desc: 'Connect with other farmers and share knowledge.' },
            { icon: <WifiOff size={24} />, title: 'Works Offline', desc: 'All core features work without internet.' }
          ].map((f, i) => (
            <div key={i} className="mockup-feature-card">
              <div className="mockup-feature-icon">{f.icon}</div>
              <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>{f.title}</h4>
              <p style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.5 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Trust & Tech Stack ─── */}
      <section className="mockup-tech-section">
        <div className="mockup-tech-container">
          <div className="mockup-tech-left">
            <div style={{ display: 'flex', gap: '20px' }}>
              <div style={{ width: '80px', height: '80px', background: '#D1FAE5', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldCheck size={40} color="#059669" />
              </div>
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#064E3B', marginBottom: '16px' }}>Trusted. Secure. Built for Bharat.</h3>
                <p style={{ fontSize: '14px', color: '#475569', marginBottom: '24px', lineHeight: 1.6 }}>
                  PashuRakshak is aligned with the mission to build a healthier livestock ecosystem across Bharat.
                </p>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#059669' }}>
                  Secure Data • Privacy First • Government Aligned
                </div>
              </div>
            </div>
          </div>
          <div className="mockup-tech-right">
            <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#064E3B' }}>Built with Advanced Technology</h3>
            <div className="mockup-tech-grid">
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: '#059669', marginBottom: '12px' }}><Camera size={32} /></div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>Edge AI<br/>(TFLite)</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: '#059669', marginBottom: '12px' }}><WifiOff size={32} /></div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>Offline-First<br/>Architecture</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: '#059669', marginBottom: '12px' }}><Cloud size={32} /></div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>Secure Cloud<br/>Sync</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: '#059669', marginBottom: '12px' }}><Map size={32} /></div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>GIS & Maps<br/>(PostGIS)</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Final CTA ─── */}
      <section className="mockup-cta">
        <div style={{ padding: '60px 0' }}>
          <h2 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '8px' }}>Start Protecting Your Livestock Today</h2>
          <p style={{ fontSize: '18px', color: '#A7F3D0', marginBottom: '32px' }}>Early detection saves lives and livelihoods.</p>
          <Link to="/login" className="btn btn-primary" style={{ background: 'white', color: '#064E3B', display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '16px 32px', borderRadius: '8px', fontWeight: 700, fontSize: '16px' }}>
            <User size={20} /> Login / Register Now <ChevronRight size={20} />
          </Link>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '60px 0' }}>
           <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Google Play" style={{ height: '48px' }} />
           <div style={{ height: '48px', background: 'black', borderRadius: '8px', border: '1px solid #333', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', padding: '0 16px', fontSize: '12px' }}>Download on the App Store</div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="mockup-footer">
        <div className="mockup-footer-grid">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ width: '40px', height: '40px', background: '#059669', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldCheck size={24} color="white" />
              </div>
              <span style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A' }}>PashuRakshak</span>
            </div>
            <p style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.6 }}>
              AI-powered livestock disease detection and animal healthcare platform.
            </p>
          </div>
          <div>
            <h4 style={{ fontWeight: 700, color: '#0F172A', marginBottom: '16px', fontSize: '14px' }}>Quick Links</h4>
            <a href="#" className="mockup-footer-link">Home</a>
            <a href="#features" className="mockup-footer-link">Features</a>
            <a href="#" className="mockup-footer-link">How It Works</a>
            <a href="#" className="mockup-footer-link">About Us</a>
            <a href="#" className="mockup-footer-link">Contact Us</a>
          </div>
          <div>
            <h4 style={{ fontWeight: 700, color: '#0F172A', marginBottom: '16px', fontSize: '14px' }}>Resources</h4>
            <a href="#" className="mockup-footer-link">User Guide</a>
            <a href="#" className="mockup-footer-link">Disease Library</a>
            <a href="#" className="mockup-footer-link">Veterinary Directory</a>
            <a href="#" className="mockup-footer-link">Help Center</a>
            <a href="#" className="mockup-footer-link">Privacy Policy</a>
          </div>
          <div>
            <h4 style={{ fontWeight: 700, color: '#0F172A', marginBottom: '16px', fontSize: '14px' }}>Support</h4>
            <p style={{ fontSize: '13px', color: '#475569', marginBottom: '8px' }}>Helpline: 1800-123-4567</p>
            <p style={{ fontSize: '13px', color: '#475569', marginBottom: '8px' }}>Email: support@pashurakshak.gov.in</p>
            <p style={{ fontSize: '13px', color: '#475569', marginBottom: '16px' }}>Mon - Sat: 9:00 AM - 6:00 PM</p>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 0 0', borderTop: '1px solid #E2E8F0', fontSize: '13px', color: '#64748B' }}>
          <div>&copy; 2024 PashuRakshak. All rights reserved.</div>
          <div>Empowering Rural India 🇮🇳</div>
        </div>
      </footer>

    </div>
  );
}
