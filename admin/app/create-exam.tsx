import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity,
  Alert, ActivityIndicator, Switch, KeyboardAvoidingView, Platform, Dimensions, StatusBar, SafeAreaView
} from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { examService } from '@/services/api.service';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ExamCategory, EXAM_CATEGORIES,
  ExamLevel, EXAM_LEVELS,
  ExamStatus, EXAM_STATUSES,
  QualificationLevel
} from '@/constants/enums';

const { width } = Dimensions.get('window');

type KeyValueItem = { key: string; value: string };

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
  qualificationCriteria: string;
  totalVacancies: string;
  salary: string;
  officialWebsite: string;
  notificationUrl: string;
  isPublished: boolean;
  status: ExamStatus;
  additionalDetails: string;
  applicationFee: string;
};

const QUALIFICATIONS = [
  { label: '10th Pass', value: QualificationLevel.TEN_PASS },
  { label: '12th Pass', value: QualificationLevel.TWELVE_PASS },
  { label: 'Diploma', value: QualificationLevel.DIPLOMA },
  { label: 'Graduate', value: QualificationLevel.GRADUATE },
  { label: 'Post Graduate', value: QualificationLevel.POST_GRADUATE },
  { label: 'PhD', value: QualificationLevel.PHD },
  { label: 'Other', value: QualificationLevel.OTHER }
];

function DynamicListSection({ label, control, name, placeholderKey, placeholderValue }: any) {
  const { fields, append, remove } = useFieldArray({ control, name });

  return (
    <View style={{ marginTop: 20 }}>
      <View style={styles.dynamicHeader}>
        <Text style={styles.labelSmall}>{label}</Text>
        <TouchableOpacity style={styles.addBtnSmall} onPress={() => append({ key: '', value: '' })}>
          <Ionicons name="add-circle" size={16} color="#4F46E5" />
          <Text style={styles.addBtnTextSmall}>Add</Text>
        </TouchableOpacity>
      </View>

      {fields.map((field: any, index: number) => (
        <View key={field.id} style={styles.kvRow}>
          <Controller
            control={control}
            name={`${name}.${index}.key`}
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={[styles.input, styles.kvInput, { flex: 1.5 }]}
                placeholder={placeholderKey}
                placeholderTextColor="#9CA3AF"
                onChangeText={onChange}
                value={value}
              />
            )}
          />
          <Controller
            control={control}
            name={`${name}.${index}.value`}
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={[styles.input, styles.kvInput, { flex: 1 }]}
                placeholder={placeholderValue}
                placeholderTextColor="#9CA3AF"
                onChangeText={onChange}
                value={value}
              />
            )}
          />
          <TouchableOpacity onPress={() => remove(index)} style={styles.removeBtn}>
            <Ionicons name="trash-outline" size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
}

