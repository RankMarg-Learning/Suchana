import { Platform } from 'react-native';
import Constants from 'expo-constants';

const FALLBACK_TEST_IDS = {
    BANNER: 'ca-app-pub-3940256099942544/6300978111',
    INTERSTITIAL: 'ca-app-pub-3940256099942544/1033173712',
    NATIVE: 'ca-app-pub-3940256099942544/2247696110',
};

let TestIds: any = FALLBACK_TEST_IDS;

const IS_EXPO_GO = 
    Constants.appOwnership === 'expo' || 
    Constants.executionEnvironment === 'storeClient';

if (Platform.OS !== 'web' && !IS_EXPO_GO) {
    try {
        const Ads = require('react-native-google-mobile-ads');
        TestIds = Ads.TestIds || FALLBACK_TEST_IDS;
    } catch (e) {
        console.warn('AdMob library not found in native binary, falling back to test IDs');
    }
}

export const AD_UNIT_IDS = {
    BANNER: __DEV__ ? (TestIds.ADAPTIVE_BANNER || TestIds.BANNER || FALLBACK_TEST_IDS.BANNER) : 'ca-app-pub-3940256099942544/6300978111',
    INTERSTITIAL: __DEV__ ? (TestIds.INTERSTITIAL || FALLBACK_TEST_IDS.INTERSTITIAL) : 'ca-app-pub-3940256099942544/1033173712',
    NATIVE: __DEV__ ? (TestIds.GAM_NATIVE || TestIds.NATIVE || FALLBACK_TEST_IDS.NATIVE) : 'ca-app-pub-3940256099942544/2247696110',
};


export const AD_CONFIG = {
    INTERSTITIAL_INTERVAL: 1,
    MAX_BANNERS_PER_PAGE: 2,
};
