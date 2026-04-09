"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Info, Zap, Award, Bell
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { ExamListRow, SkeletonRow } from "./components/ExamCard";
import { fetchTrendingContent } from "./lib/api";

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const mainFeedRef = useRef<HTMLDivElement>(null);

  const { data: trendingData, isLoading: trendingLoading } = useQuery({
    queryKey: ["trending-content"],
    queryFn: fetchTrendingContent,
  });

  const trendingExams = trendingData?.exams || [];

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
            <div className="hero-badge-modern animate-fade-in" style={{ marginBottom: '12px', padding: '4px 12px', fontSize: '11px' }}>
              <span className="hero-badge-dot" />
              Real-time Exam Tracker
            </div>
            <h1 className="hero-title-modern animate-slide-up" style={{ fontSize: '36px', marginBottom: '12px' }}>
              India's Premier <span className="gradient-text">Government Exam</span> Discovery
            </h1>
            <p className="hero-desc-modern animate-slide-up delay-100" style={{ fontSize: '15px', marginBottom: '24px', maxWidth: '600px' }}>
              Track 1000+ exams across UPSC, SSC, Banking & Railways.
            </p>
            <div className="hero-action-buttons animate-slide-up delay-200" style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '16px' }}>
              <Link href="/latest-jobs" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', backgroundColor: '#eff6ff', color: '#2563eb', borderRadius: '100px', fontSize: '15px', fontWeight: 700, textDecoration: 'none', border: '1px solid #bfdbfe', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.1)' }}>
                <Bell size={18} /> Latest Jobs
              </Link>
              <Link href="/s/admit-card-out" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', backgroundColor: '#fff7ed', color: '#ea580c', borderRadius: '100px', fontSize: '15px', fontWeight: 700, textDecoration: 'none', border: '1px solid #fed7aa', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(234, 88, 12, 0.1)' }}>
                <Zap size={18} /> Admit Cards
              </Link>
              <Link href="/s/result-declared" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', backgroundColor: '#ecfdf5', color: '#059669', borderRadius: '100px', fontSize: '15px', fontWeight: 700, textDecoration: 'none', border: '1px solid #a7f3d0', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(5, 150, 105, 0.1)' }}>
                <Award size={18} /> Results
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Prominent Trending Exams Section */}
      <section className="section-modern bg-surface border-t border-gray-100" ref={mainFeedRef}>
        <div className="container">


          {trendingLoading ? (
            <div className="exam-list max-w-4xl mx-auto">
              {[1, 2, 3, 4, 5, 6].map(i => <SkeletonRow key={i} />)}
            </div>
          ) : trendingExams.length === 0 ? (
            <div className="empty-state py-16 text-center max-w-4xl mx-auto">
              <div className="empty-icon mx-auto"><Info size={48} color="var(--text-muted)" /></div>
              <div className="empty-title mt-4 text-lg">No trending exams found</div>
              <div className="empty-desc mt-1">Check back later for updates.</div>
            </div>
          ) : (
            <div className="exam-list-modern max-w-4xl mx-auto">
              {trendingExams.map((exam) => (
                <ExamListRow key={exam.id} exam={exam} />
              ))}
            </div>
          )}
        </div>
      </section>


      <style jsx global>{`
        /* ─── Hero Modern ─── */
        .hero-modern {
          position: relative;
          padding: 40px 0 24px;
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
          margin-bottom: 24px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.03);
        }

        .hero-title-modern {
          font-family: var(--font-space-grotesk), sans-serif;
          font-size: 56px;
          font-weight: 800;
          line-height: 1.1;
          letter-spacing: -2px;
          color: var(--text-primary);
          margin-bottom: 20px;
        }

        .hero-desc-modern {
          font-size: 18px;
          color: var(--text-secondary);
          line-height: 1.5;
          max-width: 680px;
          margin: 0 auto 32px;
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
          margin-top: 20px;
          z-index: 20;
          padding-bottom: 24px;
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
          .status-hub-section { margin-top: 10px; }
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

        @media (max-width: 768px) {
          .hero-modern { padding: 80px 0 40px; }
          .hero-title-modern { font-size: 32px; letter-spacing: -1px; }
          .hero-desc-modern { font-size: 14px; margin-bottom: 24px; }
          .hero-badge-modern { margin-bottom: 16px; }

          .section-modern { padding: 40px 0; }
          .section-title-modern { font-size: 24px; letter-spacing: -1px; }
          .section-desc-modern { font-size: 14px; }
          .section-header-modern { flex-direction: column; align-items: flex-start; gap: 16px; margin-bottom: 32px; }
          .benefit-card { gap: 16px; }
          .benefit-icon { margin-bottom: 16px; }
          .benefit-title { font-size: 18px; }
          .benefit-text { font-size: 14px; }
        }

        @media (max-width: 480px) {
          .hero-title-modern { font-size: 36px; }
          .benefit-text { font-size: 14px; }
        }
      `}</style>
    </main>
  );
}
