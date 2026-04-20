"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Info, Zap, Award, Bell, ArrowRight,
  Landmark, ClipboardList, Building2, TrainFront,
  ShieldCheck, GraduationCap, Building, Settings, Stethoscope,
  Search, Sparkles, Smartphone, BookOpen, FileText, Star, Layers
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { ExamListRow, SkeletonRow } from "./components/ExamCard";
import { fetchTrendingContent, fetchSeoPages } from "./lib/api";
import { enumToSlug } from "./lib/types";
import { trackFunnelStep, trackConversion } from "./lib/telemetry";
import { useScrollTracking } from "./hooks/useScrollTracking";
import { ExamCategory } from "./lib/enums";
import SiteNav from "./components/SiteNav";
import SiteFooter from "./components/SiteFooter";

const CATEGORY_DISPLAY = [
  { id: ExamCategory.UPSC, name: "UPSC", icon: Landmark, desc: "Civil Services & IAS", color: "#3b82f6" },
  { id: ExamCategory.SSC, name: "SSC", icon: ClipboardList, desc: "CGL, CHSL & MTS", color: "#10b981" },
  { id: ExamCategory.BANKING_JOBS, name: "Banking", icon: Building2, desc: "IBPS, SBI & RBI", color: "#6366f1" },
  { id: ExamCategory.RAILWAY_JOBS, name: "Railways", icon: TrainFront, desc: "RRB NTPC & Group D", color: "#f59e0b" },
  { id: ExamCategory.DEFENCE_JOBS, name: "Defence", icon: ShieldCheck, desc: "NDA, CDS & AFCAT", color: "#ef4444" },
  { id: ExamCategory.TEACHING_ELIGIBILITY, name: "Teaching", icon: GraduationCap, desc: "CTET, NET & SET", color: "#8b5cf6" },
  { id: ExamCategory.STATE_PSC, name: "State PSC", icon: Building, desc: "Provincial Services", color: "#06b6d4" },
  { id: ExamCategory.ENGINEERING_ENTRANCE, name: "Engineering", icon: Settings, desc: "JEE Main & Advanced", color: "#ec4899" },
  { id: ExamCategory.MEDICAL_ENTRANCE, name: "Medical", icon: Stethoscope, desc: "NEET UG & PG", color: "#f43f5e" },
];

