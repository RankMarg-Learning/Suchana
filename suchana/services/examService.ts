import axios from 'axios';
import { API } from '@/constants/api';
import type { Exam, LifecycleEvent } from '@/types/exam';

const client = axios.create({ baseURL: API.EXAMS, timeout: 10000 });

// ─── Exams ───────────────────────────────────────────────────
export async function fetchExams(params?: {
    category?: string;
    status?: string;
    examLevel?: string;
    state?: string;
    search?: string;
    page?: number;
    limit?: number;
    isPublished?: boolean;
}): Promise<{ exams: Exam[]; total: number }> {
    const { data } = await client.get('/', { params: { isPublished: true, ...params } });
    return data;
}

export async function fetchExamById(id: string): Promise<Exam> {
    const { data } = await client.get(`/${id}`);
    return data.data;
}

export async function fetchTimeline(examId: string): Promise<LifecycleEvent[]> {
    const { data } = await client.get(`/${examId}/timeline`);
    return data.data ?? data;
}
