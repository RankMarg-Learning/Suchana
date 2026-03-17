import { ExamCategory as Cat, ExamLevel as Lvl, ExamStatus as Status } from '@/constants/enums';

// ─── Exam & Lifecycle TypeScript types (mirrors Prisma models) ───
export interface LifecycleEvent {
    id: string;
    examId: string;
    stage: string;
    eventType: string;
    stageOrder: number;
    title: string;
    description: string | null;
    startsAt: string | null;
    endsAt: string | null;
    isTBD: boolean;
    isImportant: boolean;
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
    status: ExamStatus;
    isPublished: boolean;
    publishedAt: string | null;
    updatedAt: string;
    createdAt: string;
    lifecycleEvents?: LifecycleEvent[];
    _count?: { lifecycleEvents: number };
}

export type ExamCategory = Cat;
export type ExamLevel = Lvl;
export type ExamStatus = Status;

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
