import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { fetchRelatedArticlesByTag } from '../lib/api';
import { Exam, getStageState, formatDate, CATEGORIES, slugify } from '../lib/types';
import { ExternalLink, BookOpen, Calendar, ChevronRight } from 'lucide-react';

/* ─── 1. Important Links Widget ─── */
export function ImportantLinksWidget() {
  const links = [
    { label: 'Latest Notifications', url: '/topic/notification', icon: <Calendar size={14} /> },
    { label: 'Admit Cards', url: '/topic/admit-card', icon: <ExternalLink size={14} /> },
    { label: 'Exam Results', url: '/topic/result', icon: <ExternalLink size={14} /> },
    { label: 'Best Books', url: '/topic/books', icon: <BookOpen size={14} /> },
  ];

  return (
    <div className="sw">
      <div className="sw-head">🔗 Important Links</div>
      <div className="sw-body">
        <div className="doc-list">
          {links.map((link, idx) => (
            <Link key={idx} href={link.url} className="doc-item no-underline">
              <span className="doc-icon">{link.icon}</span>
              <span className="doc-name">{link.label}</span>
              <span className="doc-badge">GO</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── 1b. Categories Widget ─── */
export function CategoryWidget() {
  const displayCats = CATEGORIES.filter(c => c.value !== 'ALL').slice(0, 8);

  return (
    <div className="sw">
      <div className="sw-head">📁 Categories <span>{displayCats.length}</span></div>
      <div className="sw-body">
        <div className="sb-art-list">
          {displayCats.map((cat, idx) => (
            <Link key={idx} href={`/c/${slugify(cat.value)}`} className="sb-art-item no-underline" style={{ padding: '8px 0' }}>
              <span className="sb-art-num">{cat.icon}</span>
              <div className="flex flex-col">
                <span className="sb-art-title" style={{ fontSize: '13px' }}>{cat.label}</span>
              </div>
            </Link>
          ))}
        </div>
        <Link href="/categories" className="btn-outline w-full text-center mt-4 no-underline block" style={{ borderColor: 'var(--border)', color: 'var(--text)' }}>
          View All Categories <ChevronRight size={12} className="inline-block" />
        </Link>
      </div>
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
    <div className="sw">
      <div className="sw-head">📚 Suggested Guides</div>
      <div className="sw-body">
        <div className="sb-art-list">
          {isLoading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="related-skeleton h-16 w-full bg-muted/20 animate-pulse mb-3" />
            ))
          ) : (
            related.map((article, idx) => (
              <Link key={article.id} href={`/${article.slug}`} className="sb-art-item no-underline">
                <span className="sb-art-num">0{idx + 1}</span>
                <div className="flex flex-col">
                  <span className="sb-art-title">{article.title}</span>
                  <span className="sb-art-cat">{mainTag?.name || 'Guide'}</span>
                </div>
              </Link>
            ))
          )}
        </div>
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
    <div className="sw">
      <div className="sw-head">⏳ Exam Timeline <span>Live</span></div>
      <div className="sw-body !p-0">
        <div className="flex flex-col">
          {events.map((event, idx) => {
            const state = getStageState(event, now);
            const isDone = state === 'done';
            const isActive = state === 'active';

            return (
              <div key={event.id} className="dl-item px-4">
                <div className={`dl-days ${isActive ? 'urgent' : ''}`}>
                  {isDone ? '✓' : (isActive ? 'NOW' : 'TBD')}
                </div>
                <div className="flex flex-col flex-1">
                  <span className="dl-name">{event.title}</span>
                  <span className="dl-date">
                    {event.isTBD ? 'To Be Announced' : formatDate(event.startsAt || event.endsAt)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        <div className="p-4 border-t border-[var(--border)] bg-[var(--paper)]">
          <Link href={`/exams/${exam.slug}`} className="btn-outline w-full text-center no-underline block" style={{ borderColor: 'var(--border)', color: 'var(--text)' }}>
            View Full Details <ExternalLink size={12} className="inline-block" />
          </Link>
        </div>
      </div>
    </div>
  );
}
