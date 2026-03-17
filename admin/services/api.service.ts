
import axios from 'axios';
import { API_CONFIG } from '../config/api.config';
import { ExamCategory, ExamLevel, ExamStatus, LifecycleEventType, LifecycleStage } from '../constants/enums';

const apiClient = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_CONFIG.API_KEY}`,
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
    minAge?: number;
    maxAge?: number;
    totalVacancies?: number;
    qualificationCriteria?: any;
    applicationFee?: any;
    officialWebsite?: string;
    notificationUrl?: string;
    isPublished: boolean;
    createdAt: string;
    _count?: {
        lifecycleEvents: number;
    };
}

export interface LifecycleEvent {
    id: string;
    examId: string;
    eventType: LifecycleEventType;
    stage: LifecycleStage;
    stageOrder: number;
    title: string;
    description?: string;
    startsAt?: string;
    endsAt?: string;
    isTBD: boolean;
    isImportant: boolean;
    actionUrl?: string;
    actionLabel?: string;
}

// ─── New: Scraper Types ───────────────────────────────────────

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
    eventType: string;
    stageOrder: number;
    title: string;
    description?: string;
    startsAt?: string;
    endsAt?: string;
    isTBD: boolean;
    isImportant: boolean;
    actionUrl?: string;
    actionLabel?: string;
}

export interface StagedExam {
    id: string;
    scrapeJobId: string;
    existingExamId?: string;  // non-null → update candidate
    title: string;
    shortTitle?: string;
    slug?: string;
    description?: string;
    conductingBody?: string;
    category?: string;
    examLevel?: string;
    state?: string;
    minAge?: number;
    maxAge?: number;
    totalVacancies?: number;
    applicationFee?: any;
    officialWebsite?: string;
    notificationUrl?: string;
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

// ─── Exam Service ─────────────────────────────────────────────
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
    notifyBookmarkedUsers: async (id: string, title?: string, body?: string, targetAudience: 'BOOKMARKED' | 'INTERESTED' = 'BOOKMARKED') => {
        const response = await apiClient.post(`/exams/${id}/notify-manual`, { title, body, targetAudience });
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

// ─── Scraper Service ──────────────────────────────────────────
export const scraperService = {
    // Stats
    getStats: async (): Promise<{ data: ReviewStats }> => {
        const response = await apiClient.get('/scraper/stats');
        return response.data;
    },

    // Sources
    listSources: async (params?: any): Promise<{ data: ScrapeSource[]; meta: any }> => {
        const response = await apiClient.get('/scraper/sources', { params });
        return response.data;
    },
    getSource: async (id: string): Promise<{ data: ScrapeSource }> => {
        const response = await apiClient.get(`/scraper/sources/${id}`);
        return response.data;
    },
    createSource: async (data: Partial<ScrapeSource>): Promise<{ data: ScrapeSource }> => {
        const response = await apiClient.post('/scraper/sources', data);
        return response.data;
    },
    updateSource: async (id: string, data: Partial<ScrapeSource>): Promise<{ data: ScrapeSource }> => {
        const response = await apiClient.patch(`/scraper/sources/${id}`, data);
        return response.data;
    },
    deleteSource: async (id: string) => {
        const response = await apiClient.delete(`/scraper/sources/${id}`);
        return response.data;
    },

    // Jobs
    listJobs: async (params?: any): Promise<{ data: ScrapeJob[] }> => {
        const response = await apiClient.get('/scraper/jobs', { params });
        return response.data;
    },
    getJob: async (id: string): Promise<{ data: ScrapeJob }> => {
        const response = await apiClient.get(`/scraper/jobs/${id}`);
        return response.data;
    },

    // Trigger
    triggerScrape: async (sourceId: string): Promise<any> => {
        const response = await apiClient.post('/scraper/trigger', { sourceId });
        return response.data;
    },
    triggerScrapeSync: async (sourceId: string): Promise<any> => {
        const response = await apiClient.post('/scraper/trigger/sync', { sourceId });
        return response.data;
    },

    // Staged review queue
    listStagedExams: async (params?: any): Promise<{ data: StagedExam[]; meta: any }> => {
        const response = await apiClient.get('/scraper/staged', { params });
        return response.data;
    },
    getStagedExam: async (id: string): Promise<{ data: StagedExam }> => {
        const response = await apiClient.get(`/scraper/staged/${id}`);
        return response.data;
    },
    reviewStagedExam: async (
        id: string,
        decision: 'APPROVED' | 'REJECTED' | 'NEEDS_CORRECTION',
        reviewNote?: string,
        corrections?: any,
    ): Promise<any> => {
        const response = await apiClient.post(`/scraper/staged/${id}/review`, {
            decision,
            reviewNote,
            corrections,
        });
        return response.data;
    },
    updateStagedEvent: async (stagedExamId: string, eventId: string, data: any): Promise<any> => {
        const response = await apiClient.patch(`/scraper/staged/${stagedExamId}/events/${eventId}`, data);
        return response.data;
    },
    deleteStagedEvent: async (stagedExamId: string, eventId: string): Promise<any> => {
        const response = await apiClient.delete(`/scraper/staged/${stagedExamId}/events/${eventId}`);
        return response.data;
    },
};

export default apiClient;

