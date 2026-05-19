import type { Metadata } from "next";
import {
  AlertTriangle,
  Info,
  ExternalLink,
  Scale,
  FileWarning,
  Globe,
  RefreshCcw,
  Mail,
  ShieldAlert,
  BookOpen,
  Wrench,
  Calendar,
  Coins
} from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Disclaimer — Exam Suchana",
  description:
    "Read the official Disclaimer for Exam Suchana. Understand the limitations of our government exam data, third-party links, and liability exclusions.",
};

const LAST_UPDATED = "15 April 2026";

const SECTIONS = [
  { id: "d1", label: "General Disclaimer", icon: <Info size={16} /> },
  { id: "d2", label: "Not a Govt. Entity", icon: <ShieldAlert size={16} /> },
  { id: "d3", label: "Accuracy of Data", icon: <FileWarning size={16} /> },
  { id: "d4", label: "Verify Officially", icon: <BookOpen size={16} /> },
  { id: "d5", label: "Third-Party Links", icon: <ExternalLink size={16} /> },
  { id: "d6", label: "Limitation of Liability", icon: <Scale size={16} /> },
  { id: "d7", label: "No Legal Advice", icon: <AlertTriangle size={16} /> },
  { id: "d8", label: "Data Changes", icon: <RefreshCcw size={16} /> },
  { id: "d9", label: "Governing Law", icon: <Globe size={16} /> },
  { id: "d10", label: "Contact Us", icon: <Mail size={16} /> },
];

