import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Share,
  TouchableOpacity, ActivityIndicator, Linking,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useNavigation, Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Bookmark,
  BookmarkCheck,
  Share2,
  Globe,
  FileText,
  Calendar,
  ChevronRight,
  UserCheck,
  IndianRupee,
  Briefcase,
  ExternalLink,
  Target
} from 'lucide-react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchExamById, fetchTimeline } from '@/services/examService';
import { toggleSavedExam } from '@/services/userService';
import { useUser } from '@/context/UserContext';
import { TimelineItem } from '@/components/TimelineItem';
import { NativeAdCard } from '@/components/NativeAdCard';
import { AdBanner } from '@/components/AdBanner';
import { useAds } from '@/context/AdsContext';
import type { Exam, LifecycleEvent } from '@/types/exam';

const { width } = Dimensions.get('window');

function formatCountdown(endsAt: string): string {
  const diff = new Date(endsAt).getTime() - Date.now();
  if (diff <= 0) return 'Closed';
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  if (days > 0) return `${days}d left`;
  if (hours > 0) return `${hours}h left`;
  return `${mins}m left`;
}

const STATUS_COLOR: Record<string, string> = {
  UPCOMING: '#FBBF24',
  ACTIVE: '#10B981',
  COMPLETED: '#94a3b8',
  CANCELLED: '#EF4444',
};

