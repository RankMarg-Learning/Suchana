import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Alert, TextInput, ActivityIndicator, Modal, Switch, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { scraperService, StagedExam, StagedEvent } from '@/services/api.service';
import { 
  EXAM_CATEGORIES, 
  EXAM_LEVELS, 
  LIFECYCLE_STAGES, 
  LIFECYCLE_EVENT_TYPES, 
  STAGE_ORDER_MAP 
} from '@/constants/enums';

const { width } = Dimensions.get('window');

// ─── Section Header ───────────────────────────────────────────
const Section = ({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) => (
  <View style={styles.section}>
    <View style={styles.sectionHeaderInner}>
      <Ionicons name={icon as any} size={20} color="#4F46E5" />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
    <View style={styles.sectionCard}>
      {children}
    </View>
  </View>
);

// ─── Field Row (editable label + value) ───────────────────────
const Field = ({
  label, value, onEdit, multiline = false, placeholder = '—', isLast = false
}: {
  label: string;
  value?: string | number | null;
  onEdit: () => void;
  multiline?: boolean;
  placeholder?: string;
  isLast?: boolean;
}) => (
  <TouchableOpacity 
    style={[styles.fieldRow, isLast && { borderBottomWidth: 0 }]} 
    onPress={onEdit} 
    activeOpacity={0.7}
  >
    <View style={styles.fieldContent}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={[styles.fieldValue, !value && styles.fieldValueEmpty]} numberOfLines={multiline ? 4 : 2}>
        {value != null && value !== '' ? String(value) : placeholder}
      </Text>
    </View>
    <View style={styles.editIconBadge}>
      <Ionicons name="pencil-outline" size={14} color="#6366F1" />
    </View>
  </TouchableOpacity>
);

// ─── Chip Selector Modal ────────────────────────────────────────
const ChipModal = ({
  visible, title, options, selected, onSelect, onClose,
}: {
  visible: boolean; title: string; options: string[];
  selected?: string; onSelect: (v: string) => void; onClose: () => void;
}) => (
  <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
    <SafeAreaView style={styles.modalBg}>
      <View style={styles.modalHeader}>
        <Text style={styles.modalHeaderTitle}>{title}</Text>
        <TouchableOpacity onPress={onClose} style={styles.modalCloseBtn}>
          <Ionicons name="close" size={24} color="#374151" />
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.chipList}>
        {options.map((opt) => (
          <TouchableOpacity
            key={opt}
            style={[styles.chipItem, selected === opt && styles.chipItemActive]}
            onPress={() => { onSelect(opt); onClose(); }}
          >
            <Text style={[styles.chipItemText, selected === opt && styles.chipItemTextActive]}>
              {opt.replace(/_/g, ' ')}
            </Text>
            {selected === opt && <Ionicons name="checkmark-circle" size={20} color="#6366F1" />}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  </Modal>
);

// ─── Text Edit Modal ──────────────────────────────────────────
const TextEditModal = ({
  visible, title, value, onSave, onClose, multiline = false, keyboardType = 'default',
}: {
  visible: boolean; title: string; value: string;
  onSave: (v: string) => void; onClose: () => void;
  multiline?: boolean; keyboardType?: any;
}) => {
  const [text, setText] = useState(value);
  useEffect(() => { if (visible) setText(value); }, [visible, value]);
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.modalBg}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.modalCancel}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.modalHeaderTitle}>{title}</Text>
          <TouchableOpacity onPress={() => { onSave(text); onClose(); }}>
            <Text style={styles.modalSave}>Save</Text>
          </TouchableOpacity>
        </View>
        <View style={{ padding: 24 }}>
          <TextInput
            style={[styles.editInput, multiline && styles.editInputMulti]}
            value={text}
            onChangeText={setText}
            autoFocus
            multiline={multiline}
            numberOfLines={multiline ? 6 : 1}
            textAlignVertical={multiline ? 'top' : 'center'}
            keyboardType={keyboardType}
            placeholder={`Enter ${title.toLowerCase()}…`}
            placeholderTextColor="#9CA3AF"
          />
        </View>
      </SafeAreaView>
    </Modal>
  );
};

