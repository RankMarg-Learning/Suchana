import type { Metadata } from "next";
import { Shield, Book, Info, Lock, Eye, AlertTriangle, UserCheck, Accessibility, ExternalLink, RefreshCcw, Mail, Globe } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — Exam Suchana",
  description:
    "Read Exam Suchana's Privacy Policy. Learn how we collect, use, and protect your personal data.",
};

const LAST_UPDATED = "24 March 2026";

const SECTIONS = [
  { id: "intro", label: "Introduction", icon: <Info size={16} /> },
  { id: "info", label: "Data We Collect", icon: <Eye size={16} /> },
  { id: "usage", label: "How We Use It", icon: <RefreshCcw size={16} /> },
  { id: "disclaimer", label: "Critical Disclaimer", icon: <AlertTriangle size={16} /> },
  { id: "sharing", label: "Data Sharing", icon: <Lock size={16} /> },
  { id: "thirdparty", label: "Third-Party Tools", icon: <ExternalLink size={16} /> },
  { id: "security", label: "Data Security", icon: <Shield size={16} /> },
  { id: "rights", label: "User Rights", icon: <UserCheck size={16} /> },
  { id: "contact", label: "Contact Us", icon: <Mail size={16} /> },
];

export default function PrivacyPage() {
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
            Compliance & Privacy
          </div>
          <h1 className="section-title">
            Our commitment to <span className="text-accent">User Privacy</span>
          </h1>
          <p className="section-desc">
            Last updated: <strong>{LAST_UPDATED}</strong>. We believe in total transparency regarding your data and how we handle government exam information.
          </p>
        </div>
      </section>

      {/* ─── Legal Content ─── */}
      <section className="section" style={{ paddingTop: '20px', paddingBottom: '100px' }}>
        <div className="container mobile-stack" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 260px) 1fr', gap: '60px', alignItems: 'start' }}>
          
          {/* Sticky Sidebar Navigation */}
          <aside style={{ position: 'sticky', top: '100px', zIndex: 10 }}>
            <div className="feature-card" style={{ padding: '24px', background: 'var(--bg-secondary)', border: 'none' }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>
                Quick Navigation
              </div>
              <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {SECTIONS.map((section) => (
                  <a 
                    key={section.id} 
                    href={`#${section.id}`}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '10px', 
                      fontSize: '13px', 
                      color: 'var(--text-secondary)',
                      textDecoration: 'none',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      transition: 'all 0.2s',
                    }}
                    className="sidebar-link"
                  >
                    {section.icon}
                    {section.label}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          {/* Detailed Legal Content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
            
            <LegalSection id="intro" title="1. Operational Introduction">
              <p>
                <strong>Exam Suchana</strong> is an independent platform that aggregates publicly available notification data from various Indian government portals. Our mission is to transform fragmented administrative data into structured, actionable intelligence for aspirants.
              </p>
              <p>
                As a user, you must understand that this platform is **not a government entity**. We are a third-party intelligence tool designed for tracking purposes only.
              </p>
            </LegalSection>

            <LegalSection id="info" title="2. Information Architecture (Data We Collect)">
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>A. Personal Intelligence</h3>
              <p>We only collect data that you explicitly provide to enhance your tracking experience:</p>
              <ul style={{ paddingLeft: '20px', listStyleType: 'disc' }}>
                <li>Name & Email (for notification delivery)</li>
                <li>Phone number (optional for high-priority alerts)</li>
                <li>Saved Exam Preferences</li>
              </ul>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px', marginTop: '16px' }}>B. System Logs</h3>
              <p>To maintain platform uptime and security, we automatically log device models, OS versions, and anonymized access timestamps via secure server-side infrastructure.</p>
            </LegalSection>

            <LegalSection id="disclaimer" title="3. Mandatory Accountability Disclaimer">
              <div className="feature-card" style={{ borderColor: 'rgba(var(--red-rgb, 239, 68, 68), 0.2)', background: 'rgba(var(--red-rgb, 239, 68, 68), 0.03)', padding: '24px' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <AlertTriangle color="#ef4444" size={20} style={{ flexShrink: 0 }} />
                  <div>
                    <h4 style={{ fontWeight: 800, color: '#ef4444', fontSize: '14px', textTransform: 'uppercase', marginBottom: '8px' }}>Critical Transparency Disclosure</h4>
                    <p style={{ fontSize: '14px', color: 'var(--text-primary)', lineHeight: 1.6, fontWeight: 500 }}>
                      Exam Suchana is not affiliated with the UPSC, SSC, IBPS, Railways, or any State PSC. All information is retrieved from official government gazettes and websites. However, we do not represent these entities. Users are legally required to verify all dates and links on official government portals before final submission.
                    </p>
                  </div>
                </div>
              </div>
            </LegalSection>

            <LegalSection id="usage" title="4. Deployment of Information">
              <p>Data gathered via Exam Suchana is used for:</p>
              <ul style={{ paddingLeft: '20px', listStyleType: 'disc' }}>
                <li>Generating personalized exam schedules</li>
                <li>Delivering millisecond-precise push notifications</li>
                <li>Analyzing platform usage trends to prioritize future exam tracking</li>
              </ul>
            </LegalSection>

            <LegalSection id="sharing" title="5. Strategic Data Security">
              <p>
                <strong>Zero Selling Policy:</strong> We do not sell, trade, or rent your personal information to third-party marketing companies. Your tracking data is used exclusively to improve your operational experience on Exam Suchana.
              </p>
              <p>
                We utilize enterprise-grade encryption (TLS 1.3) for data in transit and ensure all user records are stored behind filtered VPC architectures.
              </p>
            </LegalSection>

            <LegalSection id="rights" title="6. Aspirant Rights">
              <p>Every user has the right to:</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '16px' }} className="mobile-stack">
                <div className="feature-card" style={{ padding: '16px', fontSize: '13px' }}>
                  <strong>Data Access:</strong> Request a complete record of your stored preferences.
                </div>
                <div className="feature-card" style={{ padding: '16px', fontSize: '13px' }}>
                  <strong>Digital Erasure:</strong> Permanent deletion of your account and saved exam data.
                </div>
              </div>
            </LegalSection>

            <LegalSection id="contact" title="7. Legal & Privacy Contact">
              <p>For any inquiries regarding data protection or rights, reach out to our compliance lead:</p>
              <div className="feature-card" style={{ padding: '24px', background: 'var(--bg-secondary)', marginTop: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <Mail size={18} color="var(--accent)" />
                  <a href="mailto:help@examsuchana.in" style={{ fontWeight: 700, color: 'var(--accent)', textDecoration: 'none' }}>help@examsuchana.in</a>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Globe size={18} color="var(--accent)" />
                  <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>examsuchana.in/privacy</span>
                </div>
              </div>
            </LegalSection>
          </div>
        </div>
      </section>

      <style dangerouslySetInnerHTML={{ __html: `
        .sidebar-link:hover {
          background: rgba(var(--accent-rgb), 0.08) !important;
          color: var(--accent) !important;
        }
        @media (max-width: 768px) {
          .mobile-stack {
            grid-template-columns: 1fr !important;
            gap: 32px !important;
          }
        }
      `}} />
    </main>
  );
}

function LegalSection({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <div id={id} style={{ scrollMarginTop: '120px' }}>
      <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '20px', fontFamily: 'Space Grotesk' }}>
        {title}
      </h2>
      <div style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
        {children}
      </div>
    </div>
  );
}
