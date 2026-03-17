import type { Metadata } from "next";
import SiteNav from "../components/SiteNav";
import SiteFooter from "../components/SiteFooter";

export const metadata: Metadata = {
  title: "Privacy Policy — Exam Suchana",
  description:
    "Read Exam Suchana's Privacy Policy. Learn how we collect, use, and protect your personal data.",
};

const LAST_UPDATED = "17 March 2026";

export default function PrivacyPage() {
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
                { id: "p1", label: "Information We Collect" },
                { id: "p2", label: "How We Use It" },
                { id: "p3", label: "Data Sharing" },
                { id: "p4", label: "Cookies" },
                { id: "p5", label: "Push Notifications" },
                { id: "p6", label: "Data Retention" },
                { id: "p7", label: "Your Rights" },
                { id: "p8", label: "Security" },
                { id: "p9", label: "Children's Privacy" },
                { id: "p10", label: "Changes" },
                { id: "p11", label: "Contact" },
              ].map(({ id, label }) => (
                <a
                  key={id}
                  href={`#${id}`}
                  style={{
                    display: "block",
                    fontSize: 13,
                    color: "var(--text-secondary)",
                    textDecoration: "none",
                    padding: "6px 0",
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
              <Section id="p1" title="1. Information We Collect">
                <p>We collect information you provide directly to us, such as when you:</p>
                <ul>
                  <li>Subscribe to notifications by entering your name and email</li>
                  <li>Contact us through the contact form</li>
                  <li>Use our mobile application</li>
                </ul>
                <p>We also automatically collect certain information when you use our services, including:</p>
                <ul>
                  <li>Device information (device type, operating system, browser type)</li>
                  <li>Usage data (pages visited, features used, time spent)</li>
                  <li>IP address and approximate geographic location</li>
                  <li>Push notification tokens (if you enable notifications)</li>
                </ul>
              </Section>

              <Section id="p2" title="2. How We Use Your Information">
                <p>We use the information we collect to:</p>
                <ul>
                  <li>Deliver personalized exam notifications based on your preferences</li>
                  <li>Operate, maintain, and improve our platform</li>
                  <li>Respond to your questions and support requests</li>
                  <li>Send you important service updates and announcements</li>
                  <li>Analyze usage to improve our exam data coverage and UI</li>
                  <li>Detect, prevent, and address technical issues</li>
                </ul>
              </Section>

              <Section id="p3" title="3. Data Sharing and Disclosure">
                <p>
                  <strong>We do not sell, rent, or trade your personal data to third parties.</strong> We may share information only in the following limited circumstances:
                </p>
                <ul>
                  <li><strong>Service Providers:</strong> Vendors who assist us in operating the platform (e.g., cloud hosting, email delivery) under strict confidentiality agreements.</li>
                  <li><strong>Legal Requirements:</strong> If required by law, court order, or governmental authority.</li>
                  <li><strong>Business Transfer:</strong> In connection with a merger or acquisition, with prior notice to users.</li>
                </ul>
              </Section>

              <Section id="p4" title="4. Cookies and Tracking Technologies">
                <p>We use cookies and similar technologies to:</p>
                <ul>
                  <li>Remember your filter preferences and session state</li>
                  <li>Measure traffic and understand user behavior (via anonymized analytics)</li>
                  <li>Improve load times through caching</li>
                </ul>
                <p>You can control cookies through your browser settings. Disabling cookies may affect some features of the platform.</p>
              </Section>

              <Section id="p5" title="5. Push Notifications">
                <p>
                  If you opt in to push notifications, we store your push token to deliver exam alerts. You can revoke push notification permission at any time through your browser or device settings. We will honor this immediately.
                </p>
              </Section>

              <Section id="p6" title="6. Data Retention">
                <p>
                  We retain your information for as long as your account is active or as needed to provide services. If you wish to delete your data, contact us at{" "}
                  <a href="mailto:help@examsuchana.in" style={{ color: "var(--accent-light)" }}>
                    help@examsuchana.in
                  </a>{" "}
                  and we will process your request within 30 days.
                </p>
              </Section>

              <Section id="p7" title="7. Your Rights">
                <p>You have the right to:</p>
                <ul>
                  <li>Access the personal data we hold about you</li>
                  <li>Request correction of inaccurate data</li>
                  <li>Request deletion of your data</li>
                  <li>Withdraw consent for marketing communications at any time</li>
                  <li>Lodge a complaint with a data protection authority</li>
                </ul>
                <p>
                  To exercise any of these rights, email us at{" "}
                  <a href="mailto:help@examsuchana.in" style={{ color: "var(--accent-light)" }}>
                    help@examsuchana.in
                  </a>.
                </p>
              </Section>

              <Section id="p8" title="8. Data Security">
                <p>
                  We implement industry-standard security measures including HTTPS encryption, hashed credential storage, and regular security audits. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
                </p>
              </Section>

              <Section id="p9" title="9. Children's Privacy">
                <p>
                  Exam Suchana is not directed at children under 13. We do not knowingly collect personal information from children under 13. If you believe we have inadvertently collected such information, please contact us immediately.
                </p>
              </Section>

              <Section id="p10" title="10. Changes to This Policy">
                <p>
                  We may update this Privacy Policy from time to time. We will notify you of significant changes by posting a notice on our platform or by sending an email. Your continued use of the service after changes constitutes acceptance.
                </p>
              </Section>

              <Section id="p11" title="11. Contact Us">
                <p>
                  If you have any questions about this Privacy Policy, please contact us:
                </p>
                <ContactBlock />
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
  );
}
