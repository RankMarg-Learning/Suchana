import React, { useState, useCallback, useRef } from 'react';
import {
  View, Text, TextInput, StyleSheet, FlatList,
  ScrollView, ActivityIndicator, TouchableOpacity, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { fetchExams } from '@/services/examService';
import { ExamCard } from '@/components/ExamCard';
import { CategoryChip } from '@/components/CategoryChip';
import { useUser } from '@/context/UserContext';
import { toggleSavedExam } from '@/services/userService';
import { Search, X, Inbox, ChevronLeft } from 'lucide-react-native';
import type { Exam } from '@/types/exam';
import { ExamCategory, ExamLevel } from '@/constants/enums';
import { useThemeColor } from '@/hooks/use-theme-color';

const CATEGORIES: { label: string; value: ExamCategory }[] = [
  { label: 'UPSC', value: ExamCategory.UPSC },
  { label: 'SSC', value: ExamCategory.SSC },
  { label: 'Banking', value: ExamCategory.BANKING_JOBS },
  { label: 'Railway', value: ExamCategory.RAILWAY_JOBS },
  { label: 'Defence', value: ExamCategory.DEFENCE_JOBS },
  { label: 'State PSC', value: ExamCategory.STATE_PSC },
  { label: 'Teaching', value: ExamCategory.TEACHING_ELIGIBILITY },
  { label: 'Police', value: ExamCategory.POLICE_JOBS },
  { label: 'Medical', value: ExamCategory.MEDICAL_ENTRANCE },
  { label: 'Engineering', value: ExamCategory.ENGINEERING_ENTRANCE },
];

const LEVELS: { label: string; value: ExamLevel | '' }[] = [
  { label: 'All', value: '' },
  { label: 'National', value: ExamLevel.NATIONAL },
  { label: 'State', value: ExamLevel.STATE },
];

export default function SearchScreen() {
  const router = useRouter();
  const { user, userId, refreshUser } = useUser();

  const background = useThemeColor({}, 'background');
  const textPrimary = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const cardBg = useThemeColor({}, 'card');
  const tint = useThemeColor({}, 'tint');
  const border = useThemeColor({}, 'border');

  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCats, setSelectedCats] = useState<ExamCategory[]>([]);
  const [level, setLevel] = useState<ExamLevel | ''>('');
  const [total, setTotal] = useState(0);

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadExams = useCallback(async () => {
    // Only load if there's something to search for
    if (!search && selectedCats.length === 0 && !level) {
      setExams([]);
      setTotal(0);
      return;
    }

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

  React.useEffect(() => { 
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
        loadExams();
    }, 400); 
  }, [search, selectedCats, level, loadExams]);

  const onRefresh = async () => { setRefreshing(true); await loadExams(); setRefreshing(false); };

  const toggleCat = (cat: ExamCategory) =>
    setSelectedCats(p => p.includes(cat) ? p.filter(x => x !== cat) : [...p, cat]);

  const handleSave = async (examId: string) => {
    if (!userId) return router.push('/onboarding');
    await toggleSavedExam(userId, examId);
    await refreshUser();
  };

  const isInitialState = !search && selectedCats.length === 0 && !level;

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: background }]} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={24} color={textPrimary} />
        </TouchableOpacity>
        <View style={[styles.searchBox, { backgroundColor: cardBg, borderColor: border }]}>
          <Search size={18} color={textMuted} style={{ marginRight: 10 }} />
          <TextInput
            style={[styles.searchInput, { color: textPrimary }]}
            placeholder="Search exams…"
            placeholderTextColor={textMuted}
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={loadExams}
            autoFocus
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <X size={18} color={textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={exams}
        keyExtractor={i => i.id}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={!isInitialState ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={tint} /> : undefined}
        ListHeaderComponent={
          <View style={{ marginBottom: 16 }}>
            {/* Level filter */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
              {LEVELS.map(l => (
                <TouchableOpacity
                  key={l.label}
                  style={[styles.levelBtn, { backgroundColor: cardBg, borderColor: border }, level === l.value && { borderColor: tint, backgroundColor: tint + '18' }]}
                  onPress={() => setLevel(l.value as any)}>
                  <Text style={[styles.levelTxt, { color: textMuted }, level === l.value && { color: tint }]}>{l.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Category chips */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
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
          </View>
        }
        renderItem={({ item }) => (
          <View style={{ marginBottom: 16 }}>
            <ExamCard
                exam={item}
                isSaved={user?.savedExamIds?.includes(item.id)}
                onSaveToggle={() => handleSave(item.id)}
                onPress={() => router.push({ pathname: '/exam/[id]', params: { id: item.slug } })}
            />
          </View>
        )}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              {isInitialState ? (
                <>
                    <Search size={48} color={border} style={{ marginBottom: 16 }} />
                    <Text style={[styles.emptyTxt, { color: textMuted }]}>Start typing to search exams</Text>
                </>
              ) : (
                <>
                    <Inbox size={48} color={border} style={{ marginBottom: 16 }} />
                    <Text style={[styles.emptyTxt, { color: textMuted }]}>No exams found matching your search.</Text>
                </>
              )}
            </View>
          ) : null
        }
        ListFooterComponent={loading ? <ActivityIndicator color={tint} style={{ marginTop: 20 }} /> : null}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1 },
  backBtn: { marginRight: 12 },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    borderWidth: 1,
  },
  searchInput: { flex: 1, fontSize: 15 },
  levelBtn: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 7,
    marginRight: 8,
  },
  levelTxt: { fontSize: 13, fontWeight: '600' },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyTxt: { fontSize: 16 },
});
