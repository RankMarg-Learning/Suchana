
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Platform,
  TextInput,
  StatusBar,
  Alert,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Plus, Search, RotateCcw, XCircle, Wallet, AlertCircle,
  FileText, Calendar, Zap, Trophy, CreditCard, LayoutList
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { examService, Exam } from '@/services/api.service';

const { width } = Dimensions.get('window');

const getStatusStyle = (status: string) => {
  switch (status) {
    case 'REGISTRATION_OPEN': return { bg: '#ecfdf5', text: '#10b981', icon: Zap };
    case 'NOTIFICATION': return { bg: '#eff6ff', text: '#3b82f6', icon: Calendar };
    case 'RESULT_DECLARED': return { bg: '#faf5ff', text: '#a855f7', icon: Trophy };
    case 'ADMIT_CARD_OUT': return { bg: '#fff7ed', text: '#f97316', icon: CreditCard };
    default: return { bg: '#f1f5f9', text: '#64748b', icon: LayoutList };
  }
};

const ExamListRow = ({
  exam,
  onPress,
}: {
  exam: Exam;
  onPress: () => void;
}) => {
  const ss = getStatusStyle(exam.status);
  const StatusIcon = ss.icon;

  return (
    <TouchableOpacity style={styles.cardItem} onPress={onPress} activeOpacity={0.88}>
      <View style={[styles.cardAccent, { backgroundColor: ss.text }]} />

      <View style={styles.cardMain}>
        <View style={styles.cardHeader}>
          <View style={styles.cardInfoGroup}>
            <View style={styles.statusBadgeRow}>
              <View style={[styles.statusIconBox, { backgroundColor: ss.bg }]}>
                <StatusIcon size={10} color={ss.text} strokeWidth={3} />
              </View>
              <Text style={[styles.cardStatusText, { color: ss.text }]}>
                {exam.status.replace(/_/g, ' ')}
              </Text>
              {!exam.isPublished && (
                <View style={styles.draftPill}><Text style={styles.draftPillText}>HIDDEN</Text></View>
              )}
            </View>
            <Text style={styles.cardTitle} numberOfLines={2}>{exam.shortTitle || exam.title}</Text>
            <View style={styles.agencyRow}>
              <Text style={styles.agencyText}>{exam.conductingBody}</Text>
              <View style={styles.dot} />
              <Text style={styles.categoryText}>{exam.category.replace(/_/g, ' ')}</Text>
            </View>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.metaBadge}>
            <Wallet size={10} color="#64748b" strokeWidth={2.5} />
            <Text style={styles.metaBadgeText} numberOfLines={1}>{exam.salary || 'Competitive Salary'}</Text>
          </View>
          <View style={[styles.metaBadge, { flex: 1, justifyContent: 'flex-end', backgroundColor: 'transparent' }]}>
            <Text style={styles.dateText}>
              {new Date(exam.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function ExamsScreen() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchExams = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await examService.getAllExams();
      const data = Array.isArray(response) ? response : response.data || [];
      setExams(data);
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch exams. Is the server running?');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchExams();
  }, [fetchExams]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchExams();
  };

  const handleCreateExam = () => {
    router.push('/create-exam');
  };

  const handleEditExam = (exam: Exam) => {
    router.push({
      pathname: '/create-exam',
      params: { id: exam.id }
    });
  };

  const handleDeleteExam = (exam: Exam) => {
    Alert.alert(
      'Delete Exam',
      `Are you sure you want to delete "${exam.shortTitle}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await examService.deleteExam(exam.id);
              fetchExams();
            } catch (err) {
              Alert.alert('Error', 'Failed to delete exam');
            }
          }
        }
      ]
    );
  };

  const handleExamPress = (exam: Exam) => {
    router.push({
      pathname: '/exam/[id]',
      params: { id: exam.id, title: exam.shortTitle }
    });
  };

  const filteredExams = exams.filter(e =>
    e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.shortTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.conductingBody?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>Loading Intelligence...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" />

      <LinearGradient
        colors={['#0f172a', '#1e293b']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Suchana Admin</Text>
            <Text style={styles.headerSubtitle}>Central Intelligence Dashboard</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
              <RotateCcw size={18} color="#94a3b8" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.searchBar}>
          <Search size={18} color="#64748b" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search exams, agencies..."
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <XCircle size={18} color="#64748b" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statCount}>{filteredExams.length}</Text>
            <Text style={styles.statLabel}>Found</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statCount}>
              {exams.filter(e => e.isPublished).length}
            </Text>
            <Text style={styles.statLabel}>Live</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statCount}>
              {exams.filter(e => !e.isPublished).length}
            </Text>
            <Text style={styles.statLabel}>Hidden</Text>
          </View>
        </View>
      </LinearGradient>

      {error ? (
        <View style={styles.errorContainer}>
          <AlertCircle size={48} color="#EF4444" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchExams}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredExams}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ExamListRow
              exam={item}
              onPress={() => handleExamPress(item)}
            />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366F1" />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <FileText
                size={80}
                color="#D1D5DB"
              />
              <Text style={styles.emptyTitle}>
                {searchQuery ? "No Matches Found" : "No Exams Found"}
              </Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery
                  ? `We couldn't find anything for "${searchQuery}"`
                  : "Create your first exam to get started"
                }
              </Text>
              {searchQuery ? (
                <TouchableOpacity style={styles.createNowButton} onPress={() => setSearchQuery('')}>
                  <Text style={styles.createNowText}>Clear Search</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.createNowButton} onPress={handleCreateExam}>
                  <Text style={styles.createNowText}>Create Now</Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      )}
      <TouchableOpacity
        style={[
          styles.fab,
          { bottom: (Platform.OS === 'ios' ? 0 : 0) + 16 }
        ]}
        onPress={handleCreateExam}
      >
        <LinearGradient
          colors={['#0f172a', '#374151']}
          style={styles.fabGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Plus size={24} color="#f8fafc" />
          <Text style={styles.fabText}>Add Exam</Text>
        </LinearGradient>
      </TouchableOpacity>
    </SafeAreaView>
  );
} const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f5f9' },
  header: {
    paddingTop: 12, paddingHorizontal: 20, paddingBottom: 28,
    borderBottomLeftRadius: 44, borderBottomRightRadius: 44,
    shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 25, elevation: 15
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerTitle: { fontSize: 24, fontWeight: '900', color: '#f8fafc', letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 10, color: '#94a3b8', fontWeight: '900', textTransform: 'uppercase', letterSpacing: 2 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 22,
    paddingHorizontal: 18, paddingVertical: 14, marginBottom: 20, gap: 12,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)'
  },
  searchInput: { flex: 1, color: '#f8fafc', fontSize: 15, fontWeight: '600', padding: 0 },
  refreshButton: { width: 44, height: 44, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },

  fab: { position: 'absolute', right: 20, borderRadius: 28, overflow: 'hidden', elevation: 15, shadowColor: '#000', shadowOpacity: 0.4, shadowRadius: 20, shadowOffset: { width: 0, height: 8 } },
  fabGradient: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 26, paddingVertical: 18 },
  fabText: { color: '#f8fafc', fontSize: 15, fontWeight: '900', letterSpacing: 0.5 },

  statsRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 28, paddingVertical: 16, paddingHorizontal: 4, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' },
  statBox: { flex: 1, alignItems: 'center' },
  statCount: { color: '#f8fafc', fontSize: 20, fontWeight: '900' },
  statLabel: { color: '#94a3b8', fontSize: 9, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1.5, marginTop: 4 },
  statDivider: { width: 1, height: 28, backgroundColor: 'rgba(255,255,255,0.15)' },

  listContent: { padding: 16, paddingBottom: 140 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' },
  loadingText: { marginTop: 16, color: '#3b82f6', fontSize: 13, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 2 },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  errorText: { fontSize: 15, color: '#64748b', textAlign: 'center', marginTop: 16, marginBottom: 24, fontWeight: '600', lineHeight: 22 },
  retryButton: { backgroundColor: '#3b82f6', paddingHorizontal: 36, paddingVertical: 18, borderRadius: 20, shadowColor: '#3b82f6', shadowOpacity: 0.4, shadowRadius: 15, elevation: 8 },
  retryText: { color: '#FFF', fontWeight: '900', fontSize: 13, letterSpacing: 2, textTransform: 'uppercase' },

  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 80 },
  emptyTitle: { fontSize: 22, fontWeight: '900', color: '#1e293b', marginTop: 24 },
  emptySubtitle: { fontSize: 15, color: '#64748b', marginTop: 10, textAlign: 'center', fontWeight: '500', width: '80%' },
  createNowButton: { marginTop: 32, paddingVertical: 16, paddingHorizontal: 36, backgroundColor: '#FFF', borderRadius: 20, borderWidth: 1, borderColor: '#e2e8f0', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 15 },
  createNowText: { color: '#3b82f6', fontWeight: '900', fontSize: 13, letterSpacing: 1.5, textTransform: 'uppercase' },

  // High-End Card Styles
  cardItem: {
    backgroundColor: '#FFFFFF', borderRadius: 2, marginBottom: 16,
    flexDirection: 'row', overflow: 'hidden',
    shadowColor: '#475569', shadowOpacity: 0.1, shadowRadius: 20, elevation: 5,
    borderWidth: 1, borderColor: '#f1f5f9'
  },
  cardAccent: { width: 6, height: '100%', opacity: 0.8 },
  cardMain: { flex: 1, padding: 10 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  cardInfoGroup: { flex: 1 },
  statusBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  cardStatusText: { fontSize: 9, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1.2 },
  cardTitle: { fontSize: 17, fontWeight: '800', color: '#0f172a', marginBottom: 6, lineHeight: 22 },
  agencyRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  agencyText: { fontSize: 11, color: '#64748b', fontWeight: '800', textTransform: 'uppercase' },
  categoryText: { fontSize: 11, color: '#94a3b8', fontWeight: '700' },
  dot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: '#cbd5e1' },

  cardFooter: {
    flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 4,
    paddingTop: 16, borderTopWidth: 1, borderTopColor: '#f1f5f9'
  },
  metaBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#f8fafc', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10
  },
  metaBadgeText: { fontSize: 11, fontWeight: '700', color: '#475569' },
  dateText: { fontSize: 10, color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase' },

  draftPill: { backgroundColor: '#fef2f2', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, borderWidth: 1, borderColor: '#fee2e2' },
  draftPillText: { fontSize: 8, fontWeight: '900', color: '#ef4444' },
  cardHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  statusIconBox: { width: 20, height: 20, borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
  cardIconBox: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  listActions: { flexDirection: 'row', alignItems: 'center', gap: 10, marginLeft: 12 },
  miniAction: {
    width: 36, height: 36, borderRadius: 14, backgroundColor: '#f8fafc',
    justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#f1f5f9'
  },
  deleteAction: { backgroundColor: '#fff1f2', borderColor: '#ffe4e6' },
});
