"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Search, Loader2, ArrowRight, Book, AlertCircle, X, Flame, TrendingUp, Bell, Wrench, RefreshCw, CheckCircle2 } from "lucide-react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { fetchSeoPages, fetchTrendingContent } from "../lib/api";
import { cleanLabel, enumToSlug } from "../lib/types";
import { LeaderboardAd, SidebarAd } from "./AdUnits";
import { SeoPageCategory } from "../lib/enums";

interface CategoryFeedClientProps {
  category: SeoPageCategory;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  trendingTitle: string;
  searchPlaceholder: string;
}

export default function CategoryFeedClient({
  category,
  title,
  subtitle,
  icon,
  trendingTitle,
  searchPlaceholder
}: CategoryFeedClientProps) {
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Newsletter state
  const [newsletterState, setNewsletterState] = useState<"idle" | "loading" | "done">("idle");
  const [newsletterEmail, setNewsletterEmail] = useState("");

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

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setNewsletterState("loading");
    await new Promise((r) => setTimeout(r, 1200));
    setNewsletterState("done");
  };

  if (!mounted) return (
    <div className="home-body min-h-screen">
      <div className="wrap-home" style={{ marginTop: '20px' }}>
        <div className="ad-leader animate-pulse" style={{ height: '90px', background: 'var(--border)' }} />
      </div>
      <div className="wrap-home">
        <div className="page-grid animate-pulse" style={{ opacity: 0.15 }}>
          <div className="content-col">
            <div className="sh">
              <div className="skeleton" style={{ height: '36px', width: '40%', borderRadius: '4px' }} />
            </div>
            <div className="skeleton" style={{ height: '42px', borderRadius: '4px', marginBottom: '24px' }} />
            <div className="article-skeleton-list">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="article-skeleton-item" style={{ padding: '20px 8px', borderBottom: '1px solid var(--border)' }}>
                  <div className="skeleton" style={{ height: '24px', width: '70%', borderRadius: '4px', marginBottom: '12px' }} />
                  <div className="skeleton" style={{ height: '14px', width: '40%', borderRadius: '4px' }} />
                </div>
              ))}
            </div>
          </div>
          <div className="sidebar-col">
            <div className="sw" style={{ height: '200px', border: '1px solid var(--border)' }}>
              <div className="sw-head flex items-center gap-1.5">
                <div className="skeleton" style={{ height: '16px', width: '120px' }} />
              </div>
              <div className="sw-body">
                <div className="skeleton" style={{ height: '100px' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const allArticles = data?.pages.flatMap(p => p.pages ?? []) ?? [];

  return (
    <div className="home-body min-h-screen">
      <div className="wrap-home">
        <div className="page-grid">

          {/* CONTENT COLUMN */}
          <div className="content-col">

            {/* SECTION HEADER BLOCK */}
            <div style={{ marginBottom: '24px', position: 'relative' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'nowrap', gap: '16px', minHeight: '40px' }}>

                  {/* TITLE AREA (hides when search expands) */}
                  <div style={{
                    display: isSearchFocused || search ? 'none' : 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    flex: 1,
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: '40px', height: '40px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, var(--gold), var(--violet))',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white',
                      flexShrink: 0
                    }}>
                      <span style={{ transform: 'scale(0.9)' }}>{icon}</span>
                    </div>
                    <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', fontWeight: 700, letterSpacing: '1.2px', color: 'var(--violet)', textTransform: 'uppercase', marginBottom: '4px' }}>
                        {category.replace(/_/g, ' ')}
                      </div>
                      <h1 style={{ fontFamily: 'var(--hd)', fontSize: '24px', fontWeight: 800, color: 'var(--ink)', lineHeight: 1.1, letterSpacing: '-0.02em', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {title}
                      </h1>
                    </div>
                  </div>

                  {/* SEARCH BAR (EXPANDABLE) */}
                  <div style={{
                    background: '#fff',
                    borderRadius: '12px',
                    padding: '4px 8px',
                    display: 'flex',
                    alignItems: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    flex: isSearchFocused || search ? 1 : '0 0 auto',
                    width: isSearchFocused || search ? '100%' : '40px',
                    height: '40px',
                    cursor: isSearchFocused || search ? 'text' : 'pointer'
                  }}
                    onClick={() => {
                      if (!isSearchFocused && !search) {
                        document.getElementById('category-search-input')?.focus();
                      }
                    }}
                  >
                    <div style={{ padding: isSearchFocused || search ? '0 8px 0 4px' : '0', display: 'flex', alignItems: 'center', color: 'var(--text-muted)', margin: isSearchFocused || search ? '0' : '0 auto' }}>
                      <Search size={18} />
                    </div>
                    <input
                      id="category-search-input"
                      type="search"
                      placeholder={isSearchFocused || search ? searchPlaceholder : ""}
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      onFocus={() => setIsSearchFocused(true)}
                      onBlur={() => setIsSearchFocused(false)}
                      aria-label="Search within results"
                      autoComplete="off"
                      style={{
                        flex: 1,
                        fontSize: '14px',
                        background: 'transparent',
                        border: 'none',
                        outline: 'none',
                        color: 'var(--ink)',
                        fontFamily: 'var(--body)',
                        width: isSearchFocused || search ? '100%' : '0px',
                        padding: isSearchFocused || search ? '0 8px' : '0',
                        opacity: isSearchFocused || search ? 1 : 0,
                        transition: 'all 0.3s'
                      }}
                    />
                    {search && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setSearch(""); }}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '4px',
                          color: 'var(--text-muted)'
                        }}
                        aria-label="Clear search"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>

                </div>

                {!(isSearchFocused || search) && subtitle && (
                  <p style={{ color: 'var(--text2)', fontSize: '14px', margin: '0', lineHeight: 1.5, maxWidth: '800px' }}>
                    {subtitle}
                  </p>
                )}
              </div>
            </div>

            {/* MAIN FEED LIST */}
            {status === "pending" ? (
              <div className="article-skeleton-list" style={{ marginTop: '20px' }}>
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="article-skeleton-item" style={{ padding: '20px 8px', borderBottom: '1px solid var(--border)' }}>
                    <div className="skeleton" style={{ height: '24px', width: '70%', borderRadius: '4px', marginBottom: '12px' }} />
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <div className="skeleton" style={{ height: '14px', width: '80px', borderRadius: '4px' }} />
                      <div className="skeleton" style={{ height: '14px', width: '120px', borderRadius: '4px' }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : allArticles.length === 0 ? (
              <div className="empty-state-container animate-fade-in" style={{ padding: '48px 0' }}>
                <div className="empty-state-card" >
                  <div className="empty-state-icon-wrapper" style={{ marginBottom: '16px' }}>
                    <Search size={42} className="empty-state-icon" style={{ color: 'var(--text3)' }} />
                  </div>
                  <h3 className="empty-state-title" style={{ fontFamily: 'var(--hd)', fontSize: '20px', fontWeight: 700, color: 'var(--ink)' }}>
                    No resources found
                  </h3>
                  <p className="empty-state-description" style={{ fontSize: '14px', color: 'var(--text2)', margin: '8px 0 20px', lineHeight: 1.5 }}>
                    We couldn't find any articles matching <span className="search-highlight" style={{ fontWeight: 700, color: 'var(--gold)' }}>"{debouncedSearch}"</span>.
                    Try adjusting your keywords or browse other categories.
                  </p>

                </div>
              </div>
            ) : (
              <div className="latest-articles-list" style={{ marginTop: '10px' }}>
                {allArticles.map(article => (
                  <Link
                    key={article.id}
                    href={`/${article.slug}`}
                    className="article-list-item"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '20px 8px',
                      borderBottom: '1px solid var(--border)',
                      textDecoration: 'none',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div className="article-list-content">
                      <h4
                        className="article-list-title"
                        style={{
                          fontFamily: 'var(--font-space-grotesk), sans-serif',
                          fontSize: '16px',
                          fontWeight: 700,
                          color: 'var(--ink)',
                          lineHeight: '1.4',
                          marginBottom: '6px'
                        }}
                      >
                        {article.title}
                      </h4>
                      {article.metaDescription && (
                        <p
                          style={{
                            fontSize: '13px',
                            color: 'var(--text2)',
                            marginTop: '4px',
                            marginBottom: '10px',
                            lineHeight: 1.5,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}
                        >
                          {article.metaDescription}
                        </p>
                      )}
                      <div className="article-list-meta" style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '11px', fontWeight: 600, color: 'var(--text3)' }}>
                        {article.category && (
                          <span
                            className="article-list-tag"
                            style={{
                              color: 'var(--sky)',
                              fontFamily: 'var(--mono)',
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px'
                            }}
                          >
                            {cleanLabel(article.category)}
                          </span>
                        )}
                        {article.updatedAt && (
                          <span className="article-list-date">
                            Updated {new Date(article.updatedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </span>
                        )}
                      </div>
                    </div>
                    <ArrowRight size={16} className="article-list-arrow" style={{ color: 'var(--text3)', transition: 'transform 0.2s', marginLeft: '16px', flexShrink: 0 }} />
                  </Link>
                ))}
              </div>
            )}

            {/* INFINITE SCROLL TRIGGER */}
            <div ref={loadMoreRef} className="load-more-trigger">
              {isFetchingNextPage && (
                <div className="article-skeleton-list" style={{ marginTop: '0' }}>
                  {[1, 2, 3].map(i => (
                    <div key={i} className="article-skeleton-item" style={{ padding: '20px 8px', borderBottom: '1px solid var(--border)' }}>
                      <div className="skeleton" style={{ height: '24px', width: '70%', borderRadius: '4px', marginBottom: '12px' }} />
                      <div className="skeleton" style={{ height: '14px', width: '40%', borderRadius: '4px' }} />
                    </div>
                  ))}
                </div>
              )}
              {!hasNextPage && allArticles.length > 0 && (
                <div className="no-more-footer" style={{ textAlign: 'center', margin: '40px 0', color: 'var(--text3)', fontSize: '13px', fontFamily: 'var(--mono)', letterSpacing: '0.5px' }}>
                  <span>END OF ARTICLES</span>
                </div>
              )}
            </div>

          </div>

          {/* SIDEBAR COLUMN */}
          <div className="sidebar-col">



            {/* TOPIC RESOURCES WIDGET */}
            <div className="sw" style={{ marginTop: 0 }}>
              <div className="sw-head flex items-center gap-1.5" style={{ fontFamily: 'var(--hd)', fontSize: '14px' }}>
                <Book size={16} className="text-amber-500" /> Content Categories
              </div>
              <div className="sw-body">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '8px' }}>
                  {[
                    { label: "Syllabus", slug: "syllabus" },
                    { label: "PYQ Papers", slug: "previous-year-papers" },
                    { label: "Exam Analysis", slug: "exam-analysis" },
                    { label: "Static GK", slug: "gk-static" },
                    { label: "Current Affairs", slug: "current-affairs" },
                    { label: "Prep Guides", slug: "preparation-guides" }
                  ].map((item) => {
                    const isActive = enumToSlug(category) === item.slug;
                    return (
                      <Link
                        key={item.slug}
                        href={`/topic/${item.slug}`}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '8px 10px',
                          fontSize: '13px',
                          fontWeight: isActive ? 800 : 600,
                          borderRadius: '4px',
                          background: isActive ? 'var(--ink)' : '#f9fafb',
                          color: isActive ? '#fff' : 'var(--ink)',
                          border: '1px solid var(--border)',
                          textDecoration: 'none',
                          transition: 'all 0.2s',
                          textAlign: 'center'
                        }}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>




            {/* ASPIRANT TOOLSET WIDGET */}
            <div className="sw">
              <div className="sw-head flex items-center gap-1.5" style={{ fontFamily: 'var(--hd)', fontSize: '14px' }}>
                <Wrench size={16} className="text-purple-400" /> Free Tools
              </div>
              <div className="sw-body">
                <div className="tool-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <Link href="/age-calculator" className="tool-btn" style={{ textDecoration: 'none', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', padding: '8px', border: '1px solid var(--border)', borderRadius: '4px', background: '#f9fafb', color: 'var(--ink)', fontWeight: 600 }}>
                    <span className="tool-icon">📅</span>Age Calc
                  </Link>
                  <Link href="/salary-calculator" className="tool-btn" style={{ textDecoration: 'none', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', padding: '8px', border: '1px solid var(--border)', borderRadius: '4px', background: '#f9fafb', color: 'var(--ink)', fontWeight: 600 }}>
                    <span className="tool-icon">💰</span>Salary Calc
                  </Link>
                  <Link href="/syllabus" className="tool-btn" style={{ textDecoration: 'none', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', padding: '8px', border: '1px solid var(--border)', borderRadius: '4px', background: '#f9fafb', color: 'var(--ink)', fontWeight: 600 }}>
                    <span className="tool-icon">📚</span>Syllabus
                  </Link>
                  <Link href="/all-exams" className="tool-btn" style={{ textDecoration: 'none', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', padding: '8px', border: '1px solid var(--border)', borderRadius: '4px', background: '#f9fafb', color: 'var(--ink)', fontWeight: 600 }}>
                    <span className="tool-icon">🏛️</span>All Exams
                  </Link>
                </div>
              </div>
            </div>


          </div>

        </div>
      </div>
    </div>
  );
}

