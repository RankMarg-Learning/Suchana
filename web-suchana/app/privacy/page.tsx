import type { Metadata } from "next";
import { Shield, Info, Lock, Eye, AlertTriangle, UserCheck, ExternalLink, RefreshCcw, Mail, Globe, Calendar, Coins, BookOpen, Wrench } from "lucide-react";
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
  { id: "disclaimer", label: "Critical Disclaimer", icon: <AlertTriangle size={16} /> },
  { id: "usage", label: "How We Use It", icon: <RefreshCcw size={16} /> },
  { id: "sharing", label: "Data Security", icon: <Lock size={16} /> },
  { id: "rights", label: "User Rights", icon: <UserCheck size={16} /> },
  { id: "contact", label: "Contact Us", icon: <Mail size={16} /> },
];

export default function PrivacyPage() {
  return (
    <div className="wrap-home" style={{ marginTop: '24px', marginBottom: '60px' }}>
      <div className="page-grid">
        
        {/* LEFT COLUMN: MAIN CONTENT */}
        <div className="content-col">
          
          {/* HEADER */}
          <div className="sh">
            <div className="sh-title">
              <span className="cat-tag">SECURITY</span> Privacy Policy &amp; Compliance
            </div>
            <div className="sh-link" style={{ color: 'var(--accent)' }}>
              UPDATED: {LAST_UPDATED}
            </div>
          </div>

          {/* DETAILED LEGAL SECTIONS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            
            <LegalSection id="intro" title="1. Operational Introduction">
              <p>
                <strong>Exam Suchana</strong> is an independent platform that aggregates publicly available notification data from various Indian government portals. Our mission is to transform fragmented administrative data into structured, actionable intelligence for aspirants.
              </p>
              <p>
                As a user, you must understand that this platform is <strong>not a government entity</strong>. We are a third-party intelligence tool designed for tracking purposes only.
              </p>
            </LegalSection>

            <LegalSection id="info" title="2. Information Architecture (Data We Collect)">
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--ink)', marginBottom: '8px' }}>A. Personal Intelligence</h3>
              <p>We only collect data that you explicitly provide to enhance your tracking experience:</p>
              <ul style={{ paddingLeft: '20px', listStyleType: 'disc', fontSize: '14.5px', color: 'var(--text-muted)', lineHeight: 1.8 }}>
                <li>Name &amp; Email (for notification delivery)</li>
                <li>Phone number (optional for high-priority alerts)</li>
                <li>Saved Exam Preferences</li>
              </ul>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--ink)', marginBottom: '8px', marginTop: '16px' }}>B. System Logs</h3>
              <p>To maintain platform uptime and security, we automatically log device models, OS versions, and anonymized access timestamps via secure server-side infrastructure.</p>
            </LegalSection>

            <LegalSection id="disclaimer" title="3. Mandatory Accountability Disclaimer">
              <div style={{
                borderLeft: '4px solid #ef4444',
                background: '#fff5f5',
                padding: '16px 20px',
                borderRadius: '4px',
                marginBottom: '16px'
              }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <AlertTriangle color="#ef4444" size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <h4 style={{ fontWeight: 800, color: "#ef4444", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px", margin: '0 0 4px 0' }}>
                      Critical Transparency Disclosure
                    </h4>
                    <p style={{ fontSize: "13.5px", color: "var(--ink)", lineHeight: 1.6, fontWeight: 600, margin: 0 }}>
                      Exam Suchana is not affiliated with the UPSC, SSC, IBPS, Railways, or any State PSC. All information is retrieved from official government gazettes and websites. However, we do not represent these entities. Users are legally required to verify all dates and links on official government portals before final submission.
                    </p>
                  </div>
                </div>
              </div>
            </LegalSection>

            <LegalSection id="usage" title="4. Deployment of Information">
              <p>Data gathered via Exam Suchana is used for:</p>
              <ul style={{ paddingLeft: '20px', listStyleType: 'disc', fontSize: '14.5px', color: 'var(--text-muted)', lineHeight: 1.8 }}>
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
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '16px' }}>
                <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '6px', padding: '12px 16px', fontSize: '13px' }}>
                  <strong style={{ color: "var(--ink)" }}>Data Access:</strong> Request a complete record of your stored preferences.
                </div>
                <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '6px', padding: '12px 16px', fontSize: '13px' }}>
                  <strong style={{ color: "var(--ink)" }}>Digital Erasure:</strong> Permanent deletion of your account and saved exam data.
                </div>
              </div>
            </LegalSection>

            <LegalSection id="contact" title="7. Legal &amp; Privacy Contact">
              <p>For any inquiries regarding data protection or rights, reach out to our compliance lead:</p>
              
              <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '8px', padding: '20px', marginTop: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', fontSize: '13.5px' }}>
                  <Mail size={16} color="var(--accent)" />
                  <a href="mailto:help@examsuchana.in" style={{ fontWeight: 700, color: 'var(--accent)', textDecoration: 'none' }}>help@examsuchana.in</a>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13.5px' }}>
                  <Globe size={16} color="var(--accent)" />
                  <span style={{ color: 'var(--text-muted)' }}>examsuchana.in/privacy</span>
                </div>
              </div>
            </LegalSection>

          </div>

        </div>

        {/* RIGHT COLUMN: SIDEBAR */}
        <div className="sidebar-col">
          
          {/* NAVIGATION WIDGET */}
          <div className="sw" style={{ marginTop: 0 }}>
            <div className="sw-head flex items-center gap-1.5">
              <Lock size={16} className="text-amber-500" /> Navigation
            </div>
            <div className="sw-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {SECTIONS.map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontSize: "13.5px",
                      fontWeight: 600,
                      color: "var(--text2)",
                      textDecoration: "none",
                      padding: "8px 12px",
                      borderRadius: "4px",
                      transition: "all 0.2s",
                    }}
                    className="sidebar-link"
                  >
                    {section.icon}
                    <span>{section.label}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* ASPIRANT TOOLSET */}
          <div className="sw">
            <div className="sw-head flex items-center gap-1.5">
              <Wrench size={16} className="text-purple-400" /> Aspirant Toolset
            </div>
            <div className="sw-body">
              <div className="tool-grid" style={{ gridTemplateColumns: '1fr' }}>
                <Link href="/age-calculator" className="tool-btn" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px', textDecoration: 'none' }}>
                  <span className="tool-icon" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Calendar size={18} />
                  </span>
                  Age Calculator
                </Link>
                <Link href="/salary-calculator" className="tool-btn" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px', textDecoration: 'none' }}>
                  <span className="tool-icon" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Coins size={18} />
                  </span>
                  Salary Calculator
                </Link>
                <Link href="/syllabus" className="tool-btn" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px', textDecoration: 'none' }}>
                  <span className="tool-icon" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    <BookOpen size={18} />
                  </span>
                  Syllabus Maps
                </Link>
              </div>
            </div>
          </div>

        </div>

      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
          .sidebar-link:hover {
            background: rgba(124, 58, 237, 0.06) !important;
            color: var(--accent) !important;
          }
        `
      }} />
    </div>
  );
}

function LegalSection({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <div id={id} style={{ scrollMarginTop: '120px', paddingBottom: '32px', borderBottom: '1px solid var(--border)' }}>
      <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--ink)', marginBottom: '16px', fontFamily: 'var(--hd)' }}>
        {title}
      </h2>
      <div style={{ fontSize: '14.5px', color: 'var(--text-muted)', lineHeight: 1.7, display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {children}
      </div>
    </div>
  );
}
