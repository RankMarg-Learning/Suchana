import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Share,
  TouchableOpacity, ActivityIndicator, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { fetchExamById, fetchTimeline } from '@/services/examService';
import { toggleSavedExam } from '@/services/userService';
import { useUser } from '@/context/UserContext';
import { TimelineItem } from '@/components/TimelineItem';
import { AdBanner } from '@/components/AdBanner';
import type { Exam, LifecycleEvent } from '@/types/exam';

function formatFee(fee: any): string {
  if (!fee) return 'No fee info';
  const parts: string[] = [];
  if (fee.general) parts.push(`General: ₹${fee.general}`);
  if (fee.obc)     parts.push(`OBC: ₹${fee.obc}`);
  if (fee.sc_st)   parts.push(`SC/ST: ₹${fee.sc_st}`);
  if (fee.female)  parts.push(`Female: ₹${fee.female}`);
  return parts.join(' · ') || 'Check official website';
}

function formatCountdown(endsAt: string): string {
  const diff = new Date(endsAt).getTime() - Date.now();
  if (diff <= 0) return 'Closed';
  const days  = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins  = Math.floor((diff % 3600000) / 60000);
  if (days > 0) return `${days}d ${hours}h left`;
  if (hours > 0) return `${hours}h ${mins}m left`;
  return `${mins}m left`;
}

const STATUS_COLOR: Record<string, string> = {
  UPCOMING: '#FBBF24', ACTIVE: '#34D399', COMPLETED: '#9CA3AF', CANCELLED: '#EF4444',
};

