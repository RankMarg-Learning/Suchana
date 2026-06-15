"use client";

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { fetchSeoPages } from '../lib/api';
import LatestArticlesSection from './LatestArticlesSection';
import { Share2, MessageCircle, FileText, Landmark, MapPin, Edit3, Calendar, Clock, Bookmark } from 'lucide-react';
import { SeoPage } from '../lib/types';
import MarkdownRenderer from './MarkdownRenderer';
import { cleanLabel } from '../lib/types';
import FAQSection from './FAQSection';
import { ImportantLinksWidget, RelatedArticlesWidget, ExamTimelineWidget, CategoryWidget } from './SidebarWidgets';
import { ArticleAd } from './AdUnits';

interface Props {
  page: SeoPage;
  articleJsonLd: any;
}

export default function ArticleDetailClient({ page, articleJsonLd }: Props) {
  const { data: latestData = [] } = useQuery({
    queryKey: ['latest-guides'],
    queryFn: () => fetchSeoPages(1, 5).then(res => res.pages ?? []),
  });

  const handleShare = (platform: string) => {
    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
    const shareTitle = page.title;
    const url = encodeURIComponent(shareUrl);
    const title = encodeURIComponent(shareTitle);

    let shareLink = '';
    switch (platform) {
      case 'twitter':
        shareLink = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
        break;
      case 'facebook':
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
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

  return (
    <div style={{ minHeight: '100vh' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />

      {/* Breadcrumb could go here if we wanted */}

      <div className="wrap" style={{ paddingTop: "10px" }}>

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
                    {page.category && <span className="tag-pill">{cleanLabel(page.category)}</span>}
                    {page.exam && <span>{page.exam.shortTitle || page.exam.title}</span>}
                  </div>
                  <div className="art-hero-h1">{page.title}</div>
                </div>
              </div>
              <div className="art-hero-meta-bar">
                <div className="art-meta-left">
                  {page.exam?.conductingBody && (
                    <div className="art-meta-item"><Landmark size={14} className="mr-1.5 opacity-70" /> <strong>{page.exam.conductingBody}</strong></div>
                  )}
                  {page.exam?.state && (
                    <div className="art-meta-item"><MapPin size={14} className="mr-1.5 opacity-70" /> <strong>{page.exam.state}</strong></div>
                  )}
                  {page.author && (
                    <div className="art-meta-item">
                      <Edit3 size={14} className="mr-1.5 opacity-70" /> By&nbsp;
                      <Link href={`/author/${page.author.slug}`} style={{ color: 'inherit', textDecoration: 'underline', fontWeight: 700 }}>
                        {page.author.name}
                      </Link>
                    </div>
                  )}
                  <div className="art-meta-item"><Calendar size={14} className="mr-1.5 opacity-70" /> <strong>{new Date(page.updatedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</strong></div>
                  <div className="art-meta-item"><Clock size={14} className="mr-1.5 opacity-70" /> <strong>5 min</strong>&nbsp;read</div>
                </div>
                <div className="art-meta-right">
                  <button onClick={() => handleShare('generic')} className="share-btn flex items-center gap-1.5"><Share2 size={14} /> Share</button>
                </div>
              </div>
            </div>

            {page.ogImage && (
              <div className="article-featured-image" style={{ marginBottom: '24px', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                <img src={page.ogImage} alt={page.title} style={{ width: '100%', height: 'auto', display: 'block' }} />
              </div>
            )}

            {/* ── Article Top Ad ─────────────────────────────────────── */}
            {/* Enable via: ADS_CONFIG.enableAds = true & placements.articleTop = true */}
            <ArticleAd slotId="article-top" placementKey="articleTop" />

            <div className="art-body-wrap">
              <MarkdownRenderer content={page.content} />
            </div>

            {/* ── Article Bottom Ad ──────────────────────────────────── */}
            {/* Enable via: ADS_CONFIG.enableAds = true & placements.articleBottom = true */}
            <ArticleAd slotId="article-bottom" placementKey="articleBottom" />

            {page.faqs && page.faqs.length > 0 && (
              <FAQSection faqs={page.faqs} />
            )}

            {latestData && latestData.length > 0 && (
              <LatestArticlesSection
                title="Latest Guides"
                articles={latestData}
              />
            )}
          </div>

          {/* SIDEBAR */}
          <div className="sidebar-col">
            <ImportantLinksWidget />
            <CategoryWidget />



            <ExamTimelineWidget exam={page.exam as any} />
            <RelatedArticlesWidget tags={page.tags} currentSlug={page.slug} />
          </div>
        </div>
      </div>
    </div>
  );
}
