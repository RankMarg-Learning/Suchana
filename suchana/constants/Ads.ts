import { Platform } from 'react-native';

// Fallback test IDs for development
const FALLBACK_TEST_IDS = {
    BANNER: 'ca-app-pub-3940256099942544/6300978111',
    INTERSTITIAL: 'ca-app-pub-3940256099942544/1033173712',
    NATIVE: 'ca-app-pub-3940256099942544/2247696110',
};

let TestIds: any = FALLBACK_TEST_IDS;

if (Platform.OS !== 'web') {
    try {
        const Ads = require('react-native-google-mobile-ads');
        TestIds = Ads.TestIds || FALLBACK_TEST_IDS;
    } catch (e) {
        // Silently fail, we have fallbacks
    }
}

export const AD_UNIT_IDS = {
    BANNER: __DEV__ ? TestIds.ADAPTIVE_BANNER || FALLBACK_TEST_IDS.BANNER : 'ca-app-pub-3940256099942544/6300978111', // Replace with real ID
    INTERSTITIAL: __DEV__ ? TestIds.INTERSTITIAL || FALLBACK_TEST_IDS.INTERSTITIAL : 'ca-app-pub-3940256099942544/1033173712', // Replace with real ID
    NATIVE: __DEV__ ? TestIds.GAM_NATIVE || FALLBACK_TEST_IDS.NATIVE : 'ca-app-pub-3940256099942544/2247696110', // Replace with real ID
};


export const AD_CONFIG = {
    INTERSTITIAL_INTERVAL: 1,
    MAX_BANNERS_PER_PAGE: 2,
};
