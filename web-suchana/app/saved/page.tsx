"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import SiteNav from "../components/SiteNav";
import SiteFooter from "../components/SiteFooter";
import {
  Bookmark, BookmarkCheck, ArrowRight, MapPin, 
  Calendar, FileText, Target, Briefcase, ChevronLeft, Search
} from "lucide-react";
import {
  Exam, STATUS_LABELS, STAGE_LABELS, cleanLabel, formatDate, getTotalVacancies, getStageState
} from "../lib/types";
import { fetchSavedExams } from "../lib/api";
import { RightSidebar } from "../components/Sidebars";

function StatusBadge({ status }: { status: string }) {
  return (
    <div className={`status-badge status-${status}`}>
      <div className="status-dot" />
      {STATUS_LABELS[status] ?? cleanLabel(status)}
    </div>
  );
}

function ExamListRow({ exam, now }: { exam: Exam; now: number }) {
  const sorted = (exam.lifecycleEvents ?? []).sort((a, b) => (a.stageOrder ?? 0) - (b.stageOrder ?? 0));
  const regEvent = sorted.find((e) => e.stage === "REGISTRATION");
  const examEvent = sorted.find((e) => e.stage === "EXAM_DATE" || e.stage === "EXAM");
  const admitEvent = sorted.find((e) => e.stage === "ADMIT_CARD");
  const activeEvents = sorted.filter((e) => getStageState(e, now) === "active");

  return (
    <Link href={`/exam/${exam.slug}`} className="exam-list-row">
      <div className="exam-row-main">
        <div className="exam-row-tags">
          <span className={`exam-tag level-${(exam.examLevel ?? "national").toLowerCase()}`}>
            {cleanLabel(exam.examLevel)}
          </span>
          <span className={`exam-tag cat-${(exam.category ?? "").toLowerCase()}`}>
            {cleanLabel(exam.category)}
          </span>
          {exam.state && (
            <span className="exam-tag">
              <MapPin size={9} style={{ display: "inline", marginRight: 2 }} />{exam.state}
            </span>
          )}
        </div>
        <h2 className="exam-row-title">{exam.shortTitle ?? exam.title}</h2>
        <div className="exam-row-body">{exam.conductingBody}</div>

        {activeEvents.length > 0 && now > 0 && (
          <div className="exam-row-active">
            <div className="active-dot" />
            <span className="active-label">
              {activeEvents.map((e) => e.label || STAGE_LABELS[e.stage] || cleanLabel(e.stage)).join(" · ")} is open
            </span>
          </div>
        )}
      </div>

      <div className="exam-row-dates">
        {regEvent?.endsAt && (
          <div className="date-chip">
            <Calendar size={11} /><span>Reg. deadline: {formatDate(regEvent.endsAt)}</span>
          </div>
        )}
        {admitEvent?.startsAt && (
          <div className="date-chip">
            <FileText size={11} /><span>Admit card: {formatDate(admitEvent.startsAt)}</span>
          </div>
        )}
        {examEvent?.startsAt && (
          <div className="date-chip">
            <Target size={11} /><span>Exam: {formatDate(examEvent.startsAt)}</span>
          </div>
        )}
        {getTotalVacancies(exam.totalVacancies) !== "TBA" && (
          <div className="date-chip vacancy">
            <Briefcase size={11} /><span>{getTotalVacancies(exam.totalVacancies)} vacancies</span>
          </div>
        )}
      </div>

      <div className="exam-row-right">
        <StatusBadge status={exam.status} />
        <div className="exam-row-arrow">
          View Details <ArrowRight size={14} />
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

  return (
    <>
      <SiteNav />

      <div className="app-shell">
        <main className="feed-main" style={{ minHeight: "80vh" }}>
          <div style={{ marginBottom: 24, padding: "0 24px" }}>
            <Link href="/" className="btn btn-ghost" style={{ display: "inline-flex", marginBottom: 16 }}>
              <ChevronLeft size={16} /> Back to Hub
            </Link>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <BookmarkCheck size={28} color="var(--accent)" />
              <h1 style={{ margin: 0, fontSize: 32, fontWeight: 800 }}>Saved Exams</h1>
            </div>
            <p style={{ color: "var(--text-muted)", marginTop: 8 }}>Track your bookmarked exam updates in one place.</p>
          </div>

          {loading ? (
            <div style={{ padding: "40px", textAlign: "center", color: "var(--text-dim)" }}>Loading saved exams...</div>
          ) : exams.length === 0 ? (
            <div style={{ padding: "60px 20px", margin: "0 24px", textAlign: "center", background: "var(--surface)", borderRadius: 16, border: "1px dashed var(--border)" }}>
              <Bookmark size={48} color="var(--border)" style={{ marginBottom: 16 }} />
              <h3 style={{ fontSize: 20, marginBottom: 8, fontWeight: 700 }}>No saved exams yet</h3>
              <p style={{ color: "var(--text-dim)", marginBottom: 24 }}>Bookmark exams to build your personalized tracking list.</p>
              <Link href="/" className="btn btn-primary" style={{ display: "inline-flex" }}>
                <Search size={16} /> Discover Exams
              </Link>
            </div>
          ) : (
            <div className="exam-list" style={{ padding: "0 24px" }}>
              {exams.map(exam => (
                <ExamListRow key={exam.id} exam={exam} now={now} />
              ))}
            </div>
          )}
        </main>
        
        <RightSidebar />
      </div>

      <div className="divider" />
      <SiteFooter />
    </>
  );
}
