"use client";

import { useState, useEffect } from "react";
import { Bell, Bookmark, ChevronDown, Menu, X, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { EXAM_CATEGORIES, EXAM_STATUSES } from "../lib/enums";
import { enumToSlug, cleanLabel } from "../lib/types";

export default function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });

    if (typeof window !== "undefined") {
      setUserId(window.localStorage.getItem("@suchana_userId"));
      setMounted(true);
    }

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navStates = [
    "Delhi", "Uttar Pradesh", "Bihar", "Maharashtra", "Rajasthan", "Madhya Pradesh"
  ];

  return (
    <>
      <nav className={`navbar-modern ${scrolled ? "scrolled" : ""}`}>
        <div className="container navbar-inner">
          <Link href="/" className="logo-modern">
            <div className="logo-icon">
              <Image src={'/examsuchana-logoT.png'} height={36} width={36} alt="Exam Suchana" priority />
            </div>
            <span className="logo-text">
              Exam <span>Suchana</span>
            </span>
          </Link>

          {/* Desktop Links */}
          <ul className="nav-links-modern desktop-only">
            <li className="has-dropdown">
              <button className="dropdown-trigger">
                Exams <ChevronDown size={14} />
              </button>
              <div className="dropdown-menu">
                <div className="dropdown-grid">
                  <div className="dropdown-col">
                    <span className="dropdown-title">By Category</span>
                    {EXAM_CATEGORIES.slice(0, 10).map((cat) => (
                      <Link key={cat} href={`/c/${enumToSlug(cat)}`} className="dropdown-item">
                        {cleanLabel(cat)}
                      </Link>
                    ))}
                    <Link href="/categories" className="dropdown-item more">View All &rarr;</Link>
                  </div>
                  <div className="dropdown-col">
                    <span className="dropdown-title">By Status</span>
                    {EXAM_STATUSES.filter(s => s !== 'ARCHIVED' && s !== 'ACTIVE').slice(0, 6).map((status) => (
                      <Link key={status} href={`/s/${enumToSlug(status)}`} className="dropdown-item">
                        {cleanLabel(status)}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </li>

            <li className="has-dropdown">
              <button className="dropdown-trigger">
                States <ChevronDown size={14} />
              </button>
              <div className="dropdown-menu single-col">
                {navStates.map((state) => (
                  <Link key={state} href={`/state/${state.toLowerCase().replace(/ /g, "-")}`} className="dropdown-item">
                    {state}
                  </Link>
                ))}
                <div className="dropdown-divider" />
                <Link href="/state" className="dropdown-item more">All 28 States &rarr;</Link>
              </div>
            </li>

            <li><Link href="/about">About</Link></li>
          </ul>

          <div className="nav-cta-modern">
            {mounted && (
              userId ? (
                <Link href="/saved" className="btn-modern btn-saved desktop-only">
                  <Bookmark size={14} /> <span>My Saved</span>
                </Link>
              ) : (
                <Link href="/onboarding" className="btn-modern btn-primary-modern desktop-only">
                  <Bell size={14} /> <span>Get Notified</span>
                </Link>
              )
            )}

            <button
              className="mobile-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <div className={`mobile-overlay ${mobileMenuOpen ? 'open' : ''}`}>
          <div className="mobile-inner">
            <div className="mobile-section">
              <span className="mobile-section-title">Quick Access</span>
              <Link href="/#exams" onClick={() => setMobileMenuOpen(false)}>Live Tracker</Link>
              <Link href="/about" onClick={() => setMobileMenuOpen(false)}>About Intelligence</Link>
            </div>

            <div className="mobile-section">
              <span className="mobile-section-title">Popular Categories</span>
              {EXAM_CATEGORIES.slice(0, 5).map(cat => (
                <Link key={cat} href={`/c/${enumToSlug(cat)}`} onClick={() => setMobileMenuOpen(false)}>
                  {cleanLabel(cat)}
                </Link>
              ))}
            </div>

            <div className="mobile-section">
              <span className="mobile-section-title">State Exams</span>
              {navStates.slice(0, 4).map(state => (
                <Link key={state} href={`/state/${state.toLowerCase().replace(/ /g, "-")}`} onClick={() => setMobileMenuOpen(false)}>
                  {state}
                </Link>
              ))}
            </div>

            <div className="mobile-cta">
              <Link href="/onboarding" className="btn-modern btn-primary-modern w-full" onClick={() => setMobileMenuOpen(false)}>
                <Bell size={16} /> Subscribe to Alerts
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="nav-spacer-modern" />

      <style jsx global>{`
        .navbar-modern {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          height: 80px;
          display: flex;
          align-items: center;
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(0,0,0,0.06);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .navbar-modern.scrolled {
          height: 64px;
          background: rgba(255, 255, 255, 0.95);
          box-shadow: 0 10px 30px rgba(0,0,0,0.04);
        }

        .navbar-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
        }

        .logo-modern {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
          z-index: 1001;
        }

        .logo-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          background: white;
          border-radius: 12px;
          padding: 2px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          transition: transform 0.3s ease;
        }

        .logo-modern:hover .logo-icon { transform: scale(1.05); }

        .logo-text {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 20px;
          font-weight: 700;
          color: var(--text-primary);
          letter-spacing: -0.5px;
        }

        .logo-text span { color: var(--accent); }

        /* Links */
        .nav-links-modern {
          display: flex;
          list-style: none;
          gap: 32px;
          margin: 0;
          padding: 0;
        }

        .nav-links-modern > li { position: relative; }

        .nav-links-modern a, .dropdown-trigger {
          color: var(--text-secondary);
          text-decoration: none;
          font-size: 14px;
          font-weight: 600;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 6px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 8px 0;
        }

        .nav-links-modern a:hover, .dropdown-trigger:hover { color: var(--accent); }

        /* Dropdowns */
        .dropdown-menu {
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%) translateY(10px);
          background: white;
          min-width: 200px;
          border-radius: 16px;
          box-shadow: 0 20px 50px rgba(0,0,0,0.12);
          border: 1px solid rgba(0,0,0,0.06);
          padding: 24px;
          opacity: 0;
          visibility: hidden;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .has-dropdown:hover .dropdown-menu {
          opacity: 1;
          visibility: visible;
          transform: translateX(-50%) translateY(0);
        }

        .dropdown-grid {
          display: grid;
          grid-template-columns: 200px 200px;
          gap: 32px;
        }

        .dropdown-col { display: flex; flex-direction: column; gap: 8px; }

        .dropdown-title {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: var(--text-muted);
          margin-bottom: 8px;
        }

        .dropdown-item {
          font-size: 14px;
          font-weight: 500;
          color: var(--text-secondary) !important;
          padding: 6px 0;
          transition: all 0.2s;
        }

        .dropdown-item:hover { color: var(--accent) !important; transform: translateX(4px); }
        .dropdown-item.more { font-weight: 700; color: var(--accent) !important; margin-top: 4px; }

        .single-col { min-width: 180px; padding: 16px; }
        .dropdown-divider { height: 1px; background: rgba(0,0,0,0.06); margin: 8px 0; }

        /* CTAs */
        .nav-cta-modern { display: flex; align-items: center; gap: 12px; }

        .btn-modern {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 700;
          text-decoration: none;
          transition: all 0.2s;
        }

        .btn-primary-modern {
          background: var(--accent);
          color: white;
          box-shadow: 0 8px 20px rgba(124, 58, 237, 0.2);
        }

        .btn-primary-modern:hover { transform: translateY(-1px); box-shadow: 0 10px 25px rgba(124, 58, 237, 0.3); }

        .btn-saved {
          background: #f5f3ff;
          color: var(--accent);
          border: 1px solid rgba(124, 58, 237, 0.1);
        }

        .btn-saved:hover { background: #ede9fe; }

        /* Mobile */
        .mobile-toggle {
          display: none;
          background: none;
          border: none;
          color: var(--text-primary);
          cursor: pointer;
          z-index: 1001;
        }

        .mobile-overlay {
          position: fixed;
          inset: 0;
          background: white;
          z-index: 1000;
          padding: 100px 24px 40px;
          opacity: 0;
          visibility: hidden;
          transition: all 0.3s;
          overflow-y: auto;
        }

        .mobile-overlay.open { opacity: 1; visibility: visible; }

        .mobile-inner { display: flex; flex-direction: column; gap: 40px; }

        .mobile-section { display: flex; flex-direction: column; gap: 16px; }

        .mobile-section-title {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 13px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: var(--text-muted);
        }

        .mobile-section a {
          font-size: 18px;
          font-weight: 600;
          color: var(--text-primary);
          text-decoration: none;
        }

        .nav-spacer-modern { height: 80px; }

        @media (max-width: 1024px) {
          .desktop-only { display: none !important; }
          .mobile-toggle { display: block; }
          .navbar-modern { height: 64px; }
          .nav-spacer-modern { height: 64px; }
        }
      `}</style>
    </>
  );
}
