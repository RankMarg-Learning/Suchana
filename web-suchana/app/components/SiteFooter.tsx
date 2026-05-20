"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function SiteFooter() {
  const [currentYear, setCurrentYear] = useState(2026);
  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
        /* ─── FOOTER ─── */
        .footer-wrap {
          background: #0c0f17; color: rgba(255,255,255,.6);
          padding: 36px 24px 20px;
          font-family: 'Sora', sans-serif;
        }
        .footer-wrap a {
          text-decoration: none; color: inherit;
        }
        .ft-grid {
          max-width: 1300px; margin: 0 auto;
          display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
          gap: 30px; margin-bottom: 28px;
        }
        .ft-brand .logo {
          font-family: 'Playfair Display', Georgia, serif; font-size: 28px; font-weight: 900;
          color: #fff; margin-bottom: 8px;
        }
        .ft-brand .logo span { color: #d8b4fe; } /* Purple theme */
        .ft-brand p { font-size: 12px; line-height: 1.8; max-width: 220px; }
        .ft-col h4 {
          font-family: 'JetBrains Mono', monospace; font-size: 10px; font-weight: 700;
          color: #d8b4fe; letter-spacing: 1.5px; text-transform: uppercase; /* Purple theme */
          margin-bottom: 12px; padding-bottom: 6px;
          border-bottom: 1px solid rgba(255,255,255,.1);
        }
        .ft-col a { display: block; font-size: 12px; margin-bottom: 7px; transition: color .2s; }
        .ft-col a:hover { color: #d8b4fe; } /* Purple theme */
        .ft-bottom {
          max-width: 1300px; margin: 0 auto;
          border-top: 1px solid rgba(255,255,255,.1); padding-top: 16px;
          display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;
        }
        .ft-bottom p { font-size: 11px; font-family: 'JetBrains Mono', monospace; }

        @media(max-width: 1024px) {
          .ft-grid { grid-template-columns: 1fr 1fr 1fr; }
        }
        @media(max-width: 768px) {
          .footer-wrap { padding: 32px 16px 20px; }
          .ft-grid { grid-template-columns: 1fr 1fr; gap: 24px 16px; }
          .ft-bottom { flex-direction: column; align-items: flex-start; gap: 12px; }
        }
        @media(max-width: 520px) {
          .ft-grid { grid-template-columns: 1fr; gap: 24px; }
        }
      `}} />

      <footer className="footer-wrap">
        <div className="ft-grid">
          <div className="ft-brand">
            <Link href="/" className="logo">Suchana<span>.</span></Link>
            <p>India's most trusted government exam intelligence platform. Real-time lifecycle tracking for 500+ exams from 100+ official agencies. Official data only — no rumours.</p>
          </div>
          <div className="ft-col">
            <h4>Updates</h4>
            <Link href="/s/notification">Notifications</Link>
            <Link href="/s/admit-card-out">Admit Cards</Link>
            <Link href="/s/result-declared">Results</Link>
            <Link href="/s/answer-key-out">Answer Keys</Link>
          </div>
          <div className="ft-col">
            <h4>Study</h4>
            <Link href="/topic/syllabus">Syllabus PDFs</Link>
            <Link href="/topic/previous-year-papers">PYQ Papers</Link>
            <Link href="/topic/exam-analysis">Exam Analysis</Link>
            <Link href="/topic/books">Best Books</Link>
            <Link href="/topic/preparation-guides">Prep Strategy</Link>
          </div>
          <div className="ft-col">
            <h4>Knowledge</h4>
            <Link href="/topic/static-gk">Static GK</Link>
            <Link href="/topic/current-affairs">Current Affairs</Link>
            <Link href="/articles">Exam News</Link>
          </div>
          <div className="ft-col">
            <h4>Platform</h4>
            <Link href="/about">About Us</Link>
            <Link href="/contact">Contact Us</Link>
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/disclaimer">Disclaimer</Link>
            <Link href="/terms">Terms &amp; Conditions</Link>
            <Link href="/age-calculator">Age Calculator</Link>
            <Link href="/salary-calculator">Salary Calculator</Link>
          </div>
        </div>
        <div className="ft-bottom">
          <p>© {currentYear} Exam Suchana · Data sourced from official government gazettes</p>
        </div>
      </footer>
    </>
  );
}
