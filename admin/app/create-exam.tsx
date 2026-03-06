import React, { useState, useEffect } from 'react';
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
import { examService } from '@/services/api.service';
import { Ionicons } from '@expo/vector-icons';
import { ExamCategory, ExamLevel, ExamStatus, QualificationLevel } from '@/constants/enums';

type ExamFormValues = {
  title: string;
  shortTitle: string;
  conductingBody: string;
  category: ExamCategory;
  examLevel: ExamLevel;
  state: string;
  description: string;
  minAge: string;
  maxAge: string;
  qualificationLevel: QualificationLevel;
  totalVacancies: string;
  officialWebsite: string;
  notificationUrl: string;
  isPublished: boolean;
  status: ExamStatus;
};

const CATEGORIES = Object.values(ExamCategory);
const LEVELS = Object.values(ExamLevel);
const QUALIFICATIONS = [
  { label: '10th Pass', value: QualificationLevel.TEN_PASS },
  { label: '12th Pass', value: QualificationLevel.TWELVE_PASS },
  { label: 'Graduate', value: QualificationLevel.GRADUATE },
  { label: 'Post Graduate', value: QualificationLevel.POST_GRADUATE },
  { label: 'PhD', value: QualificationLevel.PHD },
  { label: 'Other', value: QualificationLevel.OTHER }
];

const STATUSES = Object.values(ExamStatus);