export default function ExamDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const { user, userId, refreshUser } = useUser();
  const { showInterstitial } = useAds();
  const [countdown, setCountdown] = useState('');

  const handleExternalLink = async (url: string) => {
    await showInterstitial();
    Linking.openURL(url);
  };

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
      navigation.setOptions({ title: exam.shortTitle || 'Exam Detail' });
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

  // Helper to render JSON key-values on new lines
  const renderJsonLines = (data: any, labelStyle?: any) => {
    if (!data) return <Text style={styles.factValue}>N/A</Text>;

    // If it's a number (for vacancies)
    if (typeof data === 'number') return <Text style={styles.hugeText}>{data.toLocaleString('en-IN')}</Text>;

    // If it's not an object, just show it
    if (typeof data !== 'object') return <Text style={styles.factValue}>{String(data)}</Text>;

    const entries = Object.entries(data).filter(([key]) => key !== 'level' && key !== 'id');

    if (entries.length === 0) return <Text style={styles.factValue}>N/A</Text>;

    return (
      <View style={{ gap: 8 }}>
        {entries.map(([key, value]) => (
          <View key={key} style={styles.kvLine}>
            <Text style={[styles.kvLabel, labelStyle]}>{key}:</Text>
            <Text style={styles.factValue}>{String(value)}</Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.root} edges={['bottom']}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

        {/* Header Navigation Area */}
        <View style={styles.customHeader}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerIconBtn}>
            <ChevronRight size={24} color="#FFF" style={{ transform: [{ rotate: '180deg' }] }} />
          </TouchableOpacity>
          <View style={styles.headerActionRow}>
            <TouchableOpacity
              style={styles.headerIconBtn}
              onPress={handleSave}
              disabled={saveMutation.isPending}>
              {isSaved ? <BookmarkCheck size={22} color="#7C3AED" fill="#7C3AED" /> : <Bookmark size={22} color="#FFF" />}
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerIconBtn} onPress={handleShare}>
              <Share2 size={22} color="#FFF" />
            </TouchableOpacity>
          </View>
          <AdBanner />
        </View>

        {/* Hero Section */}
        <LinearGradient
          colors={['#1e1b4b', '#0D0D0F']}
          style={styles.heroSection}>

          <View style={[styles.statusBadge, { borderColor: statusColor + '77' }]}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusTxt, { color: statusColor }]}>{exam.status}</Text>
          </View>

          <Text style={styles.title}>{exam.title}</Text>
          <Text style={styles.conductingBody}>{exam.conductingBody}</Text>

          <View style={styles.tagsContainer}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{exam.category.replace(/_/g, ' ')}</Text>
            </View>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{exam.examLevel}</Text>
            </View>
            {exam.state && (
              <View style={styles.tag}>
                <Text style={styles.tagText}>{exam.state}</Text>
              </View>
            )}
          </View>
        </LinearGradient>

        {/* Match Score Display - Important One */}
        {score > 0 && (
          <View style={styles.matchScoreCard}>
            <LinearGradient
              colors={['#27272a', '#18181b']}
              style={styles.matchGlass}>
              <View style={styles.matchHeader}>
                <View>
                  <Text style={styles.matchLabel}>Eligibility Match</Text>
                  <Text style={styles.matchHint}>Based on your profile</Text>
                </View>
                <Text style={[styles.matchValue, { color: scoreColor }]}>{score}%</Text>
              </View>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${score}%`, backgroundColor: scoreColor }]} />
              </View>
            </LinearGradient>
          </View>
        )}

        {/* Primary Action Buttons - If Registry is active */}
        {isRegActive && regEvent?.actionUrl && (
          <View style={styles.actionSection}>
            <TouchableOpacity
              style={styles.primaryActionBtn}
              onPress={() => handleExternalLink(regEvent.actionUrl!)}
              activeOpacity={0.8}
            >
              <View style={styles.btnContent}>
                <ExternalLink size={20} color="#FFF" />
                <Text style={styles.primaryActionText}>Apply Now</Text>
              </View>
              <View style={styles.countdownBadge}>
                <Text style={styles.countdownText}>{countdown}</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Important Quick Facts Section - "Important Once First" */}
        <View style={styles.importantContainer}>

          {/* Vacancies Card */}
          <View style={styles.factCard}>
            <View style={styles.factHeader}>
              <Briefcase size={20} color="#7C3AED" />
              <Text style={styles.factTitle}>Total Vacancies</Text>
            </View>
            {typeof exam.totalVacancies === 'number' ? (
              <Text style={styles.hugeText}>{exam.totalVacancies.toLocaleString('en-IN')}</Text>
            ) : (
              renderJsonLines(exam.totalVacancies)
            )}
          </View>

          {/* Eligibility Card */}
          <View style={styles.factCard}>
            <View style={styles.factHeader}>
              <UserCheck size={20} color="#7C3AED" />
              <Text style={styles.factTitle}>Eligibility</Text>
            </View>
            <View style={styles.eligibilityMain}>
              <Text style={styles.eligibilityLevel}>
                {exam.qualificationCriteria?.level?.replace(/_/g, ' ') || 'Check Rules'}
              </Text>
              {(exam.minAge || exam.maxAge) && (
                <Text style={styles.ageText}>
                  Age: {exam.minAge ?? 'N/A'} - {exam.maxAge ?? 'N/A'} yrs
                </Text>
              )}
            </View>
            {exam.qualificationCriteria?.rules && (
              <View style={styles.rulesContainer}>
                {renderJsonLines(exam.qualificationCriteria.rules)}
              </View>
            )}
          </View>

          {/* Fees Card */}
          <View style={styles.factCard}>
            <View style={styles.factHeader}>
              <IndianRupee size={20} color="#7C3AED" />
              <Text style={styles.factTitle}>Application Fee</Text>
            </View>
            <View style={styles.feeGrid}>
              {renderJsonLines(exam.applicationFee)}
            </View>
          </View>

        </View>

        {/* Timeline Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Calendar size={20} color="#7C3AED" />
            <Text style={styles.sectionTitle}>Exam Timeline</Text>
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
        <NativeAdCard style={{ marginHorizontal: 20, marginBottom: 30 }} />

        {/* Secondary Info Sections */}
        {exam.description && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Target size={20} color="#7C3AED" />
              <Text style={styles.sectionTitle}>About Examination</Text>
            </View>
            <Text style={styles.description}>{exam.description}</Text>
          </View>
        )}

        {/* Official Links */}
        <View style={styles.linkGrid}>
          {exam.officialWebsite && (
            <TouchableOpacity style={styles.linkCard} onPress={() => handleExternalLink(exam.officialWebsite!)}>
              <Globe size={20} color="#FFF" />
              <Text style={styles.linkCardTitle}>Official Website</Text>
              <Text style={styles.linkCardSub}>Visit Portal</Text>
            </TouchableOpacity>
          )}
          {exam.notificationUrl && (
            <TouchableOpacity style={[styles.linkCard, { backgroundColor: '#312e81' }]} onPress={() => handleExternalLink(exam.notificationUrl!)}>
              <FileText size={20} color="#c7d2fe" />
              <Text style={[styles.linkCardTitle, { color: '#c7d2fe' }]}>Notification</Text>
              <Text style={[styles.linkCardSub, { color: '#818cf8' }]}>Download PDF</Text>
            </TouchableOpacity>
          )}
        </View>

      </ScrollView>

      {/* Primary Action Button Fixed at Bottom (If Active) */}
      {!isRegActive && exam.notificationUrl && (
        <View style={styles.footerSticky}>
          <TouchableOpacity
            style={[styles.primaryActionBtn, { backgroundColor: '#1e1b4b' }]}
            onPress={() => handleExternalLink(exam.notificationUrl!)}>
            <FileText size={20} color="#FFF" />
            <Text style={styles.primaryActionText}>View Full Notification</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#09090b' },
  loader: { flex: 1, backgroundColor: '#09090b', justifyContent: 'center', alignItems: 'center' },
  errorTxt: { color: '#94a3b8', fontSize: 16 },

  // Custom Header
  customHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  headerIconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  headerActionRow: { flexDirection: 'row', gap: 10 },

  // Hero Section
  heroSection: {
    paddingTop: 80,
    paddingHorizontal: 20,
    paddingBottom: 40,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '900',
    lineHeight: 34,
    marginBottom: 8
  },
  conductingBody: {
    color: '#a1a1aa',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignSelf: 'flex-start',
    marginBottom: 16,
    gap: 6
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusTxt: { fontSize: 12, fontWeight: '800', letterSpacing: 0.5, textTransform: 'uppercase' },
  tagsContainer: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  tag: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagText: { color: '#d4d4d8', fontSize: 12, fontWeight: '700' },

  // Match Score
  matchScoreCard: {
    marginHorizontal: 20,
    marginTop: -30,
    marginBottom: 20,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  matchGlass: {
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  matchLabel: { color: '#7C3AED', fontSize: 14, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  matchHint: { color: '#71717a', fontSize: 12, fontWeight: '500' },
  matchValue: { fontSize: 32, fontWeight: '900' },
  progressBarBg: {
    height: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBarFill: { height: '100%', borderRadius: 5 },

  // Action Buttons
  actionSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  primaryActionBtn: {
    height: 64,
    backgroundColor: '#7C3AED',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  btnContent: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  primaryActionText: { color: '#FFF', fontSize: 18, fontWeight: '900' },
  countdownBadge: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  countdownText: { color: '#FFF', fontSize: 14, fontWeight: '800' },

  // Important Info Cards
  importantContainer: {
    paddingHorizontal: 20,
    gap: 16,
    marginBottom: 40,
  },
  factCard: {
    backgroundColor: '#18181b',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  factHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  factTitle: { color: '#a1a1aa', fontSize: 14, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  hugeText: { color: '#FFF', fontSize: 36, fontWeight: '900' },
  factValue: { color: '#e4e4e7', fontSize: 16, fontWeight: '700', lineHeight: 22, flex: 1 },
  kvLine: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  kvLabel: { color: '#71717a', fontWeight: '600', minWidth: 80 },
  feeGrid: { gap: 10 },

  // Eligibility specific
  eligibilityMain: { marginBottom: 12 },
  eligibilityLevel: { color: '#FFF', fontSize: 24, fontWeight: '900', marginBottom: 4 },
  ageText: { color: '#7C3AED', fontSize: 15, fontWeight: '800' },
  rulesContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },

  // Timeline
  section: { paddingHorizontal: 20, marginBottom: 40 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
  sectionTitle: { color: '#FFF', fontSize: 22, fontWeight: '900' },
  description: { color: '#a1a1aa', fontSize: 16, lineHeight: 26 },
  emptyTimeline: { padding: 40, alignItems: 'center' },
  emptyTimelineText: { color: '#52525b', fontSize: 15, fontWeight: '600' },

  // Link Cards
  linkGrid: { flexDirection: 'row', paddingHorizontal: 20, gap: 12, marginBottom: 40 },
  linkCard: {
    flex: 1,
    backgroundColor: '#27272a',
    padding: 16,
    borderRadius: 20,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  linkCardTitle: { color: '#FFF', fontSize: 13, fontWeight: '800' },
  linkCardSub: { color: '#71717a', fontSize: 11, fontWeight: '600' },

  // Sticky Footer
  footerSticky: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'rgba(9,9,11,0.9)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  }
});
