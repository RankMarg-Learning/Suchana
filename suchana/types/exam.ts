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
    category: ExamCategory;
    examLevel: ExamLevel;
    state: string | null;
    totalVacancies: number | null;
    applicationFee: ApplicationFee | null;
    officialWebsite: string | null;
    notificationUrl: string | null;
    status: ExamStatus;
    isPublished: boolean;
    publishedAt: string | null;
    createdAt: string;
    lifecycleEvents?: LifecycleEvent[];
    _count?: { lifecycleEvents: number };
}

export interface ApplicationFee {
    general?: number;
    obc?: number;
    sc_st?: number;
    female?: number;
    currency?: string;
}

export type ExamCategory =
    | 'UPSC' | 'SSC' | 'BANKING' | 'RAILWAY' | 'DEFENCE'
    | 'STATE_PSC' | 'TEACHING' | 'POLICE' | 'MEDICAL'
    | 'ENGINEERING' | 'LAW' | 'OTHER';

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
    preferredCategories?: ExamCategory[];
    preferredExamLevel?: 'NATIONAL' | 'STATE' | 'BOTH';
    employmentStatus?: 'STUDENT' | 'EMPLOYED' | 'UNEMPLOYED' | 'OTHER';
    languagePreference?: 'HINDI' | 'ENGLISH';
    fcmToken?: string;
    platform?: 'android' | 'ios' | 'web';
    appVersion?: string;
    notificationsEnabled?: boolean;
}
