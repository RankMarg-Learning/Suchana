import { Platform } from 'react-native';
import Constants from 'expo-constants';

const debuggerHost = Constants.expoConfig?.hostUri;
const localhost = debuggerHost?.split(':').shift() || 'localhost';

const LOCALHOST = Platform.OS === 'android' && !debuggerHost ? '10.0.2.2' : localhost;

export const BASE_URL = process.env.EXPO_PUBLIC_API_URL || `http://${LOCALHOST}:3001/api/v1`;

export const API = {
    EXAMS: `${BASE_URL}/exams`,
    USERS: `${BASE_URL}/users`,
    PUSH_TOKENS: `${BASE_URL}/push-tokens`,
    CONFIG: `${BASE_URL}/config`,
} as const;
