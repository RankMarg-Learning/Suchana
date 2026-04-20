"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowRight, Landmark, ClipboardList, Building2, TrainFront,
  ShieldCheck, GraduationCap, Building, Settings, Stethoscope,
  Briefcase, Scale, Smartphone, Bell, ChevronLeft, ChevronRight
} from 'lucide-react';
import { ExamCategory } from '../lib/enums';
import { enumToSlug } from '../lib/types';
import { LeaderboardAd, SidebarAd } from "../components/AdUnits";

const CATEGORY_DISPLAY = [
  { id: ExamCategory.UPSC, name: "UPSC", icon: Landmark, desc: "Civil Services, IAS & IFS" },
  { id: ExamCategory.SSC, name: "SSC", icon: ClipboardList, desc: "CGL, CHSL, MTS & GD" },
  { id: ExamCategory.BANKING_JOBS, name: "Banking", icon: Building2, desc: "IBPS, SBI, RBI & Nabard" },
  { id: ExamCategory.RAILWAY_JOBS, name: "Railways", icon: TrainFront, desc: "RRB NTPC, ALP & Group D" },
  { id: ExamCategory.DEFENCE_JOBS, name: "Defence", icon: ShieldCheck, desc: "NDA, CDS, AFCAT & Agniveer" },
  { id: ExamCategory.TEACHING_ELIGIBILITY, name: "Teaching", icon: GraduationCap, desc: "CTET, NET, KVS & States" },
  { id: ExamCategory.STATE_PSC, name: "State PSC", icon: Building, desc: "BPSC, UPPCS, MPSC & Others" },
  { id: ExamCategory.ENGINEERING_ENTRANCE, name: "Engineering", icon: Settings, desc: "JEE Main, Advanced & BITSET" },
  { id: ExamCategory.MEDICAL_ENTRANCE, name: "Medical", icon: Stethoscope, desc: "NEET UG, PG & AIIMS" },
  { id: ExamCategory.LAW_ENTRANCE, name: "Law / Judiciary", icon: Scale, desc: "CLAT, AILET & State PCS-J" },
  { id: ExamCategory.MBA_ENTRANCE, name: "Management", icon: Briefcase, desc: "CAT, MAT, XAT & GMAT" },
  { id: ExamCategory.POLICE_JOBS, name: "Police & SI", icon: ShieldCheck, desc: "State Police & Central Forces" },
];

export default function CategoriesPage() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return (
    <main className="min-h-screen bg-slate-50/50 pt-8 pb-16">
      <div className="max-w-[1200px] mx-auto px-4 lg:px-8 flex">
        <section className="flex-1">
          <div className="h-8 w-48 bg-slate-200 animate-pulse rounded-md mb-4" />
          <div className="h-4 w-96 bg-slate-200 animate-pulse rounded-md mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-[88px] bg-slate-200 animate-pulse rounded-xl" />)}
          </div>
        </section>
      </div>
    </main>
  );

  return (
    <main className="min-h-screen bg-slate-50/50 pt-8 pb-20">
      <div className="max-w-[1200px] mx-auto px-4 lg:px-8">
        
        {/* Ads top */}
        <div className="mb-8 hidden md:block">
          <LeaderboardAd id="cat-top-leaderboard" />
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Main Content */}
          <section className="flex-1">
            
            {/* Breadcrumb */}
            <nav className="flex items-center text-sm font-medium text-slate-500 mb-6">
              <Link href="/" className="hover:text-slate-900 transition-colors">Home</Link>
              <ChevronRight size={14} className="mx-2 text-slate-400" />
              <span className="text-slate-900">Categories</span>
            </nav>

            {/* Header */}
            <div className="flex flex-col space-y-2 mb-8">
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">Explore by Category</h1>
              <p className="text-slate-500 max-w-[600px] text-[15px]">
                Browse our comprehensive database of government exams and opportunities categorized by sector and industry.
              </p>
            </div>

            {/* Category Grid - Shadcn Minimalist Style */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {CATEGORY_DISPLAY.map((cat) => (
                <Link 
                  key={cat.id} 
                  href={`/c/${enumToSlug(cat.id)}`}
                  className="group flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-slate-100 bg-slate-50 text-slate-600 group-hover:text-slate-900 group-hover:bg-slate-100 transition-colors">
                      <cat.icon size={22} strokeWidth={2} />
                    </div>
                    <div className="flex flex-col gap-1">
                      <h3 className="font-semibold text-slate-900 text-[15px] leading-none tracking-tight">{cat.name}</h3>
                      <p className="text-[13px] text-slate-500 leading-none">{cat.desc}</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-slate-300 group-hover:text-slate-600 transition-colors" />
                </Link>
              ))}
            </div>

            <div className="mt-12">
              <Link href="/" className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 border border-slate-200 bg-white hover:bg-slate-100 hover:text-slate-900 h-9 px-4 py-2">
                <ChevronLeft size={16} className="mr-2" /> Back to Dashboard
              </Link>
            </div>
            
          </section>

          {/* Right Sidebar - Shadcn Sidebar Style */}
          <aside className="w-full lg:w-[320px] shrink-0 flex flex-col gap-6">
            
            <SidebarAd id="cat-right-ad-1" />
            
            {/* Shadcn Card for App Prompt */}
            <div className="rounded-xl border border-slate-200 bg-white text-slate-950 shadow-sm flex flex-col">
              <div className="flex flex-col space-y-1.5 p-6 pb-4">
                <div className="flex items-center gap-2 font-semibold leading-none tracking-tight mb-2">
                  <Smartphone size={18} className="text-slate-500" />
                  Get the App
                </div>
                <p className="text-sm text-slate-500">
                  Receive instant push notifications for new exam dates and admit cards.
                </p>
              </div>
              <div className="p-6 pt-0">
                <a 
                  href="https://play.google.com/store" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-slate-900 text-slate-50 hover:bg-slate-900/90 h-10 px-4 py-2 w-full"
                >
                  Download Free
                </a>
              </div>
            </div>

            <SidebarAd id="cat-right-ad-2" tall />

          </aside>
        </div>

      </div>
    </main>
  );
}
