import { Platform } from 'react-native';

const LOCALHOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
export const BASE_URL = `http://${LOCALHOST}:3001/api/v1`;

export const API = {
    EXAMS: `${BASE_URL}/exams`,
    USERS: `${BASE_URL}/users`,
    PUSH_TOKENS: `${BASE_URL}/push-tokens`,
} as const;
