import type { Metadata } from "next";
import SiteNav from "../components/SiteNav";
import SiteFooter from "../components/SiteFooter";

export const metadata: Metadata = {
  title: "Privacy Policy — Exam Suchana",
  description:
    "Read Exam Suchana's Privacy Policy. Learn how we collect, use, and protect your personal data.",
};

const LAST_UPDATED = "24 March 2026";

export default function PrivacyPage() {
  const sections = [
    { id: "intro", label: "1. Introduction" },
    { id: "info", label: "2. Information We Collect" },
    { id: "usage", label: "3. How We Use Information" },
    { id: "disclaimer", label: "4. Government Data Disclaimer" },
    { id: "sharing", label: "5. Data Sharing" },
    { id: "thirdparty", label: "6. Third-Party Services" },
    { id: "security", label: "7. Data Security" },
    { id: "rights", label: "8. User Rights" },
    { id: "children", label: "9. Children's Privacy" },
    { id: "external", label: "10. External Links" },
    { id: "changes", label: "11. Changes to Policy" },
    { id: "contact", label: "12. Contact Information" },
    { id: "transparency", label: "13. Source Transparency" },
  ];

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
                "radial-gradient(ellipse 60% 50% at 50% -10%, rgba(59,130,246,0.12) 0%, transparent 70%)",
            }}
          />
          <div className="container" style={{ position: "relative", zIndex: 1 }}>
            <div className="section-label">Legal</div>
            <h1 className="section-title">Privacy Policy</h1>
            <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
              Last updated: {LAST_UPDATED}
            </p>
          </div>
        </section>

        {/* Body */}
        <section style={{ padding: "0 0 100px" }}>
          <div
            className="container"
            style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 48, alignItems: "start" }}
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
              {sections.map(({ id, label }) => (
                <a
                  key={id}
                  href={`#${id}`}
                  style={{
                    display: "block",
                    fontSize: 13,
                    color: "var(--text-secondary)",
                    textDecoration: "none",
                    padding: "8px 0",
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
              <Section id="intro" title="1. Introduction">
                <p>
                  <strong>Exam Suchana</strong> is a private platform that aggregates publicly available government job information. Our mission is to provide candidates with a structured, actionable timeline of government exam lifecycles.
                </p>
                <p>
                  Please note that Exam Suchana is an <strong>independent platform</strong> and is not associated with any government entity.
                </p>
              </Section>

              <Section id="info" title="2. Information We Collect">
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginTop: 8 }}>A. Personal Information</h3>
                <p>We collect personally identifiable information only when you voluntarily provide it. This may include:</p>
                <ul>
                  <li>Name</li>
                  <li>Email address</li>
                  <li>Phone number (for account creation or notifications)</li>
                </ul>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginTop: 12 }}>B. Non-Personal Information</h3>
                <p>To improve your experience, we may collect:</p>
                <ul>
                  <li>Device type and model</li>
                  <li>Operating system version</li>
                  <li>App usage data and feature interactions</li>
                  <li>IP address</li>
                </ul>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginTop: 12 }}>C. Automatically Collected Data</h3>
                <p>Our systems automatically log certain data, including:</p>
                <ul>
                  <li>Log records and access times</li>
                  <li>Crash reports for stability monitoring</li>
                  <li>Analytics data (via Google Firebase and other providers)</li>
                </ul>
              </Section>

              <Section id="usage" title="3. How We Use Information">
                <p>We use the collected information for the following purposes:</p>
                <ul>
                  <li>To improve app performance and stability</li>
                  <li>To personalize your user experience and exam preferences</li>
                  <li>To analyze usage trends and optimize our content delivery</li>
                  <li>To send push notifications for exam updates (if enabled)</li>
                </ul>
                <p style={{ fontStyle: "italic", color: "var(--text-muted)" }}>
                  Important: Exam Suchana provides informational tracking only. We do not manage official job applications, guarantee results, or provide "official processing."
                </p>
              </Section>

              <Section id="disclaimer" title="4. Government Data Disclaimer (CRITICAL)">
                <div style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 12, padding: 20 }}>
                  <p style={{ fontWeight: 700, color: "#ef4444", marginBottom: 12 }}>Mandatory Transparency Disclosure:</p>
                  <ul style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                    <li style={{ marginBottom: 8 }}>Exam Suchana is <strong>not affiliated</strong> with any government organization.</li>
                    <li style={{ marginBottom: 8 }}>The app only provides information aggregated from <strong>publicly available official government websites</strong> such as SSC, UPSC, Railway, IBPS, and others.</li>
                    <li style={{ marginBottom: 8 }}>We do <strong>not represent</strong> any government entity and do not provide any government services or official forms.</li>
                    <li style={{ marginBottom: 0 }}>Users are strongly advised to <strong>verify all information directly from official sources</strong> before taking any action.</li>
                  </ul>
                </div>
              </Section>

              <Section id="sharing" title="5. Data Sharing & Third Parties">
                <p>
                  <strong>We do NOT sell user data.</strong> We value your privacy and only share data in these cases:
                </p>
                <ul>
                  <li><strong>Analytics Providers:</strong> We use Google Firebase and other tools to understand app performance.</li>
                  <li><strong>Ad Networks:</strong> If ads are displayed, we may share anonymized IDs with ad partners.</li>
                  <li><strong>Legal Compliance:</strong> If required by law or a valid government request.</li>
                </ul>
              </Section>

              <Section id="thirdparty" title="6. Third-Party Services">
                <p>We utilize the following third-party services to power our platform:</p>
                <ul>
                  <li>Google Analytics / Firebase (for app performance and usage tracking)</li>
                  <li>AdMob (if advertisements are enabled)</li>
                </ul>
                <p>
                  These third-party services may collect information as per their own privacy policies. We encourage you to review their policies respectively.
                </p>
              </Section>

              <Section id="security" title="7. Data Security">
                <p>
                  We implement robust security measures to protect your information, including industry-standard encryption for data in transit and secure server architectures. While we strive to use commercially acceptable means to protect your data, no method of transmission over the internet is 100% secure.
                </p>
              </Section>

              <Section id="rights" title="8. User Rights">
                <p>As a user, you have the right to:</p>
                <ul>
                  <li>Request a copy of the data we have collected about you</li>
                  <li>Request the <strong>deletion of your data</strong> from our systems</li>
                  <li>Opt-out of non-essential data collection</li>
                  <li>Contact us for any privacy-related queries</li>
                </ul>
              </Section>

              <Section id="children" title="9. Children’s Privacy">
                <p>
                  This app is not intended for children under 13 years of age. We do not knowingly collect or solicit personal data from children. If we discover that we have collected data from a child under 13, we will delete it immediately.
                </p>
              </Section>

              <Section id="external" title="10. External Links Disclaimer">
                <p>
                  Our app contains many links to external websites (official government portals). Exam Suchana is <strong>not responsible</strong> for the content, accuracy, or privacy practices of these external websites. We encourage users to read the privacy policies of any site they visit.
                </p>
              </Section>

              <Section id="changes" title="11. Changes to Privacy Policy">
                <p>
                  We may update our Privacy Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. Significant changes will be announced within the app or via email.
                </p>
                <p><strong>Current Version Last Updated:</strong> {LAST_UPDATED}</p>
              </Section>

              <Section id="contact" title="12. Contact Information">
                <p>If you have any questions, concerns, or requests regarding this policy, please reach out to us:</p>
                <ContactBlock />
              </Section>

              <Section id="transparency" title="13. Source Transparency Statement">
                <p>
                  We are committed to accuracy and transparency. All job notifications, results, and exam updates provided in this app include references or direct links to <strong>official government sources</strong> wherever applicable, ensuring users can verify the information at the source.
                </p>
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

function ContactBlock() {
  return (
    <div
      style={{
        background: "var(--bg-card)",
        border: "1px solid rgba(124,58,237,0.2)",
        borderRadius: 16,
        padding: 20,
        marginTop: 8,
      }}
    >
      <div style={{ fontWeight: 700, color: "var(--text-primary)", marginBottom: 8, fontSize: 16 }}>
        Exam Suchana
      </div>
      <div style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 6 }}>
        📩{" "}
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
  );
}
