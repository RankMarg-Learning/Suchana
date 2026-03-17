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

export default function SavedExamsTab() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { userId, refreshUser } = useUser();
  const { showRewarded } = useAds();

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
      <View style={styles.emptyIconContainer}>
        <Bookmark size={48} color="#3F3F46" />
      </View>
      <Text style={styles.emptyTitle}>No saved exams</Text>
      <Text style={styles.emptySubtitle}>
        Save exams to get real-time notifications about deadlines and results.
      </Text>
      <TouchableOpacity
        style={styles.exploreBtn}
        onPress={() => router.push('/')}>
        <Text style={styles.exploreBtnText}>Discover Exams</Text>
      </TouchableOpacity>
    </View>
  );

  if (!userId) {
    return (
      <SafeAreaView style={styles.root}>
        <View style={styles.emptyContainer}>
          <Settings size={48} color="#3F3F46" style={{ marginBottom: 16 }} />
          <Text style={styles.emptyTitle}>Login Required</Text>
          <Text style={styles.emptySubtitle}>
            Please set up your profile to start saving exams and receiving updates.
          </Text>
          <TouchableOpacity
            style={styles.exploreBtn}
            onPress={() => router.push('/onboarding')}>
            <Text style={styles.exploreBtnText}>Setup Profile</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Bookmark size={24} color="#7C3AED" style={{ marginRight: 10 }} />
          <Text style={styles.headerTitle}>My Saved Exams</Text>
        </View>
        {exams.length > 0 && (
          <Text style={styles.countText}>{exams.length}/10</Text>
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
              <NativeAdCard style={{ marginHorizontal: 16, marginBottom: 20 }} />

              <View style={styles.nudgeBox}>
                <Text style={styles.nudgeText}>You'll get notifications for these exams.</Text>
              </View>
            </>
          ) : null
        }
        ListEmptyComponent={isLoading ? null : renderEmpty}
        ListFooterComponent={exams.length > 0 ? (
          <View>
            <AdBanner style={{ margin: 16 }} />
            <NativeAdCard style={{ marginHorizontal: 16, marginBottom: 24 }} />
          </View>
        ) : null}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor="#7C3AED"
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0D0D0F' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  headerTitle: {
    color: '#F4F4F5',
    fontSize: 22,
    fontWeight: '800',
  },
  countText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '600',
    backgroundColor: '#1C1C1E',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  nudgeBox: {
    backgroundColor: 'rgba(124, 58, 237, 0.05)',
    marginHorizontal: 16,
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.1)',
  },
  nudgeText: {
    color: '#A78BFA',
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
    backgroundColor: '#1C1C1E',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    color: '#F4F4F5',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
  },
  emptySubtitle: {
    color: '#6B7280',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
  },
  exploreBtn: {
    backgroundColor: '#7C3AED',
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
