"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Bell,
  BellRing,
  Calendar,
  FileText,
  Globe,
  Clock,
  MapPin,
  CheckCircle2,
  RefreshCw,
  ChevronLeft,
  Share2,
  BookmarkPlus,
  BookmarkCheck,
  ArrowRight,
  Info,
  Smartphone,
  ClipboardList,
  BookOpen,
  Key,
  Award,
  FolderCheck,
  PartyPopper,
  XCircle,
  AlertCircle,
  Pin,
  UserSquare2,
  Layers,
  Star,
} from "lucide-react";
import MarkdownRenderer from "@/app/components/MarkdownRenderer";
import {
  Exam,
  LifecycleEvent,
  STATUS_LABELS,
  cleanLabel,
  formatDate,
  enumToSlug,
  CATEGORIES,
  getCategoryInfo,
  slugify,
  stripMarkdown
} from "@/app/lib/types";
import { fetchSavedExams, toggleSavedExam, fetchSeoPages } from "@/app/lib/api";
import { LeaderboardAd, SidebarAd, InFeedAd } from "@/app/components/AdUnits";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";


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

function getEventStatus(
  event: LifecycleEvent,
  now: number,
  nextEventStartsAt?: string | null,
): { label: string; color: string; isCompleted?: boolean } | null {
  if (now === 0) return null;
  if (event.isTBD || !event.startsAt) return { label: "TBD", color: "#9CA3AF" };

  const start = new Date(event.startsAt).getTime();
  const end: number | null = event.endsAt
    ? new Date(event.endsAt).getTime()
    : nextEventStartsAt
      ? new Date(nextEventStartsAt).getTime()
      : null;

  if (end !== null && now > end) return { label: "Completed", color: "#10B981", isCompleted: true };

  if (now >= start && (end === null || now <= end)) return { label: "Active", color: "#6366f1" };

  return { label: "Upcoming", color: "#FBBF24" };
}

