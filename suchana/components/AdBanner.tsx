import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import Constants from 'expo-constants';
import { AD_UNIT_IDS } from '@/constants/Ads';
import { ADS_CONFIG, GLOBAL_ADS_ENABLED, AdPlacement } from '@/constants/AdsConfig';

let BannerAd: any;
let BannerAdSize: any;

const IS_EXPO_GO =
  Constants.appOwnership === 'expo' ||
  Constants.executionEnvironment === 'storeClient';

if (Platform.OS !== 'web' && !IS_EXPO_GO) {
  try {
    const Ads = require('react-native-google-mobile-ads');
    BannerAd = Ads.BannerAd;
    BannerAdSize = Ads.BannerAdSize;
  } catch (e) {
    console.warn('AdMob Banner not available in this build', e);
  }
}

interface Props {
  placement: AdPlacement;
  adUnitId?: string;
  style?: object;
  size?: any;
}

export function AdBanner({ placement, adUnitId, style, size }: Props) {
  const [error, setError] = React.useState(false);

  if (Platform.OS === 'web' || !GLOBAL_ADS_ENABLED) {
    return null;
  }

  const config = ADS_CONFIG[placement];
  if (!config?.enabled) {
    return null;
  }

  const activeAdUnitId = adUnitId || config.adUnitId;
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
