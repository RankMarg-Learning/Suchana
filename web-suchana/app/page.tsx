"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import SiteNav from "./components/SiteNav";
import SiteFooter from "./components/SiteFooter";
import {
  Bell, BellRing, Search, Calendar, Briefcase, IndianRupee, UserCheck,
  FileText, Globe, ChevronDown, CheckCircle2, ArrowRight, Clock, Target,
  MapPin, Info, RefreshCw, Filter, Zap, Layers, TrendingUp, BookOpen, X,
} from "lucide-react";
import {
  Exam,
  STATUS_LABELS, STAGE_LABELS, CATEGORIES, STATUSES,
  cleanLabel, formatDate, getTotalVacancies, getStageState, countdownStr,
} from "./lib/types";
import { MOCK_EXAMS, fetchExamsFromAPI, getPersonalizedExams } from "./lib/api";
import { LeftSidebar, RightSidebar } from "./components/Sidebars";
import { LeaderboardAd, InFeedAd } from "./components/AdUnits";
import { ADS_CONFIG } from "./config/ads";

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  return (
    <div className={`status-badge status-${status}`}>
      <div className="status-dot" />
      {STATUS_LABELS[status] ?? cleanLabel(status)}
    </div>
  );
}

// ─── Exam List Row (clickable card linking to detail page) ────────────────────

function ExamListRow({ exam, now }: { exam: Exam; now: number }) {
  return (
    <Link
      href={`/exam/${exam.slug}`}
      className="exam-list-row"
      aria-label={`View ${exam.shortTitle ?? exam.title} details`}
    >
      {/* Left: Title & body */}
      <div className="exam-row-main">
        <div className="exam-row-tags">
          <span className={`exam-tag level-${(exam.examLevel ?? "national").toLowerCase()}`}>
            {cleanLabel(exam.examLevel)}
          </span>
          <span className={`exam-tag cat-${(exam.category ?? "").toLowerCase()}`}>
            {cleanLabel(exam.category)}
          </span>
          {exam.state && (
            <span className="exam-tag">
              <MapPin size={9} style={{ display: "inline", marginRight: 2 }} />{exam.state}
            </span>
          )}
        </div>
        <h2 className="exam-row-title">{exam.shortTitle ?? exam.title}</h2>
        <div className="exam-row-body">{exam.conductingBody}</div>
      </div>

      {/* Right: Status + arrow */}
      <div className="exam-row-right">
        <div className="status-container">
          <StatusBadge status={exam.status} />
        </div>
        <div className="exam-row-arrow">
          Details <ArrowRight size={14} />
        </div>
      </div>
    </Link>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <div className="skeleton-row">
      <div style={{ flex: 1 }}>
        <div className="skeleton" style={{ height: 14, width: "30%", marginBottom: 10 }} />
        <div className="skeleton" style={{ height: 20, width: "70%", marginBottom: 8 }} />
        <div className="skeleton" style={{ height: 12, width: "40%" }} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div className="skeleton" style={{ height: 12, width: 140 }} />
        <div className="skeleton" style={{ height: 12, width: 120 }} />
      </div>
      <div className="skeleton" style={{ height: 28, width: 130, borderRadius: 100 }} />
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function HomePage() {
  const [now, setNow] = useState(0);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setNow(Date.now());
    setMounted(true);
    const interval = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(interval);
  }, []);

  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
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
      const userId = typeof window !== "undefined" ? localStorage.getItem("@suchana_userId") : null;
      let result;

      if (userId && categoryFilter === "ALL" && statusFilter === "ALL" && !debouncedSearch) {
        result = await getPersonalizedExams(userId, reqPage, 10);
        // Fallback to normal fetch if no personalized exams returned
        if (!result.exams || result.exams.length === 0) {
          result = await fetchExamsFromAPI(reqPage, 10);
        }
      } else {
        result = await fetchExamsFromAPI(reqPage, 10,
          categoryFilter !== "ALL" ? categoryFilter : undefined,
          statusFilter !== "ALL" ? statusFilter : undefined,
          debouncedSearch || undefined
        );
      }

      if (reset) { setExams(result.exams ?? []); setPage(1); }
      else { setExams((prev) => [...prev, ...(result.exams ?? [])]); }
      setHasMore((result.exams ?? []).length === 10);
    } catch {
      let filtered = [...MOCK_EXAMS];
      if (categoryFilter !== "ALL") filtered = filtered.filter((e) => e.category === categoryFilter);
      if (statusFilter !== "ALL") filtered = filtered.filter((e) => e.status === statusFilter);
      if (debouncedSearch) {
        const q = debouncedSearch.toLowerCase();
        filtered = filtered.filter((e) =>
          e.title.toLowerCase().includes(q) ||
          e.conductingBody.toLowerCase().includes(q) ||
          (e.shortTitle?.toLowerCase().includes(q) ?? false)
        );
      }
      if (reset) { setExams(filtered); } else { setExams((prev) => [...prev, ...filtered]); }
      setHasMore(false);
    } finally { setLoading(false); }
  }, [categoryFilter, statusFilter, debouncedSearch, page]);

  useEffect(() => { loadExams(true); }, [categoryFilter, statusFilter, debouncedSearch]);

  // Insert in-feed ads based on global config
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
      <SiteNav />




      {/* Leaderboard Ad (Top) */}
      <div className="leaderboard-wrap">
        <LeaderboardAd id="top-leaderboard-ad" />
      </div>

      {/* ─── 3-column Shell ─── */}
      <div className="app-shell">
        <LeftSidebar
          categoryFilter={categoryFilter}
          setCategoryFilter={(v) => { setCategoryFilter(v); setPage(1); }}
        />

        {/* ─── Center Feed ─── */}
        <main className="feed-main" id="exams" aria-label="Government exam listings">
          {/* Feed Header */}
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

            {/* Search */}
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

          {/* Mid feed ad */}
          <LeaderboardAd id="feed-mid-leaderboard" />

          {/* Exam List */}
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
                    <ExamListRow key={item.exam.id} exam={item.exam} now={mounted ? now : 0} />
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
        </main>

        <RightSidebar statusFilter={statusFilter} setStatusFilter={setStatusFilter} />
      </div>

      {/* Leaderboard Ad (Bottom) */}
      <div className="leaderboard-wrap">
        <LeaderboardAd id="bottom-leaderboard-ad" />
      </div>

      <div className="divider" />
      <SiteFooter />
    </>
  );
}
