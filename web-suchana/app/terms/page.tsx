import type { Metadata } from "next";
import SiteNav from "../components/SiteNav";
import SiteFooter from "../components/SiteFooter";

export const metadata: Metadata = {
  title: "Terms & Conditions — Exam Suchana",
  description:
    "Read Exam Suchana's Terms and Conditions. Understand the rules, limitations, and your rights when using our platform.",
};

const LAST_UPDATED = "17 March 2026";

export default function TermsPage() {
  return (
    <>
      <SiteNav />

      <main style={{ paddingTop: 80 }}>
        {/* Hero */}
        <section
          style={{
            padding: "80px 0 48px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(ellipse 60% 50% at 50% -10%, rgba(245,158,11,0.1) 0%, transparent 70%)",
            }}
          />
          <div className="container" style={{ position: "relative", zIndex: 1 }}>
            <div className="section-label">Legal</div>
            <h1 className="section-title">Terms &amp; Conditions</h1>
            <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
              Last updated: {LAST_UPDATED}
            </p>
          </div>
        </section>

        {/* Body */}
        <section style={{ padding: "0 0 100px" }}>
          <div
            className="container"
            style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 48, alignItems: "start" }}
          >
            {/* Sticky TOC */}
            <aside
              style={{
                position: "sticky",
                top: 96,
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: 16,
                padding: 20,
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 }}>
                Contents
              </div>
              {[
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
              ].map(({ id, label }) => (
                <a
                  key={id}
                  href={`#${id}`}
                  style={{
                    display: "block",
                    fontSize: 13,
                    color: "var(--text-secondary)",
                    textDecoration: "none",
                    padding: "5px 0",
                    borderBottom: "1px solid var(--border)",
                    transition: "color 0.2s",
                  }}
                >
                  {label}
                </a>
              ))}
            </aside>

            {/* Content */}
            <div className="legal-content">
              <div
                style={{
                  background: "rgba(245,158,11,0.08)",
                  border: "1px solid rgba(245,158,11,0.2)",
                  borderRadius: 12,
                  padding: "14px 18px",
                  marginBottom: 32,
                  fontSize: 14,
                  color: "var(--text-secondary)",
                  lineHeight: 1.6,
                }}
              >
                ⚠️ Please read these Terms and Conditions carefully before using Exam Suchana. By accessing or using our platform, you agree to be bound by these terms.
              </div>

              <Section id="t1" title="1. Acceptance of Terms">
                <p>
                  By accessing or using Exam Suchana (&quot;the Platform&quot;), including our website at examsuchana.in and our mobile applications, you agree to comply with and be bound by these Terms and Conditions. If you do not agree, please refrain from using the Platform.
                </p>
              </Section>

              <Section id="t2" title="2. Description of Service">
                <p>
                  Exam Suchana is an information aggregation platform that provides structured lifecycle tracking for government examinations in India. Our services include:
                </p>
                <ul>
                  <li>Display of exam timelines, important dates, and official notifications</li>
                  <li>Personalized push notification services for exam updates</li>
                  <li>Search and filtering of government exam data</li>
                  <li>Mobile application for on-the-go access</li>
                </ul>
              </Section>

              <Section id="t3" title="3. Use of the Platform">
                <p>You agree to use the Platform only for lawful purposes. You must not:</p>
                <ul>
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
                <ul>
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
                <div
                  style={{
                    background: "var(--bg-card)",
                    border: "1px solid rgba(245,158,11,0.2)",
                    borderRadius: 16,
                    padding: 20,
                    marginTop: 8,
                  }}
                >
                  <div style={{ fontWeight: 700, color: "var(--text-primary)", marginBottom: 8, fontSize: 16 }}>
                    Exam Suchana
                  </div>
                  <div style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 6 }}>
                    📧{" "}
                    <a href="mailto:help@examsuchana.in" style={{ color: "var(--accent-light)" }}>
                      help@examsuchana.in
                    </a>
                  </div>
                  <div style={{ fontSize: 14, color: "var(--text-secondary)" }}>
                    🌐{" "}
                    <a href="https://examsuchana.in" style={{ color: "var(--accent-light)" }}>
                      examsuchana.in
                    </a>
                  </div>
                </div>
              </Section>
            </div>
          </div>
        </section>
      </main>

      <div className="divider" />
      <SiteFooter />
    </>
  );
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <div
      id={id}
      style={{
        marginBottom: 40,
        scrollMarginTop: 100,
        paddingBottom: 40,
        borderBottom: "1px solid var(--border)",
      }}
    >
      <h2
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: 22,
          fontWeight: 700,
          color: "var(--text-primary)",
          marginBottom: 16,
        }}
      >
        {title}
      </h2>
      <div
        style={{
          color: "var(--text-secondary)",
          fontSize: 15,
          lineHeight: 1.8,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {children}
      </div>
    </div>
  );
}