// ─── Event Edit Card ──────────────────────────────────────────
const EventCard = ({
  event,
  onUpdate,
  onDelete,
}: {
  event: StagedEvent;
  onUpdate: (id: string, data: any) => void;
  onDelete: (id: string) => void;
}) => {
  const [stageModal, setStageModal] = useState(false);
  const [typeModal, setTypeModal] = useState(false);
  const [titleEdit, setTitleEdit] = useState(false);
  const [startEdit, setStartEdit] = useState(false);
  const [endEdit, setEndEdit] = useState(false);
  const [isTBD, setIsTBD] = useState(event.isTBD);
  const [isImportant, setIsImportant] = useState(event.isImportant);

  const formatDate = (d?: string) => d ? new Date(d).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  }) : '';

  const update = (data: any) => onUpdate(event.id, data);

  return (
    <View style={styles.eventCard}>
      <View style={styles.eventCardHeader}>
        <View style={styles.eventBadges}>
          <TouchableOpacity onPress={() => setStageModal(true)} style={styles.stagePill}>
            <Text style={styles.stagePillText}>{event.stage}</Text>
            <Ionicons name="chevron-down" size={10} color="#4F46E5" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setTypeModal(true)} style={styles.typePill}>
            <Text style={styles.typePillText}>{event.eventType}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.eventCardActions}>
          <View style={styles.miniToggleContainer}>
            <Text style={styles.miniToggleLabel}>★</Text>
            <Switch
              value={isImportant}
              onValueChange={(v) => { setIsImportant(v); update({ isImportant: v }); }}
              trackColor={{ true: '#F59E0B', false: '#E5E7EB' }}
              thumbColor={isImportant ? '#FFF' : '#F3F4F6'}
              style={{ transform: [{ scaleX: 0.7 }, { scaleY: 0.7 }] }}
            />
          </View>
          <TouchableOpacity onPress={() => {
            Alert.alert('Delete Event', `Remove "${event.title}"?`, [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Delete', style: 'destructive', onPress: () => onDelete(event.id) },
            ]);
          }} style={styles.deleteBtn}>
            <Ionicons name="trash-outline" size={16} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity onPress={() => setTitleEdit(true)} style={styles.eventTitleRow}>
        <Text style={styles.eventTitleText}>{event.title}</Text>
        <Ionicons name="pencil" size={12} color="#9CA3AF" />
      </TouchableOpacity>

      <View style={styles.eventDatesGrid}>
        <TouchableOpacity style={styles.dateChip} onPress={() => setStartEdit(true)}>
          <Text style={styles.dateLabel}>STARTS</Text>
          <Text style={styles.dateValue}>{event.isTBD ? 'TBD' : formatDate(event.startsAt) || '—'}</Text>
        </TouchableOpacity>
        <View style={styles.dateDivider} />
        <TouchableOpacity style={styles.dateChip} onPress={() => setEndEdit(true)}>
          <Text style={styles.dateLabel}>ENDS</Text>
          <Text style={styles.dateValue}>{formatDate(event.endsAt) || '—'}</Text>
        </TouchableOpacity>
        <View style={styles.tbdControl}>
          <Text style={styles.dateLabel}>TBD</Text>
          <Switch
            value={isTBD}
            onValueChange={(v) => { setIsTBD(v); update({ isTBD: v }); }}
            trackColor={{ true: '#6366F1', false: '#E5E7EB' }}
            thumbColor={isTBD ? '#FFF' : '#F3F4F6'}
            style={{ transform: [{ scaleX: 0.7 }, { scaleY: 0.7 }] }}
          />
        </View>
      </View>

      <ChipModal visible={stageModal} title="Stage" options={LIFECYCLE_STAGES} selected={event.stage}
        onSelect={(v) => update({ stage: v, stageOrder: STAGE_ORDER_MAP[v as keyof typeof STAGE_ORDER_MAP] ?? event.stageOrder })}
        onClose={() => setStageModal(false)} />
      <ChipModal visible={typeModal} title="Event Type" options={LIFECYCLE_EVENT_TYPES} selected={event.eventType}
        onSelect={(v) => update({ eventType: v })} onClose={() => setTypeModal(false)} />
      <TextEditModal visible={titleEdit} title="Event Title" value={event.title}
        onSave={(v) => update({ title: v })} onClose={() => setTitleEdit(false)} />
      <TextEditModal visible={startEdit} title="Starts At (YYYY-MM-DD)"
        value={event.startsAt ? event.startsAt.slice(0, 10) : ''}
        onSave={(v) => { const d = new Date(v); update({ startsAt: isNaN(d.getTime()) ? null : d.toISOString() }); }}
        onClose={() => setStartEdit(false)} />
      <TextEditModal visible={endEdit} title="Ends At (YYYY-MM-DD)"
        value={event.endsAt ? event.endsAt.slice(0, 10) : ''}
        onSave={(v) => { const d = new Date(v); update({ endsAt: isNaN(d.getTime()) ? null : d.toISOString() }); }}
        onClose={() => setEndEdit(false)} />
    </View>
  );
};

