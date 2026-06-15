"use client";

import { useState, useEffect, useMemo } from "react";
import { ChevronDown, RefreshCw, Zap, Search, X, Layers, Filter, Wrench } from "lucide-react";
import { Exam, enumToSlug } from "../lib/types";
import { ExamCategory, ExamStatus } from "../lib/enums";
import { fetchExamsFromAPI } from "../lib/api";
import { InFeedAd } from "./AdUnits";
import { ADS_CONFIG } from "../config/ads";
import { ExamListRow, SkeletonRow } from "./ExamCard";
import { trackFunnelStep } from "../lib/telemetry";
import { useScrollTracking } from "../hooks/useScrollTracking";
import { useInfiniteQuery } from "@tanstack/react-query";
import Link from "next/link";

interface Props {
  title: string;
  category?: string;
  status?: string;
  conductingBody?: string;
  state?: string;
  startDate?: string;
  endDate?: string;
}

const SIDEBAR_CATEGORIES = [
  { value: "ALL", label: "All Exams", icon: "🏛️" },
  { value: ExamCategory.UPSC, label: "UPSC", icon: "⚖️" },
  { value: ExamCategory.SSC, label: "SSC", icon: "📋" },
  { value: ExamCategory.RAILWAY_JOBS, label: "Railway", icon: "🚂" },
  { value: ExamCategory.BANKING_JOBS, label: "Banking", icon: "🏦" },
  { value: ExamCategory.DEFENCE_JOBS, label: "Defence", icon: "🪖" },
  { value: ExamCategory.POLICE_JOBS, label: "Police", icon: "👮" },
  { value: ExamCategory.TEACHING_ELIGIBILITY, label: "Teaching", icon: "📚" },
  { value: ExamCategory.STATE_PSC, label: "State PSC", icon: "🏛️" },
];

const SIDEBAR_STATUSES = [
  { value: "ALL", label: "All Statuses" },
  { value: ExamStatus.REGISTRATION_OPEN, label: "Registration Open" },
  { value: ExamStatus.NOTIFICATION, label: "Notification" },
  { value: ExamStatus.ADMIT_CARD_OUT, label: "Admit Card Out" },
  { value: ExamStatus.EXAM_ONGOING, label: "Ongoing" },
  { value: ExamStatus.RESULT_DECLARED, label: "Result Declared" },
  { value: ExamStatus.REGISTRATION_CLOSED, label: "Closed" },
];

