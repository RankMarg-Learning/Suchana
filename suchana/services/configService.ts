import axios from 'axios';
import { API } from '@/constants/api';
import type { HomeBanner } from '@/types/config';

const client = axios.create({ baseURL: API.CONFIG, timeout: 10000 });

export async function fetchHomeBanners(): Promise<HomeBanner[]> {
    try {
        const { data } = await client.get('/banners');
        return data.data ?? [];
    } catch (error) {
        console.error('Error fetching banners:', error);
        return [];
    }
}

export async function fetchAppConfig(key: string): Promise<any> {
    try {
        const { data } = await client.get(`/${key}`);
        return data.data;
    } catch (error) {
        console.error(`Error fetching config for ${key}:`, error);
        return null;
    }
}
