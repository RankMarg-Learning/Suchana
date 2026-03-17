"use client";

import { useState, useEffect, useCallback } from "react";
import SiteNav from "./components/SiteNav";
import SiteFooter from "./components/SiteFooter";
import {
  Bell,
  BellRing,
  Search,
  Calendar,
  Briefcase,
  IndianRupee,
  UserCheck,
  ExternalLink,
  FileText,
  Globe,
  ChevronDown,
  ChevronUp,
  Smartphone,
  CheckCircle2,
  ArrowRight,
  Clock,
  Layers,
  Zap,
  Target,
  Star,
  MapPin,
  Info,
  AlertCircle,
  RefreshCw,
  Filter,
  TrendingUp,
} from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface LifecycleEvent {
  id: string;
  stage: string;
  stageOrder: number;
  label?: string;
  startsAt?: string;
  endsAt?: string;
  actionUrl?: string;
  notes?: string;
}

interface Exam {
  id: string;
  title: string;
  shortTitle?: string;
  conductingBody: string;
  slug: string;
  status: string;
  category: string;
  examLevel: string;
  state?: string;
  totalVacancies?: number | Record<string, number>;
  applicationFee?: Record<string, number>;
  minAge?: number;
  maxAge?: number;
  officialWebsite?: string;
  notificationUrl?: string;
  description?: string;
  lifecycleEvents?: LifecycleEvent[];
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<string, string> = {
  UPCOMING: "Upcoming",
  REGISTRATION_OPEN: "Registration Open",
  REGISTRATION_CLOSED: "Registration Closed",
  ADMIT_CARD_OUT: "Admit Card Out",
  EXAM_ONGOING: "Exam Ongoing",
  RESULT_DECLARED: "Result Declared",
  ARCHIVED: "Archived",
};

const STAGE_LABELS: Record<string, string> = {
  REGISTRATION: "Registration",
  ADMIT_CARD: "Admit Card",
  EXAM_DATE: "Exam Date",
  RESULT: "Result",
  PROVISIONAL_RESULT: "Provisional Result",
  FINAL_RESULT: "Final Result",
  INTERVIEW: "Interview / DV",
  ANSWER_KEY: "Answer Key",
  COUNSELLING: "Counselling",
  JOINING: "Joining",
};

function formatDate(dateStr?: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Pure function – takes `now` as a param so it's deterministic on server */
function countdownStr(endsAt: string, now: number): string {
  const diff = new Date(endsAt).getTime() - now;
  if (diff <= 0) return "Closed";
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  if (days > 0) return `${days}d left`;
  if (hours > 0) return `${hours}h left`;
  return "< 1h";
}

/** Server-safe stage state — defaults to 'upcoming', refined on client */
function getStageState(
  event: LifecycleEvent,
  now: number
): "done" | "active" | "upcoming" {
  const start = event.startsAt ? new Date(event.startsAt).getTime() : null;
  const end = event.endsAt ? new Date(event.endsAt).getTime() : null;
  if (end && end < now) return "done";
  if (start && start <= now && (!end || end >= now)) return "active";
  if (end && end >= now && (!start || start <= now)) return "active";
  if (start && start > now) return "upcoming";
  return "upcoming";
}

function getTotalVacancies(v?: number | Record<string, number>): string {
  if (!v) return "TBA";
  if (typeof v === "number") return v.toLocaleString("en-IN");
  const total = Object.values(v).reduce((a, b) => a + (Number(b) || 0), 0);
  return total > 0 ? total.toLocaleString("en-IN") : "TBA";
}

function cleanLabel(s: string): string {
  if (!s) return s;
  return s
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// ─── API ───────────────────────────────────────────────────────────────────────

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

async function fetchExamsFromAPI(
  page = 1,
  limit = 8,
  category?: string,
  status?: string,
  search?: string
): Promise<{ exams: Exam[]; total: number }> {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("limit", String(limit));
  if (category) params.set("category", category);
  if (status) params.set("status", status);
  if (search) params.set("search", search);

  const res = await fetch(`${API_BASE}/exams?${params}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("API unavailable");
  return res.json();
}

async function fetchTimelineFromAPI(
  examId: string
): Promise<LifecycleEvent[]> {
  const res = await fetch(`${API_BASE}/exams/${examId}/timeline`, {
    cache: "no-store",
  });
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : data.events ?? [];
}

// ─── Mock / Seed data (fallback when API is offline) ─────────────────────────

const MOCK_EXAMS: Exam[] = [
  {
    id: "1",
    title: "Union Public Service Commission Civil Services Examination",
    shortTitle: "UPSC CSE 2025",
    conductingBody: "UPSC",
    slug: "upsc-cse-2025",
    status: "REGISTRATION_OPEN",
    category: "CIVIL_SERVICES",
    examLevel: "NATIONAL",
    totalVacancies: 1056,
    applicationFee: { General: 100, "SC/ST/Female": 0 },
    minAge: 21,
    maxAge: 32,
    officialWebsite: "https://upsc.gov.in",
    notificationUrl: "https://upsc.gov.in/notifications",
    description:
      "The Civil Services Examination recruits Group A and Group B officers to services such as IAS, IFS, and IPS.",
    lifecycleEvents: [
      {
        id: "e1",
        stage: "REGISTRATION",
        stageOrder: 1,
        label: "Online Application",
        startsAt: "2025-02-01T00:00:00Z",
        endsAt: "2025-12-31T23:59:00Z",
        actionUrl: "https://upsconline.gov.in",
      },
      {
        id: "e2",
        stage: "EXAM_DATE",
        stageOrder: 2,
        label: "Prelims Exam",
        startsAt: "2026-05-25T00:00:00Z",
        endsAt: "2026-05-25T23:59:00Z",
      },
      {
        id: "e3",
        stage: "RESULT",
        stageOrder: 3,
        label: "Prelims Result",
        startsAt: "2026-07-15T00:00:00Z",
      },
      {
        id: "e4",
        stage: "EXAM_DATE",
        stageOrder: 4,
        label: "Mains Exam",
        startsAt: "2026-09-20T00:00:00Z",
        endsAt: "2026-09-24T23:59:00Z",
      },
      {
        id: "e5",
        stage: "FINAL_RESULT",
        stageOrder: 5,
        label: "Final Result",
        startsAt: "2027-04-01T00:00:00Z",
      },
    ],
  },
  {
    id: "2",
    title: "Staff Selection Commission Combined Graduate Level Examination",
    shortTitle: "SSC CGL 2025",
    conductingBody: "Staff Selection Commission",
    slug: "ssc-cgl-2025",
    status: "UPCOMING",
    category: "SSC",
    examLevel: "NATIONAL",
    totalVacancies: 17727,
    applicationFee: { General: 100, "SC/ST/Female": 0 },
    minAge: 18,
    maxAge: 30,
    officialWebsite: "https://ssc.gov.in",
    notificationUrl: "https://ssc.gov.in/notice",
    description:
      "SSC CGL is conducted to recruit Group B and Group C posts in various Ministries and Departments of the Government of India.",
    lifecycleEvents: [
      {
        id: "e6",
        stage: "REGISTRATION",
        stageOrder: 1,
        label: "Online Application",
        startsAt: "2026-04-15T00:00:00Z",
        endsAt: "2026-05-15T23:59:00Z",
        actionUrl: "https://ssc.gov.in",
      },
      {
        id: "e7",
        stage: "ADMIT_CARD",
        stageOrder: 2,
        label: "Tier-I Admit Card",
        startsAt: "2026-07-01T00:00:00Z",
      },
      {
        id: "e8",
        stage: "EXAM_DATE",
        stageOrder: 3,
        label: "Tier-I Exam",
        startsAt: "2026-07-15T00:00:00Z",
        endsAt: "2026-07-30T23:59:00Z",
      },
      {
        id: "e9",
        stage: "RESULT",
        stageOrder: 4,
        label: "Tier-I Result",
        startsAt: "2026-09-01T00:00:00Z",
      },
      {
        id: "e10",
        stage: "EXAM_DATE",
        stageOrder: 5,
        label: "Tier-II Exam",
        startsAt: "2026-11-01T00:00:00Z",
        endsAt: "2026-11-05T23:59:00Z",
      },
    ],
  },
  {
    id: "3",
    title: "Railway Recruitment Board Non-Technical Popular Category",
    shortTitle: "RRB NTPC 2025",
    conductingBody: "Railway Recruitment Boards",
    slug: "rrb-ntpc-2025",
    status: "ADMIT_CARD_OUT",
    category: "RAILWAY",
    examLevel: "NATIONAL",
    totalVacancies: 11558,
    applicationFee: { General: 500, "SC/ST/Female": 250 },
    minAge: 18,
    maxAge: 33,
    officialWebsite: "https://indianrailways.gov.in",
    notificationUrl: "https://rrbcdg.gov.in/",
    lifecycleEvents: [
      {
        id: "e11",
        stage: "REGISTRATION",
        stageOrder: 1,
        label: "Application Period",
        startsAt: "2025-09-14T00:00:00Z",
        endsAt: "2025-10-13T23:59:00Z",
      },
      {
        id: "e12",
        stage: "ADMIT_CARD",
        stageOrder: 2,
        label: "Admit Card Released",
        startsAt: "2026-02-10T00:00:00Z",
        endsAt: "2026-12-20T23:59:00Z",
        actionUrl: "https://rrbcdg.gov.in/admit-card",
      },
      {
        id: "e13",
        stage: "EXAM_DATE",
        stageOrder: 3,
        label: "CBT Phase-I",
        startsAt: "2026-06-15T00:00:00Z",
        endsAt: "2026-07-30T23:59:00Z",
      },
      {
        id: "e14",
        stage: "ANSWER_KEY",
        stageOrder: 4,
        label: "Answer Key",
        startsAt: "2026-08-20T00:00:00Z",
      },
      {
        id: "e15",
        stage: "RESULT",
        stageOrder: 5,
        label: "CBT-I Result",
        startsAt: "2026-10-01T00:00:00Z",
      },
    ],
  },
  {
    id: "4",
    title: "Institute of Banking Personnel Selection Common Recruitment Process",
    shortTitle: "IBPS PO 2025",
    conductingBody: "IBPS",
    slug: "ibps-po-2025",
    status: "RESULT_DECLARED",
    category: "BANKING",
    examLevel: "NATIONAL",
    totalVacancies: { "PO/MT": 4455 },
    applicationFee: { General: 850, "SC/ST": 175 },
    minAge: 20,
    maxAge: 30,
    officialWebsite: "https://ibps.in",
    notificationUrl: "https://ibps.in/crp-po-mt-xiv/",
    lifecycleEvents: [
      {
        id: "e16",
        stage: "REGISTRATION",
        stageOrder: 1,
        label: "Online Registration",
        startsAt: "2025-08-01T00:00:00Z",
        endsAt: "2025-08-21T23:59:00Z",
      },
      {
        id: "e17",
        stage: "EXAM_DATE",
        stageOrder: 2,
        label: "Prelims",
        startsAt: "2025-10-19T00:00:00Z",
        endsAt: "2025-10-20T23:59:00Z",
      },
      {
        id: "e18",
        stage: "RESULT",
        stageOrder: 3,
        label: "Prelims Result",
        startsAt: "2025-11-20T00:00:00Z",
      },
      {
        id: "e19",
        stage: "EXAM_DATE",
        stageOrder: 4,
        label: "Mains",
        startsAt: "2025-11-30T00:00:00Z",
      },
      {
        id: "e20",
        stage: "FINAL_RESULT",
        stageOrder: 5,
        label: "Final Allotment Result",
        startsAt: "2026-04-01T00:00:00Z",
      },
    ],
  },
  {
    id: "5",
    title: "Maharashtra Public Service Commission State Service Examination",
    shortTitle: "MPSC State Services 2025",
    conductingBody: "MPSC",
    slug: "mpsc-state-services-2025",
    status: "REGISTRATION_OPEN",
    category: "CIVIL_SERVICES",
    examLevel: "STATE",
    state: "Maharashtra",
    totalVacancies: 824,
    applicationFee: { General: 724, "SC/ST": 324 },
    minAge: 19,
    maxAge: 38,
    officialWebsite: "https://mpsc.gov.in",
    notificationUrl: "https://mpsc.gov.in/notifications",
    lifecycleEvents: [
      {
        id: "e21",
        stage: "REGISTRATION",
        stageOrder: 1,
        label: "Application Window",
        startsAt: "2026-03-01T00:00:00Z",
        endsAt: "2026-12-01T23:59:00Z",
        actionUrl: "https://mpsconline.gov.in",
      },
      {
        id: "e22",
        stage: "EXAM_DATE",
        stageOrder: 2,
        label: "Prelims",
        startsAt: "2026-06-15T00:00:00Z",
      },
      {
        id: "e23",
        stage: "RESULT",
        stageOrder: 3,
        label: "Prelims Result",
        startsAt: "2026-09-01T00:00:00Z",
      },
    ],
  },
  {
    id: "6",
    title: "NABARD Grade A & B Officers Recruitment",
    shortTitle: "NABARD Grade A/B 2025",
    conductingBody: "NABARD",
    slug: "nabard-grade-ab-2025",
    status: "REGISTRATION_CLOSED",
    category: "BANKING",
    examLevel: "NATIONAL",
    totalVacancies: 102,
    applicationFee: { General: 800, "SC/ST/PWD": 150 },
    minAge: 21,
    maxAge: 30,
    officialWebsite: "https://nabard.org",
    notificationUrl: "https://nabard.org/recruitment",
    lifecycleEvents: [
      {
        id: "e24",
        stage: "REGISTRATION",
        stageOrder: 1,
        label: "Registration Closed",
        startsAt: "2026-01-10T00:00:00Z",
        endsAt: "2026-02-15T23:59:00Z",
      },
      {
        id: "e25",
        stage: "ADMIT_CARD",
        stageOrder: 2,
        label: "Admit Card",
        startsAt: "2026-03-25T00:00:00Z",
      },
      {
        id: "e26",
        stage: "EXAM_DATE",
        stageOrder: 3,
        label: "Online Exam Phase-I",
        startsAt: "2026-04-12T00:00:00Z",
      },
      {
        id: "e27",
        stage: "RESULT",
        stageOrder: 4,
        label: "Phase-I Result",
        startsAt: "2026-05-20T00:00:00Z",
      },
    ],
  },
];

const CATEGORIES = [
  { value: "ALL", label: "All" },
  { value: "CIVIL_SERVICES", label: "Civil Services" },
  { value: "SSC", label: "SSC" },
  { value: "RAILWAY", label: "Railway" },
  { value: "BANKING", label: "Banking" },
  { value: "DEFENCE", label: "Defence" },
  { value: "POLICE", label: "Police" },
  { value: "TEACHING", label: "Teaching" },
];

const STATUSES = [
  { value: "ALL", label: "All Status" },
  { value: "REGISTRATION_OPEN", label: "Registration Open" },
  { value: "UPCOMING", label: "Upcoming" },
  { value: "ADMIT_CARD_OUT", label: "Admit Card Out" },
  { value: "EXAM_ONGOING", label: "Ongoing" },
  { value: "RESULT_DECLARED", label: "Result Declared" },
  { value: "REGISTRATION_CLOSED", label: "Closed" },
];

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  return (
    <div className={`status-badge status-${status}`}>
      <div className="status-dot" />
      {STATUS_LABELS[status] ?? cleanLabel(status)}
    </div>
  );
}

// ─── Timeline Event Item ──────────────────────────────────────────────────────

function TimelineEventItem({
  event,
  isLast,
  now,
}: {
  event: LifecycleEvent;
  isLast: boolean;
  now: number;
}) {
  const state = getStageState(event, now);
  const label =
    event.label || STAGE_LABELS[event.stage] || cleanLabel(event.stage);

  const dateRange =
    event.startsAt && event.endsAt
      ? `${formatDate(event.startsAt)} → ${formatDate(event.endsAt)}`
      : event.startsAt
        ? formatDate(event.startsAt)
        : event.endsAt
          ? `Until ${formatDate(event.endsAt)}`
          : "Date TBA";

  const isCountdownVisible =
    state === "active" &&
    event.endsAt &&
    new Date(event.endsAt).getTime() > now;

  return (
    <div className="timeline-item">
      <div className="timeline-left">
        <div className={`timeline-dot ${state}`} />
        {!isLast && <div className={`timeline-line ${state}`} />}
      </div>
      <div className="timeline-content">
        <div className={`timeline-stage ${state}`}>{label}</div>
        <div className={`timeline-date-range ${state}`}>{dateRange}</div>
        {isCountdownVisible && (
          <div className="countdown-pill">
            <Clock size={10} />
            {countdownStr(event.endsAt!, now)}
          </div>
        )}
        {state === "active" && event.actionUrl && (
          <a
            href={event.actionUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="timeline-link"
          >
            Apply Now <ExternalLink size={11} />
          </a>
        )}
        {event.notes && (
          <div
            style={{ marginTop: 4, fontSize: 12, color: "var(--text-muted)" }}
          >
            {event.notes}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Exam Card ────────────────────────────────────────────────────────────────

function ExamCard({ exam, now }: { exam: Exam; now: number }) {
  const [expanded, setExpanded] = useState(false);
  const [timeline, setTimeline] = useState<LifecycleEvent[]>(
    (exam.lifecycleEvents ?? []).sort(
      (a, b) => (a.stageOrder ?? 0) - (b.stageOrder ?? 0)
    )
  );
  const [loadingTimeline, setLoadingTimeline] = useState(false);

  const sorted = timeline;
  const visibleEvents = expanded ? sorted : sorted.slice(0, 3);
  const hasMore = sorted.length > 3;

  const loadTimeline = async () => {
    if (timeline.length > 0) {
      setExpanded(true);
      return;
    }
    setLoadingTimeline(true);
    try {
      const events = await fetchTimelineFromAPI(exam.id);
      setTimeline(
        events.sort((a, b) => (a.stageOrder ?? 0) - (b.stageOrder ?? 0))
      );
    } catch {
      /* fallback — keep existing */
    } finally {
      setLoadingTimeline(false);
      setExpanded(true);
    }
  };

  const levelClass = `level-${(exam.examLevel ?? "national").toLowerCase()}`;
  const catClass = `cat-${(exam.category ?? "general").toLowerCase()}`;

  const regEvent = sorted.find((e) => e.stage === "REGISTRATION");
  const admitEvent = sorted.find((e) => e.stage === "ADMIT_CARD");
  const examEvent = sorted.find(
    (e) => e.stage === "EXAM_DATE" || e.stage === "EXAM"
  );

  return (
    <article className="exam-card" id={`exam-${exam.id}`}>
      {/* Header */}
      <div className="exam-card-header">
        <div className="exam-card-left">
          <div className="exam-tags">
            <span className={`exam-tag ${levelClass}`}>
              {cleanLabel(exam.examLevel)}
            </span>
            <span className={`exam-tag ${catClass}`}>
              {cleanLabel(exam.category)}
            </span>
            {exam.state && (
              <span className="exam-tag">
                <MapPin size={9} style={{ display: "inline", marginRight: 3 }} />
                {exam.state}
              </span>
            )}
          </div>
          <h2 className="exam-title">{exam.shortTitle ?? exam.title}</h2>
          <div className="exam-body">{exam.conductingBody}</div>
        </div>
        <StatusBadge status={exam.status} />
      </div>

      {/* Meta row */}
      <div className="exam-meta-row">
        <div className="exam-meta-item">
          <div className="exam-meta-label">
            <Briefcase size={10} style={{ display: "inline", marginRight: 3 }} />
            Vacancies
          </div>
          <div className="exam-meta-value highlight">
            {getTotalVacancies(exam.totalVacancies)}
          </div>
        </div>
        {regEvent?.endsAt && (
          <div className="exam-meta-item">
            <div className="exam-meta-label">
              <Calendar size={10} style={{ display: "inline", marginRight: 3 }} />
              Reg. Deadline
            </div>
            <div className="exam-meta-value">{formatDate(regEvent.endsAt)}</div>
          </div>
        )}
        {admitEvent?.startsAt && (
          <div className="exam-meta-item">
            <div className="exam-meta-label">
              <FileText size={10} style={{ display: "inline", marginRight: 3 }} />
              Admit Card
            </div>
            <div className="exam-meta-value">
              {formatDate(admitEvent.startsAt)}
            </div>
          </div>
        )}
        {examEvent?.startsAt && (
          <div className="exam-meta-item">
            <div className="exam-meta-label">
              <Target size={10} style={{ display: "inline", marginRight: 3 }} />
              Exam Date
            </div>
            <div className="exam-meta-value">
              {formatDate(examEvent.startsAt)}
            </div>
          </div>
        )}
        {exam.minAge && exam.maxAge && (
          <div className="exam-meta-item">
            <div className="exam-meta-label">
              <UserCheck size={10} style={{ display: "inline", marginRight: 3 }} />
              Age Limit
            </div>
            <div className="exam-meta-value">
              {exam.minAge}–{exam.maxAge} yrs
            </div>
          </div>
        )}
        {exam.applicationFee && (
          <div className="exam-meta-item">
            <div className="exam-meta-label">
              <IndianRupee size={10} style={{ display: "inline", marginRight: 3 }} />
              Fee (Gen)
            </div>
            <div className="exam-meta-value">
              ₹
              {exam.applicationFee["General"] ??
                Object.values(exam.applicationFee)[0] ??
                "—"}
            </div>
          </div>
        )}
      </div>

      {/* Timeline */}
      {visibleEvents.length > 0 && (
        <div className="timeline" style={{ marginBottom: 8 }}>
          {visibleEvents.map((event, i) => (
            <TimelineEventItem
              key={event.id}
              event={event}
              now={now}
              isLast={
                i === visibleEvents.length - 1 && (!hasMore || !expanded)
              }
            />
          ))}
          {hasMore && !expanded && (
            <div
              style={{
                fontSize: 12,
                color: "var(--text-muted)",
                marginTop: 6,
                paddingLeft: 40,
              }}
            >
              +{sorted.length - 3} more events
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="exam-card-footer">
        <div className="exam-card-links">
          {exam.officialWebsite && (
            <a
              href={exam.officialWebsite}
              target="_blank"
              rel="noopener noreferrer"
              className="exam-link-btn"
            >
              <Globe size={13} />
              Official Site
            </a>
          )}
          {exam.notificationUrl && (
            <a
              href={exam.notificationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="exam-link-btn"
            >
              <FileText size={13} />
              Notification
            </a>
          )}
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          {sorted.length > 0 && (
            <button
              className="exam-link-btn"
              onClick={() => setExpanded((v) => !v)}
              style={{ cursor: "pointer" }}
            >
              {expanded ? (
                <>
                  <ChevronUp size={13} /> Less
                </>
              ) : (
                <>
                  <ChevronDown size={13} /> Full Timeline
                </>
              )}
            </button>
          )}
          {sorted.length === 0 && (
            <button
              className="exam-link-btn primary"
              onClick={loadTimeline}
              disabled={loadingTimeline}
              style={{ cursor: "pointer" }}
            >
              {loadingTimeline ? (
                <>
                  <RefreshCw size={13} className="spin-icon" /> Loading...
                </>
              ) : (
                <>
                  <Calendar size={13} /> View Timeline
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
        <div style={{ flex: 1 }}>
          <div
            className="skeleton"
            style={{ height: 18, width: "60%", marginBottom: 10 }}
          />
          <div
            className="skeleton"
            style={{ height: 24, width: "80%", marginBottom: 8 }}
          />
          <div className="skeleton" style={{ height: 14, width: "40%" }} />
        </div>
        <div
          className="skeleton"
          style={{ height: 28, width: 130, borderRadius: 100 }}
        />
      </div>
      <div
        className="skeleton"
        style={{ height: 1, width: "100%", marginBottom: 20 }}
      />
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {[1, 2, 3].map((n) => (
          <div key={n} style={{ display: "flex", gap: 16 }}>
            <div
              className="skeleton"
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                flexShrink: 0,
                marginTop: 4,
              }}
            />
            <div style={{ flex: 1 }}>
              <div
                className="skeleton"
                style={{ height: 12, width: "30%", marginBottom: 6 }}
              />
              <div className="skeleton" style={{ height: 14, width: "55%" }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Notification / Personalization Section ────────────────────────────────────

function NotificationSection() {
  const [formState, setFormState] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [form, setForm] = useState({
    name: "",
    email: "",
    category: "ALL",
    state: "",
    level: "ALL",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormState("loading");
    await new Promise((r) => setTimeout(r, 1400));
    if ("Notification" in window && Notification.permission === "default") {
      await Notification.requestPermission();
    }
    setFormState("success");
  };

  return (
    <section className="section notify-section" id="notify">
      <div className="container">
        <div className="notify-card">
          <div className="notify-icon">
            <BellRing size={40} color="var(--accent-light)" />
          </div>
          <h2 className="section-title notify-title">Never Miss a Deadline</h2>
          <p className="notify-desc">
            Set up personalized notifications for the exams that matter to you.
            Get alerts for registration opening, admit card release, and results
            — instantly on your device.
          </p>

          {formState === "success" ? (
            <div className="notify-success">
              <div className="notify-success-icon">
                <CheckCircle2 size={32} color="var(--green)" />
              </div>
              <div className="notify-success-title">You&apos;re all set! 🎉</div>
              <div className="notify-success-desc">
                We&apos;ll send you personalized exam notifications based on
                your preferences. Check your email for confirmation.
              </div>
              <button
                className="btn btn-ghost"
                onClick={() => setFormState("idle")}
                style={{ marginTop: 8 }}
              >
                Update Preferences
              </button>
            </div>
          ) : (
            <form className="personalize-form" onSubmit={handleSubmit}>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  marginBottom: 14,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Star size={12} color="var(--accent-light)" />
                Personalize Your Alerts
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label" htmlFor="notify-name">
                    Name
                  </label>
                  <input
                    id="notify-name"
                    name="name"
                    type="text"
                    className="form-input"
                    placeholder="Your name"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="notify-email">
                    Email
                  </label>
                  <input
                    id="notify-email"
                    name="email"
                    type="email"
                    className="form-input"
                    placeholder="you@email.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label" htmlFor="notify-category">
                    Exam Category
                  </label>
                  <select
                    id="notify-category"
                    name="category"
                    className="form-select"
                    value={form.category}
                    onChange={handleChange}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="notify-level">
                    Exam Level
                  </label>
                  <select
                    id="notify-level"
                    name="level"
                    className="form-select"
                    value={form.level}
                    onChange={handleChange}
                  >
                    <option value="ALL">All Levels</option>
                    <option value="NATIONAL">National</option>
                    <option value="STATE">State</option>
                    <option value="DISTRICT">District</option>
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ marginTop: 8 }}>
                <label className="form-label" htmlFor="notify-state">
                  State (optional)
                </label>
                <select
                  id="notify-state"
                  name="state"
                  className="form-select"
                  value={form.state}
                  onChange={handleChange}
                >
                  <option value="">Any State</option>
                  {[
                    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar",
                    "Chhattisgarh", "Goa", "Gujarat", "Haryana",
                    "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala",
                    "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
                    "Mizoram", "Nagaland", "Odisha", "Punjab",
                    "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
                    "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
                  ].map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 10,
                  alignItems: "center",
                  margin: "16px 0 4px",
                  padding: "10px 14px",
                  background: "rgba(124,58,237,0.07)",
                  borderRadius: 10,
                  border: "1px solid rgba(124,58,237,0.15)",
                }}
              >
                <Smartphone size={18} color="var(--accent-light)" />
                <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                  We&apos;ll also enable{" "}
                  <strong style={{ color: "var(--accent-light)" }}>
                    browser push notifications
                  </strong>{" "}
                  so you get real-time alerts.
                </div>
              </div>

              <button
                type="submit"
                className="notify-btn"
                id="notify-submit-btn"
                disabled={formState === "loading"}
              >
                {formState === "loading" ? (
                  <>
                    <RefreshCw size={16} className="spin-icon" />
                    Setting up...
                  </>
                ) : (
                  <>
                    <Bell size={16} />
                    Enable Personalized Notifications
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

// ─── Features data ────────────────────────────────────────────────────────────

const FEATURES = [
  {
    Icon: Calendar,
    color: "rgba(124,58,237,0.15)",
    iconColor: "#9b5cf6",
    title: "Complete Exam Timeline",
    desc: "See every stage — registration, admit card, exam date, answer key, and result — in a structured, easy-to-read timeline.",
  },
  {
    Icon: BellRing,
    color: "rgba(239,68,68,0.12)",
    iconColor: "#f87171",
    title: "Real-Time Notifications",
    desc: "Get instant push alerts the moment registration opens, admit cards are out, or results are declared.",
  },
  {
    Icon: Star,
    color: "rgba(245,158,11,0.12)",
    iconColor: "#fbbf24",
    title: "Personalized for You",
    desc: "Filter by exam category, level, or state. We only notify you about exams that actually matter to you.",
  },
  {
    Icon: Clock,
    color: "rgba(16,185,129,0.12)",
    iconColor: "#10b981",
    title: "Live Countdown Timers",
    desc: "Live countdown timers for registration closes and result announcements. Zero missed opportunities.",
  },
  {
    Icon: Smartphone,
    color: "rgba(59,130,246,0.12)",
    iconColor: "#60a5fa",
    title: "Mobile App",
    desc: "Stay productive with our mobile app featuring offline access and dedicated notification center.",
    comingSoon: true,
  },
  {
    Icon: Layers,
    color: "rgba(139,92,246,0.12)",
    iconColor: "#a78bfa",
    title: "1000+ Exams Tracked",
    desc: "From UPSC to district-level posts — we aggregate data across all major government exam boards in India.",
  },
];

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function LandingPage() {
  // ── Client-only "now" — avoids hydration mismatch from Date.now()
  const [now, setNow] = useState(0); // 0 = server; synced on client
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setNow(Date.now());
    setMounted(true);
    const interval = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(interval);
  }, []);

  // ── Year for footer — defer to client
  const [currentYear, setCurrentYear] = useState(2026);
  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  // ── Navbar scroll effect
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ── Exam list state
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery), 400);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const loadExams = useCallback(
    async (reset: boolean) => {
      setLoading(true);
      const reqPage = reset ? 1 : page;
      try {
        const result = await fetchExamsFromAPI(
          reqPage,
          8,
          categoryFilter !== "ALL" ? categoryFilter : undefined,
          statusFilter !== "ALL" ? statusFilter : undefined,
          debouncedSearch || undefined
        );
        if (reset) {
          setExams(result.exams ?? []);
          setPage(1);
        } else {
          setExams((prev) => [...prev, ...(result.exams ?? [])]);
        }
        setHasMore((result.exams ?? []).length === 8);
      } catch {
        // Fallback to mock data
        let filtered = [...MOCK_EXAMS];
        if (categoryFilter !== "ALL")
          filtered = filtered.filter((e) => e.category === categoryFilter);
        if (statusFilter !== "ALL")
          filtered = filtered.filter((e) => e.status === statusFilter);
        if (debouncedSearch) {
          const q = debouncedSearch.toLowerCase();
          filtered = filtered.filter(
            (e) =>
              e.title.toLowerCase().includes(q) ||
              e.conductingBody.toLowerCase().includes(q) ||
              (e.shortTitle?.toLowerCase().includes(q) ?? false)
          );
        }
        if (reset) {
          setExams(filtered);
        } else {
          setExams((prev) => [...prev, ...filtered]);
        }
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [categoryFilter, statusFilter, debouncedSearch, page]
  );

  useEffect(() => {
    loadExams(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryFilter, statusFilter, debouncedSearch]);

  const loadMore = () => {
    setPage((p) => p + 1);
    loadExams(false);
  };

  return (
    <>
      <SiteNav />

      {/* ─── Hero ─── */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="container">
          <div className="hero-grid">
            {/* Left */}
            <div className="hero-content">
              <div className="hero-badge">
                <div className="hero-badge-dot" />
                Live Exam Tracking Platform
              </div>

              <h1 className="hero-title">
                Track Every<br />
                <span className="gradient-text">Government Exam</span><br />
                Lifecycle
              </h1>

              <p className="hero-desc">
                From registration to results — Exam Suchana keeps you on track with
                structured timelines, real-time notifications, and personalized
                alerts for every government exam in India.
              </p>

              <div className="hero-actions">
                <a href="#exams" className="btn btn-primary btn-lg">
                  Browse Exams <ArrowRight size={16} />
                </a>
                <a href="#notify" className="btn btn-ghost btn-lg">
                  <Bell size={16} />
                  Get Alerts
                </a>
              </div>

              <div className="hero-stats">
                <div className="hero-stat">
                  <div className="hero-stat-value">1000+</div>
                  <div className="hero-stat-label">Exams Tracked</div>
                </div>
                <div className="hero-stat">
                  <div className="hero-stat-value">50K+</div>
                  <div className="hero-stat-label">Active Users</div>
                </div>
                <div className="hero-stat">
                  <div className="hero-stat-value">0</div>
                  <div className="hero-stat-label">Missed Deadlines</div>
                </div>
              </div>
            </div>

            {/* Right — phone mockup */}
            <div className="hero-visual">
              <div className="hero-orb hero-orb-1" />
              <div className="hero-orb hero-orb-2" />
              <div className="phone-mockup">
                <div className="phone-notch" />
                <div className="phone-screen">
                  <div className="phone-header">
                    <div className="phone-header-title">Exam Suchana</div>
                    <Bell size={14} color="var(--accent-light)" />
                  </div>
                  <div className="phone-exam-cards">
                    {[
                      { name: "UPSC CSE 2025", body: "Union Public Service Commission", color: "#10b981", bg: "rgba(16,185,129,0.15)", status: "Registration Open", dots: [1, 1, 0, 0, 0] },
                      { name: "RRB NTPC 2025", body: "Railway Recruitment Board", color: "#a78bfa", bg: "rgba(139,92,246,0.15)", status: "Admit Card Out", dots: [2, 2, 1, 0, 0] },
                      { name: "SSC CGL 2025", body: "Staff Selection Commission", color: "#fbbf24", bg: "rgba(251,191,36,0.12)", status: "Upcoming", dots: [1, 0, 0, 0, 0] },
                    ].map((item) => (
                      <div className="phone-exam-card" key={item.name}>
                        <div className="phone-exam-name">{item.name}</div>
                        <div className="phone-exam-body">{item.body}</div>
                        <div className="phone-status-pill" style={{ background: item.bg, color: item.color }}>
                          {item.status}
                        </div>
                        <div className="phone-timeline-mini">
                          {item.dots.map((d, i) => (
                            <div key={i} className={`phone-timeline-dot ${d === 2 ? "done" : d === 1 ? "active" : ""}`} />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* ─── Features ─── */}
      <section className="section" id="features">
        <div className="container">
          <div className="section-label">
            <TrendingUp size={12} style={{ display: "inline", marginRight: 6 }} />
            Why Exam Suchana?
          </div>
          <h2 className="section-title">
            Everything you need to<br />execute your exam strategy
          </h2>
          <p className="section-desc">
            Government exam information is scattered everywhere. Exam Suchana
            centralizes it all — structured, real-time, and personalized.
          </p>
          <div className="features-grid">
            {FEATURES.map(({ Icon, color, iconColor, title, desc, comingSoon }) => (
              <div className="feature-card" key={title} style={{ position: 'relative' }}>
                {comingSoon && (
                  <div style={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    fontSize: 10,
                    fontWeight: 800,
                    color: 'var(--accent-light)',
                    background: 'rgba(124,58,237,0.15)',
                    padding: '4px 8px',
                    borderRadius: 100,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                    border: '1px solid rgba(124,58,237,0.3)'
                  }}>
                    Coming Soon
                  </div>
                )}
                <div className="feature-icon" style={{ background: color }}>
                  <Icon size={22} color={iconColor} />
                </div>
                <div className="feature-title">{title}</div>
                <div className="feature-desc">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* ─── Exams Section ─── */}
      <section className="section exams-section" id="exams">
        <div className="container">
          <div className="exams-header">
            <div>
              <div className="section-label">
                <Zap size={12} style={{ display: "inline", marginRight: 6 }} />
                Live Exam Tracker
              </div>
              <h2 className="section-title" style={{ marginBottom: 0 }}>
                All Active Exams
              </h2>
            </div>
            <div style={{ fontSize: 14, color: "var(--text-muted)", alignSelf: "flex-end" }}>
              {exams.length} exam{exams.length !== 1 ? "s" : ""} shown
            </div>
          </div>

          {/* Search + Category filters */}
          <div className="filter-bar">
            <div className="search-bar">
              <Search size={15} color="var(--text-muted)" />
              <input
                type="text"
                id="exam-search-input"
                placeholder="Search exams..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search exams"
              />
            </div>

            {CATEGORIES.map(({ value, label }) => (
              <button
                key={value}
                className={`filter-chip ${categoryFilter === value ? "active" : ""}`}
                onClick={() => { setCategoryFilter(value); setPage(1); }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Status filter row */}
          <div className="filter-bar" style={{ marginBottom: 40, marginTop: -8 }}>
            <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, display: "flex", alignItems: "center", gap: 4 }}>
              <Filter size={11} /> Status:
            </span>
            {STATUSES.map(({ value, label }) => (
              <button
                key={value}
                className={`filter-chip ${statusFilter === value ? "active" : ""}`}
                onClick={() => { setStatusFilter(value); setPage(1); }}
                style={{ fontSize: 12, padding: "6px 14px" }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Cards */}
          {loading && exams.length === 0 ? (
            <div className="exam-grid">
              {[1, 2, 3].map((n) => <SkeletonCard key={n} />)}
            </div>
          ) : exams.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <Info size={48} color="var(--text-muted)" />
              </div>
              <div className="empty-title">No exams found</div>
              <div className="empty-desc">
                Try adjusting your filters or search query.
              </div>
            </div>
          ) : (
            <>
              <div className="exam-grid">
                {/* Pass `now` only after mount so hydration is consistent */}
                {exams.map((exam) => (
                  <ExamCard key={exam.id} exam={exam} now={mounted ? now : 0} />
                ))}
              </div>
              {hasMore && (
                <div className="load-more-wrap">
                  <button
                    className="btn btn-ghost btn-lg"
                    onClick={loadMore}
                    disabled={loading}
                    id="load-more-btn"
                  >
                    {loading ? (
                      <><RefreshCw size={15} className="spin-icon" /> Loading...</>
                    ) : (
                      <><ChevronDown size={15} /> Load More Exams</>
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* ─── Notification Section ─── */}
      <NotificationSection />


      <div className="divider" />

      <SiteFooter />
    </>
  );
}
