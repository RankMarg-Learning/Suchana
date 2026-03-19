import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity,
  Alert, ActivityIndicator, Switch, KeyboardAvoidingView, Platform, SafeAreaView, StatusBar
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { lifecycleService, scraperService } from '@/services/api.service';
import { 
  LifecycleEventType, 
  LIFECYCLE_EVENT_TYPES, 
  LifecycleStage, 
  LIFECYCLE_STAGES, 
  STAGE_ORDER_MAP 
} from '@/constants/enums';

type EventFormValues = {
  eventType: LifecycleEventType;
  stage: LifecycleStage;
  title: string;
  description: string;
  startsAt: string;
  endsAt: string;
  isTBD: boolean;
  isImportant: boolean;
  actionUrl: string;
  actionLabel: string;
  stageOrder: string;
};

const EVENT_TYPES = LIFECYCLE_EVENT_TYPES;
const STAGES = LIFECYCLE_STAGES;

export default function AddEventScreen() {
  const router = useRouter();
  const { examId, examTitle, eventId, isStaged } = useLocalSearchParams<{
    examId: string;
    examTitle: string;
    eventId?: string;
    isStaged?: string;
  }>();

  const isStagedExam = isStaged === 'true';

  const isEdit = !!eventId;
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [startPickerMode, setStartPickerMode] = useState<'date' | 'time'>('date');

  const [showEndPicker, setShowEndPicker] = useState(false);
  const [endPickerMode, setEndPickerMode] = useState<'date' | 'time'>('date');

  const { control, handleSubmit, reset, watch, formState: { errors } } = useForm<EventFormValues>({
    defaultValues: {
      eventType: LifecycleEventType.OTHER,
      stage: LifecycleStage.NOTIFICATION,
      isImportant: false,
      isTBD: false,
      startsAt: new Date().toISOString().slice(0, 16),
      endsAt: '',
      actionLabel: 'Apply Now',
      title: '',
      description: '',
      actionUrl: '',
      stageOrder: '0',
    }
  });

  const isTBD = watch('isTBD');
  const stage = watch('stage');

  const fetchEventData = useCallback(async () => {
    if (!isEdit || !examId || !eventId) return;
    try {
      setFetching(true);
      let event;
      if (isStagedExam) {
        const res = await scraperService.getStagedExam(examId);
        const stagedExam = res.data;
        event = stagedExam.stagedEvents?.find((e: any) => e.id === eventId);
      } else {
        const res = await lifecycleService.getEventsByExamId(examId);
        const data = res.data;
        const events = data?.events || (Array.isArray(data) ? data : []);
        event = events.find((e: any) => e.id === eventId);
      }

      if (event) {
        reset({
          title: event.title,
          stage: event.stage as LifecycleStage,
          eventType: event.eventType as LifecycleEventType,
          description: event.description || '',
          startsAt: event.startsAt ? new Date(event.startsAt).toISOString().slice(0, 16) : '',
          endsAt: event.endsAt ? new Date(event.endsAt).toISOString().slice(0, 16) : '',
          isTBD: event.isTBD,
          isImportant: event.isImportant || false,
          actionUrl: event.actionUrl || '',
          actionLabel: event.actionLabel || 'Apply Now',
          stageOrder: event.stageOrder?.toString() || '0',
        });
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to fetch event data');
    } finally {
      setFetching(false);
    }
  }, [isEdit, examId, eventId, reset]);

  useEffect(() => { fetchEventData(); }, [fetchEventData]);

  const onSubmit = async (data: EventFormValues) => {
    if (!examId) return;
    try {
      setLoading(true);
      const payload = {
        stage: data.stage,
        eventType: data.eventType,
        title: data.title?.trim(),
        description: data.description?.trim() || null,
        startsAt: data.isTBD || !data.startsAt ? null : new Date(data.startsAt).toISOString(),
        endsAt: data.isTBD || !data.endsAt ? null : new Date(data.endsAt).toISOString(),
        isTBD: data.isTBD,
        isImportant: data.isImportant,
        actionUrl: data.actionUrl?.trim() || null,
        actionLabel: data.actionLabel?.trim() || null,
        stageOrder: data.stageOrder ? parseInt(data.stageOrder, 10) : (STAGE_ORDER_MAP[data.stage] || 0),
      };

      if (isEdit) {
        if (isStagedExam) {
          await scraperService.updateStagedEvent(examId, eventId as string, payload);
        } else {
          await lifecycleService.updateEvent(examId, eventId as string, payload);
        }
        Alert.alert('Success', 'Event updated successfully');
      } else {
        if (isStagedExam) {
          await scraperService.addStagedEvent(examId, payload);
        } else {
          await lifecycleService.addEvent(examId, payload);
        }
        Alert.alert('Success', 'Event scheduled successfully');
      }
      router.back();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to save event');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>Syncing event data…</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <LinearGradient colors={['#4F46E5', '#3730A3']} style={styles.header}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{isEdit ? 'Edit Schedule' : 'Schedule Event'}</Text>
          </View>
          <View style={styles.examCard}>
            <Text style={styles.examLabel}>{isEdit ? 'UPDATING EVENT FOR' : 'ADDING EVENT FOR'}</Text>
            <Text style={styles.examTitleText} numberOfLines={1}>{examTitle}</Text>
          </View>
        </LinearGradient>

        <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Event Classification</Text>

            <Text style={styles.label}>Lifecycle Stage *</Text>
            <Controller
              control={control}
              name="stage"
              render={({ field: { onChange, value } }) => (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScroll}>
                  {STAGES.map(s => (
                    <TouchableOpacity
                      key={s}
                      style={[styles.chip, value === s && styles.chipActive]}
                      onPress={() => onChange(s)}
                    >
                      <Text style={[styles.chipText, value === s && styles.chipTextActive]}>
                        {s.replace(/_/g, ' ')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            />

            <Text style={styles.label}>Event Type *</Text>
            <Controller
              control={control}
              name="eventType"
              render={({ field: { onChange, value } }) => (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScroll}>
                  {EVENT_TYPES.map(type => (
                    <TouchableOpacity
                      key={type}
                      style={[styles.chip, value === type && styles.chipActive]}
                      onPress={() => onChange(type)}
                    >
                      <Text style={[styles.chipText, value === type && styles.chipTextActive]}>
                        {type.replace(/_/g, ' ')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            />

            <Text style={styles.label}>Title *</Text>
            <Controller
              control={control}
              rules={{ required: true }}
              name="title"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Online Registration Starts"
                  placeholderTextColor="#9CA3AF"
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Timing & Settings</Text>

            <View style={styles.switchBox}>
              <View style={styles.switchInfo}>
                <Text style={styles.switchTitle}>To Be Decided</Text>
                <Text style={styles.switchSubtitle}>Dates are currently unknown</Text>
              </View>
              <Controller
                control={control}
                name="isTBD"
                render={({ field: { onChange, value } }) => (
                  <Switch value={value} onValueChange={onChange} trackColor={{ true: '#818CF8' }} thumbColor={value ? '#4F46E5' : '#F3F4F6'} />
                )}
              />
            </View>

            <View style={styles.switchBox}>
              <View style={styles.switchInfo}>
                <Text style={styles.switchTitle}>Star Mark</Text>
                <Text style={styles.switchSubtitle}>Highlight in the timeline</Text>
              </View>
              <Controller
                control={control}
                name="isImportant"
                render={({ field: { onChange, value } }) => (
                  <Switch value={value} onValueChange={onChange} trackColor={{ true: '#FCD34D' }} thumbColor={value ? '#F59E0B' : '#F3F4F6'} />
                )}
              />
            </View>

            {!isTBD && (
              <View style={styles.row}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.label}>Starts At</Text>
                  <Controller
                    control={control}
                    name="startsAt"
                    render={({ field: { onChange, value } }) => (
                      <TouchableOpacity style={styles.dateBtn} onPress={() => { setStartPickerMode('date'); setShowStartPicker(true); }}>
                        <Ionicons name="calendar-outline" size={18} color="#4F46E5" />
                        <Text style={styles.dateText}>{value ? format(new Date(value), 'MMM d, yy • HH:mm') : 'Set Date'}</Text>
                        {showStartPicker && (
                          <DateTimePicker
                            value={value ? new Date(value) : new Date()}
                            mode={startPickerMode}
                            onChange={(e, d) => {
                              if (e.type === 'dismissed') { setShowStartPicker(false); return; }
                              if (Platform.OS === 'android' && startPickerMode === 'date') {
                                setShowStartPicker(false);
                                onChange(d!.toISOString().slice(0, 16));
                                setTimeout(() => { setStartPickerMode('time'); setShowStartPicker(true); }, 100);
                              } else {
                                setShowStartPicker(false);
                                onChange(d!.toISOString().slice(0, 16));
                              }
                            }}
                          />
                        )}
                      </TouchableOpacity>
                    )}
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={styles.label}>Ends At</Text>
                  <Controller
                    control={control}
                    name="endsAt"
                    render={({ field: { onChange, value } }) => (
                      <TouchableOpacity style={styles.dateBtn} onPress={() => { setEndPickerMode('date'); setShowEndPicker(true); }}>
                        <Ionicons name="time-outline" size={18} color="#6B7280" />
                        <Text style={styles.dateText}>{value ? format(new Date(value), 'MMM d, yy • HH:mm') : 'Optional'}</Text>
                        {showEndPicker && (
                          <DateTimePicker
                            value={value ? new Date(value) : new Date()}
                            mode={endPickerMode}
                            onChange={(e, d) => {
                              if (e.type === 'dismissed') { setShowEndPicker(false); return; }
                              if (Platform.OS === 'android' && endPickerMode === 'date') {
                                setShowEndPicker(false);
                                onChange(d!.toISOString().slice(0, 16));
                                setTimeout(() => { setEndPickerMode('time'); setShowEndPicker(true); }, 100);
                              } else {
                                setShowEndPicker(false);
                                onChange(d!.toISOString().slice(0, 16));
                              }
                            }}
                          />
                        )}
                      </TouchableOpacity>
                    )}
                  />
                </View>
              </View>
            )}
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Action Link</Text>
            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.label}>Button Text</Text>
                <Controller
                  control={control}
                  name="actionLabel"
                  render={({ field: { onChange, value } }) => (
                    <TextInput style={styles.input} placeholder="Apply now" placeholderTextColor="#9CA3AF" onChangeText={onChange} value={value} />
                  )}
                />
              </View>
              <View style={{ flex: 2 }}>
                <Text style={styles.label}>Direct URL</Text>
                <Controller
                  control={control}
                  name="actionUrl"
                  render={({ field: { onChange, value } }) => (
                    <TextInput style={styles.input} placeholder="https://…" placeholderTextColor="#9CA3AF" onChangeText={onChange} value={value} autoCapitalize="none" keyboardType="url" />
                  )}
                />
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.btnWrapper} onPress={handleSubmit(onSubmit)} disabled={loading}>
            <LinearGradient colors={['#4F46E5', '#3730A3']} style={styles.btnGradient}>
              {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.btnText}>{isEdit ? 'Save Changes' : 'Schedule Now'}</Text>}
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFF' },
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  content: { padding: 20, paddingBottom: 60 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: '#4F46E5', fontWeight: '700' },
  
  header: { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 32, borderBottomLeftRadius: 36, borderBottomRightRadius: 36 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 20 },
  headerTitle: { fontSize: 22, fontWeight: '900', color: '#FFF' },
  backBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  
  examCard: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 20, padding: 16 },
  examLabel: { fontSize: 9, fontWeight: '900', color: 'rgba(255,255,255,0.7)', letterSpacing: 1.2, marginBottom: 4 },
  examTitleText: { fontSize: 16, fontWeight: '800', color: '#FFF' },

  card: { backgroundColor: '#FFF', borderRadius: 24, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 4 },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '700', color: '#4B5563', marginBottom: 8, marginTop: 12 },
  chipScroll: { gap: 8, paddingBottom: 4 },
  chip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#F3F4F6' },
  chipActive: { backgroundColor: '#EEF2FF', borderColor: '#4F46E5' },
  chipText: { fontSize: 12, fontWeight: '700', color: '#6B7280' },
  chipTextActive: { color: '#4F46E5' },
  input: { backgroundColor: '#F9FAFB', borderWidth: 1.5, borderColor: '#F3F4F6', borderRadius: 12, padding: 16, fontSize: 15, color: '#111827' },
  
  switchBox: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  switchInfo: { flex: 1 },
  switchTitle: { fontSize: 15, fontWeight: '700', color: '#1F2937' },
  switchSubtitle: { fontSize: 11, color: '#9CA3AF' },
  
  row: { flexDirection: 'row' },
  dateBtn: { backgroundColor: '#F9FAFB', borderWidth: 1.5, borderColor: '#F3F4F6', borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 8 },
  dateText: { fontSize: 13, fontWeight: '700', color: '#374151' },
  
  btnWrapper: { borderRadius: 20, overflow: 'hidden', marginTop: 10, elevation: 8, shadowColor: '#4F46E5', shadowOpacity: 0.2, shadowRadius: 12 },
  btnGradient: { padding: 20, alignItems: 'center' },
  btnText: { color: '#FFF', fontSize: 16, fontWeight: '900', letterSpacing: 0.5 },
});
