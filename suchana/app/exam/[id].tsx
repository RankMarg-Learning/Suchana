import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Share,
  TouchableOpacity, ActivityIndicator, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Bookmark,
  BookmarkCheck,
  Share2,
  Globe,
  FileText,
  Calendar,
  ChevronRight
} from 'lucide-react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchExamById, fetchTimeline } from '@/services/examService';
import { toggleSavedExam } from '@/services/userService';
import { useUser } from '@/context/UserContext';
import { TimelineItem } from '@/components/TimelineItem';
import { NativeAdCard } from '@/components/NativeAdCard';
import type { Exam, LifecycleEvent } from '@/types/exam';

function formatFee(fee: any): string {
  if (!fee) return 'No fee info';
  const parts: string[] = [];
  if (fee.general) parts.push(`General: ₹${fee.general}`);
  if (fee.obc) parts.push(`OBC: ₹${fee.obc}`);
  if (fee.sc_st) parts.push(`SC/ST: ₹${fee.sc_st}`);
  if (fee.female) parts.push(`Female: ₹${fee.female}`);
  return parts.join(' · ') || 'Check official website';
}

function formatCountdown(endsAt: string): string {
  const diff = new Date(endsAt).getTime() - Date.now();
  if (diff <= 0) return 'Closed';
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  if (days > 0) return `${days}d ${hours}h left`;
  if (hours > 0) return `${hours}h ${mins}m left`;
  return `${mins}m left`;
}

const STATUS_COLOR: Record<string, string> = {
  UPCOMING: '#FBBF24', ACTIVE: '#10B981', COMPLETED: '#94a3b8', CANCELLED: '#EF4444',
};

