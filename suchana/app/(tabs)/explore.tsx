import React, { useState, useCallback, useRef } from 'react';
import {
  View, Text, TextInput, StyleSheet, FlatList,
  ScrollView, ActivityIndicator, TouchableOpacity, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchExams } from '@/services/examService';
import { ExamCard } from '@/components/ExamCard';
import { CategoryChip } from '@/components/CategoryChip';
import { AdBanner } from '@/components/AdBanner';
import { useUser } from '@/context/UserContext';
import { useAds } from '@/context/AdsContext';
import { toggleSavedExam } from '@/services/userService';
import { Search, X, Inbox, Trophy, Briefcase, FileCheck, ChevronRight } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import type { Exam, ExamCategory, ExamLevel } from '@/types/exam';
import { useFocusEffect, useRouter } from 'expo-router';

const CATEGORIES: { label: string; value: ExamCategory }[] = [
  { label: 'UPSC', value: 'UPSC' },
  { label: 'SSC', value: 'SSC' },
  { label: 'Banking', value: 'BANKING_JOBS' },
  { label: 'Railway', value: 'RAILWAY_JOBS' },
  { label: 'Defence', value: 'DEFENCE_JOBS' },
  { label: 'State PSC', value: 'STATE_PSC' },
  { label: 'Teaching', value: 'TEACHING_ELIGIBILITY' },
  { label: 'Police', value: 'POLICE_JOBS' },
  { label: 'Medical', value: 'MEDICAL_ENTRANCE' },
  { label: 'Engineering', value: 'ENGINEERING_ENTRANCE' },
];

const LEVELS: { label: string; value: ExamLevel | '' }[] = [
  { label: 'All', value: '' },
  { label: 'National', value: 'NATIONAL' },
  { label: 'State', value: 'STATE' },
];

