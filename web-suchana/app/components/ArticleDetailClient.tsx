"use client";

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { fetchSeoPages } from '../lib/api';
import LatestArticlesSection from './LatestArticlesSection';
import { Share2, Facebook, Twitter, MessageCircle } from 'lucide-react';
import { SeoPage } from '../lib/types';
import MarkdownRenderer from './MarkdownRenderer';
import { LeaderboardAd, SidebarAd } from './AdUnits';
import { cleanLabel } from '../lib/types';
import FAQSection from './FAQSection';
import { ImportantLinksWidget, RelatedArticlesWidget, ExamTimelineWidget, CategoryWidget } from './SidebarWidgets';

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
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />

      <div className="leaderboard-wrap" style={{ paddingTop: 'clamp(60px, 8vh, 80px)' }}>
        <LeaderboardAd id="article-top-leaderboard" />
      </div>

      <div className="app-shell">
        <aside className="sidebar-left">
          <ImportantLinksWidget />

          <SidebarAd id="article-left-ad-1" tall />
        </aside>

        <main className="feed-main">
          <article className="seo-article-v3" >
            <header className="article-header" style={{ marginBottom: '4rem' }}>
              {page.category && (
                <div className="article-tag" style={{ marginBottom: 20 }}>
                  <span className="exam-tag">{cleanLabel(page.category)}</span>
                </div>
              )}
              <h1 className="article-title" style={{
                fontSize: 'clamp(1.75rem, 4vw, 2.25rem)',
                fontWeight: 800,
                lineHeight: 1.1,
                marginBottom: '1.5rem',
                color: 'var(--text-primary)',
                letterSpacing: '-0.03em'
              }}>
                {page.title}
              </h1>
              <div className="article-meta" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 20, color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: 40, borderBottom: '1px solid var(--border)', paddingBottom: 32 }}>
                {page.author && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <Link
                      href={`/author/${page.author.slug}`}
                      style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}
                      className="group"
                    >
                      <div style={{ width: 28, height: 28, borderRadius: '50%', overflow: 'hidden', border: '1px solid var(--border)' }}>
                        <img
                          src={page.author.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(page.author.name)}&background=7c3aed&color=fff`}
                          alt={page.author.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem', transition: 'color 0.2s' }} className="group-hover:text-accent">
                          {page.author.name}
                        </span>
                      </div>
                    </Link>
                    <span style={{ width: 1, height: 14, background: 'var(--border)', opacity: 0.8 }} />
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
                  <span>Updated {new Date(page.updatedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                  <span>•</span>
                  <span>5 min read</span>
                </div>
                {/* Social Share Bar */}
                <div className="share-bar" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>Share:</span>
                  <button onClick={() => handleShare('twitter')} className="share-btn twitter"><Twitter size={16} /></button>
                  <button onClick={() => handleShare('facebook')} className="share-btn facebook"><Facebook size={16} /></button>
                  <button onClick={() => handleShare('whatsapp')} className="share-btn whatsapp"><MessageCircle size={16} /></button>
                  <button onClick={() => handleShare('generic')} className="share-btn generic"><Share2 size={16} /></button>
                </div>
              </div>


            </header>

            {page.ogImage && (
              <div className="article-featured-image" style={{ marginBottom: '4rem', borderRadius: 24, overflow: 'hidden', border: '1px solid var(--border)', boxShadow: '0 20px 50px rgba(0,0,0,0.04)' }}>
                <img src={page.ogImage} alt={page.title} style={{ width: '100%', height: 'auto', display: 'block' }} />
              </div>
            )}

            <div className="article-body" style={{ marginBottom: 80 }}>
              <MarkdownRenderer content={page.content} />
            </div>

            {page.faqs && page.faqs.length > 0 && (
              <div style={{ marginBottom: 80 }}>
                <FAQSection faqs={page.faqs} />
              </div>
            )}


            {latestData && latestData.length > 0 && (
              <LatestArticlesSection
                title="Latest Guides"
                articles={latestData}
              />
            )}
          </article>
        </main>

        <aside className="sidebar-right">
          <CategoryWidget />
          <SidebarAd id="article-right-ad-1" />
          <SidebarAd id="article-right-ad-2" tall />
        </aside>
      </div>
    </div>
  );
}