export default function CreateExamScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);

  const { control, handleSubmit, reset, watch, formState: { errors } } = useForm<ExamFormValues>({
    defaultValues: {
      category: ExamCategory.OTHER,
      examLevel: ExamLevel.NATIONAL,
      status: ExamStatus.NOTIFICATION,
      state: '',
      isPublished: true,
      title: '',
      shortTitle: '',
      conductingBody: '',
      description: '',
      minAge: '',
      maxAge: '',
      qualificationLevel: QualificationLevel.GRADUATE,
      qualificationCriteria: '',
      totalVacancies: '',
      salary: '',
      officialWebsite: '',
      notificationUrl: '',
      applicationFee: '',
      additionalDetails: '',
    }
  });

  const selectedLevel = watch('examLevel');

  useEffect(() => {
    if (isEdit) fetchExamDetails();
  }, [id]);

  const fetchExamDetails = async () => {
    try {
      setFetching(true);
      const response = await examService.getExamById(id as string);
      const data = response.data || response;

      // Helper to handle legacy data formats (objects/numbers) that are now strings
      const safeString = (v: any) => {
        if (!v) return '';
        if (typeof v === 'string') return v;
        if (typeof v === 'object') return JSON.stringify(v);
        return String(v);
      };

      reset({
        ...data,
        examLevel: data.examLevel || ExamLevel.NATIONAL,
        category: data.category || ExamCategory.OTHER,
        status: data.status || ExamStatus.NOTIFICATION,
        state: data.state || '',
        minAge: data.minAge?.toString() || '',
        maxAge: data.maxAge?.toString() || '',
        totalVacancies: safeString(data.totalVacancies),
        salary: safeString(data.salary),
        additionalDetails: safeString(data.additionalDetails),
        officialWebsite: data.officialWebsite || '',
        notificationUrl: data.notificationUrl || '',
        qualificationLevel: data.qualificationLevel || QualificationLevel.GRADUATE,
        qualificationCriteria: safeString(data.qualificationCriteria),
        applicationFee: safeString(data.applicationFee),
      });
    } catch (err) {
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
        minAge: (data.minAge && data.minAge.trim()) ? parseInt(data.minAge, 10) : null,
        maxAge: (data.maxAge && data.maxAge.trim()) ? parseInt(data.maxAge, 10) : null,
        qualificationCriteria: data.qualificationCriteria?.trim() || null,
        totalVacancies: data.totalVacancies?.trim() || null,
        salary: data.salary?.trim() || null,
        additionalDetails: data.additionalDetails?.trim() || null,
        officialWebsite: data.officialWebsite?.trim() || null,
        notificationUrl: data.notificationUrl?.trim() || null,
        description: data.description?.trim() || null,
        isPublished: data.isPublished,
        applicationFee: data.applicationFee?.trim() || null,
      };

      if (isEdit) {
        await examService.updateExam(id as string, payload);
        Alert.alert('Success', 'Exam updated successfully');
      } else {
        await examService.createExam(payload);
        Alert.alert('Success', 'Exam listing created successfully');
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
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>Loading form details…</Text>
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
             <Text style={styles.headerTitleTiny}>{isEdit ? 'Update Listing' : 'Admin Panel'}</Text>
             <Text style={styles.headerTitleMain} numberOfLines={1}>{isEdit ? 'Edit Exam' : 'Create New Exam'}</Text>
          </View>
        </LinearGradient>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>

        <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
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
                  placeholderTextColor="#9CA3AF"
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
                      placeholderTextColor="#9CA3AF"
                      onChangeText={onChange}
                      value={value}
                    />
                  )}
                />
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={styles.label}>Agency *</Text>
                <Controller
                  control={control}
                  rules={{ required: true }}
                  name="conductingBody"
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      style={styles.input}
                      placeholder="e.g. UPSC"
                      placeholderTextColor="#9CA3AF"
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
                  {EXAM_LEVELS.map(lvl => (
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
                <Text style={styles.label}>Responsible State *</Text>
                <Controller
                  control={control}
                  rules={{ required: selectedLevel === ExamLevel.STATE }}
                  name="state"
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      style={styles.input}
                      placeholder="e.g. Bihar"
                      placeholderTextColor="#9CA3AF"
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
                    {EXAM_CATEGORIES.map(cat => (
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

            <Text style={styles.label}>Description</Text>
            <Controller
              control={control}
              name="description"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Core overview of the exam process…"
                  placeholderTextColor="#9CA3AF"
                  multiline
                  numberOfLines={4}
                  onChangeText={onChange}
                  value={value}
                  textAlignVertical="top"
                />
              )}
            />

            <Text style={styles.label}>Status *</Text>
            <Controller
              control={control}
              name="status"
              render={({ field: { onChange, value } }) => (
                <View style={styles.statusChipContainer}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statusScroll}>
                    {EXAM_STATUSES.map(stat => (
                      <TouchableOpacity
                        key={stat}
                        style={[styles.statusChip, value === stat && styles.statusChipActive]}
                        onPress={() => onChange(stat)}
                      >
                        <Text style={[styles.statusChipText, value === stat && styles.statusChipTextActive]}>
                          {stat.replace(/_/g, ' ')}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            />
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Eligibility & Vacancy</Text>

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
                      placeholder="18"
                      placeholderTextColor="#9CA3AF"
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
                      placeholder="35"
                      placeholderTextColor="#9CA3AF"
                      onChangeText={onChange}
                      value={value}
                    />
                  )}
                />
              </View>
            </View>

            <Text style={styles.label}>Qualification *</Text>
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

            <Text style={styles.label}>Qualification Details</Text>
            <Controller
              control={control}
              name="qualificationCriteria"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Detail exact qualification requirements..."
                  placeholderTextColor="#9CA3AF"
                  multiline
                  numberOfLines={4}
                  onChangeText={onChange}
                  value={value}
                  textAlignVertical="top"
                />
              )}
            />

            <Text style={styles.label}>Total Vacancy Distribution</Text>
            <Controller
              control={control}
              name="totalVacancies"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="e.g. 500 (UR: 300, SC: 100, ST: 100)"
                  placeholderTextColor="#9CA3AF"
                  multiline
                  numberOfLines={4}
                  onChangeText={onChange}
                  value={value}
                  textAlignVertical="top"
                />
              )}
            />

            <Text style={styles.label}>Salary</Text>
            <Controller
              control={control}
              name="salary"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="e.g. Level 7 (₹44,900 - ₹1,42,400) plus allowances"
                  placeholderTextColor="#9CA3AF"
                  multiline
                  numberOfLines={2}
                  onChangeText={onChange}
                  value={value}
                  textAlignVertical="top"
                />
              )}
            />
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Resources & Fees</Text>
            <Text style={styles.label}>Official Website</Text>
            <Controller
              control={control}
              name="officialWebsite"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="https://..."
                  placeholderTextColor="#9CA3AF"
                  onChangeText={onChange}
                  value={value}
                  autoCapitalize="none"
                  keyboardType="url"
                />
              )}
            />

            <Text style={styles.label}>Notification PDF URL</Text>
            <Controller
              control={control}
              name="notificationUrl"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="https://..."
                  placeholderTextColor="#9CA3AF"
                  onChangeText={onChange}
                  value={value}
                  autoCapitalize="none"
                  keyboardType="url"
                />
              )}
            />

            <Text style={styles.label}>Additional Details</Text>
            <Controller
              control={control}
              name="additionalDetails"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Any other crucial instructions or notes..."
                  placeholderTextColor="#9CA3AF"
                  multiline
                  numberOfLines={3}
                  onChangeText={onChange}
                  value={value}
                  textAlignVertical="top"
                />
              )}
            />

            <Text style={styles.label}>Application Fees</Text>
            <Controller
              control={control}
              name="applicationFee"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="General: ₹100, SC/ST: ₹0"
                  placeholderTextColor="#9CA3AF"
                  multiline
                  numberOfLines={2}
                  onChangeText={onChange}
                  value={value}
                  textAlignVertical="top"
                />
              )}
            />
          </View>

          <View style={[styles.card, { backgroundColor: '#F5F3FF', borderLeftWidth: 4, borderLeftColor: '#4F46E5' }]}>
            <View style={styles.switchRow}>
              <View>
                <Text style={styles.publishTitle}>Visible Live</Text>
                <Text style={styles.publishSubtitle}>Users will see this immediately</Text>
              </View>
              <Controller
                control={control}
                name="isPublished"
                render={({ field: { onChange, value } }) => (
                  <Switch
                    value={value}
                    onValueChange={onChange}
                    trackColor={{ false: '#767577', true: '#81b0ff' }}
                    thumbColor={value ? '#4F46E5' : '#f4f3f4'}
                  />
                )}
              />
            </View>
          </View>

          <TouchableOpacity style={styles.submitButtonWrapper} onPress={handleSubmit(onSubmit)} disabled={loading}>
            <LinearGradient colors={['#4F46E5', '#3730A3']} style={styles.submitGradient}>
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.submitButtonText}>{isEdit ? 'Save Changes' : 'Publish Listing'}</Text>
              )}
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
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' },
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

  card: { backgroundColor: '#FFF', borderRadius: 24, padding: 20, marginBottom: 20, shadowColor: '#64748b', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2, borderWidth: 1, borderColor: '#f1f5f9' },
  sectionTitle: { fontSize: 13, fontWeight: '900', color: '#64748b', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 20, borderLeftWidth: 3, borderLeftColor: '#3b82f6', paddingLeft: 12 },
  label: { fontSize: 12, fontWeight: '800', color: '#475569', marginBottom: 8, marginTop: 16 },
  labelSmall: { fontSize: 10, fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 },
  input: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#f1f5f9', borderRadius: 12, padding: 16, fontSize: 15, color: '#1e293b', fontWeight: '600' },
  inputError: { borderColor: '#ef4444' },
  errorText: { color: '#ef4444', fontSize: 11, marginTop: 4, fontWeight: '600' },
  textArea: { height: 120, textAlignVertical: 'top' },
  row: { flexDirection: 'row', gap: 12 },

  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  chip: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, backgroundColor: '#f1f5f9', borderWidth: 1, borderColor: '#f1f5f9' },
  chipActive: { backgroundColor: '#eff6ff', borderColor: '#3b82f6' },
  chipText: { fontSize: 12, fontWeight: '700', color: '#64748b' },
  chipTextActive: { color: '#3b82f6' },

  categoryContainer: { marginTop: 4 },
  categoryScroll: { gap: 8 },
  categoryChip: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 20, backgroundColor: '#f1f5f9', borderWidth: 1, borderColor: '#f1f5f9' },
  categoryChipActive: { backgroundColor: '#3b82f6', borderColor: '#3b82f6' },
  categoryChipText: { fontSize: 13, color: '#64748b', fontWeight: '700' },
  categoryChipTextActive: { color: '#FFF' },

  dynamicHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  addBtnSmall: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#eff6ff', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  addBtnTextSmall: { fontSize: 11, fontWeight: '900', color: '#3b82f6', textTransform: 'uppercase' },
  kvRow: { flexDirection: 'row', gap: 8, marginBottom: 10, alignItems: 'center' },
  kvInput: { paddingVertical: 12, fontSize: 14 },
  removeBtn: { padding: 8 },

  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  publishTitle: { fontSize: 16, fontWeight: '800', color: '#1e293b' },
  publishSubtitle: { fontSize: 12, color: '#94a3b8', marginTop: 2 },

  submitButtonWrapper: { marginTop: 10, borderRadius: 20, overflow: 'hidden', shadowColor: '#3b82f6', shadowOpacity: 0.3, shadowRadius: 15, elevation: 10 },
  submitGradient: { padding: 20, alignItems: 'center', justifyContent: 'center' },
  submitButtonText: { color: '#FFF', fontSize: 16, fontWeight: '900', letterSpacing: 1 },
  statusChipContainer: { marginTop: 4 },
  statusScroll: { gap: 8 },
  statusChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, backgroundColor: '#f1f5f9', borderWidth: 1, borderColor: '#f1f5f9' },
  statusChipActive: { backgroundColor: '#3b82f6', borderColor: '#3b82f6' },
  statusChipText: { fontSize: 12, color: '#64748b', fontWeight: '700' },
  statusChipTextActive: { color: '#FFF' },
});
