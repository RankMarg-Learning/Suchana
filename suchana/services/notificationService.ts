import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform } from 'react-native';
import axios from 'axios';
import { API } from '@/constants/api';

const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
const PUSH_TOKEN_STORAGE_KEY = '@suchana_pushToken';

const getNotificationsModule = () => {
    try {
        return require('expo-notifications');
    } catch (e) {
        console.warn('Could not load expo-notifications module');
        return null;
    }
};

export interface PushTokenPayload {
    userId: string;
    token: string;
    platform: string;
    deviceModel?: string;
    appVersion?: string;
}


export const SafeNotifications = {
    async getPermissionsAsync() {
        if (isExpoGo && Platform.OS === 'android') return { status: 'granted' };
        const Notifications = getNotificationsModule();
        if (!Notifications) return { status: 'denied' };
        try {
            return await Notifications.getPermissionsAsync();
        } catch (e) {
            console.warn('SafeNotifications.getPermissionsAsync failed', e);
            return { status: 'denied' };
        }
    },

    async requestPermissionsAsync(options: any) {
        if (isExpoGo && Platform.OS === 'android') return { status: 'granted' };
        const Notifications = getNotificationsModule();
        if (!Notifications) return { status: 'denied' };
        try {
            return await Notifications.requestPermissionsAsync(options);
        } catch (e) {
            console.warn('SafeNotifications.requestPermissionsAsync failed', e);
            return { status: 'denied' };
        }
    },

    setNotificationHandler(handler: any) {
        if (isExpoGo && Platform.OS === 'android') return;
        const Notifications = getNotificationsModule();
        if (!Notifications) return;
        try {
            Notifications.setNotificationHandler(handler);
        } catch (e) {
            console.warn('SafeNotifications.setNotificationHandler failed', e);
        }
    },

    /**
     * Get the Expo Push Token safely
     */
    async getExpoPushTokenAsync() {
        if (isExpoGo && Platform.OS === 'android') {
            console.log('Skipping push token retrieval in Expo Go Android');
            return null;
        }
        const Notifications = getNotificationsModule();
        if (!Notifications) return null;

        try {
            const token = await Notifications.getExpoPushTokenAsync({
                projectId: Constants.expoConfig?.extra?.eas?.projectId,
            });
            return token.data;
        } catch (e) {
            console.warn('Failed to get Expo Push Token:', e);
            return null;
        }
    },


    async registerPushToken(userId: string) {
        if (Platform.OS === 'web') return;

        try {
            const { status } = await this.getPermissionsAsync();

            if (status !== 'granted') {
                const existingToken = await AsyncStorage.getItem(PUSH_TOKEN_STORAGE_KEY);
                if (existingToken) {
                    await this.deactivatePushToken(existingToken);
                }
                return;
            }

            const token = await this.getExpoPushTokenAsync();
            if (!token) return;

            await AsyncStorage.setItem(PUSH_TOKEN_STORAGE_KEY, token);

            // 4. Prepare payload
            const payload: PushTokenPayload = {
                userId,
                token,
                platform: Platform.OS,
                appVersion: Constants.expoConfig?.version || '1.0.0',
                deviceModel: Platform.OS === 'ios' ? 'iOS Device' : 'Android Device',
            };

            // 5. Send to backend
            await axios.post(`${API.PUSH_TOKENS}/register`, payload);
            console.log('Push token successfully registered for user:', userId);
        } catch (error) {
            console.error('Error registering push token:', error);
        }
    },

    /**
     * Deactivate a token when notifications are turned off
     */
    async deactivatePushToken(token: string) {
        try {
            await axios.post(`${API.PUSH_TOKENS}/deactivate`, { token });
            await AsyncStorage.removeItem(PUSH_TOKEN_STORAGE_KEY);
            console.log('Push token successfully deactivated');
        } catch (error) {
            console.warn('Error deactivating push token:', error);
        }
    }
};
