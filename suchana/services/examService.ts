import axios from 'axios';
import { API } from '@/constants/api';
import type { Exam, LifecycleEvent } from '@/types/exam';

const client = axios.create({ baseURL: API.EXAMS, timeout: 10000 });

export async function fetchExams(params?: {
    category?: string;
    status?: string;
    examLevel?: string;
    state?: string;
    search?: string;
    page?: number;
    limit?: number;
    isPublished?: boolean;
    lifecycleStage?: string;
}): Promise<{ exams: Exam[]; total: number }> {
    const { data } = await client.get('/', { params: { isPublished: true, ...params } });
    return {
        exams: data.data ?? [],
        total: data.meta?.total ?? 0
    };
}

export async function fetchExamById(id: string): Promise<Exam> {
    const { data } = await client.get(`/${id}`);
    return data.data;
}

export async function fetchTimeline(examId: string): Promise<LifecycleEvent[]> {
    const { data } = await client.get(`/${examId}/timeline`);
    if (data.data?.events && Array.isArray(data.data.events)) return data.data.events;
    if (data.events && Array.isArray(data.events)) return data.events;
    if (Array.isArray(data.data)) return data.data;
    if (Array.isArray(data)) return data;
    return [];
}
export async function fetchSavedExams(userId: string): Promise<Exam[]> {
    const { data } = await client.get(`/saved/${userId}`);
    return data.data ?? [];
}
