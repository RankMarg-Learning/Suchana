import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface Props {
  /** pass an AdMob unit ID from your AdMob account */
  adUnitId?: string;
  style?: object;
}

/**
 * AdBanner — Google AdMob banner placeholder with improved styling.
 */
export function AdBanner({ adUnitId, style }: Props) {
  return (
    <View style={[styles.container, style]}>
      <LinearGradient
        colors={['#18181b', '#111827']}
        style={styles.gradient}>
        <View style={styles.adTag}>
          <Text style={styles.adTagText}>ADVERTISEMENT</Text>
        </View>
        <Text style={styles.adPlaceholder}>📣 Featured Partner Offer</Text>
        <Text style={styles.ctaHint}>Tap to learn more</Text>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#111827',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#374151',
    marginVertical: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  gradient: {
    paddingVertical: 18,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  adTag: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  adTagText: {
    color: '#9CA3AF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 2
  },
  adPlaceholder: {
    color: '#F4F4F5',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  ctaHint: {
    color: '#60a5fa',
    fontSize: 11,
    fontWeight: '600',
  }
});
