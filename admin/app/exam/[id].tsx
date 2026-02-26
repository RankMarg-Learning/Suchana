
import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator, 
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { examService, lifecycleService, Exam, LifecycleEvent } from '@/services/api.service';
import { TimelineItem } from '@/components/TimelineItem';

export default function ExamDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [exam, setExam] = useState<Exam | null>(null);
  const [timeline, setTimeline] = useState<LifecycleEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchData = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [examRes, timelineRes] = await Promise.all([
        examService.getExamById(id),
        lifecycleService.getEventsByExamId(id)
      ]);
      
      setExam(examRes.data || examRes);
      
      // The backend returns { success: true, data: { exam, events: [] } }
      const timelineData = timelineRes.data?.events || 
                          (Array.isArray(timelineRes.data) ? timelineRes.data : 
                          (Array.isArray(timelineRes) ? timelineRes : []));
      setTimeline(timelineData);
    } catch (err: any) {
      console.error(err);
      Alert.alert('Error', 'Failed to fetch exam details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const handleAddEvent = () => {
    router.push({
      pathname: '/add-event',
      params: { examId: id, examTitle: exam?.shortTitle }
    });
  };

  const handleDeleteExam = () => {
    Alert.alert(
      'Delete Exam',
      'Are you sure you want to delete this exam? This will remove all associated events.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await examService.deleteExam(id as string);
              router.back();
            } catch (err) {
              Alert.alert('Error', 'Failed to delete exam');
            }
          }
        }
      ]
    );
  };

  const handleEditEvent = (event: LifecycleEvent) => {
    router.push({
      pathname: '/add-event',
      params: { 
        examId: id, 
        examTitle: exam?.shortTitle,
        eventId: event.id 
      }
    });
  };

  const handleDeleteEvent = (event: LifecycleEvent) => {
    Alert.alert(
      'Delete Event',
      `Are you sure you want to delete "${event.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              if (!id) return;
              await lifecycleService.deleteEvent(id, event.id);
              fetchData();
            } catch (err) {
              Alert.alert('Error', 'Failed to delete event');
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  if (!exam) {
    return (
      <View style={styles.centered}>
        <Text>Exam not found</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Stack.Screen 
        options={{ 
          title: exam.shortTitle,
          headerRight: () => (
            <View style={{ flexDirection: 'row', gap: 16 }}>
              <TouchableOpacity onPress={() => router.push({ pathname: '/create-exam', params: { id } })}>
                <Ionicons name="create-outline" size={24} color="#2196F3" />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDeleteExam}>
                <Ionicons name="trash-outline" size={24} color="#F44336" />
              </TouchableOpacity>
            </View>
          )
        }} 
      />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>General Information</Text>
          <View style={styles.infoGrid}>
            <InfoItem label="Title" value={exam.title} fullWidth />
            <InfoItem label="Conducting Body" value={exam.conductingBody} />
            <InfoItem label="Category" value={exam.category} />
            <InfoItem label="Status" value={exam.status} />
            <InfoItem label="Vacancies" value={exam.totalVacancies?.toString() || 'N/A'} />
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Lifecycle Timeline</Text>
          <TouchableOpacity style={styles.addEventButton} onPress={handleAddEvent}>
            <Ionicons name="add-circle" size={20} color="#2196F3" />
            <Text style={styles.addEventText}>Add Event</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          {timeline.length > 0 ? (
            timeline.map((event, index) => (
              <TimelineItem 
                key={event.id} 
                event={event} 
                isLast={index === timeline.length - 1} 
                onEdit={() => handleEditEvent(event)}
                onDelete={() => handleDeleteEvent(event)}
              />
            ))
          ) : (
            <View style={styles.emptyTimeline}>
              <Text style={styles.emptyTimelineText}>No events added yet.</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const InfoItem = ({ label, value, fullWidth }: { label: string; value: string; fullWidth?: boolean }) => (
  <View style={[styles.infoItem, fullWidth && { width: '100%' }]}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  infoItem: {
    width: '45%',
  },
  infoLabel: {
    fontSize: 12,
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 15,
    color: '#333',
    fontWeight: '600',
  },
  addEventButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addEventText: {
    color: '#2196F3',
    fontWeight: '700',
    fontSize: 14,
  },
  emptyTimeline: {
    padding: 20,
    alignItems: 'center',
  },
  emptyTimelineText: {
    color: '#999',
    fontStyle: 'italic',
  },
});
