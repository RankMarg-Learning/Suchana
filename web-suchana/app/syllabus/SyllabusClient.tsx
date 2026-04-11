"use client";

import React, { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { BookOpen, Search, ArrowRight, ChevronDown, RefreshCw } from 'lucide-react';
import { SeoPage } from '@/app/lib/types';
import { fetchSeoPages } from '@/app/lib/api';
import { LeaderboardAd, SidebarAd, InFeedAd } from '@/app/components/AdUnits';

interface Props {
  initialPages: SeoPage[];
  initialTotal: number;
}

export default function SyllabusClient({ initialPages, initialTotal }: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [pagesList, setPagesList] = useState<SeoPage[]>(initialPages);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialTotal > initialPages.length);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm), 400);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const loadData = useCallback(async (reset: boolean, pageNo?: number) => {
    setLoading(true);
    if (reset) setPagesList([]);
    const reqPage = reset ? 1 : (pageNo ?? page);
    try {
      const result = await fetchSeoPages(reqPage, 10, 'SYLLABUS', debouncedSearch || undefined);
      
      if (reset) {
        setPagesList(result.pages);
        setPage(1);
      } else {
        setPagesList(prev => [...prev, ...result.pages]);
      }
      setHasMore(result.total > reqPage * 10);
    } catch (err) {
      console.error(err);
      if (reset) setPagesList([]);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, page]);

  // When debounced search changes, reset and load from API
  useEffect(() => {
    // Only trigger if we actually typed something or cleared heavily
    // Since initial pages cover the empty search state, skip the very first empty search reload
    if (debouncedSearch !== '' || pagesList.length === 0) {
      loadData(true);
    } else if (debouncedSearch === '' && pagesList.length !== initialPages.length && !loading) {
      // Revert to initial fast state
      setPagesList(initialPages);
      setPage(1);
      setHasMore(initialTotal > initialPages.length);
    }
  }, [debouncedSearch]);


  return (
    <main className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <div className="leaderboard-wrap" style={{ paddingTop: 'clamp(60px, 8vh, 80px)' }}>
        <LeaderboardAd id="syllabus-top" />
      </div>

      <div className="app-shell">
        <aside className="sidebar-left">
          <SidebarAd id="syllabus-left-1" tall />
        </aside>

        <section className="feed-main">
          <div className="category-header" style={{ marginBottom: 32 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 12px', background: 'var(--accent-glow)', color: 'var(--accent)', borderRadius: 20, fontSize: '0.85rem', fontWeight: 700, marginBottom: 16 }}>
               <BookOpen size={16} /> Syllabus & Pattern
            </div>
            <h1 style={{ fontSize: 'clamp(2rem, 5vw, 2.8rem)', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1, marginBottom: 16, fontFamily: "var(--font-space-grotesk), sans-serif" }}>
              Official Syllabus Centre
            </h1>
            <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: 600 }}>
              Access topic-wise comprehensive syllabus breakdowns and latest exam patterns for your target government exams.
            </p>
          </div>

          <div style={{ position: 'relative', marginBottom: 32 }}>
            <Search size={20} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search syllabus by exam name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '16px 16px 16px 48px', borderRadius: 12, border: '1px solid var(--border)', background: 'var(--bg-secondary)', fontSize: '1rem', color: 'var(--text-primary)', outline: 'none' }}
            />
          </div>

          <div className="syllabus-list" style={{ display: 'flex', flexDirection: 'column' }}>
            {pagesList.length > 0 ? (
              <>
                {pagesList.map((pageData, index) => (
                  <React.Fragment key={pageData.id}>
                    <Link href={`/${pageData.slug}`} className="syllabus-list-row" style={{ display: 'flex', textDecoration: 'none', padding: '16px 0', borderBottom: '1px solid var(--border)', alignItems: 'center', transition: 'background 0.2s', justifyContent: 'space-between' }}>
                      <div style={{ flex: 1, minWidth: 0, paddingRight: 24 }}>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4, letterSpacing: '-0.3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {pageData.title}
                        </h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          {pageData.exam && <span style={{ fontWeight: 600, color: 'var(--accent)' }}>{pageData.exam.conductingBody}</span>}
                          {pageData.updatedAt && <span>{new Date(pageData.updatedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>}
                        </div>
                      </div>
                      <ArrowRight size={18} color="var(--border-strong)" style={{ flexShrink: 0 }} />
                    </Link>
                    
                    {/* Insert an InFeed text ad every 5 results */}
                    {(index + 1) % 5 === 0 && (
                      <div style={{ padding: '16px 0', borderBottom: '1px solid var(--border)' }}>
                        <InFeedAd id={`syllabus-infeed-${index}`} index={index} />
                      </div>
                    )}
                  </React.Fragment>
                ))}

                {hasMore && (
                  <div style={{ textAlign: 'center', marginTop: 16 }}>
                    <button 
                      className="btn btn-ghost btn-lg" 
                      onClick={() => { setPage(p => p + 1); loadData(false, page + 1); }}
                      disabled={loading}
                      style={{ padding: '12px 24px', fontSize: '1rem', width: '100%', justifyContent: 'center' }}
                    >
                      {loading ? <><RefreshCw size={18} className="spin-icon" style={{ display: 'inline', marginRight: 8 }} /> Loading...</> : <><ChevronDown size={18} style={{ display: 'inline', marginRight: 8 }} /> Load More</>}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div style={{ padding: 40, textAlign: 'center', background: 'var(--bg-secondary)', borderRadius: 16, border: '1px solid var(--border)' }}>
                {loading ? (
                  <>
                    <RefreshCw size={40} className="spin-icon" style={{ margin: '0 auto 16px', color: 'var(--text-muted)' }} />
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)' }}>Searching syllabus documents...</h3>
                  </>
                ) : (
                  <>
                    <BookOpen size={48} color="var(--border-strong)" style={{ margin: '0 auto 16px' }} />
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>No syllabus found</h3>
                    <p style={{ color: 'var(--text-muted)' }}>We couldn't find any documents matching "{searchTerm}".</p>
                  </>
                )}
              </div>
            )}
          </div>
        </section>

        <aside className="sidebar-right">
          <SidebarAd id="syllabus-right-1" tall />
        </aside>
      </div>
    </main>
  );
}
