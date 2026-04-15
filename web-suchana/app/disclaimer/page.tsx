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
} from "lucide-react";

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
    <main className="min-h-screen">
      {/* ─── Hero ─── */}
      <section
        className="section"
        style={{ paddingTop: "100px", paddingBottom: "60px", position: "relative" }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 70% 60% at 50% -10%, rgba(245,158,11,0.10) 0%, transparent 70%)",
            zIndex: 0,
          }}
        />
        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <div className="hero-badge">
            <span className="hero-badge-dot" />
            Legal &amp; Compliance
          </div>
          <h1 className="section-title">
            Platform <span className="text-accent">Disclaimer</span>
          </h1>
          <p className="section-desc">
            Last updated: <strong>{LAST_UPDATED}</strong>. Please read this disclaimer carefully
            before relying on any information provided by Exam Suchana.
          </p>
        </div>
      </section>

      {/* ─── Warning Banner ─── */}
      <section className="section" style={{ paddingTop: 0, paddingBottom: "12px" }}>
        <div className="container">
          <div
            style={{
              display: "flex",
              gap: "14px",
              alignItems: "flex-start",
              background: "rgba(245,158,11,0.07)",
              border: "1px solid rgba(245,158,11,0.25)",
              borderRadius: "14px",
              padding: "18px 22px",
            }}
          >
            <AlertTriangle
              size={20}
              color="#f59e0b"
              style={{ flexShrink: 0, marginTop: "2px" }}
            />
            <p
              style={{
                fontSize: "14px",
                color: "var(--text-secondary)",
                lineHeight: 1.7,
                margin: 0,
              }}
            >
              <strong style={{ color: "var(--text-primary)" }}>Important:</strong> Exam Suchana is
              an independent information aggregator. We are{" "}
              <strong style={{ color: "var(--text-primary)" }}>not affiliated</strong> with UPSC,
              SSC, IBPS, Railways, or any State PSC. Always verify critical dates and links on
              official government portals before taking any action.
            </p>
          </div>
        </div>
      </section>

      {/* ─── Legal Content ─── */}
      <section className="section" style={{ paddingTop: "20px", paddingBottom: "100px" }}>
        <div
          className="container mobile-stack"
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 260px) 1fr",
            gap: "60px",
            alignItems: "start",
          }}
        >
          {/* Sticky Sidebar Navigation */}
          <aside style={{ position: "sticky", top: "100px", zIndex: 10 }}>
            <div
              className="feature-card"
              style={{ padding: "24px", background: "var(--bg-secondary)", border: "none" }}
            >
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 800,
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  marginBottom: "16px",
                }}
              >
                Quick Navigation
              </div>
              <nav style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {SECTIONS.map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      fontSize: "13px",
                      color: "var(--text-secondary)",
                      textDecoration: "none",
                      padding: "8px 12px",
                      borderRadius: "8px",
                      transition: "all 0.2s",
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

          {/* Legal Sections */}
          <div style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
            <LegalSection id="d1" title="1. General Disclaimer">
              <p>
                The information published on <strong>Exam Suchana</strong> (accessible at{" "}
                <em>examsuchana.in</em>) is intended solely for general informational and
                educational purposes. It is aggregated from publicly available government
                notifications, official press releases, and authenticated online portals.
              </p>
              <p>
                While we make every effort to keep information accurate and current, we make{" "}
                <strong>no representations or warranties</strong> of any kind — express or implied
                — about the completeness, accuracy, reliability, suitability, or availability of
                any information on this platform.
              </p>
            </LegalSection>

            <LegalSection id="d2" title="2. Not a Government Entity">
              <div
                className="feature-card"
                style={{
                  borderColor: "rgba(239,68,68,0.2)",
                  background: "rgba(239,68,68,0.03)",
                  padding: "24px",
                }}
              >
                <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                  <ShieldAlert color="#ef4444" size={20} style={{ flexShrink: 0 }} />
                  <div>
                    <h4
                      style={{
                        fontWeight: 800,
                        color: "#ef4444",
                        fontSize: "13px",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        marginBottom: "8px",
                      }}
                    >
                      Critical Disclosure
                    </h4>
                    <p
                      style={{
                        fontSize: "14px",
                        color: "var(--text-primary)",
                        lineHeight: 1.7,
                        fontWeight: 500,
                      }}
                    >
                      Exam Suchana is a private, independent platform. We are{" "}
                      <strong>not affiliated with, endorsed by, or representing</strong> any
                      government body, including but not limited to: UPSC, SSC, IBPS, RRB/RRC,
                      SBI, RBI, NTA, DSSSB, BPSC, MPPSC, UPPSC, or any other State or Central
                      Public Service Commission.
                    </p>
                  </div>
                </div>
              </div>
              <p>
                Our platform serves as a lifecycle-tracking tool. We do not conduct exams, issue
                admit cards, declare results, or accept applications on behalf of any government
                authority.
              </p>
            </LegalSection>

            <LegalSection id="d3" title="3. Accuracy of Data">
              <p>
                Government exam schedules, registration dates, syllabus details, and result timelines
                are subject to change without notice by the respective conducting bodies. Exam Suchana
                strives to reflect these updates promptly but{" "}
                <strong>cannot guarantee real-time accuracy</strong> at all times.
              </p>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                  marginTop: "16px",
                }}
                className="mobile-stack"
              >
                {[
                  {
                    label: "Registration Dates",
                    note: "May shift due to official amendments",
                  },
                  {
                    label: "Admit Card Links",
                    note: "Valid only when officially released",
                  },
                  {
                    label: "Exam Dates",
                    note: "Subject to postponement by authorities",
                  },
                  {
                    label: "Result Declarations",
                    note: "Timelines not guaranteed by us",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="feature-card"
                    style={{ padding: "16px", fontSize: "13px" }}
                  >
                    <strong style={{ color: "var(--text-primary)" }}>{item.label}:</strong>{" "}
                    <span style={{ color: "var(--text-muted)" }}>{item.note}</span>
                  </div>
                ))}
              </div>
            </LegalSection>

            <LegalSection id="d4" title="4. Always Verify Officially">
              <p>
                Users are <strong>strongly and legally advised</strong> to verify all examination
                data — including application deadlines, exam schedules, eligibility criteria, fee
                structures, and result dates — directly from the respective official government
                portals before taking any action.
              </p>
              <p>
                Relying solely on information from Exam Suchana without cross-checking official
                sources may lead to adverse consequences for which Exam Suchana bears no
                responsibility whatsoever.
              </p>
            </LegalSection>

            <LegalSection id="d5" title="5. Third-Party Links">
              <p>
                Exam Suchana may contain links to external websites, including official government
                portals, exam authority websites, and notification PDFs. These external links are
                provided for user convenience only.
              </p>
              <p>
                We have <strong>no control over the content, availability, or accuracy</strong> of
                third-party websites. Inclusion of any link does not imply endorsement,
                recommendation, or approval by Exam Suchana. We are not responsible for any harm
                or damage incurred from accessing third-party sites.
              </p>
            </LegalSection>

            <LegalSection id="d6" title="6. Limitation of Liability">
              <p>
                To the maximum extent permitted by applicable law, Exam Suchana, its founders,
                officers, employees, and agents shall not be liable for:
              </p>
              <ul style={{ paddingLeft: "20px", listStyleType: "disc" }}>
                <li>Missed deadlines resulting from inaccurate or outdated information</li>
                <li>
                  Financial losses, including application fees paid based on incorrect data displayed
                </li>
                <li>Decisions made based on information available on this platform</li>
                <li>Temporary or permanent unavailability of the platform</li>
                <li>Loss of data, notification failures, or delivery delays</li>
                <li>Any indirect, incidental, consequential, or punitive damages</li>
              </ul>
            </LegalSection>

            <LegalSection id="d7" title="7. No Professional or Legal Advice">
              <p>
                Nothing on Exam Suchana constitutes legal, financial, career, or professional
                advice. Content published here is for informational purposes only and should not be
                treated as a substitute for professional guidance appropriate to your specific
                situation.
              </p>
              <p>
                For eligibility-related queries, form-filling guidance, or legal concerns related
                to a particular examination, please consult the respective conducting body directly
                or seek qualified professional advice.
              </p>
            </LegalSection>

            <LegalSection id="d8" title="8. Data Changes &amp; Platform Updates">
              <p>
                We reserve the right to modify, update, or remove any information on this platform
                at any time without prior notice. Exam data, timelines, and notification content
                may be updated based on official announcements.
              </p>
              <p>
                This Disclaimer itself may be revised periodically. Continued use of Exam Suchana
                after any changes constitutes acceptance of the updated Disclaimer. The{" "}
                <strong>"Last Updated"</strong> date at the top of this page reflects the most
                recent revision.
              </p>
            </LegalSection>

            <LegalSection id="d9" title="9. Governing Law">
              <p>
                This Disclaimer and any disputes arising from the use of Exam Suchana shall be
                governed by and construed in accordance with the laws of the{" "}
                <strong>Republic of India</strong>. Any legal proceedings shall be subject to the
                exclusive jurisdiction of the competent courts in India.
              </p>
            </LegalSection>

            <LegalSection id="d10" title="10. Contact Us">
              <p>
                If you have concerns about the accuracy of information on our platform or wish to
                report an error, please reach out to us:
              </p>
              <div
                className="feature-card"
                style={{
                  padding: "24px",
                  background: "var(--bg-secondary)",
                  marginTop: "16px",
                  border: "1px solid rgba(var(--accent-rgb), 0.15)",
                }}
              >
                <div
                  style={{
                    fontWeight: 700,
                    color: "var(--text-primary)",
                    fontSize: "16px",
                    marginBottom: "12px",
                  }}
                >
                  Exam Suchana — Compliance &amp; Support
                </div>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "10px" }}
                >
                  <Mail size={18} color="var(--accent)" />
                  <a
                    href="mailto:help@examsuchana.in"
                    style={{ fontWeight: 600, color: "var(--accent)", textDecoration: "none" }}
                  >
                    help@examsuchana.in
                  </a>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <Globe size={18} color="var(--accent)" />
                  <a
                    href="https://examsuchana.in"
                    style={{
                      fontSize: "14px",
                      color: "var(--text-secondary)",
                      textDecoration: "none",
                    }}
                  >
                    examsuchana.in/disclaimer
                  </a>
                </div>
              </div>
            </LegalSection>
          </div>
        </div>
      </section>

      <style
        dangerouslySetInnerHTML={{
          __html: `
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
          `,
        }}
      />
    </main>
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
        paddingBottom: "40px",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <h2
        style={{
          fontSize: "22px",
          fontWeight: 800,
          color: "var(--text-primary)",
          marginBottom: "20px",
          fontFamily: "Space Grotesk",
        }}
      >
        {title}
      </h2>
      <div
        style={{
          fontSize: "15px",
          color: "var(--text-secondary)",
          lineHeight: 1.8,
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
