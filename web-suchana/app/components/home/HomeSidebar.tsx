import Link from "next/link";
import React from "react";
import {
  Clock,
  ClipboardCheck,
  Bell,
  Wrench,
  Calendar,
  CircleDollarSign,
  CalendarDays,
  Map
} from "lucide-react";

interface HomeSidebarProps {
  closingSoon: any[];
  trendingExams: any[];
}

export default function HomeSidebar({ closingSoon, trendingExams }: HomeSidebarProps) {
  return (
    <div className="sidebar-col">
      {/* Sidebar Ad 300x250 */}
      <div className="ad-sidebar ad-s-250">
        <div className="ad-label">Advertisement</div>
        <div className="ad-inner">
          <b>300 × 250</b>
          <span style={{ fontSize: 11 }}>AdSense rectangle unit</span>
        </div>
      </div>

      {/* Deadlines */}
      <div className="sw">
        <div className="sw-head flex items-center gap-1.5">
          <Clock size={16} className="text-amber-500" /> Closing Soon <span style={{ fontSize: 11, fontFamily: 'var(--body)', color: 'rgba(255,255,255,.4)' }}>Deadlines</span>
        </div>
        <div className="sw-body">
          {closingSoon.map((event: any, i: number) => (
            <Link href={`/exam/${event.exam?.slug}`} key={event.id} className="dl-item">
              <div className={`dl-days ${i < 2 ? 'urgent' : ''}`}>
                {Math.max(0, Math.ceil((new Date(event.endsAt).getTime() - new Date().getTime()) / (1000 * 3600 * 24)))}d
              </div>
              <div>
                <div className="dl-name">{event.exam?.title || event.title}</div>
                <div className="dl-date">Status: {event.stage?.replace(/_/g, ' ')}</div>
              </div>
            </Link>
          ))}
          {closingSoon.length === 0 && trendingExams.slice(0, 5).map((exam: any, i: number) => (
            <Link href={`/e/${exam.slug}`} key={exam.id} className="dl-item">
              <div className={`dl-days ${i < 2 ? 'urgent' : ''}`}>{i + 5}d</div>
              <div><div className="dl-name">{exam.title}</div><div className="dl-date">Status: {exam.status?.replace(/_/g, ' ')}</div></div>
            </Link>
          ))}
        </div>
      </div>

      {/* Status Board */}
      <div className="sw">
        <div className="sw-head flex items-center gap-1.5">
          <ClipboardCheck size={16} className="text-blue-400" /> Exam Status Board
        </div>
        <div className="sw-body">
          {trendingExams.slice(0, 6).map((exam: any, i: number) => (
            <Link href={`/exam/${exam.slug}`} key={exam.id} className="score-item">
              <div className="sc-rank">0{i + 1}</div>
              <div className="sc-exam">{exam.shortTitle || exam.title}</div>
              <span className={`sc-status ${i % 2 === 0 ? 'ss-open' : 'ss-exam'}`}>{exam.status?.replace(/_/g, ' ')}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Free Alerts */}
      <div className="sw">
        <div className="sw-head flex items-center gap-1.5">
          <Bell size={16} className="text-yellow-400 animate-swing" /> Free Exam Alerts
        </div>
        <div className="sw-body">
          <p style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 10, lineHeight: 1.7 }}>Get instant alerts for every exam update — directly in your email.</p>
          <div className="nl-form">
            <input type="email" placeholder="Your email address" />
            <input type="text" placeholder="Interested exams" />
            <button>Subscribe Free →</button>
          </div>
          <div className="nl-note">No spam · Unsubscribe anytime</div>
        </div>
      </div>

      {/* Sidebar Ad 2 */}
      <div className="ad-sidebar ad-s-120">
        <div className="ad-label">Advertisement</div>
        <div className="ad-inner">
          <b>300 × 120</b>
          <span style={{ fontSize: 11 }}>AdSense unit</span>
        </div>
      </div>

      {/* Tools */}
      <div className="sw">
        <div className="sw-head flex items-center gap-1.5">
          <Wrench size={16} className="text-purple-400" /> Free Tools
        </div>
        <div className="sw-body">
          <div className="tool-grid">
            <Link href="#" className="tool-btn"><span className="tool-icon"><Calendar size={14} className="text-emerald-500" /></span>Age Calculator</Link>
            <Link href="#" className="tool-btn"><span className="tool-icon"><CircleDollarSign size={14} className="text-amber-500" /></span>Salary Calc</Link>
            <Link href="/all-exams" className="tool-btn"><span className="tool-icon"><CalendarDays size={14} className="text-sky-500" /></span>Exam Calendar</Link>
            <Link href="/s/notification" className="tool-btn"><span className="tool-icon"><Map size={14} className="text-rose-500" /></span>State Jobs</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
