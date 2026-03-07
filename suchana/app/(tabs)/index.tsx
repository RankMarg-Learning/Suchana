import React, { useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, ScrollView,
  RefreshControl, ActivityIndicator, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MapPin, Sparkles, ArrowRight, Search } from 'lucide-react-native';
import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUser } from '@/context/UserContext';
import { getPersonalizedExams } from '@/services/userService';
import { fetchExams } from '@/services/examService';
import { toggleSavedExam } from '@/services/userService';
import { ExamCard } from '@/components/ExamCard';
import { CategoryChip } from '@/components/CategoryChip';
import { NativeAdCard } from '@/components/NativeAdCard';
import { DeadlineBanner } from '@/components/DeadlineBanner';
import { AdBanner } from '@/components/AdBanner';
import { useAds } from '@/context/AdsContext';
import type { Exam, ExamCategory } from '@/types/exam';

const CATEGORIES: { label: string; value: ExamCategory }[] = [
  { label: 'UPSC', value: 'UPSC' },
  { label: 'SSC', value: 'SSC' },
  { label: 'Bank', value: 'BANKING_JOBS' },
  { label: 'Railway', value: 'RAILWAY_JOBS' },
  { label: 'Defence', value: 'DEFENCE_JOBS' },
  { label: 'State PSC', value: 'STATE_PSC' },
  { label: 'Teaching', value: 'TEACHING_ELIGIBILITY' },
  { label: 'Police', value: 'POLICE_JOBS' },
];

export default function HomeScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, userId, refreshUser } = useUser();
  const { showInterstitial } = useAds();
  const [activeCategory, setActiveCategory] = useState<ExamCategory | null>(null);

  const handleNavigate = async (examId: string) => {
    await showInterstitial();
    router.push({ pathname: '/exam/[id]', params: { id: examId } });
  };

  // Main infinite exams query
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isRefetching,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['exams', userId, activeCategory],
    queryFn: async ({ pageParam = 1 }) => {
      const { exams } = await fetchExams({
        isPublished: true,
        limit: 10,
        page: pageParam as number,
        category: activeCategory || undefined
      });
      return { exams, pageParam };
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.exams.length < 10) return undefined;
      return lastPage.pageParam + 1;
    },
    initialPageParam: 1,
  });

  const allExamsData = data?.pages.flatMap(page => page.exams) ?? [];

  const { data: deadlineExams } = useQuery({
    queryKey: ['deadlineExams'],
    queryFn: async () => {
      const { exams } = await fetchExams({ isPublished: true, limit: 50 });
      return exams;
    },
  });

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: (examId: string) => toggleSavedExam(userId!, examId),
    onSuccess: () => {
      refreshUser();
      queryClient.invalidateQueries({ queryKey: ['exams'] });
    },
  });

  const filteredExams = activeCategory
    ? allExamsData.filter(e => e.category === activeCategory)
    : allExamsData;

  const handleSave = (examId: string) => {
    if (!userId) return;
    saveMutation.mutate(examId);
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  if (isLoading && !isRefetching) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <FlatList
        data={filteredExams}
        keyExtractor={i => i.id}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor="#7C3AED"
          />
        }
        ListHeaderComponent={
          <View>
            <LinearGradient
              colors={['#1e1b4b', '#0D0D0F']}
              style={styles.headerGradient}>
              <View style={styles.header}>
                <View>
                  <Text style={styles.greeting}>{greeting()}</Text>
                  <Text style={styles.name}>{user?.name ?? 'Aspirant'}</Text>
                </View>
                <TouchableOpacity
                  style={styles.stateBubble}
                  onPress={() => router.push('/profile')}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <MapPin size={12} color="#E2E8F0" style={{ marginRight: 6 }} />
                    <Text style={styles.stateText}>{user?.state ?? 'India'}</Text>
                  </View>
                </TouchableOpacity>
              </View>

              {!user && (
                <TouchableOpacity
                  style={styles.nudgeBanner}
                  onPress={() => router.push('/onboarding')}
                  activeOpacity={0.8}>
                  <Sparkles size={24} color="#fff" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.nudgeTitle}>Personalize Your Journey</Text>
                    <Text style={styles.nudgeText}>Get trackable timelines & eligibility matches.</Text>
                  </View>
                  <ArrowRight size={20} color="#fff" />
                </TouchableOpacity>
              )}
            </LinearGradient>

            <View style={styles.body}>
              <DeadlineBanner exams={deadlineExams ?? []} />

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipScroll}>
                {CATEGORIES.map(c => (
                  <CategoryChip
                    key={c.value}
                    label={c.label}
                    value={c.value}
                    selected={
                      c.label === 'All'
                        ? activeCategory === null
                        : activeCategory === c.value
                    }
                    onPress={() =>
                      setActiveCategory(prev =>
                        c.label === 'All' ? null : prev === c.value ? null : c.value
                      )
                    }
                  />
                ))}
              </ScrollView>

              <Text style={styles.sectionTitle}>
                {user?.preferredCategories?.length ? 'For You' : 'Recently Updated'}
              </Text>
              <AdBanner style={{ marginHorizontal: 16 }} />
            </View>
          </View>
        }
        renderItem={({ item, index }) => (
          <View style={{ paddingHorizontal: 16 }}>
            <ExamCard
              exam={item}
              isSaved={user?.savedExamIds?.includes(item.id)}
              onSaveToggle={() => handleSave(item.id)}
              onPress={() => handleNavigate(item.id)}
            />
            {/* Native Ad Placement - Strategic Monetization */}
            {(index + 1) % 4 === 0 && <NativeAdCard />}
          </View>
        )}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) fetchNextPage();
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isFetchingNextPage ? (
            <ActivityIndicator size="small" color="#7C3AED" style={{ marginVertical: 20 }} />
          ) : <View style={{ height: 20 }} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Search size={64} color="#3F3F46" strokeWidth={1} style={{ marginBottom: 20 }} />
            <Text style={styles.emptyText}>No matches found</Text>
            <Text style={styles.emptyHint}>Check back soon for new exam updates.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0D0D0F' },
  loader: { flex: 1, backgroundColor: '#0D0D0F', justifyContent: 'center', alignItems: 'center' },
  headerGradient: {
    paddingBottom: 20,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  greeting: { color: '#94a3b8', fontSize: 13, fontWeight: '600' },
  name: { color: '#F4F4F5', fontSize: 26, fontWeight: '900', marginTop: 4 },
  stateBubble: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  stateText: { color: '#E2E8F0', fontSize: 12, fontWeight: '700' },
  body: {
    marginTop: 8,
  },
  chipScroll: { paddingHorizontal: 16, marginBottom: 20 },
  sectionTitle: {
    color: '#F4F4F5', fontSize: 20, fontWeight: '800',
    marginBottom: 16, paddingHorizontal: 20,
  },
  empty: { alignItems: 'center', paddingTop: 80, paddingHorizontal: 40 },
  emptyText: { color: '#F4F4F5', fontSize: 22, fontWeight: '800', marginBottom: 8 },
  emptyHint: { color: '#64748b', fontSize: 15, textAlign: 'center', lineHeight: 22 },
  nudgeBanner: {
    marginHorizontal: 20,
    backgroundColor: '#312e81',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#4338ca',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  nudgeTitle: { color: '#fff', fontSize: 14, fontWeight: '800', marginBottom: 2 },
  nudgeText: { color: '#a5b4fc', fontSize: 12, fontWeight: '500' },
});
