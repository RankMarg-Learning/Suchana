import React, { useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar, ArrowRight, Sparkles, Search } from 'lucide-react-native';
import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUser } from '@/context/UserContext';
import { toggleSavedExam as toggleSavedService } from '@/services/userService';
import { fetchExams } from '@/services/examService';
import { AdBanner } from '@/components/AdBanner';
import { useAds } from '@/context/AdsContext';
import { NativeAdCard } from '@/components/NativeAdCard';
import { ExamListRow } from '@/components/ExamListRow';
import { HomeCarousel } from '@/components/HomeCarousel';
import { fetchHomeBanners } from '@/services/configService';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { cleanLabel } from '@/utils/format';

export default function UpdatesScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, userId, refreshUser } = useUser();
  const { showRewarded } = useAds();
  const colorScheme = useColorScheme();

  const background = useThemeColor({}, 'background');
  const cardBg = useThemeColor({}, 'card');
  const textPrimary = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const tint = useThemeColor({}, 'tint');
  const border = useThemeColor({}, 'border');

  const {
    data: examPages,
    isLoading: loadingExams,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch: refetchExams,
    isRefetching: refetchingExams
  } = useInfiniteQuery({
    queryKey: ['updated-exams-infinite'],
    queryFn: ({ pageParam = 1 }) => fetchExams({ isPublished: true, limit: 15, page: pageParam }),
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.exams.length < 15) return undefined;
      return allPages.length + 1;
    },
    initialPageParam: 1,
  });

  const updatedExams = examPages?.pages.flatMap(p => p.exams) ?? [];
  const { data: registrations = [], isLoading: loadingRegs, refetch: refetchRegs, isRefetching: refetchingRegs } = useQuery({
    queryKey: ['active-registrations'],
    queryFn: async () => {
      const { exams } = await fetchExams({ isPublished: true, limit: 15, lifecycleStage: 'REGISTRATION' });
      return exams.filter(ex =>
        ex.status === 'REGISTRATION_OPEN'
      );
    },
  });

  const { data: banners = [], isLoading: loadingBanners, refetch: refetchBanners } = useQuery({
    queryKey: ['home-banners'],
    queryFn: fetchHomeBanners,
  });

  const saveMutation = useMutation({
    mutationFn: async (examId: string) => {
      await showRewarded();
      return toggleSavedService(userId!, examId);
    },
    onSuccess: () => {
      refreshUser();
      queryClient.invalidateQueries({ queryKey: ['updated-exams-infinite'] });
      queryClient.invalidateQueries({ queryKey: ['savedExams'] });
    },
  });

  const onRefresh = async () => {
    await Promise.all([refetchExams(), refetchRegs(), refetchBanners()]);
  };

  const isRefreshing = refetchingExams || refetchingRegs;
  const isLoading = loadingExams || loadingRegs || loadingBanners;

  const renderRegistration = (exam: any) => (
    <TouchableOpacity
      key={exam.id}
      style={[styles.regCard, { backgroundColor: cardBg, borderColor: border }]}
      onPress={() => router.push({ pathname: '/exam/[id]', params: { id: exam.slug } })}
    >
      <View style={[styles.regBadge, { backgroundColor: exam.status === 'REGISTRATION_OPEN' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)' }]}>
        <Text style={[styles.regBadgeText, { color: exam.status === 'REGISTRATION_OPEN' ? '#10B981' : '#EF4444' }]}>{exam.status === 'REGISTRATION_OPEN' ? 'LIVE' : cleanLabel(exam.status)}</Text>
      </View>
      <Text style={[styles.regTitle, { color: textPrimary }]} numberOfLines={1}>{exam.shortTitle || exam.title}</Text>
      <Text style={[styles.regBody, { color: textMuted }]}>{exam.conductingBody}</Text>
      <View style={styles.regFooter}>
        <Calendar size={12} color={tint} style={{ marginRight: 4 }} />
        <Text style={[styles.regDate, { color: tint }]}>{exam.status === 'REGISTRATION_OPEN' ? 'Apply Now' : 'Check Status'}</Text>
      </View>
    </TouchableOpacity>
  );

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const renderEmpty = () => (
    <View style={styles.empty}>
      <Calendar size={48} color={textMuted} style={{ marginBottom: 16 }} />
      <Text style={[styles.emptyTitle, { color: textPrimary }]}>No newly updated exams</Text>
      <Text style={[styles.emptySub, { color: textMuted }]}>Check back later for recent exam updates</Text>
    </View>
  );

  if (isLoading && !isRefreshing) {
    return (
      <View style={[styles.loader, { backgroundColor: background }]}>
        <ActivityIndicator size="large" color={tint} />
      </View>
    );
  }

  const headerColors = (colorScheme === 'dark' ? ['#2E1065', '#09090B'] : ['#F5F3FF', '#FFFFFF']) as readonly [string, string];

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: background }]} edges={['top']}>
      <FlatList
        data={updatedExams}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={{ paddingHorizontal: 16, marginBottom: 12 }}>
            <ExamListRow
              exam={item}
              isSaved={user?.savedExamIds?.includes(item.id)}
              onSaveToggle={() => {
                if (!userId) return router.push('/onboarding');
                saveMutation.mutate(item.id);
              }}
              onPress={() => router.push({ pathname: '/exam/[id]', params: { id: item.slug } })}
            />
          </View>
        )}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) fetchNextPage();
        }}
        onEndReachedThreshold={0.5}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={tint} />}
        ListHeaderComponent={
          <View>
            <LinearGradient colors={headerColors} style={styles.headerGradient}>
              <View style={styles.header}>
                <View>
                  <Text style={[styles.greeting, { color: colorScheme === 'dark' ? '#94a3b8' : '#64748b' }]}>{greeting()}</Text>
                  <Text style={[styles.name, { color: textPrimary }]}>{user?.name ?? 'Aspirant'}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <TouchableOpacity
                    style={[styles.iconCircle, { backgroundColor: cardBg, borderColor: border }]}
                    onPress={() => router.push('/search')}>
                    <Search size={20} color={textPrimary} />
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.profileCircle, { backgroundColor: cardBg, borderColor: border }]} onPress={() => router.push('/profile')}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarTxt}>{user?.name?.charAt(0).toUpperCase() || 'A'}</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>

              {!user && (
                <TouchableOpacity style={styles.nudge} onPress={() => router.push('/onboarding')}>
                  <Sparkles size={20} color="#fff" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.nudgeTitle}>Setup Profile</Text>
                    <Text style={styles.nudgeSub}>Get personalized updates</Text>
                  </View>
                  <ArrowRight size={18} color="#fff" />
                </TouchableOpacity>
              )}
            </LinearGradient>

            <HomeCarousel banners={banners} />

            {/* Native Ad in Updates */}
            <NativeAdCard placement="HOME_TOP" style={{ marginHorizontal: 16, marginBottom: 20 }} />

            {/* Notifications toggle */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: textPrimary }]}>Active Registrations</Text>
                <TouchableOpacity onPress={() => router.push('/search')}>
                  <Text style={[styles.viewAll, { color: tint }]}>View All</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                horizontal
                data={registrations}
                keyExtractor={item => item.id}
                renderItem={({ item }) => renderRegistration(item)}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.regList}
              />
            </View>

            <AdBanner placement="HOME_MIDDLE" style={{ marginHorizontal: 16, marginBottom: 16 }} />

            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: textPrimary }]}>Recently Updated</Text>
            </View>
            <NativeAdCard placement="HOME_RECENT_UPDATED" style={{ marginHorizontal: 16, marginBottom: 16 }} />
          </View>
        }
        contentContainerStyle={{ paddingBottom: 40 }}
        ListEmptyComponent={isLoading ? null : renderEmpty}
        ListFooterComponent={updatedExams.length > 0 ? (
          <View>
            {isFetchingNextPage && <ActivityIndicator color={tint} style={{ marginBottom: 16 }} />}
            <AdBanner placement="HOME_FOOTER" style={{ margin: 16 }} />
            <NativeAdCard placement="HOME_FOOTER_NATIVE" style={{ marginHorizontal: 16, marginBottom: 24 }} />
          </View>
        ) : null}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerGradient: { paddingBottom: 24, borderBottomLeftRadius: 32, borderBottomRightRadius: 32, marginBottom: 12 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 24, marginBottom: 16 },
  greeting: { fontSize: 13, fontWeight: '600' },
  name: { fontSize: 26, fontWeight: '900', marginTop: 4 },
  profileCircle: { width: 44, height: 44, borderRadius: 22, padding: 2, borderWidth: 1 },
  avatar: { flex: 1, borderRadius: 20, backgroundColor: '#3B0764', justifyContent: 'center', alignItems: 'center' },
  avatarTxt: { color: '#C4B5FD', fontSize: 18, fontWeight: '800' },
  nudge: { marginHorizontal: 20, backgroundColor: '#5B21B6', borderRadius: 18, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  nudgeTitle: { color: '#fff', fontSize: 14, fontWeight: '800' },
  nudgeSub: { color: '#DDD6FE', fontSize: 12 },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  section: { marginVertical: 12 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '800' },
  viewAll: { fontSize: 13, fontWeight: '700' },
  regList: { paddingHorizontal: 20, gap: 12 },
  regCard: { width: 160, borderRadius: 16, padding: 12, borderWidth: 1 },
  regBadge: { alignSelf: 'flex-start', backgroundColor: 'rgba(239, 68, 68, 0.1)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginBottom: 8 },
  regBadgeText: { color: '#EF4444', fontSize: 9, fontWeight: '900' },
  regTitle: { fontSize: 14, fontWeight: '700', marginBottom: 2 },
  regBody: { fontSize: 11, marginBottom: 8 },
  regFooter: { flexDirection: 'row', alignItems: 'center' },
  regDate: { fontSize: 11, fontWeight: '600' },
  empty: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '800', marginBottom: 4 },
  emptySub: { fontSize: 14, textAlign: 'center' },
});
