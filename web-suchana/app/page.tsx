"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Search, ChevronDown, 
  Info, RefreshCw, Zap, X,
} from "lucide-react";
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

  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery), 400);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const loadExams = useCallback(async (reset: boolean, pageNo?: number) => {
    setLoading(true);
    const reqPage = reset ? 1 : (pageNo ?? page);
    try {
      const result = await fetchExamsFromAPI(reqPage, 10,
        categoryFilter !== "ALL" ? categoryFilter : undefined,
        statusFilter !== "ALL" ? statusFilter : undefined,
        debouncedSearch || undefined
      );

      if (reset) { 
        setExams(result.exams ?? []); 
        setPage(1); 
      } else { 
        setExams((prev) => [...prev, ...(result.exams ?? [])]); 
      }
      setHasMore((result.exams ?? []).length === 10);
    } catch (err) {
      console.error("Failed to load exams:", err);
      if (reset) setExams([]);
      setHasMore(false);
    } finally { 
      setLoading(false); 
    }
  }, [categoryFilter, statusFilter, debouncedSearch, page]);

  useEffect(() => { 
    loadExams(true); 
  }, [categoryFilter, statusFilter, debouncedSearch]);

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
        <LeftSidebar
          categoryFilter={categoryFilter}
          setCategoryFilter={(v) => { setCategoryFilter(v); setPage(1); }}
        />

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

          {loading && exams.length === 0 ? (
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
                {feedItems.map((item, i) =>
                  item.type === "exam" ? (
                    <ExamListRow key={item.exam.id} exam={item.exam} />
                  ) : (
                    <InFeedAd key={`ad-${i}`} id={`infeed-ad-${item.adIndex}`} index={item.adIndex} />
                  )
                )}
              </div>
              {hasMore && (
                <div className="load-more-wrap">
                  <button className="btn btn-ghost btn-lg" onClick={() => { setPage((p) => p + 1); loadExams(false, page + 1); }} disabled={loading} id="load-more-btn">
                    {loading ? <><RefreshCw size={15} className="spin-icon" /> Loading...</> : <><ChevronDown size={15} /> Load More Exams</>}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        <RightSidebar statusFilter={statusFilter} setStatusFilter={setStatusFilter} />
      </div>

      <div className="leaderboard-wrap">
        <LeaderboardAd id="bottom-leaderboard-ad" />
      </div>
    </main>
  );
}
