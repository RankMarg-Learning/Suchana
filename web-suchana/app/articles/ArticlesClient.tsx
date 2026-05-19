"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { 
  Search, 
  BookOpen, 
  AlertCircle, 
  RefreshCw, 
  X, 
  Wrench,
  Compass,
  Bell,
  CreditCard,
  Trophy,
  Key,
  BarChart2,
  Coins,
  Calendar,
  FileText
} from "lucide-react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchSeoPages } from "../lib/api";
import { cleanLabel } from "../lib/types";
import { trackFunnelStep } from "../lib/telemetry";
import { useScrollTracking } from "../hooks/useScrollTracking";

const SIDEBAR_CATEGORIES = [
  { value: "ALL", label: "All Articles", IconComponent: Compass, colorClass: "text-blue-500" },
  { value: "NOTIFICATION", label: "Notification", IconComponent: Bell, colorClass: "text-purple-500" },
  { value: "ADMIT_CARD", label: "Admit Card", IconComponent: CreditCard, colorClass: "text-amber-500" },
  { value: "RESULT", label: "Result", IconComponent: Trophy, colorClass: "text-emerald-500" },
  { value: "ANSWER_KEY", label: "Answer Key", IconComponent: Key, colorClass: "text-rose-500" },
  { value: "CUTOFF", label: "Cutoff Marks", IconComponent: BarChart2, colorClass: "text-cyan-500" },
  { value: "SYLLABUS", label: "Exam Syllabus", IconComponent: BookOpen, colorClass: "text-indigo-500" },
  { value: "SALARY", label: "Salary Details", IconComponent: Coins, colorClass: "text-green-500" }
];

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

  const allArticles = data?.pages.flatMap(p => p.pages ?? []) ?? [];

  if (!mounted) {
    return (
      <div className="wrap-home" style={{ marginTop: '24px', marginBottom: '60px', opacity: 0.2 }}>
        <div className="page-grid">
          <div className="content-col">
            <div className="skeleton" style={{ height: '40px', width: '250px', marginBottom: '24px' }} />
            <div className="skeleton" style={{ height: '46px', width: '100%', marginBottom: '24px' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="skeleton" style={{ height: '120px', width: '100%', borderRadius: '4px' }} />
              ))}
            </div>
          </div>
          <div className="sidebar-col">
            <div className="skeleton" style={{ height: '300px', width: '100%', borderRadius: '4px' }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="wrap-home" style={{ marginTop: '24px', marginBottom: '60px' }}>
      <div className="page-grid">
        
        {/* CONTENT COLUMN */}
        <div className="content-col">
          
          {/* HEADER */}
          <div className="sh">
            <div className="sh-title">
              <span className="cat-tag">KNOWLEDGE HUB</span> Latest Articles &amp; Guides
            </div>
            <div className="sh-link" style={{ color: 'var(--accent)' }}>
              {!isFetching && `${allArticles.length} ARTICLES`}
            </div>
          </div>

          {/* SEARCH */}
          <div className="search-bar" role="search" style={{ marginBottom: '24px' }}>
            <Search size={15} color="var(--text-muted)" />
            <input
              type="search"
              placeholder="Search articles, syllabus or guides..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search within results"
              autoComplete="off"
              style={{ fontSize: '16px' }}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                style={{ background: "none", border: "none", cursor: "pointer", display: "flex" }}
                aria-label="Clear search"
              >
                <X size={14} color="var(--text-muted)" />
              </button>
            )}
          </div>

          {/* ARTICLES FEED */}
          {status === "pending" ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="skeleton" style={{ height: '120px', width: '100%', borderRadius: '4px' }} />
              ))}
            </div>
          ) : allArticles.length === 0 ? (
            <div className="empty-state" style={{ padding: '40px 20px', textAlign: 'center', background: '#f9fafb', borderRadius: '4px', border: '1px solid var(--border)' }}>
              <AlertCircle size={40} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
              <h2 className="empty-title" style={{ fontSize: '18px', fontWeight: 700, color: 'var(--ink)' }}>No articles found</h2>
              <div className="empty-desc" style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '8px', marginBottom: '16px' }}>
                No articles currently match these criteria. Try adjusting your filters.
              </div>
              <button className="btn btn-ghost" onClick={() => { setSearch(""); setCategory("ALL"); }}>
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="articles-grid" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {allArticles.map((article) => (
                <Link
                  key={article.id}
                  href={`/${article.slug}`}
                  className="art-wide"
                  style={{ textDecoration: 'none' }}
                  onClick={() => trackFunnelStep('article_discovery_click', {
                    article_id: article.id,
                    article_slug: article.slug,
                    article_title: article.title
                  })}
                >
                  <div className="aw-thumb" style={{ minHeight: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#faf5ff', borderRight: '1px solid var(--border)', color: 'var(--accent)', padding: '24px' }}>
                    <FileText size={32} />
                  </div>
                  <div className="aw-body" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 800,
                      color: 'var(--accent)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      {cleanLabel(article.category || "Guide")}
                    </span>
                    <h3 style={{
                      fontFamily: 'var(--hd)',
                      fontSize: '18px',
                      fontWeight: 800,
                      color: 'var(--ink)',
                      margin: 0,
                      lineHeight: 1.3
                    }}>
                      {article.title}
                    </h3>
                    {article.updatedAt && (
                      <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                        Updated: {new Date(article.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* INFINITE SCROLL LOADER */}
          <div ref={loadMoreRef} className="load-more-trigger" style={{ marginTop: '24px' }}>
            {isFetchingNextPage && (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '12px' }}>
                <RefreshCw size={20} className="spin-icon text-purple-600" />
              </div>
            )}
            {!hasNextPage && allArticles.length > 0 && (
              <div className="no-more-footer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginTop: '32px' }}>
                <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>End of Articles</span>
                <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
              </div>
            )}
          </div>

        </div>

        {/* SIDEBAR COLUMN */}
        <div className="sidebar-col">
          
          {/* CATEGORIES WIDGET */}
          <div className="sw" style={{ marginTop: 0 }}>
            <div className="sw-head flex items-center gap-1.5">
              <BookOpen size={16} className="text-amber-500" /> Article Types
            </div>
            <div className="sw-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {SIDEBAR_CATEGORIES.map(({ value, label, IconComponent, colorClass }) => {
                  const isActive = category === value;
                  return (
                    <button
                      key={value}
                      onClick={() => {
                        setCategory(value);
                        trackFunnelStep('article_category_change', { category: value });
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        width: '100%',
                        padding: '10px 12px',
                        fontSize: '13.5px',
                        fontWeight: isActive ? 800 : 600,
                        borderRadius: '4px',
                        background: isActive ? 'rgba(124,58,237,0.08)' : 'transparent',
                        color: isActive ? 'var(--accent)' : 'var(--text2)',
                        border: isActive ? '1px solid var(--accent)' : '1px solid transparent',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        textAlign: 'left'
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <IconComponent size={16} className={colorClass} />
                        <span>{label}</span>
                      </span>
                      {isActive && <span style={{ fontSize: '11px', fontWeight: 800 }}>✔</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* QUICK TOOLS */}
          <div className="sw">
            <div className="sw-head flex items-center gap-1.5">
              <Wrench size={16} className="text-purple-400" /> Aspirant Toolset
            </div>
            <div className="sw-body">
              <div className="tool-grid" style={{ gridTemplateColumns: '1fr' }}>
                <Link href="/age-calculator" className="tool-btn" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px', textDecoration: 'none' }}>
                  <span className="tool-icon" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Calendar size={18} />
                  </span>
                  Age Calculator
                </Link>
                <Link href="/salary-calculator" className="tool-btn" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px', textDecoration: 'none' }}>
                  <span className="tool-icon" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Coins size={18} />
                  </span>
                  Salary Calculator
                </Link>
                <Link href="/syllabus" className="tool-btn" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px', textDecoration: 'none' }}>
                  <span className="tool-icon" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    <BookOpen size={18} />
                  </span>
                  Syllabus Maps
                </Link>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