export default function ExamDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const { user, userId, refreshUser } = useUser();
  const [exam, setExam] = useState<Exam | null>(null);
  const [timeline, setTimeline] = useState<LifecycleEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const [e, t] = await Promise.all([fetchExamById(id), fetchTimeline(id)]);
        setExam(e);
        setTimeline(t);
        navigation.setOptions({ title: e.shortTitle });
      } catch (_) {}
      finally { setLoading(false); }
    })();
  }, [id]);

  // Live countdown timer (updates every minute)
  useEffect(() => {
    if (!exam) return;
    const reg = exam.lifecycleEvents?.find(e => e.eventType === 'REGISTRATION');
    if (!reg?.endsAt) return;
    const tick = () => setCountdown(formatCountdown(reg.endsAt!));
    tick();
    const interval = setInterval(tick, 60000);
    return () => clearInterval(interval);
  }, [exam]);

  const isSaved = user?.savedExamIds?.includes(id);

  const handleSave = async () => {
    if (!userId) return;
    await toggleSavedExam(userId, id);
    await refreshUser();
  };

  const handleShare = async () => {
    if (!exam) return;
    await Share.share({
      message: `📋 ${exam.title}\n${exam.conductingBody}\nVacancies: ${exam.totalVacancies ?? 'N/A'}\n\nTrack exam deadlines on Suchana!`,
    });
  };

  if (loading) {
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
  const regEvent = exam.lifecycleEvents?.find(e => e.eventType === 'REGISTRATION');
  const isRegActive = regEvent?.endsAt
    ? new Date(regEvent.endsAt).getTime() > Date.now()
    : false;
  const daysLeft = regEvent?.endsAt
    ? Math.ceil((new Date(regEvent.endsAt).getTime() - Date.now()) / 86400000)
    : null;
  const isUrgent = daysLeft !== null && daysLeft <= 7 && daysLeft >= 0;

  return (
    <SafeAreaView style={styles.root} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* ── Urgent Apply CTA Banner ─────────────────────────────────────── */}
        {isRegActive && regEvent?.actionUrl && (
          <TouchableOpacity
            style={[styles.applyBanner, isUrgent && styles.applyBannerUrgent]}
            onPress={() => Linking.openURL(regEvent.actionUrl!)}
            activeOpacity={0.85}>
            <View style={{ flex: 1 }}>
              <Text style={styles.applyBannerTitle}>
                {isUrgent ? '⚠️ Closing Soon — Apply Now!' : '📝 Registration Open'}
              </Text>
              {countdown ? (
                <Text style={styles.applyBannerSub}>{countdown}</Text>
              ) : null}
            </View>
            <View style={styles.applyBannerBtn}>
              <Text style={styles.applyBannerBtnTxt}>Apply →</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.heroActions}>
            <View style={[styles.statusBadge, { borderColor: statusColor }]}>
              <Text style={[styles.statusTxt, { color: statusColor }]}>{exam.status}</Text>
            </View>
            <View style={styles.heroButtons}>
              <TouchableOpacity style={styles.iconBtn} onPress={handleSave}>
                <Text style={{ fontSize: 20 }}>{isSaved ? '🔖' : '🔕'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconBtn} onPress={handleShare}>
                <Text style={{ fontSize: 20 }}>📤</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.title}>{exam.title}</Text>
          <Text style={styles.body}>{exam.conductingBody}</Text>

          {/* Key facts grid */}
          <View style={styles.factsGrid}>
            {exam.category && (
              <View style={styles.factBox}>
                <Text style={styles.factLabel}>Category</Text>
                <Text style={styles.factValue}>{exam.category}</Text>
              </View>
            )}
            {exam.totalVacancies != null && (
              <View style={styles.factBox}>
                <Text style={styles.factLabel}>Vacancies</Text>
                <Text style={styles.factValue}>{exam.totalVacancies.toLocaleString('en-IN')}</Text>
              </View>
            )}
            {exam.examLevel && (
              <View style={styles.factBox}>
                <Text style={styles.factLabel}>Level</Text>
                <Text style={styles.factValue}>{exam.examLevel}</Text>
              </View>
            )}
            {exam.applicationFee && (
              <View style={[styles.factBox, { flex: 2 }]}>
                <Text style={styles.factLabel}>Application Fee</Text>
                <Text style={styles.factValue} numberOfLines={2}>{formatFee(exam.applicationFee)}</Text>
              </View>
            )}
          </View>

          {/* Official links */}
          <View style={styles.linkRow}>
            {exam.officialWebsite && (
              <TouchableOpacity style={styles.linkBtn} onPress={() => Linking.openURL(exam.officialWebsite!)}>
                <Text style={styles.linkTxt}>🌐 Official Site</Text>
              </TouchableOpacity>
            )}
            {exam.notificationUrl && (
              <TouchableOpacity style={styles.linkBtn} onPress={() => Linking.openURL(exam.notificationUrl!)}>
                <Text style={styles.linkTxt}>📄 Notification</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Why this exam? — Description */}
        {exam.description ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.description}>{exam.description}</Text>
          </View>
        ) : null}

        {/* Ad before timeline */}
        <AdBanner style={{ marginHorizontal: 16 }} />

        {/* Timeline */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📅 Exam Timeline</Text>
          {timeline.length === 0 ? (
            <View style={styles.noTimelineBox}>
              <Text style={styles.noTimelineIcon}>📭</Text>
              <Text style={styles.noTimeline}>Timeline not yet available.</Text>
              <Text style={styles.noTimelineHint}>Check the official website for current dates.</Text>
            </View>
          ) : (
            timeline.map((event, index) => (
              <TimelineItem key={event.id} event={event} isLast={index === timeline.length - 1} />
            ))
          )}
        </View>

        {/* Bottom apply CTA (sticky feel) */}
        {isRegActive && regEvent?.actionUrl && (
          <TouchableOpacity
            style={styles.bottomApplyBtn}
            onPress={() => Linking.openURL(regEvent.actionUrl!)}
            activeOpacity={0.85}>
            <Text style={styles.bottomApplyTxt}>Apply Now — {countdown || 'Registration Open'}</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0D0D0F' },
  loader: { flex: 1, backgroundColor: '#0D0D0F', justifyContent: 'center', alignItems: 'center' },
  errorTxt: { color: '#9CA3AF', fontSize: 16 },

  // Apply banner
  applyBanner: {
    margin: 16,
    marginBottom: 4,
    backgroundColor: '#052e16',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#166534',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  applyBannerUrgent: {
    backgroundColor: '#431407',
    borderColor: '#9a3412',
  },
  applyBannerTitle: { color: '#F4F4F5', fontSize: 14, fontWeight: '700' },
  applyBannerSub: { color: '#86efac', fontSize: 12, marginTop: 2 },
  applyBannerBtn: {
    backgroundColor: '#16a34a',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  applyBannerBtnTxt: { color: '#fff', fontWeight: '800', fontSize: 13 },

  hero: {
    backgroundColor: '#1C1C1E',
    margin: 16,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  heroActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusTxt: { fontSize: 12, fontWeight: '700' },
  heroButtons: { flexDirection: 'row', gap: 8 },
  iconBtn: {
    backgroundColor: '#27272A',
    borderRadius: 10,
    width: 38,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: { color: '#F4F4F5', fontSize: 20, fontWeight: '800', marginBottom: 6 },
  body: { color: '#9CA3AF', fontSize: 14, marginBottom: 16 },
  factsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  factBox: {
    flex: 1,
    minWidth: '40%',
    backgroundColor: '#27272A',
    borderRadius: 10,
    padding: 10,
  },
  factLabel: { color: '#6B7280', fontSize: 11, fontWeight: '600', marginBottom: 4 },
  factValue: { color: '#F4F4F5', fontSize: 14, fontWeight: '700' },
  linkRow: { flexDirection: 'row', gap: 8 },
  linkBtn: {
    flex: 1,
    backgroundColor: '#3B0764',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#7C3AED',
  },
  linkTxt: { color: '#C4B5FD', fontSize: 13, fontWeight: '700' },
  section: { paddingHorizontal: 16, marginBottom: 8 },
  sectionTitle: { color: '#F4F4F5', fontSize: 18, fontWeight: '700', marginBottom: 16 },
  description: { color: '#9CA3AF', fontSize: 14, lineHeight: 22 },
  noTimelineBox: { alignItems: 'center', paddingVertical: 24 },
  noTimelineIcon: { fontSize: 36, marginBottom: 8 },
  noTimeline: { color: '#4B5563', fontSize: 15, fontWeight: '600' },
  noTimelineHint: { color: '#374151', fontSize: 13, marginTop: 4 },
  bottomApplyBtn: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: '#7C3AED',
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
  },
  bottomApplyTxt: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
