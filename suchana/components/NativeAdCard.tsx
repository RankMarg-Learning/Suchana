import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Constants from 'expo-constants';
import { AD_UNIT_IDS } from '@/constants/Ads';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useColorScheme } from '@/hooks/use-color-scheme';

let NativeAdView: any;
let CallToActionView: any;
let HeadlineView: any;
let TaglineView: any;
let AdvertiserView: any;
let IconView: any;
let MediaView: any;

const IS_EXPO_GO =
    Constants.appOwnership === 'expo' ||
    Constants.executionEnvironment === 'storeClient';

if (Platform.OS !== 'web' && !IS_EXPO_GO) {
    try {
        const Ads = require('react-native-google-mobile-ads');
        NativeAdView = Ads.NativeAdView;
        CallToActionView = Ads.CallToActionView;
        HeadlineView = Ads.HeadlineView;
        TaglineView = Ads.TaglineView;
        AdvertiserView = Ads.AdvertiserView;
        IconView = Ads.IconView;
        MediaView = Ads.MediaView;
    } catch (e) {
        console.warn('Native Ads not available', e);
    }
}

interface Props {
    adUnitId?: string;
    style?: any;
}

export function NativeAdCard({ adUnitId = AD_UNIT_IDS.NATIVE, style }: Props) {
    const nativeAdRef = useRef<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [aspectRatio, setAspectRatio] = useState(1.5);
    const colorScheme = useColorScheme();
    const border = useThemeColor({}, 'border');
    const background = useThemeColor({}, 'background');
    const textPrimary = useThemeColor({}, 'text');
    const textMuted = useThemeColor({}, 'textMuted');
    const tint = useThemeColor({}, 'tint');

    if (Platform.OS === 'web' || IS_EXPO_GO || !NativeAdView) {
        return <MockupNativeAd style={style} />;
    }

    const gradientColors = (colorScheme === 'dark' ? ['#1e1b4b', '#0D0D0F'] : ['#F8FAFC', '#F1F5F9']) as readonly [string, string];

    return (
        <View style={[styles.container, { borderColor: border }, style]}>
            <NativeAdView
                ref={nativeAdRef}
                adUnitID={adUnitId}
                onNativeAdLoaded={(data: any) => {
                    console.log('Native Ad Loaded');
                    setLoading(false);
                    if (data.aspectRatio) setAspectRatio(data.aspectRatio);
                }}
                onAdFailedToLoad={(err: any) => {
                    console.warn('Native Ad Failed:', err);
                    setError(true);
                    setLoading(false);
                }}
                style={styles.nativeAdView}
            >
                <LinearGradient
                    colors={gradientColors}
                    style={styles.gradient}
                >
                    <View style={styles.topRow}>
                        <View style={[styles.proBadge, { backgroundColor: tint + '18' }]}>
                            <AdvertiserView style={[styles.advertiserText, { color: tint }]} />
                        </View>
                        <Text style={[styles.adTag, { color: textMuted }]}>SPONSORED</Text>
                    </View>

                    <View style={styles.contentRow}>
                        <IconView style={styles.adIcon} />
                        <View style={styles.textContainer}>
                            <HeadlineView style={[styles.title, { color: textPrimary }]} numberOfLines={1} />
                            <TaglineView style={[styles.description, { color: textMuted }]} numberOfLines={2} />
                        </View>
                        <CallToActionView
                            style={[styles.ctaBtn, { backgroundColor: textPrimary }]}
                            textStyle={[styles.ctaText, { color: background }]}
                            buttonAndroidStyle={{ backgroundColor: textPrimary, borderRadius: 10 }}
                        />
                    </View>
                    
                    {/* Optional Media View */}
                    <MediaView style={[styles.mediaView, { aspectRatio, backgroundColor: border }]} />

                </LinearGradient>
            </NativeAdView>
            
            {loading && (
                <View style={[StyleSheet.absoluteFill, styles.loadingOverlay, { backgroundColor: background }]}>
                     <ActivityIndicator color={tint} />
                </View>
            )}

            {error && <MockupNativeAd style={style} />}
        </View>
    );
}

function MockupNativeAd({ style }: { style?: any }) {
    const colorScheme = useColorScheme();
    const border = useThemeColor({}, 'border');
    const background = useThemeColor({}, 'background');
    const textPrimary = useThemeColor({}, 'text');
    const textMuted = useThemeColor({}, 'textMuted');
    const tint = useThemeColor({}, 'tint');

    const gradientColors = (colorScheme === 'dark' ? ['#1e1b4b', '#000'] : ['#F8FAFC', '#F1F5F9']) as readonly [string, string];

    return (
        <View style={[styles.container, { borderColor: border }, style]}>
            <LinearGradient colors={gradientColors} style={styles.gradient}>
                <View style={styles.topRow}>
                    <View style={[styles.proBadge, { backgroundColor: tint + '18' }]}>
                        <Text style={[styles.proBadgeText, { color: tint }]}>SUCHANA PRO</Text>
                    </View>
                    <Text style={[styles.adTag, { color: textMuted }]}>AD</Text>
                </View>
                <View style={styles.contentRow}>
                    <View style={styles.textContainer}>
                        <Text style={[styles.title, { color: textPrimary }]}>Unlock Your Career</Text>
                        <Text style={[styles.description, { color: textMuted }]}>Track 500+ exams with real-time notifications.</Text>
                    </View>
                    <View style={[styles.ctaBtn, { backgroundColor: textPrimary }]}>
                        <Text style={[styles.ctaText, { color: background }]}>Upgrade</Text>
                    </View>
                </View>
            </LinearGradient>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginVertical: 12,
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        minHeight: 120,
    },
    nativeAdView: {
        width: '100%',
    },
    gradient: {
        padding: 16,
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    proBadge: {
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    advertiserText: {
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    proBadgeText: {
        fontSize: 10,
        fontWeight: '800',
    },
    adTag: {
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 1,
    },
    contentRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    adIcon: {
        width: 44,
        height: 44,
        borderRadius: 8,
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: '800',
        marginBottom: 2,
    },
    description: {
        fontSize: 12,
        lineHeight: 16,
    },
    ctaBtn: {
        borderRadius: 10,
        paddingHorizontal: 16,
        paddingVertical: 10,
        minWidth: 80,
        alignItems: 'center',
    },
    ctaText: {
        fontSize: 13,
        fontWeight: '900',
    },
    mediaView: {
        width: '100%',
        marginTop: 12,
        borderRadius: 12,
    },
    loadingOverlay: {
        justifyContent: 'center',
        alignItems: 'center',
    },
});
