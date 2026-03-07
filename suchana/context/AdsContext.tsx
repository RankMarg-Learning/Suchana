import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Platform } from 'react-native';
import { AD_UNIT_IDS, AD_CONFIG } from '@/constants/Ads';

interface AdsContextType {
    showInterstitial: (force?: boolean) => Promise<boolean>;
    isAdLoaded: boolean;
}

const AdsContext = createContext<AdsContextType | undefined>(undefined);

// Conditionally expose native dependencies
let InterstitialAd: any;
let AdEventType: any;
let interstitial: any;

if (Platform.OS !== 'web') {
    try {
        const Ads = require('react-native-google-mobile-ads');
        InterstitialAd = Ads.InterstitialAd;
        AdEventType = Ads.AdEventType;

        interstitial = InterstitialAd.createForAdRequest(AD_UNIT_IDS.INTERSTITIAL, {
            requestNonPersonalizedAdsOnly: true,
        });
    } catch (e) {
        console.warn('AdMob Interstitial not available', e);
    }
}

let clickCount = 0;

export function AdsProvider({ children }: { children: React.ReactNode }) {
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        if (Platform.OS === 'web' || !interstitial) return;

        const unsubscribeLoaded = interstitial.addAdEventListener(AdEventType.LOADED, () => {
            setLoaded(true);
        });

        const unsubscribeClosed = interstitial.addAdEventListener(AdEventType.CLOSED, () => {
            setLoaded(false);
            interstitial.load();
        });

        const unsubscribeError = interstitial.addAdEventListener(AdEventType.ERROR, (error: any) => {
            console.warn('Interstitial Ad Error:', error);
        });

        interstitial.load();

        return () => {
            unsubscribeLoaded();
            unsubscribeClosed();
            unsubscribeError();
        };
    }, []);

    const showInterstitial = useCallback(async (force = false) => {
        if (Platform.OS === 'web' || !interstitial) return false;

        clickCount++;
        console.log(`Ads tracking: click ${clickCount}/${AD_CONFIG.INTERSTITIAL_INTERVAL}`);

        if (force || clickCount >= AD_CONFIG.INTERSTITIAL_INTERVAL) {
            if (loaded) {
                try {
                    await interstitial.show();
                    clickCount = 0;
                    return true;
                } catch (e) {
                    console.warn('Failed to show interstitial', e);
                    return false;
                }
            } else {
                interstitial.load();
            }
        }
        return false;
    }, [loaded]);

    return (
        <AdsContext.Provider value={{ showInterstitial, isAdLoaded: loaded }}>
            {children}
        </AdsContext.Provider>
    );
}

export const useAds = () => {
    const context = useContext(AdsContext);
    if (context === undefined) {
        throw new Error('useAds must be used within an AdsProvider');
    }
    return context;
};
