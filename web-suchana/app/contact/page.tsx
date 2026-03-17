"use client";

import { useState } from "react";
import { Mail, MapPin, Clock, CheckCircle2, Send, Phone } from "lucide-react";
import SiteNav from "../components/SiteNav";
import SiteFooter from "../components/SiteFooter";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    await new Promise((r) => setTimeout(r, 1500));
    setStatus("success");
  };

  return (
    <>
      <SiteNav />

      <main style={{ paddingTop: 80 }}>
        {/* Hero */}
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
                "radial-gradient(ellipse 70% 60% at 50% -10%, rgba(124,58,237,0.15) 0%, transparent 70%)",
            }}
          />
          <div className="container" style={{ position: "relative", zIndex: 1 }}>
            <div className="section-label">Get in Touch</div>
            <h1 className="section-title">
              We&apos;re here to{" "}
              <span
                style={{
                  background: "linear-gradient(135deg, #9b5cf6, #3b82f6)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                help you
              </span>
            </h1>
            <p className="section-desc">
              Have a question, feedback, or need support? Reach out to our team
              and we&apos;ll get back to you within 24 hours.
            </p>
          </div>
        </section>

        {/* Content */}
        <section style={{ padding: "0 0 100px" }}>
          <div className="container">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1.6fr",
                gap: 48,
                alignItems: "start",
              }}
            >
              {/* Left — Contact info */}
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {/* Email card */}
                <div
                  style={{
                    background: "linear-gradient(135deg, rgba(124,58,237,0.12), rgba(59,130,246,0.06))",
                    border: "1px solid rgba(124,58,237,0.25)",
                    borderRadius: 20,
                    padding: 28,
                  }}
                >
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 14,
                      background: "rgba(124,58,237,0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 16,
                    }}
                  >
                    <Mail size={22} color="#9b5cf6" />
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>
                    Email Support
                  </div>
                  <a
                    href="mailto:help@examsuchana.in"
                    style={{
                      fontSize: 18,
                      fontWeight: 700,
                      color: "var(--accent-light)",
                      textDecoration: "none",
                    }}
                  >
                    help@examsuchana.in
                  </a>
                  <p style={{ marginTop: 8, fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6 }}>
                    For general inquiries, support requests, and feedback.
                  </p>
                </div>

                {[
                  {
                    Icon: Clock,
                    color: "#fbbf24",
                    bg: "rgba(245,158,11,0.12)",
                    label: "Response Time",
                    value: "Within 24 hours",
                    desc: "We respond to all queries on working days.",
                  },
                  {
                    Icon: MapPin,
                    color: "#34d399",
                    bg: "rgba(16,185,129,0.12)",
                    label: "Based In",
                    value: "India 🇮🇳",
                    desc: "Serving aspirants across all 28 states and 8 UTs.",
                  },
                  {
                    Icon: Phone,
                    color: "#60a5fa",
                    bg: "rgba(59,130,246,0.12)",
                    label: "Helpdesk Hours",
                    value: "Mon – Sat, 9 AM – 6 PM",
                    desc: "IST (Indian Standard Time)",
                  },
                ].map(({ Icon, color, bg, label, value, desc }) => (
                  <div
                    key={label}
                    style={{
                      background: "var(--bg-card)",
                      border: "1px solid var(--border)",
                      borderRadius: 16,
                      padding: "20px 24px",
                      display: "flex",
                      gap: 16,
                      alignItems: "flex-start",
                    }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 12,
                        background: bg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={18} color={color} />
                    </div>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2 }}>
                        {label}
                      </div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 2 }}>
                        {value}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{desc}</div>
                    </div>
                  </div>
                ))}

                {/* FAQ hint */}
                <div
                  style={{
                    background: "var(--bg-secondary)",
                    border: "1px solid var(--border)",
                    borderRadius: 16,
                    padding: 20,
                  }}
                >
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 12 }}>
                    Common topics
                  </div>
                  {[
                    "Exam data correction or update",
                    "Notification not received",
                    "App feedback or bug report",
                    "Partnership / collaboration",
                    "Media enquiry",
                  ].map((t) => (
                    <div
                      key={t}
                      style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}
                    >
                      <CheckCircle2 size={13} color="var(--accent-light)" />
                      <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{t}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right — Contact form */}
              <div
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  borderRadius: 24,
                  padding: 40,
                }}
              >
                {status === "success" ? (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "40px 0",
                      animation: "fadeIn 0.4s ease",
                    }}
                  >
                    <div
                      style={{
                        width: 72,
                        height: 72,
                        borderRadius: "50%",
                        background: "rgba(16,185,129,0.12)",
                        border: "2px solid var(--green)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 20px",
                      }}
                    >
                      <CheckCircle2 size={36} color="var(--green)" />
                    </div>
                    <h3
                      style={{
                        fontFamily: "'Space Grotesk', sans-serif",
                        fontSize: 24,
                        fontWeight: 700,
                        color: "var(--text-primary)",
                        marginBottom: 12,
                      }}
                    >
                      Message Sent! 🎉
                    </h3>
                    <p style={{ color: "var(--text-secondary)", fontSize: 15, marginBottom: 24 }}>
                      Thank you for reaching out. We&apos;ll reply to{" "}
                      <strong style={{ color: "var(--accent-light)" }}>
                        {form.email}
                      </strong>{" "}
                      within 24 hours.
                    </p>
                    <button
                      className="btn btn-ghost"
                      onClick={() => { setStatus("idle"); setForm({ name: "", email: "", subject: "", message: "" }); }}
                    >
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <>
                    <h2
                      style={{
                        fontFamily: "'Space Grotesk', sans-serif",
                        fontSize: 24,
                        fontWeight: 700,
                        color: "var(--text-primary)",
                        marginBottom: 8,
                      }}
                    >
                      Send us a message
                    </h2>
                    <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 28 }}>
                      Fill in the form and our team will review your message.
                    </p>

                    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                      <div className="form-grid">
                        <div className="form-group">
                          <label className="form-label" htmlFor="contact-name">Your Name</label>
                          <input
                            id="contact-name"
                            name="name"
                            type="text"
                            className="form-input"
                            placeholder="Rahul Sharma"
                            value={form.name}
                            onChange={handleChange}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label" htmlFor="contact-email">Email Address</label>
                          <input
                            id="contact-email"
                            name="email"
                            type="email"
                            className="form-input"
                            placeholder="rahul@email.com"
                            value={form.email}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label" htmlFor="contact-subject">Subject</label>
                        <select
                          id="contact-subject"
                          name="subject"
                          className="form-select"
                          value={form.subject}
                          onChange={handleChange}
                          required
                        >
                          <option value="">Select a topic</option>
                          <option value="exam_data">Exam Data Correction</option>
                          <option value="notification">Notification Issue</option>
                          <option value="bug">Bug Report</option>
                          <option value="feature">Feature Request</option>
                          <option value="partnership">Partnership / Collaboration</option>
                          <option value="media">Media Enquiry</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label className="form-label" htmlFor="contact-message">Message</label>
                        <textarea
                          id="contact-message"
                          name="message"
                          className="form-input"
                          placeholder="Describe your issue or question in detail..."
                          value={form.message}
                          onChange={handleChange}
                          required
                          rows={6}
                          style={{ resize: "vertical", fontFamily: "inherit" }}
                        />
                      </div>

                      <button
                        type="submit"
                        className="notify-btn"
                        id="contact-submit-btn"
                        disabled={status === "loading"}
                        style={{ marginTop: 0 }}
                      >
                        {status === "loading" ? (
                          <>
                            <span
                              style={{
                                width: 16,
                                height: 16,
                                border: "2px solid rgba(255,255,255,0.3)",
                                borderTopColor: "#fff",
                                borderRadius: "50%",
                                display: "inline-block",
                                animation: "spin 0.8s linear infinite",
                              }}
                            />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send size={16} />
                            Send Message
                          </>
                        )}
                      </button>

                      <p style={{ fontSize: 12, color: "var(--text-muted)", textAlign: "center" }}>
                        Or email us directly at{" "}
                        <a
                          href="mailto:help@examsuchana.in"
                          style={{ color: "var(--accent-light)", textDecoration: "none" }}
                        >
                          help@examsuchana.in
                        </a>
                      </p>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <div className="divider" />
      <SiteFooter />
    </>
  );
}
