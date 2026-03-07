import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { AD_UNIT_IDS } from '@/constants/Ads';

// Conditionally import the native dependency
let BannerAd: any;
let BannerAdSize: any;

if (Platform.OS !== 'web') {
  try {
    const Ads = require('react-native-google-mobile-ads');
    BannerAd = Ads.BannerAd;
    BannerAdSize = Ads.BannerAdSize;
  } catch (e) {
    console.warn('AdMob not available', e);
  }
}

interface Props {
  /** pass an AdMob unit ID from your AdMob account */
  adUnitId?: string;
  style?: object;
  size?: any;
}

/**
 * AdBanner — Google AdMob banner with automated size assessment.
 * Handles web compatibility by returning null or a placeholder on web.
 */
export function AdBanner({ adUnitId = AD_UNIT_IDS.BANNER, style, size }: Props) {
  const [error, setError] = React.useState(false);

  // Return null on web as AdMob doesn't support React Native Web
  if (Platform.OS === 'web') {
    return null;
  }

  const activeSize = size || (BannerAdSize ? BannerAdSize.ANCHORED_ADAPTIVE_BANNER : 'BANNER');

  if (error || !BannerAd) {
    return null;
  }

  return (
    <View style={[styles.container, style]}>
      <BannerAd
        unitId={adUnitId}
        size={activeSize}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
        onAdFailedToLoad={(err: any) => {
          console.warn('Ad failed to load: ', err);
          setError(true);
        }}
      />
      <View style={styles.adTagOverlay}>
        <Text style={styles.adTagText}>AD</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
    minHeight: 60,
  },
  adTagOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderBottomRightRadius: 4,
  },
  adTagText: {
    color: '#9CA3AF',
    fontSize: 8,
    fontWeight: '800',
  }
});
