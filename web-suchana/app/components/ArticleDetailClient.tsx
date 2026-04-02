"use client";

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchSeoPages } from '../lib/api';
import LatestArticlesSection from './LatestArticlesSection';
import { SeoPage } from '../lib/types';
import SiteNav from './SiteNav';
import SiteFooter from './SiteFooter';
import MarkdownRenderer from './MarkdownRenderer';
import { LeaderboardAd, SidebarAd } from './AdUnits';
import { cleanLabel } from '../lib/types';

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

      <div className="app-shell">
        <aside className="sidebar-left">
          <SidebarAd id="article-left-ad-1" tall />
          <SidebarAd id="article-left-ad-2" />
        </aside>

        <main className="feed-main">
          <article className="seo-article-v3">
            <header className="article-header">
              {page.category && (
                <div className="article-tag" style={{ marginBottom: 12 }}>
                  <span className="exam-tag">{cleanLabel(page.category)}</span>
                </div>
              )}
              <h1 className="article-title" style={{ fontSize: 'clamp(1.75rem, 5vw, 2.8rem)', fontWeight: 700, lineHeight: 1.1, marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
                {page.title}
              </h1>
              <div className="article-meta" style={{ display: 'flex', flexWrap: 'wrap', gap: 12, color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 24, borderBottom: '1px solid var(--border)', paddingBottom: 16 }}>
                <span>Updated {new Date(page.updatedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                <span>•</span>
                <span>5 min read</span>
              </div>
            </header>

            {page.ogImage && (
              <div className="article-featured-image" style={{ marginBottom: '2rem', borderRadius: 16, overflow: 'hidden', border: '1px solid var(--border)' }}>
                <img src={page.ogImage} alt={page.title} style={{ width: '100%', height: 'auto', display: 'block' }} />
              </div>
            )}

            <div className="article-body" style={{ marginBottom: 60 }}>
              <MarkdownRenderer content={page.content} />
            </div>

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
