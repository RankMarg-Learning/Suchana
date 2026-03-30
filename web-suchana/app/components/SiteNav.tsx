"use client";

import { useState, useEffect } from "react";
import { Bell, Layers, Search, User, Bookmark } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });

    if (typeof window !== "undefined") {
      setUserId(window.localStorage.getItem("@suchana_userId"));
      setMounted(true);
    }

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <nav
        className="navbar"
        style={scrolled ? { boxShadow: "0 4px 30px rgba(0,0,0,0.5)" } : {}}
      >
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
            <li><a href="/about">About</a></li>
            <li><a href="/contact">Contact</a></li>
            <li><a href="/privacy">Privacy</a></li>
          </ul>

          <div className="nav-cta">

            {mounted && (
              userId ? (
                <a href="/saved" className="btn btn-primary nav-action-btn saved-nav-btn">
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
