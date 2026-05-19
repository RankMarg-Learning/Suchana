"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bookmark, ArrowRight, MapPin, Briefcase, Zap, Wrench, Calendar, Coins, BookOpen, Target
} from "lucide-react";
import {
  Exam, STAGE_LABELS, cleanLabel, getStageState
} from "../lib/types";
import { fetchSavedExams } from "../lib/api";
import { SkeletonRow, StatusBadge } from "../components/ExamCard";

export default function SavedExamsPage() {
  const router = useRouter();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>("");

  useEffect(() => {
    setNow(Date.now());
    const interval = setInterval(() => setNow(Date.now()), 60000);

    const userId = typeof window !== "undefined" ? localStorage.getItem("@suchana_userId") : null;
    if (!userId) {
      router.replace("/onboarding");
      return;
    }

    fetchSavedExams(userId)
      .then(data => setExams(data))
      .catch(() => setExams([]))
      .finally(() => setLoading(false));

    return () => clearInterval(interval);
  }, [router]);

  const filteredExams = exams.filter(exam => {
    if (!statusFilter) return true;
    return exam.status === statusFilter;
  });

  return (
    <div className="wrap-home" style={{ marginTop: '24px', marginBottom: '60px' }}>
      <div className="page-grid">
        
        {/* LEFT COLUMN: MAIN CONTENT */}
        <div className="content-col">
          
          {/* HEADER */}
          <div className="sh">
            <div className="sh-title">
              <span className="cat-tag">SAVED</span> Your Tracked Exams
            </div>
            <div className="sh-link" style={{ color: 'var(--accent)' }}>
              {!loading && `${filteredExams.length} TRACKING`}
            </div>
          </div>

          <div className="exams-container">
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[1, 2, 3, 4, 5].map((n) => <SkeletonRow key={n} />)}
              </div>
            ) : filteredExams.length === 0 ? (
              <div style={{
                padding: "60px 20px",
                textAlign: "center",
                background: "#fff",
                borderRadius: 8,
                border: "1px dashed var(--border)",
              }}>
                <div style={{
                  width: 54,
                  height: 54,
                  background: 'rgba(124,58,237,0.06)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  color: 'var(--accent)'
                }}>
                  <Bookmark size={24} />
                </div>
                <h3 style={{ fontSize: 18, marginBottom: 8, fontWeight: 800, color: 'var(--ink)' }}>No tracked exams found</h3>
                <p style={{ color: "var(--text-muted)", marginBottom: 24, maxWidth: 360, margin: '0 auto 24px', fontSize: '13.5px', lineHeight: 1.6 }}>
                  {statusFilter 
                    ? "Try changing your status filters in the right sidebar to discover saved opportunities."
                    : "Begin your intelligence journey by bookmarking primary recruitment notifications."}
                </p>
                {!statusFilter && (
                  <Link href="/" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <Zap size={15} /> Discover Live Notifications
                  </Link>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {filteredExams.map(exam => {
                  const sorted = (exam.lifecycleEvents ?? []).sort((a, b) => (a.stageOrder ?? 0) - (b.stageOrder ?? 0));
                  const activeEvents = sorted.filter((e) => getStageState(e, now) === "active");

                  return (
                    <div
                      key={exam.id}
                      className="exam-card-modern"
                      style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}
                    >
                      {/* Tag row */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          <span className={`tag tag-${(exam.examLevel ?? "national").toLowerCase() === 'state' ? 'gray' : 'blue'}`}>
                            {cleanLabel(exam.examLevel)}
                          </span>
                          <span className="tag tag-purple">
                            {cleanLabel(exam.category)}
                          </span>
                          {exam.state && (
                            <span className="tag tag-gray" style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                              <MapPin size={10} /> {exam.state}
                            </span>
                          )}
                        </div>
                        <StatusBadge status={exam.status} />
                      </div>

                      {/* Title & Body */}
                      <h3 style={{
                        fontFamily: 'var(--hd)',
                        fontSize: '18px',
                        fontWeight: 800,
                        color: 'var(--ink)',
                        margin: '0 0 4px 0'
                      }}>
                        {exam.shortTitle ?? exam.title}
                      </h3>

                      <div style={{
                        fontSize: '13px',
                        color: 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        marginBottom: '16px'
                      }}>
                        <Briefcase size={13} strokeWidth={2} />
                        <span>{exam.conductingBody}</span>
                      </div>

                      {/* Active events / status */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '12px', marginTop: '12px' }}>
                        {activeEvents.length > 0 && now > 0 ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                            <span style={{ fontSize: '13px', fontWeight: 700, color: '#10b981' }}>
                              {activeEvents.map((e) => e.label || STAGE_LABELS[e.stage] || cleanLabel(e.stage)).join(" · ")} is live
                            </span>
                          </div>
                        ) : <div />}

                        <Link href={`/exam/${exam.slug}`} style={{ fontSize: '13px', fontWeight: 800, color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}>
                          View Timeline <ArrowRight size={14} />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: SIDEBAR */}
        <div className="sidebar-col">
          
          {/* STATUS FILTERS */}
          <div className="sw" style={{ marginTop: 0 }}>
            <div className="sw-head flex items-center gap-1.5">
              <Target size={16} className="text-amber-500" /> Filter by Status
            </div>
            <div className="sw-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {[
                  { value: "ALL", label: "All Status" },
                  { value: "REGISTRATION_OPEN", label: "Registration Open" },
                  { value: "NOTIFICATION", label: "Notification" },
                  { value: "ADMIT_CARD_OUT", label: "Admit Card Out" },
                  { value: "EXAM_ONGOING", label: "Ongoing" },
                  { value: "RESULT_DECLARED", label: "Result Declared" },
                  { value: "REGISTRATION_CLOSED", label: "Closed" },
                ].map((status) => {
                  const isActive = (statusFilter || "ALL") === status.value || (status.value === "ALL" && !statusFilter);
                  return (
                    <button
                      key={status.value}
                      onClick={() => setStatusFilter(status.value === "ALL" ? "" : status.value)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        background: isActive ? 'rgba(124,58,237,0.06)' : 'transparent',
                        border: 'none',
                        borderRadius: '4px',
                        color: isActive ? 'var(--accent)' : 'var(--text2)',
                        fontWeight: isActive ? 800 : 600,
                        fontSize: '13.5px',
                        cursor: 'pointer',
                        width: '100%',
                        textAlign: 'left'
                      }}
                    >
                      <span>{status.label}</span>
                      {isActive && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent)' }} />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ASPIRANT TOOLSET */}
          <div className="sw">
            <div className="sw-head flex items-center gap-1.5">
              <Wrench size={16} className="text-purple-400" /> Aspirant Toolset
            </div>
            <div className="sw-body">
              <div className="tool-grid" style={{ gridTemplateColumns: '1fr' }}>
                <Link href="/age-calculator" className="tool-btn" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px', textDecoration: 'none' }}>
                  <span className="tool-icon" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Calendar size={18} />
                  </span>
                  Age Calculator
                </Link>
                <Link href="/salary-calculator" className="tool-btn" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px', textDecoration: 'none' }}>
                  <span className="tool-icon" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Coins size={18} />
                  </span>
                  Salary Calculator
                </Link>
                <Link href="/syllabus" className="tool-btn" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px', textDecoration: 'none' }}>
                  <span className="tool-icon" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    <BookOpen size={18} />
                  </span>
                  Syllabus Maps
                </Link>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
