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
  LifecycleStage, 
  LIFECYCLE_STAGES, 
  STAGE_ORDER_MAP 
} from '@/constants/enums';

type EventFormValues = {
  stage: LifecycleStage;
  title: string;
  description: string;
  startsAt: string;
  endsAt: string;
  isTBD: boolean;
  actionUrl: string;
  actionLabel: string;
  stageOrder: string;
};

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

  const { control, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<EventFormValues>({
    defaultValues: {
      stage: LifecycleStage.NOTIFICATION,
      isTBD: false,
      startsAt: new Date().toISOString().slice(0, 16),
      endsAt: '',
      actionLabel: 'View Notification',
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
          description: event.description || '',
          startsAt: event.startsAt ? new Date(event.startsAt).toISOString().slice(0, 16) : '',
          endsAt: event.endsAt ? new Date(event.endsAt).toISOString().slice(0, 16) : '',
          isTBD: event.isTBD,
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

  // Auto-suggest action label based on stage & eventType
  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === 'stage') {
        const { DEFAULT_ACTION_LABELS } = require('@/constants/enums');
        const suggested = DEFAULT_ACTION_LABELS[value.stage as string] || '';
        
        if (suggested && !isEdit) {
          setValue('actionLabel', suggested);
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, setValue, isEdit]);

  const onSubmit = async (data: EventFormValues) => {
    if (!examId) return;
    try {
      setLoading(true);
      const payload = {
        stage: data.stage,
        title: data.title?.trim(),
        description: data.description?.trim() || null,
        startsAt: data.isTBD || !data.startsAt ? null : new Date(data.startsAt).toISOString(),
        endsAt: data.isTBD || !data.endsAt ? null : new Date(data.endsAt).toISOString(),
        isTBD: data.isTBD,
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
        <View style={styles.floatingHeader}>
            <LinearGradient colors={['#0f172a', '#1e293b']} style={styles.headerGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <TouchableOpacity onPress={() => router.back()} style={styles.headerBackBtn}>
                <Ionicons name="arrow-back" size={20} color="#cbd5e1" />
              </TouchableOpacity>
              <View style={styles.headerTitles}>
                 <Text style={styles.headerTitleTiny}>{isEdit ? 'Update Schedule' : 'Schedule Event'}</Text>
                 <Text style={styles.headerTitleMain} numberOfLines={1}>{examTitle}</Text>
              </View>
            </LinearGradient>
        </View>

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>

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
  safe: { flex: 1, backgroundColor: '#f8fafc' },
  container: { flex: 1 },
  content: { padding: 16, paddingTop: 120, paddingBottom: 60 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: '#3b82f6', fontWeight: '700' },
  
  floatingHeader: {
    position: 'absolute',
    top: 50, left: 16, right: 16,
    zIndex: 100,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 15, elevation: 12,
  },
  headerGradient: {
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerBackBtn: {
    width: 36, height: 36, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center', alignItems: 'center',
  },
  headerTitles: { flex: 1 },
  headerTitleTiny: { fontSize: 10, fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 },
  headerTitleMain: { fontSize: 16, fontWeight: '800', color: '#f8fafc' },

  card: { backgroundColor: '#FFF', borderRadius: 24, padding: 20, marginBottom: 16, shadowColor: '#64748b', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2, borderWidth: 1, borderColor: '#f1f5f9' },
  sectionTitle: { fontSize: 11, fontWeight: '900', color: '#64748b', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 16 },
  label: { fontSize: 12, fontWeight: '800', color: '#475569', marginBottom: 8, marginTop: 12 },
  chipScroll: { gap: 8, paddingBottom: 4 },
  chip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, backgroundColor: '#f1f5f9', borderWidth: 1, borderColor: '#f1f5f9' },
  chipActive: { backgroundColor: '#eff6ff', borderColor: '#3b82f6' },
  chipText: { fontSize: 12, fontWeight: '700', color: '#64748b' },
  chipTextActive: { color: '#3b82f6' },
  input: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#f1f5f9', borderRadius: 12, padding: 16, fontSize: 15, color: '#1e293b', fontWeight: '600' },
  
  switchBox: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  switchInfo: { flex: 1 },
  switchTitle: { fontSize: 15, fontWeight: '700', color: '#1e293b' },
  switchSubtitle: { fontSize: 11, color: '#94a3b8', marginTop: 2 },
  
  row: { flexDirection: 'row', gap: 12 },
  dateBtn: { flex: 1, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#f1f5f9', borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 8 },
  dateText: { fontSize: 13, fontWeight: '700', color: '#334155' },
  
  btnWrapper: { borderRadius: 20, overflow: 'hidden', marginTop: 10, elevation: 8, shadowColor: '#3b82f6', shadowOpacity: 0.3, shadowRadius: 15 },
  btnGradient: { padding: 20, alignItems: 'center' },
  btnText: { color: '#FFF', fontSize: 16, fontWeight: '900', letterSpacing: 1 },
});
