"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bell, BellRing, CheckCircle2, RefreshCw, Layers, Filter, BookOpen,
  ArrowRight, TrendingUp,
  Smartphone
} from "lucide-react";
import { SidebarAd } from "./AdUnits";
import { Exam, STAGE_LABELS, cleanLabel } from "../lib/types";
import { ExamCategory, ExamStatus } from "../lib/enums";

const SIDEBAR_CATEGORIES = [
  { value: "ALL", label: "All Exams", icon: "🏛️" },
  { value: ExamCategory.UPSC, label: "UPSC", icon: "⚖️" },
  { value: ExamCategory.SSC, label: "SSC", icon: "📋" },
  { value: ExamCategory.RAILWAY_JOBS, label: "Railway", icon: "🚂" },
  { value: ExamCategory.BANKING_JOBS, label: "Banking", icon: "🏦" },
  { value: ExamCategory.DEFENCE_JOBS, label: "Defence", icon: "🪖" },
  { value: ExamCategory.POLICE_JOBS, label: "Police", icon: "👮" },
  { value: ExamCategory.TEACHING_ELIGIBILITY, label: "Teaching", icon: "📚" },
  { value: ExamCategory.STATE_PSC, label: "State PSC", icon: "🏛️" },
];

const SIDEBAR_STATUSES = [
  { value: "ALL", label: "All Status" },
  { value: ExamStatus.REGISTRATION_OPEN, label: "Registration Open" },
  { value: ExamStatus.NOTIFICATION, label: "Notification" },
  { value: ExamStatus.ADMIT_CARD_OUT, label: "Admit Card Out" },
  { value: ExamStatus.EXAM_ONGOING, label: "Ongoing" },
  { value: ExamStatus.RESULT_DECLARED, label: "Result Declared" },
  { value: ExamStatus.REGISTRATION_CLOSED, label: "Closed" },
];

// ─── Notify Widget ────────────────────────────────────────────────────────────

export function NotifyWidget() {
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("loading");
    await new Promise((r) => setTimeout(r, 1200));
    if ("Notification" in window && Notification.permission === "default") {
      await Notification.requestPermission();
    }
    setState("done");
  };

  return (
    <div className="notify-widget">
      <div className="notify-widget-header">
        <div className="notify-widget-icon"><BellRing size={18} color="var(--accent-light)" /></div>
        <div>
          <div className="notify-widget-title">Get Exam Alerts</div>
          <div className="notify-widget-sub">Never miss a deadline</div>
        </div>
      </div>
      {state === "done" ? (
        <div className="notify-widget-success">
          <CheckCircle2 size={20} color="var(--green)" />
          <div>You&apos;re set! 🎉</div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="notify-widget-form">
          <input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="notify-widget-input"
            required
          />
          <button type="submit" className="notify-widget-btn" disabled={state === "loading"}>
            {state === "loading" ? <RefreshCw size={14} className="spin-icon" /> : <Bell size={14} />}
            {state === "loading" ? "Setting up..." : "Enable Alerts"}
          </button>
        </form>
      )}
    </div>
  );
}


// ─── Left Sidebar ─────────────────────────────────────────────────────────────

