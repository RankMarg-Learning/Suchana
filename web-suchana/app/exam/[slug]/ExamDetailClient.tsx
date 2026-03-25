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
  ClipboardList,
  Contact,
  BookOpen,
  Key,
  Award,
  FolderCheck,
  PartyPopper,
  XCircle,
  AlertCircle,
  Pin,
  UserSquare2,
} from "lucide-react";
import MarkdownRenderer from "@/app/components/MarkdownRenderer";
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

// ─── Timeline Utilities ───────────────────────────────────────────────────────────
const STAGE_ICONS: Record<string, any> = {
  NOTIFICATION: Bell,
  REGISTRATION: ClipboardList,
  ADMIT_CARD: UserSquare2,
  EXAM: BookOpen,
  ANSWER_KEY: Key,
  RESULT: Award,
  DOCUMENT_VERIFICATION: FolderCheck,
  JOINING: PartyPopper,
};

const EVENT_ICONS: Record<string, any> = {
  RELEASE: FileText,
  START: Clock,
  END: XCircle,
  CORRECTION: AlertCircle,
  RESCHEDULED: RefreshCw,
  CANCELLED: XCircle,
  OTHER: Pin,
};

function getEventStatus(
  event: LifecycleEvent,
  now: number,
  nextEventStartsAt?: string | null,
): { label: string; color: string } | null {
  if (now === 0) return null;
  if (event.isTBD || !event.startsAt) return { label: "TBD", color: "#9CA3AF" };

  const start = new Date(event.startsAt).getTime();
  const end: number | null = event.endsAt
    ? new Date(event.endsAt).getTime()
    : nextEventStartsAt
      ? new Date(nextEventStartsAt).getTime()
      : null;

  if (end !== null && now > end) return null; // Completed

  if (now >= start && (end === null || now <= end)) return { label: "Active", color: "#10B981" };

  return { label: "Upcoming", color: "#FBBF24" };
}

