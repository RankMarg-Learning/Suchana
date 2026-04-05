"use client";

import { useState, useEffect } from "react";
import { Bell, Bookmark } from "lucide-react";
import Image from "next/image";

export default function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });

    if (typeof window !== "undefined") {
      setUserId(window.localStorage.getItem("@suchana_userId"));
      setMounted(true);
    }

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
        <div className="container navbar-inner">
          <a href="/" className="logo">
            <div className="">
              <Image src={'/examsuchana-logoT.png'} height={36} width={36} alt="Exam Suchana" />
            </div>
            <span className="logo-text">
              Exam <span>Suchana</span>
            </span>
          </a>

          <ul className="nav-links">
            <li><a href="/#exams">Exams</a></li>
            <li><a href="/articles">Guides</a></li>
            <li><a href="/about">About</a></li>
            <li><a href="/contact">Contact</a></li>
          </ul>

          <div className="nav-cta">

            {mounted && (
              userId ? (
                <a href="/saved" className="btn nav-action-btn saved-nav-btn">
                  <Bookmark size={14} /> <span>My Saved</span>
                </a>
              ) : (
                <a href="/onboarding" className="btn btn-primary nav-action-btn">
                  <Bell size={14} /> <span>Get Notified</span>
                </a>
              )
            )}
          </div>
        </div>
      </nav>
      {/* Spacer to prevent layout overlap since nav is position: fixed */}
      <div className="nav-spacer" style={{ height: "70px", flexShrink: 0, width: "100%" }} aria-hidden="true" />
    </>
  );
}