// ─── Main Screen ──────────────────────────────────────────────
export default function StagedDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [exam, setExam] = useState<StagedExam | null>(null);
  const [events, setEvents] = useState<StagedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [title, setTitle] = useState('');
  const [shortTitle, setShortTitle] = useState('');
  const [conductingBody, setConductingBody] = useState('');
  const [category, setCategory] = useState('');
  const [examLevel, setExamLevel] = useState('');
  const [totalVacancies, setTotalVacancies] = useState('');
  const [qualificationCriteria, setQualificationCriteria] = useState('');
  const [applicationFee, setApplicationFee] = useState('');
  const [salary, setSalary] = useState('');
  const [additionalDetails, setAdditionalDetails] = useState('');
  const [officialWebsite, setOfficialWebsite] = useState('');
  const [notificationUrl, setNotificationUrl] = useState('');
  const [description, setDescription] = useState('');

  const [editField, setEditField] = useState<{ key: string; title: string; value: string; multiline?: boolean; numeric?: boolean } | null>(null);
  const [catModal, setCatModal] = useState(false);
  const [levelModal, setLevelModal] = useState(false);
  const [reviewModal, setReviewModal] = useState<'APPROVED' | 'REJECTED' | 'NEEDS_CORRECTION' | null>(null);
  const [reviewNote, setReviewNote] = useState('');

  const fetchExam = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await scraperService.getStagedExam(id);
      const e = res.data;
      setExam(e);
      setEvents(e.stagedEvents ?? []);
      setTitle(e.title ?? '');
      setShortTitle(e.shortTitle ?? '');
      setConductingBody(e.conductingBody ?? '');
      setCategory(e.category ?? '');
      setExamLevel(e.examLevel ?? '');
      setTotalVacancies(e.totalVacancies ?? '');
      setQualificationCriteria(e.qualificationCriteria ?? '');
      setApplicationFee(e.applicationFee ?? '');
      setSalary(e.salary ?? '');
      setAdditionalDetails(e.additionalDetails ?? '');
      setOfficialWebsite(e.officialWebsite ?? '');
      setNotificationUrl(e.notificationUrl ?? '');
      setDescription(e.description ?? '');
    } catch (e) {
      Alert.alert('Error', 'Failed to load staged exam');
      router.back();
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchExam(); }, [fetchExam]);

  const handleAddEvent = () => {
    router.push({
      pathname: '/add-event',
      params: { 
        examId: id, 
        examTitle: exam?.shortTitle || exam?.title,
        isStaged: 'true'
      }
    });
  };

  const handleEventUpdate = async (eventId: string, data: any) => {
    try {
      await scraperService.updateStagedEvent(id!, eventId, data);
      setEvents((prev) => prev.map((ev) => ev.id === eventId ? { ...ev, ...data } : ev));
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.error?.message ?? 'Update failed');
    }
  };

  const handleEventDelete = async (eventId: string) => {
    try {
      await scraperService.deleteStagedEvent(id!, eventId);
      setEvents((prev) => prev.filter((ev) => ev.id !== eventId));
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.error?.message ?? 'Delete failed');
    }
  };

  const handleReview = async (decision: 'APPROVED' | 'REJECTED' | 'NEEDS_CORRECTION') => {
    setSubmitting(true);
    try {
      const corrections: any = {};
      if (title !== exam?.title) corrections.title = title;
      if (shortTitle !== (exam?.shortTitle ?? '')) corrections.shortTitle = shortTitle;
      if (conductingBody !== (exam?.conductingBody ?? '')) corrections.conductingBody = conductingBody;
      if (category !== (exam?.category ?? '')) corrections.category = category;
      if (examLevel !== (exam?.examLevel ?? '')) corrections.examLevel = examLevel;
      if (totalVacancies !== (exam?.totalVacancies ?? '')) corrections.totalVacancies = totalVacancies;
      if (qualificationCriteria !== (exam?.qualificationCriteria ?? '')) corrections.qualificationCriteria = qualificationCriteria;
      if (applicationFee !== (exam?.applicationFee ?? '')) corrections.applicationFee = applicationFee;
      if (salary !== (exam?.salary ?? '')) corrections.salary = salary;
      if (additionalDetails !== (exam?.additionalDetails ?? '')) corrections.additionalDetails = additionalDetails;
      if (officialWebsite !== (exam?.officialWebsite ?? '')) corrections.officialWebsite = officialWebsite;
      if (notificationUrl !== (exam?.notificationUrl ?? '')) corrections.notificationUrl = notificationUrl;
      if (description !== (exam?.description ?? '')) corrections.description = description;

      await scraperService.reviewStagedExam(
        id!,
        decision,
        reviewNote || undefined,
        Object.keys(corrections).length ? corrections : undefined,
      );

      setReviewModal(null);
      Alert.alert(
        decision === 'APPROVED' ? '✅ Approved & Promoted' : decision === 'REJECTED' ? '❌ Rejected' : '🚩 Flagged',
        decision === 'APPROVED'
          ? 'The exam has been promoted to the live Exam table and is now visible to users.'
          : 'Decision recorded successfully.',
        [{ text: 'OK', onPress: () => router.back() }],
      );
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.error?.message ?? 'Review failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingCentered}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>Loading extraction details…</Text>
      </View>
    );
  }

  if (!exam) return null;

  const isPending = exam.reviewStatus === 'PENDING' || exam.reviewStatus === 'NEEDS_CORRECTION';
  const CONF = exam.aiConfidence;
  const confColor = !CONF ? '#9CA3AF' : CONF >= 0.8 ? '#10B981' : CONF >= 0.6 ? '#F59E0B' : '#EF4444';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Header Section */}
        <LinearGradient colors={['#4F46E5', '#3730A3']} style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Review Extraction</Text>
          <View style={styles.bannerRow}>
            <View style={styles.statusGroup}>
              <View style={styles.statusBadge}>
                <Text style={styles.statusBadgeText}>{exam.reviewStatus}</Text>
              </View>
              {exam.existingExamId && <View style={styles.updatePill}><Text style={styles.updatePillText}>UPDATE</Text></View>}
              {exam.isDuplicate && <View style={styles.dupPill}><Text style={styles.dupPillText}>DUPLICATE</Text></View>}
            </View>
            {CONF !== undefined && (
              <View style={[styles.aiBadge, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
                <View style={[styles.aiDot, { backgroundColor: confColor }]} />
                <Text style={[styles.aiConfText, { color: '#FFF' }]}>AI {Math.round(CONF * 100)}%</Text>
              </View>
            )}
          </View>
        </LinearGradient>

        <View style={styles.mainContent}>
          {/* AI Notes Banner */}
          {exam.aiNotes && (
            <LinearGradient colors={['#EEF2FF', '#E0E7FF']} style={styles.aiNotesBanner}>
              <Ionicons name="sparkles" size={18} color="#4F46E5" />
              <Text style={styles.aiNotesText}>{exam.aiNotes}</Text>
            </LinearGradient>
          )}

          {/* Source Information */}
          <Section title="Source Intelligence" icon="link">
            <View style={styles.sourceBox}>
              <View style={styles.sourceItem}>
                <Ionicons name="globe-outline" size={16} color="#6B7280" />
                <Text style={styles.sourceText}>{exam.scrapeJob?.scrapeSource?.label ?? 'Manual Import'}</Text>
              </View>
              <View style={styles.sourceItem}>
                <Ionicons name="document-text-outline" size={16} color="#6B7280" />
                <Text style={styles.sourceText} numberOfLines={1}>{exam.sourceUrl || 'No source URL'}</Text>
              </View>
              <View style={styles.sourceMetas}>
                <Text style={styles.sourceMetaText}>Extracted {exam.scrapedAt ? new Date(exam.scrapedAt).toLocaleDateString() : 'now'}</Text>
                <Text style={styles.sourceMetaText}>· {exam.sourceCount} sources merged</Text>
              </View>
            </View>
          </Section>

          {/* Basic Fields */}
          <Section title="Core Details" icon="document-outline">
            <Field label="Title" value={title} multiline onEdit={() => setEditField({ key: 'title', title: 'Exam Title', value: title, multiline: true })} />
            <Field label="Conducting Body" value={conductingBody} onEdit={() => setEditField({ key: 'conductingBody', title: 'Conducting Body', value: conductingBody })} />
            <TouchableOpacity style={styles.fieldRow} onPress={() => setCatModal(true)}>
              <View style={styles.fieldContent}>
                <Text style={styles.fieldLabel}>Category</Text>
                <Text style={[styles.fieldValue, !category && styles.fieldValueEmpty]}>{category ? category.replace(/_/g, ' ') : 'Select Category'}</Text>
              </View>
              <View style={styles.editIconBadge}><Ionicons name="chevron-down" size={14} color="#6366F1" /></View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.fieldRow} onPress={() => setLevelModal(true)}>
              <View style={styles.fieldContent}>
                <Text style={styles.fieldLabel}>Level</Text>
                <Text style={[styles.fieldValue, !examLevel && styles.fieldValueEmpty]}>{examLevel || 'Select Level'}</Text>
              </View>
              <View style={styles.editIconBadge}><Ionicons name="chevron-down" size={14} color="#6366F1" /></View>
            </TouchableOpacity>
            <Field label="Vacancies" value={totalVacancies} multiline onEdit={() => setEditField({ key: 'totalVacancies', title: 'Total Vacancies', value: totalVacancies, multiline: true })} />
            <Field label="Qualification Details" value={qualificationCriteria} multiline onEdit={() => setEditField({ key: 'qualificationCriteria', title: 'Qualification Details', value: qualificationCriteria, multiline: true })} />
            <Field label="Salary" value={salary} multiline onEdit={() => setEditField({ key: 'salary', title: 'Salary', value: salary, multiline: true })} />
            <Field label="Application Fee" value={applicationFee} multiline onEdit={() => setEditField({ key: 'applicationFee', title: 'Application Fee', value: applicationFee, multiline: true })} />
            <Field label="Additional Details" value={additionalDetails} multiline onEdit={() => setEditField({ key: 'additionalDetails', title: 'Additional Details', value: additionalDetails, multiline: true })} />
            <Field label="Description" value={description} multiline isLast onEdit={() => setEditField({ key: 'description', title: 'Description', value: description, multiline: true })} />
          </Section>

          {/* Resources */}
          <Section title="Links & Resources" icon="at-circle-outline">
            <Field label="Official Website" value={officialWebsite} onEdit={() => setEditField({ key: 'officialWebsite', title: 'Official Website', value: officialWebsite })} />
            <Field label="Primary Notification" value={notificationUrl} isLast onEdit={() => setEditField({ key: 'notificationUrl', title: 'Notification URL', value: notificationUrl })} />
          </Section>

          {/* Timeline */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderInner}>
              <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="time-outline" size={20} color="#4F46E5" />
                <Text style={styles.sectionTitle}>Extracted Lifecycle ({events.length})</Text>
              </View>
              <TouchableOpacity style={styles.miniAddBtn} onPress={handleAddEvent}>
                <Ionicons name="add" size={18} color="#4F46E5" />
              </TouchableOpacity>
            </View>
            {events.length === 0 ? (
              <View style={styles.emptyEvents}>
                <Ionicons name="calendar-outline" size={40} color="#D1D5DB" />
                <Text style={styles.emptyEventsText}>No timeline events extracted</Text>
              </View>
            ) : (
              events
                .slice()
                .sort((a, b) => a.stageOrder - b.stageOrder)
                .map((ev) => (
                  <EventCard key={ev.id} event={ev} onUpdate={handleEventUpdate} onDelete={handleEventDelete} />
                ))
            )}
          </View>

          <View style={{ height: 140 }} />
        </View>
      </ScrollView>

      {/* Footer Action Bar */}
      {isPending && (
        <View style={styles.actionBar}>
          <TouchableOpacity
            style={[styles.actionBarBtn, styles.rejectBtn]}
            onPress={() => { setReviewNote(''); setReviewModal('REJECTED'); }}
          >
            <Ionicons name="close" size={20} color="#FFF" />
            <Text style={styles.actionBarLabel}>Reject</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBarBtn, styles.flagBtn]}
            onPress={() => { setReviewNote(''); setReviewModal('NEEDS_CORRECTION'); }}
          >
            <Ionicons name="flag" size={18} color="#FFF" />
            <Text style={styles.actionBarLabel}>Fix</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBarBtn, styles.approveBtn]}
            onPress={() => { setReviewNote(''); setReviewModal('APPROVED'); }}
          >
            <LinearGradient colors={['#10B981', '#059669']} style={styles.approveGradient}>
              <Ionicons name="rocket" size={20} color="#FFF" />
              <Text style={styles.actionBarLabel}>Promote Live</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

      {/* Status Decision Modal */}
      <Modal visible={reviewModal !== null} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setReviewModal(null)}>
        <SafeAreaView style={styles.modalBg}>
          <View style={[styles.modalHeader, { borderBottomWidth: 1, borderBottomColor: '#F3F4F6' }]}>
            <TouchableOpacity onPress={() => setReviewModal(null)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalHeaderTitle}>
              {reviewModal === 'APPROVED' ? 'Promote to Live' : reviewModal === 'REJECTED' ? 'Reject Entry' : 'Manual Fix Required'}
            </Text>
            <TouchableOpacity onPress={() => reviewModal && handleReview(reviewModal)} disabled={submitting}>
              {submitting ? <ActivityIndicator size="small" color="#4F46E5" /> : <Text style={styles.modalSave}>Submit</Text>}
            </TouchableOpacity>
          </View>
          <ScrollView style={{ padding: 24 }} keyboardShouldPersistTaps="handled">
            {reviewModal === 'APPROVED' && (
              <View style={styles.promoteAlert}>
                <Ionicons name="shield-checkmark" size={22} color="#10B981" />
                <Text style={styles.promoteAlertText}>
                  This record will be merged into the master database and become visible to all mobile users.
                </Text>
              </View>
            )}
            <Text style={styles.noteInputLabel}>Feedback / Final Admin Notes</Text>
            <TextInput
              style={[styles.editInput, styles.editInputMulti]}
              value={reviewNote}
              onChangeText={setReviewNote}
              placeholder="State reason or leave final notes for this promotion…"
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={5}
              textAlignVertical="top"
              autoFocus
            />
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Sub-modals for fields */}
      {editField && (
        <TextEditModal
          visible={true}
          title={editField.title}
          value={editField.value}
          multiline={editField.multiline}
          keyboardType={editField.numeric ? 'numeric' : 'default'}
          onSave={(v) => {
            const k = editField.key;
            if (k === 'title') setTitle(v);
            else if (k === 'conductingBody') setConductingBody(v);
            else if (k === 'totalVacancies') setTotalVacancies(v);
            else if (k === 'qualificationCriteria') setQualificationCriteria(v);
            else if (k === 'applicationFee') setApplicationFee(v);
            else if (k === 'salary') setSalary(v);
            else if (k === 'additionalDetails') setAdditionalDetails(v);
            else if (k === 'officialWebsite') setOfficialWebsite(v);
            else if (k === 'notificationUrl') setNotificationUrl(v);
            else if (k === 'description') setDescription(v);
          }}
          onClose={() => setEditField(null)}
        />
      )}
      <ChipModal visible={catModal} title="Category" options={EXAM_CATEGORIES} selected={category} onSelect={setCategory} onClose={() => setCatModal(false)} />
      <ChipModal visible={levelModal} title="Level" options={EXAM_LEVELS} selected={examLevel} onSelect={setExamLevel} onClose={() => setLevelModal(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  loadingCentered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF' },
  loadingText: { marginTop: 12, color: '#4F46E5', fontWeight: '700' },
  scrollContent: { paddingBottom: 40 },
  
  // Header
  header: {
    paddingTop: 60, paddingHorizontal: 24, paddingBottom: 30,
    borderBottomLeftRadius: 32, borderBottomRightRadius: 32,
    elevation: 10, shadowColor: '#4F46E5', shadowOpacity: 0.3, shadowRadius: 15,
  },
  backButton: { width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  headerTitle: { fontSize: 26, fontWeight: '900', color: '#FFF', marginBottom: 12 },
  bannerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusGroup: { flexDirection: 'row', gap: 6 },
  statusBadge: { backgroundColor: '#FFF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusBadgeText: { fontSize: 10, fontWeight: '900', color: '#4F46E5', textTransform: 'uppercase' },
  updatePill: { backgroundColor: '#EEF2FF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  updatePillText: { fontSize: 10, fontWeight: '800', color: '#312E81' },
  dupPill: { backgroundColor: '#FEE2E2', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  dupPillText: { fontSize: 10, fontWeight: '800', color: '#991B1B' },
  aiBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  aiDot: { width: 6, height: 6, borderRadius: 3 },
  aiConfText: { fontSize: 12, fontWeight: '900' },

  mainContent: { paddingHorizontal: 20, marginTop: -20 },
  aiNotesBanner: { flexDirection: 'row', gap: 12, padding: 16, borderRadius: 20, marginBottom: 20, alignItems: 'flex-start' },
  aiNotesText: { flex: 1, fontSize: 13, color: '#3730A3', fontWeight: '600', lineHeight: 18 },

  // Sections
  section: { marginBottom: 20 },
  sectionHeaderInner: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10, paddingLeft: 6 },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: '#6B7280', textTransform: 'uppercase', letterSpacing: 1 },
  sectionCard: { backgroundColor: '#FFF', borderRadius: 24, padding: 4, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 10, elevation: 2 },

  // Field Rows
  fieldRow: { flexDirection: 'row', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  fieldContent: { flex: 1 },
  fieldLabel: { fontSize: 11, fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', marginBottom: 4 },
  fieldValue: { fontSize: 15, fontWeight: '600', color: '#1F2937' },
  fieldValueEmpty: { color: '#D1D5DB', fontStyle: 'italic' },
  editIconBadge: { width: 28, height: 28, borderRadius: 10, backgroundColor: '#F5F3FF', justifyContent: 'center', alignItems: 'center' },

  // Source Box
  sourceBox: { padding: 16, gap: 8 },
  sourceItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sourceText: { fontSize: 13, color: '#4B5563', fontWeight: '500' },
  sourceMetas: { flexDirection: 'row', marginTop: 4 },
  sourceMetaText: { fontSize: 11, color: '#9CA3AF', fontWeight: '500' },

  // Events
  eventCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 3, marginHorizontal: 2 },
  eventCardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  eventBadges: { flexDirection: 'row', gap: 6 },
  stagePill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F5F3FF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  stagePillText: { fontSize: 11, fontWeight: '800', color: '#4F46E5' },
  typePill: { backgroundColor: '#F9FAFB', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  typePillText: { fontSize: 10, fontWeight: '700', color: '#6B7280' },
  eventCardActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  miniToggleContainer: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  miniToggleLabel: { fontSize: 12, color: '#F59E0B' },
  deleteBtn: { padding: 6 },
  eventTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  eventTitleText: { flex: 1, fontSize: 14, fontWeight: '700', color: '#1F2937' },
  eventDatesGrid: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: 12, padding: 12, gap: 10 },
  dateChip: { flex: 1 },
  dateLabel: { fontSize: 9, fontWeight: '800', color: '#9CA3AF', marginBottom: 2 },
  dateValue: { fontSize: 13, fontWeight: '700', color: '#374151' },
  dateDivider: { width: 1, height: 24, backgroundColor: '#E5E7EB' },
  tbdControl: { alignItems: 'center' },
  emptyEvents: { alignItems: 'center', padding: 40, backgroundColor: '#F9FAFB', borderRadius: 24, marginTop: 10 },
  emptyEventsText: { marginTop: 12, color: '#9CA3AF', fontWeight: '600' },

  // Action Bar
  actionBar: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', gap: 8, padding: 16, borderTopLeftRadius: 32, borderTopRightRadius: 32, backgroundColor: '#FFF', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 20, elevation: 20 },
  actionBarBtn: { flex: 1, borderRadius: 16, overflow: 'hidden', height: 56, justifyContent: 'center', alignItems: 'center' },
  actionBarLabel: { color: '#FFF', fontWeight: '900', fontSize: 14 },
  rejectBtn: { backgroundColor: '#EF4444', flexDirection: 'row', gap: 8 },
  flagBtn: { backgroundColor: '#F59E0B', flexDirection: 'row', gap: 8 },
  approveBtn: { flex: 2 },
  approveGradient: { width: '100%', height: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },

  // Modals
  modalBg: { flex: 1, backgroundColor: '#FFF' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  modalHeaderTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
  modalCancel: { fontSize: 15, fontWeight: '600', color: '#6B7280' },
  modalSave: { fontSize: 15, fontWeight: '800', color: '#4F46E5' },
  modalCloseBtn: { padding: 4 },
  chipList: { padding: 16 },
  chipItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderRadius: 16, marginBottom: 8, backgroundColor: '#F9FAFB' },
  chipItemActive: { backgroundColor: '#EEF2FF', borderLeftWidth: 4, borderLeftColor: '#4F46E5' },
  chipItemText: { fontSize: 15, fontWeight: '600', color: '#374151' },
  chipItemTextActive: { color: '#312E81', fontWeight: '800' },
  editInput: { borderWidth: 2, borderColor: '#F3F4F6', borderRadius: 16, padding: 16, fontSize: 16, color: '#111827', backgroundColor: '#F9FAFB' },
  editInputMulti: { minHeight: 140, paddingTop: 16 },
  promoteAlert: { flexDirection: 'row', gap: 12, backgroundColor: '#ECFDF5', padding: 16, borderRadius: 16, marginBottom: 24, borderLeftWidth: 4, borderLeftColor: '#10B981' },
  promoteAlertText: { flex: 1, fontSize: 13, color: '#065F46', fontWeight: '600', lineHeight: 18 },
  noteInputLabel: { fontSize: 14, fontWeight: '800', color: '#1F2937', marginBottom: 10 },
  miniAddBtn: { padding: 4, backgroundColor: '#F5F3FF', borderRadius: 8 },
});
