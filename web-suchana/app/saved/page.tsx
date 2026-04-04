"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bookmark, BookmarkCheck, ArrowRight, MapPin,
  Calendar, FileText, Target, Briefcase, ChevronLeft, Search, RefreshCw, X, Zap
} from "lucide-react";
import {
  Exam, STAGE_LABELS, cleanLabel, formatDate, getTotalVacancies, getStageState
} from "../lib/types";
import { fetchSavedExams } from "../lib/api";
import { RightSidebar } from "../components/Sidebars";
import { SkeletonRow, StatusBadge } from "../components/ExamCard";

function ExamListRowDetailed({ exam, now }: { exam: Exam; now: number }) {
  const sorted = (exam.lifecycleEvents ?? []).sort((a, b) => (a.stageOrder ?? 0) - (b.stageOrder ?? 0));
  const regEvent = sorted.find((e) => e.stage === "REGISTRATION");
  const examEvent = sorted.find((e) => e.stage === "EXAM_DATE" || e.stage === "EXAM");
  const admitEvent = sorted.find((e) => e.stage === "ADMIT_CARD");
  const activeEvents = sorted.filter((e) => getStageState(e, now) === "active");

  return (
    <Link
      href={`/exam/${exam.slug}`}
      className="exam-list-row"
      style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '0' }}
    >
      <div className="exam-row-main" style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
          <div className="exam-row-tags">
            <span className={`exam-tag level-${(exam.examLevel ?? "national").toLowerCase()}`}>
              {cleanLabel(exam.examLevel)}
            </span>
            <span className={`exam-tag cat-${(exam.category ?? "").toLowerCase()}`}>
              {cleanLabel(exam.category)}
            </span>
            {exam.state && (
              <span className="exam-tag">
                <MapPin size={10} style={{ marginRight: 4 }} />{exam.state}
              </span>
            )}
          </div>
          <StatusBadge status={exam.status} />
        </div>

        <h2 className="exam-row-title" style={{ fontSize: '22px', fontWeight: 700, marginBottom: '4px', letterSpacing: '-0.02em' }}>
          {exam.shortTitle ?? exam.title}
        </h2>
        <div style={{ fontSize: '15px', color: 'var(--text-muted)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Briefcase size={14} style={{ opacity: 0.5 }} />
          {exam.conductingBody}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
          {activeEvents.length > 0 && now > 0 ? (
            <div className="exam-row-active" style={{ margin: 0 }}>
              <div className="active-dot" />
              <span className="active-label">
                {activeEvents.map((e) => e.label || STAGE_LABELS[e.stage] || cleanLabel(e.stage)).join(" · ")} is live
              </span>
            </div>
          ) : <div />}

          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            Full Lifecycle <ArrowRight size={14} />
          </div>
        </div>
      </div>
    </Link>
  );
}


export default function SavedExamsPage() {
  const router = useRouter();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(0);

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

  const [statusFilter, setStatusFilter] = useState<string>("");

  return (
    <>
      <div className="app-shell" style={{ paddingTop: '80px' }}>
        <aside className="sidebar-left">
          <Link href="/" className="btn btn-ghost" style={{ fontSize: '13px', padding: '8px 12px', justifyContent: 'flex-start' }}>
            <ChevronLeft size={16} /> Back to Hub
          </Link>
        </aside>

        <div className="feed-main" id="saved-exams">
          <div className="feed-header" style={{ border: 'none', marginBottom: 0, paddingLeft: 0, paddingRight: 0 }}>
            <div className="feed-title-row">
              <div>
                <div className="feed-label">
                  <Bookmark size={12} style={{ marginRight: 6 }} />
                  Archived Intelligence
                </div>
                <h1 className="feed-title" style={{ fontSize: '36px' }}>Your Saved <span style={{ color: 'var(--accent)' }}>Exams</span></h1>
                <p className="feed-subtitle">Personalized tracking for your prioritized government goals.</p>
              </div>
              <div className="feed-count">
                {!loading && `${exams.length} tracking`}
              </div>
            </div>
          </div>

          <div className="exams-container" style={{ paddingTop: '20px' }}>
            {loading ? (
              <div className="exam-list">
                {[1, 2, 3, 4, 5].map((n) => <SkeletonRow key={n} />)}
              </div>
            ) : exams.length === 0 ? (
              <div style={{
                padding: "80px 40px",
                textAlign: "center",
                background: "var(--bg-secondary)",
                borderRadius: 24,
                border: "1px dashed var(--border)",
                margin: "0 24px"
              }}>
                <div style={{
                  width: 80,
                  height: 80,
                  background: 'var(--bg-primary)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.05)'
                }}>
                  <Bookmark size={32} color="var(--border)" />
                </div>
                <h3 style={{ fontSize: 24, marginBottom: 12, fontWeight: 800 }}>No active tracking found</h3>
                <p style={{ color: "var(--text-muted)", marginBottom: 32, maxWidth: 400, margin: '0 auto 32px' }}>
                  Begin your intelligence journey by bookmarking primary recruitment notifications.
                </p>
                <Link href="/" className="btn btn-primary btn-lg">
                  <Zap size={18} /> Discover Live Notifications
                </Link>
              </div>
            ) : (
              <div className="exam-list" style={{ padding: 0 }}>
                {exams.map(exam => (
                  <ExamListRowDetailed key={exam.id} exam={exam} now={now} />
                ))}
              </div>
            )}
          </div>
        </div>

        <RightSidebar statusFilter={statusFilter === "" ? "ALL" : statusFilter} setStatusFilter={setStatusFilter} />
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .feed-subtitle {
          color: var(--text-muted);
          font-size: 15px;
          margin-top: 8px;
        }
      `}} />
    </>
  );
}
