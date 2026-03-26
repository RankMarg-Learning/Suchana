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
import SiteNav from './SiteNav';
import SiteFooter from './SiteFooter';
import MarkdownRenderer from './MarkdownRenderer';
import { LeaderboardAd, SidebarAd, InFeedAd } from './AdUnits';
import { Exam, SeoPage, cleanLabel, formatDate, getTotalVacancies, STATUS_LABELS } from '../lib/types';

interface Props {
  exam: Exam;
  seoPage: SeoPage;
}

export default function SeoExamPageLayout({ exam, seoPage }: Props) {
  const statusLabel = STATUS_LABELS[exam.status] ?? cleanLabel(exam.status);

  const getLiveEvent = () => {
    if (!exam.lifecycleEvents) return null;
    const now = Date.now();

    const categoryToStage: Record<string, string> = {
      'ADMIT_CARD': 'ADMIT_CARD',
      'RESULTS': 'RESULT',
      'ANSWER_KEY': 'ANSWER_KEY',
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
    { label: cleanLabel(exam.category), href: `/?category=${exam.category}` },
    { label: exam.shortTitle || exam.title, href: `/${exam.slug}` },
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
      <SiteNav />

      {/* Top Banner Ad */}
      <div className="leaderboard-wrap" style={{ paddingTop: 80 }}>
        <LeaderboardAd id="seo-exam-top-leaderboard" />
      </div>

      <div className="app-shell" style={{ paddingTop: 8 }}>
        {/* ─── Left Sidebar ─── */}
        <aside className="sidebar-left">
          <div className="sidebar-widget">
            <Link href={`/${exam.slug}`} className="back-btn" style={{ fontSize: '0.85rem' }}>
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

          <article className="seo-article-v2" itemScope itemType="https://schema.org/Article">
            <header className="seo-header" style={{ marginBottom: 32 }}>
              <div className="exam-detail-tags" style={{ marginBottom: 12 }}>
                <span className={`exam-tag level-${(exam.examLevel ?? "national").toLowerCase()}`}>
                  {cleanLabel(exam.examLevel)}
                </span>
                <span className={`exam-tag cat-${(exam.category ?? "").toLowerCase()}`}>
                  {cleanLabel(exam.category)}
                </span>
              </div>

              <h1 className="seo-h1" style={{
                fontSize: 'clamp(1.8rem, 5vw, 2.5rem)',
                fontWeight: 800,
                lineHeight: 1.2,
                marginBottom: '1rem',
                color: 'var(--text-primary)'
              }}>
                {seoPage.title}
              </h1>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
                <div className={`status-badge status-${exam.status}`}>
                  <div className="status-dot" />
                  {statusLabel}
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  By {exam.conductingBody}
                </div>
              </div>

              {/* LIVE / Primary Action CTA (Rule 1.3) */}
              {liveEvent && (
                <div style={{
                  background: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  padding: 24,
                  borderRadius: 20,
                  marginBottom: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 16,
                  flexWrap: 'wrap'
                }}>
                  <div>
                    <div style={{ color: 'var(--green)', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
                      <span className="hero-badge-dot" style={{ display: 'inline-block', marginRight: 8 }} />
                      Live Action Available
                    </div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {liveEvent.actionLabel || `Access ${cleanLabel(liveEvent.stage)} Portal`}
                    </div>
                  </div>
                  <a href={liveEvent.actionUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ padding: '14px 28px' }}>
                    Click Here to Open <ArrowRight size={18} />
                  </a>
                </div>
              )}
            </header>

            {/* Featured Image if available */}
            {seoPage.ogImage && (
              <div style={{ marginBottom: 32, borderRadius: 16, overflow: 'hidden', border: '1px solid var(--border)' }}>
                <img src={seoPage.ogImage} alt={seoPage.title} style={{ width: '100%', height: 'auto', display: 'block' }} />
              </div>
            )}

            {/* Main Content */}
            <div className="seo-content" style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '1.1rem' }}>
              <MarkdownRenderer content={seoPage.content} />
            </div>

            {/* Stage Quick Navigation */}
            {availableLinks.length > 0 && (
              <div style={{ marginTop: 60, padding: 24, borderRadius: 16, background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 16, color: 'var(--text-primary)' }}>
                  Explore More for {exam.shortTitle || exam.title}
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: availableLinks.length > 1 ? '1fr 1fr' : '1fr', gap: 12 }}>
                  {availableLinks.map((link) => (
                    <Link
                      key={link.slug}
                      href={link.slug}
                      className="official-link-btn"
                      style={{ justifyContent: 'space-between', padding: '12px 16px' }}
                    >
                      <span>{link.label}</span>
                      <ChevronRight size={14} />
                    </Link>
                  ))}
                </div>

                <div style={{ marginTop: 24, textAlign: 'center' }}>
                  <Link href={`/exam/${exam.slug}`} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                    View Full Exam Timeline <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            )}

            {/* Inline Ad */}
            <div style={{ margin: '40px 0' }}>
              <InFeedAd id="seo-inline-ad" index={1} />
            </div>
          </article>
        </main>

        {/* ─── Right Sidebar ─── */}
        <aside className="sidebar-right">
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
                  <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>{exam.conductingBody}</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ background: 'var(--bg-secondary)', padding: 8, borderRadius: 8, height: 'fit-content' }}>
                  <MapPin size={16} color="var(--green)" />
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Location</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>{exam.state || 'India (National)'}</div>
                </div>
              </div>
            </div>

            {exam.officialWebsite && (
              <a href={exam.officialWebsite} target="_blank" rel="noopener noreferrer" className="btn btn-ghost" style={{ width: '100%', marginTop: 20, justifyContent: 'center', fontSize: '0.8rem' }}>
                <ExternalLink size={14} /> Visit Official Site
              </a>
            )}
          </div>

          <SidebarAd id="seo-right-ad-1" />

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

          <SidebarAd id="seo-right-ad-2" tall />
        </aside>
      </div>

      <SiteFooter />
    </div>
  );
}
