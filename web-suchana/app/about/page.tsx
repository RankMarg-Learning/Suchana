import type { Metadata } from "next";
import SiteNav from "../components/SiteNav";
import SiteFooter from "../components/SiteFooter";

export const metadata: Metadata = {
  title: "About Us — Exam Suchana",
  description:
    "Learn about Exam Suchana — India's most structured government exam lifecycle tracker. Our mission is to help every aspirant stay informed and never miss a deadline.",
};

export default function AboutPage() {
  return (
    <>
      <SiteNav />

      <main style={{ paddingTop: 80 }}>
        {/* ─── Hero ─── */}
        <section
          style={{
            padding: "80px 0 64px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(ellipse 70% 60% at 50% -10%, rgba(124,58,237,0.18) 0%, transparent 70%)",
            }}
          />
          <div className="container" style={{ position: "relative", zIndex: 1 }}>
            <div className="section-label">Who We Are</div>
            <h1 className="section-title" style={{ maxWidth: 700 }}>
              Built for India&apos;s
              <br />
              <span
                style={{
                  background: "linear-gradient(135deg, #9b5cf6, #3b82f6)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                35 million aspirants
              </span>
            </h1>
            <p className="section-desc">
              Exam Suchana was born out of a simple frustration — government
              exam information is fragmented, inconsistent, and hard to act on.
              We built the platform we wished existed.
            </p>
          </div>
        </section>

        {/* ─── Mission ─── */}
        <section style={{ padding: "64px 0", background: "var(--bg-secondary)" }}>
          <div className="container">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 60,
                alignItems: "center",
              }}
            >
              <div>
                <div className="section-label">Our Mission</div>
                <h2
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: 36,
                    fontWeight: 700,
                    letterSpacing: -1,
                    marginBottom: 20,
                    color: "var(--text-primary)",
                  }}
                >
                  Zero missed deadlines for every aspirant
                </h2>
                <p
                  style={{
                    color: "var(--text-secondary)",
                    fontSize: 16,
                    lineHeight: 1.8,
                    marginBottom: 20,
                  }}
                >
                  Every year, thousands of candidates miss exam registrations
                  not because they&apos;re unprepared — but because they
                  couldn&apos;t track the lifecycle. We&apos;re here to fix
                  that.
                </p>
                <p
                  style={{
                    color: "var(--text-secondary)",
                    fontSize: 16,
                    lineHeight: 1.8,
                  }}
                >
                  Exam Suchana provides a centralized, real-time, and
                  structured view of every major government exam in India —
                  from registration to final result — with personal
                  notifications so no opportunity is ever missed.
                </p>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 16,
                }}
              >
                {[
                  { value: "1000+", label: "Exams Tracked", icon: "🏛️" },
                  { value: "50K+", label: "Active Users", icon: "👩‍💻" },
                  { value: "28", label: "States Covered", icon: "🗺️" },
                  { value: "0", label: "Missed Deadlines", icon: "⏱️" },
                ].map(({ value, label, icon }) => (
                  <div
                    key={label}
                    style={{
                      background: "var(--bg-card)",
                      border: "1px solid var(--border)",
                      borderRadius: 20,
                      padding: "24px 20px",
                      textAlign: "center",
                    }}
                  >
                    <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
                    <div
                      style={{
                        fontFamily: "'Space Grotesk', sans-serif",
                        fontSize: 32,
                        fontWeight: 800,
                        color: "var(--accent-light)",
                        marginBottom: 4,
                      }}
                    >
                      {value}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: "var(--text-muted)",
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                      }}
                    >
                      {label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ─── Story ─── */}
        <section style={{ padding: "80px 0" }}>
          <div className="container">
            <div className="section-label">Our Story</div>
            <h2
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 36,
                fontWeight: 700,
                letterSpacing: -1,
                marginBottom: 32,
                color: "var(--text-primary)",
                maxWidth: 600,
              }}
            >
              From chaos to clarity
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 20,
              }}
            >
              {[
                {
                  year: "2023",
                  title: "The Problem",
                  desc: "Our founders — government exam aspirants themselves — spent hours across 10+ websites tracking exam dates, often missing windows due to scattered information.",
                  color: "rgba(239,68,68,0.12)",
                  accent: "#f87171",
                },
                {
                  year: "2024",
                  title: "The Build",
                  desc: "We built the first version of Exam Suchana — a structured lifecycle tracker with push notifications. The response from aspirants was overwhelming.",
                  color: "rgba(245,158,11,0.12)",
                  accent: "#fbbf24",
                },
                {
                  year: "2025",
                  title: "Today",
                  desc: "Exam Suchana now tracks 1000+ exams across all major boards — UPSC, SSC, Railway, Banking, and State PSCs — serving 50,000+ aspirants daily.",
                  color: "rgba(16,185,129,0.12)",
                  accent: "#10b981",
                },
              ].map(({ year, title, desc, color, accent }) => (
                <div
                  key={year}
                  style={{
                    background: "var(--bg-card)",
                    border: "1px solid var(--border)",
                    borderTop: `3px solid ${accent}`,
                    borderRadius: 20,
                    padding: 28,
                  }}
                >
                  <div
                    style={{
                      display: "inline-block",
                      padding: "4px 12px",
                      borderRadius: 8,
                      background: color,
                      color: accent,
                      fontSize: 12,
                      fontWeight: 800,
                      marginBottom: 16,
                    }}
                  >
                    {year}
                  </div>
                  <div
                    style={{
                      fontSize: 18,
                      fontWeight: 700,
                      color: "var(--text-primary)",
                      marginBottom: 12,
                    }}
                  >
                    {title}
                  </div>
                  <div
                    style={{
                      fontSize: 14,
                      color: "var(--text-secondary)",
                      lineHeight: 1.7,
                    }}
                  >
                    {desc}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Values ─── */}
        <section style={{ padding: "64px 0 80px", background: "var(--bg-secondary)" }}>
          <div className="container">
            <div className="section-label">Our Values</div>
            <h2
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 36,
                fontWeight: 700,
                letterSpacing: -1,
                marginBottom: 40,
                color: "var(--text-primary)",
              }}
            >
              What drives us
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 16,
              }}
            >
              {[
                { icon: "🎯", title: "Clarity First", desc: "We present exam data in the clearest, most structured way possible." },
                { icon: "⚡", title: "Real-Time", desc: "Every lifecycle update is reflected instantly — no stale data." },
                { icon: "🔐", title: "Privacy", desc: "We never sell or share your personal data. Ever." },
                { icon: "🇮🇳", title: "Made for India", desc: "Built specifically for the Indian government exam ecosystem." },
              ].map(({ icon, title, desc }) => (
                <div
                  key={title}
                  style={{
                    background: "var(--bg-card)",
                    border: "1px solid var(--border)",
                    borderRadius: 16,
                    padding: 24,
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontSize: 32, marginBottom: 12 }}>{icon}</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>{title}</div>
                  <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>{desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── CTA ─── */}
        <section style={{ padding: "80px 0" }}>
          <div className="container" style={{ textAlign: "center" }}>
            <h2
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 36,
                fontWeight: 700,
                letterSpacing: -1,
                marginBottom: 16,
                color: "var(--text-primary)",
              }}
            >
              Have questions?
            </h2>
            <p style={{ color: "var(--text-secondary)", marginBottom: 28, fontSize: 16 }}>
              We&apos;d love to hear from you. Our team responds within 24 hours.
            </p>
            <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
              <a href="/contact" className="btn btn-primary btn-lg">
                Contact Us
              </a>
              <a href="mailto:help@examsuchana.in" className="btn btn-ghost btn-lg">
                ✉️ help@examsuchana.in
              </a>
            </div>
          </div>
        </section>
      </main>

      <div className="divider" />
      <SiteFooter />
    </>
  );
}
