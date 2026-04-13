"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Search, Loader2, ArrowRight, BookOpen, AlertCircle, RefreshCw, X } from "lucide-react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchSeoPages } from "../lib/api";
import { cleanLabel } from "../lib/types";
import { LeaderboardAd, SidebarAd } from "../components/AdUnits";
import { trackFunnelStep } from "../lib/telemetry";
import { useScrollTracking } from "../hooks/useScrollTracking";

export default function ArticlesClient() {
  useScrollTracking("articles_list");
  const [mounted, setMounted] = useState(false);
  const [category, setCategory] = useState("ALL");
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
      fetchSeoPages(pageParam as number, 12, category !== "ALL" ? category : undefined, debouncedSearch || undefined),
    getNextPageParam: (lastPage, allPages) => {
      const moreExist = (lastPage.pages ?? []).length === 12;
      return moreExist ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1,
  });

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
        <LeaderboardAd id="articles-top-leaderboard" />
      </div>

      <div className="app-shell">
        <aside className="sidebar-left">
          <SidebarAd id="articles-left-ad-1" tall />
          <SidebarAd id="articles-left-ad-2" />
        </aside>

        <section className="feed-main" id="articles-feed">
          <div className="feed-header">
            <div className="feed-title-row">
              <div>
                <h1 className="feed-title">Latest Guides</h1>
                <p className="feed-subtitle">Syllabus, analysis, and preparation strategies.</p>
              </div>
            </div>

            <div className="feed-search-wrap" style={{ marginTop: '16px' }}>
              <div className="search-bar" style={{ maxWidth: '100%', width: '100%' }}>
                <Search className="search-icon" size={16} color="var(--text-muted)" />
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search articles, syllabus or guides..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ fontSize: '15px' }}
                />
                {search && (
                  <button className="search-clear-btn" onClick={() => setSearch("")} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: '4px' }}>
                    <X size={16} color="var(--text-muted)" />
                  </button>
                )}
              </div>
            </div>
          </div>

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
              <h3>No articles found</h3>
              <p>Try adjusting your search or category filters.</p>
              <button className="btn btn-primary" onClick={() => { setSearch(""); setCategory("ALL"); }}>
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="latest-articles-list" style={{ marginTop: '20px' }}>
              {allArticles.map(article => (
                <Link 
                  key={article.id} 
                  href={`/${article.slug}`} 
                  className="article-list-item"
                  onClick={() => trackFunnelStep('article_discovery_click', {
                    article_id: article.id,
                    article_slug: article.slug,
                    article_title: article.title
                  })}
                >
                  <div className="article-list-content">
                    <h4 className="article-list-title">{article.title}</h4>
                    <div className="article-list-meta">
                      <span className="article-list-tag">{cleanLabel(article.category || "") || "Guide"}</span>
                      {article.updatedAt && (
                        <span className="article-list-date">
                          Updated {new Date(article.updatedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                      )}
                    </div>
                  </div>
                  <ArrowRight size={18} className="article-list-arrow" />
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
              <div className="no-more-footer">
                <div className="no-more-line" />
                <span className="no-more-text">End of Articles</span>
                <div className="no-more-line" />
              </div>
            )}
          </div>
        </section>

        <aside className="sidebar-right">
          <SidebarAd id="articles-right-ad-1" />
          <SidebarAd id="articles-right-ad-2" tall />
        </aside>
      </div>
    </main>
  );
}
