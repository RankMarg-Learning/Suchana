import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Constants from 'expo-constants';
import { AD_UNIT_IDS } from '@/constants/Ads';

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

    if (Platform.OS === 'web' || IS_EXPO_GO || !NativeAdView) {
        return <MockupNativeAd style={style} />;
    }

    return (
        <View style={[styles.container, style]}>
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
                    colors={['#1e1b4b', '#0D0D0F']}
                    style={styles.gradient}
                >
                    <View style={styles.topRow}>
                        <View style={styles.proBadge}>
                            <AdvertiserView style={styles.advertiserText} />
                        </View>
                        <Text style={styles.adTag}>SPONSORED</Text>
                    </View>

                    <View style={styles.contentRow}>
                        <IconView style={styles.adIcon} />
                        <View style={styles.textContainer}>
                            <HeadlineView style={styles.title} numberOfLines={1} />
                            <TaglineView style={styles.description} numberOfLines={2} />
                        </View>
                        <CallToActionView
                            style={styles.ctaBtn}
                            textStyle={styles.ctaText}
                            buttonAndroidStyle={{ backgroundColor: '#FFF', borderRadius: 8 }}
                        />
                    </View>
                    
                    {/* Optional Media View */}
                    <MediaView style={[styles.mediaView, { aspectRatio }]} />

                </LinearGradient>
            </NativeAdView>
            
            {loading && (
                <View style={[StyleSheet.absoluteFill, styles.loadingOverlay]}>
                     <ActivityIndicator color="#7C3AED" />
                </View>
            )}

            {error && <MockupNativeAd style={style} />}
        </View>
    );
}

function MockupNativeAd({ style }: { style?: any }) {
    return (
        <View style={[styles.container, style]}>
            <LinearGradient colors={['#1e1b4b', '#000']} style={styles.gradient}>
                <View style={styles.topRow}>
                    <View style={styles.proBadge}>
                        <Text style={styles.proBadgeText}>SUCHANA PRO</Text>
                    </View>
                    <Text style={styles.adTag}>AD</Text>
                </View>
                <View style={styles.contentRow}>
                    <View style={styles.textContainer}>
                        <Text style={styles.title}>Unlock Your Career</Text>
                        <Text style={styles.description}>Track 500+ exams with real-time notifications.</Text>
                    </View>
                    <View style={styles.ctaBtn}>
                        <Text style={styles.ctaText}>Upgrade</Text>
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
        borderColor: 'rgba(255,255,255,0.05)',
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
        backgroundColor: 'rgba(124, 58, 237, 0.2)',
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    advertiserText: {
        color: '#a78bfa',
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    proBadgeText: {
        color: '#a78bfa',
        fontSize: 10,
        fontWeight: '800',
    },
    adTag: {
        color: '#4b5563',
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
        color: '#fff',
        fontSize: 16,
        fontWeight: '800',
        marginBottom: 2,
    },
    description: {
        color: '#94a3b8',
        fontSize: 12,
        lineHeight: 16,
    },
    ctaBtn: {
        backgroundColor: '#FFF',
        borderRadius: 10,
        paddingHorizontal: 16,
        paddingVertical: 10,
        minWidth: 80,
        alignItems: 'center',
    },
    ctaText: {
        color: '#000',
        fontSize: 13,
        fontWeight: '900',
    },
    mediaView: {
        width: '100%',
        marginTop: 12,
        borderRadius: 12,
        backgroundColor: '#000',
    },
    loadingOverlay: {
        backgroundColor: '#18181b',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