export default function ExamDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const { user, userId, refreshUser } = useUser();
  const [countdown, setCountdown] = useState('');

  // Fetch exam detail
  const { data: exam, isLoading: examLoading } = useQuery({
    queryKey: ['exam', id],
    queryFn: () => fetchExamById(id),
  });

  // Fetch timeline
  const { data: timeline = [], isLoading: timelineLoading } = useQuery({
    queryKey: ['timeline', id],
    queryFn: () => fetchTimeline(id),
  });

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: () => toggleSavedExam(userId!, id),
    onSuccess: () => {
      refreshUser();
      queryClient.invalidateQueries({ queryKey: ['exam', id] });
    },
  });

  useEffect(() => {
    if (exam) {
      navigation.setOptions({ title: exam.shortTitle });
    }
  }, [exam]);

  useEffect(() => {
    if (!exam) return;
    const reg = exam.lifecycleEvents?.find(e => e.stage === 'REGISTRATION');
    if (!reg?.endsAt) return;
    const tick = () => setCountdown(formatCountdown(reg.endsAt!));
    tick();
    const interval = setInterval(tick, 60000);
    return () => clearInterval(interval);
  }, [exam]);

  const isSaved = user?.savedExamIds?.includes(id);

  const handleSave = () => {
    if (!userId) return;
    saveMutation.mutate();
  };

  const handleShare = async () => {
    if (!exam) return;
    await Share.share({
      message: `📋 ${exam.title}\n${exam.conductingBody}\nVacancies: ${exam.totalVacancies ?? 'N/A'}\n\nTrack exam deadlines on Suchana App!`,
    });
  };

  if (examLoading || timelineLoading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  if (!exam) {
    return (
      <View style={styles.loader}>
        <Text style={styles.errorTxt}>Exam not found.</Text>
      </View>
    );
  }

  const statusColor = STATUS_COLOR[exam.status] ?? '#FBBF24';
  const regEvent = exam.lifecycleEvents?.find(e => e.stage === 'REGISTRATION');
  const isRegActive = regEvent?.endsAt
    ? new Date(regEvent.endsAt).getTime() > Date.now()
    : false;

  const score = (exam as any).matchScore ?? 0;
  const scoreColor = score >= 80 ? '#10B981' : score >= 50 ? '#F59E0B' : '#6B7280';

  return (
    <SafeAreaView style={styles.root} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>

        {/* Hero Section with Gradient */}
        <LinearGradient
          colors={['#1e1b4b', '#0D0D0F']}
          style={styles.heroGradient}>

          <View style={styles.headerRow}>
            <View style={[styles.statusBadge, { borderColor: statusColor + '66' }]}>
              <Text style={[styles.statusTxt, { color: statusColor }]}>{exam.status}</Text>
            </View>
            <View style={styles.actionBtns}>
              <TouchableOpacity
                style={styles.circleBtn}
                onPress={handleSave}
                disabled={saveMutation.isPending}>
                {isSaved ? <BookmarkCheck size={20} color="#7C3AED" fill="#7C3AED" /> : <Bookmark size={20} color="#94a3b8" />}
              </TouchableOpacity>
              <TouchableOpacity style={styles.circleBtn} onPress={handleShare}>
                <Share2 size={20} color="#94a3b8" />
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.title}>{exam.title}</Text>
          <Text style={styles.subtitle}>{exam.conductingBody}</Text>

          {/* Match Score Display */}
          {score > 0 && (
            <View style={styles.matchScoreCard}>
              <View style={styles.matchHeader}>
                <Text style={styles.matchLabel}>Eligibility Match</Text>
                <Text style={[styles.matchValue, { color: scoreColor }]}>{score}%</Text>
              </View>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${score}%`, backgroundColor: scoreColor }]} />
              </View>
              <Text style={styles.matchHint}>Based on your profile qualifications & age.</Text>
            </View>
          )}

          {/* Facts Grid */}
          <View style={styles.factsGrid}>
            <View style={styles.factItem}>
              <Text style={styles.factLabel}>VACANCIES</Text>
              <Text style={styles.factValue}>{exam.totalVacancies?.toLocaleString('en-IN') ?? 'N/A'}</Text>
            </View>
            <View style={styles.factItem}>
              <Text style={styles.factLabel}>LEVEL</Text>
              <Text style={styles.factValue}>{exam.examLevel}</Text>
            </View>
            <View style={[styles.factItem, { flex: 2, minWidth: '100%' }]}>
              <Text style={styles.factLabel}>APPLICATION FEE</Text>
              <Text style={styles.factValue}>{formatFee(exam.applicationFee)}</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Official Links */}
        <View style={styles.linkRow}>
          {exam.officialWebsite && (
            <TouchableOpacity style={styles.linkBtn} onPress={() => Linking.openURL(exam.officialWebsite!)}>
              <Globe size={18} color="#000" style={{ marginRight: 8 }} />
              <Text style={styles.linkBtnTxt}>Official Website</Text>
            </TouchableOpacity>
          )}
          {exam.notificationUrl && (
            <TouchableOpacity style={[styles.linkBtn, { backgroundColor: '#312e81' }]} onPress={() => Linking.openURL(exam.notificationUrl!)}>
              <FileText size={18} color="#c7d2fe" style={{ marginRight: 8 }} />
              <Text style={[styles.linkBtnTxt, { color: '#c7d2fe' }]}>PDF Notification</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Timeline Section */}
        <View style={styles.section}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
            <Calendar size={20} color="#7C3AED" style={{ marginRight: 10 }} />
            <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>Exam Timeline</Text>
          </View>
          {!Array.isArray(timeline) || timeline.length === 0 ? (
            <View style={styles.emptyTimeline}>
              <Text style={styles.emptyTimelineText}>No events announced yet.</Text>
            </View>
          ) : (
            timeline.map((event, index) => (
              <TimelineItem key={event.id} event={event} isLast={index === timeline.length - 1} />
            ))
          )}
        </View>

        {/* Ad Placement */}
        <NativeAdCard style={{ marginHorizontal: 20, marginTop: 20 }} />

        {/* About Section */}
        {exam.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About Examination</Text>
            <Text style={styles.description}>{exam.description}</Text>
          </View>
        )}

      </ScrollView>

      {/* Floating Apply Button */}
      {isRegActive && regEvent?.actionUrl && (
        <View style={styles.stickyFooter}>
          <TouchableOpacity
            style={styles.applyBtn}
            onPress={() => Linking.openURL(regEvent.actionUrl!)}
            activeOpacity={0.9}>
            <Text style={styles.applyBtnTxt}>Apply Now • {countdown}</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0D0D0F' },
  loader: { flex: 1, backgroundColor: '#0D0D0F', justifyContent: 'center', alignItems: 'center' },
  errorTxt: { color: '#94a3b8', fontSize: 16 },
  heroGradient: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 30,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  statusTxt: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  actionBtns: { flexDirection: 'row', gap: 10 },
  circleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  title: { color: '#fff', fontSize: 24, fontWeight: '900', marginBottom: 8 },
  subtitle: { color: '#94a3b8', fontSize: 16, fontWeight: '600', marginBottom: 24 },
  matchScoreCard: {
    backgroundColor: '#1e1b4b',
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#312e81',
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  matchLabel: { color: '#c7d2fe', fontSize: 13, fontWeight: '700' },
  matchValue: { fontSize: 24, fontWeight: '900' },
  progressBarBg: {
    height: 8,
    backgroundColor: '#312e81',
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressBarFill: { height: '100%', borderRadius: 4 },
  matchHint: { color: '#6366f1', fontSize: 11, fontWeight: '600' },
  factsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap', gap: 12,
  },
  factItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  factLabel: { color: '#64748b', fontSize: 10, fontWeight: '800', letterSpacing: 1, marginBottom: 4 },
  factValue: { color: '#f1f5f9', fontSize: 14, fontWeight: '700' },
  linkRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginTop: -20,
    marginBottom: 30,
  },
  linkBtn: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 14,
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  linkBtnTxt: { color: '#000', fontSize: 14, fontWeight: '800' },
  section: { paddingHorizontal: 20, marginBottom: 30 },
  sectionTitle: { color: '#fff', fontSize: 20, fontWeight: '800', marginBottom: 20 },
  description: { color: '#94a3b8', fontSize: 15, lineHeight: 24 },
  emptyTimeline: { padding: 40, alignItems: 'center' },
  emptyTimelineText: { color: '#475569', fontSize: 15, fontWeight: '600' },
  stickyFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: '#0D0D0F',
    borderTopWidth: 1,
    borderTopColor: '#1C1C1E',
  },
  applyBtn: {
    backgroundColor: '#4f46e5',
    borderRadius: 16,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyBtnTxt: { color: '#fff', fontSize: 16, fontWeight: '900' },
});