export default function ExamListingClient({ title, category, status, conductingBody, state, startDate, endDate }: Props) {
  useScrollTracking(`list:${title}`);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      if (searchQuery) {
        trackFunnelStep('discovery_search', { query: searchQuery, context: title });
      }
    }, 800);
    return () => clearTimeout(t);
  }, [searchQuery, title]);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ['exams', { category, status, conductingBody, state, startDate, endDate, search: debouncedSearch }],
    queryFn: ({ pageParam = 1 }) =>
      fetchExamsFromAPI(
        pageParam,
        10,
        category,
        status,
        debouncedSearch || undefined,
        conductingBody,
        state,
        startDate,
        endDate
      ),
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.exams.length === 10 ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1,
    staleTime: 1000 * 60 * 5,
  });

  const allExams = useMemo(() => data?.pages.flatMap(page => page.exams) ?? [], [data]);

  const feedItems = useMemo(() => {
    const AD_FREQUENCY = ADS_CONFIG.inFeedAdFrequency;
    const items: Array<{ type: "exam"; exam: Exam } | { type: "ad"; adIndex: number }> = [];
    allExams.forEach((exam, i) => {
      items.push({ type: "exam", exam });
      if (ADS_CONFIG.enableAds && ADS_CONFIG.placements.inFeedNativeAds && (i + 1) % AD_FREQUENCY === 0) {
        items.push({ type: "ad", adIndex: Math.floor(i / AD_FREQUENCY) });
      }
    });
    return items;
  }, [allExams]);

  return (
    <>
      <div className="wrap-home home-body" style={{ marginTop: '24px', marginBottom: '60px' }}>
        <div className="page-grid">

          {/* CONTENT COL */}
          <div className="content-col">

            {/* HEADER */}
            <div className="sh">
              <div className="sh-title">
                <span className="cat-tag">UPDATES</span> {title}
              </div>
              <div className="sh-link" style={{ color: 'var(--accent)' }}>
                {!isLoading && `${allExams.length} LISTINGS`}
              </div>
            </div>

            {/* SEARCH */}
            <div className="search-bar" role="search" style={{ marginBottom: '24px' }}>
              <Search size={15} color="var(--text-muted)" />
              <input
                type="search"
                placeholder={`Search ${title}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search within results"
                autoComplete="off"
                style={{ fontSize: '16px' }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  style={{ background: "none", border: "none", cursor: "pointer", display: "flex" }}
                  aria-label="Clear search"
                >
                  <X size={14} color="var(--text-muted)" />
                </button>
              )}
            </div>

            {/* EXAM LIST */}
            <div className="exam-list" role="list">
              {isLoading && allExams.length === 0 ? (
                [1, 2, 3, 4].map(n => <SkeletonRow key={n} />)
              ) : allExams.length === 0 ? (
                <div className="empty-state" style={{ padding: '40px 20px', textAlign: 'center', background: '#f9fafb', borderRadius: '4px', border: '1px solid var(--border)' }}>
                  <h2 className="empty-title" style={{ fontSize: '18px', fontWeight: 700, color: 'var(--ink)' }}>No exams found</h2>
                  <div className="empty-desc" style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '8px' }}>
                    No exams currently match these criteria. Check back later for updates.
                  </div>
                </div>
              ) : (
                <>
                  {feedItems.map((item, i) =>
                    item.type === "exam" ? (
                      <ExamListRow key={item.exam.id} exam={item.exam} />
                    ) : (
                      <InFeedAd key={`ad-${i}`} id={`infeed-ad-${item.adIndex}`} index={item.adIndex} />
                    )
                  )}

                  {hasNextPage && (
                    <div className="load-more-wrap" style={{ marginTop: '24px', display: 'flex', justifyContent: 'center' }}>
                      <button
                        className="btn btn-ghost btn-lg"
                        onClick={() => {
                          trackFunnelStep('discovery_load_more', { context: title });
                          fetchNextPage();
                        }}
                        disabled={isFetchingNextPage}
                        style={{ padding: '12px 24px', fontWeight: 700, fontSize: '14px' }}
                      >
                        {isFetchingNextPage ? (
                          <>
                            <RefreshCw size={15} className="spin-icon" style={{ marginRight: 8 }} /> Loading...
                          </>
                        ) : (
                          <>
                            <ChevronDown size={15} style={{ marginRight: 8 }} /> Load More
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

          </div>

          {/* SIDEBAR COL */}
          <div className="sidebar-col">

            {/* CATEGORIES WIDGET */}
            <div className="sw" style={{ marginTop: 0 }}>
              <div className="sw-head flex items-center gap-1.5">
                <Layers size={16} className="text-amber-500" /> Exam Categories
              </div>
              <div className="sw-body">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '8px' }}>
                  {SIDEBAR_CATEGORIES.map(({ value, label, icon }) => {
                    const isActive = (category || "ALL") === value;
                    const href = value === "ALL" ? "/all-exams" : `/c/${enumToSlug(value)}`;
                    return (
                      <Link
                        key={value}
                        href={href}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '8px 10px',
                          fontSize: '13px',
                          fontWeight: isActive ? 800 : 600,
                          borderRadius: '4px',
                          background: isActive ? 'var(--ink)' : '#f9fafb',
                          color: isActive ? '#fff' : 'var(--ink)',
                          border: '1px solid var(--border)',
                          textDecoration: 'none',
                          transition: 'all 0.2s'
                        }}
                      >
                        <span>{icon}</span>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* STATUSES WIDGET */}
            <div className="sw">
              <div className="sw-head flex items-center gap-1.5">
                <Filter size={16} className="text-blue-400" /> Recruitment Statuses
              </div>
              <div className="sw-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {SIDEBAR_STATUSES.map(({ value, label }) => {
                    const currentStatus = status || "ALL";
                    const isActive = currentStatus === value || (currentStatus.includes(',') && currentStatus.split(',').includes(value));
                    const href = value === "ALL" ? "/all-exams" : `/s/${enumToSlug(value)}`;
                    return (
                      <Link
                        key={value}
                        href={href}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 12px',
                          fontSize: '13.5px',
                          fontWeight: isActive ? 800 : 600,
                          borderRadius: '4px',
                          background: isActive ? 'rgba(124,58,237,0.08)' : 'transparent',
                          color: isActive ? 'var(--accent)' : 'var(--text2)',
                          border: isActive ? '1px solid var(--accent)' : '1px solid transparent',
                          textDecoration: 'none',
                          transition: 'all 0.2s'
                        }}
                      >
                        <span>{label}</span>
                        {isActive && <span style={{ fontSize: '11px', fontWeight: 800 }}>✔</span>}
                      </Link>
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
                  <Link href="/age-calculator" className="tool-btn">
                    <span className="tool-icon">📅</span>Age Calculator
                  </Link>
                  <Link href="/salary-calculator" className="tool-btn">
                    <span className="tool-icon">💰</span>Salary Calculator
                  </Link>
                  <Link href="/syllabus" className="tool-btn">
                    <span className="tool-icon">📚</span>Syllabus Maps
                  </Link>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </>
  );
}
