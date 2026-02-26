import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  /** pass an AdMob unit ID from your AdMob account */
  adUnitId?: string;
  style?: object;
}

/**
 * AdBanner — Google AdMob banner placeholder.
 * In production: replace content with expo-ads-admob <AdMobBanner> component.
 *
 * To enable real ads:
 * 1. npm install expo-ads-admob
 * 2. Replace below with:
 *    import { AdMobBanner } from 'expo-ads-admob';
 *    return <AdMobBanner adUnitID={adUnitId} ... />
 */
export function AdBanner({ adUnitId, style }: Props) {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.adLabel}>Advertisement</Text>
      <Text style={styles.adPlaceholder}>📣 Ad space — Get promoted here</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1A1A1D',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2C2C2E',
    borderStyle: 'dashed',
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginVertical: 8,
  },
  adLabel: { color: '#4B5563', fontSize: 10, fontWeight: '600', letterSpacing: 1, marginBottom: 4 },
  adPlaceholder: { color: '#374151', fontSize: 13 },
});
