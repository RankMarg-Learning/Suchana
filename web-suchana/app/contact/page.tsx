import { Metadata } from "next";
import { Mail, MapPin, Clock, MessageSquare, ShieldCheck, Zap, Smartphone, Send, MessageCircle, ExternalLink } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact Us — Exam Suchana",
  description: "Get in touch with the Exam Suchana team for support, feature requests, or collaboration inquiries.",
};

export default function ContactPage() {
  return (
    <main className="min-h-screen">
      {/* ─── Hero ─── */}
      <section className="section" style={{ paddingTop: '100px', paddingBottom: '60px', position: 'relative' }}>
         <div
            style={{
              position: "absolute",
              inset: 0,
              background: "radial-gradient(ellipse 70% 60% at 50% -10%, rgba(var(--accent-rgb), 0.12) 0%, transparent 70%)",
              zIndex: 0
            }}
          />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div className="hero-badge">
            <span className="hero-badge-dot" />
            Support Center
          </div>
          <h1 className="section-title">
            How can we <span className="text-accent">help you</span> today?
          </h1>
          <p className="section-desc">
            Whether you&apos;re an aspirant with a question or a partner looking to collaborate, reach out via our official channels below.
          </p>
        </div>
      </section>

      {/* ─── Contact Channels ─── */}
      <section className="section" style={{ paddingTop: '20px', paddingBottom: '100px' }}>
        <div className="container">
          <div className="features-grid">
            
            {/* Email Channel */}
            <div className="feature-card" style={{ background: 'linear-gradient(135deg, rgba(var(--accent-rgb), 0.08), transparent)', borderColor: 'rgba(var(--accent-rgb), 0.2)', padding: '40px' }}>
              <div className="feature-icon" style={{ background: 'rgba(var(--accent-rgb), 0.15)', color: 'var(--accent)', width: '64px', height: '64px', borderRadius: '18px' }}>
                <Mail size={28} />
              </div>
              <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
                Official Support Email
              </div>
              <a href="mailto:help@examsuchana.in" style={{ fontSize: '22px', fontWeight: 800, color: 'var(--accent)', textDecoration: 'none', display: 'block', marginBottom: '16px', fontFamily: 'Space Grotesk' }}>
                help@examsuchana.in
              </a>
              <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                Direct support for exam tracking, notification corrections, and partnership proposals. We review all messages within 24 hours.
              </p>
            </div>

            {/* Social & Community - FIXED ICONS */}
            <div className="feature-card" style={{ padding: '40px' }}>
              <div className="feature-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', width: '64px', height: '64px', borderRadius: '18px' }}>
                <MessageSquare size={28} />
              </div>
              <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>
                Active Communities
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <a href="https://t.me/examsuchana" target="_blank" rel="noopener noreferrer" 
                  className="btn"
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    padding: '12px 18px', 
                    background: 'rgba(0, 136, 204, 0.08)',
                    border: '1px solid rgba(0, 136, 204, 0.2)',
                    borderRadius: '12px',
                    color: '#0088cc',
                    textDecoration: 'none',
                    fontWeight: 700,
                    width: '100%'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Send size={18} />
                    Telegram Channel
                  </div>
                  <ExternalLink size={14} opacity={0.6} />
                </a>
                
                <a href="https://wa.me/examsuchana" target="_blank" rel="noopener noreferrer" 
                  className="btn"
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    padding: '12px 18px', 
                    background: 'rgba(37, 211, 102, 0.08)',
                    border: '1px solid rgba(37, 211, 102, 0.2)',
                    borderRadius: '12px',
                    color: '#128c7e',
                    textDecoration: 'none',
                    fontWeight: 700,
                    width: '100%'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <MessageCircle size={18} />
                    WhatsApp Updates
                  </div>
                  <ExternalLink size={14} opacity={0.6} />
                </a>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '20px', lineHeight: 1.6 }}>
                Fastest exam notifications. Join thousands of aspirants receiving real-time alerts.
              </p>
            </div>

            {/* Operational Info */}
            <div className="feature-card" style={{ padding: '40px' }}>
              <div className="feature-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', width: '64px', height: '64px', borderRadius: '18px' }}>
                <Clock size={28} />
              </div>
              <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
                Operating Hours
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>Mon – Sat, 9:00 AM – 6:00 PM</div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Indian Standard Time (IST)</div>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '14px', color: 'var(--text-secondary)' }}>
                <MapPin size={14} color="var(--accent)" /> Pan-India Intelligence Operations
              </div>
            </div>
          </div>

          {/* Secondary Support Context */}
          <div style={{ marginTop: '48px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
             <div className="feature-card" style={{ background: 'var(--bg-secondary)', border: 'none' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <ShieldCheck size={18} color="#10b981" /> Data Integrity
                </h3>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  Spotted an error in an exam timeline? Email us the official gazette link. Our content team verifies and updates within 4 operational hours.
                </p>
             </div>
             <div className="feature-card" style={{ background: 'var(--bg-secondary)', border: 'none' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Smartphone size={18} color="var(--accent)" /> Mobile App Support
                </h3>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  Experiencing issues with notification delivery or account synchronization? Reach out with your device model details for priority debugging.
                </p>
             </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="section">
        <div className="container" style={{ textAlign: 'center' }}>
          <div className="notify-card" style={{ padding: '60px 40px' }}>
            <h2 className="section-title" style={{ margin: '0 0 16px' }}>Ready to target your next exam?</h2>
            <Link href="/" className="btn btn-primary btn-lg">
              Return to Control Center
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
