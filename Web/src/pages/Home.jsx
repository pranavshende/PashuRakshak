import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, Activity, Stethoscope, Cloud, Cpu, Map as MapIcon, 
  FileText, ChevronRight, Lock 
} from 'lucide-react';

const FadeIn = ({ children, delay = 0, y = 20 }) => (
  <motion.div
    initial={{ opacity: 0, y }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.6, delay, ease: "easeOut" }}
  >
    {children}
  </motion.div>
);

export default function Home() {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div className="loading-screen"><div className="spinner"></div></div>;
  if (user) return <Navigate to="/dashboard" replace />;

  return (
    <div style={{ backgroundColor: '#F8FAFC', minHeight: '100vh', overflowX: 'hidden' }}>
      
      {/* ─── Navigation Bar ─── */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" alt="Emblem" style={{ height: '40px' }} />
            <div>
              <div style={{ fontWeight: 800, fontSize: '20px', color: 'var(--primary-dark)', lineHeight: 1.1 }}>PashuRakshak</div>
              <div style={{ fontSize: '11px', color: 'var(--text-sub)' }}>Govt. of India Initiative</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Link to="/login" className="btn btn-primary">Login to Dashboard</Link>
          </div>
        </div>
      </nav>

      {/* ─── Hero Section ─── */}
      <section className="landing-hero" style={{ padding: '120px 24px 60px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '60px' }}>
          <div style={{ flex: '1 1 500px' }}>
            <FadeIn>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(22, 163, 116, 0.1)', padding: '6px 12px', borderRadius: '100px', color: 'var(--primary-dark)', fontWeight: 600, fontSize: '13px', marginBottom: '24px' }}>
                <ShieldCheck size={16} /> Trusted Edge AI Platform
              </div>
              <h1 style={{ fontSize: '3.5rem', fontWeight: 900, lineHeight: 1.1, marginBottom: '24px', color: '#0F172A', letterSpacing: '-1px' }}>
                Protecting Livestock.<br />
                <span className="gradient-text">Securing Livelihoods.</span>
              </h1>
              <p style={{ fontSize: '1.25rem', color: 'var(--text-sub)', marginBottom: '40px', lineHeight: 1.6, maxWidth: '540px' }}>
                Empowering Indian farmers with instant, offline-first AI disease diagnosis, smart digital twin health records, and veterinary teleconsultation.
              </p>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <Link to="/login" className="btn btn-primary" style={{ padding: '0 32px', height: '54px', fontSize: '16px', borderRadius: '100px' }}>
                  Get Started <ChevronRight size={20} style={{ marginLeft: '8px' }} />
                </Link>
                <a href="#features" className="btn btn-secondary" style={{ padding: '0 32px', height: '54px', fontSize: '16px', borderRadius: '100px' }}>
                  Learn More
                </a>
              </div>
            </FadeIn>
          </div>

          <div style={{ flex: '1 1 500px', position: 'relative' }}>
            <FadeIn delay={0.2}>
              <div className="glass-panel" style={{ borderRadius: '32px', padding: '16px', position: 'relative', zIndex: 2 }}>
                <img src="https://images.unsplash.com/photo-1596733430284-f7437764b1a9?auto=format&fit=crop&w=800&q=80" alt="Farmer with healthy cattle" style={{ width: '100%', borderRadius: '20px', display: 'block' }} />
                
                {/* Floating Mockup Card */}
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.8 }}
                  className="glass-panel" 
                  style={{ position: 'absolute', bottom: '-30px', left: '-30px', padding: '20px', borderRadius: '24px', display: 'flex', alignItems: 'center', gap: '16px', width: '280px' }}
                >
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Activity size={24} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, color: 'var(--text-main)' }}>Scan Complete</div>
                    <div style={{ fontSize: '13px', color: 'var(--primary)' }}>Lumpy Skin Disease: 96%</div>
                  </div>
                </motion.div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ─── Stats Section ─── */}
      <section style={{ padding: '60px 24px', background: 'white' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <FadeIn>
            <div className="grid-4" style={{ textAlign: 'center' }}>
              <div>
                <div style={{ fontSize: '40px', fontWeight: 900, color: 'var(--primary-dark)', marginBottom: '8px' }}>60%</div>
                <div style={{ color: 'var(--text-sub)', fontWeight: 500 }}>Losses due to delayed detection</div>
              </div>
              <div>
                <div style={{ fontSize: '40px', fontWeight: 900, color: 'var(--primary-dark)', marginBottom: '8px' }}>₹20K Cr+</div>
                <div style={{ color: 'var(--text-sub)', fontWeight: 500 }}>Annual economic loss in India</div>
              </div>
              <div>
                <div style={{ fontSize: '40px', fontWeight: 900, color: 'var(--primary-dark)', marginBottom: '8px' }}>15+</div>
                <div style={{ color: 'var(--text-sub)', fontWeight: 500 }}>Major diseases monitored</div>
              </div>
              <div>
                <div style={{ fontSize: '40px', fontWeight: 900, color: 'var(--primary-dark)', marginBottom: '8px' }}>1.3B+</div>
                <div style={{ color: 'var(--text-sub)', fontWeight: 500 }}>Livestock population at risk</div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ─── Features Grid ─── */}
      <section id="features" className="landing-section">
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <FadeIn>
            <div style={{ textAlign: 'center', marginBottom: '60px' }}>
              <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '16px', color: 'var(--text-main)' }}>Comprehensive Digital Platform</h2>
              <p style={{ fontSize: '1.1rem', color: 'var(--text-sub)', maxWidth: '600px', margin: '0 auto' }}>
                A unified ecosystem solving the hardest challenges in rural animal healthcare through offline-first Edge AI.
              </p>
            </div>
          </FadeIn>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            {[
              { icon: <Cpu />, title: 'Edge AI Detection (Offline)', desc: 'Instant ML inference on your phone without internet connectivity using TensorFlow Lite.' },
              { icon: <Stethoscope />, title: 'Gemini AI Vet Chat', desc: 'Conversational symptom checking and first-aid measures powered by Google Gemini.' },
              { icon: <MapIcon />, title: 'Disease Outbreak Heatmaps', desc: 'Real-time spatial epidemiology using PostGIS to track and predict spread vectors.' },
              { icon: <FileText />, title: 'Digital Twin Health Records', desc: 'Immutable, synchronized ledgers of animal health, vaccinations, and recovery.' },
              { icon: <Activity />, title: 'IoT Smart Monitoring', desc: 'Telemetry feeds for temperature, heart rate, and GPS tracking to preempt illnesses.' },
              { icon: <Cloud />, title: 'Secure Cloud Sync', desc: 'Opportunistic synchronization with Supabase when connectivity is restored.' }
            ].map((feat, i) => (
              <FadeIn key={i} delay={0.1 * i}>
                <div className="glass-panel" style={{ padding: '32px', borderRadius: '24px', height: '100%' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'var(--primary-glow)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                    {feat.icon}
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '12px', color: 'var(--text-main)' }}>{feat.title}</h3>
                  <p style={{ color: 'var(--text-sub)', lineHeight: 1.6 }}>{feat.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Tech Stack ─── */}
      <section style={{ padding: '80px 24px', background: 'var(--bg-elevated)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', textAlign: 'center' }}>
          <FadeIn>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '40px', color: 'var(--text-main)' }}>Built with Advanced Technology</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '16px' }}>
              {['React', 'Node.js', 'Express', 'Prisma', 'Supabase', 'PostgreSQL', 'PostGIS', 'Redis', 'FastAPI', 'TensorFlow Lite', 'Google Gemini'].map((tech, i) => (
                <div key={i} style={{ background: 'white', border: '1px solid var(--border)', padding: '12px 24px', borderRadius: '100px', fontWeight: 600, color: 'var(--text-main)', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                  {tech}
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer style={{ background: '#0F172A', color: 'white', padding: '80px 24px 40px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '60px', justifyContent: 'space-between', marginBottom: '60px' }}>
            <div style={{ maxWidth: '300px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <img src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" alt="Emblem" style={{ height: '48px', filter: 'brightness(0) invert(1)' }} />
                <div>
                  <div style={{ fontWeight: 800, fontSize: '24px', color: 'white' }}>PashuRakshak</div>
                  <div style={{ fontSize: '11px', color: '#94A3B8' }}>Digital India Initiative</div>
                </div>
              </div>
              <p style={{ color: '#94A3B8', lineHeight: 1.6 }}>
                An AI-powered offline livestock disease detection platform securing livelihoods across rural India.
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: '60px', flexWrap: 'wrap' }}>
              <div>
                <h4 style={{ fontWeight: 700, marginBottom: '20px', color: 'white' }}>Quick Links</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <Link to="/login" style={{ color: '#94A3B8', textDecoration: 'none' }}>Login Portal</Link>
                  <Link to="/register" style={{ color: '#94A3B8', textDecoration: 'none' }}>Register Farm</Link>
                  <a href="#features" style={{ color: '#94A3B8', textDecoration: 'none' }}>Guidelines</a>
                </div>
              </div>
              <div>
                <h4 style={{ fontWeight: 700, marginBottom: '20px', color: 'white' }}>Security</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <span style={{ color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '8px' }}><Lock size={14} /> Data Privacy</span>
                  <span style={{ color: '#94A3B8' }}>Terms of Service</span>
                </div>
              </div>
            </div>
          </div>
          
          <div style={{ borderTop: '1px solid #1E293B', paddingTop: '32px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '20px', color: '#64748B', fontSize: '14px' }}>
            <div>&copy; {new Date().getFullYear()} PashuRakshak. Government of India.</div>
            <div style={{ display: 'flex', gap: '24px' }}>
              <span>Made for Bharat 🇮🇳</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
