import type { Metadata } from "next";
import {
  Users, Target, CheckCircle2, Zap, Shield,
  Flag, Award, Clock, Activity, Folder,
  MapPin, Globe, BarChart2, FileText, Wrench, Mail, CalendarDays, Map
} from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Us — Exam Suchana",
  description:
    "Learn about Exam Suchana — India's leading sovereign government exam lifecycle tracker. Unifying fragmented pariksha data into accurate, structured timelines.",
};

export default function AboutPage() {
  return (
    <>


      <div className="wrap-home" style={{ marginTop: '32px', marginBottom: '60px' }}>

        {/* PREMIUM EDITOR HEADER */}
        <div className="about-header" style={{ marginBottom: '40px', borderBottom: '2px solid var(--ink)', paddingBottom: '24px' }}>
          <div className="hero-badge" style={{ marginBottom: '16px' }}>
            <span className="hero-badge-dot" style={{ background: 'var(--accent, #7c3aed)' }} />
            The Suchana Chronicle
          </div>
          <h1 style={{ fontFamily: 'var(--hd)', fontSize: '38px', fontWeight: 800, color: 'var(--ink)', lineHeight: 1.1, letterSpacing: '-0.5px' }}>
            Unifying India&apos;s Fragmented Exam Intelligence
          </h1>
          <p style={{ fontFamily: 'var(--body)', fontSize: '15px', color: 'var(--text-muted)', marginTop: '8px' }}>
            Published by the Editorial Board of Exam Suchana Network • Updated Daily
          </p>
        </div>

        {/* ASYMMETRICAL 3-COLUMN EDITORIAL GRID */}
        <div className="about-grid">

          {/* COLUMN 1: THE EDITORIAL LEAD (Left - 1.4fr) */}
          <div className="ed-intel-col">
            <div className="sh">
              <div className="sh-title"><span className="cat-tag">INTEL</span> The Origin Story</div>
            </div>

            <p className="ed-lead">
              Every year, thousands of brilliant candidates across India miss critical registration deadlines or syllabus modifications not because they aren&apos;t prepared, but because crucial pariksha updates are buried inside complex bureaucratic PDF notifications and fragmented state portals.
            </p>

            <p style={{ fontSize: '14px', lineHeight: 1.7, color: 'var(--text2)', marginTop: '16px', fontFamily: 'var(--body)' }}>
              Exam Suchana was born out of this core frustration. We recognized that aspirants spend up to 20% of their study time manually refreshing recruitment boards, checking results links, or auditing date changes. We built this platform as a high-precision, military-grade lifecycle tracker to put valuable study hours back in the hands of candidates.
            </p>

            <div className="ed-quote">
              &ldquo;Aspirants shouldn&apos;t have to act like investigative journalists just to find out if an admit card is out. Our mission is 100% clarity and zero missed deadlines.&rdquo;
              <div style={{ fontSize: '12px', fontWeight: 700, marginTop: '8px', color: 'var(--ink)' }}>— Chief Editorial Board, Exam Suchana</div>
            </div>

            {/* CHRONOLOGY ROADMAP */}
            <div className="sh" style={{ marginTop: '36px' }}>
              <div className="sh-title"><span className="cat-tag">HISTORY</span> Platform Milestones</div>
            </div>

            <div className="chrono-list">
              <div className="chrono-item">
                <div className="chrono-year">2024</div>
                <div className="chrono-body">
                  <div className="chrono-title">The Fragmented Phase</div>
                  <div className="chrono-desc">Platform conceptualized. Designed our core database schemas to structure chaotic, multi-page official government notifications into linear timelines.</div>
                </div>
              </div>
              <div className="chrono-item">
                <div className="chrono-year">2025</div>
                <div className="chrono-body">
                  <div className="chrono-title">Manual Verification Architecture</div>
                  <div className="chrono-desc">Introduced our double-verifier content dispatch workflow. Every syllabus, apply link, and fee detail is manually audited by two independent researchers before going live.</div>
                </div>
              </div>
              <div className="chrono-item">
                <div className="chrono-year">2026</div>
                <div className="chrono-body">
                  <div className="chrono-title">Sovereign Scaling</div>
                  <div className="chrono-desc">Reached 50K+ active daily aspirants. Scaling verified notifications across all 28 states and UTs with average update latency of under 5 minutes.</div>
                </div>
              </div>
            </div>
          </div>

          {/* COLUMN 2: THE INTEGRITY CORE (Center - 1.1fr) */}
          <div className="ed-core-col">
            <div className="sh">
              <div className="sh-title"><span className="cat-tag">INTEGRITY</span> Core Pillars</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div className="art-card" style={{ cursor: 'default', margin: 0 }}>
                <div className="art-thumb" style={{ background: 'linear-gradient(135deg,#1e3a8a,#1e40af)', height: '120px' }}>
                  <div className="art-thumb-bg"><Shield size={36} /></div>
                </div>
                <div className="art-body" style={{ padding: '16px' }}>
                  <span className="art-cat" style={{ color: 'var(--sky)' }}>VERIFY</span>
                  <div className="art-title" style={{ fontSize: '15px', marginBottom: '6px' }}>Manually Audited Data</div>
                  <div className="art-excerpt" style={{ fontSize: '12px', lineHeight: 1.5 }}>Every alert on Exam Suchana is extracted from official state gazettes and verified. Zero speculations.</div>
                </div>
              </div>

              <div className="art-card" style={{ cursor: 'default', margin: 0 }}>
                <div className="art-thumb" style={{ background: 'linear-gradient(135deg,#7f1d1d,#991b1b)', height: '120px' }}>
                  <div className="art-thumb-bg"><Zap size={36} /></div>
                </div>
                <div className="art-body" style={{ padding: '16px' }}>
                  <span className="art-cat" style={{ color: 'var(--rose)' }}>SPEED</span>
                  <div className="art-title" style={{ fontSize: '15px', marginBottom: '6px' }}>Zero Delay Dispatch</div>
                  <div className="art-excerpt" style={{ fontSize: '12px', lineHeight: 1.5 }}>Our tracking engines process apply, admit card, and result lists within minutes of government release.</div>
                </div>
              </div>

              <div className="art-card" style={{ cursor: 'default', margin: 0 }}>
                <div className="art-thumb" style={{ background: 'linear-gradient(135deg,#064e3b,#065f46)', height: '120px' }}>
                  <div className="art-thumb-bg"><Globe size={36} /></div>
                </div>
                <div className="art-body" style={{ padding: '16px' }}>
                  <span className="art-cat" style={{ color: 'var(--mint)' }}>PRIVACY</span>
                  <div className="art-title" style={{ fontSize: '15px', marginBottom: '6px' }}>Strict Candidate Shield</div>
                  <div className="art-excerpt" style={{ fontSize: '12px', lineHeight: 1.5 }}>We never trade, sell, or lease your study records or details to coaching hubs or call centers.</div>
                </div>
              </div>
            </div>
          </div>

          {/* COLUMN 3: PLATFORM CONTEXT (Right - 0.9fr) */}
          <div className="ed-side-col">

            {/* SW - Platform Stats */}
            <div className="sw" style={{ marginTop: 0 }}>
              <div className="sw-head flex items-center gap-1.5">
                <Clock size={16} className="text-amber-500" /> Operational Stats
              </div>
              <div className="sw-body">
                <div className="dl-item" style={{ cursor: 'default' }}>
                  <div className="dl-days">Live</div>
                  <div>
                    <div className="dl-name">Exams Ongoing</div>
                    <div className="dl-date">45+ boards actively tracked</div>
                  </div>
                </div>
                <div className="dl-item" style={{ cursor: 'default' }}>
                  <div className="dl-days">12K</div>
                  <div>
                    <div className="dl-name">Verified Links</div>
                    <div className="dl-date">Direct apply & check redirects</div>
                  </div>
                </div>
                <div className="dl-item" style={{ cursor: 'default' }}>
                  <div className="dl-days urgent">28</div>
                  <div>
                    <div className="dl-name">Indian States</div>
                    <div className="dl-date">Unified territorial mapping</div>
                  </div>
                </div>
              </div>
            </div>

            {/* SW - Platform Health Board */}
            <div className="sw">
              <div className="sw-head flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-blue-400" /> System Health
              </div>
              <div className="sw-body">
                <div className="score-item" style={{ cursor: 'default' }}>
                  <div className="sc-rank">01</div>
                  <div className="sc-exam">UPSC Trackers</div>
                  <span className="sc-status ss-open">LIVE</span>
                </div>
                <div className="score-item" style={{ cursor: 'default' }}>
                  <div className="sc-rank">02</div>
                  <div className="sc-exam">SSC Trackers</div>
                  <span className="sc-status ss-open">LIVE</span>
                </div>
                <div className="score-item" style={{ cursor: 'default' }}>
                  <div className="sc-rank">03</div>
                  <div className="sc-exam">State Boards</div>
                  <span className="sc-status ss-open">LIVE</span>
                </div>
              </div>
            </div>

            {/* SW - Free Alerts Form CTA */}
            <div className="sw">
              <div className="sw-head flex items-center gap-1.5">
                <Award size={16} className="text-yellow-400" /> Subscription Desk
              </div>
              <div className="sw-body">
                <p style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 12, lineHeight: 1.6 }}>
                  Receive clean notifications on exam city updates and fee portals without ads.
                </p>
                <Link href="/onboarding" className="tl-cta cta-gold" style={{ display: 'block', textAlign: 'center', width: '100%', padding: '10px 0', fontWeight: 700 }}>
                  Get Alerts For Free →
                </Link>
              </div>
            </div>

            {/* QUICK TOOLS */}
            <div className="sw">
              <div className="sw-head flex items-center gap-1.5">
                <Wrench size={16} className="text-purple-400" /> Aspirant Free Tools
              </div>
              <div className="sw-body">
                <div className="tool-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                  <Link href="/age-calculator" className="tool-btn">
                    Age Calc
                  </Link>
                  <Link href="/salary-calculator" className="tool-btn">
                    Salary Calc
                  </Link>
                  <Link href="/syllabus" className="tool-btn">
                    Syllabus
                  </Link>
                  <Link href="/contact" className="tool-btn">
                    Help Desk
                  </Link>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* PAGE SPECIFIC CUSTOM EDITORIAL STYLE OVERRIDES */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .about-grid {
          display: grid;
          grid-template-columns: 1.4fr 1.1fr 0.9fr;
          gap: 32px;
        }

        .ed-lead {
          font-size: 17px;
          line-height: 1.75;
          color: var(--ink);
          font-family: var(--body);
          font-weight: 500;
        }

        .ed-lead::first-letter {
          float: left;
          font-size: 72px;
          line-height: 54px;
          padding-top: 4px;
          padding-right: 12px;
          padding-left: 2px;
          font-family: var(--hd);
          font-weight: 800;
          color: var(--accent, #7c3aed);
        }

        .ed-quote {
          border-left: 3px solid var(--accent, #7c3aed);
          padding: 16px 20px;
          margin: 28px 0;
          background: #f9fafb;
          font-style: italic;
          font-size: 15px;
          line-height: 1.6;
          color: var(--text2, #4b5563);
          border-radius: 0 4px 4px 0;
        }

        .chrono-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
          margin-top: 24px;
        }

        .chrono-item {
          display: flex;
          gap: 16px;
        }

        .chrono-year {
          font-family: var(--hd);
          font-size: 18px;
          font-weight: 800;
          color: var(--accent, #7c3aed);
          min-width: 48px;
          padding-top: 2px;
        }

        .chrono-body {
          border-left: 2px solid var(--border, #e5e7eb);
          padding-left: 16px;
          flex: 1;
        }

        .chrono-title {
          font-family: var(--hd);
          font-size: 14px;
          font-weight: 700;
          color: var(--ink, #111827);
          margin-bottom: 4px;
        }

        .chrono-desc {
          font-size: 12.5px;
          color: var(--text2, #4b5563);
          line-height: 1.55;
        }

        @media(max-width: 1100px) {
          .about-grid {
            grid-template-columns: 1.3fr 1fr;
          }
          .ed-side-col {
            grid-column: span 2;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
          }
          .ed-side-col .sw {
            margin-top: 0 !important;
          }
        }

        @media(max-width: 768px) {
          .about-grid {
            grid-template-columns: 1fr;
            gap: 40px;
          }
          .ed-side-col {
            grid-column: span 1;
            grid-template-columns: 1fr;
            gap: 0;
          }
        }
      `}} />
    </>
  );
}
