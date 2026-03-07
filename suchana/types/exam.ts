// ─── Exam & Lifecycle TypeScript types (mirrors Prisma models) ───
export interface LifecycleEvent {
    id: string;
    examId: string;
    stage: string | null;
    eventType: string;
    title: string;
    description: string | null;
    startsAt: string | null;
    endsAt: string | null;
    isTBD: boolean;
    isConfirmed: boolean;
    actionUrl: string | null;
    actionLabel: string | null;
    notificationSent: boolean;
    createdAt: string;
}

export interface Exam {
    id: string;
    title: string;
    shortTitle: string;
    slug: string;
    description: string | null;
    conductingBody: string;
    category: string;
    examLevel: string;
    state: string | null;
    minAge: number | null;
    maxAge: number | null;
    qualificationCriteria: {
        level?: string;
        rules?: Record<string, any>;
    } | null;
    totalVacancies: number | Record<string, any> | null;
    applicationFee: Record<string, any> | null;
    officialWebsite: string | null;
    notificationUrl: string | null;
    status: string;
    isPublished: boolean;
    publishedAt: string | null;
    createdAt: string;
    lifecycleEvents?: LifecycleEvent[];
    _count?: { lifecycleEvents: number };
}

export type ExamCategory =
    | 'ENGINEERING_ENTRANCE'
    | 'MEDICAL_ENTRANCE'
    | 'LAW_ENTRANCE'
    | 'MBA_ENTRANCE'
    | 'GOVERNMENT_JOBS'
    | 'BANKING_JOBS'
    | 'RAILWAY_JOBS'
    | 'DEFENCE_JOBS'
    | 'POLICE_JOBS'
    | 'TEACHING_ELIGIBILITY'
    | 'STATE_PSC'
    | 'UPSC'
    | 'SSC'
    | 'PROFESSIONAL_CERTIFICATION'
    | 'SCHOOL_BOARD'
    | 'SCHOLARSHIP_EXAMS'
    | 'OLYMPIAD_EXAMS'
    | 'AGRICULTURE_ENTRANCE'
    | 'PARAMEDICAL_ENTRANCE'
    | 'FOREIGN_STUDY_EXAMS'
    | 'SKILL_CERTIFICATION'
    | 'UNIVERSITY_ENTRANCE'
    | 'OTHER';

export type ExamLevel = 'NATIONAL' | 'STATE' | 'DISTRICT' | 'OTHER';

export type ExamStatus = 'UPCOMING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

// ─── User types ───────────────────────────────────────────────
export interface User {
    id: string;
    name: string;
    phone: string;
    state: string | null;
    city: string | null;
    dateOfBirth: string | null;
    gender: 'MALE' | 'FEMALE' | 'OTHER' | null;
    qualification: string | null;
    degree: string | null;
    specialization: string | null;
    preferredCategories: ExamCategory[];
    preferredExamLevel: 'NATIONAL' | 'STATE' | 'BOTH' | null;
    savedExamIds: string[];
    employmentStatus: 'STUDENT' | 'EMPLOYED' | 'UNEMPLOYED' | 'OTHER' | null;
    languagePreference: 'HINDI' | 'ENGLISH';
    notificationsEnabled: boolean;
    fcmToken: string | null;
    createdAt: string;
}

export interface RegisterUserPayload {
    name: string;
    phone: string;
    state?: string;
    city?: string;
    dateOfBirth?: string;
    gender?: 'MALE' | 'FEMALE' | 'OTHER';
    qualification?: string;
    degree?: string;
    specialization?: string;
    preferredCategories?: ExamCategory[];
    preferredExamLevel?: 'NATIONAL' | 'STATE' | 'BOTH';
    employmentStatus?: 'STUDENT' | 'EMPLOYED' | 'UNEMPLOYED' | 'OTHER';
    languagePreference?: 'HINDI' | 'ENGLISH';
    fcmToken?: string;
    platform?: 'android' | 'ios' | 'web';
    appVersion?: string;
    notificationsEnabled?: boolean;
}
