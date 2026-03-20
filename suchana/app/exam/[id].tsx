import React, { useEffect, useState } from 'react';
import Markdown from 'react-native-markdown-display';
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
import { fetchExamById, fetchTimeline } from '@/services/examService';
import { toggleSavedExam } from '@/services/userService';
import { useUser } from '@/context/UserContext';
import { TimelineItem } from '@/components/TimelineItem';

const markdownRules = {
  table: (node: any, children: any, parent: any, styles: any) => (
    <ScrollView horizontal key={node.key} showsHorizontalScrollIndicator={false}>
      <View style={styles.table}>
        {children}
      </View>
    </ScrollView>
  ),
  thead: (node: any, children: any, parent: any, styles: any) => (
    <View key={node.key} style={styles.thead}>{children}</View>
  ),
  tbody: (node: any, children: any, parent: any, styles: any) => (
    <View key={node.key} style={styles.tbody}>{children}</View>
  ),
};
import { NativeAdCard } from '@/components/NativeAdCard';
import { AdBanner } from '@/components/AdBanner';
import { useAds } from '@/context/AdsContext';
import { cleanLabel } from '@/utils/format';

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
  [ExamStatus.RESULT_DECLARED]: '#3B82F6',
  [ExamStatus.ARCHIVED]: '#94a3b8',
};


export default function ExamDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, userId, refreshUser } = useUser();
  const { showInterstitial, showRewarded } = useAds();
  const insets = useSafeAreaInsets();
  const [countdown, setCountdown] = useState('');
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const [showAllVac, setShowAllVac] = useState(false);

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
    mutationFn: () => toggleSavedExam(userId!, exam!.id),
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

  const isSaved = exam ? user?.savedExamIds?.includes(exam.id) : false;

  const handleSave = async () => {
    if (!userId) return router.push('/onboarding');
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

  // Fields are now strings, so no parsing helpers are needed.

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

        {/* Important Quick Facts Section */}
        <View style={styles.importantContainer}>
          <View style={styles.factCard}>
            <View style={styles.factHeader}>
              <Briefcase size={16} color="#7C3AED" />
              <Text style={styles.factTitle}>Vacancies</Text>
            </View>
            <Markdown style={factMarkdownStyles} rules={markdownRules}>
              {formatText(exam.totalVacancies) || 'TBA'}
            </Markdown>
          </View>

          {exam.salary && (
            <View style={styles.factCard}>
              <View style={styles.factHeader}>
                <Briefcase size={16} color="#7C3AED" />
                <Text style={styles.factTitle}>Salary</Text>
              </View>
              <Markdown style={factMarkdownStyles} rules={markdownRules}>{formatText(exam.salary)}</Markdown>
            </View>
          )}

          <View style={styles.factCard}>
            <View style={styles.factHeader}>
              <UserCheck size={16} color="#7C3AED" />
              <Text style={styles.factTitle}>Eligibility & Age</Text>
            </View>
            <View style={styles.eligibilityRow}>
              <View style={{ flex: 1 }}>
                <Markdown style={factMarkdownStyles} rules={markdownRules}>
                  {formatText(exam.qualificationCriteria) || 'Check Notification'}
                </Markdown>
                {(exam.minAge || exam.maxAge) && (
                  <Text style={styles.ageText}>
                    Age Limit: {exam.minAge ?? 'N/A'} - {exam.maxAge ?? 'N/A'} years
                  </Text>
                )}
              </View>
            </View>
          </View>

          <View style={styles.factCard}>
            <View style={styles.factHeader}>
              <IndianRupee size={16} color="#7C3AED" />
              <Text style={styles.factTitle}>Application Fee</Text>
            </View>
            <Markdown style={factMarkdownStyles} rules={markdownRules}>{formatText(exam.applicationFee) || 'N/A'}</Markdown>
          </View>

          {exam.additionalDetails && (
            <View style={styles.factCard}>
              <View style={styles.factHeader}>
                <FileText size={16} color="#7C3AED" />
                <Text style={styles.factTitle}>Additional Details</Text>
              </View>
              <Markdown style={factMarkdownStyles} rules={markdownRules}>{formatText(exam.additionalDetails)}</Markdown>
            </View>
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
                <Markdown style={markdownStyles} rules={markdownRules}>
                  {formatText(exam.description)}
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
  heading1: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 24,
    marginBottom: 12,
  },
  heading2: {
    fontSize: 22,
    fontWeight: '800',
    color: '#F4F4F5',
    marginTop: 20,
    marginBottom: 10,
  },
  heading3: {
    fontSize: 19,
    fontWeight: '700',
    color: '#E4E4E7',
    marginTop: 16,
    marginBottom: 8,
  },
  paragraph: {
    marginTop: 0,
    marginBottom: 16,
  },
  strong: {
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  link: {
    color: '#7C3AED',
  },
  list_item: {
    flexDirection: 'row' as const,
    alignItems: 'flex-start' as const,
    marginBottom: 8,
  },
  bullet_list: {
    marginBottom: 16,
  },
  ordered_list: {
    marginBottom: 16,
  },
  table: {
    borderWidth: 1,
    borderColor: '#3f3f46',
    borderRadius: 8,
    marginVertical: 10,
    overflow: 'hidden' as const,
    backgroundColor: '#18181b',
  },
  thead: {
    backgroundColor: '#27272a',
    borderBottomWidth: 1,
    borderBottomColor: '#3f3f46',
  },
  tbody: {
  },
  th: {
    padding: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
    borderRightWidth: 1,
    borderRightColor: '#3f3f46',
    width: 140,
    fontSize: 13,
  },
  td: {
    padding: 12,
    color: '#a1a1aa',
    borderRightWidth: 1,
    borderRightColor: '#3f3f46',
    borderBottomWidth: 1,
    borderBottomColor: '#27272a',
    width: 140,
    fontSize: 13,
  },
  tr: {
    flexDirection: 'row' as const,
  },
});

const factMarkdownStyles: any = {
  body: {
    color: '#e4e4e7',
    fontSize: 14,
    fontWeight: 'bold',
    lineHeight: 18,
  },
  paragraph: {
    marginTop: 0,
    marginBottom: 0,
  },
  strong: {
    fontWeight: 'bold',
    color: '#FFF',
  },
  table: {
    borderWidth: 1,
    borderColor: '#27272a',
    borderRadius: 4,
    marginVertical: 4,
  },
  thead: {
    backgroundColor: '#27272a',
  },
  tbody: {
  },
  tr: {
    flexDirection: 'row',
  },
  th: {
    color: '#FFF',
    padding: 8,
    fontWeight: 'bold',
    width: 100,
    borderRightWidth: 1,
    borderColor: '#3f3f46',
  },
  td: {
    padding: 8,
    color: '#e4e4e7',
    width: 100,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#27272a',
  },
};
