import axios from 'axios';
import { API } from '@/constants/api';
import type { User, RegisterUserPayload, Exam } from '@/types/exam';

const client = axios.create({ baseURL: API.USERS, timeout: 10000 });

export async function registerUser(payload: RegisterUserPayload): Promise<User> {
    const { data } = await client.post('/', payload);
    return data.data;
}

export async function getUser(id: string): Promise<User> {
    const { data } = await client.get(`/${id}`);
    return data.data;
}

export async function updateUser(id: string, payload: Partial<RegisterUserPayload>): Promise<User> {
    const { data } = await client.patch(`/${id}`, payload);
    return data.data;
}

export async function getPersonalizedExams(
    id: string,
    page = 1,
    limit = 20
): Promise<{ exams: Exam[]; total: number }> {
    const { data } = await client.get(`/${id}/exams`, { params: { page, limit } });
    return { exams: data.exams, total: data.total };
}

export async function toggleSavedExam(userId: string, examId: string): Promise<User> {
    const { data } = await client.post(`/${userId}/saved-exams`, { examId });
    return data.data;
}
export async function getUserNotifications(userId: string): Promise<any[]> {
    const { data } = await client.get(`/${userId}/notifications`);
    return data.data ?? [];
}
