import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Share,
  TouchableOpacity, ActivityIndicator, Linking,
  Dimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useNavigation, Stack, useRouter } from 'expo-router';
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
import { fetchExamBySlug, fetchTimeline } from '@/services/examService';
import { toggleSavedExam } from '@/services/userService';
import { useUser } from '@/context/UserContext';
import { TimelineItem } from '@/components/TimelineItem';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { NativeAdCard } from '@/components/NativeAdCard';
import { AdBanner } from '@/components/AdBanner';
import { useAds } from '@/context/AdsContext';
import { cleanLabel } from '@/utils/format';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';

const formatText = (text: string | null | undefined): string => {
  if (!text) return '';
  return text.replace(/\\n/g, '\n');
};

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
  [ExamStatus.NOTIFICATION]: '#FBBF24',
  [ExamStatus.REGISTRATION_OPEN]: '#10B981',
  [ExamStatus.REGISTRATION_CLOSED]: '#F59E0B',
  [ExamStatus.ADMIT_CARD_OUT]: '#8B5CF6',
  [ExamStatus.EXAM_ONGOING]: '#EF4444',
  [ExamStatus.RESULT_DECLARED]: '#8B5CF6',
  [ExamStatus.ARCHIVED]: '#94a3b8',
};


export default function ExamDetailScreen() {
  const { id: slug } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, userId, refreshUser } = useUser();
  const { showInterstitial, showRewarded } = useAds();
  const insets = useSafeAreaInsets();
  const [countdown, setCountdown] = useState('');
  const [isDescExpanded, setIsDescExpanded] = useState(false);

  const textPrimary = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const background = useThemeColor({}, 'background');
  const cardBg = useThemeColor({}, 'card');
  const border = useThemeColor({}, 'border');
  const tint = useThemeColor({}, 'tint');
  const colorScheme = useColorScheme();

  const handleExternalLink = async (url: string) => {
    await showInterstitial();
    Linking.openURL(url);
  };

  const { data: exam, isLoading: examLoading } = useQuery({
    queryKey: ['exam', slug],
    queryFn: () => fetchExamBySlug(slug),
  });

  const { data: timeline = [], isLoading: timelineLoading } = useQuery({
    queryKey: ['timeline', slug],
    queryFn: () => fetchTimeline(slug),
  });


  const saveMutation = useMutation({
    mutationFn: () => toggleSavedExam(userId!, exam!.id),
    onSuccess: () => {
      refreshUser();
      queryClient.invalidateQueries({ queryKey: ['exam', slug] });
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

  const isSaved = exam ? user?.savedExamIds?.includes(exam.id) : false;

  const handleSave = async () => {
    if (!userId) return router.push('/onboarding');
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

    const vacancies = exam.totalVacancies || 'Check Details';

    const message =
      `🏛️ *${exam.title}*\n` +
      `🏢 Board: ${exam.conductingBody}\n` +
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
      <View style={[styles.loader, { backgroundColor: background }]}>
        <ActivityIndicator size="large" color={tint} />
      </View>
    );
  }

  if (!exam) {
    return (
      <View style={styles.loader}>
        <Text style={[styles.errorTxt, { color: textMuted }]}>Exam not found.</Text>
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

  const heroColors = (colorScheme === 'dark' ? ['#2E1065', '#09090B'] : ['#F5F3FF', '#FFFFFF']) as readonly [string, string];
  const matchColors = (colorScheme === 'dark' ? ['#27272a', '#18181b'] : [cardBg, cardBg]) as readonly [string, string];

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: background }]} edges={['bottom']}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

        <View style={[styles.customHeader, { paddingTop: insets.top + 10 }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.headerIconBtn, { backgroundColor: colorScheme === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.8)', borderColor: border }]}>
            <ChevronRight size={24} color={textPrimary} style={{ transform: [{ rotate: '180deg' }] }} />
          </TouchableOpacity>
          <View style={styles.headerActionRow}>
            <TouchableOpacity
              style={[styles.headerIconBtn, { backgroundColor: colorScheme === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.8)', borderColor: border }]}
              onPress={handleSave}
              disabled={saveMutation.isPending}>
              {isSaved ? <BookmarkCheck size={22} color={tint} fill={tint} /> : <Bookmark size={22} color={textPrimary} />}
            </TouchableOpacity>
            <TouchableOpacity style={[styles.headerIconBtn, { backgroundColor: colorScheme === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.8)', borderColor: border }]} onPress={handleShare}>
              <Share2 size={22} color={textPrimary} />
            </TouchableOpacity>
          </View>
          <AdBanner placement="EXAM_DETAILS_HEADER" />
        </View>

        {/* Hero Section */}
        <LinearGradient
          colors={heroColors}
          style={[styles.heroSection, { paddingTop: insets.top + 70 }]}>

          <View style={[styles.statusBadge, { borderColor: statusColor + '77', backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusTxt, { color: statusColor }]}>{cleanLabel(exam.status)}</Text>
          </View>

          <Text style={[styles.title, { color: textPrimary }]}>{exam.title}</Text>
          {exam.conductingBody && (
            <Text style={[styles.conductingBody, { color: textMuted }]}>{exam.conductingBody}</Text>
          )}

          <View style={styles.tagsContainer}>
            {exam.category && (
              <View style={[styles.tag, { backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
                <Text style={[styles.tagText, { color: textMuted }]}>{cleanLabel(exam.category)}</Text>
              </View>
            )}
            {exam.examLevel && (
              <View style={[styles.tag, { backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
                <Text style={[styles.tagText, { color: textMuted }]}>{cleanLabel(exam.examLevel)}</Text>
              </View>
            )}
            {exam.state && (
              <View style={[styles.tag, { backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
                <Text style={[styles.tagText, { color: textMuted }]}>{exam.state}</Text>
              </View>
            )}
          </View>
        </LinearGradient>

        {/* Match Score Display - Important One */}
        {score > 0 && (
          <View style={[styles.matchScoreCard, { shadowColor: '#000' }]}>
            <LinearGradient
              colors={matchColors}
              style={[styles.matchGlass, { borderColor: border }]}>
              <View style={styles.matchHeader}>
                <View>
                  <Text style={[styles.matchLabel, { color: tint }]}>Eligibility Match</Text>
                  <Text style={[styles.matchHint, { color: textMuted }]}>Based on your profile</Text>
                </View>
                <Text style={[styles.matchValue, { color: scoreColor }]}>{score}%</Text>
              </View>
              <View style={[styles.progressBarBg, { backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}>
                <View style={[styles.progressBarFill, { width: `${score}%`, backgroundColor: scoreColor }]} />
              </View>
            </LinearGradient>
          </View>
        )}

        {/* Primary Action Buttons - If Registry is active */}
        {isRegActive && regEvent?.actionUrl && (
          <View style={styles.actionSection}>
            <TouchableOpacity
              style={[styles.primaryActionBtn, { backgroundColor: tint, shadowColor: tint }]}
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

        {/* Timeline Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Calendar size={20} color={tint} />
            <Text style={[styles.sectionTitle, { color: textPrimary }]}>Exam Timeline</Text>
          </View>
          {!Array.isArray(timeline) || timeline.length === 0 ? (
            <View style={styles.emptyTimeline}>
              <Text style={[styles.emptyTimelineText, { color: textMuted }]}>No events announced yet.</Text>
            </View>
          ) : (
            (() => {
              const sorted = [...timeline].sort(
                (a, b) => (a.stageOrder || 0) - (b.stageOrder || 0),
              );
              return sorted.map((event, index) => (
                <TimelineItem
                  key={event.id}
                  event={event}
                  isLast={index === sorted.length - 1}
                  nextEventStartsAt={
                    !event.endsAt && index < sorted.length - 1
                      ? sorted[index + 1].startsAt
                      : null
                  }
                />
              ));
            })()
          )}
        </View>

        {/* Important Quick Facts Section */}
        <View style={styles.importantContainer}>
          {exam.totalVacancies && (
            <View style={[styles.factCard, { backgroundColor: cardBg, borderColor: border }]}>
              <View style={styles.factHeader}>
                <Briefcase size={16} color={tint} />
                <Text style={[styles.factTitle, { color: textMuted }]}>Vacancies</Text>
              </View>
              <MarkdownRenderer variant="fact" content={formatText(exam.totalVacancies)} />
            </View>
          )}

          {exam.salary && (
            <View style={[styles.factCard, { backgroundColor: cardBg, borderColor: border }]}>
              <View style={styles.factHeader}>
                <Briefcase size={16} color={tint} />
                <Text style={[styles.factTitle, { color: textMuted }]}>Salary</Text>
              </View>
              <MarkdownRenderer variant="fact" content={formatText(exam.salary)} />
            </View>
          )}

          {(exam.qualificationCriteria || exam.minAge || exam.maxAge) && (
            <View style={[styles.factCard, { backgroundColor: cardBg, borderColor: border }]}>
              <View style={styles.factHeader}>
                <UserCheck size={16} color={tint} />
                <Text style={[styles.factTitle, { color: textMuted }]}>Eligibility & Age</Text>
              </View>
              <View style={styles.eligibilityRow}>
                <View style={{ flex: 1 }}>
                  {exam.qualificationCriteria && (
                    <MarkdownRenderer variant="fact" content={formatText(exam.qualificationCriteria)} />
                  )}
                  {(exam.minAge || exam.maxAge) && (
                    <Text style={[styles.ageText, { color: tint }]}>
                      Age Limit: {exam.minAge ?? 'N/A'} - {exam.maxAge ?? 'N/A'} years
                    </Text>
                  )}
                </View>
              </View>
            </View>
          )}

          {exam.applicationFee && (
            <View style={[styles.factCard, { backgroundColor: cardBg, borderColor: border }]}>
              <View style={styles.factHeader}>
                <IndianRupee size={16} color={tint} />
                <Text style={[styles.factTitle, { color: textMuted }]}>Application Fee</Text>
              </View>
              <MarkdownRenderer variant="fact" content={formatText(exam.applicationFee)} />
            </View>
          )}

          {exam.additionalDetails && (
            <View style={[styles.factCard, { backgroundColor: cardBg, borderColor: border }]}>
              <View style={styles.factHeader}>
                <FileText size={16} color={tint} />
                <Text style={[styles.factTitle, { color: textMuted }]}>Additional Details</Text>
              </View>
              <MarkdownRenderer variant="fact" content={formatText(exam.additionalDetails)} />
            </View>
          )}
        </View>

        {/* Ad Placement */}
        <NativeAdCard placement="EXAM_DETAILS_BOTTOM" style={{ marginHorizontal: 20, marginBottom: 30 }} />

        {/* Secondary Info Sections */}
        {exam.description && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Target size={20} color={tint} />
              <Text style={[styles.sectionTitle, { color: textPrimary }]}>About Examination</Text>
            </View>
            <View>
              {isDescExpanded ? (
                <MarkdownRenderer content={formatText(exam.description)} />
              ) : (
                <Text style={[styles.description, { color: textMuted }]} numberOfLines={3}>
                  {exam.description.replace(/[#*`\n]/g, ' ')}
                </Text>
              )}

              {exam.description.length > 100 && (
                <TouchableOpacity onPress={() => setIsDescExpanded(!isDescExpanded)} style={{ marginTop: 8 }}>
                  <Text style={[styles.moreBtn, { color: tint }]}>{isDescExpanded ? 'Show less' : 'Read more...'}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* Official Links */}
        <View style={styles.linkGrid}>
          {exam.officialWebsite && (
            <TouchableOpacity style={[styles.linkCard, { backgroundColor: cardBg, borderColor: border }]} onPress={() => handleExternalLink(exam.officialWebsite!)}>
              <Globe size={20} color={textPrimary} />
              <Text style={[styles.linkCardTitle, { color: textPrimary }]}>Official Website</Text>
              <Text style={[styles.linkCardSub, { color: textMuted }]}>Visit Portal</Text>
            </TouchableOpacity>
          )}
          {exam.notificationUrl && (
            <TouchableOpacity style={[styles.linkCard, { backgroundColor: colorScheme === 'dark' ? '#2E1065' : '#F5F3FF', borderColor: border }]} onPress={() => handleExternalLink(exam.notificationUrl!)}>
              <FileText size={20} color={colorScheme === 'dark' ? '#DDD6FE' : tint} />
              <Text style={[styles.linkCardTitle, { color: colorScheme === 'dark' ? '#DDD6FE' : tint }]}>Notification</Text>
              <Text style={[styles.linkCardSub, { color: colorScheme === 'dark' ? '#A78BFA' : tint }]}>Download PDF</Text>
            </TouchableOpacity>
          )}
        </View>

      </ScrollView>

      {!isRegActive && (exam.notificationUrl || exam.officialWebsite) && (
        <View style={[styles.footerSticky, { backgroundColor: background + 'E6', borderTopColor: border }]}>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            {exam.officialWebsite && (
              <TouchableOpacity
                style={[styles.primaryActionBtn, { flex: 1, backgroundColor: colorScheme === 'dark' ? '#1E1B4B' : '#EEF2FF' }]}
                onPress={() => handleExternalLink(exam.officialWebsite!)}>
                <Globe size={18} color={colorScheme === 'dark' ? '#818CF8' : tint} />
                <Text style={[styles.primaryActionText, { fontSize: 14, color: colorScheme === 'dark' ? '#818CF8' : tint }]}>Official Portal</Text>
              </TouchableOpacity>
            )}

          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorTxt: { fontSize: 16 },

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
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
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
    fontSize: 28,
    fontWeight: '900',
    lineHeight: 34,
    marginBottom: 8
  },
  conductingBody: {
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
    alignSelf: 'flex-start',
    marginBottom: 16,
    gap: 6
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusTxt: { fontSize: 12, fontWeight: '800', letterSpacing: 0.5, textTransform: 'uppercase' },
  tagsContainer: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagText: { fontSize: 12, fontWeight: '700' },

  // Match Score
  matchScoreCard: {
    marginHorizontal: 20,
    marginTop: -30,
    marginBottom: 20,
    borderRadius: 24,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  matchGlass: {
    padding: 20,
    borderWidth: 1,
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  matchLabel: { fontSize: 14, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  matchHint: { fontSize: 12, fontWeight: '500' },
  matchValue: { fontSize: 32, fontWeight: '900' },
  progressBarBg: {
    height: 10,
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
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  btnContent: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  primaryActionText: { fontSize: 18, fontWeight: '900' },
  countdownBadge: {
    backgroundColor: 'rgba(0,0,0,0.15)',
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
  factCard: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
  },
  factHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  factTitle: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.8 },

  // Eligibility specific
  eligibilityRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  ageText: { fontSize: 13, fontWeight: '800' },

  // Timeline
  section: { paddingHorizontal: 20, marginBottom: 40 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
  sectionTitle: { fontSize: 22, fontWeight: '900' },
  description: { fontSize: 16, lineHeight: 26 },
  emptyTimeline: { padding: 40, alignItems: 'center' },
  emptyTimelineText: { fontSize: 15, fontWeight: '600' },

  // Link Cards
  linkGrid: { flexDirection: 'row', paddingHorizontal: 20, gap: 12, marginBottom: 40 },
  linkCard: {
    flex: 1,
    padding: 16,
    borderRadius: 20,
    gap: 10,
    borderWidth: 1,
  },
  linkCardTitle: { fontSize: 13, fontWeight: '800' },
  linkCardSub: { fontSize: 11, fontWeight: '600' },

  // Sticky Footer
  footerSticky: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    borderTopWidth: 1,
  },
  moreBtn: {
    fontSize: 14,
    fontWeight: '700',
  },
});
