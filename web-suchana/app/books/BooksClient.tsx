"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Search, Loader2, ArrowRight, Book, AlertCircle, X, Flame } from "lucide-react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { fetchSeoPages } from "../lib/api";
import { cleanLabel } from "../lib/types";
import { LeaderboardAd, SidebarAd } from "../components/AdUnits";

export default function BooksClient() {
  const [mounted, setMounted] = useState(false);
  // Fix the category to BOOKS so it only pulls book related pages.
  const category = "BOOKS";
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status
  } = useInfiniteQuery({
    queryKey: ["articles", category, debouncedSearch],
    queryFn: ({ pageParam = 1 }) =>
      fetchSeoPages(pageParam as number, 12, category, debouncedSearch || undefined, false),
    getNextPageParam: (lastPage, allPages) => {
      const moreExist = (lastPage.pages ?? []).length === 12;
      return moreExist ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1,
  });

  const { data: trendingData, isFetching: isFetchingTrending } = useQuery({
    queryKey: ["trending-books", category],
    queryFn: () => fetchSeoPages(1, 4, category, undefined, true),
  });
  const trendingArticles = trendingData?.pages ?? [];

  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (!mounted) return (
    <main className="min-h-screen">
      <div className="app-shell" style={{ opacity: 0.1 }}>
        <aside className="sidebar-left">
          <div className="sidebar-widget"><div className="skeleton" style={{ height: '300px', borderRadius: '16px' }} /></div>
        </aside>
        <section className="feed-main">
          <div className="feed-header"><div className="skeleton" style={{ height: '120px', borderRadius: '16px' }} /></div>
          <div className="article-skeleton-list" style={{ marginTop: '32px' }}>
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="article-skeleton-item">
                <div className="skeleton" style={{ height: '24px', width: '60%', borderRadius: '4px', marginBottom: '12px' }} />
                <div className="skeleton" style={{ height: '14px', width: '40%', borderRadius: '4px' }} />
              </div>
            ))}
          </div>
        </section>
        <aside className="sidebar-right"><div className="sidebar-widget"><div className="skeleton" style={{ height: '400px', borderRadius: '16px' }} /></div></aside>
      </div>
    </main>
  );

  const allArticles = data?.pages.flatMap(p => p.pages ?? []) ?? [];

  return (
    <main className="min-h-screen">
      <div className="leaderboard-wrap" style={{ marginTop: '20px' }}>
        <LeaderboardAd id="books-top-leaderboard" />
      </div>

      <div className="app-shell">
        <aside className="sidebar-left">
          <SidebarAd id="books-left-ad-1" tall />
          <SidebarAd id="books-left-ad-2" />
        </aside>

        <section className="feed-main" id="articles-feed">
          <div className="feed-header" style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '24px' }}>
            <div className="feed-title-row" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ background: 'var(--accent)', padding: '12px', borderRadius: '12px', color: 'white' }}>
                <Book size={28} />
              </div>
              <div>
                <h1 className="feed-title" style={{ fontSize: '28px' }}>Recommended Books</h1>
                <p className="feed-subtitle" style={{ fontSize: '15px' }}>Best study material and resources.</p>
              </div>
            </div>

            <div className="feed-search-wrap" style={{ marginTop: '24px' }}>
              <div className="search-bar" style={{ maxWidth: '100%', width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border-light)' }}>
                <Search className="search-icon" size={16} color="var(--text-muted)" />
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search book resources..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ fontSize: '15px', background: 'transparent' }}
                />
                {search && (
                  <button className="search-clear-btn" onClick={() => setSearch("")} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: '4px' }}>
                    <X size={16} color="var(--text-muted)" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {!debouncedSearch && trendingArticles.length > 0 && (
            <div className="trending-section" style={{ padding: '24px 0', borderBottom: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <Flame size={20} color="#ff4500" />
                <h3 style={{ fontSize: '18px', fontWeight: '700' }}>Trending Books</h3>
              </div>
              <div className="trending-scroll" style={{ display: 'flex', overflowX: 'auto', gap: '16px', paddingBottom: '12px', scrollSnapType: 'x mandatory' }}>
                {trendingArticles.map(article => (
                  <Link key={article.id} href={`/${article.slug}`} style={{ minWidth: '280px', flex: '0 0 auto', background: 'linear-gradient(145deg, var(--bg-card) 0%, var(--bg-surface) 100%)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-light)', scrollSnapAlign: 'start', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <span style={{ display: 'inline-block', background: 'rgba(255, 69, 0, 0.1)', color: '#ff4500', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', marginBottom: '12px' }}>Hot</span>
                      <h4 style={{ fontSize: '16px', fontWeight: '700', lineHeight: '1.4', marginBottom: '12px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{article.title}</h4>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent)', fontSize: '13px', fontWeight: '600' }}>
                      Read Details <ArrowRight size={14} />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {status === "pending" ? (
            <div className="article-skeleton-list" style={{ marginTop: '20px' }}>
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="article-skeleton-item">
                  <div className="skeleton" style={{ height: '24px', width: '70%', borderRadius: '4px', marginBottom: '12px' }} />
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div className="skeleton" style={{ height: '14px', width: '80px', borderRadius: '4px' }} />
                    <div className="skeleton" style={{ height: '14px', width: '120px', borderRadius: '4px' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : allArticles.length === 0 ? (
            <div className="empty-state">
              <AlertCircle size={48} className="empty-icon" />
              <h3>No books resources found</h3>
              <p>Try adjusting your search query.</p>
              <button className="btn btn-primary" onClick={() => { setSearch(""); }}>
                Clear Search
              </button>
            </div>
          ) : (
            <div className="latest-articles-list" style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
              {allArticles.map(article => (
                <Link key={article.id} href={`/${article.slug}`} className="article-list-item" style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-light)' }}>
                  <div className="article-list-content">
                    <h4 className="article-list-title" style={{ fontSize: '18px', marginBottom: '8px' }}>{article.title}</h4>
                    <div className="article-list-meta" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <span className="article-list-tag" style={{ background: 'var(--bg-subtle)', color: 'var(--accent)', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold' }}>
                        Book Collection
                      </span>
                      {article.updatedAt && (
                        <span className="article-list-date" style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                          Updated {new Date(article.updatedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ background: 'var(--bg-surface)', padding: '10px', borderRadius: '50%', color: 'var(--text-secondary)' }}>
                    <ArrowRight size={18} />
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div ref={loadMoreRef} className="load-more-trigger">
            {isFetchingNextPage && (
              <div className="article-skeleton-list" style={{ marginTop: '0' }}>
                {[1, 2, 3].map(i => (
                  <div key={i} className="article-skeleton-item">
                     <div className="skeleton" style={{ height: '24px', width: '70%', borderRadius: '4px', marginBottom: '12px' }} />
                     <div className="skeleton" style={{ height: '14px', width: '40%', borderRadius: '4px' }} />
                  </div>
                ))}
              </div>
            )}
            {!hasNextPage && allArticles.length > 0 && (
              <div className="no-more-footer" style={{ textAlign: 'center', margin: '40px 0', color: 'var(--text-muted)', fontSize: '14px' }}>
                <span className="no-more-text">End of Books</span>
              </div>
            )}
          </div>
        </section>

        <aside className="sidebar-right">
          <SidebarAd id="books-right-ad-1" />
          <SidebarAd id="books-right-ad-2" tall />
        </aside>
      </div>
    </main>
  );
}
