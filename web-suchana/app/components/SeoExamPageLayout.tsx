"use client";

import React from 'react';
import Link from 'next/link';
import {
  FileText,
  MapPin,
  Calendar,
  ExternalLink,
  Landmark,
  Edit3,
  Share2,
  Pin,
  Activity,
  Link as LinkIcon,
  Hourglass,
  ClipboardList
} from 'lucide-react';
import MarkdownRenderer from './MarkdownRenderer';
import { Exam, SeoPage, cleanLabel, STATUS_LABELS, getCategoryInfo, enumToSlug } from '../lib/types';
import { LifecycleStage } from '../lib/enums';
import LatestArticlesSection from './LatestArticlesSection';
import FAQSection from './FAQSection';

import { useQuery } from '@tanstack/react-query';
import { fetchSeoPages } from '../lib/api';
import { trackFunnelStep, trackConversion } from '../lib/telemetry';
import { useScrollTracking } from '../hooks/useScrollTracking';
import SidebarAd from './ads/SidebarAd';
import LeaderboardAd from './ads/LeaderboardAd';

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

  const handleShare = (platform: string) => {
    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
    const shareTitle = seoPage.title;
    const url = encodeURIComponent(shareUrl);
    const title = encodeURIComponent(shareTitle);

    let shareLink = '';
    switch (platform) {
      case 'twitter':
        shareLink = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
        break;
      case 'whatsapp':
        shareLink = `https://api.whatsapp.com/send?text=${title}%20${url}`;
        break;
      case 'generic':
        if (navigator.share) {
          navigator.share({ title: shareTitle, url: shareUrl }).catch(() => { });
          return;
        } else {
          navigator.clipboard.writeText(shareUrl);
          alert('Link copied to clipboard!');
          return;
        }
    }
    if (shareLink) {
      window.open(shareLink, '_blank', 'width=600,height=400');
    }
  };

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
    <div style={{ minHeight: '100vh' }}>
      {/* Breadcrumb */}
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
        <LeaderboardAd />

        <div className="article-grid">
          {/* ARTICLE COLUMN */}
          <div className="fade-up">

            {/* HERO */}
            <div className="art-hero">
              <div className="art-hero-top">
                <div className="art-hero-pattern"></div>
                <div className="art-hero-emoji"><FileText size={64} color="var(--gold)" /></div>
                <div className="art-hero-overlay"></div>
                <div className="art-hero-bottom">
                  <div className="art-hero-cat">
                    {seoPage.category && <span className="tag-pill">{cleanLabel(seoPage.category)}</span>}
                    {exam.shortTitle || exam.title}
                  </div>
                  <div className="art-hero-h1">{seoPage.title}</div>
                </div>
              </div>
              <div className="art-hero-meta-bar">
                <div className="art-meta-left">
                  {exam.conductingBody && (
                    <div className="art-meta-item"><Landmark size={14} className="mr-1.5 opacity-70" /> <strong>{exam.conductingBody}</strong></div>
                  )}
                  {exam.state && (
                    <div className="art-meta-item"><MapPin size={14} className="mr-1.5 opacity-70" /> <strong>{exam.state}</strong></div>
                  )}
                  {seoPage.author && (
                    <div className="art-meta-item">
                      <Edit3 size={14} className="mr-1.5 opacity-70" /> By&nbsp;
                      <Link href={`/author/${seoPage.author.slug}`} style={{ color: 'inherit', textDecoration: 'underline', fontWeight: 700 }}>
                        {seoPage.author.name}
                      </Link>
                    </div>
                  )}

                  <div className="art-meta-item"><Calendar size={14} className="mr-1.5 opacity-70" /> <strong>{new Date(seoPage.updatedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</strong></div>
                </div>
                <div className="art-meta-right">
                  <button onClick={() => handleShare('generic')} className="share-btn flex items-center gap-1.5"><Share2 size={14} /> Share</button>
                </div>
              </div>
            </div>

            {/* STATUS BADGES */}
            <div className="status-badge-row">
              <div className="sb sb-blue">
                <span className="sb-icon"><Pin size={16} /></span>
                <div>
                  <span className="sb-label">Status</span>
                  <span className="sb-val">{statusLabel}</span>
                </div>
              </div>
              {liveEvent && (
                <div className="sb sb-green">
                  <span className="sb-icon"><Activity size={16} /></span>
                  <div>
                    <span className="sb-label">Live Event</span>
                    <span className="sb-val">{cleanLabel(liveEvent.stage)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* LIVE / Primary Action CTA */}
            {liveEvent && (
              <div className="highlights-box" style={{ background: '#f0fdf4', borderLeftColor: '#059669' }}>
                <div className="hb-head" style={{ color: '#059669' }}>ACTION AVAILABLE</div>
                <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px', color: '#065f46' }}>
                  {liveEvent.actionLabel || `Access ${cleanLabel(liveEvent.stage)} Portal`}
                </div>
                <a
                  href={liveEvent.actionUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-gold"
                  style={{ display: 'inline-block', background: '#059669', color: '#fff' }}
                  onClick={() => trackConversion('article_live_action_click', {
                    article_slug: seoPage.slug,
                    exam_slug: exam.slug,
                    url: liveEvent.actionUrl
                  })}
                >
                  Open Official Link →
                </a>
              </div>
            )}

            {seoPage.ogImage && (
              <div className="article-featured-image" style={{ marginBottom: '24px', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                <img src={seoPage.ogImage} alt={seoPage.title} style={{ width: '100%', height: 'auto', display: 'block' }} />
              </div>
            )}

            <div className="art-body-wrap">
              <MarkdownRenderer content={seoPage.content} />
            </div>

            {seoPage.faqs && seoPage.faqs.length > 0 && (

              <FAQSection faqs={seoPage.faqs} />
            )}

            {latestArticles.length > 0 && (
              <LatestArticlesSection
                title="Latest Guides"
                articles={latestArticles}
              />
            )}
          </div>

          {/* SIDEBAR */}
          <div className="sidebar-col">
            <div className="sw">
              <div className="sw-head"><LinkIcon size={18} /> Exam Links</div>
              <div className="sw-body">
                <div className="doc-list">
                  <Link
                    href={`/exam/${exam.slug}`}
                    className="doc-item"
                    onClick={() => trackFunnelStep('article_to_timeline_click', {
                      article_slug: seoPage.slug,
                      exam_slug: exam.slug
                    })}
                  >
                    <span className="doc-icon"><Hourglass size={14} className="opacity-70" /></span>
                    <span className="doc-name">Full Exam Timeline</span>
                    <span className="doc-badge" style={{ background: 'var(--ink)', color: 'var(--gold-lt)' }}>VIEW</span>
                  </Link>
                  {exam.officialWebsite && (
                    <a href={exam.officialWebsite} target="_blank" className="doc-item">
                      <span className="doc-icon"><ExternalLink size={14} className="opacity-70" /></span>
                      <span className="doc-name">Official Website</span>
                      <span className="doc-badge" style={{ background: '#dbeafe', color: '#1e40af' }}>LINK</span>
                    </a>
                  )}
                </div>
              </div>
            </div>

            <SidebarAd className="ad-sidebar ad-s-250" />

            <div className="sw">
              <div className="sw-head"><ClipboardList size={18} /> Overview</div>
              <div className="sw-body" style={{ fontSize: '13px' }}>
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ fontSize: '10px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '1px' }}>Organization</div>
                  <div style={{ fontWeight: 600 }}>{exam.conductingBody}</div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '1px' }}>Location</div>
                  <div style={{ fontWeight: 600 }}>{exam.state || "India (National)"}</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div >
  );
}
