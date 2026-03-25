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
    description?: string | null;
    conductingBody: string;
    applicationFee?: string | null;
    officialWebsite?: string | null;
    notificationUrl?: string | null;
    createdBy: string;
    isPublished: boolean;
    publishedAt?: string | null;
    createdAt: string;
    updatedAt: string;
    category: ExamCategory;
    status: ExamStatus;
    examLevel: ExamLevel;
    qualificationCriteria?: string | null;
    state?: string | null;
    deduplicationKey?: string | null;
    sourceStagedExamId?: string | null;
    totalVacancies?: string | null;
    additionalDetails?: string | null;
    salary?: string | null;
    age?: string | null;
    lifecycleEvents?: LifecycleEvent[];
}

export interface LifecycleEvent {
    id: string;
    examId: string;
    title: string;
    description?: string | null;
    startsAt?: string | null;
    endsAt?: string | null;
    isTBD: boolean;
    actionUrl?: string | null;
    actionLabel?: string | null;
    notificationSent: boolean;
    notifiedAt?: string | null;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
    stage: LifecycleStage;
    stageOrder: number;
    sourceStagedEventId?: string | null;
}

export interface StagedExam {
    id: string;
    scrapeJobId: string;
    existingExamId?: string | null;
    title: string;
    shortTitle?: string | null;
    slug?: string | null;
    description?: string | null;
    conductingBody?: string | null;
    category?: string | null;
    status?: string | null;
    examLevel?: string | null;
    state?: string | null;
    qualificationCriteria?: string | null;
    applicationFee?: string | null;
    officialWebsite?: string | null;
    notificationUrl?: string | null;
    aiConfidence?: number | null;
    aiNotes?: string | null;
    reviewStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'NEEDS_CORRECTION';
    reviewNote?: string | null;
    reviewedBy?: string | null;
    reviewedAt?: string | null;
    deduplicationKey?: string | null;
    contentHash?: string | null;
    isDuplicate: boolean;
    duplicateOfStagedId?: string | null;
    mergedSourceUrls: string[];
    sourceCount: number;
    sourceUrl?: string | null;
    scrapedAt?: string | null;
    createdAt: string;
    updatedAt: string;
    totalVacancies?: string | null;
    additionalDetails?: string | null;
    salary?: string | null;
    age?: string | null;
    stagedEvents?: StagedEvent[];
    scrapeJob?: ScrapeJob;
}

export interface StagedEvent {
    id: string;
    stagedExamId: string;
    stage: string;
    stageOrder: number;
    title: string;
    description?: string | null;
    startsAt?: string | null;
    endsAt?: string | null;
    isTBD: boolean;
    actionUrl?: string | null;
    actionLabel?: string | null;
    createdAt: string;
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
    completedAt?: string | null;
    scrapeSource?: { id: string; label: string; url: string };
    _count?: { stagedExams: number };
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

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    meta?: any;
    error?: {
        code: string;
        message: string;
        details?: any;
    };
}