export default function DisclaimerPage() {
  return (
    <div className="wrap-home" style={{ marginTop: '24px', marginBottom: '60px' }}>
      <div className="page-grid">
        
        {/* LEFT COLUMN: MAIN CONTENT */}
        <div className="content-col">
          
          {/* HEADER */}
          <div className="sh">
            <div className="sh-title">
              <span className="cat-tag">LEGAL</span> Platform Disclaimer &amp; Compliance
            </div>
            <div className="sh-link" style={{ color: 'var(--accent)' }}>
              UPDATED: {LAST_UPDATED}
            </div>
          </div>

          {/* Warning Banner */}
          <div style={{
            display: "flex",
            gap: "14px",
            alignItems: "flex-start",
            background: "rgba(245,158,11,0.06)",
            border: "1px solid rgba(245,158,11,0.2)",
            borderRadius: "6px",
            padding: "16px 20px",
            marginBottom: "24px",
          }}>
            <AlertTriangle size={20} color="#f59e0b" style={{ flexShrink: 0, marginTop: "2px" }} />
            <p style={{ fontSize: "14px", color: "var(--text-muted)", lineHeight: 1.6, margin: 0 }}>
              <strong style={{ color: "var(--ink)" }}>Important:</strong> Exam Suchana is an independent information aggregator. We are <strong style={{ color: "var(--ink)" }}>not affiliated</strong> with UPSC, SSC, IBPS, Railways, or any State PSC. Always verify critical dates and links on official government portals before taking any action.
            </p>
          </div>

          {/* CONTENT SECTIONS */}
          <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
            
            <LegalSection id="d1" title="1. General Disclaimer">
              <p>
                The information published on <strong>Exam Suchana</strong> (accessible at <em>examsuchana.in</em>) is intended solely for general informational and educational purposes. It is aggregated from publicly available government notifications, official press releases, and authenticated online portals.
              </p>
              <p>
                While we make every effort to keep information accurate and current, we make <strong>no representations or warranties</strong> of any kind — express or implied — about the completeness, accuracy, reliability, suitability, or availability of any information on this platform.
              </p>
            </LegalSection>

            <LegalSection id="d2" title="2. Not a Government Entity">
              <div style={{
                borderLeft: '4px solid #ef4444',
                background: '#fff5f5',
                padding: '16px 20px',
                borderRadius: '4px',
                marginBottom: '16px'
              }}>
                <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                  <ShieldAlert color="#ef4444" size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <h4 style={{ fontWeight: 800, color: "#ef4444", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px", margin: '0 0 4px 0' }}>
                      Critical Disclosure
                    </h4>
                    <p style={{ fontSize: "13.5px", color: "var(--ink)", lineHeight: 1.6, fontWeight: 600, margin: 0 }}>
                      Exam Suchana is a private, independent platform. We are <strong>not affiliated with, endorsed by, or representing</strong> any government body, including but not limited to: UPSC, SSC, IBPS, RRB/RRC, SBI, RBI, NTA, DSSSB, BPSC, MPPSC, UPPSC, or any other State or Central Public Service Commission.
                    </p>
                  </div>
                </div>
              </div>
              <p>
                Our platform serves as a lifecycle-tracking tool. We do not conduct exams, issue admit cards, declare results, or accept applications on behalf of any government authority.
              </p>
            </LegalSection>

            <LegalSection id="d3" title="3. Accuracy of Data">
              <p>
                Government exam schedules, registration dates, syllabus details, and result timelines are subject to change without notice by the respective conducting bodies. Exam Suchana strives to reflect these updates promptly but <strong>cannot guarantee real-time accuracy</strong> at all times.
              </p>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "16px" }}>
                {[
                  { label: "Registration Dates", note: "May shift due to official amendments" },
                  { label: "Admit Card Links", note: "Valid only when officially released" },
                  { label: "Exam Dates", note: "Subject to postponement by authorities" },
                  { label: "Result Declarations", note: "Timelines not guaranteed by us" },
                ].map((item) => (
                  <div key={item.label} style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '6px', padding: '12px 16px', fontSize: '13px' }}>
                    <strong style={{ color: "var(--ink)" }}>{item.label}:</strong>{" "}
                    <span style={{ color: "var(--text-muted)" }}>{item.note}</span>
                  </div>
                ))}
              </div>
            </LegalSection>

            <LegalSection id="d4" title="4. Always Verify Officially">
              <p>
                Users are <strong>strongly and legally advised</strong> to verify all examination data — including application deadlines, exam schedules, eligibility criteria, fee structures, and result dates — directly from the respective official government portals before taking any action.
              </p>
              <p>
                Relying solely on information from Exam Suchana without cross-checking official sources may lead to adverse consequences for which Exam Suchana bears no responsibility whatsoever.
              </p>
            </LegalSection>

            <LegalSection id="d5" title="5. Third-Party Links">
              <p>
                Exam Suchana may contain links to external websites, including official government portals, exam authority websites, and notification PDFs. These external links are provided for user convenience only.
              </p>
              <p>
                We have <strong>no control over the content, availability, or accuracy</strong> of third-party websites. Inclusion of any link does not imply endorsement, recommendation, or approval by Exam Suchana. We are not responsible for any harm or damage incurred from accessing third-party sites.
              </p>
            </LegalSection>

            <LegalSection id="d6" title="6. Limitation of Liability">
              <p>
                To the maximum extent permitted by applicable law, Exam Suchana, its founders, officers, employees, and agents shall not be liable for:
              </p>
              <ul style={{ paddingLeft: "20px", listStyleType: "disc", fontSize: '14.5px', color: 'var(--text-muted)', lineHeight: 1.8 }}>
                <li>Missed deadlines resulting from inaccurate or outdated information</li>
                <li>Financial losses, including application fees paid based on incorrect data displayed</li>
                <li>Decisions made based on information available on this platform</li>
                <li>Temporary or permanent unavailability of the platform</li>
                <li>Loss of data, notification failures, or delivery delays</li>
                <li>Any indirect, incidental, consequential, or punitive damages</li>
              </ul>
            </LegalSection>

            <LegalSection id="d7" title="7. No Professional or Legal Advice">
              <p>
                Nothing on Exam Suchana constitutes legal, financial, career, or professional advice. Content published here is for informational purposes only and should not be treated as a substitute for professional guidance appropriate to your specific situation.
              </p>
              <p>
                For eligibility-related queries, form-filling guidance, or legal concerns related to a particular examination, please consult the respective conducting body directly or seek qualified professional advice.
              </p>
            </LegalSection>

            <LegalSection id="d8" title="8. Data Changes &amp; Platform Updates">
              <p>
                We reserve the right to modify, update, or remove any information on this platform at any time without prior notice. Exam data, timelines, and notification content may be updated based on official announcements.
              </p>
              <p>
                This Disclaimer itself may be revised periodically. Continued use of Exam Suchana after any changes constitutes acceptance of the updated Disclaimer. The <strong>"Last Updated"</strong> date at the top of this page reflects the most recent revision.
              </p>
            </LegalSection>

            <LegalSection id="d9" title="9. Governing Law">
              <p>
                This Disclaimer and any disputes arising from the use of Exam Suchana shall be governed by and construed in accordance with the laws of the <strong>Republic of India</strong>. Any legal proceedings shall be subject to the exclusive jurisdiction of the competent courts in India.
              </p>
            </LegalSection>

            <LegalSection id="d10" title="10. Contact Us">
              <p>
                If you have concerns about the accuracy of information on our platform or wish to report an error, please reach out to us:
              </p>
              
              <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '8px', padding: '20px', marginTop: '16px' }}>
                <div style={{ fontWeight: 800, color: "var(--ink)", fontSize: "15px", marginBottom: "12px" }}>
                  Exam Suchana — Compliance &amp; Support
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px", fontSize: '13.5px' }}>
                  <Mail size={16} color="var(--accent)" />
                  <a href="mailto:help@examsuchana.in" style={{ fontWeight: 700, color: "var(--accent)", textDecoration: "none" }}>
                    help@examsuchana.in
                  </a>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: '13.5px' }}>
                  <Globe size={16} color="var(--accent)" />
                  <a href="https://examsuchana.in" style={{ color: "var(--text-muted)", textDecoration: "none" }}>
                    examsuchana.in/disclaimer
                  </a>
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
              <Scale size={16} className="text-amber-500" /> Navigation
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

function LegalSection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      id={id}
      style={{
        scrollMarginTop: "120px",
        paddingBottom: "32px",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <h2
        style={{
          fontSize: "20px",
          fontWeight: 800,
          color: "var(--ink)",
          marginBottom: "16px",
          fontFamily: "var(--hd)",
        }}
      >
        {title}
      </h2>
      <div
        style={{
          fontSize: "14.5px",
          color: "var(--text-muted)",
          lineHeight: 1.7,
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        {children}
      </div>
    </div>
  );
}
