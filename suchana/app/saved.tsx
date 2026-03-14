import React from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { ChevronLeft, Bookmark, Search } from 'lucide-react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchSavedExams } from '@/services/examService';
import { toggleSavedExam as toggleSavedService } from '@/services/userService';
import { useUser } from '@/context/UserContext';
import { ExamCard } from '@/components/ExamCard';

export default function SavedExamsScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { userId, refreshUser } = useUser();

  const { data: exams = [], isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['savedExams', userId],
    queryFn: () => fetchSavedExams(userId!),
    enabled: !!userId,
  });

  const saveMutation = useMutation({
    mutationFn: (examId: string) => toggleSavedService(userId!, examId),
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
        Exams you bookmark will appear here for quick access.
      </Text>
      <TouchableOpacity
        style={styles.exploreBtn}
        onPress={() => router.push('/(tabs)/explore')}>
        <Text style={styles.exploreBtnText}>Explore Exams</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.root}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={24} color="#F4F4F5" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Saved Exams</Text>
        <View style={{ width: 40 }} />
      </View>

      {isLoading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#7C3AED" />
        </View>
      ) : (
        <FlatList
          data={exams}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ExamCard
              exam={item}
              isSaved={true}
              onSaveToggle={() => saveMutation.mutate(item.id)}
              onPress={() => router.push({ pathname: '/exam/[id]', params: { id: item.id } })}
            />
          )}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor="#7C3AED"
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0D0D0F' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1C1C1E',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1C1C1E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#F4F4F5',
    fontSize: 18,
    fontWeight: '800',
  },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: {
    padding: 16,
    gap: 16,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 80,
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#1C1C1E',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
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
    lineHeight: 22,
    marginBottom: 32,
  },
  exploreBtn: {
    backgroundColor: '#7C3AED',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 14,
  },
  exploreBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
