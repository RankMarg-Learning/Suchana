"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  Search, ChevronDown,
  Info, RefreshCw, Zap, X,
  TrendingUp, Award, Clock, ArrowRight,
  ShieldCheck, Globe, Library, Bell
} from "lucide-react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { ExamListRow, SkeletonRow } from "./components/ExamCard";
import {
  Exam,
  CATEGORIES,
} from "./lib/types";
import { fetchExamsFromAPI, fetchTrendingContent } from "./lib/api";
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
  const mainFeedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery), 400);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const { data: trendingData, isLoading: trendingLoading } = useQuery({
    queryKey: ["trending-content"],
    queryFn: fetchTrendingContent,
  });

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
        categoryFilter === "ALL" && statusFilter === "ALL" && !debouncedSearch ? 15 : 10,
        categoryFilter !== "ALL" ? categoryFilter : undefined,
        statusFilter !== "ALL" ? statusFilter : undefined,
        debouncedSearch || undefined
      ),
    getNextPageParam: (lastPage, allPages) => {
      const itemsPerPage = categoryFilter === "ALL" && statusFilter === "ALL" && !debouncedSearch ? 15 : 10;
      return (lastPage.exams ?? []).length === itemsPerPage ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1,
  });

  const exams = data?.pages.flatMap((page) => page.exams ?? []) ?? [];
  const loading = queryStatus === "pending";

  const scrollToFeed = () => {
    mainFeedRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleCategoryClick = (cat: string) => {
    setCategoryFilter(cat);
    scrollToFeed();
  };

  if (!mounted) return null;

  return (
    <main className="min-h-screen">
      {/* 1. Hero Section */}
      <section className="hero-modern">
        <div className="hero-bg">
          <div className="hero-orb hero-orb-1" />
          <div className="hero-orb hero-orb-2" />
        </div>
        
        <div className="container relative z-10">
          <div className="hero-content text-center max-w-4xl mx-auto">
            <div className="hero-badge-modern animate-fade-in">
              <span className="hero-badge-dot" />
              Real-time Exam Tracker
            </div>
            <h1 className="hero-title-modern animate-slide-up">
              India's Premier <span className="gradient-text">Government Exam</span> Tracker & Discovery Engine
            </h1>
            <p className="hero-desc-modern animate-slide-up delay-100">
              Track 1000+ exams across UPSC, SSC, Banking & Railways. Get direct official links for notifications, admit cards, and results.
            </p>

            <div className="hero-search-container animate-slide-up delay-200">
              <div className="hero-search-bar">
                <Search size={20} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search SSC CGL, UPSC CSE, RRB NTPC..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={scrollToFeed}
                />
                <button className="btn-hero-search">Search</button>
              </div>
              <div className="hot-access-bar">
                 <span className="hot-label">HOT:</span>
                 <div className="hot-pills">
                   <button onClick={() => {setSearchQuery("SSC CGL"); scrollToFeed();}}>SSC CGL</button>
                   <button onClick={() => {setSearchQuery("UPSC CSE"); scrollToFeed();}}>UPSC CSE</button>
                   <button onClick={() => {setSearchQuery("RRB NTPC"); scrollToFeed();}}>RRB NTPC</button>
                   <button onClick={() => {setSearchQuery("IBPS PO"); scrollToFeed();}}>IBPS PO</button>
                   <button onClick={() => {setSearchQuery("State PCS"); scrollToFeed();}}>State PCS</button>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Status Hub - Primary Lifecycle Portals */}
      <section className="status-hub-section">
        <div className="container">
          <div className="status-hub-grid">
            <Link href="/s/notification" className="status-hub-card">
              <div className="status-hub-icon bg-blue-soft text-blue"><Bell size={24} /></div>
              <div className="status-hub-info">
                <span className="hub-label">Recruitments</span>
                <h3 className="hub-title">Notifications</h3>
              </div>
              <ArrowRight size={18} className="hub-arrow" />
            </Link>

            <Link href="/s/admit-card-out" className="status-hub-card">
              <div className="status-hub-icon bg-orange-soft text-orange"><Zap size={24} /></div>
              <div className="status-hub-info">
                <span className="hub-label">Hall Tickets</span>
                <h3 className="hub-title">Admit Cards</h3>
              </div>
              <ArrowRight size={18} className="hub-arrow" />
            </Link>

            <Link href="/s/result-declared" className="status-hub-card">
              <div className="status-hub-icon bg-green-soft text-green"><Award size={24} /></div>
              <div className="status-hub-info">
                <span className="hub-label">Merit Lists</span>
                <h3 className="hub-title">Results</h3>
              </div>
              <ArrowRight size={18} className="hub-arrow" />
            </Link>

            <Link href="/s/exam-ongoing" className="status-hub-card">
              <div className="status-hub-icon bg-purple-soft text-purple"><Clock size={24} /></div>
              <div className="status-hub-info">
                <span className="hub-label">Live Tracker</span>
                <h3 className="hub-title">Ongoing</h3>
              </div>
              <ArrowRight size={18} className="hub-arrow" />
            </Link>
          </div>
        </div>
      </section>

      {/* 3. The Intelligence Grid (High-Density Informational Wall) */}
      <section className="section-modern bg-surface">
        <div className="container">
          <div className="intelligence-grid">
            {/* Column 1: Notifications */}
            <div className="intelligence-col">
               <div className="col-header">
                  <div className="col-title">
                    <Bell size={18} className="text-blue" />
                    Latest Notifications
                  </div>
                  <Link href="/s/notification" className="col-link text-blue">View All</Link>
               </div>
               <div className="col-content">
                  {loading ? [1,2,3,4,5].map(i => <div key={i} className="skeleton col-skeleton" />) : 
                    exams.filter(e => e.status === "NOTIFICATION").slice(0, 10).map(exam => (
                      <Link key={exam.id} href={`/exam/${exam.slug}`} className="intel-row">
                        <span className="intel-title">{exam.shortTitle || exam.title}</span>
                        <div className="intel-badges">
                           {new Date(exam.updatedAt || "").getTime() > Date.now() - 86400000 && <span className="badge-new">NEW</span>}
                        </div>
                      </Link>
                    ))
                  }
               </div>
            </div>

            {/* Column 2: Admit Cards */}
            <div className="intelligence-col">
               <div className="col-header">
                  <div className="col-title">
                    <Zap size={18} className="text-orange" />
                    Admit Cards
                  </div>
                  <Link href="/s/admit-card-out" className="col-link text-orange">View All</Link>
               </div>
               <div className="col-content">
                  {loading ? [1,2,3,4,5].map(i => <div key={i} className="skeleton col-skeleton" />) : 
                    exams.filter(e => ["ADMIT_CARD_OUT", "ADMIT_CARD_COMING_SOON"].includes(e.status)).slice(0, 10).map(exam => (
                      <Link key={exam.id} href={`/exam/${exam.slug}`} className="intel-row">
                        <span className="intel-title">{exam.shortTitle || exam.title}</span>
                        <div className="intel-badges">
                           <span className="badge-status-dot orange" />
                        </div>
                      </Link>
                    ))
                  }
               </div>
            </div>

            {/* Column 3: Results */}
            <div className="intelligence-col">
               <div className="col-header">
                  <div className="col-title">
                    <Award size={18} className="text-green" />
                    Results & Answers
                  </div>
                  <Link href="/s/result-declared" className="col-link text-green">View All</Link>
               </div>
               <div className="col-content">
                  {loading ? [1,2,3,4,5].map(i => <div key={i} className="skeleton col-skeleton" />) : 
                    exams.filter(e => ["RESULT_DECLARED", "ANSWER_KEY_OUT"].includes(e.status)).slice(0, 10).map(exam => (
                      <Link key={exam.id} href={`/exam/${exam.slug}`} className="intel-row">
                        <span className="intel-title">{exam.shortTitle || exam.title}</span>
                        <div className="intel-badges">
                           <span className="badge-status-dot green" />
                        </div>
                      </Link>
                    ))
                  }
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Regional Exam Discovery Hub (States) */}
      <section className="section-modern">
        <div className="container">
          <div className="section-header-modern">
             <div>
               <h2 className="section-title-modern">State-wise Discovery</h2>
               <p className="section-desc-modern">Find regional opportunities across major Indian states</p>
             </div>
             <Link href="/states" className="view-all-link">
               All States <ArrowRight size={14} />
             </Link>
          </div>

          <div className="states-discovery-grid">
            {[
              { name: "Uttar Pradesh", icon: "🏛️", slug: "uttar-pradesh" },
              { name: "Bihar", icon: "🌾", slug: "bihar" },
              { name: "Rajasthan", icon: "🏰", slug: "rajasthan" },
              { name: "Madhya Pradesh", icon: "🐅", slug: "madhya-pradesh" },
              { name: "Haryana", icon: "🚜", slug: "haryana" },
              { name: "Delhi", icon: "🚇", slug: "delhi" },
            ].map(state => (
              <div key={state.slug} className="state-intel-col">
                 <div className="state-header">
                   <span className="state-icon">{state.icon}</span>
                   <span className="state-name">{state.name}</span>
                 </div>
                 <div className="state-links">
                   {exams.filter(e => e.state === state.name).slice(0, 4).map(e => (
                     <Link key={e.id} href={`/exam/${e.slug}`} className="state-link-row">
                        {e.shortTitle || e.title.slice(0, 20) + "..."}
                     </Link>
                   ))}
                   <Link href={`/state/${state.slug}`} className="state-more-link">
                     View All in {state.name}
                   </Link>
                 </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Trending & Featured Section */}
      <section className="section-modern bg-surface">
        <div className="container">
          <div className="section-header-modern">
            <div className="flex items-center gap-3">
              <div className="icon-box-modern bg-indigo-soft">
                <TrendingUp size={20} className="text-indigo" />
              </div>
              <div>
                <h2 className="section-title-modern">Trending Notifications</h2>
                <p className="section-desc-modern">High-priority updates you shouldn't miss</p>
              </div>
            </div>
            <Link href="#exams" className="view-all-link" onClick={scrollToFeed}>
              View Tracker <ArrowRight size={14} />
            </Link>
          </div>

          <div className="trending-grid">
            {trendingLoading ? (
              [1, 2, 3].map(i => <div key={i} className="skeleton trending-skeleton" />)
            ) : (trendingData?.exams || []).slice(0, 3).map((exam) => (
              <Link key={exam.id} href={`/exam/${exam.slug}`} className="trending-card">
                <div className="trending-card-header">
                  <div className="trending-tag">{exam.category.replace('_', ' ')}</div>
                  <div className="trending-status-glow">
                    <span className="glow-dot" />
                    Live
                  </div>
                </div>
                <h3 className="trending-exam-title">{exam.title}</h3>
                <div className="trending-exam-body">
                   <div className="info-item">
                      <Clock size={12} />
                      Updated {new Date(exam.updatedAt || "").toLocaleDateString()}
                   </div>
                   <div className="info-item">
                      <Award size={12} />
                      {exam.conductingBody}
                   </div>
                </div>
                <div className="trending-card-footer">
                   <span className="learn-more">Get Lifecycle Updates</span>
                   <ArrowRight size={14} className="arrow-icon" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Explore Sections Grid (Better Interlinking) */}
      <section className="section-modern">
        <div className="container">
          <div className="section-header-modern text-center mx-auto max-w-2xl">
            <h2 className="section-title-modern">Explore Exams by Category</h2>
            <p className="section-desc-modern">Find opportunities in your field of expertise across India</p>
          </div>

          <div className="explore-grid-modern">
            {CATEGORIES.filter(c => c.value !== "ALL").map((cat) => (
              <button 
                key={cat.value} 
                className={`explore-tile ${categoryFilter === cat.value ? 'active' : ''}`}
                onClick={() => handleCategoryClick(cat.value)}
              >
                <div className="explore-tile-icon">{cat.icon}</div>
                <div className="explore-tile-content">
                  <h4 className="explore-tile-name">{cat.label}</h4>
                  <p className="explore-tile-desc">View Notifications</p>
                </div>
                <div className="explore-tile-arrow">
                  <ArrowRight size={16} />
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Trending News & Guides */}
      <section className="section-modern bg-surface">
        <div className="container">
          <div className="section-header-modern">
             <div>
               <h2 className="section-title-modern">Editorial & Preparation Guides</h2>
               <p className="section-desc-modern">Expert strategies and latest news for your target exams</p>
             </div>
             <Link href="/articles" className="view-all-link">
               Read All Guides <ArrowRight size={14} />
             </Link>
          </div>

          <div className="news-grid-modern">
            {trendingLoading ? (
               [1, 2, 3, 4].map(i => <div key={i} className="skeleton news-skeleton" />)
            ) : (trendingData?.articles || []).slice(0, 4).map((page) => (
              <Link key={page.id} href={`/${page.slug}`} className="news-card-modern">
                <div className="news-card-tag">{page.category?.replace(/_/g, ' ') || 'GUIDE'}</div>
                <h3 className="news-card-title">{page.title}</h3>
                <div className="news-card-footer">
                   <span>{new Date(page.createdAt || "").toLocaleDateString()}</span>
                   <div className="dot" />
                   <span className="read-time">5 min read</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* 4. Live Exam Feed (Traditional functionality with Premium Styling) */}
      <section className="section-modern bg-secondary-modern" ref={mainFeedRef} id="exams">
        <div className="container">
          <div className="app-shell-modern">
            <div className="feed-main-modern">
               <div className="feed-header-modern">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="feed-section-title">
                        <Zap size={20} className="inline mr-2 text-yellow" />
                        Live Exam Tracker
                      </h2>
                      <p className="text-muted text-sm font-medium mt-1">
                        {exams.length > 0 ? `Showing ${exams.length} active notifications` : 'Checking for latest updates...'}
                      </p>
                    </div>
                    {categoryFilter !== "ALL" && (
                      <button 
                        className="btn-clear-filter"
                        onClick={() => setCategoryFilter("ALL")}
                      >
                         <X size={14} /> Clear {categoryFilter.replace('_', ' ')}
                      </button>
                    )}
                  </div>
               </div>

               {loading ? (
                <div className="exam-list">
                  {[1, 2, 3, 4, 5].map((n) => <SkeletonRow key={n} />)}
                </div>
              ) : exams.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon"><Info size={48} color="var(--text-muted)" /></div>
                  <div className="empty-title">No notifications found</div>
                  <div className="empty-desc">Try clearing filters or search query.</div>
                </div>
              ) : (
                <>
                  <div className="exam-list-modern">
                    {(() => {
                      type DateItem = { type: "date"; date: string };
                      const feedItems: Array<{ type: "exam"; exam: Exam } | { type: "ad"; adIndex: number }> = [];
                      const AD_FREQUENCY = ADS_CONFIG.inFeedAdFrequency;
                      
                      exams.forEach((exam, i) => {
                        feedItems.push({ type: "exam", exam });
                        if (ADS_CONFIG.enableAds && ADS_CONFIG.placements.inFeedNativeAds && (i + 1) % AD_FREQUENCY === 0) {
                          feedItems.push({ type: "ad", adIndex: Math.floor(i / AD_FREQUENCY) });
                        }
                      });

                      const groupedItems: Array<typeof feedItems[number] | DateItem> = [];
                      let lastDate = "";

                      feedItems.forEach((item) => {
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
                    <div className="load-more-wrap mt-12 text-center">
                      <button className="btn btn-ghost btn-lg" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
                        {isFetchingNextPage ? <><RefreshCw size={18} className="spin-icon mr-2" /> Loading...</> : <><ChevronDown size={18} className="mr-2" /> Discover More Recommendations</>}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
            
            <aside className="sidebar-modern">
               <div className="sticky-sidebar">
                  <RightSidebar statusFilter={statusFilter} setStatusFilter={setStatusFilter} />
                  <div className="mt-8">
                     <LeaderboardAd id="sidebar-ad" />
                  </div>
               </div>
            </aside>
          </div>
        </div>
      </section>

      {/* 5. Benefits / Why Us */}
      <section className="section-modern bg-indigo-dark text-white overflow-hidden">
         <div className="hero-bg op-20">
            <div className="hero-orb hero-orb-1 bg-white" />
         </div>
         <div className="container relative z-10">
            <div className="grid md:grid-cols-3 gap-12">
               <div className="benefit-card">
                  <div className="benefit-icon"><Library size={24} /></div>
                  <h3 className="benefit-title">1000+ Exam Library</h3>
                  <p className="benefit-text">The most exhaustive database of Indian government exams categorized and searchable.</p>
               </div>
               <div className="benefit-card">
                  <div className="benefit-icon"><Globe size={24} /></div>
                  <h3 className="benefit-title">Real-time Syncing</h3>
                  <p className="benefit-text">Direct integration with official portals ensures you get notifications before anywhere else.</p>
               </div>
               <div className="benefit-card">
                  <div className="benefit-icon"><ShieldCheck size={24} /></div>
                  <h3 className="benefit-title">Verified Official Links</h3>
                  <p className="benefit-text">No misleading ads. Every notification includes direct, verified links to official application portals.</p>
               </div>
            </div>
         </div>
      </section>

      <style jsx global>{`
        /* ─── Hero Modern ─── */
        .hero-modern {
          position: relative;
          padding: 140px 0 100px;
          background: var(--bg-primary);
          overflow: hidden;
        }

        .hero-bg {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .hero-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.15;
        }

        .hero-orb-1 {
          width: 500px;
          height: 500px;
          background: var(--accent);
          top: -200px;
          right: -100px;
          animation: orb-float 20s infinite alternate;
        }

        .hero-orb-2 {
          width: 400px;
          height: 400px;
          background: #3b82f6;
          bottom: -100px;
          left: -100px;
          animation: orb-float 15s infinite alternate-reverse;
        }

        @keyframes orb-float {
          from { transform: translate(0, 0); }
          to { transform: translate(40px, 40px); }
        }

        .hero-badge-modern {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 8px 16px;
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: 100px;
          font-size: 13px;
          font-weight: 700;
          color: var(--accent-light);
          margin-bottom: 32px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.03);
        }

        .hero-title-modern {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 72px;
          font-weight: 800;
          line-height: 1.05;
          letter-spacing: -3px;
          color: var(--text-primary);
          margin-bottom: 24px;
        }

        .hero-desc-modern {
          font-size: 20px;
          color: var(--text-secondary);
          line-height: 1.6;
          max-width: 680px;
          margin: 0 auto 48px;
        }

        .hero-search-container {
          max-width: 720px;
          margin: 0 auto;
        }

        .hero-search-bar {
          display: flex;
          align-items: center;
          background: white;
          border: 1px solid var(--border-strong);
          padding: 8px 8px 8px 24px;
          border-radius: 20px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.06);
          margin-bottom: 20px;
          transition: border-color 0.3s, box-shadow 0.3s;
        }

        .hero-search-bar:focus-within {
          border-color: var(--accent);
          box-shadow: 0 20px 40px rgba(124, 58, 237, 0.1);
        }

        .hero-search-bar input {
          flex: 1;
          border: none;
          outline: none;
          font-size: 16px;
          font-weight: 500;
          color: var(--text-primary);
          padding: 12px 0;
        }

        .search-icon {
          color: var(--text-muted);
          margin-right: 16px;
        }

        .btn-hero-search {
          background: var(--accent);
          color: white;
          border: none;
          padding: 12px 32px;
          border-radius: 14px;
          font-weight: 700;
          font-size: 15px;
          cursor: pointer;
          transition: transform 0.2s, background 0.2s;
        }

        .btn-hero-search:hover {
          background: var(--accent-light);
          transform: translateY(-1px);
        }

        .hero-search-tags {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          font-size: 13px;
          color: var(--text-muted);
        }

        .hero-search-tags button {
          background: none;
          border: none;
          color: var(--text-secondary);
          font-weight: 600;
          cursor: pointer;
          border-bottom: 1px solid transparent;
          transition: all 0.2s;
        }

        .hero-search-tags button:hover {
          color: var(--accent);
          border-bottom-color: var(--accent);
        }

        /* ─── Trending Grid ─── */
        .trending-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          margin-top: 32px;
        }

        .trending-card {
          background: white;
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 32px;
          text-decoration: none;
          display: flex;
          flex-direction: column;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .trending-card:hover {
          border-color: var(--accent);
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(124, 58, 237, 0.08);
        }

        .trending-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
        }

        .trending-tag {
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          color: var(--accent-light);
          padding: 4px 10px;
          background: rgba(124, 58, 237, 0.08);
          border-radius: 6px;
        }

        .trending-status-glow {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 800;
          color: #10b981;
          background: rgba(16, 185, 129, 0.08);
          padding: 4px 10px;
          border-radius: 100px;
        }

        .glow-dot {
          width: 6px;
          height: 6px;
          background: #10b981;
          border-radius: 50%;
          box-shadow: 0 0 8px #10b981;
          animation: pulse 2s infinite;
        }

        .trending-exam-title {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 22px;
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1.3;
          margin-bottom: 16px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .trending-exam-body {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 24px;
        }

        .info-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 500;
          color: var(--text-muted);
        }

        .trending-card-footer {
          margin-top: auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 16px;
          border-top: 1px solid var(--border);
        }

        .learn-more {
          font-size: 13px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .arrow-icon {
          transition: transform 0.2s;
        }

        .trending-card:hover .arrow-icon {
          transform: translateX(4px);
        }

        /* ─── Explore Grid ─── */
        .explore-grid-modern {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-top: 48px;
        }

        .explore-tile {
          display: flex;
          align-items: center;
          gap: 20px;
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 24px;
          text-align: left;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
        }

        .explore-tile:hover {
          background: white;
          border-color: var(--accent);
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.04);
        }

        .explore-tile.active {
          background: white;
          border-color: var(--accent);
          box-shadow: 0 0 0 2px var(--accent-glow);
        }

        .explore-tile-icon {
          font-size: 28px;
          width: 56px;
          height: 56px;
          background: white;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(0,0,0,0.04);
        }

        .explore-tile-content {
          flex: 1;
        }

        .explore-tile-name {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 16px;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 2px;
        }

        .explore-tile-desc {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-muted);
        }

        .explore-tile-arrow {
          color: var(--text-muted);
          opacity: 0;
          transform: translateX(-10px);
          transition: all 0.2s;
        }

        .explore-tile:hover .explore-tile-arrow {
          opacity: 1;
          transform: translateX(0);
        }

        /* ─── App Shell Refined ─── */
        .app-shell-modern {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 40px;
          align-items: start;
        }

        .feed-section-title {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 32px;
          font-weight: 700;
          letter-spacing: -1px;
          color: var(--text-primary);
        }

        .bg-secondary-modern {
          background: #fcfcfd;
        }

        .section-modern {
          padding: 100px 0;
        }

        .section-header-modern {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-bottom: 48px;
        }

        .section-title-modern {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 40px;
          font-weight: 700;
          letter-spacing: -1.5px;
          color: var(--text-primary);
        }

        .section-desc-modern {
          font-size: 16px;
          color: var(--text-secondary);
          font-weight: 500;
          margin-top: 4px;
        }

        .view-all-link {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--accent-light);
          font-size: 14px;
          font-weight: 700;
          text-decoration: none;
        }

        .exam-list-modern {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .btn-clear-filter {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: #fef2f2;
          color: #ef4444;
          border: 1px solid #fee2e2;
          border-radius: 100px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
        }

        /* ─── Benefit Cards ─── */
        .bg-indigo-dark { background: #1e1b4b; }
        .op-20 { opacity: 0.2; }
        
        .benefit-card {
          text-align: center;
        }

        .benefit-icon {
          width: 56px;
          height: 56px;
          background: rgba(255,255,255,0.1);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px;
        }

        .benefit-title {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 20px;
          font-weight: 700;
          margin-bottom: 12px;
        }

        .benefit-text {
          font-size: 15px;
          color: rgba(255,255,255,0.7);
          line-height: 1.6;
        }

        .skeleton.trending-skeleton {
          height: 280px;
          border-radius: var(--radius-lg);
        }

        /* ─── News Grid Modern ─── */
        .news-grid-modern {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        }

        .news-card-modern {
          padding: 24px;
          background: white;
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          display: flex;
          flex-direction: column;
          gap: 16px;
          text-decoration: none;
          transition: all 0.2s;
        }

        .news-card-modern:hover {
          border-color: var(--accent);
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.04);
        }

        .news-card-tag {
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--accent-light);
          padding: 4px 8px;
          background: #f5f3ff;
          border-radius: 4px;
          width: fit-content;
        }

        .news-card-title {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 18px;
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1.4;
        }

        .news-card-footer {
          margin-top: auto;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: var(--text-muted);
          font-weight: 600;
        }

        .news-card-footer .dot {
          width: 3px;
          height: 3px;
          background: var(--text-muted);
          border-radius: 50%;
        }

        .skeleton.news-skeleton {
          height: 140px;
          border-radius: var(--radius-lg);
        }

        /* ─── Animations ─── */
        .animate-fade-in { animation: fadeIn 0.8s ease forwards; }
        .animate-slide-up { animation: slideUp 0.8s ease forwards; opacity: 0; }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 1024px) {
          .app-shell-modern { grid-template-columns: 1fr; }
          .trending-grid { grid-template-columns: repeat(2, 1fr); gap: 16px; }
          .explore-grid-modern { grid-template-columns: repeat(2, 1fr); gap: 12px; }
          .news-grid-modern { grid-template-columns: repeat(2, 1fr); }
        }

        @media (max-width: 640px) {
          .news-grid-modern { grid-template-columns: 1fr; }
        }

        /* ─── Status Hub ─── */
        .status-hub-section {
          position: relative;
          margin-top: -60px;
          z-index: 20;
          padding-bottom: 40px;
        }

        .status-hub-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }

        .status-hub-card {
          background: white;
          padding: 24px;
          border-radius: var(--radius-xl);
          display: flex;
          align-items: center;
          gap: 16px;
          text-decoration: none;
          box-shadow: 0 10px 30px rgba(0,0,0,0.05);
          border: 1px solid rgba(0,0,0,0.05);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .status-hub-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.08);
          border-color: var(--accent-light);
        }

        .status-hub-icon {
          width: 56px;
          height: 56px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .status-hub-info {
          flex: 1;
        }

        .hub-label {
          display: block;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: var(--text-muted);
          margin-bottom: 4px;
        }

        .hub-title {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 17px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .hub-arrow {
          color: var(--text-muted);
          opacity: 0.3;
          transition: all 0.2s;
        }

        .status-hub-card:hover .hub-arrow {
          opacity: 1;
          color: var(--accent);
          transform: translateX(3px);
        }

        /* ─── Modern Section Header ─── */
        .section-header-modern {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-bottom: 48px;
        }

        @media (max-width: 1200px) {
          .status-hub-grid { grid-template-columns: repeat(2, 1fr); }
        }

        @media (max-width: 768px) {
          .status-hub-section { margin-top: -40px; }
          .status-hub-grid { grid-template-columns: 1fr; gap: 12px; }
          .status-hub-card { padding: 20px; }
          .status-hub-icon { width: 48px; height: 48px; border-radius: 12px; }
          .hub-title { font-size: 15px; }
        }

        /* ─── Intelligence Grid (Sarkari Style Premium) ─── */
        .intelligence-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 32px;
          align-items: start;
        }

        .intelligence-col {
          background: white;
          border-radius: var(--radius-xl);
          border: 1px solid var(--border);
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0,0,0,0.02);
        }

        .col-header {
          padding: 16px 20px;
          background: #fafafa;
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .col-title {
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 800;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 15px;
          color: var(--text-primary);
        }

        .col-link {
          font-size: 12px;
          font-weight: 700;
          text-decoration: none;
        }

        .col-content {
          padding: 10px 0;
        }

        .intel-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 20px;
          text-decoration: none;
          border-bottom: 1px solid #f9f9f9;
          transition: all 0.2s;
        }

        .intel-row:last-child { border-bottom: none; }

        .intel-row:hover {
          background: #fdfdfd;
        }

        .intel-title {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin-right: 12px;
        }

        .badge-new {
          font-size: 9px;
          font-weight: 900;
          padding: 2px 6px;
          background: #ef4444;
          color: white;
          border-radius: 4px;
          letter-spacing: 0.5px;
        }

        .badge-status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #ddd;
        }
        .badge-status-dot.green { background: #22c55e; box-shadow: 0 0 8px rgba(34, 197, 94, 0.4); }
        .badge-status-dot.orange { background: #f97316; box-shadow: 0 0 8px rgba(249, 115, 22, 0.4); }

        .skeleton.col-skeleton {
          height: 40px;
          margin: 10px 20px;
          border-radius: 6px;
        }

        @media (max-width: 1024px) {
          .intelligence-grid { grid-template-columns: 1fr; gap: 24px; }
        }

        @media (max-width: 768px) {
          .hero-modern { padding: 100px 0 60px; }
          .hero-title-modern { font-size: 42px; letter-spacing: -1.5px; }
          .hero-desc-modern { font-size: 16px; margin-bottom: 32px; }
          .hero-badge-modern { margin-bottom: 20px; }
          
          .hero-search-bar { 
            padding: 4px 4px 4px 16px; 
            border-radius: 14px;
          }
          .hero-search-bar input { font-size: 14px; }
          .btn-hero-search { padding: 10px 20px; font-size: 14px; border-radius: 10px; }
          .search-icon { margin-right: 8px; font-size: 16px; }

          .hot-access-bar { display: none; }
          .states-discovery-grid { grid-template-columns: 1fr; gap: 16px; }
        }

        /* ─── Hot Access Bar ─── */
        .hot-access-bar {
          margin-top: 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          justify-content: center;
        }

        .hot-label {
          font-size: 11px;
          font-weight: 900;
          color: var(--accent);
          letter-spacing: 1px;
        }

        .hot-pills {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .hot-pills button {
          padding: 6px 14px;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 100px;
          font-size: 12px;
          color: white;
          font-weight: 600;
          transition: all 0.2s;
        }

        .hot-pills button:hover {
          background: white;
          color: var(--primary);
          border-color: white;
        }

        /* ─── States Discovery Hub ─── */
        .states-discovery-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }

        .state-intel-col {
          background: white;
          border-radius: var(--radius-lg);
          border: 1px solid var(--border);
          padding: 20px;
          transition: all 0.2s;
        }

        .state-intel-col:hover {
          border-color: var(--accent-light);
          box-shadow: 0 8px 24px rgba(0,0,0,0.04);
        }

        .state-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 16px;
          padding-bottom: 12px;
          border-bottom: 1px solid #f5f5f5;
        }

        .state-icon { font-size: 20px; }
        .state-name { font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: 16px; }

        .state-links { display: flex; flex-direction: column; gap: 8px; }

        .state-link-row {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-muted);
          text-decoration: none;
          padding: 8px 10px;
          border-radius: 6px;
          transition: all 0.2s;
        }

        .state-link-row:hover {
          color: var(--accent);
          background: #f8f7ff;
        }

        .state-more-link {
          margin-top: 8px;
          font-size: 11px;
          font-weight: 800;
          color: var(--accent);
          text-transform: uppercase;
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        @media (max-width: 1024px) {
          .states-discovery-grid { grid-template-columns: repeat(2, 1fr); }
        }

          .section-modern { padding: 60px 0; }
          .section-title-modern { font-size: 30px; letter-spacing: -1px; }
          .section-desc-modern { font-size: 14px; }
          .section-header-modern { flex-direction: column; align-items: flex-start; gap: 16px; margin-bottom: 32px; }

          .trending-grid { 
            display: flex;
            overflow-x: auto;
            margin: 0 -24px;
            padding: 8px 24px 20px;
            gap: 16px;
            scroll-snap-type: x mandatory;
            -webkit-overflow-scrolling: touch;
          }
          .trending-grid::-webkit-scrollbar { display: none; }
          .trending-card { 
            min-width: 280px; 
            scroll-snap-align: start;
            padding: 24px;
          }

          .explore-grid-modern { grid-template-columns: 1fr; gap: 12px; margin-top: 32px; }
          .explore-tile { padding: 16px; gap: 16px; }
          .explore-tile-icon { width: 44px; height: 44px; font-size: 22px; border-radius: 12px; }
          .explore-tile-name { font-size: 15px; }
          
          .feed-section-title { font-size: 26px; }
          .hero-search-tags { display: none; }
          .sidebar-modern { display: none; }
          
          .benefit-card { gap: 16px; }
          .benefit-icon { margin-bottom: 16px; }
          .benefit-title { font-size: 18px; }
          .benefit-text { font-size: 14px; }
        }

        @media (max-width: 480px) {
          .hero-title-modern { font-size: 36px; }
          .trending-card { min-width: 260px; }
          .feed-header-modern .flex { flex-direction: column; align-items: flex-start; gap: 16px; }
        }
      `}</style>


      <LeaderboardAd id="bottom-leaderboard-ad" />
    </main>
  );
}

function DateHeader({ date }: { date: string }) {
  const now = new Date();
  const todayStr = now.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  now.setDate(now.getDate() - 1);
  const yesterdayStr = now.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

  let label = date;
  if (date === todayStr) label = "Latest Updates Today";
  else if (date === yesterdayStr) label = "Yesterday's Updates";

  return (
    <div className="date-group-header">
      <div className="date-group-line" />
      <span className="date-group-label">{label}</span>
      <div className="date-group-line" />
      
      <style jsx>{`
        .date-group-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin: 40px 0 16px;
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
          padding: 6px 20px;
          background: white;
          border: 1px solid var(--border);
          border-radius: 100px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.02);
        }
      `}</style>
    </div>
  );
}


