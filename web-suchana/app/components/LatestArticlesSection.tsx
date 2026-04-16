"use client";

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { SeoPage, cleanLabel } from '../lib/types';
import { trackFunnelStep } from '../lib/telemetry';

interface Props {
  title: string;
  articles: SeoPage[];
  viewAllHref?: string;
  variant?: 'default' | 'sidebar';
}

export default function LatestArticlesSection({ title, articles, viewAllHref = "/articles", variant = 'default' }: Props) {
  if (!articles || articles.length === 0) return null;

  const isSidebar = variant === 'sidebar';

  return (
    <section className={`latest-articles-section ${isSidebar ? 'is-sidebar' : ''}`} style={{ marginTop: isSidebar ? 24 : 'clamp(32px, 8vh, 60px)' }}>
      <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isSidebar ? 12 : 20 }}>
        <h2 className="section-title" style={{ fontSize: isSidebar ? '1.05rem' : 'clamp(1.1rem, 2.5vw, 1.25rem)', fontWeight: 700, color: 'var(--text-primary)' }}>
          {title}
        </h2>
        {!isSidebar && (
          <Link href={viewAllHref} className="btn btn-ghost" style={{ fontSize: '0.85rem', fontWeight: 600 }}>
            View All <ArrowRight size={14} style={{ marginLeft: 6 }} />
          </Link>
        )}
      </div>

      <div className="latest-articles-list">
        {articles.map((article, idx) => (
          <Link
            key={article.id}
            href={`/${article.slug}`}
            prefetch={false}
            className="article-list-item"
            style={{
              padding: isSidebar ? '12px 0' : 'clamp(12px, 2vh, 16px) 0',
              borderBottom: (isSidebar && idx === articles.length - 1) ? 'none' : '1px solid var(--border)'
            }}
            onClick={() => trackFunnelStep('article_crosslink_click', {
              article_slug: article.slug,
              article_title: article.title,
              context: title
            })}
          >
            <div className="article-list-content">
              <h4 className="article-list-title" style={{ fontSize: isSidebar ? '0.9rem' : 'clamp(0.95rem, 2vw, 1.05rem)', fontWeight: 600 }}>{article.title}</h4>
              <div className="article-list-meta">
                <span className="article-list-tag" style={{ fontSize: isSidebar ? '0.7rem' : '0.8rem' }}>{cleanLabel(article.category || "") || "Guide"}</span>
                {!isSidebar && article.updatedAt && (
                  <span className="article-list-date" style={{ fontSize: 'clamp(0.7rem, 2vw, 0.8rem)' }}>
                    Updated {new Date(article.updatedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                )}
              </div>
            </div>
            {!isSidebar && <ArrowRight size={18} className="article-list-arrow" />}
          </Link>
        ))}
        {isSidebar && (
          <Link href={viewAllHref} className="btn btn-ghost" style={{ width: '100%', marginTop: 8, fontSize: '0.75rem', justifyContent: 'center' }}>
            Browse All Guides <ArrowRight size={12} style={{ marginLeft: 6 }} />
          </Link>
        )}
      </div>
    </section>
  );
}
