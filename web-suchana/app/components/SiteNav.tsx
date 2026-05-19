"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { fetchTrendingContent } from "../lib/api";
import {
  Home,
  Megaphone,
  Ticket,
  Trophy,
  Key,
  FileText,
  FileEdit,
  BarChart2,
  Globe,
  Newspaper,
  BookOpen,
  Landmark,
  Bell
} from "lucide-react";

export default function SiteNav() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: trendingData } = useQuery({
    queryKey: ["home-trending"],
    queryFn: () => fetchTrendingContent(6),
  });

  const trendingExams = trendingData?.exams || [];

  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  return (
    <>
      {/* TOPBAR */}
      <div className="topbar">
        <div className="tb-left">
          <span className="tb-live">LIVE</span>
          <span>{mounted ? today : ''}</span>
          <Link href="/all-exams" className="flex items-center gap-1.5"><Megaphone size={14} className="opacity-80" /> All Exams Ongoing</Link>
          <Link href="/s/admit-card" className="flex items-center gap-1.5"><Ticket size={14} className="opacity-80" /> Admit Cards Out</Link>
        </div>
        <div className="tb-right hidden md:flex">
          <Link href="/about">About Us</Link>
          <Link href="/contact">Contact Us</Link>
          <Link href="/privacy">Privacy Policy</Link>
          <Link href="/disclaimer">Disclaimer</Link>
          <Link href="/terms">Terms &amp; Conditions</Link>
        </div>
      </div>

      {/* MASTHEAD */}
      <div className="masthead">
        <div>
          <Link href="/" className="mh-brand">Suchana<span className="dot">.</span></Link>
        </div>
      </div>

      {/* NAV */}
      <div className="nav-strip">
        <Link href="/" className="ns-item active"><Home size={14} className="opacity-80" /> Home</Link>
        <Link href="/s/notification" className="ns-item"><Megaphone size={14} className="opacity-80" /> Notifications <span className="badge">New</span></Link>
        <Link href="/s/admit-card-out" className="ns-item"><Ticket size={14} className="opacity-80" /> Admit Cards</Link>
        <Link href="/s/result-declared" className="ns-item"><Trophy size={14} className="opacity-80" /> Results</Link>
        <Link href="/s/answer-key-out" className="ns-item"><Key size={14} className="opacity-80" /> Answer Keys</Link>
        <Link href="/topic/syllabus" className="ns-item"><FileText size={14} className="opacity-80" /> Syllabus</Link>
        <Link href="/topic/previous-year-papers" className="ns-item"><FileEdit size={14} className="opacity-80" /> PYQ Papers</Link>
        <Link href="/topic/exam-analysis" className="ns-item"><BarChart2 size={14} className="opacity-80" /> Analysis</Link>
        <Link href="/topic/static-gk" className="ns-item"><Globe size={14} className="opacity-80" /> Static GK</Link>
        <Link href="/topic/current-affairs" className="ns-item"><Newspaper size={14} className="opacity-80" /> Current Affairs</Link>
        <Link href="/topic/preparation-guides" className="ns-item"><BookOpen size={14} className="opacity-80" /> Prep Guide</Link>
        <Link href="/categories" className="ns-item"><Landmark size={14} className="opacity-80" /> All Exams</Link>
        <div className="ns-right">
          <Link href="/onboarding" className="btn-alert flex items-center gap-1.5"><Bell size={14} className="opacity-80" /> Free Alerts</Link>
        </div>
      </div>

      {/* TICKER */}
      <div className="ticker-bar">
        <div className="tk-head">UPDATES</div>
        <div className="tk-scroll">
          <div className="tk-inner">
            {trendingExams.length > 0 ? trendingExams.map((exam: any) => (
              <span key={exam.id}>{exam.title} <em>{exam.status?.replace(/_/g, ' ')}</em></span>
            )) : (
              <>
                <span>SSC GD Constable 2026 <em>EXAM LIVE</em></span>
                <span>UPSC IAS Prelims 2026 — Admit Card Available <em>DOWNLOAD</em></span>
                <span>RRB ALP — Registration till 10 June <em>OPEN</em></span>
                <span>BPSC 72nd Prelims — Apply Now <em>OPEN</em></span>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
