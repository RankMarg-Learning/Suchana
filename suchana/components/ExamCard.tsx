import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Target, Clock, Bookmark, BookmarkCheck } from 'lucide-react-native';
import type { Exam } from '@/types/exam';

const CATEGORY_COLORS: Record<string, string> = {
  ENGINEERING_ENTRANCE: '#0891B2',
  MEDICAL_ENTRANCE: '#EF4444',
  LAW_ENTRANCE: '#7C3AED',
  MBA_ENTRANCE: '#DB2777',
  GOVERNMENT_JOBS: '#059669',
  BANKING_JOBS: '#059669',
  RAILWAY_JOBS: '#DC2626',
  DEFENCE_JOBS: '#1D4ED8',
  POLICE_JOBS: '#374151',
  TEACHING_ELIGIBILITY: '#DB2777',
  STATE_PSC: '#D97706',
  UPSC: '#7C3AED',
  SSC: '#2563EB',
  PROFESSIONAL_CERTIFICATION: '#7C3AED',
  SCHOOL_BOARD: '#2563EB',
  SCHOLARSHIP_EXAMS: '#D97706',
  OLYMPIAD_EXAMS: '#DC2626',
  AGRICULTURE_ENTRANCE: '#059669',
  PARAMEDICAL_ENTRANCE: '#EF4444',
  FOREIGN_STUDY_EXAMS: '#1D4ED8',
  SKILL_CERTIFICATION: '#374151',
  UNIVERSITY_ENTRANCE: '#0891B2',
  OTHER: '#6B7280',
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  NOTIFICATION: { label: 'Notification', color: '#818CF8', bg: '#1E1B4B' },
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
  onPress?: () => void;
}

export function ExamCard({ exam, isSaved, onSaveToggle, onPress }: Props) {
  const router = useRouter();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push({ pathname: '/exam/[id]', params: { id: exam.id } });
    }
  };
  const catColor = CATEGORY_COLORS[exam.category] ?? '#6B7280';
  const status = STATUS_CONFIG[exam.status] ?? STATUS_CONFIG.NOTIFICATION;
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
      onPress={handlePress}>

      <LinearGradient
        colors={['#18181b', '#09090b']}
        style={[styles.card, isUrgent && styles.cardUrgent]}>

        {/* Top Header */}
        <View style={styles.header}>
          <View style={styles.catRow}>
            <View style={[styles.dot, { backgroundColor: catColor }]} />
            <Text style={styles.categoryText}>{exam.category.replace('_', ' ')}</Text>
            {isNew && (
              <View style={styles.newBadge}>
                <Text style={styles.newBadgeText}>NEW</Text>
              </View>
            )}
          </View>
          <View style={[styles.statusBadge, { borderColor: status.color + '44', backgroundColor: status.bg + '33' }]}>
            <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title} numberOfLines={2}>{exam.title}</Text>
        <Text style={styles.conductingBody}>{exam.conductingBody}</Text>

        {/* Key Stats Row */}
        <View style={styles.statsRow}>
          {exam.totalVacancies != null && (
            <View style={styles.statItem}>
              <Target size={14} color="#7C3AED" />
              <Text style={styles.statText}>
                <Text style={styles.statHighlight}>{exam.totalVacancies ? (exam.totalVacancies.length > 8 ? exam.totalVacancies.substring(0, 8) + '...' : exam.totalVacancies) : 'Check'}</Text> Vacancies
              </Text>
            </View>
          )}
          {score > 0 && (
            <View style={[styles.statItem, { backgroundColor: scoreColor + '11', borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2, marginLeft: 'auto' }]}>
              <Text style={[styles.matchScoreText, { color: scoreColor }]}>{score}% Match</Text>
            </View>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          {isUrgent ? (
            <View style={styles.urgentRow}>
              <Clock size={12} color="#FBBF24" />
              <Text style={styles.urgentText}>Closing in {daysLeft} days</Text>
            </View>
          ) : (
            <View style={styles.dateRow}>
              <Clock size={12} color="#71717A" />
              <Text style={styles.dateText}>Posted {new Date(exam.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</Text>
            </View>
          )}

          <TouchableOpacity
            onPress={onSaveToggle}
            style={styles.saveBtn}>
            {isSaved ? <BookmarkCheck size={20} color="#7C3AED" fill="#7C3AED" /> : <Bookmark size={20} color="#52525B" />}
          </TouchableOpacity>
        </View>

      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    borderRadius: 24,
    backgroundColor: '#18181b',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  card: {
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  cardUrgent: { borderColor: 'rgba(251,191,36,0.3)' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  catRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  categoryText: { color: '#71717A', fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.8 },
  newBadge: { backgroundColor: '#10B981', paddingHorizontal: 5, paddingVertical: 1, borderRadius: 4 },
  newBadgeText: { color: '#FFF', fontSize: 8, fontWeight: '900' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1 },
  statusText: { fontSize: 9, fontWeight: '900', textTransform: 'uppercase' },
  title: { color: '#F4F4F5', fontSize: 18, fontWeight: '900', lineHeight: 24, marginBottom: 4 },
  conductingBody: { color: '#52525B', fontSize: 13, fontWeight: '600', marginBottom: 16 },
  statsRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 12 },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statText: { color: '#71717A', fontSize: 13, fontWeight: '500' },
  statHighlight: { color: '#E4E4E7', fontWeight: '800' },
  matchScoreText: { fontSize: 11, fontWeight: '800' },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.03)', paddingTop: 12 },
  urgentRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  urgentText: { color: '#FBBF24', fontSize: 12, fontWeight: '700' },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dateText: { color: '#52525B', fontSize: 12, fontWeight: '500' },
  saveBtn: { padding: 4 },
});
