import React, { useEffect, useState } from 'react';
import Markdown from 'react-native-markdown-display';
import {
  View, Text, StyleSheet, ScrollView, Share,
  TouchableOpacity, ActivityIndicator, Linking,
  Dimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
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
import { ExamStatus } from '@/constants/enums';
import { fetchExamById, fetchTimeline } from '@/services/examService';
import { toggleSavedExam } from '@/services/userService';
import { useUser } from '@/context/UserContext';
import { TimelineItem } from '@/components/TimelineItem';
import { NativeAdCard } from '@/components/NativeAdCard';
import { AdBanner } from '@/components/AdBanner';
import { useAds } from '@/context/AdsContext';
import { cleanLabel } from '@/utils/format';


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
  [ExamStatus.UPCOMING]: '#FBBF24',
  [ExamStatus.REGISTRATION_OPEN]: '#10B981',
  [ExamStatus.REGISTRATION_CLOSED]: '#F59E0B',
  [ExamStatus.ADMIT_CARD_OUT]: '#8B5CF6',
  [ExamStatus.EXAM_ONGOING]: '#EF4444',
  [ExamStatus.RESULT_DECLARED]: '#3B82F6',
  [ExamStatus.ARCHIVED]: '#94a3b8',
};


export default function ExamDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const { user, userId, refreshUser } = useUser();
  const { showInterstitial, showRewarded } = useAds();
  const insets = useSafeAreaInsets();
  const [countdown, setCountdown] = useState('');
  const [isDescExpanded, setIsDescExpanded] = useState(false);

  const handleExternalLink = async (url: string) => {
    await showInterstitial();
    Linking.openURL(url);
  };

  const { data: exam, isLoading: examLoading } = useQuery({
    queryKey: ['exam', id],
    queryFn: () => fetchExamById(id),
  });

  const { data: timeline = [], isLoading: timelineLoading } = useQuery({
    queryKey: ['timeline', id],
    queryFn: () => fetchTimeline(id),
  });


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

  const handleSave = async () => {
    if (!userId) return;
    // Show rewarded video ad before saving
    await showRewarded();
    saveMutation.mutate();
  };

  const handleShare = async () => {
    if (!exam) return;

    const regEvent = exam.lifecycleEvents?.find((e) => e.stage === 'REGISTRATION');
    const deadline = regEvent?.endsAt
      ? `\n⏰ Deadline: ${new Date(regEvent.endsAt).toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })}`
      : '';

    let vacancies = 'Check Details';
    if (typeof exam.totalVacancies === 'number') {
      vacancies = exam.totalVacancies.toLocaleString('en-IN');
    } else if (exam.totalVacancies && typeof exam.totalVacancies === 'object') {
      const total = Object.values(exam.totalVacancies).reduce(
        (acc: number, val: any) => acc + (Number(val) || 0),
        0
      );
      if (total > 0) vacancies = total.toLocaleString('en-IN');
    }

    const message =
      `🏛️ *${exam.title}*\n` +
      `🏢 Board: ${exam.conductingBody}\n` +
      `👥 Vacancies: ${vacancies}` +
      `${deadline}\n\n` +
      `Stay updated with government exam timelines on Suchana App! 🚀\n` +
      `Download: https://suchana.app/get`;

    try {
      await Share.share(
        {
          title: exam.shortTitle || 'Exam Update',
          message,
        },
        {
          dialogTitle: `Share ${exam.shortTitle || 'Exam'}`,
        }
      );
    } catch (error) {
      console.error('Error sharing:', error);
    }
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

  // ── Vacancy helpers ──────────────────────────────────────
  const vacancyEntries: [string, number][] = (() => {
    const v = exam.totalVacancies;
    if (!v || typeof v === 'number') return [];
    if (typeof v !== 'object') return [];
    return Object.entries(v)
      .map(([k, val]) => [k, Number(val) || 0] as [string, number])
      .filter(([, n]) => n > 0);
  })();

  const totalVacancyCount: number = (() => {
    const v = exam.totalVacancies;
    if (typeof v === 'number') return v;
    if (vacancyEntries.length > 0) return vacancyEntries.reduce((s, [, n]) => s + n, 0);
    return 0;
  })();

  const [showAllVac, setShowAllVac] = useState(false);
  const MAX_VAC_VISIBLE = 4;

  const renderJsonLines = (data: any, labelStyle?: any) => {
    if (!data) return <Text style={styles.factValue}>N/A</Text>;

    if (typeof data === 'number') return <Text style={styles.statsValue}>{data.toLocaleString('en-IN')}</Text>;

    if (typeof data !== 'object') {
      const val = String(data);
      return <Text style={styles.factValue}>{val.length < 20 ? cleanLabel(val) : val}</Text>;
    }

    const entries = Object.entries(data).filter(([key]) => key !== 'level' && key !== 'id');

    if (entries.length === 0) return <Text style={styles.factValue}>N/A</Text>;

    return (
      <View style={{ gap: 10 }}>
        {entries.map(([key, value]) => (
          <View key={key} style={styles.kvLine}>
            <Text style={[styles.kvLabel, labelStyle]}>{cleanLabel(key)}:</Text>
            <Text style={styles.factValue}>{typeof value === 'string' && value.length < 30 ? cleanLabel(value) : String(value)}</Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.root} edges={['bottom']}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

        <View style={[styles.customHeader, { paddingTop: insets.top + 10 }]}>
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
          style={[styles.heroSection, { paddingTop: insets.top + 70 }]}>

          <View style={[styles.statusBadge, { borderColor: statusColor + '77' }]}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusTxt, { color: statusColor }]}>{cleanLabel(exam.status)}</Text>
          </View>

          <Text style={styles.title}>{exam.title}</Text>
          <Text style={styles.conductingBody}>{exam.conductingBody}</Text>

          <View style={styles.tagsContainer}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{cleanLabel(exam.category)}</Text>
            </View>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{cleanLabel(exam.examLevel)}</Text>
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

        {/* Important Quick Facts Section */}
        <View style={styles.importantContainer}>

          {/* Vacancies — full-width pill grid when multiple categories */}
          {vacancyEntries.length > 1 && (
            <View style={styles.factCard}>
              <View style={styles.factHeader}>
                <Briefcase size={16} color="#7C3AED" />
                <Text style={styles.factTitle}>Vacancies</Text>
                {totalVacancyCount > 0 && (
                  <View style={styles.totalVacBadge}>
                    <Text style={styles.totalVacBadgeText}>{totalVacancyCount.toLocaleString('en-IN')} Total</Text>
                  </View>
                )}
              </View>
              <View style={styles.vacPillGrid}>
                {(showAllVac ? vacancyEntries : vacancyEntries.slice(0, MAX_VAC_VISIBLE)).map(([key, val]) => (
                  <View key={key} style={styles.vacPill}>
                    <Text style={styles.vacPillLabel} numberOfLines={1}>{cleanLabel(key)}</Text>
                    <Text style={styles.vacPillCount}>{val.toLocaleString('en-IN')}</Text>
                  </View>
                ))}
              </View>
              {vacancyEntries.length > MAX_VAC_VISIBLE && (
                <TouchableOpacity onPress={() => setShowAllVac(v => !v)} style={styles.showMoreBtn}>
                  <Text style={styles.showMoreText}>
                    {showAllVac ? '▲ Show less' : `▼ +${vacancyEntries.length - MAX_VAC_VISIBLE} more posts`}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          <View style={styles.statsGrid}>
            {vacancyEntries.length <= 1 && (
              <View style={[styles.factCard, { flex: 1 }]}>
                <View style={styles.factHeader}>
                  <Briefcase size={16} color="#7C3AED" />
                  <Text style={styles.factTitle}>Vacancies</Text>
                </View>
                <Text style={styles.statsValue}>
                  {totalVacancyCount > 0 ? totalVacancyCount.toLocaleString('en-IN') : 'TBA'}
                </Text>
                {vacancyEntries.length === 1 && (
                  <Text style={styles.vacSingleLabel}>{cleanLabel(vacancyEntries[0][0])}</Text>
                )}
              </View>
            )}
            <View style={[styles.factCard, { flex: 1 }]}>
              <View style={styles.factHeader}>
                <IndianRupee size={16} color="#7C3AED" />
                <Text style={styles.factTitle}>Fee</Text>
              </View>
              <View style={styles.feeGrid}>
                {renderJsonLines(exam.applicationFee, { fontSize: 13 })}
              </View>
            </View>
          </View>

          <View style={styles.factCard}>
            <View style={styles.factHeader}>
              <UserCheck size={16} color="#7C3AED" />
              <Text style={styles.factTitle}>Eligibility & Age</Text>
            </View>
            <View style={styles.eligibilityRow}>
              <View>
                <Text style={styles.eligibilityLevel}>
                  {cleanLabel(exam.qualificationCriteria?.level) || 'Check Rules'}
                </Text>
                {(exam.minAge || exam.maxAge) && (
                  <Text style={styles.ageText}>
                    {exam.minAge ?? 'N/A'} - {exam.maxAge ?? 'N/A'} years
                  </Text>
                )}
              </View>
              {exam.qualificationCriteria?.rules && (
                <View style={styles.rulesMini}>
                  {renderJsonLines(exam.qualificationCriteria.rules, { fontSize: 12 })}
                </View>
              )}
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
            [...timeline]
              .sort((a, b) => (a.stageOrder || 0) - (b.stageOrder || 0))
              .map((event, index) => (
                <TimelineItem
                  key={event.id}
                  event={event}
                  isLast={index === timeline.length - 1}
                />
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
            <View>
              {isDescExpanded ? (
                <Markdown style={markdownStyles}>
                  {exam.description}
                </Markdown>
              ) : (
                <Text style={styles.description} numberOfLines={3}>
                  {exam.description.replace(/[#*`\n]/g, ' ')}
                </Text>
              )}

              {exam.description.length > 100 && (
                <TouchableOpacity onPress={() => setIsDescExpanded(!isDescExpanded)} style={{ marginTop: 8 }}>
                  <Text style={styles.moreBtn}>{isDescExpanded ? 'Show less' : 'Read more...'}</Text>
                </TouchableOpacity>
              )}
            </View>
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
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 32,
  },
  statsGrid: { flexDirection: 'row', gap: 12 },
  factCard: {
    backgroundColor: '#18181b',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  factHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  factTitle: { color: '#71717a', fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.8 },
  statsValue: { color: '#FFF', fontSize: 24, fontWeight: '900' },
  factValue: { color: '#e4e4e7', fontSize: 14, fontWeight: '700', lineHeight: 18 },
  kvLine: { flexDirection: 'row', gap: 4, alignItems: 'center' },
  kvLabel: { color: '#71717a', fontWeight: '600', minWidth: 60, fontSize: 13 },
  feeGrid: { gap: 6 },

  // Eligibility specific
  eligibilityRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  eligibilityLevel: { color: '#FFF', fontSize: 18, fontWeight: '900', marginBottom: 2 },
  ageText: { color: '#7C3AED', fontSize: 13, fontWeight: '800' },
  rulesMini: {
    maxWidth: '50%',
    paddingLeft: 12,
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255,255,255,0.05)',
  },

  // Vacancy pills
  totalVacBadge: {
    marginLeft: 'auto',
    backgroundColor: 'rgba(124,58,237,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.3)',
  },
  totalVacBadgeText: { color: '#7C3AED', fontSize: 11, fontWeight: '800' },
  vacPillGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  vacPill: {
    backgroundColor: '#27272a',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    minWidth: 100,
    flex: 0,
  },
  vacPillLabel: { color: '#a1a1aa', fontSize: 11, fontWeight: '600', marginBottom: 2 },
  vacPillCount: { color: '#FFF', fontSize: 16, fontWeight: '900' },
  vacSingleLabel: { color: '#71717a', fontSize: 11, fontWeight: '600', marginTop: 4 },
  showMoreBtn: { marginTop: 12, alignSelf: 'flex-start' },
  showMoreText: { color: '#7C3AED', fontSize: 13, fontWeight: '700' },

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
  },
  moreBtn: {
    color: '#7C3AED',
    fontSize: 14,
    fontWeight: '700',
  },
});

const markdownStyles = StyleSheet.create({
  body: {
    color: '#a1a1aa',
    fontSize: 16,
    lineHeight: 26,
  },
  paragraph: {
    marginTop: 0,
    marginBottom: 8,
  },
  strong: {
    fontWeight: 'bold',
    color: '#FFF',
  },
  link: {
    color: '#7C3AED',
  },
  bullet_list: {
    marginBottom: 8,
  },
  ordered_list: {
    marginBottom: 8,
  },
});
