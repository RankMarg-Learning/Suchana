import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import type { ExamCategory } from '@/types/exam';

const CATEGORY_COLORS: Record<string, string> = {
  UPSC:        '#7C3AED',
  SSC:         '#2563EB',
  BANKING:     '#059669',
  RAILWAY:     '#DC2626',
  DEFENCE:     '#1D4ED8',
  STATE_PSC:   '#D97706',
  TEACHING:    '#DB2777',
  POLICE:      '#374151',
  MEDICAL:     '#EF4444',
  ENGINEERING: '#0891B2',
  LAW:         '#8B5CF6',
  OTHER:       '#6B7280',
};

interface Props {
  label: string;
  value: string;
  selected: boolean;
  onPress: () => void;
}

export function CategoryChip({ label, value, selected, onPress }: Props) {
  const color = CATEGORY_COLORS[value] ?? '#6B7280';
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.chip,
        selected
          ? { backgroundColor: color, borderColor: color }
          : { backgroundColor: color + '18', borderColor: color + '60' },
      ]}
      activeOpacity={0.75}>
      <Text style={[styles.label, { color: selected ? '#fff' : color }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderRadius: 99,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginRight: 8,
  },
  label: { fontSize: 13, fontWeight: '600' },
});
