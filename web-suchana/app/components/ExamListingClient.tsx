"use client";

import { useState, useEffect, useMemo } from "react";
import SiteNav from "./SiteNav";
import SiteFooter from "./SiteFooter";
import { ChevronDown, RefreshCw, Zap, Search, X } from "lucide-react";
import { Exam } from "../lib/types";
import { fetchExamsFromAPI } from "../lib/api";
import { LeftSidebar, RightSidebar } from "./Sidebars";
import { LeaderboardAd, InFeedAd } from "./AdUnits";
import { ADS_CONFIG } from "../config/ads";
import { ExamListRow, SkeletonRow } from "./ExamCard";
import { trackFunnelStep } from "../lib/telemetry";
import { useScrollTracking } from "../hooks/useScrollTracking";
import { useInfiniteQuery } from "@tanstack/react-query";

interface Props {
  title: string;
  category?: string;
  status?: string;
  conductingBody?: string;
  state?: string;
  startDate?: string;
  endDate?: string;
}

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
    isFetching,
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
    // Add staleTime to prevent unnecessary background refetches for static content
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
      <div className="leaderboard-wrap">
        <LeaderboardAd id="top-listing-leaderboard" />
      </div>

      <div className="app-shell">
        <LeftSidebar
          categoryFilter={category || "ALL"}
          setCategoryFilter={() => {}}
        />

        <main className="feed-main" aria-label={`Exam listings for ${title}`}>
          <div className="feed-header">
            <div className="feed-title-row">
              <div>
                <div className="feed-label">
                  <Zap size={12} style={{ display: "inline", marginRight: 6 }} />
                  Live Updates
                </div>
                <h1 className="feed-title">{title}</h1>
              </div>
              <div className="feed-count">
                {!isLoading && `${allExams.length} listings`}
              </div>
            </div>

            <div className="feed-search-wrap">
              <div className="search-bar" role="search">
                <Search size={15} color="var(--text-muted)" />
                <input
                  type="search"
                  placeholder={`Search ${title}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Search within results"
                  autoComplete="off"
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
            </div>
          </div>

          <div className="exam-list" role="list">
            {isLoading && allExams.length === 0 ? (
              [1, 2, 3, 4].map(n => <SkeletonRow key={n} />)
            ) : allExams.length === 0 ? (
              <div className="empty-state">
                <h2 className="empty-title">No exams found</h2>
                <div className="empty-desc">No exams currently match these criteria. Check back later for updates.</div>
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
                  <div className="load-more-wrap">
                    <button
                      className="btn btn-ghost btn-lg"
                      onClick={() => { 
                        trackFunnelStep('discovery_load_more', { context: title });
                        fetchNextPage();
                      }}
                      disabled={isFetchingNextPage}
                    >
                      {isFetchingNextPage ? <><RefreshCw size={15} className="spin-icon" /> Loading...</> : <><ChevronDown size={15} /> Load More</>}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </main>

        <RightSidebar
          statusFilter={status || "ALL"}
          setStatusFilter={() => {}}
        />
      </div>

      <div className="leaderboard-wrap">
        <LeaderboardAd id="bottom-listing-leaderboard" />
      </div>
    </>
  );
}
