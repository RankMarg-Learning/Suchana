import React, { useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Bell, Calendar, ArrowRight, Sparkles, Search } from 'lucide-react-native';
import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUser } from '@/context/UserContext';
import { toggleSavedExam as toggleSavedService } from '@/services/userService';
import { fetchExams } from '@/services/examService';
import { AdBanner } from '@/components/AdBanner';
import { NativeAdCard } from '@/components/NativeAdCard';
import { ExamListRow } from '@/components/ExamListRow';

export default function UpdatesScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, userId, refreshUser } = useUser();

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
      const { exams } = await fetchExams({ isPublished: true, limit: 10, lifecycleStage: 'REGISTRATION' });
      return exams;
    },
  });

  const saveMutation = useMutation({
    mutationFn: (examId: string) => toggleSavedService(userId!, examId),
    onSuccess: () => {
      refreshUser();
      queryClient.invalidateQueries({ queryKey: ['updated-exams-infinite'] });
      queryClient.invalidateQueries({ queryKey: ['savedExams'] });
    },
  });

  const onRefresh = async () => {
    await Promise.all([refetchExams(), refetchRegs()]);
  };

  const isRefreshing = refetchingExams || refetchingRegs;
  const isLoading = loadingExams || loadingRegs;

  const renderRegistration = (exam: any) => (
    <TouchableOpacity
      key={exam.id}
      style={styles.regCard}
      onPress={() => router.push({ pathname: '/exam/[id]', params: { id: exam.id } })}
    >
      <View style={styles.regBadge}>
        <Text style={styles.regBadgeText}>LIVE</Text>
      </View>
      <Text style={styles.regTitle} numberOfLines={1}>{exam.shortTitle || exam.title}</Text>
      <Text style={styles.regBody}>{exam.conductingBody}</Text>
      <View style={styles.regFooter}>
        <Calendar size={12} color="#7C3AED" style={{ marginRight: 4 }} />
        <Text style={styles.regDate}>Apply Now</Text>
      </View>
    </TouchableOpacity>
  );

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  if (isLoading && !isRefreshing) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <FlatList
        data={updatedExams}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={{ paddingHorizontal: 16, marginBottom: 12 }}>
            <ExamListRow
              exam={item}
              isSaved={user?.savedExamIds?.includes(item.id)}
              onSaveToggle={() => saveMutation.mutate(item.id)}
              onPress={() => router.push({ pathname: '/exam/[id]', params: { id: item.id } })}
            />
          </View>
        )}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) fetchNextPage();
        }}
        onEndReachedThreshold={0.5}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor="#7C3AED" />}
        ListHeaderComponent={
          <View>
            <LinearGradient colors={['#1e1b4b', '#0D0D0F']} style={styles.headerGradient}>
              <View style={styles.header}>
                <View>
                  <Text style={styles.greeting}>{greeting()}</Text>
                  <Text style={styles.name}>{user?.name ?? 'Aspirant'}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <TouchableOpacity
                    style={styles.iconCircle}
                    onPress={() => router.push('/search')}>
                    <Search size={20} color="#E2E8F0" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.profileCircle} onPress={() => router.push('/profile')}>
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

            {/* Registrations Horizontal Scroll */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Active Registrations</Text>
                <TouchableOpacity onPress={() => router.push('/search')}>
                  <Text style={styles.viewAll}>View All</Text>
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

            <AdBanner style={{ marginHorizontal: 16, marginBottom: 16 }} />

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recently Updated</Text>
            </View>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 40 }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Calendar size={48} color="#3F3F46" style={{ marginBottom: 16 }} />
            <Text style={styles.emptyTitle}>No newly updated exams</Text>
            <Text style={styles.emptySub}>Check back later for recent exam updates</Text>
          </View>
        }
        ListFooterComponent={() => (
          <View style={{ padding: 16 }}>
            {isFetchingNextPage && <ActivityIndicator color="#7C3AED" style={{ marginBottom: 16 }} />}
            <NativeAdCard />
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0D0D0F' },
  loader: { flex: 1, backgroundColor: '#0D0D0F', justifyContent: 'center', alignItems: 'center' },
  headerGradient: { paddingBottom: 24, borderBottomLeftRadius: 32, borderBottomRightRadius: 32, marginBottom: 12 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 24, marginBottom: 16 },
  greeting: { color: '#94a3b8', fontSize: 13, fontWeight: '600' },
  name: { color: '#F4F4F5', fontSize: 26, fontWeight: '900', marginTop: 4 },
  profileCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.08)', padding: 2, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  avatar: { flex: 1, borderRadius: 20, backgroundColor: '#3B0764', justifyContent: 'center', alignItems: 'center' },
  avatarTxt: { color: '#C4B5FD', fontSize: 18, fontWeight: '800' },
  nudge: { marginHorizontal: 20, backgroundColor: '#312e81', borderRadius: 18, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  nudgeTitle: { color: '#fff', fontSize: 14, fontWeight: '800' },
  nudgeSub: { color: '#a5b4fc', fontSize: 12 },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  section: { marginVertical: 12 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 12 },
  sectionTitle: { color: '#F4F4F5', fontSize: 18, fontWeight: '800' },
  viewAll: { color: '#7C3AED', fontSize: 13, fontWeight: '700' },
  regList: { paddingHorizontal: 20, gap: 12 },
  regCard: { width: 160, backgroundColor: '#1C1C1E', borderRadius: 16, padding: 12, borderWidth: 1, borderColor: '#2C2C2E' },
  regBadge: { alignSelf: 'flex-start', backgroundColor: 'rgba(239, 68, 68, 0.1)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginBottom: 8 },
  regBadgeText: { color: '#EF4444', fontSize: 9, fontWeight: '900' },
  regTitle: { color: '#F4F4F5', fontSize: 14, fontWeight: '700', marginBottom: 2 },
  regBody: { color: '#9CA3AF', fontSize: 11, marginBottom: 8 },
  regFooter: { flexDirection: 'row', alignItems: 'center' },
  regDate: { color: '#7C3AED', fontSize: 11, fontWeight: '600' },
  empty: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 40 },
  emptyTitle: { color: '#F4F4F5', fontSize: 18, fontWeight: '800', marginBottom: 4 },
  emptySub: { color: '#64748b', fontSize: 14, textAlign: 'center' },
});
