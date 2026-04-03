"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ExternalLink, Calendar, Bell, ChevronRight, Share2, MapPin } from "lucide-react";
import { Exam, LifecycleEvent, cleanLabel, formatDate, enumToSlug, getCategoryInfo } from "@/app/lib/types";
import MarkdownRenderer from "@/app/components/MarkdownRenderer";
import { LeaderboardAd, SidebarAd, InFeedAd } from "@/app/components/AdUnits";

// Using getCategoryInfo from types for category mapping

export default function EventDetailClient({ exam, event }: { exam: Exam, event: LifecycleEvent }) {
  const title = event.title || event.actionLabel || cleanLabel(event.stage);

  const sortedEvents = React.useMemo(() => {
    return [...(exam.lifecycleEvents || [])].sort((a, b) => {
      if (a.startsAt && b.startsAt) {
        return new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime();
      }
      if (a.startsAt) return -1;
      if (b.startsAt) return 1;
      return b.stageOrder - a.stageOrder;
    });
  }, [exam.lifecycleEvents]);

  const currentIndex = sortedEvents.findIndex(e => e.id === event.id);
  const nextEvent = currentIndex > 0 ? sortedEvents[currentIndex - 1] : null;
  const prevEvent = currentIndex >= 0 && currentIndex < sortedEvents.length - 1 ? sortedEvents[currentIndex + 1] : null;

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: document.title, url: window.location.href });
    } else {
      await navigator.clipboard.writeText(window.location.href);
      alert("Link copied!");
    }
  };

  const categoryData = getCategoryInfo(exam.category);

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: categoryData.label, href: `/c/${categoryData.slug}` },
    { label: exam.shortTitle || exam.title, href: `/exam/${exam.slug}` },
    { label: title, href: "" },
  ];

  return (
    <main className="min-h-screen">
      <div className="leaderboard-wrap" style={{ paddingTop: 80 }}>
        <LeaderboardAd id="event-top-leaderboard" />
      </div>

      <div className="app-shell">
        <aside className="sidebar-left">
          <Link href={`/exam/${exam.slug}`} className="btn btn-ghost" style={{ marginBottom: 24, fontSize: '0.85rem' }}>
            <ArrowLeft size={16} /> Back to Timeline
          </Link>
          <SidebarAd id="event-left-ad-1" tall />
        </aside>

        <section className="feed-main">
          {/* Breadcrumb matching exact structure updated earlier */}
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <ol className="breadcrumb-list">
              {breadcrumbs.map((crumb, i) => (
                <li key={i} className="breadcrumb-item">
                  {i < breadcrumbs.length - 1 ? (
                    <>
                      <Link href={crumb.href} className="breadcrumb-link">{crumb.label}</Link>
                      <ChevronRight size={12} className="breadcrumb-sep" />
                    </>
                  ) : (
                    <span className="breadcrumb-current" aria-current="page">{crumb.label}</span>
                  )}
                </li>
              ))}
            </ol>
          </nav>

          <div className="event-detail-header" style={{ marginBottom: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <span className="exam-tag" style={{ background: 'var(--accent-glow)', color: 'var(--accent)', fontWeight: 800 }}>
                {cleanLabel(event.stage)}
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <Calendar size={14} style={{ display: 'inline', marginRight: 4, verticalAlign: 'text-bottom' }} />
                Timeline Event
              </span>
            </div>

            <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2, marginBottom: 16 }}>
              {exam.title}: {title}
            </h1>

            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                <MapPin size={16} color="var(--green)" /> {exam.state || 'National'}
              </div>
              <button onClick={handleShare} className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                <Share2 size={14} /> Share
              </button>
            </div>
          </div>

          <article className="seo-content" style={{ marginBottom: 40 }}>
            {/* Event Dates & Action prominent Card */}
            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 16, padding: 24, marginBottom: 32 }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Bell size={18} color="var(--accent)" /> Event Details
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
                {event.startsAt && (
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Date</div>
                    <div style={{ fontWeight: 600, fontSize: '1.05rem' }}>{formatDate(event.startsAt)} {event.isTBD && "(TBA)"}</div>
                  </div>
                )}
                {event.endsAt && (
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Ends On</div>
                    <div style={{ fontWeight: 600, fontSize: '1.05rem' }}>{formatDate(event.endsAt)}</div>
                  </div>
                )}
              </div>

              {event.actionUrl && (
                <div style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid var(--border)' }}>
                  <a href={event.actionUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px 20px', fontSize: '1rem' }}>
                    {event.actionLabel || `Access ${cleanLabel(event.stage)} Portal`} <ExternalLink size={18} />
                  </a>
                </div>
              )}
            </div>

            {event.description && (
              <div className="event-description">
                <MarkdownRenderer content={event.description} />
              </div>
            )}

            <div style={{ display: 'flex', gap: 16, justifyContent: 'space-between', flexWrap: 'wrap', marginBottom: 40, borderTop: '1px solid var(--border)', paddingTop: 24, marginTop: 40 }}>
              {prevEvent ? (
                <Link href={`/exam/${exam.slug}/${enumToSlug(prevEvent.stage)}`} className="btn btn-ghost" style={{ flex: 1, textAlign: 'left', border: '1px solid var(--border)', padding: 16, borderRadius: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}><ArrowLeft size={14} style={{ display: 'inline', marginRight: 4, verticalAlign: 'text-bottom' }} /> Previous Event</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{prevEvent.title || cleanLabel(prevEvent.stage)}</span>
                </Link>
              ) : <div style={{ flex: 1 }} />}

              {nextEvent ? (
                <Link href={`/exam/${exam.slug}/${enumToSlug(nextEvent.stage)}`} className="btn btn-ghost" style={{ flex: 1, textAlign: 'right', border: '1px solid var(--border)', padding: 16, borderRadius: 12, display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Next Event <ArrowRight size={14} style={{ display: 'inline', marginLeft: 4, verticalAlign: 'text-bottom' }} /></span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{nextEvent.title || cleanLabel(nextEvent.stage)}</span>
                </Link>
              ) : <div style={{ flex: 1 }} />}
            </div>

            <InFeedAd id="event-infeed-ad" index={1} />
          </article>
        </section>

        <aside className="sidebar-right">
          <SidebarAd id="event-right-ad-1" tall />
          <SidebarAd id="event-right-ad-2" />
        </aside>
      </div>
    </main>
  );
}
