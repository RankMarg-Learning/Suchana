import type { Metadata } from "next";
import { 
  Users, Target, History, Heart, 
  MapPin, CheckCircle2, Zap, Shield, 
  Flag, Award, Clock
} from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Us — Exam Suchana",
  description:
    "Learn about Exam Suchana — India's most structured government exam lifecycle tracker. Our mission is to help every aspirant stay informed and never miss a deadline.",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen">
      {/* ─── Hero ─── */}
      <section className="section" style={{ paddingTop: '100px', paddingBottom: '80px', position: 'relative' }}>
         <div
            style={{
              position: "absolute",
              inset: 0,
              background: "radial-gradient(ellipse 70% 60% at 50% -10%, rgba(var(--accent-rgb), 0.15) 0%, transparent 70%)",
              zIndex: 0
            }}
          />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div className="hero-badge">
            <span className="hero-badge-dot" />
            Our Vision
          </div>
          <h1 className="section-title" style={{ maxWidth: '800px' }}>
            Unifying India&apos;s fragmented <span className="text-accent">Exam Intelligence</span>
          </h1>
          <p className="section-desc" style={{ fontSize: '18px' }}>
            Exam Suchana was born out of a simple frustration: government exam information is fragmented, inconsistent, and hard to act on. We built the high-precision platform we wished existed when we were aspirants.
          </p>
        </div>
      </section>

      {/* ─── Impact Stats ─── */}
      <section className="section bg-secondary">
        <div className="container">
          <div className="features-grid">
            {[
              { value: "1000+", label: "Exams Tracked", icon: <Award />, color: "var(--accent-light)" },
              { value: "50K+", label: "Daily Aspirants", icon: <Users />, color: "#3b82f6" },
              { value: "28", label: "States Covered", icon: <MapPin />, color: "#ef4444" },
              { value: "0", label: "Missed Deadlines", icon: <Clock />, color: "#10b981" },
            ].map((stat, i) => (
              <div key={i} className="feature-card" style={{ textAlign: 'center', padding: '40px 24px' }}>
                <div 
                  className="feature-icon mx-auto" 
                  style={{ background: `rgba(var(--accent-rgb), 0.08)`, color: stat.color, marginBottom: '20px' }}
                >
                  {stat.icon}
                </div>
                <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px', fontFamily: 'Space Grotesk' }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Mission & Content ─── */}
      <section className="section">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.2fr)', gap: '80px', alignItems: 'center' }} className="mobile-stack">
            <div>
              <div className="hero-badge">
                <span className="hero-badge-dot" style={{ background: '#10b981' }} />
                Operational Mission
              </div>
              <h2 className="section-title" style={{ fontSize: '32px', textAlign: 'left', margin: '20px 0' }}>
                Zero missed deadlines for every <span className="text-accent">Indian Aspirant</span>
              </h2>
              <div style={{ color: 'var(--text-secondary)', fontSize: '16px', lineHeight: 1.8 }}>
                <p style={{ marginBottom: '20px' }}>
                  Every year, thousands of brilliant candidates miss exam registrations not because they&apos;re unprepared — but because the lifecycle information was hidden behind bureaucratic websites and complex PDF notifications.
                </p>
                <p>
                  Exam Suchana provides a centralized, high-fidelity, and structured view of every major government exam in India. From the first notification to the final result declaration, we provide the military-grade tracking candidates need to succeed.
                </p>
              </div>
              <div style={{ marginTop: '32px', display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                <div className="status-badge status-ACTIVE">
                  <CheckCircle2 size={14} /> High Precision Tracking
                </div>
                <div className="status-badge status-REGISTRATION_OPEN">
                  <Zap size={14} /> Real-time Updates
                </div>
              </div>
            </div>
            <div className="feature-card" style={{ padding: '0', overflow: 'hidden', border: 'none', background: 'transparent' }}>
               <div className="notify-card" style={{ height: '100%', margin: 0 }}>
                  <div className="notify-icon"><Shield size={32} /></div>
                  <h3 className="notify-title">Data Integrity First</h3>
                  <p className="notify-desc">
                    Our team manually verifies every notification from official government gazettes to ensure you get 100% accurate information. No rumors, no fake news.
                  </p>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Values ─── */}
      <section className="section bg-secondary">
        <div className="container">
          <div className="hero-badge mx-auto">
            <span className="hero-badge-dot" style={{ background: 'var(--accent)' }} />
            Core Principles
          </div>
          <h2 className="section-title" style={{ marginBottom: '48px' }}>The values that <span className="text-accent">guide us</span></h2>
          <div className="features-grid">
            {[
              { icon: <Target />, title: "Clarity First", desc: "We translate complex bureaucratic notifications into actionable timelines." },
              { icon: <Zap />, title: "Instantaneous", desc: "Every lifecycle update is reflected the moment it's officially declared." },
              { icon: <Shield />, title: "Strict Privacy", desc: "Your data is yours. We never share aspirant information with third parties." },
              { icon: <Flag />, title: "Sovereign Focus", desc: "Exclusively built for the unique challenges of the Indian Exam ecosystem." },
            ].map((value, i) => (
              <div key={i} className="feature-card">
                <div className="feature-icon" style={{ background: 'rgba(var(--accent-rgb), 0.08)', color: 'var(--accent)' }}>
                  {value.icon}
                </div>
                <h3 className="feature-title">{value.title}</h3>
                <p className="feature-desc">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="section">
        <div className="container" style={{ textAlign: "center" }}>
          <div className="notify-card" style={{ background: 'var(--bg-card)', padding: '60px 40px' }}>
            <h2 className="section-title" style={{ margin: '0 0 16px' }}>Have questions for us?</h2>
            <p className="section-desc" style={{ marginBottom: '32px' }}>
              We&apos;d love to hear from you. Our engineering and content teams are always open to feedback.
            </p>
            <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/contact" className="btn btn-primary btn-lg">
                Get in Touch
              </Link>
              <a href="mailto:help@examsuchana.in" className="btn btn-ghost btn-lg">
                help@examsuchana.in
              </a>
            </div>
          </div>
        </div>
      </section>
      
      {/* Mobile Stack Utility Helper */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 768px) {
          .mobile-stack {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
          .mx-auto {
            margin-left: auto !important;
            margin-right: auto !important;
          }
        }
      `}} />
    </main>
  );
}
