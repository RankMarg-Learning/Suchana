import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Target, Clock, Bookmark, BookmarkCheck } from 'lucide-react-native';
import type { Exam } from '@/types/exam';

const CATEGORY_COLORS: Record<string, string> = {
  UPSC: '#7C3AED',
  SSC: '#2563EB',
  BANKING: '#059669',
  RAILWAY: '#DC2626',
  DEFENCE: '#1D4ED8',
  STATE_PSC: '#D97706',
  TEACHING: '#DB2777',
  POLICE: '#374151',
  MEDICAL: '#EF4444',
  ENGINEERING: '#0891B2',
  LAW: '#7C3AED',
  OTHER: '#6B7280',
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  UPCOMING: { label: 'Upcoming', color: '#FCD34D', bg: '#4B3800' },
  ACTIVE: { label: 'Active', color: '#6EE7B7', bg: '#064E3B' },
  COMPLETED: { label: 'Closed', color: '#9CA3AF', bg: '#1F2937' },
  CANCELLED: { label: 'Cancelled', color: '#FCA5A5', bg: '#450A0A' },
};

function isNewExam(exam: Exam): boolean {
  if (!exam.createdAt) return false;
  const created = new Date(exam.createdAt).getTime();
  const threeDaysAgo = Date.now() - 3 * 24 * 60 * 60 * 1000;
  return created > threeDaysAgo;
}

interface Props {
  exam: Exam & { matchScore?: number };
  isSaved?: boolean;
  onSaveToggle?: () => void;
}

export function ExamCard({ exam, isSaved, onSaveToggle }: Props) {
  const router = useRouter();
  const catColor = CATEGORY_COLORS[exam.category] ?? '#6B7280';
  const status = STATUS_CONFIG[exam.status] ?? STATUS_CONFIG.UPCOMING;
  const isNew = isNewExam(exam);

  const nextReg = exam.lifecycleEvents?.find(e => e.stage === 'REGISTRATION');
  const daysLeft = nextReg?.endsAt
    ? Math.ceil((new Date(nextReg.endsAt).getTime() - Date.now()) / 86400000)
    : null;
  const isUrgent = daysLeft !== null && daysLeft <= 7 && daysLeft >= 0;

  const score = exam.matchScore ?? 0;
  const scoreColor = score >= 80 ? '#10B981' : score >= 50 ? '#F59E0B' : '#6B7280';

  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={0.9}
      onPress={() => router.push({ pathname: '/exam/[id]', params: { id: exam.id } })}>

      <LinearGradient
        colors={isUrgent ? ['#27120a', '#1C1C1E'] : ['#1C1C1E', '#1C1C1E']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.card, isUrgent && styles.cardUrgent]}>

        {/* Top Header Row */}
        <View style={styles.header}>
          <View style={styles.catRow}>
            <View style={[styles.dot, { backgroundColor: catColor }]} />
            <Text style={styles.categoryText}>{exam.category.replace('_', ' ')}</Text>
            {isNew && <View style={styles.newDot} />}
          </View>

          <View style={[styles.statusBadge, { backgroundColor: status.bg + '55' }]}>
            <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
          </View>
        </View>

        {/* Title & Body */}
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={2}>{exam.title}</Text>
          <Text style={styles.conductingBody}>{exam.conductingBody}</Text>
        </View>

        {/* Progress / Match Score Section */}
        {score > 0 && (
          <View style={styles.matchSection}>
            <View style={styles.matchBarBg}>
              <View style={[styles.matchBarFill, { width: `${score}%`, backgroundColor: scoreColor }]} />
            </View>
            <Text style={[styles.matchText, { color: scoreColor }]}>
              {score}% Match
            </Text>
          </View>
        )}

        {/* Footer Area */}
        <View style={styles.footer}>
          <View style={styles.meta}>
            {exam.totalVacancies != null && (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Target size={14} color="#F4F4F5" style={{ marginRight: 6 }} />
                <Text style={styles.vacancyText}>
                  <Text style={{ fontWeight: '800', color: '#F4F4F5' }}>{exam.totalVacancies.toLocaleString('en-IN')}</Text> Vacancies
                </Text>
              </View>
            )}
            {isUrgent && (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                <Clock size={12} color="#FBBF24" style={{ marginRight: 6 }} />
                <Text style={styles.urgentText}>Ends in {daysLeft}d</Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            onPress={onSaveToggle}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={styles.saveBtn}>
            {isSaved ? <BookmarkCheck size={20} color="#7C3AED" fill="#7C3AED" /> : <Bookmark size={20} color="#94a3b8" />}
          </TouchableOpacity>
        </View>

      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    borderRadius: 20,
    backgroundColor: '#1C1C1E',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  card: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#2C2C2E',
  },
  cardUrgent: {
    borderColor: '#78350F',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  catRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  categoryText: {
    color: '#9CA3AF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  newDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3F3F46',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
  },
  content: {
    marginBottom: 16,
  },
  title: {
    color: '#F4F4F5',
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 24,
    marginBottom: 4,
  },
  conductingBody: {
    color: '#71717A',
    fontSize: 14,
    fontWeight: '500',
  },
  matchSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
    backgroundColor: '#27272A',
    padding: 8,
    borderRadius: 12,
  },
  matchBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: '#3F3F46',
    borderRadius: 3,
    overflow: 'hidden',
  },
  matchBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  matchText: {
    fontSize: 12,
    fontWeight: '800',
    width: 70,
    textAlign: 'right',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  meta: {
    flex: 1,
    gap: 4,
  },
  vacancyText: {
    color: '#A1A1AA',
    fontSize: 13,
    fontWeight: '600',
  },
  urgentText: {
    color: '#FBBF24',
    fontSize: 12,
    fontWeight: '700',
  },
  saveBtn: {
    backgroundColor: '#27272A',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3F3F46',
  },
});
