import { Platform } from 'react-native';
import Constants from 'expo-constants';

const debuggerHost = Constants.expoConfig?.hostUri;
const localhost = debuggerHost?.split(':').shift() || 'localhost';

const LOCALHOST = Platform.OS === 'android' && !debuggerHost ? '10.0.2.2' : localhost;

export const API_CONFIG = {
    BASE_URL: process.env.EXPO_PUBLIC_API_URL || `https://api.examsuchana.in/api/v1`,
    API_KEY: process.env.EXPO_PUBLIC_API_KEY || 'hPUeHHWNwlnK8gWi5WWwhAGBq7OxHmHcRYOCCLka3bWodhIf1dba',
    ADMIN_ID: 'admin_mobile_app',
};
