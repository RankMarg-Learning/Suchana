"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import SiteNav from "@/app/components/SiteNav";
import SiteFooter from "@/app/components/SiteFooter";
import {
  Bell,
  BellRing,
  Calendar,
  Briefcase,
  IndianRupee,
  UserCheck,
  ExternalLink,
  FileText,
  Globe,
  Clock,
  Target,
  MapPin,
  CheckCircle2,
  RefreshCw,
  ChevronLeft,
  Share2,
  BookmarkPlus,
  BookmarkCheck,
  ArrowRight,
  Info,
  Zap,
  TrendingUp,
} from "lucide-react";
import {
  Exam,
  LifecycleEvent,
  STATUS_LABELS,
  STAGE_LABELS,
  cleanLabel,
  formatDate,
  getTotalVacancies,
  getStageState,
  countdownStr,
} from "@/app/lib/types";
import { fetchSavedExams, toggleSavedExam } from "@/app/lib/api";
import { LeaderboardAd, SidebarAd, InFeedAd } from "@/app/components/AdUnits";

// ─── Ad Components ────────────────────────────────────────────────────────────

// Ad components imported from AdUnits.tsx
// ─── Timeline Item ────────────────────────────────────────────────────────────

function TimelineItem({ event, isLast, now }: { event: LifecycleEvent; isLast: boolean; now: number }) {
  const state = getStageState(event, now);
  const label = event.label || STAGE_LABELS[event.stage] || cleanLabel(event.stage);

  const dateRange =
    event.startsAt && event.endsAt
      ? `${formatDate(event.startsAt)} → ${formatDate(event.endsAt)}`
      : event.startsAt
        ? formatDate(event.startsAt)
        : event.endsAt
          ? `Until ${formatDate(event.endsAt)}`
          : "Date TBA";

  const isCountdown = state === "active" && event.endsAt && new Date(event.endsAt).getTime() > now;

  return (
    <div className="tl-item">
      <div className="tl-left">
        <div className={`tl-dot ${state}`} />
        {!isLast && <div className={`tl-line ${state}`} />}
      </div>
      <div className="tl-body">
        <div className={`tl-stage ${state}`}>{label}</div>
        <div className={`tl-dates ${state}`}>{dateRange}</div>
        {isCountdown && (
          <div className="tl-countdown">
            <Clock size={11} />
            {countdownStr(event.endsAt!, now)}
          </div>
        )}
        {state === "active" && event.actionUrl && (
          <a href={event.actionUrl} target="_blank" rel="noopener noreferrer" className="tl-action-btn">
            Apply Now <ExternalLink size={12} />
          </a>
        )}
        {event.notes && <div className="tl-notes">{event.notes}</div>}
      </div>
    </div>
  );
}

// ─── Notify Widget ────────────────────────────────────────────────────────────

function NotifyWidget({ examName }: { examName: string }) {
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("loading");
    await new Promise((r) => setTimeout(r, 1200));
    if ("Notification" in window && Notification.permission === "default") {
      await Notification.requestPermission();
    }
    setState("done");
  };

  return (
    <div className="notify-widget">
      <div className="notify-widget-header">
        <div className="notify-widget-icon"><BellRing size={18} color="var(--accent-light)" /></div>
        <div>
          <div className="notify-widget-title">Get Alerts</div>
          <div className="notify-widget-sub">For {examName}</div>
        </div>
      </div>
      {state === "done" ? (
        <div className="notify-widget-success">
          <CheckCircle2 size={20} color="var(--green)" />
          <div>Alerts enabled! 🎉</div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="notify-widget-form">
          <input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="notify-widget-input"
            required
          />
          <button type="submit" className="notify-widget-btn" disabled={state === "loading"}>
            {state === "loading" ? <RefreshCw size={14} className="spin-icon" /> : <Bell size={14} />}
            {state === "loading" ? "Setting up..." : "Enable Alerts"}
          </button>
        </form>
      )}
    </div>
  );
}

// ─── Main Client Component ────────────────────────────────────────────────────

