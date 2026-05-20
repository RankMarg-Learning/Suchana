"use client";

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  Calendar, Clock, AlertCircle, CalendarDays, Activity, Info,
  CheckCircle2, Award, ClipboardCheck, Wrench, Folder, FileText, Mail, Map
} from 'lucide-react';
import MidContentAd from '../components/ads/MidContentAd';

export default function AgeCalculatorClient({ children }: { children?: React.ReactNode }) {
  const [dob, setDob] = useState<string>('2000-01-01');
  const [targetDate, setTargetDate] = useState<string>(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const results = useMemo(() => {
    if (!dob || !targetDate) return null;

    const d1 = new Date(dob);
    const d2 = new Date(targetDate);

    if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return null;
    if (d1 > d2) return { error: "Date of Birth cannot be after the Target Date." };

    let years = d2.getFullYear() - d1.getFullYear();
    let months = d2.getMonth() - d1.getMonth();
    let days = d2.getDate() - d1.getDate();

    if (days < 0) {
      months -= 1;
      const prevMonth = new Date(d2.getFullYear(), d2.getMonth(), 0);
      days += prevMonth.getDate();
    }
    if (months < 0) {
      years -= 1;
      months += 12;
    }

    const utc1 = Date.UTC(d1.getFullYear(), d1.getMonth(), d1.getDate());
    const utc2 = Date.UTC(d2.getFullYear(), d2.getMonth(), d2.getDate());

    const totalDays = Math.floor((utc2 - utc1) / (1000 * 60 * 60 * 24));
    const totalWeeks = Math.floor(totalDays / 7);
    const remainingDaysAfterWeeks = totalDays % 7;
    const totalMonths = (years * 12) + months;

    return {
      years,
      months,
      days,
      totalDays,
      totalWeeks,
      remainingDaysAfterWeeks,
      totalMonths
    };
  }, [dob, targetDate]);

  if (!mounted) return <div style={{ minHeight: '600px' }} />;

  return (
    <>


      <div className="wrap-home" style={{ marginTop: '24px' }}>
        <div className="page-grid">

          {/* CONTENT COL */}
          <div className="content-col">

            {/* CALCULATOR MAIN FORM CARD */}
            <div className="fade-up d1">
              <div className="sh">
                <div className="sh-title"><span className="cat-tag">UTILITY</span> Age Calculator</div>
                <div className="sh-link">ELIGIBILITY TOOL</div>
              </div>

              <div className="featured-grid" style={{ gridTemplateColumns: '1fr', cursor: 'default' }}>
                <div className="feat-main" style={{ minHeight: 'auto', padding: '24px' }}>
                  <div className="feat-bg" style={{ background: 'linear-gradient(135deg,#1f2937,#111827)' }}></div>
                  <div className="feat-bg-pattern"></div>
                  <div className="feat-main-inner" style={{ position: 'relative', zIndex: 5 }}>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', width: '100%' }}>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 700, color: 'var(--gold-lt)' }}>
                          DATE OF BIRTH
                        </label>
                        <input
                          type="date"
                          className="form-input"
                          style={{
                            width: '100%',
                            padding: '12px 14px',
                            fontSize: '16px',
                            fontWeight: 700,
                            background: '#1f2937',
                            border: '1px solid #374151',
                            borderRadius: '4px',
                            color: '#fff'
                          }}
                          value={dob}
                          onChange={(e) => setDob(e.target.value)}
                        />
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 700, color: 'var(--gold-lt)' }}>
                          AGE AS ON DATE (CUT-OFF)
                        </label>
                        <input
                          type="date"
                          className="form-input"
                          style={{
                            width: '100%',
                            padding: '12px 14px',
                            fontSize: '16px',
                            fontWeight: 700,
                            background: '#1f2937',
                            border: '1px solid #374151',
                            borderRadius: '4px',
                            color: '#fff'
                          }}
                          value={targetDate}
                          onChange={(e) => setTargetDate(e.target.value)}
                        />
                      </div>
                    </div>

                    <div style={{ marginTop: '20px', display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <Info size={16} className="text-yellow-400" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <p style={{ fontSize: '16px', color: '#e5e7eb', margin: 0, lineHeight: 1.5 }}>
                        Government exams usually specify a crucial cutoff date (e.g., "Age as on 1st August 2026"). Adjust the <b>"Age As On Date"</b> field to verify your exact eligibility.
                      </p>
                    </div>

                  </div>
                </div>
              </div>
            </div>

            {/* RESULTS VIEW */}
            {results && !('error' in results) ? (
              <div className="fade-up" style={{ marginTop: '32px' }}>
                <div className="sh">
                  <div className="sh-title"><span className="cat-tag">RESULTS</span> Calculation Output</div>
                  <div className="sh-link" style={{ color: 'var(--mint)' }}>ACCURATE ✔</div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>

                  {/* GIANT DOCK SCOREBOARD STYLE CARDS */}
                  <div className="featured-grid" style={{ gridTemplateColumns: '1fr', cursor: 'default' }}>
                    <div className="feat-main" style={{ minHeight: '160px', padding: '32px 24px', textAlign: 'center' }}>
                      <div className="feat-bg" style={{ background: 'linear-gradient(135deg,#7c3aed,#4c1d95)' }}></div>
                      <div className="feat-bg-pattern"></div>
                      <div className="feat-main-inner" style={{ alignItems: 'center' }}>
                        <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--gold-lt)', marginBottom: '12px' }}>
                          Your Calculated Exact Age
                        </div>

                        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: '20px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <span style={{ fontSize: '42px', fontWeight: 800, fontFamily: 'var(--hd)', lineHeight: 1, color: '#fff' }}>{results.years}</span>
                            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--gold-lt)', textTransform: 'uppercase', marginTop: '4px' }}>Years</span>
                          </div>
                          <span style={{ fontSize: '32px', fontWeight: 800, opacity: 0.5, color: '#fff', paddingBottom: '16px' }}>:</span>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <span style={{ fontSize: '42px', fontWeight: 800, fontFamily: 'var(--hd)', lineHeight: 1, color: '#fff' }}>{results.months}</span>
                            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--gold-lt)', textTransform: 'uppercase', marginTop: '4px' }}>Months</span>
                          </div>
                          <span style={{ fontSize: '32px', fontWeight: 800, opacity: 0.5, color: '#fff', paddingBottom: '16px' }}>:</span>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <span style={{ fontSize: '42px', fontWeight: 800, fontFamily: 'var(--hd)', lineHeight: 1, color: '#fff' }}>{results.days}</span>
                            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--gold-lt)', textTransform: 'uppercase', marginTop: '4px' }}>Days</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ALTERNATIVE BREAKDOWNS (Like 3 column article rows) */}
                  <div className="art-row">
                    <div className="art-card" style={{ cursor: 'default' }}>
                      <div className="art-thumb" style={{ background: 'linear-gradient(135deg,#1e3a5f,#0a1a30)', height: '100px' }}>
                        <div className="art-thumb-bg"><Calendar size={36} /></div>
                      </div>
                      <div className="art-body" style={{ padding: '16px' }}>
                        <span className="art-cat" style={{ color: 'var(--sky)' }}>MONTHS</span>
                        <div className="art-title" style={{ fontSize: '24px', fontWeight: 800, color: 'var(--ink)' }}>{results.totalMonths}</div>
                        <div className="art-excerpt" style={{ fontSize: '16px', marginTop: '4px' }}>Total completed calendar months elapsed between dates.</div>
                      </div>
                    </div>

                    <div className="art-card" style={{ cursor: 'default' }}>
                      <div className="art-thumb" style={{ background: 'linear-gradient(135deg,#3b1f5e,#1a0a2e)', height: '100px' }}>
                        <div className="art-thumb-bg"><Clock size={36} /></div>
                      </div>
                      <div className="art-body" style={{ padding: '16px' }}>
                        <span className="art-cat" style={{ color: 'var(--rose)' }}>WEEKS</span>
                        <div className="art-title" style={{ fontSize: '24px', fontWeight: 800, color: 'var(--ink)' }}>
                          {results.totalWeeks} <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-muted)' }}>+ {results.remainingDaysAfterWeeks} d</span>
                        </div>
                        <div className="art-excerpt" style={{ fontSize: '16px', marginTop: '4px' }}>Total weeks elapsed with remaining days remaining.</div>
                      </div>
                    </div>

                    <div className="art-card" style={{ cursor: 'default' }}>
                      <div className="art-thumb" style={{ background: 'linear-gradient(135deg,#064e3b,#065f46)', height: '100px' }}>
                        <div className="art-thumb-bg"><CalendarDays size={36} /></div>
                      </div>
                      <div className="art-body" style={{ padding: '16px' }}>
                        <span className="art-cat" style={{ color: 'var(--mint)' }}>DAYS</span>
                        <div className="art-title" style={{ fontSize: '24px', fontWeight: 800, color: 'var(--ink)' }}>{results.totalDays.toLocaleString('en-IN')}</div>
                        <div className="art-excerpt" style={{ fontSize: '16px', marginTop: '4px' }}>Absolute mathematical day count between dates.</div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            ) : (
              results && 'error' in results && (
                <div className="fade-up" style={{ marginTop: '32px' }}>
                  <div className="feature-card" style={{ padding: '24px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#991b1b' }}>
                      <AlertCircle size={20} />
                      <span style={{ fontWeight: 700 }}>{results.error}</span>
                    </div>
                  </div>
                </div>
              )
            )}

            <MidContentAd />

            {children}

          </div>

          {/* SIDEBAR COL */}
          <div className="sidebar-col">

            {/* SW - Popular Cutoffs (Like Deadlines) */}
            <div className="sw" style={{ marginTop: 0 }}>
              <div className="sw-head flex items-center gap-1.5">
                <Clock size={16} className="text-amber-500" /> Crucial Cut-Off Dates (2026)
              </div>
              <div className="sw-body">
                <div className="dl-item" style={{ cursor: 'default' }}>
                  <div className="dl-days">Aug 1</div>
                  <div>
                    <div className="dl-name">UPSC CSE 2026 Cutoff</div>
                    <div className="dl-date">Age criteria computed as on date</div>
                  </div>
                </div>
                <div className="dl-item" style={{ cursor: 'default' }}>
                  <div className="dl-days">Aug 1</div>
                  <div>
                    <div className="dl-name">SSC CGL 2026 Cutoff</div>
                    <div className="dl-date">Age criteria computed as on date</div>
                  </div>
                </div>
                <div className="dl-item" style={{ cursor: 'default' }}>
                  <div className="dl-days urgent">Jul 1</div>
                  <div>
                    <div className="dl-name">IBPS PO 2026 Cutoff</div>
                    <div className="dl-date">Age criteria computed as on date</div>
                  </div>
                </div>
              </div>
            </div>

            {/* SW - General Limits (Like Status Board) */}
            <div className="sw">
              <div className="sw-head flex items-center gap-1.5">
                <ClipboardCheck size={16} className="text-blue-400" /> General Age Limit Limits
              </div>
              <div className="sw-body">
                <div className="score-item" style={{ cursor: 'default' }}>
                  <div className="sc-rank">01</div>
                  <div className="sc-exam">UPSC Civil Services</div>
                  <span className="sc-status ss-open" style={{ fontFamily: 'var(--mono)', fontSize: '11px' }}>21 - 32 Years</span>
                </div>
                <div className="score-item" style={{ cursor: 'default' }}>
                  <div className="sc-rank">02</div>
                  <div className="sc-exam">SSC CGL Officers</div>
                  <span className="sc-status ss-open" style={{ fontFamily: 'var(--mono)', fontSize: '11px' }}>18 - 30 Years</span>
                </div>
                <div className="score-item" style={{ cursor: 'default' }}>
                  <div className="sc-rank">03</div>
                  <div className="sc-exam">NDA / Naval Academy</div>
                  <span className="sc-status ss-open" style={{ fontFamily: 'var(--mono)', fontSize: '11px' }}>16.5 - 19.5 Yrs</span>
                </div>
                <div className="score-item" style={{ cursor: 'default' }}>
                  <div className="sc-rank">04</div>
                  <div className="sc-exam">CDS Defence Service</div>
                  <span className="sc-status ss-open" style={{ fontFamily: 'var(--mono)', fontSize: '11px' }}>20 - 24 Years</span>
                </div>
              </div>
            </div>

            {/* SW - Alert Info checklist */}
            <div className="sw">
              <div className="sw-head flex items-center gap-1.5">
                <Award size={16} className="text-yellow-400" /> Eligibility Verification Checklist
              </div>
              <div className="sw-body">
                <ul style={{ paddingLeft: '16px', margin: 0, fontSize: '16px', color: 'var(--text2)', lineHeight: 1.8 }}>
                  <li>Date of Birth matches Class 10/Matriculation Certificate precisely.</li>
                  <li>Check reservation guidelines for category-wise relaxation (OBC, SC, ST, PwD).</li>
                  <li>Verify cutoff dates for each specific post notification separately.</li>
                </ul>
              </div>
            </div>

            {/* QUICK TOOLS */}
            <div className="sw">
              <div className="sw-head flex items-center gap-1.5">
                <Wrench size={16} className="text-purple-400" /> Platform Utility Hub
              </div>
              <div className="sw-body">
                <div className="tool-grid" style={{ gridTemplateColumns: '1fr' }}>
                  <Link href="/salary-calculator" className="tool-btn">
                    <span className="tool-icon"><FileText size={14} className="text-emerald-500" /></span>Salary Calculator
                  </Link>
                  <Link href="/syllabus" className="tool-btn">
                    <span className="tool-icon"><Map size={14} className="text-sky-500" /></span>Syllabus Directories
                  </Link>
                  <Link href="/contact" className="tool-btn">
                    <span className="tool-icon"><Mail size={14} className="text-rose-500" /></span>Contact Help Desk
                  </Link>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </>
  );
}
