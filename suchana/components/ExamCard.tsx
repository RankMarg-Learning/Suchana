import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import type { Exam } from '@/types/exam';

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
  LAW:         '#7C3AED',
  OTHER:       '#6B7280',
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  UPCOMING:  { label: 'Upcoming', color: '#FCD34D', bg: '#4B3800' },
  ACTIVE:    { label: 'Active',   color: '#6EE7B7', bg: '#064E3B' },
  COMPLETED: { label: 'Closed',  color: '#9CA3AF', bg: '#1F2937' },
  CANCELLED: { label: 'Cancelled', color: '#FCA5A5', bg: '#450A0A' },
};

/** Returns true if exam was created/updated in last 3 days */
function isNewExam(exam: Exam): boolean {
  if (!exam.createdAt) return false;
  const created = new Date(exam.createdAt).getTime();
  const threeDaysAgo = Date.now() - 3 * 24 * 60 * 60 * 1000;
  return created > threeDaysAgo;
}

interface Props {
  exam: Exam;
  isSaved?: boolean;
  onSaveToggle?: () => void;
}

export function ExamCard({ exam, isSaved, onSaveToggle }: Props) {
  const router = useRouter();
  const catColor = CATEGORY_COLORS[exam.category] ?? '#6B7280';
  const status = STATUS_CONFIG[exam.status] ?? STATUS_CONFIG.UPCOMING;
  const isNew = isNewExam(exam);

  // Next upcoming registration event
  const nextReg = exam.lifecycleEvents?.find(e => e.eventType === 'REGISTRATION');
  const daysLeft = nextReg?.endsAt
    ? Math.ceil((new Date(nextReg.endsAt).getTime() - Date.now()) / 86400000)
    : null;
  const isUrgent = daysLeft !== null && daysLeft <= 7 && daysLeft >= 0;
  const isRegOpen = daysLeft !== null && daysLeft > 0;

  return (
    <TouchableOpacity
      style={[styles.card, isUrgent && styles.cardUrgent]}
      activeOpacity={0.88}
      onPress={() => router.push({ pathname: '/exam/[id]', params: { id: exam.id } })}>

      {/* Urgent deadline strip */}
      {isUrgent && (
        <View style={styles.urgentStrip}>
          <Text style={styles.urgentText}>⏰ Apply closes in {daysLeft}d</Text>
        </View>
      )}

      {/* Header row */}
      <View style={styles.headerRow}>
        <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center', flex: 1 }}>
          <View style={[styles.categoryBadge, { backgroundColor: catColor + '22', borderColor: catColor }]}>
            <Text style={[styles.categoryText, { color: catColor }]}>{exam.category.replace('_', ' ')}</Text>
          </View>
          {isNew && (
            <View style={styles.newBadge}>
              <Text style={styles.newBadgeText}>NEW</Text>
            </View>
          )}
        </View>
        <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
          <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
        </View>
      </View>

      {/* Title */}
      <Text style={styles.title} numberOfLines={2}>{exam.title}</Text>
      <Text style={styles.body}>{exam.conductingBody}</Text>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerLeft}>
          {exam.totalVacancies != null && (
            <Text style={styles.meta}>
              <Text style={styles.metaLabel}>Vacancies: </Text>
              {exam.totalVacancies.toLocaleString('en-IN')}
            </Text>
          )}
          {exam.examLevel && (
            <View style={styles.levelChip}>
              <Text style={styles.levelText}>{exam.examLevel}</Text>
            </View>
          )}
          {/* Registration open pill */}
          {isRegOpen && !isUrgent && (
            <View style={styles.regOpenChip}>
              <Text style={styles.regOpenText}>📝 Apply Open</Text>
            </View>
          )}
        </View>
        <TouchableOpacity onPress={onSaveToggle} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={{ fontSize: 20 }}>{isSaved ? '🔖' : '🔕'}</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  cardUrgent: {
    borderColor: '#78350F',
  },
  urgentStrip: {
    backgroundColor: '#4B1C00',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  urgentText: { color: '#FBBF24', fontSize: 12, fontWeight: '600' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  categoryBadge: {
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  categoryText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  newBadge: {
    backgroundColor: '#065F46',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: '#059669',
  },
  newBadgeText: { color: '#6EE7B7', fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  statusBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  statusText: { fontSize: 11, fontWeight: '600' },
  title: { color: '#F4F4F5', fontSize: 16, fontWeight: '700', marginBottom: 4, lineHeight: 22 },
  body:  { color: '#9CA3AF', fontSize: 13, marginBottom: 12 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  footerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1, flexWrap: 'wrap' },
  meta: { color: '#6B7280', fontSize: 12 },
  metaLabel: { color: '#9CA3AF', fontWeight: '600' },
  levelChip: {
    backgroundColor: '#27272A',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  levelText: { color: '#A1A1AA', fontSize: 10, fontWeight: '600', letterSpacing: 0.5 },
  regOpenChip: {
    backgroundColor: '#052e16',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: '#166534',
  },
  regOpenText: { color: '#86efac', fontSize: 10, fontWeight: '600' },
});
