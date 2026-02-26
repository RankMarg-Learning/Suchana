import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, ScrollView,
  RefreshControl, ActivityIndicator, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useUser } from '@/context/UserContext';
import { getPersonalizedExams } from '@/services/userService';
import { fetchExams } from '@/services/examService';
import { toggleSavedExam } from '@/services/userService';
import { ExamCard } from '@/components/ExamCard';
import { CategoryChip } from '@/components/CategoryChip';
import { AdBanner } from '@/components/AdBanner';
import { DeadlineBanner } from '@/components/DeadlineBanner';
import type { Exam, ExamCategory } from '@/types/exam';

const CATEGORIES: { label: string; value: ExamCategory }[] = [
  { label: 'All', value: 'OTHER' },
  { label: 'UPSC', value: 'UPSC' },
  { label: 'SSC', value: 'SSC' },
  { label: 'Banking', value: 'BANKING' },
  { label: 'Railway', value: 'RAILWAY' },
  { label: 'Defence', value: 'DEFENCE' },
  { label: 'State PSC', value: 'STATE_PSC' },
  { label: 'Teaching', value: 'TEACHING' },
  { label: 'Police', value: 'POLICE' },
];

export default function HomeScreen() {
  const router = useRouter();
  const { user, userId, refreshUser } = useUser();
  const [exams, setExams] = useState<Exam[]>([]);
  const [allExams, setAllExams] = useState<Exam[]>([]);
  const [activeCategory, setActiveCategory] = useState<ExamCategory | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadExams = useCallback(async () => {
    try {
      if (userId && user?.preferredCategories?.length) {
        const { exams: personal } = await getPersonalizedExams(userId);
        setExams(personal);
      } else {
        const { exams: all } = await fetchExams({ isPublished: true, limit: 20 });
        setExams(all);
      }
      // Also load all for deadline banner
      const { exams: all } = await fetchExams({ isPublished: true, limit: 50 });
      setAllExams(all);
    } catch (_) {}
    finally { setLoading(false); }
  }, [userId]);

  useEffect(() => { loadExams(); }, [loadExams]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadExams();
    setRefreshing(false);
  };

  const filteredExams = activeCategory
    ? exams.filter(e => e.category === activeCategory)
    : exams;

  const handleSave = async (examId: string) => {
    if (!userId) return;
    await toggleSavedExam(userId, examId);
    await refreshUser();
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  if (loading) {
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
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#7C3AED" />
        }
        ListHeaderComponent={
          <View>
            {/* Header */}
            <View style={styles.header}>
              <View>
                <Text style={styles.greeting}>{greeting()} 👋</Text>
                <Text style={styles.name}>{user?.name ?? 'Aspirant'}</Text>
              </View>
              <View style={styles.stateBubble}>
                <Text style={styles.stateText}>{user?.state ?? '🇮🇳 India'}</Text>
              </View>
            </View>

            {/* Personalisation nudge for guest users */}
            {!user && (
              <TouchableOpacity
                style={styles.nudgeBanner}
                onPress={() => router.push('/onboarding')}
                activeOpacity={0.8}>
                <Text style={styles.nudgeIcon}>✨</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.nudgeTitle}>Get personalised exam alerts</Text>
                  <Text style={styles.nudgeText}>Set up your profile to see exams matching your preferences</Text>
                </View>
                <Text style={styles.nudgeArrow}>→</Text>
              </TouchableOpacity>
            )}

            {/* Deadline banner */}
            <DeadlineBanner exams={allExams} />

            {/* Ad */}
            <AdBanner style={{ marginHorizontal: 16 }} />

            {/* Category filter */}
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
              {user?.preferredCategories?.length ? '✨ For You' : '📋 All Exams'}
            </Text>
          </View>
        }
        renderItem={({ item, index }) => (
          <View style={{ paddingHorizontal: 16 }}>
            <ExamCard
              exam={item}
              isSaved={user?.savedExamIds?.includes(item.id)}
              onSaveToggle={() => handleSave(item.id)}
            />
            {/* Ad every 5 cards */}
            {(index + 1) % 5 === 0 && <AdBanner />}
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyText}>No exams found.</Text>
            <Text style={styles.emptyHint}>Try a different category filter.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0D0D0F' },
  loader: { flex: 1, backgroundColor: '#0D0D0F', justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  greeting: { color: '#6B7280', fontSize: 13 },
  name: { color: '#F4F4F5', fontSize: 22, fontWeight: '800', marginTop: 2 },
  stateBubble: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  stateText: { color: '#9CA3AF', fontSize: 13, fontWeight: '600' },
  chipScroll: { paddingHorizontal: 16, paddingBottom: 8 },
  sectionTitle: {
    color: '#F4F4F5', fontSize: 18, fontWeight: '700',
    marginBottom: 12, paddingHorizontal: 16,
  },
  empty: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 40 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyText: { color: '#F4F4F5', fontSize: 18, fontWeight: '700', marginBottom: 8 },
  emptyHint: { color: '#6B7280', fontSize: 14, textAlign: 'center' },
  nudgeBanner: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: '#1A0F2E',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#4C1D95',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  nudgeIcon: { fontSize: 22 },
  nudgeTitle: { color: '#C4B5FD', fontSize: 13, fontWeight: '700', marginBottom: 2 },
  nudgeText: { color: '#6D28D9', fontSize: 11, lineHeight: 16 },
  nudgeArrow: { color: '#7C3AED', fontSize: 18, fontWeight: '700' },
});