export interface HomeBanner {
    id: string;
    imageUrl: string;
    actionUrl?: string;
    title?: string;
    description?: string;
    priority: number;
    isActive: boolean;
    expiresAt?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface AppConfig {
    id: string;
    key: string;
    value: any;
    description?: string;
    createdAt?: string;
    updatedAt: string;
}

export interface SeoPage {
    id: string;
    slug: string;
    title: string;
    metaTitle?: string;
    metaDescription?: string;
    content: string;
    keywords: string[];
    ogImage?: string;
    canonicalUrl?: string;
    isPublished: boolean;
    category?: string;
    createdAt: string;
    updatedAt: string;
    examId?: string | null;
    exam?: Exam;
}

export const examService = {
    getAllExams: async (params?: any): Promise<ApiResponse<Exam[]>> => {
        const response = await apiClient.get('/exams', { params });
        return response.data;
    },
    getExamById: async (id: string): Promise<ApiResponse<Exam>> => {
        const response = await apiClient.get(`/exams/${id}`);
        return response.data;
    },
    getExamBySlug: async (slug: string): Promise<ApiResponse<Exam>> => {
        const response = await apiClient.get(`/exams/slug/${slug}`);
        return response.data;
    },
    createExam: async (data: Partial<Exam>): Promise<ApiResponse<Exam>> => {
        const response = await apiClient.post('/exams', data);
        return response.data;
    },
    updateExam: async (id: string, data: Partial<Exam>): Promise<ApiResponse<Exam>> => {
        const response = await apiClient.patch(`/exams/${id}`, data);
        return response.data;
    },
    deleteExam: async (id: string): Promise<ApiResponse<{ deleted: boolean }>> => {
        const response = await apiClient.delete(`/exams/${id}`);
        return response.data;
    },
    notifyBookmarkedUsers: async (id: string, title: string, body: string, audience: 'BOOKMARKED' | 'INTERESTED'): Promise<ApiResponse<{ sent: boolean }>> => {
        const response = await apiClient.post(`/exams/${id}/notify`, { title, body, audience });
        return response.data;
    },
};

export const lifecycleService = {
    getEventsByExamId: async (examId: string): Promise<ApiResponse<LifecycleEvent[]>> => {
        const response = await apiClient.get(`/exams/${examId}/timeline`);
        return response.data;
    },
    addEvent: async (examId: string, data: Partial<LifecycleEvent>): Promise<ApiResponse<LifecycleEvent>> => {
        const response = await apiClient.post(`/exams/${examId}/events`, data);
        return response.data;
    },
    updateEvent: async (examId: string, eventId: string, data: Partial<LifecycleEvent>): Promise<ApiResponse<LifecycleEvent>> => {
        const response = await apiClient.patch(`/exams/${examId}/events/${eventId}`, data);
        return response.data;
    },
    deleteEvent: async (examId: string, eventId: string): Promise<ApiResponse<{ deleted: boolean }>> => {
        const response = await apiClient.delete(`/exams/${examId}/events/${eventId}`);
        return response.data;
    },
    getAllEvents: async (): Promise<ApiResponse<LifecycleEvent[]>> => {
        const response = await apiClient.get('/events');
        return response.data;
    },
};

export const scraperService = {
    getStats: async (): Promise<ApiResponse<ReviewStats>> => {
        const response = await apiClient.get('/scraper/stats');
        return response.data;
    },
    listSources: async (params?: any): Promise<ApiResponse<ScrapeSource[]>> => {
        const response = await apiClient.get('/scraper/sources', { params });
        return response.data;
    },
    listJobs: async (params?: any): Promise<ApiResponse<ScrapeJob[]>> => {
        const response = await apiClient.get('/scraper/jobs', { params });
        return response.data;
    },
    listStagedExams: async (params?: any): Promise<ApiResponse<StagedExam[]>> => {
        const response = await apiClient.get('/scraper/staged', { params });
        return response.data;
    },
    reviewStagedExam: async (id: string, decision: 'APPROVED' | 'REJECTED' | 'NEEDS_CORRECTION', reviewNote?: string, corrections?: any): Promise<ApiResponse<any>> => {
        const response = await apiClient.post(`/scraper/staged/${id}/review`, { decision, reviewNote, corrections });
        return response.data;
    },
    getStagedExamById: async (id: string): Promise<ApiResponse<StagedExam>> => {
        const response = await apiClient.get(`/scraper/staged/${id}`);
        return response.data;
    },
    createSource: async (data: Partial<ScrapeSource>): Promise<ApiResponse<ScrapeSource>> => {
        const response = await apiClient.post('/scraper/sources', data);
        return response.data;
    },
    updateSource: async (id: string, data: Partial<ScrapeSource>): Promise<ApiResponse<ScrapeSource>> => {
        const response = await apiClient.patch(`/scraper/sources/${id}`, data);
        return response.data;
    },
    deleteSource: async (id: string): Promise<ApiResponse<{ deleted: boolean }>> => {
        const response = await apiClient.delete(`/scraper/sources/${id}`);
        return response.data;
    },
    triggerScrape: async (sourceId: string): Promise<ApiResponse<{ message: string; sourceId: string }>> => {
        const response = await apiClient.post('/scraper/trigger', { sourceId });
        return response.data;
    },
    clearCache: async (): Promise<ApiResponse<{ message: string }>> => {
        const response = await apiClient.post('/scraper/clear-cache');
        return response.data;
    },
};

export const configService = {
    getBanners: async (): Promise<ApiResponse<HomeBanner[]>> => {
        const response = await apiClient.get('/config/banners');
        return response.data;
    },
    createBanner: async (data: Partial<HomeBanner>): Promise<ApiResponse<HomeBanner>> => {
        const response = await apiClient.post('/config/banners', data);
        return response.data;
    },
    updateBanner: async (id: string, data: Partial<HomeBanner>): Promise<ApiResponse<HomeBanner>> => {
        const response = await apiClient.patch(`/config/banners/${id}`, data);
        return response.data;
    },
    deleteBanner: async (id: string): Promise<ApiResponse<{ deleted: boolean }>> => {
        const response = await apiClient.delete(`/config/banners/${id}`);
        return response.data;
    },
    getAllConfigs: async (): Promise<ApiResponse<AppConfig[]>> => {
        const response = await apiClient.get('/config/settings');
        return response.data;
    },
    setConfig: async (key: string, value: any, description?: string): Promise<ApiResponse<AppConfig>> => {
        const response = await apiClient.post('/config', { key, value, description });
        return response.data;
    },
    deleteConfig: async (id: string): Promise<ApiResponse<{ deleted: boolean }>> => {
        const response = await apiClient.delete(`/config/settings/${id}`);
        return response.data;
    },
};

export const seoService = {
    // Public (slugs only)
    getAllSlugs: async (): Promise<ApiResponse<{ slug: string }[]>> => {
        const response = await apiClient.get('/seo-pages');
        return response.data;
    },
    // Admin (full details)
    getAllPages: async (params?: any): Promise<ApiResponse<{ pages: SeoPage[], total: number, page: number, totalPages: number }>> => {
        const response = await apiClient.get('/seo-pages/admin/list', { params });
        return response.data;
    },
    // Fetch individual page details (public/admin)
    getPageBySlug: async (slug: string): Promise<ApiResponse<SeoPage>> => {
        const response = await apiClient.get(`/seo-pages/${slug}`);
        return response.data;
    },
    // Create new SEO page
    createPage: async (data: Partial<SeoPage>): Promise<ApiResponse<SeoPage>> => {
        const response = await apiClient.post('/seo-pages', data);
        return response.data;
    },
    // Update existing SEO page
    updatePage: async (id: string, data: Partial<SeoPage>): Promise<ApiResponse<SeoPage>> => {
        const response = await apiClient.patch(`/seo-pages/${id}`, data);
        return response.data;
    },
    // Delete SEO page
    deletePage: async (id: string): Promise<ApiResponse<{ deleted: boolean }>> => {
        const response = await apiClient.delete(`/seo-pages/${id}`);
        return response.data;
    },
};

export default apiClient;
