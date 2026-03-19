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
  Smartphone,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
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
      }).catch(() => { });
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


          </header>

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

          {/* Vacancies Section */}
          <section className="exam-detail-section" aria-labelledby="vac-heading">
            <h2 id="vac-heading" className="exam-detail-section-title">Vacancies</h2>
            <div className="fact-content"><ReactMarkdown remarkPlugins={[remarkGfm]}>{exam.totalVacancies || "TBA"}</ReactMarkdown></div>
          </section>

          {/* Salary Section */}
          {exam.salary && (
            <section className="exam-detail-section" aria-labelledby="salary-heading">
              <h2 id="salary-heading" className="exam-detail-section-title">Salary</h2>
              <div className="fact-content"><ReactMarkdown remarkPlugins={[remarkGfm]}>{exam.salary}</ReactMarkdown></div>
            </section>
          )}

          {/* Eligibility Section */}
          <section className="exam-detail-section" aria-labelledby="elig-heading">
            <h2 id="elig-heading" className="exam-detail-section-title">Eligibility</h2>
            <div className="fee-grid">
              <div className="fee-card">
                <div className="fee-card-title">Qualification</div>
                <div className="fact-content"><ReactMarkdown remarkPlugins={[remarkGfm]}>{cleanLabel(exam.qualificationCriteria || "Check notification")}</ReactMarkdown></div>
              </div>
              {(exam.minAge || exam.maxAge) && (
                <div className="fee-card">
                  <div className="fee-card-title">Age Limit</div>
                  <div className="fact-content">{exam.minAge}–{exam.maxAge} years</div>
                </div>
              )}
            </div>
          </section>

          {/* Fee Section */}
          <section className="exam-detail-section" aria-labelledby="fee-heading">
            <h2 id="fee-heading" className="exam-detail-section-title">Application Fee</h2>
            <div className="fact-content"><ReactMarkdown remarkPlugins={[remarkGfm]}>{exam.applicationFee || "N/A"}</ReactMarkdown></div>
          </section>

          {/* Additional Details */}
          {exam.additionalDetails && (
            <section className="exam-detail-section" aria-labelledby="add-heading">
              <h2 id="add-heading" className="exam-detail-section-title">Additional Details</h2>
              <div className="fact-content"><ReactMarkdown remarkPlugins={[remarkGfm]}>{exam.additionalDetails}</ReactMarkdown></div>
            </section>
          )}

          {/* Description */}
          {exam.description && (
            <section className="exam-detail-section" aria-labelledby="desc-heading" style={{ marginTop: 40, borderTop: '1px solid var(--border)', paddingTop: 40 }}>
              <h2 id="desc-heading" className="exam-detail-section-title">About this Exam</h2>
              <div className="exam-detail-desc" itemProp="description">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{exam.description}</ReactMarkdown>
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



          <SidebarAd id="detail-right-ad-2" />

          {/* App Download */}
          <div className="app-download-widget">
            <div className="app-widget-icon">
              <Smartphone size={18} color="var(--accent-light)" />
            </div>
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
