"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, ArrowRight, Sparkles,
  Landmark, ClipboardList, Building2, TrainFront,
  ShieldCheck, GraduationCap, Building, Settings, Stethoscope,
  Briefcase, Scale
} from 'lucide-react';
import { ExamCategory } from '../lib/enums';
import { enumToSlug } from '../lib/types';
import SiteNav from '../components/SiteNav';
import SiteFooter from '../components/SiteFooter';

const CATEGORY_DISPLAY = [
  { id: ExamCategory.UPSC, name: "UPSC", icon: Landmark, desc: "Civil Services, IAS & IFS", color: "#3b82f6", popular: true },
  { id: ExamCategory.SSC, name: "SSC", icon: ClipboardList, desc: "CGL, CHSL, MTS & GD", color: "#10b981", popular: true },
  { id: ExamCategory.BANKING_JOBS, name: "Banking", icon: Building2, desc: "IBPS, SBI, RBI & Nabard", color: "#6366f1", popular: true },
  { id: ExamCategory.RAILWAY_JOBS, name: "Railways", icon: TrainFront, desc: "RRB NTPC, ALP & Group D", color: "#f59e0b", popular: true },
  { id: ExamCategory.DEFENCE_JOBS, name: "Defence", icon: ShieldCheck, desc: "NDA, CDS, AFCAT & Agniveer", color: "#ef4444", popular: true },
  { id: ExamCategory.TEACHING_ELIGIBILITY, name: "Teaching", icon: GraduationCap, desc: "CTET, NET, KVS & States", color: "#8b5cf6", popular: true },
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

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-white">
      <SiteNav />
      
      <main className="relative">
        <header className="page-header-premium">
           <div className="design-grid-bg" />
           <div className="orb-v6 orb-v6-primary !opacity-[0.05] !w-[400px] !h-[400px]" />
           
           <div className="container relative z-10">
            <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-600 mb-8 hover:translate-x-[-4px] transition-transform">
              <ArrowLeft size={14} /> Back to Gateway
            </Link>
            
            <div className="max-w-3xl">
              <div className="hero-badge-v6 !mb-6">
                <Sparkles size={12} /> Global Discovery
              </div>
              <h1 className="hero-title-v6 !text-4xl md:!text-5xl lg:!text-6xl mb-4">Explore by <br /><span className="gradient-text">Category.</span></h1>
              <p className="hero-desc-v6 !mx-0 !text-lg !mb-0">Discover recruitment notifications organized by your field of expertise.</p>
            </div>
          </div>
        </header>

        <section className="section-premium bg-slate-50/30">
          <div className="container">
            <div className="category-neo-grid !grid-cols-1 lg:!grid-cols-2">
              {CATEGORY_DISPLAY.map((cat, idx) => (
                <Link 
                  key={cat.id} 
                  href={`/c/${enumToSlug(cat.id)}`}
                  className="category-neo-card group tap-effect shadow-sm hover:shadow-xl hover:shadow-blue-500/5"
                  style={{ animationDelay: `${idx * 40}ms`, animation: 'fade-in 0.6s ease-out forwards' }}
                >
                  <div className="status-icon-box" style={{ background: `${cat.color}08` }}>
                    <cat.icon size={36} color={cat.color} strokeWidth={2.4} className="group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="status-label-title !text-xl mb-1">{cat.name}</h3>
                    <p className="status-label-small !mb-0 !text-[13px] !tracking-normal !normal-case !font-medium !text-slate-500">
                      {cat.desc}
                    </p>
                  </div>

                  <ArrowRight size={24} className="text-slate-200 group-hover:text-blue-600 group-hover:translate-x-2 transition-all duration-300" />
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
