"use client";

import { useQuery } from '@tanstack/react-query';
import { fetchSeoPages } from '../lib/api';
import LatestArticlesSection from './LatestArticlesSection';
import { SeoPage } from '../lib/types';
import MarkdownRenderer from './MarkdownRenderer';
import { LeaderboardAd, SidebarAd } from './AdUnits';
import { cleanLabel } from '../lib/types';
import FAQSection from './FAQSection';

interface Props {
  page: SeoPage;
  articleJsonLd: any;
}

export default function ArticleDetailClient({ page, articleJsonLd }: Props) {
  // Fetch Latest site-wide guides
  const { data: latestData = [] } = useQuery({
    queryKey: ['latest-guides'],
    queryFn: () => fetchSeoPages(1, 5).then(res => res.pages ?? []),
  });

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />

      <div className="leaderboard-wrap" style={{ paddingTop: 'clamp(60px, 8vh, 80px)' }}>
        <LeaderboardAd id="article-top-leaderboard" />
      </div>

      <div className="app-shell" style={{ gap: '4rem' }}>
        <aside className="sidebar-left">
          <SidebarAd id="article-left-ad-1" tall />
          <SidebarAd id="article-left-ad-2" />
        </aside>

        <main className="feed-main">
          <article className="seo-article-v3" style={{ padding: '3rem 0' }}>
            <header className="article-header" style={{ marginBottom: '4rem' }}>
              {page.category && (
                <div className="article-tag" style={{ marginBottom: 20 }}>
                  <span className="exam-tag">{cleanLabel(page.category)}</span>
                </div>
              )}
              <h1 className="article-title" style={{ fontSize: 'clamp(2.2rem, 7vw, 3.5rem)', fontWeight: 800, lineHeight: 1.05, marginBottom: '2.5rem', color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
                {page.title}
              </h1>
              <div className="article-meta" style={{ display: 'flex', flexWrap: 'wrap', gap: 20, color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: 40, borderBottom: '1px solid var(--border)', paddingBottom: 32 }}>
                <span>Updated {new Date(page.updatedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                <span>•</span>
                <span>5 min read</span>
              </div>
            </header>

            {page.ogImage && (
              <div className="article-featured-image" style={{ marginBottom: '4rem', borderRadius: 24, overflow: 'hidden', border: '1px solid var(--border)', boxShadow: '0 20px 50px rgba(0,0,0,0.04)' }}>
                <img src={page.ogImage} alt={page.title} style={{ width: '100%', height: 'auto', display: 'block' }} />
              </div>
            )}

            <div className="article-body text-base" style={{ marginBottom: 80, lineHeight: '1.8' }}>
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
          <SidebarAd id="article-right-ad-1" />
          <SidebarAd id="article-right-ad-2" tall />
        </aside>
      </div>
    </div>
  );
}
