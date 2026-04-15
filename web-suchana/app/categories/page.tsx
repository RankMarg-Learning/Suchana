"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowRight, Landmark, ClipboardList, Building2, TrainFront,
  ShieldCheck, GraduationCap, Building, Settings, Stethoscope,
  Briefcase, Scale, Smartphone, Bell, ChevronLeft, Boxes
} from 'lucide-react';
import { ExamCategory } from '../lib/enums';
import { enumToSlug } from '../lib/types';
import { LeaderboardAd, SidebarAd } from "../components/AdUnits";

const CATEGORY_DISPLAY = [
  { id: ExamCategory.UPSC, name: "UPSC", icon: Landmark, desc: "Civil Services, IAS & IFS", color: "#3b82f6" },
  { id: ExamCategory.SSC, name: "SSC", icon: ClipboardList, desc: "CGL, CHSL, MTS & GD", color: "#10b981" },
  { id: ExamCategory.BANKING_JOBS, name: "Banking", icon: Building2, desc: "IBPS, SBI, RBI & Nabard", color: "#6366f1" },
  { id: ExamCategory.RAILWAY_JOBS, name: "Railways", icon: TrainFront, desc: "RRB NTPC, ALP & Group D", color: "#f59e0b" },
  { id: ExamCategory.DEFENCE_JOBS, name: "Defence", icon: ShieldCheck, desc: "NDA, CDS, AFCAT & Agniveer", color: "#ef4444" },
  { id: ExamCategory.TEACHING_ELIGIBILITY, name: "Teaching", icon: GraduationCap, desc: "CTET, NET, KVS & States", color: "#8b5cf6" },
  { id: ExamCategory.STATE_PSC, name: "State PSC", icon: Building, desc: "BPSC, UPPCS, MPSC & Others", color: "#06b6d4" },
  { id: ExamCategory.ENGINEERING_ENTRANCE, name: "Engineering", icon: Settings, desc: "JEE Main, Advanced & BITSET", color: "#ec4899" },
  { id: ExamCategory.MEDICAL_ENTRANCE, name: "Medical", icon: Stethoscope, desc: "NEET UG, PG & AIIMS", color: "#f43f5e" },
  { id: ExamCategory.LAW_ENTRANCE, name: "Law / Judiciary", icon: Scale, desc: "CLAT, AILET & State PCS-J", color: "#475569" },
  { id: ExamCategory.MBA_ENTRANCE, name: "Management", icon: Briefcase, desc: "CAT, MAT, XAT & GMAT", color: "#1e293b" },
  { id: ExamCategory.POLICE_JOBS, name: "Police & SI", icon: ShieldCheck, desc: "State Police & Central Forces", color: "#10b981" },
];

export default function CategoriesPage() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return (
    <main className="min-h-screen">
      <div className="app-shell" style={{ paddingTop: 80, opacity: 0.1 }}>
        <aside className="sidebar-left">
          <div className="skeleton" style={{ height: '400px', borderRadius: '24px' }} />
        </aside>
        <section className="feed-main">
          <div className="skeleton" style={{ height: '200px', borderRadius: '24px' }} />
          <div className="grid grid-cols-1 gap-4 mt-8">
            {[1, 2, 3, 4].map(i => <div key={i} className="skeleton" style={{ height: '100px', borderRadius: '16px' }} />)}
          </div>
        </section>
      </div>
    </main>
  );

  return (
    <main className="min-h-screen">
      <div className="leaderboard-wrap" style={{ paddingTop: 80 }}>
        <LeaderboardAd id="cat-top-leaderboard" />
      </div>

      <div className="app-shell">
        <aside className="sidebar-left">
          <SidebarAd id="cat-left-ad-1" tall />
          <SidebarAd id="cat-left-ad-2" />
        </aside>

        <section className="feed-main" id="categories-discovery">
          <div className="exam-detail-header-wrap">
            <nav className="breadcrumb" aria-label="Breadcrumb">
              <ol className="breadcrumb-list">
                <li className="breadcrumb-item">
                  <Link href="/" className="breadcrumb-link">Home</Link>
                  <span className="breadcrumb-sep">/</span>
                </li>
                <li className="breadcrumb-item">
                  <span className="breadcrumb-current">Discovery</span>
                </li>
              </ol>
            </nav>

            <div className="exam-detail-header">
              <div className="exam-detail-tags">
                <span className="exam-tag level-national">
                  <Boxes size={10} style={{ display: "inline", marginRight: 4 }} />
                  Global Discovery
                </span>
              </div>
              <h1 className="exam-detail-title">Explore by Category.</h1>
              <p className="exam-detail-org">
                Find recruitment notifications organized by your field of expertise.
              </p>
            </div>
          </div>

          <div className="category-discovery-grid" style={{ marginTop: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {CATEGORY_DISPLAY.map((cat, idx) => (
              <Link 
                key={cat.id} 
                href={`/c/${enumToSlug(cat.id)}`}
                className="category-neo-card group tap-effect shadow-sm hover:shadow-md transition-all duration-300"
                style={{ 
                  animationDelay: `${idx * 40}ms`, 
                  animation: 'fade-in 0.6s ease-out forwards',
                  background: 'white',
                  border: '1px solid var(--border)',
                  borderRadius: '20px',
                  padding: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '20px',
                  textDecoration: 'none'
                }}
              >
                <div className="status-icon-box" style={{ 
                  background: `${cat.color}08`,
                  width: '64px',
                  height: '64px',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <cat.icon size={32} color={cat.color} strokeWidth={2.4} className="group-hover:scale-110 transition-transform duration-500" />
                </div>
                
                <div className="flex-1">
                  <h3 className="status-label-title !text-lg mb-0.5" style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{cat.name}</h3>
                  <p className="status-label-small !mb-0 !text-[13px] !tracking-normal !normal-case !font-medium !text-slate-500">
                    {cat.desc}
                  </p>
                </div>

                <ArrowRight size={20} className="text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-300" />
              </Link>
            ))}
          </div>

          <div style={{ marginTop: 64, marginBottom: 8 }}>
            <Link href="/" className="btn btn-ghost" style={{ padding: '12px 20px', borderRadius: '12px' }}>
              <ChevronLeft size={16} /> Back to Gateway
            </Link>
          </div>
        </section>

        <aside className="sidebar-right">
          <div className="app-download-widget" style={{ background: 'linear-gradient(135deg, #0088cc 0%, #00aaff 100%)', border: 'none' }}>
            <div className="app-widget-icon" style={{ background: 'rgba(255,255,255,0.2)' }}>
              <Bell size={18} color="white" />
            </div>
            <div className="app-widget-title" style={{ color: 'white' }}>Join Telegram</div>
            <div className="app-widget-sub" style={{ color: 'rgba(255,255,255,0.9)' }}>Get the fastest exam notifications directly on your phone.</div>
            <a 
              href="https://t.me/examsuchana" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="app-widget-btn" 
              style={{ background: 'white', color: '#0088cc' }}
            >
              <ArrowRight size={14} /> Join Now
            </a>
          </div>

          <SidebarAd id="cat-right-ad-1" />
          
          <div className="app-download-widget">
            <div className="app-widget-icon">
              <Smartphone size={18} color="var(--accent-light)" />
            </div>
            <div className="app-widget-title">Get the App</div>
            <div className="app-widget-sub">Push notifications for every exam update. Never miss a deadline.</div>
            <a 
              href="https://play.google.com/store" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="app-widget-btn" 
            >
              <ArrowRight size={14} /> Download Free
            </a>
          </div>

          <SidebarAd id="cat-right-ad-2" tall />
        </aside>
      </div>
    </main>
  );
}

