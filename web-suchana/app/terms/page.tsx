import type { Metadata } from "next";
import { Info, Scale, Wrench, Calendar, Coins, BookOpen, AlertTriangle, Mail, Globe } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms & Conditions — Exam Suchana",
  description:
    "Read Exam Suchana's Terms and Conditions. Understand the rules, limitations, and your rights when using our platform.",
};

const LAST_UPDATED = "17 March 2026";

const SECTIONS = [
  { id: "t1", label: "Acceptance of Terms" },
  { id: "t2", label: "Description of Service" },
  { id: "t3", label: "Use of the Platform" },
  { id: "t4", label: "Intellectual Property" },
  { id: "t5", label: "Accuracy of Information" },
  { id: "t6", label: "User Accounts" },
  { id: "t7", label: "Notifications" },
  { id: "t8", label: "Third-Party Links" },
  { id: "t9", label: "Disclaimer" },
  { id: "t10", label: "Limitation of Liability" },
  { id: "t11", label: "Indemnification" },
  { id: "t12", label: "Termination" },
  { id: "t13", label: "Governing Law" },
  { id: "t14", label: "Changes to Terms" },
  { id: "t15", label: "Contact" },
];

export default function TermsPage() {
  return (
    <div className="wrap-home" style={{ marginTop: '24px', marginBottom: '60px' }}>
      <div className="page-grid">
        
        {/* LEFT COLUMN: MAIN CONTENT */}
        <div className="content-col">
          
          {/* HEADER */}
          <div className="sh">
            <div className="sh-title">
              <span className="cat-tag">LEGAL</span> Terms &amp; Conditions
            </div>
            <div className="sh-link" style={{ color: 'var(--accent)' }}>
              UPDATED: {LAST_UPDATED}
            </div>
          </div>

          {/* Attention Banner */}
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
              <strong style={{ color: "var(--ink)" }}>Attention:</strong> Please read these Terms and Conditions carefully before using Exam Suchana. By accessing or using our platform, you agree to be bound by these terms.
            </p>
          </div>

          {/* CONTENT SECTIONS */}
          <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
            
            <Section id="t1" title="1. Acceptance of Terms">
              <p>
                By accessing or using Exam Suchana (&quot;the Platform&quot;), including our website at examsuchana.in and our mobile applications, you agree to comply with and be bound by these Terms and Conditions. If you do not agree, please refrain from using the Platform.
              </p>
            </Section>

            <Section id="t2" title="2. Description of Service">
              <p>
                Exam Suchana is an information aggregation platform that provides structured lifecycle tracking for government examinations in India. Our services include:
              </p>
              <ul style={{ paddingLeft: "20px", listStyleType: "disc", fontSize: '14.5px', color: 'var(--text-muted)', lineHeight: 1.8 }}>
                <li>Display of exam timelines, important dates, and official notifications</li>
                <li>Personalized push notification services for exam updates</li>
                <li>Search and filtering of government exam data</li>
                <li>Mobile application for on-the-go access</li>
              </ul>
            </Section>

            <Section id="t3" title="3. Use of the Platform">
              <p>You agree to use the Platform only for lawful purposes. You must not:</p>
              <ul style={{ paddingLeft: "20px", listStyleType: "disc", fontSize: '14.5px', color: 'var(--text-muted)', lineHeight: 1.8 }}>
                <li>Use the Platform in any way that violates applicable laws or regulations</li>
                <li>Attempt to gain unauthorized access to any part of the Platform</li>
                <li>Scrape, copy, or redistribute our data without prior written permission</li>
                <li>Introduce malicious code, viruses, or other harmful content</li>
                <li>Impersonate any person or entity or misrepresent your affiliation</li>
                <li>Use automated tools to access the Platform in ways that place excessive load</li>
              </ul>
            </Section>

            <Section id="t4" title="4. Intellectual Property">
              <p>
                All content on the Platform — including text, graphics, logos, interface design, and compiled data — is the property of Exam Suchana or its content suppliers and is protected by applicable intellectual property laws.
              </p>
              <p>
                Government exam notifications, date tables, and official PDFs referenced on our platform are the property of their respective issuing bodies (UPSC, SSC, Railway Boards, IBPS, State PSCs, etc.). We merely aggregate and present publicly available information for user convenience.
              </p>
            </Section>

            <Section id="t5" title="5. Accuracy of Information">
              <p>
                While we strive to maintain accurate and up-to-date exam information, <strong>Exam Suchana does not guarantee the completeness, accuracy, or timeliness of any exam data displayed on the Platform.</strong>
              </p>
              <p>
                Users are strongly advised to verify all critical dates — including registration deadlines, admit card availability, and result declarations — directly from the official websites of the respective exam conducting bodies before taking any action.
              </p>
            </Section>

            <Section id="t6" title="6. User Accounts">
              <p>
                To access certain features (such as personalized notifications), you may provide your name and email address. You are responsible for maintaining the confidentiality of your information and for all activities that occur under your account.
              </p>
            </Section>

            <Section id="t7" title="7. Notifications">
              <p>
                By enabling push or email notifications, you consent to receiving exam-related alerts from Exam Suchana. You may withdraw this consent at any time by unsubscribing or revoking notification permissions in your device settings. We will process opt-out requests immediately.
              </p>
            </Section>

            <Section id="t8" title="8. Third-Party Links">
              <p>
                The Platform may contain links to third-party websites, including official exam portals and government websites. These links are provided for your convenience only. Exam Suchana does not endorse these sites and is not responsible for their content, privacy practices, or availability.
              </p>
            </Section>

            <Section id="t9" title="9. Disclaimer of Warranties">
              <p>
                The Platform is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis without any warranties, express or implied, including but not limited to merchantability, fitness for a particular purpose, or non-infringement. Exam Suchana does not warrant that the Platform will be uninterrupted, error-free, or free of viruses.
              </p>
            </Section>

            <Section id="t10" title="10. Limitation of Liability">
              <p>
                To the fullest extent permitted by law, Exam Suchana and its officers, directors, employees, and agents shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Platform, including but not limited to:
              </p>
              <ul style={{ paddingLeft: "20px", listStyleType: "disc", fontSize: '14.5px', color: 'var(--text-muted)', lineHeight: 1.8 }}>
                <li>Missed exam registration deadlines due to inaccurate data</li>
                <li>Loss of data or notification failures</li>
                <li>Decisions made based on information on the Platform</li>
              </ul>
            </Section>

            <Section id="t11" title="11. Indemnification">
              <p>
                You agree to indemnify, defend, and hold harmless Exam Suchana and its affiliates from any claims, liabilities, damages, and expenses (including legal fees) arising from your use of the Platform or violation of these Terms.
              </p>
            </Section>

            <Section id="t12" title="12. Termination">
              <p>
                We reserve the right to suspend or terminate your access to the Platform at our sole discretion, without notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties.
              </p>
            </Section>

            <Section id="t13" title="13. Governing Law">
              <p>
                These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the courts located in India.
              </p>
            </Section>

            <Section id="t14" title="14. Changes to These Terms">
              <p>
                We reserve the right to modify these Terms at any time. Changes will be posted on this page with an updated date. Your continued use of the Platform after changes are posted constitutes your agreement to the revised Terms.
              </p>
            </Section>

            <Section id="t15" title="15. Contact Us">
              <p>
                If you have questions or concerns about these Terms, please contact us:
              </p>
              
              <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '8px', padding: '20px', marginTop: '16px' }}>
                <div style={{ fontWeight: 800, color: "var(--ink)", fontSize: "15px", marginBottom: "12px" }}>
                  Exam Suchana
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px", fontSize: '13.5px' }}>
                  <Mail size={16} color="var(--accent)" />
                  <a href="mailto:help@examsuchana.in" style={{ fontWeight: 700, color: "var(--accent)", textDecoration: "none" }}>
                    help@examsuchana.in
                  </a>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: '13.5px' }}>
                  <Globe size={16} color="var(--accent)" />
                  <span style={{ color: "var(--text-muted)" }}>
                    examsuchana.in
                  </span>
                </div>
              </div>
            </Section>

          </div>

        </div>

        {/* RIGHT COLUMN: SIDEBAR */}
        <div className="sidebar-col">
          
          {/* QUICK TOC WIDGET */}
          <div className="sw" style={{ marginTop: 0 }}>
            <div className="sw-head flex items-center gap-1.5">
              <Scale size={16} className="text-amber-500" /> Contents
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
                    <Info size={14} />
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

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <div
      id={id}
      style={{
        scrollMarginTop: "100px",
        paddingBottom: "32px",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <h2
        style={{
          fontFamily: "var(--hd)",
          fontSize: "20px",
          fontWeight: 800,
          color: "var(--ink)",
          marginBottom: "16px",
        }}
      >
        {title}
      </h2>
      <div
        style={{
          color: "var(--text-muted)",
          fontSize: "14.5px",
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
