"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { EXAM_CATEGORIES, EXAM_STATUSES } from "../lib/enums";
import { enumToSlug, cleanLabel, slugToEnum } from "../lib/types";

export default function SiteFooter() {
  const [currentYear, setCurrentYear] = useState(2026);
  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="footer" id="main-footer">
      <div className="container">
        <div className="footer-top-row">
          <div className="footer-grid">
            {/* ─── Brand & Summary ─── */}
            <div className="footer-brand">
              <Link href="/" className="logo">
                <div className="logo-icon-wrapper">
                  <Image src={'/examsuchana-logoT.png'} height={44} width={44} alt="Exam Suchana" priority />
                </div>
                <span className="logo-text">
                  Exam <span>Suchana</span>
                </span>
              </Link>
              <p className="footer-brand-desc">
                India&apos;s most structured government exam lifecycle tracker. 
                Our platform provides millisecond-precise status updates for 500+ exams from 100+ conducting bodies.
              </p>
              
              <div className="footer-socials">
                {['Twitter', 'Instagram', 'Telegram', 'Linkedin'].map(platform => (
                  <a key={platform} href="#" className="social-link" title={platform}>
                    <span className="social-icon-placeholder" />
                  </a>
                ))}
              </div>
            </div>

            {/* ─── Column 2: By Category ─── */}
            <div className="footer-col">
              <div className="footer-col-title">By Category</div>
              <ul className="footer-links">
                {EXAM_CATEGORIES.slice(0, 8).map((cat) => (
                  <li key={cat}>
                    <Link href={`/c/${enumToSlug(cat)}`}>{cleanLabel(cat)}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* ─── Column 3: By Status ─── */}
            <div className="footer-col">
              <div className="footer-col-title">By Status</div>
              <ul className="footer-links">
                {EXAM_STATUSES.filter(s => s !== 'ARCHIVED' && s !== 'ACTIVE').map((status) => (
                  <li key={status}>
                    <Link href={`/s/${enumToSlug(status)}`}>{cleanLabel(status)}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* ─── Column 4: By State ─── */}
            <div className="footer-col">
              <div className="footer-col-title">By State</div>
              <ul className="footer-links">
                {["Delhi", "Uttar Pradesh", "Bihar", "Maharashtra", "Rajasthan", "Madhya Pradesh"].map((state) => (
                  <li key={state}>
                    <Link href={`/state/${state.toLowerCase().replace(/ /g, "-")}`}>{state}</Link>
                  </li>
                ))}
                <li className="mt-2">
                  <Link href="/state" className="text-accent font-bold">All 28 States &rarr;</Link>
                </li>
              </ul>
            </div>

            {/* ─── Column 5: Platform ─── */}
            <div className="footer-col">
              <div className="footer-col-title">Platform</div>
              <ul className="footer-links">
                <li><Link href="/about">Intelligence Unit</Link></li>
                <li><Link href="/contact">Support Center</Link></li>
                <li><Link href="/privacy">Privacy Ledger</Link></li>
                <li><Link href="/terms">Operational Terms</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-bottom-left">
            <span className="footer-copy">
              © {currentYear} Exam Suchana Intelligence. Data aggregated from official gazettes.
            </span>
          </div>
          <div className="footer-bottom-right">
            <a href="#" className="back-to-top" onClick={(e) => { e.preventDefault(); window.scrollTo({top: 0, behavior: 'smooth'}); }}>
              Back to Top &uarr;
            </a>
            <div className="footer-tagline">
              Precision Tracking for <span>Indian Civil Servants</span>
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .footer-top-row {
          padding-bottom: 40px;
        }
        .logo-icon-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(var(--accent-rgb), 0.05);
          border-radius: 12px;
          padding: 4px;
        }
        .social-link {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          background: var(--bg-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          border: 1px solid var(--border);
        }
        .social-link:hover {
          background: var(--accent);
          border-color: var(--accent);
          transform: translateY(-2px);
        }
        .footer-socials {
          display: flex;
          gap: 12px;
          margin-top: 24px;
        }
        .footer-col-title {
          font-family: 'Space Grotesk', sans-serif;
          letter-spacing: 0.5px;
          color: var(--text-primary);
        }
        .back-to-top {
          font-size: 13px;
          font-weight: 700;
          color: var(--text-muted);
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s;
          margin-right: 24px;
        }
        .back-to-top:hover {
          color: var(--accent);
          transform: translateY(-2px);
        }
        .footer-tagline {
          font-weight: 500;
          font-size: 13px;
        }
      `}} />
    </footer>
  );
}