function TimelineItem({
  event,
  isLast,
  now,
  nextEventStartsAt,
}: {
  event: LifecycleEvent;
  isLast: boolean;
  now: number;
  nextEventStartsAt?: string | null;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const status = getEventStatus(event, now, nextEventStartsAt);
  const dotColor = status?.color ?? "#6B7280";

  const IconComponent =
    STAGE_ICONS[event.stage] ||
    Pin;

  const title = event.title || event.label || cleanLabel(event.stage);

  return (
    <div className="tl-item">
      <div className="tl-connector">
        <div className="tl-dot-wrap" style={{ borderColor: dotColor }}>
          <IconComponent size={18} color={dotColor} strokeWidth={2.5} />
        </div>
        {!isLast && <div className="tl-line" />}
      </div>

      <div className="tl-content">
        <div className="tl-header">
          <div className="tl-title-group">
            <h3 className="tl-event-title">{title}</h3>
            {event.stage && <div className="tl-stage-label" style={{ color: dotColor }}>{cleanLabel(event.stage)}</div>}
          </div>
          {status && (
            <div className="tl-status-badge" style={{ borderColor: status.color, color: status.color }}>
              {status.label}
            </div>
          )}
          {!status && now === 0 && (
            <div className="tl-status-badge skeleton-badge" style={{ opacity: 0.5 }}>---</div>
          )}
        </div>

        <div className="tl-dates-row">
          <Calendar size={13} />
          {formatDate(event.startsAt)}
          {event.endsAt ? ` – ${formatDate(event.endsAt)}` : ''}
          {event.isTBD && " (TBA)"}
        </div>

        {event.description && (
          <div className="">
            {isExpanded ? (
              <MarkdownRenderer content={event.description} className="tl-markdown" variant="fact" />
            ) : (
              <div className="tl-notes-preview">
                {event.description.replace(/[#*`\n]/g, ' ').substring(0, 100)}
                {event.description.length > 100 && "..."}
              </div>
            )}
            {event.description.length > 100 && (
              <button onClick={() => setIsExpanded(!isExpanded)} className="tl-more-btn">
                {isExpanded ? "Show less" : "Read more"}
              </button>
            )}
          </div>
        )}

        {event.actionUrl && (
          <div className="tl-footer">
            {now === 0 ? (
              <div className="tl-action-btn disabled">Checking...</div>
            ) : status === null ? (
              <div className="tl-action-btn disabled">Closed</div>
            ) : (
              <a
                href={event.actionUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="tl-action-btn active"
              >
                {event.actionLabel || "Open Links"} <ArrowRight size={14} />
              </a>
            )}
          </div>
        )}
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

export default function ExamDetailClient({ exam, relatedExams }: { exam: Exam; relatedExams?: Exam[] }) {
  const [now, setNow] = useState(0);
// ... existing state ...

  const handleWhatsAppShare = () => {
    const text = `Check out ${exam.title} updates on Exam Suchana: ${window.location.href}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleTelegramShare = () => {
    const text = `Check out ${exam.title} updates on Exam Suchana`;
    window.open(`https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(text)}`, "_blank");
  };

  // ... rest of component ...
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isDescExpanded, setIsDescExpanded] = useState(false);

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
              <button className="detail-action-btn whatsapp-btn" onClick={handleWhatsAppShare} title="Share on WhatsApp">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
                WhatsApp
              </button>
              <button className="detail-action-btn telegram-btn" onClick={handleTelegramShare} title="Share on Telegram">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 1 0 24 12 12 12 0 0 0 11.944 0zM18.007 8.01l-2.277 10.74c-.171.77-.627.96-1.268.598l-3.472-2.557-1.675 1.613a.868.868 0 0 1-.702.345l.25-3.535 6.434-5.811c.28-.25-.06-.388-.435-.138l-7.95 5.003-3.426-1.07c-.744-.233-.76-.743.155-1.1l13.4-5.166c.62-.233 1.16.14 1.01.898z"/></svg>
                Telegram
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
                    nextEventStartsAt={
                      !event.endsAt && i < sorted.length - 1
                        ? sorted[i + 1].startsAt
                        : null
                    }
                  />
                ))}
              </div>
            </section>
          )}

          {/* Vacancies Section */}
          <section className="exam-detail-section" aria-labelledby="vac-heading">
            <h2 id="vac-heading" className="exam-detail-section-title">Vacancies</h2>
            <div className="fact-content"><MarkdownRenderer content={exam.totalVacancies ?? "TBA"} variant="fact" /></div>
          </section>

          {/* Salary Section */}
          {exam.salary && (
            <section className="exam-detail-section" aria-labelledby="salary-heading">
              <h2 id="salary-heading" className="exam-detail-section-title">Salary</h2>
              <div className="fact-content"><MarkdownRenderer content={exam.salary} variant="fact" /></div>
            </section>
          )}

          {/* Eligibility Section */}
          <section className="exam-detail-section" aria-labelledby="elig-heading">
            <h2 id="elig-heading" className="exam-detail-section-title">Eligibility</h2>
            <div className="eligibility-container">
              {exam.age && (
                <div className="fee-card eligibility-card">
                  <div className="fee-card-title">
                    <Info size={14} className="text-secondary" style={{ marginRight: 8, verticalAlign: 'middle' }} />
                    Age Limit
                  </div>
                  <div className="fact-content">
                    <MarkdownRenderer
                      content={exam.age}
                      variant="fact"
                    />
                  </div>
                </div>
              )}
              <div className="fee-card eligibility-card">
                <div className="fee-card-title">Qualification Criteria</div>
                <div className="fact-content">
                  <MarkdownRenderer
                    content={exam.qualificationCriteria || "Please refer to the official notification for detailed qualification requirements."}
                    variant="fact"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Fee Section */}
          <section className="exam-detail-section" aria-labelledby="fee-heading">
            <h2 id="fee-heading" className="exam-detail-section-title">Application Fee</h2>
            <div className="fact-content"><MarkdownRenderer content={exam.applicationFee ?? "N/A"} variant="fact" /></div>
          </section>

          {/* Additional Details */}
          {exam.additionalDetails && (
            <section className="exam-detail-section" aria-labelledby="add-heading">
              <h2 id="add-heading" className="exam-detail-section-title">Additional Details</h2>
              <div className="fact-content"><MarkdownRenderer content={exam.additionalDetails} variant="fact" /></div>
            </section>
          )}

          {/* Description */}
          {exam.description && (
            <section className="exam-detail-section" aria-labelledby="desc-heading" style={{ marginTop: 40, borderTop: '1px solid var(--border)', paddingTop: 40 }}>
              <h2 id="desc-heading" className="exam-detail-section-title">About this Exam</h2>
              <div className="exam-detail-desc" itemProp="description">
                {isDescExpanded ? (
                  <MarkdownRenderer content={exam.description} />
                ) : (
                  <div className="description-preview">
                    {exam.description.replace(/[#*`\n]/g, ' ').substring(0, 300)}
                    {exam.description.length > 300 && "..."}
                  </div>
                )}

                {exam.description.length > 300 && (
                  <button
                    onClick={() => setIsDescExpanded(!isDescExpanded)}
                    className="tl-more-btn"
                    style={{ marginTop: 12 }}
                  >
                    {isDescExpanded ? "Show less" : "Read more"}
                  </button>
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

          {/* Related Exams Section */}
          {relatedExams && relatedExams.length > 0 && (
            <section className="exam-detail-section" style={{ marginTop: 60, borderTop: '1px solid var(--border)', paddingTop: 40 }}>
              <h2 className="exam-detail-section-title">Related Exams</h2>
              <div className="related-exams-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px', marginTop: '20px' }}>
                {relatedExams.map(re => (
                  <Link key={re.id} href={`/exam/${re.slug}`} className="related-exam-card" style={{ padding: '16px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-secondary)', textDecoration: 'none', transition: 'all 0.2s ease', display: 'block' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--accent-light)', fontWeight: 600, marginBottom: '4px', textTransform: 'uppercase' }}>{cleanLabel(re.category)}</div>
                    <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>{re.shortTitle || re.title}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{re.conductingBody}</div>
                  </Link>
                ))}
              </div>
            </section>
          )}

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

          {/* Telegram Channel CTA */}
          <div className="app-download-widget" style={{ background: 'linear-gradient(135deg, #0088cc 0%, #00aaff 100%)', border: 'none' }}>
            <div className="app-widget-icon" style={{ background: 'rgba(255,255,255,0.2)' }}>
              <Bell size={18} color="white" />
            </div>
            <div className="app-widget-title" style={{ color: 'white' }}>Join Telegram</div>
            <div className="app-widget-sub" style={{ color: 'rgba(255,255,255,0.9)' }}>Get the fastest exam notifications directly on your phone.</div>
            <a href="https://t.me/examsuchana" target="_blank" rel="noopener noreferrer" className="app-widget-btn" style={{ background: 'white', color: '#0088cc' }}>
              <ArrowRight size={14} /> Join Now
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
