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
  Calculator,
  MessageCircle
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
import { fetchSavedExams, toggleSavedExam, fetchSeoPages, fetchExamBySlug, fetchExamsFromAPI } from "@/app/lib/api";
import { LeaderboardAd, SidebarAd, InFeedAd } from "@/app/components/AdUnits";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { trackFunnelStep, trackConversion } from "@/app/lib/telemetry";
import { useScrollTracking } from "@/app/hooks/useScrollTracking";
import FAQSection from "@/app/components/FAQSection";


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
  position
}: {
  event: LifecycleEvent;
  isLast: boolean;
  now: number;
  nextEventStartsAt?: string | null;
  examSlug: string;
  position?: number;
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
      <div style={{ display: "contents" }}>
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
            <div className="tl-description-container">
              <div
                style={{
                  display: "-webkit-box",
                  WebkitLineClamp: isExpanded ? "unset" : 3,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden"
                }}
              >
                <MarkdownRenderer content={event.description} className="tl-markdown" variant="fact" />
              </div>
            </div>
          )}

          {event.actionUrl && (
            <div className="tl-footer">
              {now === 0 ? (
                <div className="tl-action-btn disabled">Checking...</div>
              ) : status?.isCompleted ? (
                <div className="tl-action-btn disabled" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>Closed</div>
              ) : (
                <a
                  href={event.actionUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="tl-action-btn active"
                  onClick={() => trackFunnelStep('timeline_action_click', {
                    exam_slug: examSlug,
                    stage: event.stage,
                    url: event.actionUrl
                  })}
                >
                  {event.actionLabel || "Open Links"} <ArrowRight size={14} />
                </a>
              )}
            </div>
          )}
        </div>
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

export default function ExamDetailClient({ slug, category }: { slug: string; category: string }) {
  const { data: exam } = useQuery({
    queryKey: ["exam", slug],
    queryFn: () => fetchExamBySlug(slug),
  });

  useScrollTracking(`exam_detail:${slug}`);

  const { data: relatedExams = [] } = useQuery({
    queryKey: ["relatedExams", category],
    queryFn: () => fetchExamsFromAPI(1, 4, category).then(r => r.exams.filter(e => e.id !== (exam && !('error' in exam) ? exam.id : null)).slice(0, 4)),
  });

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

  if (!exam || ('error' in exam)) return null;

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
    trackFunnelStep('share_whatsapp', { exam_slug: exam.slug });
    const text = `Check out ${exam.title} updates on Exam Suchana: ${window.location.href}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };


  const handleSaveToggle = () => {
    if (!userId) {
      alert("Please set up your profile on the app to save exams.");
      return;
    }
    trackFunnelStep(isSaved ? 'unsave_exam' : 'save_exam', { exam_slug: exam.slug });
    toggleMutation.mutate();
  };

  const sorted = (exam.lifecycleEvents ?? [])
    .filter(e => e.startsAt || e.endsAt || e.actionUrl || e.description || e.isTBD)
    .sort((a, b) => (a.stageOrder ?? 0) - (b.stageOrder ?? 0));
  const statusLabel = STATUS_LABELS[exam.status] ?? cleanLabel(exam.status);

  const handleShare = async () => {
    trackFunnelStep('share_native', { exam_slug: exam.slug });
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
      <div className="breadcrumb-bar">
        <div className="breadcrumb">
          {breadcrumbs.map((crumb, i) => (
            <React.Fragment key={i}>
              {i > 0 && <span className="sep">›</span>}
              {i < breadcrumbs.length - 1 ? (
                <Link href={crumb.href}>{crumb.label}</Link>
              ) : (
                <span className="current">{crumb.label}</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="wrap">
        <div className="ad-leader" style={{ margin: '16px 0 24px' }}>
          <div className="ad-label">Advertisement</div>
          <div className="ad-inner">
            <b>728 × 90 — Leaderboard</b>
            <span style={{ fontSize: 11 }}>Place AdSense responsive leaderboard unit here</span>
          </div>
        </div>

        <div className="article-grid">
          <div className="fade-up">
            <div className="art-hero">
              <div className="art-hero-top">
                <div className="art-hero-pattern"></div>
                <div className="art-hero-emoji">🏛️</div>
                <div className="art-hero-overlay"></div>
                <div className="art-hero-bottom">
                  <div className="art-hero-cat">
                    <span className="tag-pill">{cleanLabel(exam.examLevel ?? "national")}</span>
                    {CATEGORIES.find(c => c.value === exam.category)?.label || cleanLabel(exam.category)}
                  </div>
                  <div className="art-hero-h1">{exam.title}</div>
                </div>
              </div>
              <div className="art-hero-meta-bar">
                <div className="art-meta-left">
                  <div className="art-meta-item">🏛️ <strong>{exam.conductingBody}</strong></div>
                  {exam.state && <div className="art-meta-item">📍 <strong>{exam.state}</strong></div>}
                </div>
                <div className="art-meta-right" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    className="share-btn"
                    onClick={handleWhatsAppShare}
                    title="Share on WhatsApp"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '32px',
                      height: '32px',
                      padding: 0,
                      borderRadius: '50%',
                      border: '1px solid var(--border)',
                      background: '#fff',
                      flex: 'none'
                    }}
                  >
                    <MessageCircle size={15} className="text-emerald-500 fill-emerald-500/10" />
                  </button>
                  <button
                    className="share-btn"
                    onClick={handleShare}
                    title="Copy Link"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '32px',
                      height: '32px',
                      padding: 0,
                      borderRadius: '50%',
                      border: copied ? '1px solid #10b981' : '1px solid var(--border)',
                      background: copied ? 'rgba(16, 185, 129, 0.1)' : '#fff',
                      color: copied ? '#10b981' : 'inherit',
                      flex: 'none'
                    }}
                  >
                    <Share2 size={15} />
                  </button>
                  <button
                    className="share-btn"
                    onClick={handleSaveToggle}
                    disabled={toggleMutation.isPending}
                    title={isSaved ? "Saved" : "Save Exam"}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '32px',
                      height: '32px',
                      padding: 0,
                      borderRadius: '50%',
                      border: isSaved ? '1px solid var(--gold)' : '1px solid var(--border)',
                      background: isSaved ? 'rgba(245, 158, 11, 0.1)' : '#fff',
                      color: isSaved ? 'var(--gold)' : 'inherit',
                      flex: 'none'
                    }}
                  >
                    {isSaved ? <BookmarkCheck size={15} /> : <BookmarkPlus size={15} />}
                  </button>
                </div>
              </div>
            </div>



            {sorted.length > 0 && (
              <div className="art-body-wrap">
                <h2 id="timeline-heading">Complete Exam Timeline</h2>
                <div className="tl-container">
                  {sorted.map((event, i) => {
                    const nextEventWithDate = sorted.slice(i + 1).find(e => e.startsAt);
                    return (
                      <TimelineItem
                        key={event.id}
                        event={event}
                        position={i + 1}
                        isLast={i === sorted.length - 1}
                        now={mounted ? now : 0}
                        examSlug={exam.slug}
                        nextEventStartsAt={!event.endsAt ? (nextEventWithDate?.startsAt ?? null) : null}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {(exam.salary || exam.age || exam.qualificationCriteria || exam.applicationFee) && (
              <div className="art-body-wrap">
                {exam.salary && (
                  <>
                    <h2 id="salary-heading">Salary Details</h2>
                    <MarkdownRenderer content={exam.salary} />
                  </>
                )}

                {exam.age && (
                  <>
                    <h2 id="elig-heading">Age Limit</h2>
                    <MarkdownRenderer content={exam.age} />
                  </>
                )}

                {exam.qualificationCriteria && (
                  <>
                    <h2>Qualification Criteria</h2>
                    <MarkdownRenderer content={exam.qualificationCriteria || "Please refer to the official notification."} />
                  </>
                )}

                {exam.applicationFee && (
                  <>
                    <h2 id="fee-heading">Application Fee</h2>
                    <MarkdownRenderer content={exam.applicationFee} />
                  </>
                )}
              </div>
            )}

            {exam.additionalDetails && (
              <div className="art-body-wrap">
                <h2 id="add-heading">Additional Details</h2>
                <MarkdownRenderer content={exam.additionalDetails} />
              </div>
            )}

            {exam.description && (
              <div className="art-body-wrap">
                <h2 id="desc-heading">About this Exam</h2>
                <div
                  style={{
                    display: "-webkit-box",
                    WebkitLineClamp: isDescExpanded ? "unset" : 8,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden"
                  }}
                >
                  <MarkdownRenderer content={exam.description} />
                </div>
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
            )}

            {exam.faqs && exam.faqs.length > 0 && (

              <FAQSection faqs={exam.faqs} />
            )}

            <div style={{ marginBottom: 24 }}><InFeedAd id="detail-inline-ad-3" index={2} /></div>
          </div>

          {/* SIDEBAR */}
          <div className="sidebar-col">
            <div className="sw">
              <div className="sw-head">🔗 Official Links</div>
              <div className="sw-body">
                <div className="doc-list">
                  {exam.officialWebsite && (
                    <a
                      href={exam.officialWebsite}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="doc-item"
                      onClick={() => trackConversion('official_website_click', { exam_slug: exam.slug })}
                    >
                      <span className="doc-icon">🌐</span>
                      <span className="doc-name">Official Website</span>
                      <span className="doc-badge" style={{ background: '#dbeafe', color: '#1e40af' }}>LINK</span>
                    </a>
                  )}
                  {exam.notificationUrl && (
                    <a
                      href={exam.notificationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="doc-item"
                      onClick={() => trackConversion('official_notification_click', { exam_slug: exam.slug })}
                    >
                      <span className="doc-icon">📄</span>
                      <span className="doc-name">Official Notification</span>
                      <span className="doc-badge" style={{ background: 'var(--ink)', color: 'var(--gold-lt)' }}>PDF</span>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {exam.seoPages && exam.seoPages.length > 0 && (
              <div className="sw">
                <div className="sw-head">📚 Related Guides</div>
                <div className="sw-body">
                  <div className="doc-list">
                    {exam.seoPages.map((p: any) => (
                      <Link key={p.slug} href={`/${p.slug}`} className="doc-item">
                        <span className="doc-icon">📖</span>
                        <span className="doc-name">{p.title}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="sw">
              <div className="sw-head">🧮 Useful Tools</div>
              <div className="sw-body">
                <div className="doc-list">
                  <Link href="/salary-calculator" className="doc-item">
                    <span className="doc-icon">💰</span>
                    <span className="doc-name">Salary Calculator</span>
                  </Link>
                  <Link href="/age-calculator" className="doc-item">
                    <span className="doc-icon">⏳</span>
                    <span className="doc-name">Age Calculator</span>
                  </Link>
                </div>
              </div>
            </div>

            <div className="ad-sidebar ad-s-250">
              <div className="ad-label">Advertisement</div>
              <div className="ad-inner">
                <b>300 × 250</b>
                <span style={{ fontSize: 11 }}>AdSense rectangle unit</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
