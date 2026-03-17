
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
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { examService, Exam } from '@/services/api.service';

const { width } = Dimensions.get('window');

const getStatusStyle = (status: string) => {
  switch (status) {
    case 'REGISTRATION_OPEN': return { bg: '#ECFDF5', text: '#10B981', icon: 'flash' as any };
    case 'UPCOMING': return { bg: '#EFF6FF', text: '#3B82F6', icon: 'calendar' as any };
    case 'RESULT_DECLARED': return { bg: '#FAF5FF', text: '#A855F7', icon: 'trophy' as any };
    case 'ADMIT_CARD_OUT': return { bg: '#FFF7ED', text: '#F97316', icon: 'card' as any };
    default: return { bg: '#F9FAFB', text: '#6B7280', icon: 'list' as any };
  }
};

const ExamListRow = ({
  exam,
  onPress,
  onEdit,
  onDelete,
}: {
  exam: Exam;
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) => {
  const ss = getStatusStyle(exam.status);
  const eventCount = exam._count?.lifecycleEvents || 0;

  return (
    <TouchableOpacity style={styles.listItem} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.listIconBox, { backgroundColor: ss.bg }]}>
        <Ionicons name={ss.icon} size={20} color={ss.text} />
      </View>

      <View style={styles.listMain}>
        <View style={styles.listHeaderRow}>
          <Text style={styles.listTitle} numberOfLines={1}>{exam.shortTitle || exam.title}</Text>
          {!exam.isPublished && (
            <View style={styles.draftPill}><Text style={styles.draftPillText}>Draft</Text></View>
          )}
        </View>

        <Text style={styles.listSub} numberOfLines={1}>
          {exam.conductingBody} • {exam.category.replace(/_/g, ' ')}
        </Text>

        <View style={styles.listMetaRow}>
          <View style={styles.miniChip}>
            <Ionicons name="people-outline" size={12} color="#9CA3AF" />
            <Text style={styles.miniChipText}>
              {typeof exam.totalVacancies === 'object' && exam.totalVacancies !== null
                ? (exam.totalVacancies as any).count || Object.values(exam.totalVacancies)[0] || '0'
                : exam.totalVacancies || '0'}
            </Text>
          </View>
          <View style={styles.miniChip}>
            <Ionicons name="time-outline" size={12} color="#9CA3AF" />
            <Text style={styles.miniChipText}>{eventCount} events</Text>
          </View>
          <Text style={[styles.statusMini, { color: ss.text }]}>
            {exam.status.replace(/_/g, ' ')}
          </Text>
        </View>
      </View>

      <View style={styles.listActions}>
        <TouchableOpacity style={styles.miniAction} onPress={(e) => { e.stopPropagation(); onEdit(); }}>
          <Ionicons name="create-outline" size={18} color="#6366F1" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.miniAction} onPress={(e) => { e.stopPropagation(); onDelete(); }}>
          <Ionicons name="trash-outline" size={18} color="#EF4444" />
        </TouchableOpacity>
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
        colors={['#4F46E5', '#3730A3']}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Suchana Live</Text>
            <Text style={styles.headerSubtitle}>Exam Intelligence Console</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
              <Ionicons name="refresh" size={20} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="rgba(255,255,255,0.6)" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search exams, agencies..."
            placeholderTextColor="rgba(255,255,255,0.5)"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color="rgba(255,255,255,0.6)" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statCount}>{filteredExams.length}</Text>
            <Text style={styles.statLabel}>Matching</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statCount}>
              {exams.filter(e => e.isPublished).length}
            </Text>
            <Text style={styles.statLabel}>Published</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statCount}>
              {exams.filter(e => !e.isPublished).length}
            </Text>
            <Text style={styles.statLabel}>Drafts</Text>
          </View>
        </View>
      </LinearGradient>

      {error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
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
              onEdit={() => handleEditExam(item)}
              onDelete={() => handleDeleteExam(item)}
            />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366F1" />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons
                name={searchQuery ? "search-outline" : "document-text-outline"}
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
          { bottom: (Platform.OS === 'ios' ? 88 : 64) + 12 }
        ]}
        onPress={handleCreateExam}
      >
        <LinearGradient
          colors={['#4F46E5', '#3730A3']}
          style={styles.fabGradient}
        >
          <Ionicons name="add" size={28} color="#FFF" />
          <Text style={styles.fabText}>New Exam</Text>
        </LinearGradient>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 10,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFF',
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
    padding: 0,
  },
  refreshButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    right: 20,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#4F46E5',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  fabGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  fabText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statCount: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '900',
  },
  statLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  listContent: {
    padding: 20,
    paddingBottom: 100,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  loadingText: {
    marginTop: 16,
    color: '#4F46E5',
    fontSize: 15,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 16,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  retryText: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 80,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1F2937',
    marginTop: 20,
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
  createNowButton: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#FFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#4F46E5',
  },
  createNowText: {
    color: '#4F46E5',
    fontWeight: '800',
    fontSize: 15,
  },
  // List Item Styles
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  listIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  listMain: {
    flex: 1,
    justifyContent: 'center',
  },
  listHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    maxWidth: '80%',
  },
  listSub: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 6,
  },
  listMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  miniChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  miniChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9CA3AF',
  },
  statusMini: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    marginLeft: 'auto',
  },
  draftPill: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  draftPillText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#9CA3AF',
    textTransform: 'uppercase',
  },
  listActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 12,
  },
  miniAction: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
