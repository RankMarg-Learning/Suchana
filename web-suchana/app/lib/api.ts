import { Exam, LifecycleEvent } from "./types";

export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://examsuchana.in";

// ─── Mock / Seed Data ─────────────────────────────────────────────────────────

export const MOCK_EXAMS: Exam[] = [
  {
    id: "1",
    title: "Union Public Service Commission Civil Services Examination 2025",
    shortTitle: "UPSC CSE 2025",
    conductingBody: "Union Public Service Commission (UPSC)",
    slug: "upsc-cse-2025",
    status: "REGISTRATION_OPEN",
    category: "CIVIL_SERVICES",
    examLevel: "NATIONAL",
    totalVacancies: "1056",
    applicationFee: "General: ₹100, SC/ST/Female: Exempt",
    minAge: 21,
    maxAge: 32,
    officialWebsite: "https://upsc.gov.in",
    notificationUrl: "https://upsc.gov.in/notifications",
    description:
      "The UPSC Civil Services Examination recruits Group A and Group B officers to services such as IAS, IFS, IPS, IRS and 24 other Allied Services. It is one of the most prestigious and competitive exams in India.",
    lifecycleEvents: [
      { id: "e1", stage: "REGISTRATION", stageOrder: 1, label: "Online Application", startsAt: "2025-02-01T00:00:00Z", endsAt: "2025-12-31T23:59:00Z", actionUrl: "https://upsconline.gov.in" },
      { id: "e2", stage: "EXAM_DATE", stageOrder: 2, label: "Prelims Exam", startsAt: "2026-05-25T00:00:00Z", endsAt: "2026-05-25T23:59:00Z" },
      { id: "e3", stage: "RESULT", stageOrder: 3, label: "Prelims Result", startsAt: "2026-07-15T00:00:00Z" },
      { id: "e4", stage: "EXAM_DATE", stageOrder: 4, label: "Mains Exam", startsAt: "2026-09-20T00:00:00Z", endsAt: "2026-09-24T23:59:00Z" },
      { id: "e5", stage: "FINAL_RESULT", stageOrder: 5, label: "Final Result", startsAt: "2027-04-01T00:00:00Z" },
    ],
  },
  {
    id: "2",
    title: "SSC Combined Graduate Level Examination 2025",
    shortTitle: "SSC CGL 2025",
    conductingBody: "Staff Selection Commission (SSC)",
    slug: "ssc-cgl-2025",
    status: "UPCOMING",
    category: "SSC",
    examLevel: "NATIONAL",
    totalVacancies: "17727",
    applicationFee: "General: ₹100, SC/ST/Female: Exempt",
    minAge: 18,
    maxAge: 30,
    officialWebsite: "https://ssc.gov.in",
    notificationUrl: "https://ssc.gov.in/notice",
    description:
      "SSC CGL is conducted to recruit Group B and Group C posts in various Ministries and Departments of the Government of India and its Subordinate Offices.",
    lifecycleEvents: [
      { id: "e6", stage: "REGISTRATION", stageOrder: 1, label: "Online Application", startsAt: "2026-04-15T00:00:00Z", endsAt: "2026-05-15T23:59:00Z", actionUrl: "https://ssc.gov.in" },
      { id: "e7", stage: "ADMIT_CARD", stageOrder: 2, label: "Tier-I Admit Card", startsAt: "2026-07-01T00:00:00Z" },
      { id: "e8", stage: "EXAM_DATE", stageOrder: 3, label: "Tier-I Exam", startsAt: "2026-07-15T00:00:00Z", endsAt: "2026-07-30T23:59:00Z" },
      { id: "e9", stage: "RESULT", stageOrder: 4, label: "Tier-I Result", startsAt: "2026-09-01T00:00:00Z" },
      { id: "e10", stage: "EXAM_DATE", stageOrder: 5, label: "Tier-II Exam", startsAt: "2026-11-01T00:00:00Z", endsAt: "2026-11-05T23:59:00Z" },
    ],
  },
  {
    id: "3",
    title: "RRB Non-Technical Popular Category Recruitment 2025",
    shortTitle: "RRB NTPC 2025",
    conductingBody: "Railway Recruitment Boards (RRB)",
    slug: "rrb-ntpc-2025",
    status: "ADMIT_CARD_OUT",
    category: "RAILWAY",
    examLevel: "NATIONAL",
    totalVacancies: "11558",
    applicationFee: "General: ₹500, SC/ST/Female/ExSM: ₹250",
    minAge: 18,
    maxAge: 33,
    officialWebsite: "https://indianrailways.gov.in",
    notificationUrl: "https://rrbcdg.gov.in/",
    description:
      "RRB NTPC exam is conducted by Railway Recruitment Boards for recruitment to various Non-Technical Popular Category posts in Indian Railways including Junior Clerk, Station Master, Goods Guard and more.",
    lifecycleEvents: [
      { id: "e11", stage: "REGISTRATION", stageOrder: 1, label: "Application Period", startsAt: "2025-09-14T00:00:00Z", endsAt: "2025-10-13T23:59:00Z" },
      { id: "e12", stage: "ADMIT_CARD", stageOrder: 2, label: "Admit Card Released", startsAt: "2026-02-10T00:00:00Z", endsAt: "2026-12-20T23:59:00Z", actionUrl: "https://rrbcdg.gov.in/admit-card" },
      { id: "e13", stage: "EXAM_DATE", stageOrder: 3, label: "CBT Phase-I", startsAt: "2026-06-15T00:00:00Z", endsAt: "2026-07-30T23:59:00Z" },
      { id: "e14", stage: "ANSWER_KEY", stageOrder: 4, label: "Answer Key", startsAt: "2026-08-20T00:00:00Z" },
      { id: "e15", stage: "RESULT", stageOrder: 5, label: "CBT-I Result", startsAt: "2026-10-01T00:00:00Z" },
    ],
  },
  {
    id: "4",
    title: "IBPS Common Recruitment Process for Probationary Officers 2025",
    shortTitle: "IBPS PO 2025",
    conductingBody: "Institute of Banking Personnel Selection (IBPS)",
    slug: "ibps-po-2025",
    status: "RESULT_DECLARED",
    category: "BANKING",
    examLevel: "NATIONAL",
    totalVacancies: "4455",
    applicationFee: "General: ₹850, SC/ST: ₹175",
    minAge: 20,
    maxAge: 30,
    officialWebsite: "https://ibps.in",
    notificationUrl: "https://ibps.in/crp-po-mt-xiv/",
    description:
      "IBPS PO CRP is conducted for selection of Probationary Officers/Management Trainees in Participating Organisations. This is one of the most sought-after banking recruitment exams in India.",
    lifecycleEvents: [
      { id: "e16", stage: "REGISTRATION", stageOrder: 1, label: "Online Registration", startsAt: "2025-08-01T00:00:00Z", endsAt: "2025-08-21T23:59:00Z" },
      { id: "e17", stage: "EXAM_DATE", stageOrder: 2, label: "Prelims", startsAt: "2025-10-19T00:00:00Z", endsAt: "2025-10-20T23:59:00Z" },
      { id: "e18", stage: "RESULT", stageOrder: 3, label: "Prelims Result", startsAt: "2025-11-20T00:00:00Z" },
      { id: "e19", stage: "EXAM_DATE", stageOrder: 4, label: "Mains", startsAt: "2025-11-30T00:00:00Z" },
      { id: "e20", stage: "FINAL_RESULT", stageOrder: 5, label: "Final Allotment Result", startsAt: "2026-04-01T00:00:00Z" },
    ],
  },
  {
    id: "5",
    title: "MPSC Maharashtra State Service Examination 2025",
    shortTitle: "MPSC State Services 2025",
    conductingBody: "Maharashtra Public Service Commission (MPSC)",
    slug: "mpsc-state-services-2025",
    status: "REGISTRATION_OPEN",
    category: "CIVIL_SERVICES",
    examLevel: "STATE",
    state: "Maharashtra",
    totalVacancies: "824",
    applicationFee: "General: ₹724, SC/ST: ₹324",
    minAge: 19,
    maxAge: 38,
    officialWebsite: "https://mpsc.gov.in",
    notificationUrl: "https://mpsc.gov.in/notifications",
    description:
      "MPSC State Service Examination is conducted by the Maharashtra Public Service Commission to fill vacancies in Class A and Class B posts in the Maharashtra state government services.",
    lifecycleEvents: [
      { id: "e21", stage: "REGISTRATION", stageOrder: 1, label: "Application Window", startsAt: "2026-03-01T00:00:00Z", endsAt: "2026-12-01T23:59:00Z", actionUrl: "https://mpsconline.gov.in" },
      { id: "e22", stage: "EXAM_DATE", stageOrder: 2, label: "Prelims", startsAt: "2026-06-15T00:00:00Z" },
      { id: "e23", stage: "RESULT", stageOrder: 3, label: "Prelims Result", startsAt: "2026-09-01T00:00:00Z" },
    ],
  },
  {
    id: "6",
    title: "NABARD Grade A and B Officers Recruitment 2025",
    shortTitle: "NABARD Grade A/B 2025",
    conductingBody: "National Bank for Agriculture and Rural Development (NABARD)",
    slug: "nabard-grade-ab-2025",
    status: "REGISTRATION_CLOSED",
    category: "BANKING",
    examLevel: "NATIONAL",
    totalVacancies: "102",
    applicationFee: "General: ₹800, SC/ST/PWD: ₹150",
    minAge: 21,
    maxAge: 30,
    officialWebsite: "https://nabard.org",
    notificationUrl: "https://nabard.org/recruitment",
    description:
      "NABARD Grade A and B recruitment is for Assistant Manager and Manager level officers. Selected candidates will be posted across India in rural development and agriculture finance roles.",
    lifecycleEvents: [
      { id: "e24", stage: "REGISTRATION", stageOrder: 1, label: "Registration Closed", startsAt: "2026-01-10T00:00:00Z", endsAt: "2026-02-15T23:59:00Z" },
      { id: "e25", stage: "ADMIT_CARD", stageOrder: 2, label: "Admit Card", startsAt: "2026-03-25T00:00:00Z" },
      { id: "e26", stage: "EXAM_DATE", stageOrder: 3, label: "Online Exam Phase-I", startsAt: "2026-04-12T00:00:00Z" },
      { id: "e27", stage: "RESULT", stageOrder: 4, label: "Phase-I Result", startsAt: "2026-05-20T00:00:00Z" },
    ],
  },
  {
    id: "7",
    title: "NDA and NA Examination 2025",
    shortTitle: "NDA/NA 2025",
    conductingBody: "Union Public Service Commission (UPSC)",
    slug: "nda-na-2025",
    status: "REGISTRATION_OPEN",
    category: "DEFENCE",
    examLevel: "NATIONAL",
    totalVacancies: "400",
    applicationFee: "General: ₹100, SC/ST/Female: Exempt",
    minAge: 16,
    maxAge: 19,
    officialWebsite: "https://upsc.gov.in",
    notificationUrl: "https://upsc.gov.in/notifications",
    description:
      "NDA/NA is conducted by UPSC for admission to Army, Navy and Air Force wings of the National Defence Academy and Naval Academy. Eligible candidates are Class 12 pass or appearing.",
    lifecycleEvents: [
      { id: "e28", stage: "REGISTRATION", stageOrder: 1, label: "Application Window", startsAt: "2026-01-15T00:00:00Z", endsAt: "2026-02-28T23:59:00Z", actionUrl: "https://upsconline.gov.in" },
      { id: "e29", stage: "EXAM_DATE", stageOrder: 2, label: "Written Exam", startsAt: "2026-04-20T00:00:00Z" },
      { id: "e30", stage: "RESULT", stageOrder: 3, label: "Written Result", startsAt: "2026-06-15T00:00:00Z" },
    ],
  },
  {
    id: "8",
    title: "CBSE Central Teacher Eligibility Test 2025",
    shortTitle: "CBSE CTET 2025",
    conductingBody: "Central Board of Secondary Education (CBSE)",
    slug: "cbse-ctet-2025",
    status: "UPCOMING",
    category: "TEACHING",
    examLevel: "NATIONAL",
    totalVacancies: "TBA",
    applicationFee: "General: ₹1000, SC/ST/PH: ₹500",
    minAge: 21,
    maxAge: undefined,
    officialWebsite: "https://ctet.nic.in",
    notificationUrl: "https://ctet.nic.in",
    description:
      "CBSE CTET is a mandatory eligibility test for candidates wishing to teach Classes I to VIII in Central Government schools including Kendriya Vidyalayas and Navodaya Vidyalayas.",
    lifecycleEvents: [
      { id: "e31", stage: "REGISTRATION", stageOrder: 1, label: "Online Application", startsAt: "2026-05-01T00:00:00Z", endsAt: "2026-06-01T23:59:00Z" },
      { id: "e32", stage: "EXAM_DATE", stageOrder: 2, label: "CTET Exam", startsAt: "2026-08-01T00:00:00Z" },
      { id: "e33", stage: "RESULT", stageOrder: 3, label: "Result", startsAt: "2026-10-01T00:00:00Z" },
    ],
  },
];

