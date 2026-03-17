import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { AD_UNIT_IDS, AD_CONFIG } from '@/constants/Ads';

interface AdsContextType {
    showInterstitial: (force?: boolean) => Promise<boolean>;
    showRewarded: () => Promise<boolean>;
    isAdLoaded: boolean;
    isRewardedLoaded: boolean;
}

const AdsContext = createContext<AdsContextType | undefined>(undefined);

let mobAds: any;
let InterstitialAd: any;
let RewardedAd: any;
let AdEventType: any;
let RewardedAdEventType: any;
let interstitial: any;
let rewarded: any;
let TestIds: any;

const IS_EXPO_GO =
    Constants.appOwnership === 'expo' ||
    Constants.executionEnvironment === 'storeClient';

if (Platform.OS !== 'web' && !IS_EXPO_GO) {
    try {
        const Ads = require('react-native-google-mobile-ads');
        mobAds = Ads.default;
        InterstitialAd = Ads.InterstitialAd;
        RewardedAd = Ads.RewardedAd;
        AdEventType = Ads.AdEventType;
        RewardedAdEventType = Ads.RewardedAdEventType;
        TestIds = Ads.TestIds;

        interstitial = InterstitialAd.createForAdRequest(AD_UNIT_IDS.INTERSTITIAL, {
            requestNonPersonalizedAdsOnly: true,
        });

        rewarded = RewardedAd.createForAdRequest(AD_UNIT_IDS.REWARDED, {
            requestNonPersonalizedAdsOnly: true,
        });
    } catch (e) {
        console.warn('AdMob Ads not available in this build', e);
    }
}

let clickCount = 0;

export function AdsProvider({ children }: { children: React.ReactNode }) {
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        if (Platform.OS === 'web' || !mobAds) return;

        // Initialize Mobile Ads
        mobAds()
            .initialize()
            .then((adapterStatuses: any) => {
                console.log('Mobile Ads Initialized:', adapterStatuses);
                if (interstitial) {
                    interstitial.load();
                }
                if (rewarded) {
                    rewarded.load();
                }
            })
            .catch((err: any) => {
                console.warn('Mobile Ads Init Error:', err);
            });
    }, []);

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

    const [rewardedLoaded, setRewardedLoaded] = useState(false);

    useEffect(() => {
        if (Platform.OS === 'web' || !rewarded) return;

        const unsubscribeLoaded = rewarded.addAdEventListener(RewardedAdEventType.LOADED, () => {
            setRewardedLoaded(true);
        });

        const unsubscribeEarned = rewarded.addAdEventListener(
            RewardedAdEventType.EARNED_REWARD,
            (reward: any) => {
                console.log('User earned reward of ', reward);
            },
        );

        const unsubscribeClosed = rewarded.addAdEventListener(AdEventType.CLOSED, () => {
            setRewardedLoaded(false);
            rewarded.load();
        });

        const unsubscribeError = rewarded.addAdEventListener(AdEventType.ERROR, (error: any) => {
            console.warn('Rewarded Ad Error:', error);
        });

        rewarded.load();

        return () => {
            unsubscribeLoaded();
            unsubscribeEarned();
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

    const showRewarded = useCallback(async () => {
        if (Platform.OS === 'web' || !rewarded) {
            // If development or web, simulate reward
            if (__DEV__) {
                console.log('Simulating rewarded ad in DEV');
                return true;
            }
            return false;
        }

        if (rewardedLoaded) {
            try {
                await rewarded.show();
                return true;
            } catch (e) {
                console.warn('Failed to show rewarded ad', e);
                return false;
            }
        } else {
            rewarded.load();
            return false;
        }
    }, [rewardedLoaded]);

    return (
        <AdsContext.Provider value={{ 
            showInterstitial, 
            showRewarded,
            isAdLoaded: loaded,
            isRewardedLoaded: rewardedLoaded 
        }}>
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