function TimelineItem({
  event,
  isLast,
  now,
  nextEventStartsAt,
  examSlug,
}: {
  event: LifecycleEvent;
  isLast: boolean;
  now: number;
  nextEventStartsAt?: string | null;
  examSlug: string;
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
            <h3 className="tl-event-title">
              <Link href={`/exam/${examSlug}/${enumToSlug(event.stage)}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                {title}
              </Link>
            </h3>
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
                {stripMarkdown(event.description).substring(0, 100)}
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
            ) : status?.isCompleted ? (
              <div className="tl-action-btn disabled" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>Closed / Result Out</div>
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
    <div className="notify-widget" style={{ marginBottom: 24, border: '1px solid var(--accent-light)', background: 'rgba(124, 58, 237, 0.02)' }}>
      <div className="notify-widget-header">
        <div className="notify-widget-icon" style={{ background: 'var(--accent-light)' }}><Bell size={18} color="white" strokeWidth={2.5} /></div>
        <div>
          <div className="notify-widget-title" style={{ fontWeight: 800 }}>Get Live Alerts</div>
          <div className="notify-widget-sub" style={{ fontSize: '11px', fontWeight: 600 }}>Never miss an update for {examName}</div>
        </div>
      </div>
      {state === "done" ? (
        <div className="notify-widget-success" style={{ padding: '12px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px' }}>
          <CheckCircle2 size={20} color="var(--green)" />
          <div style={{ fontWeight: 700, color: 'var(--green)' }}>You're all set! ✅</div>
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
            style={{ borderRadius: '10px', fontSize: '13px' }}
          />
          <button type="submit" className="btn btn-primary" style={{ width: '100%', borderRadius: '10px', padding: '12px', fontSize: '13px', justifyContent: 'center' }} disabled={state === "loading"}>
            {state === "loading" ? <RefreshCw size={14} className="spin-icon" /> : <BellRing size={14} />}
            {state === "loading" ? "Activating..." : "Subscribe for Alerts"}
          </button>
        </form>
      )}
    </div>
  );
}

export default function ExamDetailClient({ exam, relatedExams }: { exam: Exam; relatedExams?: Exam[] }) {
  const [now, setNow] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isDescExpanded, setIsDescExpanded] = useState(false);

  const queryClient = useQueryClient();
  const userId = typeof window !== "undefined" ? localStorage.getItem("@suchana_userId") : null;

  const { data: savedExams = [] } = useQuery({
    queryKey: ["savedExams", userId],
    queryFn: () => (userId ? fetchSavedExams(userId) : Promise.resolve([])),
    enabled: !!userId,
  });
  const isSaved = savedExams.some((e: any) => e.id === exam.id);

  const toggleMutation = useMutation({
    mutationFn: () => (userId ? toggleSavedExam(userId, exam.id) : Promise.resolve()),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["savedExams", userId] });
      const previous = queryClient.getQueryData(["savedExams", userId]);

      queryClient.setQueryData(["savedExams", userId], (old: any[] = []) => {
        if (old.some(e => e.id === exam.id)) {
          return old.filter(e => e.id !== exam.id);
        }
        return [...old, exam];
      });

      return { previous };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(["savedExams", userId], context?.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["savedExams", userId] });
    },
  });

  const { data: latestArticles = [] } = useQuery({
    queryKey: ["latestSeoPages"],
    queryFn: async () => {
      const { pages } = await fetchSeoPages(1, 5);
      return pages;
    }
  });

  useEffect(() => {
    setNow(Date.now());
    setMounted(true);
    const interval = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(interval);
  }, []);

  const handleWhatsAppShare = () => {
    const text = `Check out ${exam.title} updates on Exam Suchana: ${window.location.href}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };


  const handleSaveToggle = () => {
    if (!userId) {
      alert("Please set up your profile on the app to save exams.");
      return;
    }
    toggleMutation.mutate();
  };

  const sorted = (exam.lifecycleEvents ?? []).sort((a, b) => (a.stageOrder ?? 0) - (b.stageOrder ?? 0));
  const statusLabel = STATUS_LABELS[exam.status] ?? cleanLabel(exam.status);

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: document.title, url: window.location.href });
    } else {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: cleanLabel(exam.category), href: `/c/${getCategoryInfo(exam.category).slug}` },
    { label: exam.shortTitle ?? exam.title, href: "" },
  ];

  return (
    <main className="min-h-screen">
      {/* Top leaderboard ad */}
      <div className="leaderboard-wrap" style={{ paddingTop: 80 }}>
        <LeaderboardAd id="exam-top-leaderboard" />
      </div>

      <div className="app-shell">
        <aside className="sidebar-left">
          <SidebarAd id="detail-left-ad-1" tall />
          <SidebarAd id="detail-left-ad-2" />
        </aside>
        <section className="feed-main" id="exam-detail" itemScope itemType="https://schema.org/Article">
          <div className="exam-detail-header-wrap">
            <nav className="breadcrumb" aria-label="Breadcrumb">
              <ol className="breadcrumb-list">
                {breadcrumbs.map((crumb, i) => (
                  <li key={i} className="breadcrumb-item">
                    {i < breadcrumbs.length - 1 ? (
                      <>
                        <Link href={crumb.href} className="breadcrumb-link">{crumb.label}</Link>
                        <span className="breadcrumb-sep">/</span>
                      </>
                    ) : (
                      <span className="breadcrumb-current" aria-current="page">{crumb.label}</span>
                    )}
                  </li>
                ))}
              </ol>
            </nav>

            <div className="exam-detail-header">
              <div className="exam-detail-tags">
                <span className={`exam-tag level-${(exam.examLevel ?? "national").toLowerCase()}`}>
                  {cleanLabel(exam.examLevel)}
                </span>
                <Link
                  href={`/c/${enumToSlug(exam.category)}`}
                  className={`exam-tag cat-${(exam.category ?? "").toLowerCase()}`}
                  style={{ textDecoration: "none" }}
                >
                  {CATEGORIES.find(c => c.value === exam.category)?.label || cleanLabel(exam.category)}
                </Link>
                {exam.state && (
                  <Link href={`/state/${slugify(exam.state)}`} className="exam-tag">
                    <MapPin size={10} style={{ display: "inline", marginRight: 2 }} />{exam.state}
                  </Link>
                )}
              </div>
              <h1 className="exam-detail-title" itemProp="name">{exam.title}</h1>
              <Link
                href={`/conduct/${(exam.conductingBody || "ALL").toLowerCase().replace(/ /g, "-")}`}
                className="exam-detail-org"
                itemProp="author"
              >
                {exam.conductingBody}
              </Link>

              <div className="exam-detail-status-row">
                <Link
                  href={`/s/${enumToSlug(exam.status)}`}
                  className={`status-badge status-${exam.status}`}
                >
                  <div className="status-dot" />
                  {statusLabel}
                </Link>

                <div className="exam-share-actions">
                  <a
                    href="https://www.google.com/preferences/source?q=examsuchana.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="detail-action-btn"
                    title="Add as a preferred source on Google News"
                  >
                    <Star size={14} fill="currentColor" /> Follow on Google
                  </a>
                  <button className="detail-action-btn" onClick={handleShare} id="share-btn">
                    <Share2 size={14} /> {copied ? "Copied!" : "Share"}
                  </button>
                  <button className="detail-action-btn whatsapp-btn" onClick={handleWhatsAppShare} title="Share on WhatsApp">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" /></svg>
                  </button>
                  <button
                    className={`detail-action-btn ${isSaved ? "detail-action-btn-saved" : ""}`}
                    onClick={handleSaveToggle}
                    id="save-btn"
                    disabled={toggleMutation.isPending}
                  >
                    {isSaved ? <BookmarkCheck size={14} /> : <BookmarkPlus size={14} />}
                  </button>
                </div>
              </div>
            </div>
          </div>

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
                    examSlug={exam.slug}
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

          <section className="exam-detail-section" aria-labelledby="vac-heading">
            <h2 id="vac-heading" className="exam-detail-section-title">Vacancies</h2>
            <div className="fact-content"><MarkdownRenderer content={exam.totalVacancies ?? "TBA"} variant="fact" /></div>
          </section>

          {exam.salary && (
            <section className="exam-detail-section" aria-labelledby="salary-heading">
              <h2 id="salary-heading" className="exam-detail-section-title">Salary</h2>
              <div className="fact-content"><MarkdownRenderer content={exam.salary} variant="fact" /></div>
            </section>
          )}

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

          <section className="exam-detail-section" aria-labelledby="fee-heading">
            <h2 id="fee-heading" className="exam-detail-section-title">
              <Calendar size={18} style={{ display: "inline", marginRight: 8, verticalAlign: "middle" }} />
              Application Fee
            </h2>
            <div className="fact-content"><MarkdownRenderer content={exam.applicationFee ?? "N/A"} variant="fact" /></div>
          </section>

          {exam.additionalDetails && (
            <section className="exam-detail-section" aria-labelledby="add-heading">
              <h2 id="add-heading" className="exam-detail-section-title">Additional Details</h2>
              <div className="fact-content"><MarkdownRenderer content={exam.additionalDetails} variant="fact" /></div>
            </section>
          )}

          {exam.description && (
            <section className="exam-detail-section" aria-labelledby="desc-heading">
              <h2 id="desc-heading" className="exam-detail-section-title">About this Exam</h2>
              <div className="exam-detail-desc" itemProp="description">
                {isDescExpanded ? (
                  <MarkdownRenderer content={exam.description} />
                ) : (
                  <div className="description-preview">
                    {stripMarkdown(exam.description).substring(0, 300)}
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
            </div>
          </section>

          <div style={{ marginBottom: 24 }}><InFeedAd id="detail-inline-ad-3" index={2} /></div>

          <div style={{ marginTop: 64, marginBottom: 8 }}>
            <Link href="/" className="btn btn-ghost" style={{ padding: '12px 20px', borderRadius: '12px' }}>
              <ChevronLeft size={16} /> Back to All Careers
            </Link>
          </div>

          {latestArticles.length > 0 && (
            <section className="exam-detail-section" aria-labelledby="latest-articles-heading" style={{ marginTop: 64 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h2 id="latest-articles-heading" className="exam-detail-section-title" style={{ marginBottom: 0, fontSize: '18px' }}>
                  Latest Articles
                </h2>
                <Link href="/articles" className="btn btn-ghost" style={{ fontSize: '13px', fontWeight: 700 }}>
                  View All  <ArrowRight size={14} style={{ marginLeft: 6 }} />
                </Link>
              </div>
              <div className="latest-articles-list">
                {latestArticles.map(article => (
                  <Link key={article.id} href={`/${article.slug}`} className="article-list-item">
                    <div className="article-list-content">
                      <h4 className="article-list-title">{article.title}</h4>
                      <div className="article-list-meta">
                        <span className="article-list-tag">{cleanLabel(article.category || "") || "Guide"}</span>
                        <span className="article-list-date">{new Date(article.updatedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
                      </div>
                    </div>
                    <ArrowRight size={16} className="article-list-arrow" />
                  </Link>
                ))}
              </div>
            </section>
          )}

        </section>

        <aside className="sidebar-right">
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
          {exam.seoPages && exam.seoPages.length > 0 && (
            <div className="sidebar-widget" style={{ padding: '32px 0 16px' }}>
              <div className="sidebar-widget-title" style={{ padding: '0 24px 16px' }}>
                <BookOpen size={14} /> Related Guides
              </div>
              <div className="sidebar-links">
                {exam.seoPages.map((p: any) => (
                  <Link key={p.slug} href={`/${p.slug}`} className="article-link">
                    <FileText size={14} style={{ marginTop: 2, flexShrink: 0, opacity: 0.7 }} />
                    <span>{p.title}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}



          <SidebarAd id="detail-right-ad-1" />
          <SidebarAd id="detail-right-ad-2" />

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

      {relatedExams && relatedExams.length > 0 && (
        <section className="related-bottom-wrap" aria-labelledby="related-heading">
          <div className="container">
            <h2 id="related-heading" className="section-title" style={{ fontSize: '22px', marginBottom: '20px' }}>
              <Layers size={24} style={{ display: "inline", marginRight: 12, verticalAlign: "middle" }} />
              Recommended Careers
            </h2>
            <div className="related-exams-grid">
              {relatedExams.map(re => (
                <Link key={re.id} href={`/exam/${re.slug}`} className="simple-related-card">
                  <div className="simple-card-top">
                    <div className={`simple-status-dot dot-${re.status.toLowerCase()}`} title={STATUS_LABELS[re.status]} />
                    <span className="simple-card-cat">{CATEGORIES.find(c => c.value === re.category)?.label || "Other"}</span>
                  </div>
                  <h3 className="simple-card-title">{re.shortTitle || re.title}</h3>
                  <div className="simple-card-org">{re.conductingBody}</div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="leaderboard-wrap">
        <LeaderboardAd id="exam-bottom-leaderboard" />
      </div>
    </main>
  );
}
