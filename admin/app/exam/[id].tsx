
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  StatusBar,
  Alert,
  Modal,
  TextInput,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { examService, lifecycleService, Exam, LifecycleEvent } from '@/services/api.service';
import { TimelineItem } from '@/components/TimelineItem';
import { EXAM_LEVELS, EXAM_CATEGORIES } from '@/constants/enums';

const { width } = Dimensions.get('window');

export default function ExamDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [exam, setExam] = useState<Exam | null>(null);
  const [timeline, setTimeline] = useState<LifecycleEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [notifying, setNotifying] = useState(false);
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [notifyType, setNotifyType] = useState<'CUSTOM' | 'RESULT' | 'ADMIT_CARD' | 'REGISTRATION' | 'EXAM_DATE'>('CUSTOM');
  const [notifyAudience, setNotifyAudience] = useState<'BOOKMARKED' | 'INTERESTED'>('BOOKMARKED');
  const [notifyTitle, setNotifyTitle] = useState('');
  const [notifyBody, setNotifyBody] = useState('');

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

  const handleSendNotification = async () => {
    if (!id) return;
    try {
      setNotifying(true);
      const result = await examService.notifyBookmarkedUsers(id, notifyTitle, notifyBody, notifyAudience);
      Alert.alert('Success', `Notification sent to ${result.targetTokens} users.`);
      setShowNotifyModal(false);
      resetNotifyForm();
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to send notification');
    } finally {
      setNotifying(false);
    }
  };

  const resetNotifyForm = () => {
    setNotifyType('CUSTOM');
    setNotifyAudience('BOOKMARKED');
    setNotifyTitle('');
    setNotifyBody('');
  };

  const handleTypeSelect = (type: typeof notifyType) => {
    setNotifyType(type);
    if (!exam) return;

    switch (type) {
      case 'RESULT':
        setNotifyTitle(`🎉 Result Declared: ${exam.shortTitle}`);
        setNotifyBody(`${exam.shortTitle} results are now available. Check your status now!`);
        break;
      case 'ADMIT_CARD':
        setNotifyTitle(`🎟️ Admit Card Out: ${exam.shortTitle}`);
        setNotifyBody(`Download your admit card for ${exam.shortTitle}. Tap to view links.`);
        break;
      case 'REGISTRATION':
        setNotifyTitle(`📝 Apply Now: ${exam.shortTitle}`);
        setNotifyBody(`Registration for ${exam.shortTitle} has started. Don't miss the deadline!`);
        break;
      case 'EXAM_DATE':
        setNotifyTitle(`📅 Exam Dates Announced: ${exam.shortTitle}`);
        setNotifyBody(`The examination dates for ${exam.shortTitle} have been officially announced.`);
        break;
      default:
        setNotifyTitle('');
        setNotifyBody('');
    }
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
        <ActivityIndicator size="large" color="#6366F1" />
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
      <StatusBar barStyle="light-content" />
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} bounces={false}>
        <LinearGradient
          colors={['#6366F1', '#4F46E5']}
          style={styles.topHeader}
        >
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
              <Ionicons name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>
            <View style={styles.headerActionRow}>
              <TouchableOpacity
                onPress={() => router.push({ pathname: '/create-exam', params: { id } })}
                style={styles.iconButton}
              >
                <Ionicons name="create-outline" size={24} color="#FFF" />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDeleteExam} style={styles.iconButton}>
                <Ionicons name="trash-outline" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>
          </View>
          <Text style={styles.examTitle}>{exam.title}</Text>
          <View style={styles.badgeContainer}>
            <View style={[styles.badge, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
              <Text style={styles.badgeText}>{exam.category.replace(/_/g, ' ')}</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
              <Text style={styles.badgeText}>{exam.examLevel}</Text>
            </View>
            {exam.isPublished ? (
              <View style={[styles.badge, { backgroundColor: '#10B981' }]}>
                <Text style={styles.badgeText}>LIVE</Text>
              </View>
            ) : (
              <View style={[styles.badge, { backgroundColor: '#F59E0B' }]}>
                <Text style={styles.badgeText}>DRAFT</Text>
              </View>
            )}
          </View>
        </LinearGradient>

        <View style={styles.mainContent}>
          <TouchableOpacity
            style={styles.notifyBanner}
            onPress={() => setShowNotifyModal(true)}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={['#8B5CF6', '#6366F1']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.notifyBannerGradient}
            >
              <View style={styles.notifyLeftDecoration}>
                <Ionicons name="megaphone" size={80} color="rgba(255,255,255,0.15)" style={styles.megaphoneIcon} />
              </View>
              <View style={styles.notifyContent}>
                <View style={styles.notifyIconWrapper}>
                  <Ionicons name="send" size={24} color="#FFF" />
                </View>
                <View>
                  <Text style={styles.notifyTitleText}>Broadcast Update</Text>
                  <Text style={styles.notifySubtitleText}>Notify all bookmarked users instantly</Text>
                </View>
              </View>
              <View style={styles.notifyRightAction}>
                <Ionicons name="chevron-forward" size={20} color="#FFF" />
              </View>
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.card}>
            <View style={styles.sectionHeaderInner}>
              <Ionicons name="information-circle-outline" size={20} color="#4F46E5" />
              <Text style={styles.sectionTitle}>General Information</Text>
            </View>
            <View style={styles.infoGrid}>
              <InfoItem label="Admin Body" value={exam.conductingBody} />
              <InfoItem label="Short Name" value={exam.shortTitle} />
              <InfoItem label="Phase" value={exam.status.replace(/_/g, ' ')} />
              <InfoItem label="Scale" value={exam.state || 'National'} />
            </View>
            {exam.description && (
              <View style={styles.descriptionContainer}>
                <Text style={styles.infoLabel}>Description</Text>
                <Text style={styles.descriptionText}>{exam.description}</Text>
              </View>
            )}
          </View>

          <View style={styles.card}>
            <View style={styles.sectionHeaderInner}>
              <Ionicons name="school-outline" size={20} color="#4F46E5" />
              <Text style={styles.sectionTitle}>Eligibility & Details</Text>
            </View>
            <View style={styles.infoGrid}>
              <InfoItem label="Min Age" value={exam.minAge?.toString() || 'N/A'} />
              <InfoItem label="Max Age" value={exam.maxAge?.toString() || 'N/A'} />
              <InfoItem label="Qualification" value={(exam.qualificationCriteria as any)?.level || 'N/A'} />
              <InfoItem label="Vacancies" value={exam.totalVacancies?.toString() || 'N/A'} />
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.sectionHeaderInner}>
              <Ionicons name="link-outline" size={20} color="#4F46E5" />
              <Text style={styles.sectionTitle}>Official Resources</Text>
            </View>
            <View style={styles.infoGrid}>
              <InfoItem label="Website" value={exam.officialWebsite || 'N/A'} fullWidth />
              <InfoItem label="Notification" value={exam.notificationUrl || 'N/A'} fullWidth />
            </View>
          </View>

          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderInner}>
              <Ionicons name="time-outline" size={22} color="#1A1A1A" />
              <Text style={styles.sectionTitleMain}>Lifecycle Timeline</Text>
            </View>
            <TouchableOpacity style={styles.addEventButton} onPress={handleAddEvent}>
              <LinearGradient
                colors={['#6366F1', '#4F46E5']}
                style={styles.addEventGradient}
              >
                <Ionicons name="add" size={18} color="#FFF" />
                <Text style={styles.addEventText}>Event</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={styles.timelineCard}>
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
                <Ionicons name="calendar-outline" size={48} color="#D1D5DB" />
                <Text style={styles.emptyTimelineText}>No events added yet.</Text>
                <TouchableOpacity onPress={handleAddEvent}>
                  <Text style={styles.createFirstText}>Create your first event</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={showNotifyModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowNotifyModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalIndicator} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Broadcast Update</Text>
              <TouchableOpacity onPress={() => setShowNotifyModal(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Target Audience</Text>
                <View style={styles.audienceSelector}>
                  <TouchableOpacity
                    style={[styles.audienceChip, notifyAudience === 'BOOKMARKED' && styles.audienceChipActive]}
                    onPress={() => setNotifyAudience('BOOKMARKED')}
                  >
                    <Ionicons name="bookmark" size={16} color={notifyAudience === 'BOOKMARKED' ? '#FFF' : '#6B7280'} />
                    <Text style={[styles.audienceText, notifyAudience === 'BOOKMARKED' && styles.audienceTextActive]}>Bookmarked</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.audienceChip, notifyAudience === 'INTERESTED' && styles.audienceChipActive]}
                    onPress={() => setNotifyAudience('INTERESTED')}
                  >
                    <Ionicons name="people" size={16} color={notifyAudience === 'INTERESTED' ? '#FFF' : '#6B7280'} />
                    <Text style={[styles.audienceText, notifyAudience === 'INTERESTED' && styles.audienceTextActive]}>Interested Users</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.audienceSubtext}>
                  {notifyAudience === 'BOOKMARKED'
                    ? 'Only users who saved this exam.'
                    : 'Saved users + those with matching category/level preferences.'}
                </Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Update Type</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.typeSelectorScroll}>
                  {[
                    { id: 'CUSTOM', label: 'Custom', icon: 'create-outline' },
                    { id: 'RESULT', label: 'Result', icon: 'trophy-outline' },
                    { id: 'ADMIT_CARD', label: 'Admit Card', icon: 'card-outline' },
                    { id: 'REGISTRATION', label: 'Apply', icon: 'document-text-outline' },
                    { id: 'EXAM_DATE', label: 'Dates', icon: 'calendar-outline' },
                  ].map((t) => (
                    <TouchableOpacity
                      key={t.id}
                      style={[styles.typeChip, notifyType === t.id && styles.typeChipActive]}
                      onPress={() => handleTypeSelect(t.id as any)}
                    >
                      <Ionicons name={t.icon as any} size={16} color={notifyType === t.id ? '#FFF' : '#6B7280'} />
                      <Text style={[styles.typeChipText, notifyType === t.id && styles.typeChipTextActive]}>{t.label}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Title</Text>
                <TextInput
                  style={styles.input}
                  placeholder={`Default: Update: ${exam.shortTitle}`}
                  value={notifyTitle}
                  onChangeText={setNotifyTitle}
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Message Body (Optional)</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Write your custom message here..."
                  value={notifyBody}
                  onChangeText={setNotifyBody}
                  multiline
                  numberOfLines={4}
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.warningBox}>
                <Ionicons name="alert-circle" size={20} color="#D97706" />
                <Text style={styles.warningText}>
                  This will be sent to all users who have bookmarked this exam.
                </Text>
              </View>

              <TouchableOpacity
                style={styles.sendButton}
                onPress={handleSendNotification}
                disabled={notifying}
              >
                <LinearGradient
                  colors={['#6366F1', '#4F46E5']}
                  style={styles.sendButtonGradient}
                >
                  {notifying ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <>
                      <Ionicons name="send" size={18} color="#FFF" />
                      <Text style={styles.sendButtonText}>Send Notification Now</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const InfoItem = ({ label, value, fullWidth }: { label: string; value: string; fullWidth?: boolean }) => (
  <View style={[styles.infoItem, fullWidth && { width: '100%' }]}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue} numberOfLines={1}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  scrollContent: {
    flexGrow: 1,
  },
  topHeader: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 40,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerActionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  examTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFF',
    marginBottom: 12,
  },
  badgeContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  mainContent: {
    paddingHorizontal: 20,
    marginTop: -20,
    paddingBottom: 40,
  },
  notifyBanner: {
    marginBottom: 20,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  notifyBannerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 24,
    position: 'relative',
  },
  notifyLeftDecoration: {
    position: 'absolute',
    left: -20,
    top: -20,
  },
  megaphoneIcon: {
    transform: [{ rotate: '-15deg' }],
  },
  notifyContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    zIndex: 1,
  },
  notifyIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notifyTitleText: {
    color: '#FFF',
    fontWeight: '900',
    fontSize: 18,
    letterSpacing: 0.5,
  },
  notifySubtitleText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    marginTop: 2,
  },
  notifyRightAction: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  sectionHeaderInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1F2937',
  },
  sectionTitleMain: {
    fontSize: 20,
    fontWeight: '900',
    color: '#111827',
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
  },
  infoItem: {
    width: '46%',
  },
  infoLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '700',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 15,
    color: '#374151',
    fontWeight: '600',
  },
  descriptionContainer: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  descriptionText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 22,
  },
  addEventButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  addEventGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 4,
  },
  addEventText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
  },
  timelineCard: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 3,
  },
  emptyTimeline: {
    padding: 40,
    alignItems: 'center',
  },
  emptyTimelineText: {
    color: '#9CA3AF',
    fontSize: 16,
    marginTop: 12,
    fontWeight: '500',
  },
  createFirstText: {
    color: '#4F46E5',
    fontWeight: '700',
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingBottom: 40,
    maxHeight: '90%',
  },
  modalIndicator: {
    width: 40,
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    alignSelf: 'center',
    marginTop: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingTop: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#111827',
  },
  modalBody: {
    padding: 24,
    gap: 8,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#374151',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    padding: 20,
    fontSize: 16,
    color: '#111827',
    borderWidth: 1.5,
    borderColor: '#F3F4F6',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: '#FEF3C7',
    padding: 20,
    borderRadius: 20,
    gap: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  warningText: {
    flex: 1,
    color: '#92400E',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  sendButton: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  sendButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 12,
  },
  sendButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  typeSelectorScroll: {
    gap: 10,
    paddingVertical: 4,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  typeChipActive: {
    backgroundColor: '#6366F1',
    borderColor: '#4F46E5',
  },
  typeChipText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6B7280',
  },
  typeChipTextActive: {
    color: '#FFF',
  },
  audienceSelector: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  audienceChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  audienceChipActive: {
    backgroundColor: '#6366F1',
    borderColor: '#4F46E5',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  audienceText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#6B7280',
  },
  audienceTextActive: {
    color: '#FFF',
  },
  audienceSubtext: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
    marginLeft: 4,
  },
});