export default function HomePage() {
  useScrollTracking("homepage");
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: trendingData, isLoading: trendingLoading } = useQuery({
    queryKey: ["trending-content"],
    queryFn: fetchTrendingContent,
  });

  const { data: latestArticles = [] } = useQuery({
    queryKey: ["latestSeoPages"],
    queryFn: async () => {
      const { pages } = await fetchSeoPages(1, 5);
      return pages;
    }
  });

  const trendingExams = trendingData?.exams || [];

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-white">

      <main>
        {/* 1. Hero Gateway Section */}
        <section className="page-header-expansive">
          <div className="design-grid-bg" />
          <div className="orb-v6 orb-v6-primary" style={{ animation: 'orb-float 20s infinite alternate' }} />
          <div className="orb-v6 orb-v6-secondary" style={{ animation: 'orb-float 20s infinite alternate-reverse' }} />

          <div className="container relative z-10 text-center">
            <div className="max-w-5xl mx-auto">
              <div className="hero-badge-v6 animate-fade-in">
                <Sparkles size={12} className="text-blue-500" /> Live Tracker 2026
              </div>

              <h1 className="hero-title-v6 animate-slide-up">
                All India <span className="gradient-text">Exam Tracking</span> Center
              </h1>

              <p className="hero-desc-v6 animate-slide-up" style={{ animationDelay: '100ms', maxWidth: '800px', margin: '0 auto 40px', fontSize: '1.25rem' }}>
                The comprehensive dashboard for 1000+ national and state level exams. Discover your next career opportunity with precision tracking.
              </p>

              {/* Integrated Status Controls (Collabs with Desc) */}
              <div className="status-hub-neo animate-slide-up" style={{ animationDelay: '200ms' }}>
                {[
                  { label: "Recruitment", title: "Latest Exams", icon: Bell, color: "#2563eb", bg: "#eff6ff", href: "/latest-jobs" },
                  { label: "Hall Ticket", title: "Admit Cards", icon: Zap, color: "#ea580c", bg: "#fff7ed", href: "/s/admit-card-out" },
                  { label: "Examination", title: "Results", icon: Award, color: "#059669", bg: "#ecfdf5", href: "/s/result-declared" },
                  { label: "Verified", title: "Answer Keys", icon: Info, color: "#7c3aed", bg: "#f5f3ff", href: "/s/answer-key-out" }
                ].map((hub) => (
                  <Link key={hub.title} href={hub.href} className="status-card-premium group tap-effect">
                    <div className="status-icon-box" style={{ background: hub.bg }}>
                      <hub.icon size={22} color={hub.color} />
                    </div>
                    <div className="flex-1 text-left">
                      <span className="status-label-small">{hub.label}</span>
                      <h3 className="status-label-title">{hub.title}</h3>
                    </div>
                    <ArrowRight size={20} className="text-slate-200 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 3. App Shell Layout (Consistency with Detail Page) */}
        <div className="app-shell" style={{ paddingTop: '60px' }}>

          {/* Left Sidebar: Discovery Filters */}
          <aside className="sidebar-left desktop-only">
            <div className="sidebar-widget" style={{ border: 'none', background: 'transparent' }}>
              <div className="sidebar-widget-title">
                <Layers size={14} /> Quick Category
              </div>
              <div className="category-list">
                {CATEGORY_DISPLAY.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/c/${enumToSlug(cat.id)}`}
                    prefetch={false}
                    className="category-btn"
                  >
                    <cat.icon size={16} strokeWidth={2.4} style={{ color: cat.color }} />
                    <span>{cat.name}</span>
                  </Link>
                ))}
                <Link href="/categories" className="category-btn" style={{ marginTop: '8px', color: 'var(--accent)' }}>
                  <ArrowRight size={16} />
                  <span className="font-bold">View All categories</span>
                </Link>
              </div>
            </div>
          </aside>

          {/* Main Feed: Featured Updates */}
          <section className="feed-main">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 text-orange-600 text-[10px] font-bold uppercase tracking-wider mb-3 border border-orange-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" /> Live Trending
                </div>
                <h2 className="section-title" style={{ fontSize: '28px', marginBottom: '4px' }}>Featured Updates</h2>
                <p className="section-desc" style={{ fontSize: '14px' }}>The most active exam notifications across India today</p>
              </div>
            </div>

            {trendingLoading ? (
              <div className="exam-list">
                {[1, 2, 3, 4, 5, 6].map(i => <SkeletonRow key={i} />)}
              </div>
            ) : trendingExams.length === 0 ? (
              <div className="empty-state py-16 text-center bg-slate-50 rounded-[32px] border border-dashed border-slate-200">
                <Info size={48} className="text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-900">No trending exams found</h3>
                <p className="text-slate-500">Check back later for updates.</p>
              </div>
            ) : (
              <div className="exam-list-modern shadow-sm shadow-blue-500/5">
                {trendingExams.map((exam) => (
                  <ExamListRow key={exam.id} exam={exam} />
                ))}
              </div>
            )}

            <div className="mt-12 text-center">
              <Link href="/all-exams" className="btn btn-ghost" style={{ padding: '12px 32px', borderRadius: '14px' }}>
                Browse All 1000+ Exams <ArrowRight size={16} style={{ marginLeft: '8px' }} />
              </Link>
            </div>
          </section>

          {/* Right Sidebar: Utility Widgets */}
          <aside className="sidebar-right desktop-only">
            {/* Telegram Widget */}
            <div className="app-download-widget" style={{ background: 'linear-gradient(135deg, #0088cc 0%, #00aaff 100%)', border: 'none' }}>
              <div className="app-widget-icon" >
                <Bell size={18} color="white" />
              </div>
              <div className="app-widget-title" style={{ color: 'white' }}>Join Telegram</div>
              <div className="app-widget-sub" style={{ color: 'rgba(255,255,255,0.9)' }}>Fastest exam notifications directly on your phone.</div>
              <a
                href="https://t.me/examsuchana"
                target="_blank"
                rel="noopener noreferrer"
                className="app-widget-btn"
                style={{ background: 'white', color: '#0088cc' }}
                onClick={() => trackConversion('telegram_join_click', { source: 'homepage' })}
              >
                Join Now <ArrowRight size={14} />
              </a>
            </div>

            {/* Latest Guides Widget */}
            {latestArticles.length > 0 && (
              <div className="sidebar-widget">
                <div className="sidebar-widget-title">
                  <BookOpen size={14} /> Latest Guides
                </div>
                <div className="sidebar-links">
                  {latestArticles.map((article) => (
                    <Link key={article.id} href={`/${article.slug}`} className="sidebar-link">
                      <FileText size={14} style={{ opacity: 0.7 }} />
                      <span>{article.title}</span>
                    </Link>
                  ))}
                </div>
                <Link href="/articles" className="sidebar-link" style={{ marginTop: '8px', color: 'var(--accent)', fontWeight: 700 }}>
                  View All Articles
                </Link>
              </div>
            )}



            {/* App Download Widget */}
            {/* <div className="app-download-widget">
              <div className="app-widget-icon">
                <Smartphone size={18} color="var(--accent-light)" />
              </div>
              <div className="app-widget-title">Get the App</div>
              <div className="app-widget-sub">Push notifications for every exam update.</div>
              <a
                href="https://play.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="app-widget-btn"
                onClick={() => trackConversion('app_download_click', { source: 'homepage' })}
              >
                Download Free <ArrowRight size={14} />
              </a>
            </div> */}
          </aside>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
