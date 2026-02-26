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
import { LifecycleEventType } from '@/constants/enums';

type EventFormValues = {
  eventType: LifecycleEventType;
  stage: string;
  title: string;
  description: string;
  startsAt: string;
  endsAt: string;
  isTBD: boolean;
  actionUrl: string;
  actionLabel: string;
  isConfirmed: boolean;
};

const EVENT_TYPES = Object.values(LifecycleEventType);

const COMMON_STAGES = ['PRELIMS', 'MAINS', 'TIER 1', 'TIER 2', 'PAPER 1', 'PAPER 2', 'INTERVIEW', 'FINAL'];

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
  
  const { control, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<EventFormValues>({
    defaultValues: {
      eventType: 'OTHER',
      stage: '',
      isConfirmed: true,
      isTBD: false,
      startsAt: new Date().toISOString().slice(0, 16),
      endsAt: '',
      actionLabel: 'Apply Now',
    }
  });

  const isTBD = watch('isTBD');
  const eventType = watch('eventType');

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
          stage: event.stage || '',
          eventType: event.eventType,
          description: event.description || '',
          startsAt: event.startsAt ? new Date(event.startsAt).toISOString().slice(0, 16) : '',
          endsAt: event.endsAt ? new Date(event.endsAt).toISOString().slice(0, 16) : '',
          isTBD: event.isTBD,
          actionUrl: event.actionUrl || '',
          actionLabel: event.actionLabel || 'Apply Now',
          isConfirmed: event.isConfirmed,
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
        stage: data.stage?.trim() || null,
        eventType: data.eventType,
        title: data.title?.trim(),
        description: data.description?.trim() || null,
        startsAt: data.isTBD || !data.startsAt ? null : new Date(data.startsAt).toISOString(),
        endsAt: data.isTBD || !data.endsAt ? null : new Date(data.endsAt).toISOString(),
        isTBD: data.isTBD,
        actionUrl: data.actionUrl?.trim() || null,
        actionLabel: data.actionLabel?.trim() || null,
        isConfirmed: data.isConfirmed,
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
        <Text style={{ marginTop: 12 }}>Loading event data...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Stack.Screen options={{ title: isEdit ? 'Edit Event' : 'Add Lifecycle Event' }} />

        <View style={styles.headerInfo}>
          <Text style={styles.examSubtitle}>{isEdit ? 'Editing event for:' : 'Adding event for:'}</Text>
          <Text style={styles.examTitle}>{examTitle}</Text>
        </View>

        <View style={styles.card}>
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

          <Text style={styles.label}>Target Stage (e.g. PRELIMS) *</Text>
          <Controller
            control={control}
            name="stage"
            render={({ field: { onChange, value } }) => (
              <View>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. MAINS, TIER 1..."
                  onChangeText={onChange}
                  value={value}
                  autoCapitalize="characters"
                />
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
                  {COMMON_STAGES.map(s => (
                    <TouchableOpacity 
                      key={s} 
                      onPress={() => onChange(s)}
                      style={[styles.smallChip, value === s && styles.smallChipActive]}
                    >
                      <Text style={[styles.smallChipText, value === s && styles.smallChipTextActive]}>{s}</Text>
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
                placeholder={eventType === 'REGISTRATION' ? 'Registration Window' : 'e.g. Apply Now'}
                onChangeText={onChange}
                value={value}
              />
            )}
          />

          <View style={styles.switchRow}>
            <View>
              <Text style={styles.label}>To Be Decided (TBD)</Text>
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

          <View style={styles.switchRow}>
            <View>
              <Text style={styles.cardTitle}>Confirmed Status</Text>
              <Text style={styles.switchSubtitle}>Toggle off for tentative dates</Text>
            </View>
            <Controller
              control={control}
              name="isConfirmed"
              render={({ field: { onChange, value } }) => (
                <Switch value={value} onValueChange={onChange} />
              )}
            />
          </View>
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
    backgroundColor: '#F8F9FA',
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
    padding: 16,
    borderRadius: 20,
    borderLeftWidth: 6,
    borderLeftColor: '#2196F3',
  },
  examSubtitle: {
    fontSize: 10,
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '700',
  },
  examTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A1A1A',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#444',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#F9F9F9',
    borderWidth: 1,
    borderColor: '#EEE',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  categoryContainer: {
    marginVertical: 4,
  },
  categoryScroll: {
    gap: 10,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#EEE',
  },
  categoryChipActive: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  categoryChipText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  categoryChipTextActive: {
    color: '#FFF',
  },
  smallChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
    marginRight: 8,
  },
  smallChipActive: {
    backgroundColor: '#E3F2FD',
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  smallChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666',
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
    marginTop: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  switchSubtitle: {
    fontSize: 11,
    color: '#999',
  },
  submitButton: {
    backgroundColor: '#2196F3',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#BBDEFB',
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
