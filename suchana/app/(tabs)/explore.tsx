import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Bookmark, Search, ArrowRight, Settings } from 'lucide-react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchSavedExams } from '@/services/examService';
import { toggleSavedExam as toggleSavedService } from '@/services/userService';
import { useUser } from '@/context/UserContext';
import { ExamCard } from '@/components/ExamCard';
import { AdBanner } from '@/components/AdBanner';
import { NativeAdCard } from '@/components/NativeAdCard';
import { useAds } from '@/context/AdsContext';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function SavedExamsTab() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { userId, refreshUser } = useUser();
  const { showRewarded } = useAds();

  const background = useThemeColor({}, 'background');
  const textPrimary = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const cardBg = useThemeColor({}, 'card');
  const tint = useThemeColor({}, 'tint');
  const border = useThemeColor({}, 'border');

  // Fetch saved exams, limit to 10
  const { data: exams = [], isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['savedExams', userId],
    queryFn: async () => {
      const allSaved = await fetchSavedExams(userId!);
      return allSaved.slice(0, 10); // Max 10 as requested
    },
    enabled: !!userId,
  });

  const saveMutation = useMutation({
    mutationFn: async (examId: string) => {
      // Show rewarded video ad
      await showRewarded();
      return toggleSavedService(userId!, examId);
    },
    onSuccess: () => {
      refreshUser();
      queryClient.invalidateQueries({ queryKey: ['savedExams'] });
      queryClient.invalidateQueries({ queryKey: ['exams'] });
    },
  });

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={[styles.emptyIconContainer, { backgroundColor: cardBg }]}>
        <Bookmark size={48} color={border} />
      </View>
      <Text style={[styles.emptyTitle, { color: textPrimary }]}>No saved exams</Text>
      <Text style={[styles.emptySubtitle, { color: textMuted }]}>
        Save exams to get real-time notifications about deadlines and results.
      </Text>
      <TouchableOpacity
        style={[styles.exploreBtn, { backgroundColor: tint }]}
        onPress={() => router.push('/')}>
        <Text style={styles.exploreBtnText}>Discover Exams</Text>
      </TouchableOpacity>
    </View>
  );

  if (!userId) {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: background }]}>
        <View style={styles.emptyContainer}>
          <Settings size={48} color={border} style={{ marginBottom: 16 }} />
          <Text style={[styles.emptyTitle, { color: textPrimary }]}>Login Required</Text>
          <Text style={[styles.emptySubtitle, { color: textMuted }]}>
            Please set up your profile to start saving exams and receiving updates.
          </Text>
          <TouchableOpacity
            style={[styles.exploreBtn, { backgroundColor: tint }]}
            onPress={() => router.push('/onboarding')}>
            <Text style={styles.exploreBtnText}>Setup Profile</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: background }]} edges={['top']}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Bookmark size={24} color={tint} style={{ marginRight: 10 }} />
          <Text style={[styles.headerTitle, { color: textPrimary }]}>My Saved Exams</Text>
        </View>
        {exams.length > 0 && (
          <Text style={[styles.countText, { color: textMuted, backgroundColor: cardBg }]}>{exams.length}/10</Text>
        )}
      </View>

      <FlatList
        data={exams}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ paddingHorizontal: 16, marginBottom: 12 }}>
            <ExamCard
              exam={item}
              isSaved={true}
              onSaveToggle={() => saveMutation.mutate(item.id)}
              onPress={() => router.push({ pathname: '/exam/[id]', params: { id: item.id } })}
            />
          </View>
        )}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          exams.length > 0 ? (
            <>
              {/* Native Ad at top of list */}
              <NativeAdCard placement="SAVED_TOP" style={{ marginHorizontal: 16, marginBottom: 20 }} />

              <View style={[styles.nudgeBox, { backgroundColor: tint + '18', borderColor: tint + '33' }]}>
                <Text style={[styles.nudgeText, { color: tint }]}>You'll get notifications for these exams.</Text>
              </View>
            </>
          ) : null
        }
        ListEmptyComponent={isLoading ? null : renderEmpty}
        ListFooterComponent={exams.length > 0 ? (
          <View>
            <AdBanner placement="SAVED_FOOTER" style={{ margin: 16 }} />
            <NativeAdCard placement="SAVED_FOOTER_NATIVE" style={{ marginHorizontal: 16, marginBottom: 24 }} />
          </View>
        ) : null}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={tint}
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
  },
  countText: {
    fontSize: 14,
    fontWeight: '600',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  nudgeBox: {
    marginHorizontal: 16,
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
  },
  nudgeText: {
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 80,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
  },
  exploreBtn: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
  },
  exploreBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
