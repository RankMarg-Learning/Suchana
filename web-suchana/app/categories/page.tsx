"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowRight, 
  Landmark, 
  ClipboardList, 
  Building2, 
  TrainFront,
  ShieldCheck, 
  GraduationCap, 
  Building, 
  Settings, 
  Stethoscope,
  Briefcase, 
  Scale,
  Calendar,
  Coins,
  BookOpen,
  Wrench
} from 'lucide-react';
import { ExamCategory } from '../lib/enums';
import { enumToSlug } from '../lib/types';

const CATEGORY_DISPLAY = [
  { id: ExamCategory.UPSC, name: "UPSC", icon: Landmark, desc: "Civil Services, IAS & IFS" },
  { id: ExamCategory.SSC, name: "SSC", icon: ClipboardList, desc: "CGL, CHSL, MTS & GD" },
  { id: ExamCategory.BANKING_JOBS, name: "Banking", icon: Building2, desc: "IBPS, SBI, RBI & Nabard" },
  { id: ExamCategory.RAILWAY_JOBS, name: "Railways", icon: TrainFront, desc: "RRB NTPC, ALP & Group D" },
  { id: ExamCategory.DEFENCE_JOBS, name: "Defence", icon: ShieldCheck, desc: "NDA, CDS, AFCAT & Agniveer" },
  { id: ExamCategory.TEACHING_ELIGIBILITY, name: "Teaching", icon: GraduationCap, desc: "CTET, NET, KVS & States" },
  { id: ExamCategory.STATE_PSC, name: "State PSC", icon: Building, desc: "BPSC, UPPCS, MPSC & Others" },
  { id: ExamCategory.ENGINEERING_EXAM, name: "Engineering", icon: Settings, desc: "JEE Main, Advanced & BITSAT" },
  { id: ExamCategory.MEDICAL_EXAM, name: "Medical", icon: Stethoscope, desc: "NEET UG, PG & AIIMS" },
  { id: ExamCategory.LAW_EXAM, name: "Law / Judiciary", icon: Scale, desc: "CLAT, AILET & State PCS-J" },
  { id: ExamCategory.MBA_EXAM, name: "Management", icon: Briefcase, desc: "CAT, MAT, XAT & GMAT" },
  { id: ExamCategory.POLICE_JOBS, name: "Police & SI", icon: ShieldCheck, desc: "State Police & Central Forces" },
];

export default function CategoriesPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) {
    return (
      <div className="wrap-home" style={{ marginTop: '24px', marginBottom: '60px', opacity: 0.2 }}>
        <div className="page-grid">
          <div className="content-col">
            <div className="skeleton" style={{ height: '40px', width: '250px', marginBottom: '24px' }} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="skeleton" style={{ height: '88px', width: '100%', borderRadius: '6px' }} />
              ))}
            </div>
          </div>
          <div className="sidebar-col">
            <div className="skeleton" style={{ height: '300px', width: '100%', borderRadius: '4px' }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="wrap-home" style={{ marginTop: '24px', marginBottom: '60px' }}>
      <div className="page-grid">
        
        {/* LEFT COLUMN: MAIN CONTENT */}
        <div className="content-col">
          
          {/* HEADER */}
          <div className="sh">
            <div className="sh-title">
              <span className="cat-tag">EXPLORE</span> Browse Exams by Sector
            </div>
            <div className="sh-link" style={{ color: 'var(--accent)' }}>
              {CATEGORY_DISPLAY.length} SECTORS
            </div>
          </div>

          {/* GRID OF CATEGORIES */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CATEGORY_DISPLAY.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.id}
                  href={`/c/${enumToSlug(cat.id)}`}
                  className="exam-card-modern"
                  style={{ 
                    display: 'flex', 
                    flexDirection: 'row', 
                    alignItems: 'center', 
                    gap: '16px', 
                    textDecoration: 'none',
                    padding: '16px 20px'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '44px',
                    height: '44px',
                    borderRadius: '6px',
                    background: 'rgba(124,58,237,0.06)',
                    color: 'var(--accent)',
                    flexShrink: 0
                  }}>
                    <Icon size={20} strokeWidth={2} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{
                      fontFamily: 'var(--hd)',
                      fontSize: '16px',
                      fontWeight: 800,
                      color: 'var(--ink)',
                      margin: 0
                    }}>
                      {cat.name}
                    </h3>
                    <p style={{
                      fontSize: '13px',
                      color: 'var(--text-muted)',
                      margin: '4px 0 0 0'
                    }}>
                      {cat.desc}
                    </p>
                  </div>
                  <ArrowRight size={15} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                </Link>
              );
            })}
          </div>

        </div>

        {/* RIGHT COLUMN: SIDEBAR */}
        <div className="sidebar-col">
          
          {/* ASPIRANT TOOLSET */}
          <div className="sw" style={{ marginTop: 0 }}>
            <div className="sw-head flex items-center gap-1.5">
              <Wrench size={16} className="text-purple-400" /> Aspirant Toolset
            </div>
            <div className="sw-body">
              <div className="tool-grid" style={{ gridTemplateColumns: '1fr' }}>
                <Link href="/age-calculator" className="tool-btn" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px', textDecoration: 'none' }}>
                  <span className="tool-icon" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Calendar size={18} />
                  </span>
                  Age Calculator
                </Link>
                <Link href="/salary-calculator" className="tool-btn" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px', textDecoration: 'none' }}>
                  <span className="tool-icon" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Coins size={18} />
                  </span>
                  Salary Calculator
                </Link>
                <Link href="/syllabus" className="tool-btn" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px', textDecoration: 'none' }}>
                  <span className="tool-icon" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    <BookOpen size={18} />
                  </span>
                  Syllabus Maps
                </Link>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
