"use client";

import { useState, useEffect } from "react";
import { Bell, Bookmark, ChevronDown, Menu, X, ArrowRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { EXAM_CATEGORIES, EXAM_STATUSES } from "../lib/enums";
import { enumToSlug, cleanLabel } from "../lib/types";

export default function SiteNav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setScrolled(window.scrollY > 10);

    const onScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    if (typeof window !== "undefined") {
      setUserId(window.localStorage.getItem("@suchana_userId"));
      setMounted(true);
    }

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (path: string) => pathname === path;
  const isCategoryActive = (slug: string) => pathname === `/c/${slug}`;
  const isStatusActive = (slug: string) => pathname === `/s/${slug}`;

  const navStates = [
    "Delhi", "Uttar Pradesh", "Bihar", "Maharashtra", "Rajasthan", "Madhya Pradesh"
  ];

  return (
    <>
      <nav className={`navbar-modern ${scrolled ? "scrolled" : ""}`}>
        <div className="container navbar-inner">
          <Link href="/" className="logo-modern">
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
                    {EXAM_CATEGORIES.slice(0, 10).map((cat) => {
                      const slug = enumToSlug(cat);
                      return (
                        <Link key={cat} href={`/c/${slug}`} className={`dropdown-item ${isCategoryActive(slug) ? "active" : ""}`}>
                          {cleanLabel(cat)}
                        </Link>
                      );
                    })}
                    <Link href="/categories" className="dropdown-item more">View All &rarr;</Link>
                  </div>
                  <div className="dropdown-col">
                    <span className="dropdown-title">By Status</span>
                    {EXAM_STATUSES.filter(s => s !== 'ARCHIVED' && s !== 'ACTIVE').slice(0, 6).map((status) => {
                      const slug = enumToSlug(status);
                      return (
                        <Link key={status} href={`/s/${slug}`} className={`dropdown-item ${isStatusActive(slug) ? "active" : ""}`}>
                          {cleanLabel(status)}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            </li>

            <li className="has-dropdown">
              <button className="dropdown-trigger">
                States <ChevronDown size={14} />
              </button>
              <div className="dropdown-menu single-col">
                <Link href="/state" className={`dropdown-item more ${isActive('/state') ? "active" : ""}`}>Browse by State &rarr;</Link>
              </div>
            </li>

            <li className="has-dropdown">
              <button className="dropdown-trigger">
                Resources <ChevronDown size={14} />
              </button>
              <div className="dropdown-menu single-col">
                <Link href="/topic/current-affairs" className={`dropdown-item ${isActive('/topic/current-affairs') ? "active" : ""}`}>Current Affairs</Link>
                <Link href="/topic/books" className={`dropdown-item ${isActive('/topic/books') ? "active" : ""}`}>Best Books</Link>
                <Link href="/topic/syllabus" className={`dropdown-item ${isActive('/topic/syllabus') ? "active" : ""}`}>Syllabus</Link>
              </div>
            </li>

            <li className={isActive('/about') ? "active" : ""}><Link href="/about">About</Link></li>
          </ul>

          <div className="nav-cta-modern">
            {/* Hydration-safe account button */}
            {mounted ? (
              userId ? (
                <Link href="/saved" className="btn-modern btn-saved desktop-only">
                  <Bookmark size={14} /> <span>My Saved</span>
                </Link>
              ) : (
                <Link href="/onboarding" className="btn-modern btn-primary-modern desktop-only">
                  <Bell size={14} /> <span>Get Notified</span>
                </Link>
              )
            ) : (
              <div className="btn-modern btn-primary-modern desktop-only opacity-0">
                <Bell size={14} /> <span>Get Notified</span>
              </div>
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
              <span className="mobile-section-title">Popular Categories</span>
              {EXAM_CATEGORIES.slice(0, 5).map(cat => (
                <Link key={cat} href={`/c/${enumToSlug(cat)}`} onClick={() => setMobileMenuOpen(false)}>
                  {cleanLabel(cat)}
                </Link>
              ))}
            </div>

            <div className="mobile-section">
              <span className="mobile-section-title">Browse by State</span>
              <Link href="/state" onClick={() => setMobileMenuOpen(false)}>All 28 States &rarr;</Link>
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
    </>
  );
}
