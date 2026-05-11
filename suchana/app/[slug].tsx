import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, FlatList, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchSeoPageBySlug, fetchExams } from '@/services/examService';
import { toggleSavedExam as toggleSavedService } from '@/services/userService';
import { useUser } from '@/context/UserContext';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { ExamCard } from '@/components/ExamCard';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Info, ChevronRight, Share2, AlertCircle } from 'lucide-react-native';
import { cleanLabel } from '@/utils/format';

export default function DynamicSlugScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, userId, refreshUser } = useUser();

  const background = useThemeColor({}, 'background');
  const textPrimary = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const tint = useThemeColor({}, 'tint');
  const border = useThemeColor({}, 'border');
  const cardBg = useThemeColor({}, 'card');

  // 1. Handle Special Temporal Exam Listings (Sitemap/SEO slugs)
  const isAdmitCardToday = slug === 'admit-card-released-today';
  const isUpcomingWeek = slug === 'upcoming-gov-exam-this-week';
  const isLatestExams = slug?.startsWith('latest-exams-');

  const { data: listingData, isLoading: listingLoading } = useQuery({
    queryKey: ['listing', slug],
    queryFn: async () => {
      if (isAdmitCardToday) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return fetchExams({ status: 'ADMIT_CARD_OUT', startDate: today.toISOString() });
      }
      if (isUpcomingWeek) {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return fetchExams({ status: 'NOTIFICATION,REGISTRATION_OPEN', startDate: weekAgo.toISOString() });
      }
      if (isLatestExams) {
        const rawDate = slug!.replace('latest-exams-', '');
        const formattedDate = rawDate.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        try {
          const targetMonthDate = new Date(`1 ${formattedDate}`);
          if (!isNaN(targetMonthDate.getTime())) {
            const startDate = targetMonthDate.toISOString();
            targetMonthDate.setMonth(targetMonthDate.getMonth() + 1);
            const endDate = targetMonthDate.toISOString();
            return fetchExams({ startDate, endDate });
          }
        } catch (e) { }
      }
      return null;
    },
    enabled: !!slug && (isAdmitCardToday || isUpcomingWeek || isLatestExams),
  });

  // 2. Handle SEO Pages / Articles
  const { data: page, isLoading: pageLoading, error } = useQuery({
    queryKey: ['seo-page', slug],
    queryFn: () => fetchSeoPageBySlug(slug!),
    enabled: !!slug && !isAdmitCardToday && !isUpcomingWeek && !isLatestExams,
    retry: false,
  });

  const saveMutation = useMutation({
    mutationFn: async (examId: string) => {
      return toggleSavedService(userId!, examId);
    },
    onSuccess: () => {
      refreshUser();
      queryClient.invalidateQueries({ queryKey: ['listing', slug] });
    },
  });

  const handleShare = async () => {
    if (!page) return;
    try {
      await Share.share({
        title: page.title,
        message: `${page.title}\n\nCheck out the full guide on Suchana App!\nhttps://examsuchana.in/${page.slug}`,
      });
    } catch (err) {
      console.error('Share failed', err);
    }
  };

  if (listingLoading || pageLoading) {
    return (
      <View style={[styles.loader, { backgroundColor: background }]}>
        <ActivityIndicator size="large" color={tint} />
      </View>
    );
  }

  // Render Listing View (for special slugs)
  if (isAdmitCardToday || isUpcomingWeek || isLatestExams) {
    const title = isAdmitCardToday
      ? "Admit Cards Today"
      : isUpcomingWeek
        ? "Upcoming This Week"
        : "Latest Exams";

    return (
      <SafeAreaView style={[styles.root, { backgroundColor: background }]}>
        <Stack.Screen options={{
          title,
          headerShown: true,
          headerStyle: { backgroundColor: background },
          headerTitleStyle: { fontWeight: '800', color: textPrimary }
        }} />
        <FlatList
          data={listingData?.exams || []}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <ExamCard
              exam={item}
              isSaved={user?.savedExamIds?.includes(item.id)}
              onSaveToggle={() => {
                if (!userId) return router.push('/onboarding');
                saveMutation.mutate(item.id);
              }}
              onPress={() => router.push(`/exam/${item.slug}`)}
            />
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <AlertCircle size={48} color={border} style={{ marginBottom: 16 }} />
              <Text style={[styles.emptyText, { color: textMuted }]}>No exams found for this period.</Text>
            </View>
          }
        />
      </SafeAreaView>
    );
  }

  // Render Page View (Article / SEO Content)
  if (page) {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: background }]} edges={['bottom', 'left', 'right']}>
        <Stack.Screen options={{
          title: '',
          headerShown: true,
          headerTransparent: true,
          headerRight: () => (
            <TouchableOpacity onPress={handleShare}>
              <Share2 size={22} color={textPrimary} />
            </TouchableOpacity>
          ),

        }} />
        <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>

          <View style={styles.articleHeader}>
            {page.category && (
              <View style={[styles.categoryBadge, { backgroundColor: tint + '15' }]}>
                <Text style={[styles.categoryText, { color: tint }]}>{cleanLabel(page.category)}</Text>
              </View>
            )}
            <Text style={[styles.articleTitle, { color: textPrimary }]}>{page.title}</Text>

            <View style={styles.metaRow}>
              {page.author && (
                <Text style={[styles.metaText, { color: textMuted }]}>By {page.author.name} • </Text>
              )}
              <Text style={[styles.metaText, { color: textMuted }]}>
                {new Date(page.updatedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
              </Text>
            </View>
          </View>

          {/* Exam Context Card */}
          {page.exam && (
            <TouchableOpacity
              style={[styles.examLinkCard, { backgroundColor: cardBg, borderColor: border }]}
              onPress={() => router.push(`/exam/${page.exam!.slug}`)}
            >
              <View style={styles.examCardLeft}>
                <View style={[styles.examIcon, { backgroundColor: tint + '15' }]}>
                  <Info size={22} color={tint} />
                </View>
                <View style={styles.examTextContent}>
                  <Text style={[styles.examLabel, { color: textMuted }]}>Related Exam</Text>
                  <Text style={[styles.examTitle, { color: textPrimary }]} numberOfLines={2}>
                    {page.exam.shortTitle || page.exam.title}
                  </Text>
                </View>
              </View>
              <View style={styles.examCardRight}>
                <ChevronRight size={20} color={tint} />
              </View>
            </TouchableOpacity>
          )}

          {/* Content */}
          <View style={styles.contentContainer}>
            <MarkdownRenderer content={page.content} />
          </View>

          {/* FAQs */}
          {page.faqs && page.faqs.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: textPrimary }]}>Frequently Asked Questions</Text>
              <View style={styles.faqList}>
                {page.faqs.map((faq: { question: string; answer: string }, i: number) => (
                  <View key={i} style={[styles.faqItem, { backgroundColor: cardBg, borderColor: border }]}>
                    <Text style={[styles.faqQuestion, { color: textPrimary }]}>{faq.question}</Text>
                    <Text style={[styles.faqAnswer, { color: textMuted }]}>{faq.answer}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

        </ScrollView>
      </SafeAreaView>
    );
  }

  // Error / Not Found
  return (
    <SafeAreaView style={[styles.root, { backgroundColor: background }]}>
      <Stack.Screen options={{ title: 'Not Found', headerShown: true }} />
      <View style={styles.loader}>
        <AlertCircle size={48} color={border} style={{ marginBottom: 16 }} />
        <Text style={[styles.errorText, { color: textMuted }]}>We couldn't find the page you're looking for.</Text>
        <TouchableOpacity
          onPress={() => router.replace('/(tabs)')}
          style={[styles.backBtn, { backgroundColor: tint }]}>
          <Text style={styles.backBtnText}>Explore Exams</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  scrollBody: { padding: 20, paddingTop: 110, paddingBottom: 40 },
  articleHeader: { marginBottom: 24 },
  categoryBadge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8, marginBottom: 16 },
  categoryText: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  articleTitle: { fontSize: 32, fontWeight: '900', lineHeight: 38, marginBottom: 16 },
  metaRow: { flexDirection: 'row', alignItems: 'center' },
  metaText: { fontSize: 13, fontWeight: '600' },
  contentContainer: { marginBottom: 40 },
  examLinkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
    borderRadius: 24,
    borderWidth: 1,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 3,
  },
  examCardLeft: { flexDirection: 'row', alignItems: 'center', gap: 16, flex: 1 },
  examIcon: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  examTextContent: { flex: 1 },
  examLabel: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 },
  examTitle: { fontSize: 16, fontWeight: '800', lineHeight: 22 },
  examCardRight: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  section: { marginTop: 20, marginBottom: 40 },
  sectionTitle: { fontSize: 22, fontWeight: '900', marginBottom: 24 },
  faqList: { gap: 16 },
  faqItem: { padding: 20, borderRadius: 20, borderWidth: 1 },
  faqQuestion: { fontSize: 17, fontWeight: '800', marginBottom: 10, lineHeight: 22 },
  faqAnswer: { fontSize: 15, lineHeight: 24, fontWeight: '500' },
  empty: { flex: 1, padding: 40, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: 16, fontWeight: '600', textAlign: 'center' },
  errorText: { fontSize: 16, textAlign: 'center', marginBottom: 32, lineHeight: 24 },
  backBtn: { paddingHorizontal: 24, paddingVertical: 14, borderRadius: 14 },
  backBtnText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
});
