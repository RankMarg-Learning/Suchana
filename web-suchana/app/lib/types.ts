// ─── Shared Types ─────────────────────────────────────────────────────────────

export interface LifecycleEvent {
  id: string;
  stage: string;
  stageOrder: number;
  label?: string;
  title?: string;
  startsAt?: string;
  endsAt?: string;
  isTBD?: boolean;
  actionUrl?: string;
  actionLabel?: string;
  notes?: string;
}

export interface Exam {
  id: string;
  title: string;
  shortTitle?: string;
  conductingBody: string;
  slug: string;
  status: string;
  category: string;
  examLevel: string;
  state?: string;
  totalVacancies?: string;
  applicationFee?: string;
  qualificationCriteria?: string;
  salary?: string;
  additionalDetails?: string;
  age?: string;
  officialWebsite?: string;
  notificationUrl?: string;
  description?: string;
  lifecycleEvents?: LifecycleEvent[];
}

export interface SeoPage {
  id: string;
  slug: string;
  title: string;
  metaTitle?: string;
  metaDescription?: string;
  content: string;
  keywords?: string[];
  ogImage?: string;
  canonicalUrl?: string;
  isPublished: boolean;
  category?: string;
  exam?: Exam;
  createdAt: string;
  updatedAt: string;
}


export const STATUS_LABELS: Record<string, string> = {
  NOTIFICATION: "Notification",
  REGISTRATION_OPEN: "Registration Open",
  REGISTRATION_CLOSED: "Registration Closed",
  ADMIT_CARD_OUT: "Admit Card Out",
  EXAM_ONGOING: "Exam Ongoing",
  RESULT_DECLARED: "Result Declared",
  ARCHIVED: "Archived",
};

export const STAGE_LABELS: Record<string, string> = {
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

export const CATEGORIES = [
  { value: "ALL", label: "All Exams", icon: "🏛️" },
  { value: "CIVIL_SERVICES", label: "Civil Services", icon: "⚖️" },
  { value: "SSC", label: "SSC", icon: "📋" },
  { value: "RAILWAY", label: "Railway", icon: "🚂" },
  { value: "BANKING", label: "Banking", icon: "🏦" },
  { value: "DEFENCE", label: "Defence", icon: "🪖" },
  { value: "POLICE", label: "Police", icon: "👮" },
  { value: "TEACHING", label: "Teaching", icon: "📚" },
];

export const STATUSES = [
  { value: "ALL", label: "All Status" },
  { value: "REGISTRATION_OPEN", label: "Registration Open" },
  { value: "NOTIFICATION", label: "Notification" },
  { value: "ADMIT_CARD_OUT", label: "Admit Card Out" },
  { value: "EXAM_ONGOING", label: "Ongoing" },
  { value: "RESULT_DECLARED", label: "Result Declared" },
  { value: "REGISTRATION_CLOSED", label: "Closed" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function formatDate(dateStr?: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export function getTotalVacancies(v?: string): string {
  if (!v) return "TBA";
  return v;
}

export function cleanLabel(s: string): string {
  if (!s) return s;
  return s.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

export function getStageState(event: LifecycleEvent, now: number): "done" | "active" | "upcoming" {
  const start = event.startsAt ? new Date(event.startsAt).getTime() : null;
  const end = event.endsAt ? new Date(event.endsAt).getTime() : null;
  if (end && end < now) return "done";
  if (start && start <= now && (!end || end >= now)) return "active";
  if (end && end >= now && (!start || start <= now)) return "active";
  if (start && start > now) return "upcoming";
  return "upcoming";
}

export function countdownStr(endsAt: string, now: number): string {
  const diff = new Date(endsAt).getTime() - now;
  if (diff <= 0) return "Closed";
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  if (days > 0) return `${days}d left`;
  if (hours > 0) return `${hours}h left`;
  return "< 1h";
}

export function formatDatesInText(text: string | null | undefined, includeTime: boolean = false): string {
  if (!text) return '';
  const dateRegex = /\b\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}(:?\d{2})?))?\b/g;
  return text.replace(dateRegex, (match) => formatDate(match));
}
