"use client";

import { useState, useEffect, useCallback } from "react";
import SiteNav from "./SiteNav";
import SiteFooter from "./SiteFooter";
import { ChevronDown, RefreshCw, Zap, Search, X } from "lucide-react";
import { Exam } from "../lib/types";
import { fetchExamsFromAPI } from "../lib/api";
import { LeftSidebar, RightSidebar } from "./Sidebars";
import { LeaderboardAd, InFeedAd } from "./AdUnits";
import { ADS_CONFIG } from "../config/ads";
import { ExamListRow, SkeletonRow } from "./ExamCard";

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
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery), 400);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const loadExams = useCallback(async (reset: boolean, pageNo?: number) => {
    setLoading(true);
    if (reset) setExams([]); // Clear stale data to show skeletons
    const reqPage = reset ? 1 : (pageNo ?? page);
    try {
      const result = await fetchExamsFromAPI(
        reqPage,
        10,
        category,
        status,
        debouncedSearch || undefined,
        conductingBody,
        state,
        startDate,
        endDate
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
  }, [category, status, debouncedSearch, page, conductingBody, state, startDate, endDate]);

  useEffect(() => {
    loadExams(true);
  }, [category, status, debouncedSearch, conductingBody, state, startDate, endDate]);

  const AD_FREQUENCY = ADS_CONFIG.inFeedAdFrequency;
  const feedItems: Array<{ type: "exam"; exam: Exam } | { type: "ad"; adIndex: number }> = [];
  exams.forEach((exam, i) => {
    feedItems.push({ type: "exam", exam });
    if (ADS_CONFIG.enableAds && ADS_CONFIG.placements.inFeedNativeAds && (i + 1) % AD_FREQUENCY === 0) {
      feedItems.push({ type: "ad", adIndex: Math.floor(i / AD_FREQUENCY) });
    }
  });

  return (
    <>

      <div className="leaderboard-wrap">
        <LeaderboardAd id="top-listing-leaderboard" />
      </div>

      <div className="app-shell">
        <LeftSidebar
          categoryFilter={category || "ALL"}
          setCategoryFilter={() => {
            // Optionally handle navigation here if we wanted the sidebar to work
          }}
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
                {!loading && `${exams.length} listings`}
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
            {loading && exams.length === 0 ? (
              [1, 2, 3, 4].map(n => <SkeletonRow key={n} />)
            ) : exams.length === 0 ? (
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

                {hasMore && (
                  <div className="load-more-wrap">
                    <button
                      className="btn btn-ghost btn-lg"
                      onClick={() => { setPage(p => p + 1); loadExams(false, page + 1); }}
                      disabled={loading}
                    >
                      {loading ? <><RefreshCw size={15} className="spin-icon" /> Loading...</> : <><ChevronDown size={15} /> Load More</>}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </main>

        <RightSidebar
          statusFilter={status || "ALL"}
          setStatusFilter={() => {
            // Optionally handle navigation here
          }}
        />
      </div>

      <div className="leaderboard-wrap">
        <LeaderboardAd id="bottom-listing-leaderboard" />
      </div>

    </>
  );
}
