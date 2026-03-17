"use client";

import { useState, useEffect } from "react";
import { Layers, Bell } from "lucide-react";

export default function SiteNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className="navbar"
      style={scrolled ? { boxShadow: "0 4px 30px rgba(0,0,0,0.5)" } : {}}
    >
      <div className="container navbar-inner">
        <a href="/" className="logo">
          <div className="logo-icon">
            <Layers size={18} color="#fff" />
          </div>
          <span className="logo-text">
            Exam <span>Suchana</span>
          </span>
        </a>

        <ul className="nav-links">
          <li><a href="/#exams">Exams</a></li>
          <li><a href="/#features">Features</a></li>
          <li><a href="/#notify">Notifications</a></li>
          <li><a href="/about">About</a></li>
          <li><a href="/contact">Contact</a></li>
        </ul>

        <div className="nav-cta">
          <a href="/#notify" className="btn btn-primary">
            <Bell size={15} />
            Get Notified
          </a>
        </div>
      </div>
    </nav>
  );
}
