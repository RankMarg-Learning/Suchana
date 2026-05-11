"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Calendar, Clock, AlertCircle, CalendarDays, Activity, Info } from 'lucide-react';

export default function AgeCalculatorClient() {
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
      // Get days in the previous month of the target date
      const prevMonth = new Date(d2.getFullYear(), d2.getMonth(), 0);
      days += prevMonth.getDate();
    }
    if (months < 0) {
      years -= 1;
      months += 12;
    }

    // Convert to UTC to accurately calculate absolute differences without DST issues
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

  if (!mounted) return <div style={{ minHeight: '500px' }} />;

  return (
    <div suppressHydrationWarning style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>

      {/* Input Section */}
      <div className="feature-card" style={{ padding: 'clamp(20px, 4vw, 32px)', position: 'relative', zIndex: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(var(--accent-rgb), 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
            <Calendar size={20} />
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, margin: 0 }}>Calculate Your Exact Age</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '20px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Date of Birth
            </label>
            <input
              type="date"
              className="form-input"
              style={{ padding: '14px 16px', fontSize: '16px', fontWeight: 600, background: 'var(--bg-card)' }}
              value={dob}
              onChange={(e) => setDob(e.target.value)}
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Age As On Date (Target Cut-off)
            </label>
            <input
              type="date"
              className="form-input"
              style={{ padding: '14px 16px', fontSize: '16px', fontWeight: 600, background: 'var(--bg-card)' }}
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
            />
          </div>
        </div>

        <div style={{ marginTop: '20px', display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '12px', background: 'rgba(var(--accent-rgb), 0.05)', borderRadius: '8px' }}>
          <Info size={16} className="text-accent" style={{ flexShrink: 0, marginTop: '2px' }} />
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
            Government exams usually specify a crucial cutoff date (e.g., "Age as on 1st August 2024"). Adjust the "Age As On Date" field to check your exact eligibility for specific exams.
          </p>
        </div>
      </div>

      {/* Results Section */}
      {results && !('error' in results) ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }} className="calculator-grid">

          {/* Main Exact Age Card */}
          <div className="feature-card" style={{ padding: '0', overflow: 'hidden', background: 'var(--accent)', color: 'white', gridColumn: '1 / -1' }}>
            <div style={{ padding: 'clamp(20px, 4vw, 32px)', position: 'relative' }}>
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "radial-gradient(circle at top right, rgba(255,255,255,0.2) 0%, transparent 60%)",
                  zIndex: 0
                }}
              />
              <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <div style={{ fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.9, marginBottom: '16px' }}>
                  Your Exact Age
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 'clamp(12px, 3vw, 24px)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span style={{ fontSize: 'clamp(36px, 8vw, 56px)', fontWeight: 800, fontFamily: 'var(--font-heading)', lineHeight: 1 }}>{results.years}</span>
                    <span style={{ fontSize: '14px', fontWeight: 600, opacity: 0.9 }}>Years</span>
                  </div>
                  <div style={{ fontSize: 'clamp(36px, 8vw, 56px)', fontWeight: 800, opacity: 0.5, lineHeight: 1 }}>:</div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span style={{ fontSize: 'clamp(36px, 8vw, 56px)', fontWeight: 800, fontFamily: 'var(--font-heading)', lineHeight: 1 }}>{results.months}</span>
                    <span style={{ fontSize: '14px', fontWeight: 600, opacity: 0.9 }}>Months</span>
                  </div>
                  <div style={{ fontSize: 'clamp(36px, 8vw, 56px)', fontWeight: 800, opacity: 0.5, lineHeight: 1 }}>:</div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span style={{ fontSize: 'clamp(36px, 8vw, 56px)', fontWeight: 800, fontFamily: 'var(--font-heading)', lineHeight: 1 }}>{results.days}</span>
                    <span style={{ fontSize: '14px', fontWeight: 600, opacity: 0.9 }}>Days</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Breakdown Card */}
          <div className="feature-card" style={{ padding: '24px', gridColumn: '1 / -1' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <Activity size={18} className="text-accent" />
              <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>Alternative Breakdowns</h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '16px' }}>

              <div style={{ padding: '16px', background: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border)', textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  {results.totalMonths}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Months</div>
              </div>

              <div style={{ padding: '16px', background: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border)', textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  {results.totalWeeks} <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-muted)' }}>+ {results.remainingDaysAfterWeeks} d</span>
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Weeks</div>
              </div>

              <div style={{ padding: '16px', background: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border)', textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  {results.totalDays.toLocaleString('en-IN')}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Days</div>
              </div>

            </div>
          </div>

        </div>
      ) : (
        results && 'error' in results && (
          <div className="feature-card" style={{ padding: '24px', background: '#fef2f2', border: '1px solid #fecaca' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#991b1b' }}>
              <AlertCircle size={20} />
              <span style={{ fontWeight: 600 }}>{results.error}</span>
            </div>
          </div>
        )
      )}

      {/* Utility Styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @media (max-width: 900px) {
          .calculator-grid {
            grid-template-columns: minmax(0, 1fr) !important;
          }
        }
      `}} />
    </div>
  );
}
