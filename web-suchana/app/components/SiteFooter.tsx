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
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <a href="/" className="logo">
              <div className="">
                <Image src={'/examsuchana-logoT.png'} height={40} width={40} alt="Exam Suchana" />
              </div>
              <span className="logo-text">
                Exam <span>Suchana</span>
              </span>
            </a>
            <p className="footer-brand-desc">
              India&apos;s most structured government exam lifecycle tracker.
              Built for serious candidates who don&apos;t miss deadlines.
            </p>
          </div>

          <div className="footer-col">
            <div className="footer-col-title">By Category</div>
            <ul className="footer-links">
              {EXAM_CATEGORIES.slice(0, 10).map((cat) => (
                <li key={cat}>
                  <Link href={`/c/${enumToSlug(cat)}`}>{cleanLabel(cat)}</Link>
                </li>
              ))}
            </ul>
          </div>

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

          <div className="footer-col">
            <div className="footer-col-title">By State</div>
            <ul className="footer-links">
              {["Delhi", "Uttar Pradesh", "Bihar", "Maharashtra", "Rajasthan", "Madhya Pradesh", "Haryana"].map((state) => (
                <li key={state}>
                  <Link href={`/state/${state.toLowerCase().replace(/ /g, "-")}`}>{state}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-col">
            <div className="footer-col-title">Legal</div>
            <ul className="footer-links">
              <li><Link href="/about">About Us</Link></li>
              <li><Link href="/contact">Contact Us</Link></li>
              <li><Link href="/privacy">Privacy Policy</Link></li>
              <li><Link href="/terms">Terms & Conditions</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-copy">
            © {currentYear} Exam Suchana. All rights reserved.
          </div>
          <div className="footer-tagline">
            Built with ❤️ for <span>Indian Government Exam aspirants</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
