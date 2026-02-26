
import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  ActivityIndicator, 
  RefreshControl, 
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { examService, Exam } from '@/services/api.service';
import { ExamCard } from '@/components/ExamCard';

export default function ExamsScreen() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchExams = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await examService.getAllExams();
      // Adjusting based on standard api response if wrapped
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
              fetchExams(); // Refresh list after delete
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

  if (loading && !refreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading Exams...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Exam Suchana</Text>
          <Text style={styles.headerSubtitle}>Admin Control Panel</Text>
        </View>
        <View style={styles.headerActions}>
           <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
            <Ionicons name="refresh" size={20} color="#666" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.addButton} onPress={handleCreateExam}>
            <Ionicons name="add" size={24} color="#FFF" />
            <Text style={styles.addButtonText}>New</Text>
          </TouchableOpacity>
        </View>
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#F44336" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchExams}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={exams}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ExamCard 
              exam={item} 
              onPress={() => handleExamPress(item)} 
              onEdit={() => handleEditExam(item)}
              onDelete={() => handleDeleteExam(item)}
            />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="document-text-outline" size={64} color="#CCC" />
              <Text style={styles.emptyTitle}>No Exams Found</Text>
              <Text style={styles.emptySubtitle}>Create your first exam to get started</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: '#2196F3',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 4,
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  addButtonText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
    fontSize: 14,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: '#FFF',
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#444',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
});
