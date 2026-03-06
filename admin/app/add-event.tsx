import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Switch,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { lifecycleService } from '@/services/api.service';
import { LifecycleEventType, LifecycleStage } from '@/constants/enums';

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
};

const EVENT_TYPES = Object.values(LifecycleEventType);
const STAGES = Object.values(LifecycleStage);

export default function AddEventScreen() {
  const router = useRouter();
  const { examId, examTitle, eventId } = useLocalSearchParams<{
    examId: string;
    examTitle: string;
    eventId?: string;
  }>();

  const isEdit = !!eventId;
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

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
    }
  });

  const isTBD = watch('isTBD');
  const eventType = watch('eventType');
  const stage = watch('stage');

  const fetchEventData = useCallback(async () => {
    if (!isEdit || !examId || !eventId) return;
    try {
      setFetching(true);
      const res = await lifecycleService.getEventsByExamId(examId);
      const events = res.data?.events || (Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : []));
      const event = events.find((e: any) => e.id === eventId);

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
        });
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to fetch event data');
    } finally {
      setFetching(false);
    }
  }, [isEdit, examId, eventId, reset]);

  useEffect(() => {
    fetchEventData();
  }, [fetchEventData]);

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
      };

      if (isEdit) {
        await lifecycleService.updateEvent(examId, eventId as string, payload);
        Alert.alert('Success', 'Event updated successfully');
      } else {
        await lifecycleService.addEvent(examId, payload);
        Alert.alert('Success', 'Event added successfully');
      }
      router.back();
    } catch (err: any) {
      console.error(err);
      let errorMsg = `Failed to ${isEdit ? 'update' : 'add'} event`;
      if (err.response?.data?.errors) {
        errorMsg = typeof err.response.data.errors === 'string'
          ? err.response.data.errors
          : Object.values(err.response.data.errors).join('\n');
      } else if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      }
      Alert.alert('Validation Error', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={{ marginTop: 12, fontWeight: '600', color: '#666' }}>Loading event data...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Stack.Screen options={{
          title: isEdit ? 'Edit Event' : 'Add Lifecycle Event',
          headerTitleStyle: { fontWeight: '800' }
        }} />

        <View style={styles.headerInfo}>
          <Text style={styles.examSubtitle}>{isEdit ? 'Editing event for:' : 'Adding event for:'}</Text>
          <Text style={styles.examTitle}>{examTitle}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Event Details</Text>

          <Text style={styles.label}>Lifecycle Stage *</Text>
          <Controller
            control={control}
            name="stage"
            render={({ field: { onChange, value } }) => (
              <View style={styles.categoryContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
                  {STAGES.map(s => (
                    <TouchableOpacity
                      key={s}
                      style={[styles.smallChip, value === s && styles.smallChipActive]}
                      onPress={() => onChange(s)}
                    >
                      <Text style={[styles.smallChipText, value === s && styles.smallChipTextActive]}>
                        {s.replace(/_/g, ' ')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          />

          <Text style={styles.label}>Event Type *</Text>
          <Controller
            control={control}
            rules={{ required: true }}
            name="eventType"
            render={({ field: { onChange, value } }) => (
              <View style={styles.categoryContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
                  {EVENT_TYPES.map(type => (
                    <TouchableOpacity
                      key={type}
                      style={[styles.categoryChip, value === type && styles.categoryChipActive]}
                      onPress={() => onChange(type)}
                    >
                      <Text style={[styles.categoryChipText, value === type && styles.categoryChipTextActive]}>
                        {type.replace(/_/g, ' ')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          />

          <Text style={styles.label}>Display Title *</Text>
          <Controller
            control={control}
            rules={{ required: true }}
            name="title"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={styles.input}
                placeholder={stage === LifecycleStage.REGISTRATION ? 'Registration Window' : 'e.g. Admit Card Released'}
                onChangeText={onChange}
                value={value}
              />
            )}
          />

          <View style={styles.switchRow}>
            <View>
              <Text style={styles.switchTitle}>To Be Decided (TBD)</Text>
              <Text style={styles.switchSubtitle}>Dates are not yet announced</Text>
            </View>
            <Controller
              control={control}
              name="isTBD"
              render={({ field: { onChange, value } }) => (
                <Switch value={value} onValueChange={onChange} />
              )}
            />
          </View>

          <View style={styles.switchRow}>
            <View>
              <Text style={styles.switchTitle}>Important Event</Text>
              <Text style={styles.switchSubtitle}>Higher priority in timeline</Text>
            </View>
            <Controller
              control={control}
              name="isImportant"
              render={({ field: { onChange, value } }) => (
                <Switch value={value} onValueChange={onChange} />
              )}
            />
          </View>

          {!isTBD && (
            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.label}>Start Date *</Text>
                <Controller
                  control={control}
                  name="startsAt"
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      style={styles.input}
                      placeholder="YYYY-MM-DDTHH:mm"
                      onChangeText={onChange}
                      value={value}
                    />
                  )}
                />
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={styles.label}>End Date (Optional)</Text>
                <Controller
                  control={control}
                  name="endsAt"
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      style={styles.input}
                      placeholder="YYYY-MM-DDTHH:mm"
                      onChangeText={onChange}
                      value={value}
                    />
                  )}
                />
              </View>
            </View>
          )}

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.label}>Action Label</Text>
              <Controller
                control={control}
                name="actionLabel"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. Apply Now"
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
            </View>
            <View style={{ flex: 2 }}>
              <Text style={styles.label}>Action URL</Text>
              <Controller
                control={control}
                name="actionUrl"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={styles.input}
                    placeholder="https://..."
                    onChangeText={onChange}
                    value={value}
                    autoCapitalize="none"
                    keyboardType="url"
                  />
                )}
              />
            </View>
          </View>

          <Text style={styles.label}>Description</Text>
          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Additional details..."
                multiline
                numberOfLines={4}
                onChangeText={onChange}
                value={value}
              />
            )}
          />
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.disabledButton]}
          onPress={handleSubmit(onSubmit)}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.submitButtonText}>{isEdit ? 'Update Event' : 'Schedule Event'}</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  headerInfo: {
    marginBottom: 20,
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 20,
    borderLeftWidth: 6,
    borderLeftColor: '#2196F3',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  examSubtitle: {
    fontSize: 10,
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    fontWeight: '800',
  },
  examTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1A1A1A',
    marginTop: 6,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
    paddingLeft: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#444',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#1A1A1A',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  categoryContainer: {
    marginVertical: 4,
  },
  categoryScroll: {
    gap: 10,
    paddingRight: 16,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  categoryChipActive: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  categoryChipText: {
    fontSize: 12,
    color: '#4B5563',
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  categoryChipTextActive: {
    color: '#FFF',
  },
  smallChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  smallChipActive: {
    backgroundColor: '#EEF6FF',
    borderColor: '#2196F3',
  },
  smallChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'capitalize',
  },
  smallChipTextActive: {
    color: '#2196F3',
  },
  row: {
    flexDirection: 'row',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  switchTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  switchSubtitle: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },
  submitButton: {
    backgroundColor: '#2196F3',
    borderRadius: 18,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  disabledButton: {
    backgroundColor: '#93C5FD',
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
