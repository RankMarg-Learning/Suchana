"use client";

import React from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  Globe,
  FileText,
  ArrowRight,
  MapPin,
  Calendar,
  Briefcase,
  Smartphone,
  Bell,
  Info,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import MarkdownRenderer from './MarkdownRenderer';
import { LeaderboardAd, SidebarAd, InFeedAd } from './AdUnits';
import { Exam, SeoPage, cleanLabel, STATUS_LABELS, getCategoryInfo, enumToSlug } from '../lib/types';
import { LifecycleStage } from '../lib/enums';
import LatestArticlesSection from './LatestArticlesSection';

import { useQuery } from '@tanstack/react-query';
import { fetchSeoPages } from '../lib/api';
import { trackFunnelStep, trackConversion } from '../lib/telemetry';
import { useScrollTracking } from '../hooks/useScrollTracking';

interface Props {
  exam: Exam;
  seoPage: SeoPage;
}

export default function SeoExamPageLayout({
  exam,
  seoPage
}: Props) {
  useScrollTracking(`seo_article:${seoPage.slug}`);
  const statusLabel = STATUS_LABELS[exam.status] ?? cleanLabel(exam.status);

  const { data: latestArticles = [] } = useQuery({
    queryKey: ['latest-guides'],
    queryFn: () => fetchSeoPages(1, 5).then(res => res.pages ?? []),
  });


  const getLiveEvent = () => {
    if (!exam.lifecycleEvents) return null;
    const now = Date.now();

    const categoryToStage: Record<string, string> = {
      'ADMIT_CARD': LifecycleStage.ADMIT_CARD,
      'RESULTS': LifecycleStage.RESULT,
      'ANSWER_KEY': LifecycleStage.ANSWER_KEY,
    };

    const targetStage = categoryToStage[seoPage.category || ''];
    if (!targetStage) return null;

    const event = exam.lifecycleEvents.find(e => e.stage === targetStage);
    if (!event || !event.startsAt || !event.actionUrl) return null;

    const start = new Date(event.startsAt).getTime();
    const end = event.endsAt ? new Date(event.endsAt).getTime() : Infinity;

    if (now >= start && now <= end) return event;
    return null;
  };

  const liveEvent = getLiveEvent();

  // Breadcrumbs
  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: getCategoryInfo(exam.category).label, href: `/c/${getCategoryInfo(exam.category).slug}` },
    { label: exam.shortTitle || exam.title, href: `/exam/${exam.slug}` },
    { label: seoPage.title, href: "" },
  ];

  const quickLinks = [
    { label: 'Syllabus & Pattern', category: 'SYLLABUS', slug: `/${exam.slug}-syllabus-exam-pattern` },
    { label: 'Eligibility Details', category: 'ELIGIBILITY', slug: `/${exam.slug}-eligibility-criteria` },
    { label: 'Salary & Job Profile', category: 'SALARY', slug: `/${exam.slug}-salary-job-profile` },
    { label: 'Notification PDF', category: 'NOTIFICATION', slug: `/${exam.slug}-notification-pdf` },
  ];

  const availableLinks = quickLinks.filter(link => {
    const linkSlugNoSlash = link.slug.replace(/^\//, '');
    if (seoPage.slug === linkSlugNoSlash) return false;

    return exam.seoPages?.some(p =>
      p.category === link.category || p.slug === linkSlugNoSlash
    );
  });

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>

      {/* Top Banner Ad */}
      <div className="leaderboard-wrap" style={{ paddingTop: 80 }}>
        <LeaderboardAd id="seo-exam-top-leaderboard" />
      </div>

      <div className="app-shell" style={{ paddingTop: 8 }}>
        {/* ─── Left Sidebar ─── */}
        <aside className="sidebar-left">
          <div className="sidebar-widget">
            <Link 
              href={`/exam/${exam.slug}`} 
              className="back-btn" 
              style={{ fontSize: '0.85rem' }}
              onClick={() => trackFunnelStep('article_to_timeline_click', {
                article_slug: seoPage.slug,
                exam_slug: exam.slug
              })}
            >
              <ChevronLeft size={16} /> Full Timeline
            </Link>
          </div>
          <SidebarAd id="seo-left-ad-1" />
          <SidebarAd id="seo-left-ad-2" tall />
        </aside>

        {/* ─── Main Content ─── */}
        <main className="feed-main">
          {/* Breadcrumb */}
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

          <article className="seo-article-v2" itemScope itemType="https://schema.org/Article">
            <header className="article-header" style={{ marginBottom: 'clamp(24px, 5vh, 40px)' }}>
              {seoPage.category && (
                <div className="article-tag" style={{ marginBottom: 12 }}>
                  <span className="exam-tag">{cleanLabel(seoPage.category)}</span>
                </div>
              )}
              <h1 className="article-title" style={{
                fontSize: 'clamp(1.75rem, 5vw, 2.8rem)',
                fontWeight: 700,
                lineHeight: 1.1,
                marginBottom: '1.25rem',
                color: 'var(--text-primary)'
              }}>
                {seoPage.title}
              </h1>

              <div className="article-meta" style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 24, paddingBottom: 20, borderBottom: '1px solid var(--border)' }}>
                <Link
                  href={`/s/${enumToSlug(exam.status)}`}
                  className={`status-badge status-${exam.status}`}
                >
                  <div className="status-dot" />
                  {statusLabel}
                </Link>

                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  • {new Date(seoPage.updatedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </div>
              </div>

              {/* LIVE / Primary Action CTA (Rule 1.3) */}
              {liveEvent && (
                <div style={{
                  background: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  padding: 'clamp(16px, 4vw, 24px)',
                  borderRadius: 16,
                  marginBottom: 32,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{ color: 'var(--green)', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>
                      <span className="hero-badge-live-dot" style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: 'var(--green)', marginRight: 8 }} />
                      Action Available
                    </div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>
                      {liveEvent.actionLabel || `Access ${cleanLabel(liveEvent.stage)} Portal`}
                    </div>
                  </div>
                  <a
                    href={liveEvent.actionUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                    style={{ width: '100%', justifyContent: 'center', padding: '14px 20px', fontSize: '0.9rem' }}
                    onClick={() => trackConversion('article_live_action_click', {
                      article_slug: seoPage.slug,
                      exam_slug: exam.slug,
                      url: liveEvent.actionUrl
                    })}
                  >
                    Open Official Link <ArrowRight size={18} />
                  </a>
                </div>
              )}
            </header>

            {/* Featured Image if available */}
            {seoPage.ogImage && (
              <div style={{ marginBottom: 32, borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)' }}>
                <img src={seoPage.ogImage} alt={seoPage.title} style={{ width: '100%', height: 'auto', display: 'block' }} />
              </div>
            )}

            {/* Main Content */}
            <div className="seo-content" style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: 'clamp(1.05rem, 2vw, 1.15rem)', marginBottom: 60 }}>
              <MarkdownRenderer content={seoPage.content} />
            </div>

            {latestArticles.length > 0 && (
              <LatestArticlesSection
                title="Latest Guides"
                articles={latestArticles}
              />
            )}

            {/* Inline Ad */}
            <div style={{ margin: '40px 0' }}>
              <InFeedAd id="seo-inline-ad" index={1} />
            </div>
          </article>
        </main>

        {/* ─── Right Sidebar ─── */}
        <aside className="sidebar-right">
          <SidebarAd id="seo-right-ad-1" tall />

          {/* Exam Summary Widget */}
          <div className="sidebar-widget">
            <h3 className="widget-title" style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>
              Exam Overview
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ background: 'var(--bg-secondary)', padding: 8, borderRadius: 8, height: 'fit-content' }}>
                  <Globe size={16} color="var(--accent-2)" />
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Organization</div>
                  <Link 
                    href={`/conduct/${(exam.conductingBody || "ALL").toLowerCase().replace(/ /g, "-")}`}
                    style={{ 
                      color: 'var(--text-primary)', 
                      textDecoration: 'none',
                      transition: 'color 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
                  >
                    <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>{exam.conductingBody}</div>
                  </Link>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ background: 'var(--bg-secondary)', padding: 8, borderRadius: 8, height: 'fit-content' }}>
                  <MapPin size={16} color="var(--green)" />
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Location</div>
                  {exam.state ? (
                    <Link 
                      href={`/state/${exam.state.toLowerCase().replace(/ /g, "-")}`}
                      style={{ 
                        color: 'var(--text-primary)', 
                        textDecoration: 'none',
                        transition: 'color 0.2s',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent)'}
                      onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
                    >
                      <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>{exam.state}</div>
                    </Link>
                  ) : (
                    <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>India (National)</div>
                  )}
                </div>
              </div>
            </div>

            {exam.officialWebsite && (
              <a 
                href={exam.officialWebsite} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn btn-ghost" 
                style={{ width: '100%', marginTop: 20, justifyContent: 'center', fontSize: '0.8rem' }}
                onClick={() => trackConversion('article_official_site_click', {
                  article_slug: seoPage.slug,
                  exam_slug: exam.slug
                })}
              >
                <ExternalLink size={14} /> Visit Official Site
              </a>
            )}
          </div>

          <SidebarAd id="seo-right-ad-2" />

          {/* App Download CTA */}
          <div className="app-download-widget">
            <div className="app-widget-icon">
              <Smartphone size={18} color="var(--accent-light)" />
            </div>
            <div className="app-widget-title" style={{ fontSize: '1rem' }}>Get Local Alerts</div>
            <div className="app-widget-sub" style={{ fontSize: '0.8rem' }}>
              Download the Suchana app for real-time push notifications on this exam.
            </div>
            <a href="#" className="app-widget-btn" style={{ fontSize: '0.85rem' }}>
              Check for Updates <ArrowRight size={14} />
            </a>
          </div>

          <SidebarAd id="seo-right-ad-3" tall />
        </aside>
      </div>
    </div>
  );
}