export default function ExamDetailClient({ exam }: { exam: Exam }) {
  const [now, setNow] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setNow(Date.now());
    setMounted(true);
    const interval = setInterval(() => setNow(Date.now()), 60_000);

    const userId = typeof window !== "undefined" ? localStorage.getItem("@suchana_userId") : null;
    if (userId) {
      fetchSavedExams(userId).then(exams => {
        setSaved(exams.some(e => e.id === exam.id));
      }).catch(() => {});
    }

    return () => clearInterval(interval);
  }, [exam.id]);

  const handleSaveToggle = async () => {
    const userId = typeof window !== "undefined" ? localStorage.getItem("@suchana_userId") : null;
    if (!userId) {
      alert("Please set up your profile on the app to save exams.");
      return;
    }
    const prev = saved;
    setSaved(!prev); // optimistic
    try {
      await toggleSavedExam(userId, exam.id);
    } catch {
      setSaved(prev); // revert
    }
  };

  const sorted = (exam.lifecycleEvents ?? []).sort((a, b) => (a.stageOrder ?? 0) - (b.stageOrder ?? 0));
  const statusLabel = STATUS_LABELS[exam.status] ?? cleanLabel(exam.status);
  const regEvent = sorted.find((e) => e.stage === "REGISTRATION");
  const admitEvent = sorted.find((e) => e.stage === "ADMIT_CARD");
  const examEvent = sorted.find((e) => e.stage === "EXAM_DATE" || e.stage === "EXAM");
  const resultEvent = sorted.find((e) => e.stage === "RESULT" || e.stage === "FINAL_RESULT");

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: document.title, url: window.location.href });
    } else {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Breadcrumb navigation
  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: cleanLabel(exam.category), href: `/?category=${exam.category}` },
    { label: exam.shortTitle ?? exam.title, href: "" },
  ];

  return (
    <>
      <SiteNav />

      {/* Top leaderboard ad */}
      <div className="leaderboard-wrap" style={{ paddingTop: 80 }}>
        <LeaderboardAd id="exam-top-leaderboard" />
      </div>

      <div className="app-shell" style={{ paddingTop: 8 }}>
        {/* ─── Left Sidebar (static links) ─── */}
        <aside className="sidebar-left">
          {/* Back to listings */}
          <div className="sidebar-widget">
            <Link href="/" className="back-btn">
              <ChevronLeft size={16} /> All Exams
            </Link>
          </div>



          <SidebarAd id="detail-left-ad-1" />
          <SidebarAd id="detail-left-ad-2" tall />
        </aside>

        {/* ─── Main Content ─── */}
        <main className="feed-main" id="exam-detail" itemScope itemType="https://schema.org/Article">

          {/* Breadcrumb */}
          <nav className="breadcrumb" aria-label="Breadcrumb">
            {breadcrumbs.map((crumb, i) => (
              <span key={i} className="breadcrumb-item">
                {i < breadcrumbs.length - 1 ? (
                  <><Link href={crumb.href} className="breadcrumb-link">{crumb.label}</Link> <span className="breadcrumb-sep">/</span> </>
                ) : (
                  <span className="breadcrumb-current">{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>

          {/* Exam Header */}
          <header className="exam-detail-header">
            <div className="exam-detail-tags">
              <span className={`exam-tag level-${(exam.examLevel ?? "national").toLowerCase()}`}>
                {cleanLabel(exam.examLevel)}
              </span>
              <span className={`exam-tag cat-${(exam.category ?? "").toLowerCase()}`}>
                {cleanLabel(exam.category)}
              </span>
              {exam.state && (
                <span className="exam-tag">
                  <MapPin size={10} style={{ display: "inline", marginRight: 2 }} />{exam.state}
                </span>
              )}
            </div>

            <h1 className="exam-detail-title" itemProp="name">{exam.title}</h1>
            <div className="exam-detail-body" itemProp="author">{exam.conductingBody}</div>

            <div className="exam-detail-actions">
              <div className={`status-badge status-${exam.status}`}>
                <div className="status-dot" />
                {statusLabel}
              </div>
              <button className="detail-action-btn" onClick={handleShare} id="share-btn">
                <Share2 size={14} /> {copied ? "Copied!" : "Share"}
              </button>
              <button
                className={`detail-action-btn ${saved ? "detail-action-btn-saved" : ""}`}
                onClick={handleSaveToggle}
                id="save-btn"
              >
                {saved ? <BookmarkCheck size={14} /> : <BookmarkPlus size={14} />}
                {saved ? "Saved" : "Save"}
              </button>
            </div>

            {/* Quick Stats Horizontal Row */}
            <div className="quick-stats-row" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '24px' }}>
              <div className="stat-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '100px', fontSize: '13px' }}>
                <Briefcase size={14} color="var(--accent-light)" /> <strong style={{color:"var(--text-primary)"}}>{getTotalVacancies(exam.totalVacancies)}</strong> <span style={{color:"var(--text-dim)"}}>Vacancies</span>
              </div>
              {exam.minAge && exam.maxAge && (
                <div className="stat-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '100px', fontSize: '13px' }}>
                  <UserCheck size={14} color="var(--accent-light)" /> <strong style={{color:"var(--text-primary)"}}>{exam.minAge}–{exam.maxAge} yrs</strong> <span style={{color:"var(--text-dim)"}}>Age Limit</span>
                </div>
              )}
              {regEvent?.endsAt && (
                <div className="stat-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '100px', fontSize: '13px' }}>
                  <Calendar size={14} color="var(--accent-light)" /> <strong style={{color:"var(--text-primary)"}}>{formatDate(regEvent.endsAt)}</strong> <span style={{color:"var(--text-dim)"}}>Reg. Deadline</span>
                </div>
              )}
              {examEvent?.startsAt && (
                <div className="stat-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '100px', fontSize: '13px' }}>
                  <Target size={14} color="var(--accent-light)" /> <strong style={{color:"var(--text-primary)"}}>{formatDate(examEvent.startsAt)}</strong> <span style={{color:"var(--text-dim)"}}>Exam Date</span>
                </div>
              )}
              {exam.applicationFee && (
                <div className="stat-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '100px', fontSize: '13px' }}>
                  <IndianRupee size={14} color="var(--accent-light)" /> <strong style={{color:"var(--text-primary)"}}>₹{exam.applicationFee["General"] ?? Object.values(exam.applicationFee)[0]}</strong> <span style={{color:"var(--text-dim)"}}>Fee</span>
                </div>
              )}
            </div>
          </header>

          {/* Description */}
          {exam.description && (
            <section className="exam-detail-section" aria-labelledby="desc-heading">
              <h2 id="desc-heading" className="exam-detail-section-title">About this Exam</h2>
              <p className="exam-detail-desc" itemProp="description">{exam.description}</p>
            </section>
          )}

          {/* Key Dates quick-view */}
          <section className="exam-detail-section" aria-labelledby="dates-heading">
            <h2 id="dates-heading" className="exam-detail-section-title">Key Dates</h2>
            <div className="key-dates-grid">
              {regEvent && (
                <div className="key-date-card">
                  <div className="key-date-icon" style={{ background: "rgba(16,185,129,0.12)", color: "#10b981" }}>
                    <FileText size={18} />
                  </div>
                  <div>
                    <div className="key-date-label">Registration</div>
                    <div className="key-date-value">
                      {regEvent.startsAt && regEvent.endsAt
                        ? `${formatDate(regEvent.startsAt)} — ${formatDate(regEvent.endsAt)}`
                        : regEvent.startsAt
                          ? formatDate(regEvent.startsAt)
                          : "TBA"}
                    </div>
                    {regEvent.actionUrl && (
                      <a href={regEvent.actionUrl} target="_blank" rel="noopener noreferrer" className="key-date-link">
                        Apply Now →
                      </a>
                    )}
                  </div>
                </div>
              )}
              {admitEvent && (
                <div className="key-date-card">
                  <div className="key-date-icon" style={{ background: "rgba(139,92,246,0.12)", color: "#a78bfa" }}>
                    <FileText size={18} />
                  </div>
                  <div>
                    <div className="key-date-label">Admit Card</div>
                    <div className="key-date-value">{admitEvent.startsAt ? formatDate(admitEvent.startsAt) : "TBA"}</div>
                    {admitEvent.actionUrl && (
                      <a href={admitEvent.actionUrl} target="_blank" rel="noopener noreferrer" className="key-date-link">
                        Download →
                      </a>
                    )}
                  </div>
                </div>
              )}
              {examEvent && (
                <div className="key-date-card">
                  <div className="key-date-icon" style={{ background: "rgba(239,68,68,0.12)", color: "#f87171" }}>
                    <Target size={18} />
                  </div>
                  <div>
                    <div className="key-date-label">Exam Date</div>
                    <div className="key-date-value">
                      {examEvent.startsAt && examEvent.endsAt && examEvent.startsAt !== examEvent.endsAt
                        ? `${formatDate(examEvent.startsAt)} — ${formatDate(examEvent.endsAt)}`
                        : examEvent.startsAt
                          ? formatDate(examEvent.startsAt)
                          : "TBA"}
                    </div>
                  </div>
                </div>
              )}
              {resultEvent && (
                <div className="key-date-card">
                  <div className="key-date-icon" style={{ background: "rgba(59,130,246,0.12)", color: "#60a5fa" }}>
                    <CheckCircle2 size={18} />
                  </div>
                  <div>
                    <div className="key-date-label">Result</div>
                    <div className="key-date-value">{resultEvent.startsAt ? formatDate(resultEvent.startsAt) : "TBA"}</div>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* In-content Ad */}
          <div style={{ marginBottom: 24 }}><InFeedAd id="detail-inline-ad-1" index={0} /></div>

          {/* Full Timeline */}
          {sorted.length > 0 && (
            <section className="exam-detail-section" aria-labelledby="timeline-heading">
              <h2 id="timeline-heading" className="exam-detail-section-title">
                <Calendar size={18} style={{ display: "inline", marginRight: 8, verticalAlign: "middle" }} />
                Complete Exam Timeline
              </h2>
              <div className="tl-container">
                {sorted.map((event, i) => (
                  <TimelineItem
                    key={event.id}
                    event={event}
                    isLast={i === sorted.length - 1}
                    now={mounted ? now : 0}
                  />
                ))}
              </div>
            </section>
          )}

          {/* In-content Ad */}
          <div style={{ marginBottom: 24 }}><InFeedAd id="detail-inline-ad-2" index={1} /></div>

          {/* Fee & Eligibility */}
          {(exam.applicationFee || exam.minAge || exam.maxAge) && (
            <section className="exam-detail-section" aria-labelledby="elig-heading">
              <h2 id="elig-heading" className="exam-detail-section-title">Fee & Eligibility</h2>
              <div className="fee-grid">
                {exam.applicationFee && (
                  <div className="fee-card">
                    <div className="fee-card-title">Application Fee</div>
                    {Object.entries(exam.applicationFee).map(([cat, fee]) => (
                      <div key={cat} className="fee-row">
                        <span className="fee-cat">{cat}</span>
                        <span className="fee-val">₹{fee === 0 ? "Exempt" : fee}</span>
                      </div>
                    ))}
                  </div>
                )}
                {(exam.totalVacancies || exam.minAge || exam.maxAge) && (
                  <div className="fee-card">
                    <div className="fee-card-title">Eligibility</div>
                    {exam.minAge && exam.maxAge && (
                      <div className="fee-row">
                        <span className="fee-cat">Age Limit</span>
                        <span className="fee-val">{exam.minAge}–{exam.maxAge} years</span>
                      </div>
                    )}
                    {exam.totalVacancies && (
                      <div className="fee-row">
                        <span className="fee-cat">Total Vacancies</span>
                        <span className="fee-val">{getTotalVacancies(exam.totalVacancies)}</span>
                      </div>
                    )}
                    {typeof exam.totalVacancies === "object" && exam.totalVacancies && (
                      Object.entries(exam.totalVacancies).map(([cat, count]) => (
                        <div key={cat} className="fee-row">
                          <span className="fee-cat">{cat}</span>
                          <span className="fee-val">{Number(count).toLocaleString("en-IN")}</span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Official Links */}
          <section className="exam-detail-section" aria-labelledby="links-heading">
            <h2 id="links-heading" className="exam-detail-section-title">Official Resources</h2>
            <div className="official-links">
              {exam.officialWebsite && (
                <a href={exam.officialWebsite} target="_blank" rel="noopener noreferrer" className="official-link-btn">
                  <Globe size={16} /> Official Website
                </a>
              )}
              {exam.notificationUrl && (
                <a href={exam.notificationUrl} target="_blank" rel="noopener noreferrer" className="official-link-btn primary">
                  <FileText size={16} /> Official Notification
                </a>
              )}
              {regEvent?.actionUrl && (
                <a href={regEvent.actionUrl} target="_blank" rel="noopener noreferrer" className="official-link-btn accent">
                  <ArrowRight size={16} /> Apply Online
                </a>
              )}
            </div>
          </section>

          {/* Bottom Ad */}
          <div style={{ marginBottom: 24 }}><InFeedAd id="detail-inline-ad-3" index={2} /></div>

          {/* Back to listings */}
          <div style={{ marginTop: 32, marginBottom: 8 }}>
            <Link href="/" className="btn btn-ghost">
              <ChevronLeft size={16} /> Back to All Exams
            </Link>
          </div>
        </main>

        {/* ─── Right Sidebar ─── */}
        <aside className="sidebar-right">
          <NotifyWidget examName={exam.shortTitle ?? exam.title} />
          <SidebarAd id="detail-right-ad-1" />

          {/* Vacancies breakdown */}
          {typeof exam.totalVacancies === "object" && exam.totalVacancies && (
            <div className="sidebar-widget">
              <div className="sidebar-widget-title"><Briefcase size={14} /> Vacancy Breakdown</div>
              {Object.entries(exam.totalVacancies).map(([cat, count]) => (
                <div key={cat} className="trending-item">
                  <div className="trending-info">
                    <div className="trending-name">{cat}</div>
                    <div className="trending-tag" style={{ color: "var(--accent-light)" }}>
                      {Number(count).toLocaleString("en-IN")} posts
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <SidebarAd id="detail-right-ad-2" />

          {/* App Download */}
          <div className="app-download-widget">
            <div className="app-widget-icon">📱</div>
            <div className="app-widget-title">Get the App</div>
            <div className="app-widget-sub">Push notifications for every exam update. Never miss a deadline.</div>
            <a href="https://play.google.com/store" target="_blank" rel="noopener noreferrer" className="app-widget-btn" id="detail-app-download">
              <ArrowRight size={14} /> Download Free
            </a>
          </div>

          <SidebarAd id="detail-right-ad-3" tall />
        </aside>
      </div>

      <div className="leaderboard-wrap">
        <LeaderboardAd id="exam-bottom-leaderboard" />
      </div>

      <div className="divider" />
      <SiteFooter />
    </>
  );
}