export function LeftSidebar({
  categoryFilter, setCategoryFilter,
}: {
  categoryFilter: string; setCategoryFilter: (v: string) => void;
}) {
  return (
    <aside className="sidebar-left" aria-label="Exam filters">
      <div className="sidebar-widget">
        <div className="sidebar-widget-title"><Layers size={14} /> Categories</div>
        <div className="category-list">
          {SIDEBAR_CATEGORIES.map(({ value, label, icon }) => (
            <button
              key={value}
              className={`category-btn ${categoryFilter === value ? "active" : ""}`}
              onClick={() => setCategoryFilter(value)}
              id={`cat-btn-${value.toLowerCase()}`}
              aria-pressed={categoryFilter === value}
            >
              <span className="category-icon">{icon}</span>{label}
            </button>
          ))}
        </div>
      </div>



      <SidebarAd id="sidebar-ad-left-1" />

      <div className="sidebar-widget">
        <div className="sidebar-widget-title"><BookOpen size={14} /> Quick Links</div>
        <ul className="sidebar-links">
          {[
            { label: "UPSC 2025", href: "/exam/upsc-cse-2025" },
            { label: "SSC CGL 2025", href: "/exam/ssc-cgl-2025" },
            { label: "RRB NTPC 2025", href: "/exam/rrb-ntpc-2025" },
            { label: "IBPS PO 2025", href: "/exam/ibps-po-2025" },
            { label: "NDA/NA 2025", href: "/exam/nda-na-2025" },
            { label: "CTET 2025", href: "/exam/cbse-ctet-2025" },
          ].map(({ label, href }) => (
            <li key={label}>
              <Link href={href} className="sidebar-link">
                <ArrowRight size={11} /> {label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <SidebarAd id="sidebar-ad-left-2" tall />
    </aside>
  );
}

// ─── Right Sidebar ─────────────────────────────────────────────────────────────

export function RightSidebar({
  statusFilter, setStatusFilter,
}: {
  statusFilter: string; setStatusFilter: (v: string) => void;
}) {
  return (
    <aside className="sidebar-right" aria-label="Exam alerts and trending">
      <NotifyWidget />
      <SidebarAd id="sidebar-ad-right-1" />

      {/* <div className="sidebar-widget">
        <div className="sidebar-widget-title"><TrendingUp size={14} /> Trending Now</div>
        <div className="trending-list">
          {[
            { name: "UPSC CSE 2025", tag: "🟢 Registration Open", href: "/exam/upsc-cse-2025", color: "#10b981" },
            { name: "RRB NTPC 2025", tag: "🟣 Admit Card Out", href: "/exam/rrb-ntpc-2025", color: "#a78bfa" },
            { name: "SSC CGL 2025", tag: "🟡 Upcoming", href: "/exam/ssc-cgl-2025", color: "#fbbf24" },
            { name: "IBPS PO 2025", tag: "🔵 Result Declared", href: "/exam/ibps-po-2025", color: "#60a5fa" },
            { name: "NDA/NA 2025", tag: "🟢 Registration Open", href: "/exam/nda-na-2025", color: "#10b981" },
          ].map((ex, i) => (
            <Link key={ex.name} href={ex.href} className="trending-item" style={{ textDecoration: "none" }}>
              <div className="trending-rank" style={{ color: i === 0 ? "#f59e0b" : "var(--text-muted)" }}>{i + 1}</div>
              <div className="trending-info">
                <div className="trending-name">{ex.name}</div>
                <div className="trending-tag" style={{ color: ex.color }}>{ex.tag}</div>
              </div>
            </Link>
          ))}
        </div>
      </div> */}

      <SidebarAd id="sidebar-ad-right-2" />

      <div className="sidebar-widget">
        <div className="sidebar-widget-title"><Filter size={14} /> Status</div>
        <div className="status-list">
          {SIDEBAR_STATUSES.map(({ value, label }) => (
            <button
              key={value}
              className={`status-filter-btn ${statusFilter === value ? "active" : ""}`}
              onClick={() => setStatusFilter(value)}
              id={`status-btn-${value.toLowerCase()}`}
              aria-pressed={statusFilter === value}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* <div className="app-download-widget">
        <div className="app-widget-icon"> <Smartphone size={20} /></div>
        <div className="app-widget-title">Get the App</div>
        <div className="app-widget-sub">Real-time push notifications for every exam event</div>
        <a href="https://play.google.com/store" target="_blank" rel="noopener noreferrer" className="app-widget-btn" id="sidebar-app-download">
          <ArrowRight size={14} /> Download Free
        </a>
      </div> */}

      <SidebarAd id="sidebar-ad-right-3" tall />
    </aside>
  );
}