// ─── API Functions ────────────────────────────────────────────────────────────

export async function fetchExamsFromAPI(
  page = 1,
  limit = 10,
  category?: string,
  status?: string,
  search?: string
): Promise<{ exams: Exam[]; total: number }> {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("limit", String(limit));
  params.set("isPublished", "true");
  if (category) params.set("category", category);
  if (status) params.set("status", status);
  if (search) params.set("search", search);

  const res = await fetch(`${API_BASE}/exams?${params}`, {
    next: { revalidate: 300 }, // 5 min cache
  });
  if (!res.ok) throw new Error("API unavailable");
  const data = await res.json();
  return {
    exams: data.data ?? data.exams ?? [],
    total: data.meta?.total ?? data.total ?? 0,
  };
}

export async function fetchExamBySlug(slug: string): Promise<Exam | null> {
  try {
    const res = await fetch(`${API_BASE}/exams/${slug}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data ?? json;
  } catch {
    return MOCK_EXAMS.find((e) => e.slug === slug) ?? null;
  }
}

export async function fetchAllExamSlugs(): Promise<string[]> {
  try {
    const res = await fetch(`${API_BASE}/exams?limit=500&fields=slug`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error();
    const data = await res.json();
    return ((data.data ?? data.exams) ?? []).map((e: Exam) => e.slug);
  } catch {
    return MOCK_EXAMS.map((e) => e.slug);
  }
}

export async function fetchSavedExams(userId: string): Promise<Exam[]> {
  try {
    const res = await fetch(`${API_BASE}/exams/saved/${userId}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.data ?? [];
  } catch {
    return [];
  }
}

export async function toggleSavedExam(userId: string, examId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/users/${userId}/saved-exams`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ examId }),
    });
    const data = await res.json();
    return data.data;
}

export async function getPersonalizedExams(
    id: string,
    page = 1,
    limit = 20
): Promise<{ exams: Exam[]; total: number }> {
    try {
        const res = await fetch(`${API_BASE}/users/${id}/exams?page=${page}&limit=${limit}`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        return { 
          exams: data.exams ?? data.data ?? [], 
          total: data.total ?? data.meta?.total ?? 0 
        };
    } catch {
        return { exams: [], total: 0 };
    }
}

export async function getUser(id: string): Promise<any> {
    const res = await fetch(`${API_BASE}/users/${id}`);
    const data = await res.json();
    return data.data;
}

export async function updateUser(id: string, payload: any): Promise<any> {
    const res = await fetch(`${API_BASE}/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    return data.data;
}

export async function registerUser(payload: any): Promise<any> {
  const res = await fetch(`${API_BASE}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to register");
  }
  const data = await res.json();
  return data.data;
}

export async function checkUserByPhone(phone: string): Promise<any> {
  const res = await fetch(`${API_BASE}/users/phone/${phone}`);
  if (!res.ok) return { isRegistered: false, data: null };
  const data = await res.json();
  return data;
}