export default function CreateExamScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const isEdit = !!id;
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);

  const { control, handleSubmit, reset, watch, formState: { errors } } = useForm<ExamFormValues>({
    defaultValues: {
      category: ExamCategory.OTHER,
      examLevel: ExamLevel.NATIONAL,
      status: ExamStatus.UPCOMING,
      state: '',
      isPublished: true,
      title: '',
      shortTitle: '',
      conductingBody: '',
      description: '',
      minAge: '',
      maxAge: '',
      qualificationLevel: QualificationLevel.GRADUATE,
      totalVacancies: '',
      officialWebsite: '',
      notificationUrl: '',
    }
  });

  const selectedLevel = watch('examLevel');

  useEffect(() => {
    if (isEdit) {
      fetchExamDetails();
    }
  }, [id]);

  const fetchExamDetails = async () => {
    try {
      setFetching(true);
      const response = await examService.getExamById(id as string);
      const data = response.data || response;
      reset({
        ...data,
        examLevel: data.examLevel || ExamLevel.NATIONAL,
        category: data.category || ExamCategory.OTHER,
        status: data.status || ExamStatus.UPCOMING,
        state: data.state || '',
        minAge: data.minAge?.toString() || '',
        maxAge: data.maxAge?.toString() || '',
        totalVacancies: data.totalVacancies?.toString() || '',
        officialWebsite: data.officialWebsite || '',
        notificationUrl: data.notificationUrl || '',
        qualificationLevel: data.qualificationCriteria?.level || QualificationLevel.GRADUATE,
      });
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to fetch exam details');
    } finally {
      setFetching(false);
    }
  };

  const onSubmit = async (data: ExamFormValues) => {
    try {
      setLoading(true);
      const payload = {
        title: data.title?.trim(),
        shortTitle: data.shortTitle?.trim(),
        conductingBody: data.conductingBody?.trim(),
        category: data.category,
        examLevel: data.examLevel,
        status: data.status,
        state: data.examLevel === ExamLevel.STATE ? data.state?.trim() : null,
        minAge: data.minAge ? parseInt(data.minAge, 10) : null,
        maxAge: data.maxAge ? parseInt(data.maxAge, 10) : null,
        qualificationCriteria: {
          level: data.qualificationLevel
        },
        totalVacancies: data.totalVacancies ? parseInt(data.totalVacancies, 10) : null,
        officialWebsite: data.officialWebsite?.trim() || null,
        notificationUrl: data.notificationUrl?.trim() || null,
        description: data.description?.trim() || null,
        isPublished: data.isPublished,
      };

      if (isEdit) {
        await examService.updateExam(id as string, payload);
        Alert.alert('Success', 'Exam updated successfully');
      } else {
        await examService.createExam(payload);
        Alert.alert('Success', 'Exam created successfully');
      }
      router.back();
    } catch (err: any) {
      console.error(err);
      let errorMsg = `Failed to ${isEdit ? 'update' : 'create'} exam`;
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
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Fetching details...</Text>
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
          title: isEdit ? 'Edit Exam' : 'Create New Exam',
          headerTitleStyle: { fontWeight: '800' }
        }} />

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Basic Information</Text>

          <Text style={styles.label}>Full Exam Title *</Text>
          <Controller
            control={control}
            rules={{ required: 'Title is required', minLength: 5 }}
            name="title"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[styles.input, errors.title && styles.inputError]}
                placeholder="e.g. UPSC Civil Services 2025"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            )}
          />
          {errors.title && <Text style={styles.errorText}>{errors.title.message}</Text>}

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.label}>Short Title *</Text>
              <Controller
                control={control}
                rules={{ required: true }}
                name="shortTitle"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. UPSC 2025"
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={styles.label}>Conducting Body *</Text>
              <Controller
                control={control}
                rules={{ required: true }}
                name="conductingBody"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. UPSC"
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
            </View>
          </View>

          <Text style={styles.label}>Exam Level *</Text>
          <Controller
            control={control}
            name="examLevel"
            render={({ field: { onChange, value } }) => (
              <View style={styles.chipContainer}>
                {LEVELS.map(lvl => (
                  <TouchableOpacity
                    key={lvl}
                    style={[styles.chip, value === lvl && styles.chipActive]}
                    onPress={() => onChange(lvl)}
                  >
                    <Text style={[styles.chipText, value === lvl && styles.chipTextActive]}>{lvl}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          />

          {selectedLevel === ExamLevel.STATE && (
            <View>
              <Text style={styles.label}>State Name *</Text>
              <Controller
                control={control}
                rules={{ required: selectedLevel === ExamLevel.STATE }}
                name="state"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. Maharashtra, Bihar"
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
            </View>
          )}

          <Text style={styles.label}>Category *</Text>
          <Controller
            control={control}
            name="category"
            render={({ field: { onChange, value } }) => (
              <View style={styles.categoryContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
                  {CATEGORIES.map(cat => (
                    <TouchableOpacity
                      key={cat}
                      style={[styles.categoryChip, value === cat && styles.categoryChipActive]}
                      onPress={() => onChange(cat)}
                    >
                      <Text style={[styles.categoryChipText, value === cat && styles.categoryChipTextActive]}>
                        {cat.replace(/_/g, ' ')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          />

          <Text style={styles.label}>Current Status *</Text>
          <Controller
            control={control}
            name="status"
            render={({ field: { onChange, value } }) => (
              <View style={styles.chipContainer}>
                {STATUSES.map(stat => (
                  <TouchableOpacity
                    key={stat}
                    style={[styles.chip, value === stat && styles.chipActive]}
                    onPress={() => onChange(stat)}
                  >
                    <Text style={[styles.chipText, value === stat && styles.chipTextActive]}>
                      {stat.replace(/_/g, ' ')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          />

          <Text style={styles.label}>Description</Text>
          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Brief overview of the exam..."
                multiline
                numberOfLines={4}
                onChangeText={onChange}
                value={value}
              />
            )}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Eligibility & Details</Text>

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.label}>Min Age</Text>
              <Controller
                control={control}
                name="minAge"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    placeholder="21"
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={styles.label}>Max Age</Text>
              <Controller
                control={control}
                name="maxAge"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    placeholder="32"
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
            </View>
          </View>

          <Text style={styles.label}>Required Qualification *</Text>
          <Controller
            control={control}
            name="qualificationLevel"
            render={({ field: { onChange, value } }) => (
              <View style={styles.chipContainer}>
                {QUALIFICATIONS.map(q => (
                  <TouchableOpacity
                    key={q.value}
                    style={[styles.chip, value === q.value && styles.chipActive]}
                    onPress={() => onChange(q.value)}
                  >
                    <Text style={[styles.chipText, value === q.value && styles.chipTextActive]}>{q.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          />

          <Text style={styles.label}>Total Vacancies</Text>
          <Controller
            control={control}
            name="totalVacancies"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                placeholder="1000"
                onChangeText={onChange}
                value={value}
              />
            )}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Official Resources</Text>
          <Text style={styles.label}>Official Website</Text>
          <Controller
            control={control}
            name="officialWebsite"
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

          <Text style={styles.label}>Detailed Notification URL</Text>
          <Controller
            control={control}
            name="notificationUrl"
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

        <View style={[styles.card, styles.publishCard]}>
          <View style={styles.switchRow}>
            <View>
              <Text style={styles.publishTitle}>Push to Live</Text>
              <Text style={styles.publishSubtitle}>Immediately visible to candidates</Text>
            </View>
            <Controller
              control={control}
              name="isPublished"
              render={({ field: { onChange, value } }) => (
                <Switch
                  value={value}
                  onValueChange={onChange}
                  trackColor={{ false: '#767577', true: '#81b0ff' }}
                  thumbColor={value ? '#2196F3' : '#f4f3f4'}
                />
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
            <Text style={styles.submitButtonText}>{isEdit ? 'Update Exam Listing' : 'Create Exam Listing'}</Text>
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
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
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
    marginTop: 12,
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
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 4,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  chipActive: {
    backgroundColor: '#EEF6FF',
    borderColor: '#2196F3',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'capitalize',
  },
  chipTextActive: {
    color: '#2196F3',
  },
  categoryContainer: {
    marginVertical: 4,
  },
  categoryScroll: {
    paddingRight: 16,
    gap: 10,
  },
  categoryChip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  categoryChipActive: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  categoryChipText: {
    fontSize: 13,
    color: '#4B5563',
    fontWeight: '700',
  },
  categoryChipTextActive: {
    color: '#FFF',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
  },
  publishCard: {
    paddingVertical: 16,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  publishTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  publishSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  submitButton: {
    backgroundColor: '#2196F3',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginTop: 8,
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
