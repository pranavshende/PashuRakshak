import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { 
  User, ShieldCheck, CheckCircle2, AlertTriangle, IndianRupee, MapPin, 
  Users, Camera, Stethoscope, Pill, FolderOpen, Bell, WifiOff, Cloud, 
  Map, ChevronRight, Check
} from 'lucide-react';

export default function Home() {
  const { user, isLoading } = useAuth();
  const { t } = useTranslation();

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
          <a href="#" className="mockup-nav-link active">{t('home.navHome')}</a>
          <a href="#features" className="mockup-nav-link">{t('home.navFeatures')}</a>
          <a href="#" className="mockup-nav-link">{t('home.navHowItWorks')}</a>
          <a href="#" className="mockup-nav-link">{t('home.navImpact')}</a>
          <a href="#" className="mockup-nav-link">{t('home.navAbout')}</a>
          <a href="#" className="mockup-nav-link">{t('home.navContact')}</a>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <select 
            value={i18n.language} 
            onChange={(e) => i18n.changeLanguage(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #E2E8F0', background: 'white', color: '#1E293B', fontSize: '14px', cursor: 'pointer', outline: 'none', fontWeight: 600 }}
          >
            <option value="en">English</option>
            <option value="hi">हिन्दी</option>
            <option value="mr">मराठी</option>
          </select>
          <Link to="/login" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 24px', borderRadius: '8px', background: '#064E3B', color: 'white', textDecoration: 'none' }}>
            <User size={18} /> {t('home.loginRegister')}
          </Link>
        </div>
      </nav>

      {/* ─── Red News Ticker ─── */}
      <div className="news-ticker">
        <div className="news-ticker-content">
          {t('home.newsTicker')}
        </div>
      </div>

      {/* ─── Hero Section ─── */}
      <section className="mockup-hero">
        <div className="mockup-hero-content">
          <div style={{ maxWidth: '500px' }}>
            <h1 style={{ fontSize: '42px', fontWeight: 800, color: '#0F172A', lineHeight: 1.2, marginBottom: '24px' }}>
              {t('home.heroTitle')}
            </h1>
            <p style={{ fontSize: '18px', color: '#475569', marginBottom: '40px', lineHeight: 1.6 }}>
              {t('home.heroDesc')}
            </p>

            <div className="hero-cta-row" style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
              <Link to="/login" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '14px 28px', background: '#059669', borderRadius: '8px' }}>
                <User size={20} /> {t('home.loginStart')}
              </Link>
              <a href="#features" className="btn btn-secondary" style={{ padding: '14px 28px', background: 'transparent', border: '1px solid #059669', color: '#059669', borderRadius: '8px' }}>
                {t('home.learnMore')}
              </a>
            </div>

            <div className="hero-badges" style={{ display: 'flex', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'white', padding: '10px 14px', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', flex: '1' }}>
                <WifiOff size={18} color="#059669" />
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A' }}>{t('home.offlineFirst')}</div>
                  <div style={{ fontSize: '10px', color: '#64748B' }}>{t('home.offlineDesc')}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'white', padding: '10px 14px', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', flex: '1' }}>
                <Camera size={18} color="#059669" />
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A' }}>{t('home.aiPowered')}</div>
                  <div style={{ fontSize: '10px', color: '#64748B' }}>{t('home.aiDesc')}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'white', padding: '10px 14px', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', flex: '1' }}>
                <ShieldCheck size={18} color="#059669" />
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A' }}>{t('home.secureTrusted')}</div>
                  <div style={{ fontSize: '10px', color: '#64748B' }}>{t('home.govAligned')}</div>
                </div>
              </div>
            </div>
          </div>
          
          <div style={{ width: '320px', height: '620px', background: 'white', borderRadius: '40px', border: '12px solid #1E293B', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ height: '100%', background: '#F8FAFC', padding: '24px' }}>
               <div style={{ textAlign: 'center', fontWeight: 700, color: '#059669', marginBottom: '8px' }}>{t('home.scanCattle')}</div>
               <div style={{ textAlign: 'center', fontSize: '12px', color: '#64748B', marginBottom: '24px' }}>{t('home.instantAi')}</div>
               <div style={{ width: '180px', height: '180px', margin: '0 auto', borderRadius: '50%', border: '4px dashed #059669', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px' }}>
                 <img src="https://images.unsplash.com/photo-1596733430284-f7437764b1a9?auto=format&fit=crop&w=300&q=80" alt="Scanning" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
               </div>
               <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#94A3B8', marginTop: '16px' }}>
                 <span>{t('home.scanning')}</span>
                 <span>80%</span>
               </div>
               <div style={{ marginTop: '32px', background: 'white', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                 <div style={{ fontSize: '11px', color: '#059669', fontWeight: 700, marginBottom: '4px' }}>{t('home.prediction')}</div>
                 <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>{t('home.lsd')}</div>
                 <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '12px' }}>{t('home.confidence')} 92%</div>
                 <div style={{ fontSize: '12px', color: '#059669', fontWeight: 700 }}>{t('home.viewDetails')}</div>
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
            <div style={{ fontSize: '12px', color: '#0F172A', fontWeight: 600 }}>{t('home.solvesThis')}</div>
          </div>
          
          <div className="mockup-bridge-left">
            <div style={{ color: '#DC2626', fontWeight: 800, fontSize: '14px', marginBottom: '16px', letterSpacing: '1px' }}>{t('home.theProblem')}</div>
            <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', marginBottom: '24px', lineHeight: 1.4 }}>
              {t('home.problemTitle')}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[t('home.p1'), t('home.p2'), t('home.p3'), t('home.p4')].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '15px', color: '#475569' }}>
                  <Check size={18} color="#059669" /> {item}
                </div>
              ))}
            </div>
          </div>

          <div className="mockup-bridge-right">
             <div style={{ color: '#059669', fontWeight: 800, fontSize: '14px', marginBottom: '16px', letterSpacing: '1px' }}>{t('home.ourSolution')}</div>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
              {[t('home.s1'), t('home.s2'), t('home.s3'), t('home.s4'), t('home.s5')].map((item, i) => (
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
            <div style={{ fontSize: '13px', color: '#475569' }}>{t('home.lossesDesc')}</div>
          </div>
        </div>
        <div className="mockup-stat-card">
          <div className="mockup-stat-icon"><IndianRupee size={32} /></div>
          <div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#0F172A' }}>₹20,000 Cr+</div>
            <div style={{ fontSize: '13px', color: '#475569' }}>{t('home.annualLoss')}</div>
          </div>
        </div>
        <div className="mockup-stat-card">
          <div className="mockup-stat-icon"><CheckCircle2 size={32} /></div>
          <div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#0F172A' }}>15+</div>
            <div style={{ fontSize: '13px', color: '#475569' }}>{t('home.majorDiseases')}</div>
          </div>
        </div>
        <div className="mockup-stat-card">
          <div className="mockup-stat-icon"><Users size={32} /></div>
          <div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#0F172A' }}>1.3 Billion+</div>
            <div style={{ fontSize: '13px', color: '#475569' }}>{t('home.livestockPop')}</div>
          </div>
        </div>
      </section>

      {/* ─── Features Grid ─── */}
      <section id="features" className="mockup-features">
        <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#0F172A', display: 'inline-block', borderBottom: '4px solid #059669', paddingBottom: '8px' }}>
          {t('home.featuresTitle')}
        </h2>
        <div className="mockup-features-grid">
          {[
            { icon: <Camera size={24} />, title: t('home.f1Title'), desc: t('home.f1Desc') },
            { icon: <Stethoscope size={24} />, title: t('home.f2Title'), desc: t('home.f2Desc') },
            { icon: <MapPin size={24} />, title: t('home.f3Title'), desc: t('home.f3Desc') },
            { icon: <Pill size={24} />, title: t('home.f4Title'), desc: t('home.f4Desc') },
            { icon: <FolderOpen size={24} />, title: t('home.f5Title'), desc: t('home.f5Desc') },
            { icon: <Bell size={24} />, title: t('home.f6Title'), desc: t('home.f6Desc') },
            { icon: <Users size={24} />, title: t('home.f7Title'), desc: t('home.f7Desc') },
            { icon: <WifiOff size={24} />, title: t('home.f8Title'), desc: t('home.f8Desc') }
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
                <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#064E3B', marginBottom: '16px' }}>{t('home.trustedSecure')}</h3>
                <p style={{ fontSize: '14px', color: '#475569', marginBottom: '24px', lineHeight: 1.6 }}>
                  {t('home.trustedDesc')}
                </p>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#059669' }}>
                  {t('home.securePoints')}
                </div>
              </div>
            </div>
          </div>
          <div className="mockup-tech-right">
            <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#064E3B' }}>{t('home.builtWith')}</h3>
            <div className="mockup-tech-grid">
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: '#059669', marginBottom: '12px' }}><Camera size={32} /></div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>{t('home.t1')}</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: '#059669', marginBottom: '12px' }}><WifiOff size={32} /></div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>{t('home.t2')}</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: '#059669', marginBottom: '12px' }}><Cloud size={32} /></div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>{t('home.t3')}</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: '#059669', marginBottom: '12px' }}><Map size={32} /></div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>{t('home.t4')}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Final CTA ─── */}
      <section className="mockup-cta">
        <div style={{ padding: '60px 0' }}>
          <h2 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '8px' }}>{t('home.startProtecting')}</h2>
          <p style={{ fontSize: '18px', color: '#A7F3D0', marginBottom: '32px' }}>{t('home.earlyDetection')}</p>
          <Link to="/login" className="btn btn-primary" style={{ background: 'white', color: '#064E3B', display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '16px 32px', borderRadius: '8px', fontWeight: 700, fontSize: '16px' }}>
            <User size={20} /> {t('home.loginNow')} <ChevronRight size={20} />
          </Link>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '60px 0' }}>
           <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Google Play" style={{ height: '48px' }} />
           <div style={{ height: '48px', background: 'black', borderRadius: '8px', border: '1px solid #333', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', padding: '0 16px', fontSize: '12px' }}>{t('home.downloadAppStore')}</div>
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
              {t('home.footerDesc')}
            </p>
          </div>
          <div>
            <h4 style={{ fontWeight: 700, color: '#0F172A', marginBottom: '16px', fontSize: '14px' }}>{t('home.quickLinks')}</h4>
            <a href="#" className="mockup-footer-link">{t('home.navHome')}</a>
            <a href="#features" className="mockup-footer-link">{t('home.navFeatures')}</a>
            <a href="#" className="mockup-footer-link">{t('home.navHowItWorks')}</a>
            <a href="#" className="mockup-footer-link">{t('home.navAbout')}</a>
            <a href="#" className="mockup-footer-link">{t('home.navContact')}</a>
          </div>
          <div>
            <h4 style={{ fontWeight: 700, color: '#0F172A', marginBottom: '16px', fontSize: '14px' }}>{t('home.resources')}</h4>
            <a href="#" className="mockup-footer-link">{t('home.userGuide')}</a>
            <a href="#" className="mockup-footer-link">{t('home.diseaseLibrary')}</a>
            <a href="#" className="mockup-footer-link">{t('home.vetDirectory')}</a>
            <a href="#" className="mockup-footer-link">{t('home.helpCenter')}</a>
            <a href="#" className="mockup-footer-link">{t('home.privacyPolicy')}</a>
          </div>
          <div>
            <h4 style={{ fontWeight: 700, color: '#0F172A', marginBottom: '16px', fontSize: '14px' }}>{t('home.support')}</h4>
            <p style={{ fontSize: '13px', color: '#475569', marginBottom: '8px' }}>{t('home.helpline')}</p>
            <p style={{ fontSize: '13px', color: '#475569', marginBottom: '8px' }}>{t('home.email')}</p>
            <p style={{ fontSize: '13px', color: '#475569', marginBottom: '16px' }}>{t('home.hours')}</p>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 0 0', borderTop: '1px solid #E2E8F0', fontSize: '13px', color: '#64748B' }}>
          <div>{t('home.copyright')}</div>
          <div>{t('home.empowering')}</div>
        </div>
      </footer>

    </div>
  );
}
