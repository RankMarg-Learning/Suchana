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

                // ─── Direct Notifications Request ─────────────────────────────
                if (Platform.OS !== 'web' && !isExpoGo) {
                    try {
                        const Notifications = require('expo-notifications');
                        await Notifications.requestPermissionsAsync({
                            ios: {
                                allowAlert: true,
                                allowBadge: true,
                                allowSound: true,
                            },
                        });
                        
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
                        console.warn('Notifications setup failed:', e);
                    }
                }

                // ─── Direct Location Request ──────────────────────────────────
                if (Platform.OS !== 'web') {
                    try {
                        await Location.requestForegroundPermissionsAsync();
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
