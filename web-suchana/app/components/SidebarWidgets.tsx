"use client";

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { fetchRelatedArticlesByTag, fetchTrendingContent } from '../lib/api';
import { SeoPage, Exam, LifecycleEvent, getStageState, formatDate, CATEGORIES, slugify } from '../lib/types';
import { ExternalLink, Link2, BookOpen, Clock, Calendar, TrendingUp, Grid, ChevronRight } from 'lucide-react';

/* ─── 1. Important Links Widget ─── */
export function ImportantLinksWidget() {
  const links = [
    { label: 'Latest Notifications', url: '/topics/notification', icon: <Calendar size={14} /> },
    { label: 'Admit Cards', url: '/topics/admit-card', icon: <ExternalLink size={14} /> },
    { label: 'Exam Results', url: '/topics/result', icon: <ExternalLink size={14} /> },
    { label: 'Best Books', url: '/topics/books', icon: <BookOpen size={14} /> },
  ];

  return (
    <div className="sidebar-widget">
      <h3 className="sidebar-widget-title">Quick Links</h3>
      <div className="sidebar-links">
        {links.map((link, idx) => (
          <Link key={idx} href={link.url} className="sidebar-link-item group">
            <span className="sidebar-link-icon">{link.icon}</span>
            <span className="sidebar-link-text">{link.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

/* ─── 1b. Categories Widget ─── */
export function CategoryWidget() {
  const displayCats = CATEGORIES.filter(c => c.value !== 'ALL').slice(0, 8);

  return (
    <div className="sidebar-widget">
      <h3 className="sidebar-widget-title">Exams By Category</h3>
      <div className="sidebar-category-grid">
        {displayCats.map((cat, idx) => (
          <Link key={idx} href={`/c/${slugify(cat.value)}`} className="sidebar-cat-item group">
            <span className="cat-icon">{cat.icon}</span>
            <span className="cat-label">{cat.label}</span>
          </Link>
        ))}
      </div>
      <Link href="/categories" className="view-more-link mt-4">
        View All Categories <ChevronRight size={12} />
      </Link>
    </div>
  );
}

/* ─── 2. Related Articles Widget ─── */
interface RelatedProps {
  tags?: { tag: { id: string; name: string } }[];
  currentSlug: string;
}

export function RelatedArticlesWidget({ tags, currentSlug }: RelatedProps) {
  const mainTag = tags?.[0]?.tag;

  const { data: related = [], isLoading } = useQuery({
    queryKey: ['related-articles', mainTag?.id],
    queryFn: () => mainTag ? fetchRelatedArticlesByTag(mainTag.id, currentSlug, 4) : Promise.resolve([]),
    enabled: !!mainTag?.id,
  });

  if (!mainTag || (!isLoading && related.length === 0)) return null;

  return (
    <div className="sidebar-widget">
      <h3 className="sidebar-widget-title">Suggested Guides</h3>
      <div className="sidebar-related-list">
        {isLoading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="related-skeleton h-16 w-full bg-muted/20 animate-pulse rounded-xl mb-3" />
          ))
        ) : (
          related.map((article) => (
            <Link key={article.id} href={`/${article.slug}`} className="related-item group">
              <div className="related-thumb">
                <img
                  src={article.ogImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(article.title)}&background=7c3aed&color=fff&size=100`}
                  alt={article.title}
                />
              </div>
              <div className="related-info">
                <h4 className="related-title line-clamp-2 group-hover:text-primary transition-colors">
                  {article.title}
                </h4>
                <div className="related-meta">
                  <Clock size={10} />
                  <span>5 min read</span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

/* ─── 3. Exam Timeline Widget ─── */
interface TimelineProps {
  exam?: Exam;
}

export function ExamTimelineWidget({ exam }: TimelineProps) {
  if (!exam || !exam.lifecycleEvents || exam.lifecycleEvents.length === 0) return null;

  const events = [...exam.lifecycleEvents].sort((a, b) => (a.stageOrder || 0) - (b.stageOrder || 0));
  const now = Date.now();

  return (
    <div className="sidebar-widget">
      <div className="flex items-center justify-between mb-4">
        <h3 className="sidebar-widget-title !mb-0">Exam Timeline</h3>
        <span className="text-[10px] font-bold text-primary bg-primary/5 px-2 py-0.5 rounded-full uppercase tracking-tighter">Live</span>
      </div>
      <div className="mini-timeline">
        {events.map((event, idx) => {
          const state = getStageState(event, now);
          return (
            <div key={event.id} className={`timeline-step ${state}`}>
              <div className="step-indicator">
                <div className="step-dot" />
                {idx !== events.length - 1 && <div className="step-line" />}
              </div>
              <div className="step-content">
                <span className="step-label">{event.title}</span>
                <span className="step-date">
                  {event.isTBD ? 'To Be Announced' : formatDate(event.startsAt || event.endsAt)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      <Link href={`/exams/${exam.slug}`} className="timeline-footer-link">
        View Full Details <ExternalLink size={12} />
      </Link>
    </div>
  );
}