function ExploreSection({ title, subtitle, stage, onSaveToggle, savedIds, onNavigate }: any) {
  const { data: sectionExams, isLoading } = useQuery({
    queryKey: ['explore-section', stage],
    queryFn: async () => {
      const { exams } = await fetchExams({ isPublished: true, limit: 10, lifecycleStage: stage });
      return exams;
    },
  });

  if (!isLoading && (!sectionExams || sectionExams.length === 0)) return null;

  return (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>{title}</Text>
          <Text style={styles.sectionSubtitle}>{subtitle}</Text>
        </View>
        <TouchableOpacity style={styles.viewAllBtn}>
          <Text style={styles.viewAllText}>View All</Text>
          <ChevronRight size={14} color="#7C3AED" />
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.sectionScroll}>
        {isLoading ? (
          <ActivityIndicator color="#7C3AED" style={{ marginHorizontal: 20 }} />
        ) : (
          sectionExams?.map((exam: any) => (
            <View key={exam.id} style={{ width: 280, marginRight: 12 }}>
              <ExamCard
                exam={exam}
                isSaved={savedIds?.includes(exam.id)}
                onSaveToggle={() => onSaveToggle(exam.id)}
                onPress={() => onNavigate(exam.id)}
              />
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

export default function ExploreScreen() {
  const router = useRouter();
  const { user, userId, refreshUser } = useUser();
  const { showInterstitial } = useAds();

  const handleNavigate = async (examId: string) => {
    await showInterstitial();
    router.push({ pathname: '/exam/[id]', params: { id: examId } });
  };
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCats, setSelectedCats] = useState<ExamCategory[]>([]);
  const [level, setLevel] = useState<ExamLevel | ''>('');
  const [total, setTotal] = useState(0);

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadExams = useCallback(async () => {
    setLoading(true);
    try {
      const { exams: list, total: t } = await fetchExams({
        search: search || undefined,
        category: selectedCats.length === 1 ? selectedCats[0] : undefined,
        examLevel: level || undefined,
        isPublished: true,
        limit: 30,
      });
      setExams(list);
      setTotal(t);
    } catch (_) { }
    finally { setLoading(false); }
  }, [search, selectedCats, level]);

  useFocusEffect(useCallback(() => { loadExams(); }, [loadExams]));

  // Debounce search: fire 500ms after user stops typing
  const handleSearchChange = (text: string) => {
    setSearch(text);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      // loadExams will re-run via the dependency on `search` in the callback
    }, 500);
  };

  const onRefresh = async () => { setRefreshing(true); await loadExams(); setRefreshing(false); };

  const toggleCat = (cat: ExamCategory) =>
    setSelectedCats(p => p.includes(cat) ? p.filter(x => x !== cat) : [...p, cat]);

  const handleSave = async (examId: string) => {
    if (!userId) return;
    await toggleSavedExam(userId, examId);
    await refreshUser();
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <FlatList
        data={exams}
        keyExtractor={i => i.id}
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#7C3AED" />}
        ListHeaderComponent={
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16 }}>
              <Search size={22} color="#7C3AED" style={{ marginRight: 10 }} />
              <Text style={[styles.title, { padding: 0 }]}>Explore Exams</Text>
            </View>
            <AdBanner style={{ marginHorizontal: 16, marginBottom: 8 }} />

            {/* Search */}
            <View style={styles.searchBox}>
              <Search size={18} color="#4B5563" style={{ marginRight: 10 }} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search exams, boards, posts…"
                placeholderTextColor="#4B5563"
                value={search}
                onChangeText={handleSearchChange}
                onSubmitEditing={loadExams}
                returnKeyType="search"
              />
              {search.length > 0 && (
                <TouchableOpacity onPress={() => { setSearch(''); }} style={{ padding: 4 }}>
                  <X size={18} color="#6B7280" />
                </TouchableOpacity>
              )}
            </View>

            {/* Explore Sections (Only when no search/filter) */}
            {!(search || level || selectedCats.length > 0) && (
              <View style={{ marginBottom: 24 }}>
                <ExploreSection
                  title="Job Updates"
                  subtitle="Latest recruitments"
                  icon="briefcase"
                  stage="REGISTRATION"
                  onSaveToggle={handleSave}
                  savedIds={user?.savedExamIds}
                  onNavigate={handleNavigate}
                />
                <ExploreSection
                  title="Admit Cards"
                  subtitle="Download your hall tickets"
                  icon="id-card"
                  stage="ADMIT_CARD"
                  onSaveToggle={handleSave}
                  savedIds={user?.savedExamIds}
                  onNavigate={handleNavigate}
                />
                <ExploreSection
                  title="Results Out"
                  subtitle="Check your final scores"
                  icon="trophy"
                  stage="RESULT"
                  onSaveToggle={handleSave}
                  savedIds={user?.savedExamIds}
                  onNavigate={handleNavigate}
                />
              </View>
            )}

            <View style={{ paddingHorizontal: 16, marginBottom: 12 }}>
              <Text style={styles.sectionTitle}>Discover More</Text>
            </View>

            {/* Level filter */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.levelRow}>
              {LEVELS.map(l => (
                <TouchableOpacity
                  key={l.value}
                  style={[styles.levelBtn, level === l.value && styles.levelBtnActive]}
                  onPress={() => setLevel(l.value)}>
                  <Text style={[styles.levelTxt, level === l.value && styles.levelTxtActive]}>{l.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Category chips */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
              {CATEGORIES.map(c => (
                <CategoryChip
                  key={c.value}
                  label={c.label}
                  value={c.value}
                  selected={selectedCats.includes(c.value)}
                  onPress={() => toggleCat(c.value)}
                />
              ))}
            </ScrollView>

            {/* Result count */}
            <View style={styles.resultRow}>
              <Text style={styles.resultCount}>{total} Exams Found</Text>
              {(selectedCats.length > 0 || search || level) && (
                <TouchableOpacity onPress={() => { setSearch(''); setSelectedCats([]); setLevel(''); }}>
                  <Text style={styles.clearFilters}>Clear Filters</Text>
                </TouchableOpacity>
              )}
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
            {(index + 1) % 6 === 0 && <AdBanner />}
          </View>
        )}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <Inbox size={48} color="#3F3F46" strokeWidth={1.5} style={{ marginBottom: 16 }} />
              <Text style={styles.emptyTxt}>No exams match your filters.</Text>
            </View>
          ) : null
        }
        ListFooterComponent={loading ? <ActivityIndicator color="#7C3AED" style={{ marginTop: 24 }} /> : null}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0D0D0F' },
  title: { color: '#F4F4F5', fontSize: 22, fontWeight: '800', padding: 16, paddingBottom: 12 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: 14,
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  searchInput: { flex: 1, color: '#F4F4F5', fontSize: 15, paddingVertical: 14 },
  levelRow: { paddingHorizontal: 16, paddingBottom: 10, gap: 8 },
  levelBtn: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2C2C2E',
    backgroundColor: '#1C1C1E',
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  levelBtnActive: { borderColor: '#7C3AED', backgroundColor: '#3B0764' },
  levelTxt: { color: '#9CA3AF', fontSize: 13, fontWeight: '600' },
  levelTxtActive: { color: '#C4B5FD' },
  chipRow: { paddingHorizontal: 16, paddingBottom: 10 },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  resultCount: { color: '#6B7280', fontSize: 13 },
  clearFilters: { color: '#7C3AED', fontSize: 13, fontWeight: '600' },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyTxt: { color: '#6B7280', fontSize: 16 },
  sectionContainer: { marginTop: 24 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12
  },
  sectionTitle: { color: '#F4F4F5', fontSize: 18, fontWeight: '800' },
  sectionSubtitle: { color: '#71717A', fontSize: 12, fontWeight: '500' },
  viewAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  viewAllText: { color: '#7C3AED', fontSize: 13, fontWeight: '700' },
  sectionScroll: { paddingHorizontal: 16 },
});
