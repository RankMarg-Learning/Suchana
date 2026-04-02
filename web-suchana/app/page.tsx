"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Search, ChevronDown,
  Info, RefreshCw, Zap, X,
} from "lucide-react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { ExamListRow, SkeletonRow } from "./components/ExamCard";
import {
  Exam,
  CATEGORIES,
} from "./lib/types";
import { fetchExamsFromAPI } from "./lib/api";
import { LeftSidebar, RightSidebar } from "./components/Sidebars";
import { LeaderboardAd, InFeedAd } from "./components/AdUnits";
import { ADS_CONFIG } from "./config/ads";

export default function HomePage() {
  return (
    <Suspense fallback={<div className="loading-screen"><RefreshCw className="spin-icon" /></div>}>
      <HomePageContent />
    </Suspense>
  );
}



function HomePageContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams?.get("search") || "";

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery), 400);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status: queryStatus,
  } = useInfiniteQuery({
    queryKey: ["exams", categoryFilter, statusFilter, debouncedSearch],
    queryFn: ({ pageParam = 1 }) =>
      fetchExamsFromAPI(
        pageParam as number,
        10,
        categoryFilter !== "ALL" ? categoryFilter : undefined,
        statusFilter !== "ALL" ? statusFilter : undefined,
        debouncedSearch || undefined
      ),
    getNextPageParam: (lastPage, allPages) => {
      return (lastPage.exams ?? []).length === 10 ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1,
  });

  const exams = data?.pages.flatMap((page) => page.exams ?? []) ?? [];
  const loading = queryStatus === "pending";

  const AD_FREQUENCY = ADS_CONFIG.inFeedAdFrequency;
  const feedItems: Array<{ type: "exam"; exam: Exam } | { type: "ad"; adIndex: number }> = [];
  exams.forEach((exam, i) => {
    feedItems.push({ type: "exam", exam });
    if (ADS_CONFIG.enableAds && ADS_CONFIG.placements.inFeedNativeAds && (i + 1) % AD_FREQUENCY === 0) {
      feedItems.push({ type: "ad", adIndex: Math.floor(i / AD_FREQUENCY) });
    }
  });

  if (!mounted) return null;

  return (
    <main className="min-h-screen">
      {/* Leaderboard Ad (Top) */}
      <div className="leaderboard-wrap" style={{ marginTop: '20px' }}>
        <LeaderboardAd id="top-leaderboard-ad" />
      </div>

      <div className="app-shell">
        <LeftSidebar categoryFilter={categoryFilter} setCategoryFilter={setCategoryFilter} />
        <div className="feed-main" id="exams" aria-label="Government exam listings">
          <div className="feed-header">
            <div className="feed-title-row">
              <div>
                <div className="feed-label">
                  <Zap size={12} style={{ display: "inline", marginRight: 6 }} />
                  Live Exam Tracker
                </div>
                <h1 className="feed-title">
                  {categoryFilter !== "ALL"
                    ? `${CATEGORIES.find((c) => c.value === categoryFilter)?.label ?? ""} Exam Notifications`
                    : "Sarkari Naukri Notifications "}
                </h1>
              </div>
              <div className="feed-count">
                {!loading && `${exams.length} exam${exams.length !== 1 ? "s" : ""}`}
              </div>
            </div>

            <div className="feed-search-wrap">
              <div className="search-bar" role="search">
                <Search size={15} color="var(--text-muted)" />
                <input
                  type="search"
                  id="exam-search-input"
                  name="search"
                  placeholder="Search UPSC, SSC, Railway, Banking..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Search government exams"
                  autoComplete="off"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex" }} aria-label="Clear search">
                    <X size={14} color="var(--text-muted)" />
                  </button>
                )}
              </div>
            </div>
          </div>

          <LeaderboardAd id="feed-mid-leaderboard" />

          {loading ? (
            <div className="exam-list">
              {[1, 2, 3, 4].map((n) => <SkeletonRow key={n} />)}
            </div>
          ) : exams.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon"><Info size={48} color="var(--text-muted)" /></div>
              <div className="empty-title">No exams found</div>
              <div className="empty-desc">Try adjusting your filters or search query.</div>
            </div>
          ) : (
            <>
              <div className="exam-list" role="list" aria-label="Exam notifications">
                {(() => {
                  type DateItem = { type: "date"; date: string };
                  const groupedItems: Array<typeof feedItems[number] | DateItem> = [];
                  let lastDate = "";

                  feedItems.forEach((item, i) => {
                    if (item.type === "exam") {
                      const dateObj = new Date(item.exam.updatedAt || item.exam.createdAt || 0);
                      const examDate = dateObj.toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric"
                      });

                      if (examDate !== lastDate) {
                        groupedItems.push({ type: "date", date: examDate });
                        lastDate = examDate;
                      }
                    }
                    groupedItems.push(item);
                  });

                  return groupedItems.map((item, i) => {
                    if (item.type === "date") {
                      return <DateHeader key={`date-${item.date}`} date={item.date} />;
                    }
                    return item.type === "exam" ? (
                      <ExamListRow key={item.exam.id} exam={item.exam} />
                    ) : (
                      <InFeedAd key={`ad-${i}`} id={`infeed-ad-${item.adIndex}`} index={item.adIndex} />
                    );
                  });
                })()}
              </div>
              {hasNextPage && (
                <div className="load-more-wrap">
                  <button className="btn btn-ghost btn-lg" onClick={() => fetchNextPage()} disabled={isFetchingNextPage} id="load-more-btn">
                    {isFetchingNextPage ? <><RefreshCw size={15} className="spin-icon" /> Loading...</> : <><ChevronDown size={15} /> Load More Exams</>}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        <RightSidebar statusFilter={statusFilter} setStatusFilter={setStatusFilter} />
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .date-group-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin: 28px 0 8;
        }
        .date-group-line {
          flex: 1;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--border), transparent);
        }
        .date-group-label {
          font-size: 11px;
          font-weight: 800;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 2px;
          padding: 0 16px;
          background: var(--bg-primary);
        }
      `}} />

      <div className="leaderboard-wrap">
        <LeaderboardAd id="bottom-leaderboard-ad" />
      </div>
    </main>
  );
}

function DateHeader({ date }: { date: string }) {
  const now = new Date();
  const todayStr = now.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  now.setDate(now.getDate() - 1);
  const yesterdayStr = now.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

  let label = date;
  if (date === todayStr) label = "Today";
  else if (date === yesterdayStr) label = " Yesterday";

  return (
    <div className="date-group-header">
      <div className="date-group-line" />
      <span className="date-group-label">{label}</span>
      <div className="date-group-line" />
    </div>
  );
}

