import * as Notifications from 'expo-notifications';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform } from 'react-native';

const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

/**
 * Safe Notification Service
 * Swallows errors when running in Expo Go (which doesn't support remote notifications in SDK 53+)
 */
export const SafeNotifications = {
    async getPermissionsAsync() {
        if (isExpoGo && Platform.OS === 'android') return { status: 'granted' }; // Mock for Expo Go
        try {
            return await Notifications.getPermissionsAsync();
        } catch (e) {
            console.warn('SafeNotifications.getPermissionsAsync failed', e);
            return { status: 'denied' };
        }
    },

    async requestPermissionsAsync(options: Notifications.NotificationPermissionsRequest) {
        if (isExpoGo && Platform.OS === 'android') return { status: 'granted' };
        try {
            return await Notifications.requestPermissionsAsync(options);
        } catch (e) {
            console.warn('SafeNotifications.requestPermissionsAsync failed', e);
            return { status: 'denied' };
        }
    },

    setNotificationHandler(handler: Notifications.NotificationHandler) {
        if (isExpoGo && Platform.OS === 'android') return;
        try {
            Notifications.setNotificationHandler(handler);
        } catch (e) {
            console.warn('SafeNotifications.setNotificationHandler failed', e);
        }
    }
};
