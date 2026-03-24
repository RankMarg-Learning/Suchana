import axios from 'axios';
import { ExamCategory, ExamLevel, ExamStatus, LifecycleStage } from '../constants/enums';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || 'hPUeHHWNwlnK8gWi5WWwhAGBq7OxHmHcRYOCCLka3bWodhIf1dba';

const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
    },
});

export interface Exam {
    id: string;
    title: string;
    shortTitle: string;
    slug: string;
    description?: string;
    category: ExamCategory;
    status: ExamStatus;
    examLevel: ExamLevel;
    state?: string;
    conductingBody: string;
    age?: string;
    qualificationCriteria?: string;
    totalVacancies?: string;
    applicationFee?: string;
    salary?: string;
    additionalDetails?: string;
    officialWebsite?: string;
    notificationUrl?: string;
    isPublished: boolean;
    createdAt: string;
}

export interface LifecycleEvent {
    id: string;
    examId: string;
    stage: LifecycleStage;
    stageOrder: number;
    title: string;
    description?: string;
    startsAt?: string;
    endsAt?: string;
    isTBD: boolean;
    actionUrl?: string;
    actionLabel?: string;
}

export interface ScrapeSource {
    id: string;
    url: string;
    label: string;
    sourceType: 'LISTING' | 'DETAIL';
    hintCategory?: string;
    isActive: boolean;
    createdAt: string;
    _count?: { scrapeJobs: number };
    scrapeJobs?: ScrapeJob[];
}

export interface ScrapeJob {
    id: string;
    scrapeSourceId: string;
    status: 'RUNNING' | 'COMPLETED' | 'FAILED' | 'PARTIAL';
    candidatesFound: number;
    rawPayload?: any;
    errorMessage?: string;
    startedAt: string;
    completedAt?: string;
    scrapeSource?: { id: string; label: string; url: string };
    _count?: { stagedExams: number };
}

export interface StagedEvent {
    id: string;
    stagedExamId: string;
    stage: string;
    stageOrder: number;
    title: string;
    description?: string;
    startsAt?: string;
    endsAt?: string;
    isTBD: boolean;
    actionUrl?: string;
    actionLabel?: string;
}

export interface StagedExam {
    id: string;
    scrapeJobId: string;
    existingExamId?: string;
    title: string;
    shortTitle?: string;
    slug?: string;
    description?: string;
    conductingBody?: string;
    category?: string;
    examLevel?: string;
    state?: string;
    age?: string;
    totalVacancies?: string;
    applicationFee?: string;
    qualificationCriteria?: string;
    salary?: string;
    additionalDetails?: string;
    officialWebsite?: string;
    notificationUrl?: string;
    status?: string;
    aiConfidence?: number;
    aiNotes?: string;
    reviewStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'NEEDS_CORRECTION';
    reviewNote?: string;
    reviewedBy?: string;
    reviewedAt?: string;
    deduplicationKey?: string;
    isDuplicate: boolean;
    sourceCount: number;
    mergedSourceUrls: string[];
    sourceUrl?: string;
    scrapedAt?: string;
    usefulLinks?: Record<string, string>;
    createdAt: string;
    stagedEvents: StagedEvent[];
    scrapeJob?: {
        id: string;
        status: string;
        scrapeSource?: { label: string; url: string };
    };
}

export interface ReviewStats {
    reviewQueue: {
        pending: number;
        approved: number;
        rejected: number;
        needsCorrection: number;
        duplicates: number;
    };
    totalJobs: number;
    recentJobs: ScrapeJob[];
}

export const examService = {
    getAllExams: async (params?: any) => {
        const response = await apiClient.get('/exams', { params });
        return response.data;
    },
    getExamById: async (id: string) => {
        const response = await apiClient.get(`/exams/${id}`);
        return response.data;
    },
    createExam: async (data: any) => {
        const response = await apiClient.post('/exams', data);
        return response.data;
    },
    updateExam: async (id: string, data: any) => {
        const response = await apiClient.patch(`/exams/${id}`, data);
        return response.data;
    },
    deleteExam: async (id: string) => {
        const response = await apiClient.delete(`/exams/${id}`);
        return response.data;
    },
};

export const lifecycleService = {
    getEventsByExamId: async (examId: string) => {
        const response = await apiClient.get(`/exams/${examId}/timeline`);
        return response.data;
    },
    addEvent: async (examId: string, data: any) => {
        const response = await apiClient.post(`/exams/${examId}/events`, data);
        return response.data;
    },
    updateEvent: async (examId: string, eventId: string, data: any) => {
        const response = await apiClient.patch(`/exams/${examId}/events/${eventId}`, data);
        return response.data;
    },
    deleteEvent: async (examId: string, eventId: string) => {
        const response = await apiClient.delete(`/exams/${examId}/events/${eventId}`);
        return response.data;
    },
};

export const scraperService = {
    getStats: async (): Promise<{ data: ReviewStats }> => {
        const response = await apiClient.get('/scraper/stats');
        return response.data;
    },
    listSources: async (params?: any): Promise<{ data: ScrapeSource[]; meta: any }> => {
        const response = await apiClient.get('/scraper/sources', { params });
        return response.data;
    },
    listJobs: async (params?: any): Promise<{ data: ScrapeJob[] }> => {
        const response = await apiClient.get('/scraper/jobs', { params });
        return response.data;
    },
    listStagedExams: async (params?: any): Promise<{ data: StagedExam[]; meta: any }> => {
        const response = await apiClient.get('/scraper/staged', { params });
        return response.data;
    },
    reviewStagedExam: async (id: string, decision: string, reviewNote?: string, corrections?: any): Promise<any> => {
        const response = await apiClient.post(`/scraper/staged/${id}/review`, { decision, reviewNote, corrections });
        return response.data;
    },
};

export default apiClient;
