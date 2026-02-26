
import axios from 'axios';
import { API_CONFIG } from '../config/api.config';
import { ExamCategory, ExamLevel, ExamStatus, LifecycleEventType } from '../constants/enums';

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
    category: ExamCategory;
    status: ExamStatus;
    examLevel: ExamLevel;
    state?: string;
    conductingBody: string;
    totalVacancies?: number;
    qualificationCriteria?: any;
    isPublished: boolean;
    createdAt: string;
}

export interface LifecycleEvent {
    id: string;
    examId: string;
    eventType: LifecycleEventType;
    stage?: string;
    title: string;
    description?: string;
    startsAt?: string;
    endsAt?: string;
    isTBD: boolean;
    isConfirmed: boolean;
    actionUrl?: string;
    actionLabel?: string;
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

export default apiClient;
