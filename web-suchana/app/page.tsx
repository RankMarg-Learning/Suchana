"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  fetchTrendingContent,
  fetchHomeTrendingNews,
  fetchHomePyq,
  fetchHomeArticles,
  fetchHomeStrategy,
  fetchHomeClosingSoon
} from "./lib/api";
import {
  Activity,
  Folder,
  Clock,
  Megaphone,
  Trophy,
  Ticket,
  FileText,
  FileEdit,
  BarChart2,
  Globe,
  Newspaper
} from "lucide-react";
import HomeSidebar from "./components/home/HomeSidebar";
import { STAGE_LABELS, cleanLabel } from "./lib/types";

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: trendingData, isLoading: trendingLoading } = useQuery({
    queryKey: ["home-trending"],
    queryFn: () => fetchTrendingContent(6),
  });

  const { data: trendingNews = [] } = useQuery({
    queryKey: ["home-trending-news"],
    queryFn: () => fetchHomeTrendingNews(3, 1),
  });



  const { data: caArticles = [] } = useQuery({
    queryKey: ["home-articles"],
    queryFn: () => fetchHomeArticles(3),
  });



  const { data: closingSoon = [] } = useQuery({
    queryKey: ["home-closing-soon"],
    queryFn: () => fetchHomeClosingSoon(5),
  });

  const trendingExams = trendingData?.exams || [];

  if (!mounted) return null;

  return (
    <>
      <div className="home-body">
        {/* LEADERBOARD AD */}
        <div className="wrap-home">
          <div className="ad-leader" style={{ margin: '16px 0 0' }}>
            <div className="ad-label">Advertisement</div>
            <div className="ad-inner">
              <b className="hidden md:block">728 × 90 — Leaderboard</b>
              <b className="block md:hidden">320 × 50 — Mobile Leaderboard</b>
              <span style={{ fontSize: 11 }}>Place AdSense responsive leaderboard unit here</span>
            </div>
          </div>
        </div>

        {/* MAIN PAGE */}
        <div className="wrap-home">
          <div className="page-grid">
            {/* CONTENT */}
            <div className="content-col">

              {/* FEATURED */}
              {
                trendingNews.length > 0 && (<div className="fade-up d1">
                  <div className="sh">
                    <div className="sh-title"><span className="cat-tag">TOP STORIES</span> Today's Highlights</div>
                    <Link href="/articles" className="sh-link">ALL NEWS →</Link>
                  </div>
                  <div className="featured-grid">
                    <Link href={trendingNews[0] ? `/${trendingNews[0].slug}` : "#"} className="feat-main">
                      <div className="feat-bg"></div>
                      <div className="feat-bg-pattern"></div>
                      <div className="feat-main-inner">
                        <div className="feat-cat flex items-center gap-1.5"><Activity size={14} className="text-red-500 animate-pulse" /> Breaking · {trendingNews[0]?.category?.replace(/_/g, ' ') || 'Notification'}</div>
                        <div className="feat-title">{trendingNews[0]?.title || 'UPSC CSE 2026 Prelims Admit Card Released — Exam on 25 May, Centres Allotted'}</div>
                        <div className="feat-meta">
                          <span className="flex items-center gap-1"><Folder size={12} className="opacity-80" /> {trendingNews[0]?.exam?.conductingBody || 'UPSC'}</span>
                          <span className="flex items-center gap-1"><Clock size={12} className="opacity-80" /> {trendingNews[0] ? new Date(trendingNews[0].updatedAt).toLocaleDateString() : '2 hours ago'}</span>
                        </div>
                      </div>
                    </Link>
                    <Link href={trendingNews[1] ? `/${trendingNews[1].slug}` : "#"} className="feat-side">
                      <div>
                        <div className="fs-cat" style={{ color: 'var(--rose)' }}>{trendingNews[1]?.category?.replace(/_/g, ' ')}</div>
                        <div className="fs-title">{trendingNews[1]?.title}</div>
                      </div>
                      <div className="fs-meta">{trendingNews[1] && new Date(trendingNews[1].updatedAt).toLocaleDateString()}</div>
                    </Link>
                    <Link href={trendingNews[2] && `/${trendingNews[2].slug}`} className="feat-side">
                      <div>
                        <div className="fs-cat" style={{ color: 'var(--mint)' }}>{trendingNews[2]?.category?.replace(/_/g, ' ')}</div>
                        <div className="fs-title">{trendingNews[2]?.title}</div>
                      </div>
                      <div className="fs-meta">{trendingNews[2] ? new Date(trendingNews[2].updatedAt).toLocaleDateString() : 'Today'}</div>
                    </Link>
                  </div>
                </div>

                )
              }

              {/* EXAM TIMELINE BOARD */}
              <div className="fade-up d2">
                <div className="sh">
                  <div className="sh-title"><span className="cat-tag">TRACKER</span> Exam Life Cycle</div>
                  <Link href="/all-exams" className="sh-link">ALL EXAMS →</Link>
                </div>
                <div className="timeline-board">

                  {trendingExams.slice(0, 5).map((exam: any) => {
                    let stages: any[] = [];
                    if (exam.lifecycleEvents && exam.lifecycleEvents.length > 0) {
                      let reachedActive = false;
                      stages = exam.lifecycleEvents.slice(0, 6).map((e: any) => {
                        const isTBD = !!e.isTBD;
                        let isDone = false;
                        let isActive = false;

                        if (!isTBD) {
                          const now = new Date();
                          const endsAtDate = e.endsAt ? new Date(e.endsAt) : null;
                          const startsAtDate = e.startsAt ? new Date(e.startsAt) : null;

                          isDone = !reachedActive && !!endsAtDate && endsAtDate < now;
                          isActive = !isDone && !reachedActive && !!(
                            (startsAtDate && startsAtDate <= now && (!endsAtDate || endsAtDate >= now)) ||
                            (!startsAtDate && endsAtDate && endsAtDate >= now)
                          );
                          if (isActive) reachedActive = true;
                        }

                        const stageTitle = STAGE_LABELS[e.stage] || cleanLabel(e.stage) || e.title || "";
                        return { title: stageTitle, done: isDone, active: isActive, isTBD };
                      });
                    }

                    return (
                      <Link href={`/exam/${exam.slug}`} key={exam.id} className="tl-exam">
                        <div>
                          <div className="tl-name">{exam.title}</div>
                          <div className="tl-org">{exam.conductingBody}</div>
                        </div>
                        <div className="tl-track">
                          {stages.map((st: any, i: number) => (
                            <div key={i} className={`tl-step ${st.isTBD ? 'tbd next' : st.done ? 'done' : st.active ? 'active' : 'next'}`}>
                              <div className="tl-dot">{st.isTBD ? '?' : st.done ? '✓' : st.active ? '●' : '○'}</div>
                              <div className="tl-slabel">{st.title}</div>
                              <div className="tl-sstatus" style={{ fontSize: '7px', opacity: 0.6, marginTop: '2px', textTransform: 'uppercase', fontFamily: 'var(--mono)', color: st.isTBD ? '#a8a29e' : st.done ? 'var(--gold-lt)' : st.active ? '#f87171' : 'rgba(255, 255, 255, 0.3)' }}>
                                {st.isTBD ? 'TBD' : st.done ? 'Done' : st.active ? 'Live' : 'Next'}
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="tl-action">
                          <button className="tl-cta cta-gold">View Details ↗</button>
                          <span className="tl-days days-soon">{exam.status?.replace(/_/g, ' ')}</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* CATEGORIES HUB */}
              <div className="fade-up d3">
                <div className="sh">
                  <div className="sh-title"><span className="cat-tag">EXPLORE</span> All Content Categories</div>
                  <Link href="/categories" className="sh-link">BROWSE ALL →</Link>
                </div>
                <div className="cat-hub">
                  <Link href="/topic/notification" className="cat-card cc-notif">
                    <div className="cc-icon text-blue-500"><Megaphone size={24} /></div>
                    <div className="cc-name">Notifications</div>
                    <div className="cc-desc" style={{ color: '#4a6fa5' }}>New vacancies, official recruitment ads</div>
                  </Link>
                  <Link href="/topic/result" className="cat-card cc-result">
                    <div className="cc-icon text-red-500"><Trophy size={24} /></div>
                    <div className="cc-name">Results</div>
                    <div className="cc-desc" style={{ color: '#9b2c2c' }}>Merit lists, score cards, cut-off marks</div>
                  </Link>
                  <Link href="/topic/admit-card" className="cat-card cc-admit">
                    <div className="cc-icon text-emerald-600"><Ticket size={24} /></div>
                    <div className="cc-name">Admit Cards</div>
                    <div className="cc-desc" style={{ color: '#065f46' }}>Hall tickets, exam city slips, centre details</div>
                  </Link>
                  <Link href="/topic/syllabus" className="cat-card cc-syllab">
                    <div className="cc-icon text-amber-600"><FileText size={24} /></div>
                    <div className="cc-name">Syllabus & Pattern</div>
                    <div className="cc-desc" style={{ color: '#92400e' }}>Official syllabus, exam pattern, marking</div>
                  </Link>
                  <Link href="/topic/previous-year-papers" className="cat-card cc-pyq">
                    <div className="cc-icon text-purple-600"><FileEdit size={24} /></div>
                    <div className="cc-name">Previous Year Q.</div>
                    <div className="cc-desc" style={{ color: '#5b21b6' }}>PYQ papers with solutions, topic-wise</div>
                  </Link>
                  <Link href="/topic/exam-analysis" className="cat-card cc-analysis">
                    <div className="cc-icon text-orange-500"><BarChart2 size={24} /></div>
                    <div className="cc-name">Exam Analysis</div>
                    <div className="cc-desc" style={{ color: '#92400e' }}>Difficulty, good attempts, expected cutoff</div>
                  </Link>
                  <Link href="/topic/gk-static" className="cat-card cc-gk">
                    <div className="cc-icon text-sky-600"><Globe size={24} /></div>
                    <div className="cc-name">Static GK</div>
                    <div className="cc-desc" style={{ color: '#0e4f75' }}>History, geography, polity, economy</div>
                  </Link>
                  <Link href="/topic/current-affairs" className="cat-card cc-ca">
                    <div className="cc-icon text-gray-600"><Newspaper size={24} /></div>
                    <div className="cc-name">Current Affairs</div>
                    <div className="cc-desc" style={{ color: '#4b5563' }}>Daily, weekly, monthly CA for exams</div>
                  </Link>
                </div>
              </div>

              {/* IN-CONTENT AD */}
              <div className="ad-leader" style={{ margin: '24px 0' }}>
                <div className="ad-label">Advertisement</div>
                <div className="ad-inner">
                  <b className="hidden md:block">728 × 90 — Mid-Content</b>
                  <b className="block md:hidden">320 × 50 — Mobile Mid-Content</b>
                  <span style={{ fontSize: 11 }}>Place responsive AdSense unit here</span>
                </div>
              </div>

              {/* LATEST ARTICLES */}
              {caArticles.length > 0 && (
                <div className="fade-up">
                  <div className="sh">
                    <div className="sh-title"><span className="cat-tag">LATEST</span> Fresh Articles</div>
                    <Link href="/articles" className="sh-link">ALL ARTICLES →</Link>
                  </div>
                  <div className="art-row">
                    {caArticles.map((art: any, idx: number) => {
                      const colors = [
                        'linear-gradient(135deg,#1a3a6c,#0c1a3a)',
                        'linear-gradient(135deg,#7c1d1d,#3a0c0c)',
                        'linear-gradient(135deg,#0e5c3a,#062b1c)'
                      ];
                      const Icons = [FileText, BarChart2, Globe];
                      const ActiveIcon = Icons[idx % 3];
                      return (
                        <Link href={`/${art.slug}`} key={art.id} className="art-card">
                          <div className="art-thumb" style={{ background: colors[idx % 3] }}>
                            <div className="art-thumb-bg"><ActiveIcon size={48} /></div>
                          </div>
                          <div className="art-body">
                            <span className="art-cat" style={{ color: 'var(--sky)' }}>{art.category?.replace(/_/g, ' ') || 'Article'}</span>
                            <div className="art-title">{art.title}</div>
                            <div className="art-excerpt">{art.metaDescription || art.title}</div>
                            <div className="art-foot">
                              <span>{new Date(art.updatedAt).toLocaleDateString()}</span>
                              <span className="read-more">Read →</span>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}





            </div>{/* /content */}

            {/* SIDEBAR */}
            <HomeSidebar closingSoon={closingSoon} trendingExams={trendingExams} />
          </div>
        </div>

      </div>
    </>
  );
}
