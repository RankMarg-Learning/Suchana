import { useEffect, useRef } from 'react';
import { Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import * as Location from 'expo-location';

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

                // Mark as asked immediately so we never ask again even if this crashes
                await AsyncStorage.setItem(PERMISSIONS_ASKED_KEY, 'true');

                // ─── Notifications ──────────────────────────────────────────────────
                // On Android 13+ and iOS, we need explicit permission
                if (Platform.OS !== 'web') {
                    const { status: existingStatus } =
                        await Notifications.getPermissionsAsync();

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
                                            await Notifications.requestPermissionsAsync({
                                                ios: {
                                                    allowAlert: true,
                                                    allowBadge: true,
                                                    allowSound: true,
                                                },
                                            });
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
                }

                // ─── Location ───────────────────────────────────────────────────────
                // Only ask on native; used to auto-suggest state in personalisation
                if (Platform.OS !== 'web') {
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
                                            await Location.requestForegroundPermissionsAsync();
                                            resolve();
                                        },
                                    },
                                ],
                            );
                        });
                    }
                }
            } catch (_) {
                // Silently swallow — permissions are not critical
            }
        })();
    }, []);
}
