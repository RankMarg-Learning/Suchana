import { useEffect, useRef } from 'react';
import { Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import Constants, { ExecutionEnvironment } from 'expo-constants';

const PERMISSIONS_ASKED_KEY = '@suchana_permissions_asked';

/**
 * Asks for notification + location permissions once, on first ever launch.
 * Never bothers the user again after that, regardless of grant/deny outcome.
 */
export function useFirstLaunchPermissions() {
    const asked = useRef(false);

    useEffect(() => {
        if (asked.current) return;
        asked.current = true;

        (async () => {
            try {
                const alreadyAsked = await AsyncStorage.getItem(PERMISSIONS_ASKED_KEY);
                if (alreadyAsked) return;

                await AsyncStorage.setItem(PERMISSIONS_ASKED_KEY, 'true');

                const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

                if (Platform.OS !== 'web' && !isExpoGo) {
                    try {
                        const Notifications = require('expo-notifications');

                        const { status: existingStatus } = await Notifications.getPermissionsAsync();

                        if (existingStatus !== 'granted') {
                            await new Promise<void>(resolve => {
                                Alert.alert(
                                    '🔔 Stay Ahead of Deadlines',
                                    'Get instant alerts for exam registrations, admit cards, and results — so you never miss a deadline.',
                                    [
                                        {
                                            text: 'Not Now',
                                            style: 'cancel',
                                            onPress: () => resolve(),
                                        },
                                        {
                                            text: 'Allow Notifications',
                                            onPress: async () => {
                                                try {
                                                    await Notifications.requestPermissionsAsync({
                                                        ios: {
                                                            allowAlert: true,
                                                            allowBadge: true,
                                                            allowSound: true,
                                                        },
                                                    });
                                                } catch (e) {
                                                    console.warn('Failed to request notifications permission:', e);
                                                }
                                                resolve();
                                            },
                                        },
                                    ],
                                );
                            });
                        }

                        // Configure how notifications behave when app is in foreground
                        Notifications.setNotificationHandler({
                            handleNotification: async () => ({
                                shouldShowAlert: true,
                                shouldPlaySound: true,
                                shouldSetBadge: true,
                                shouldShowBanner: true,
                                shouldShowList: true,
                            }),
                        });
                    } catch (e) {
                        console.warn('Notifications setup failed (Expected if in Expo Go Android):', e);
                    }
                } else if (isExpoGo) {
                    console.info('Skipping expo-notifications in Expo Go (SDK 54+ Android limitation). Use Development Build for push notifications.');
                }

                // ─── Location ───────────────────────────────────────────────────────
                // Only ask on native; used to auto-suggest state in personalisation
                if (Platform.OS !== 'web') {
                    try {
                        const { status: locStatus } =
                            await Location.getForegroundPermissionsAsync();

                        if (locStatus !== 'granted') {
                            await new Promise<void>(resolve => {
                                Alert.alert(
                                    '📍 Local Exam Alerts',
                                    'Allow location access to automatically detect your state and show relevant State PSC, Police and teaching exams near you.',
                                    [
                                        {
                                            text: 'Not Now',
                                            style: 'cancel',
                                            onPress: () => resolve(),
                                        },
                                        {
                                            text: 'Allow Location',
                                            onPress: async () => {
                                                try {
                                                    await Location.requestForegroundPermissionsAsync();
                                                } catch (e) {
                                                    console.warn('Failed to request location permission:', e);
                                                }
                                                resolve();
                                            },
                                        },
                                    ],
                                );
                            });
                        }
                    } catch (e) {
                        console.warn('Location permissions check failed:', e);
                    }
                }
            } catch (err) {
                console.error('Error in useFirstLaunchPermissions catch block:', err);
                // Silently swallow — permissions are not critical
            }
        })();
    }, []);
}
