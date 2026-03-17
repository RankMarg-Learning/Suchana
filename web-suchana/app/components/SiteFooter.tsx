"use client";

import { useState, useEffect } from "react";
import { Layers } from "lucide-react";

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
              <div className="logo-icon">
                <Layers size={18} color="#fff" />
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

          <div>
            <div className="footer-col-title">Exam Categories</div>
            <ul className="footer-links">
              {["Civil Services", "SSC", "Railway", "Banking", "Defence", "Police", "Teaching"].map((cat) => (
                <li key={cat}><a href="/#exams">{cat}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <div className="footer-col-title">Company</div>
            <ul className="footer-links">
              <li><a href="/about">About Us</a></li>
              <li><a href="/contact">Contact Us</a></li>
              <li><a href="/privacy">Privacy Policy</a></li>
              <li><a href="/terms">Terms & Conditions</a></li>
              <li>
                <a href="mailto:help@examsuchana.in">
                  help@examsuchana.in
                </a>
              </li>
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
