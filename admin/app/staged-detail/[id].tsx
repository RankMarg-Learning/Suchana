// ============================================================
// app/staged-detail/[id].tsx
// Full Staged Exam Detail + Edit + Review screen
// Admin can view all AI-extracted fields, edit any field,
// edit/delete lifecycle events, then Approve / Reject / Flag
// ============================================================
import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView,
  StatusBar, Alert, TextInput, ActivityIndicator, Modal, Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { scraperService, StagedExam, StagedEvent } from '@/services/api.service';

// Exam categories & levels
const EXAM_CATEGORIES = [
  'GOVERNMENT_JOBS','BANKING_JOBS','RAILWAY_JOBS','DEFENCE_JOBS','POLICE_JOBS',
  'TEACHING_ELIGIBILITY','STATE_PSC','UPSC','SSC','PROFESSIONAL_CERTIFICATION',
  'SCHOOL_BOARD','SCHOLARSHIP_EXAMS','OLYMPIAD_EXAMS','AGRICULTURE_ENTRANCE',
  'PARAMEDICAL_ENTRANCE','FOREIGN_STUDY_EXAMS','SKILL_CERTIFICATION',
  'UNIVERSITY_ENTRANCE','ENGINEERING_ENTRANCE','MEDICAL_ENTRANCE','LAW_ENTRANCE',
  'MBA_ENTRANCE','OTHER',
];
const EXAM_LEVELS = ['NATIONAL', 'STATE', 'DISTRICT'];
const LIFECYCLE_STAGES = ['NOTIFICATION','REGISTRATION','ADMIT_CARD','EXAM','ANSWER_KEY','RESULT','DOCUMENT_VERIFICATION','JOINING'];
const EVENT_TYPES = ['RELEASE','START','END','CORRECTION','RESCHEDULED','CANCELLED','OTHER'];

const STAGE_ORDER: Record<string, number> = {
  NOTIFICATION: 10, REGISTRATION: 20, ADMIT_CARD: 30, EXAM: 40,
  ANSWER_KEY: 50, RESULT: 60, DOCUMENT_VERIFICATION: 70, JOINING: 80,
};

// ─── Section Header ───────────────────────────────────────────
const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

// ─── Field Row (editable label + value) ───────────────────────
const Field = ({
  label, value, onEdit, multiline = false, placeholder = '—',
}: {
  label: string;
  value?: string | number | null;
  onEdit: () => void;
  multiline?: boolean;
  placeholder?: string;
}) => (
  <TouchableOpacity style={styles.fieldRow} onPress={onEdit} activeOpacity={0.7}>
    <View style={styles.fieldContent}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={[styles.fieldValue, !value && styles.fieldValueEmpty]} numberOfLines={multiline ? 4 : 1}>
        {value != null && value !== '' ? String(value) : placeholder}
      </Text>
    </View>
    <Ionicons name="pencil-outline" size={16} color="#9CA3AF" />
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
    <SafeAreaView style={styles.chipModal}>
      <View style={styles.chipModalHeader}>
        <Text style={styles.chipModalTitle}>{title}</Text>
        <TouchableOpacity onPress={onClose}>
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
            {selected === opt && <Ionicons name="checkmark" size={18} color="#6366F1" />}
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
      <SafeAreaView style={styles.chipModal}>
        <View style={styles.chipModalHeader}>
          <TouchableOpacity onPress={onClose}>
            <Text style={{ color: '#6B7280', fontSize: 15 }}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.chipModalTitle}>{title}</Text>
          <TouchableOpacity onPress={() => { onSave(text); onClose(); }}>
            <Text style={{ color: '#6366F1', fontSize: 15, fontWeight: '700' }}>Save</Text>
          </TouchableOpacity>
        </View>
        <View style={{ padding: 20 }}>
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
        <View style={{ flex: 1 }}>
          <TouchableOpacity onPress={() => setStageModal(true)} style={styles.stagePill}>
            <Text style={styles.stagePillText}>{event.stage}</Text>
            <Ionicons name="chevron-down" size={12} color="#6366F1" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setTypeModal(true)} style={styles.typePill}>
            <Text style={styles.typePillText}>{event.eventType}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.eventToggles}>
          <View style={styles.miniToggle}>
            <Text style={styles.miniToggleLabel}>★</Text>
            <Switch
              value={isImportant}
              onValueChange={(v) => { setIsImportant(v); update({ isImportant: v }); }}
              trackColor={{ true: '#F59E0B' }}
              style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
            />
          </View>
          <TouchableOpacity onPress={() => {
            Alert.alert('Delete Event', `Remove "${event.title}"?`, [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Delete', style: 'destructive', onPress: () => onDelete(event.id) },
            ]);
          }} style={styles.deleteEventBtn}>
            <Ionicons name="trash-outline" size={16} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity onPress={() => setTitleEdit(true)} style={styles.eventTitle}>
        <Text style={styles.eventTitleText}>{event.title}</Text>
        <Ionicons name="pencil-outline" size={14} color="#9CA3AF" />
      </TouchableOpacity>

      <View style={styles.datePair}>
        <TouchableOpacity style={styles.dateBtn} onPress={() => setStartEdit(true)}>
          <Text style={styles.dateBtnLabel}>Starts</Text>
          <Text style={styles.dateBtnValue}>{event.isTBD ? 'TBD' : formatDate(event.startsAt) || '—'}</Text>
        </TouchableOpacity>
        <View style={styles.dateSep} />
        <TouchableOpacity style={styles.dateBtn} onPress={() => setEndEdit(true)}>
          <Text style={styles.dateBtnLabel}>Ends</Text>
          <Text style={styles.dateBtnValue}>{formatDate(event.endsAt) || '—'}</Text>
        </TouchableOpacity>
        <View style={styles.tbdToggle}>
          <Text style={styles.dateBtnLabel}>TBD</Text>
          <Switch
            value={isTBD}
            onValueChange={(v) => { setIsTBD(v); update({ isTBD: v }); }}
            trackColor={{ true: '#6366F1' }}
            style={{ transform: [{ scaleX: 0.75 }, { scaleY: 0.75 }] }}
          />
        </View>
      </View>

      {/* Sub-modals */}
      <ChipModal visible={stageModal} title="Stage" options={LIFECYCLE_STAGES} selected={event.stage}
        onSelect={(v) => update({ stage: v, stageOrder: STAGE_ORDER[v] ?? event.stageOrder })}
        onClose={() => setStageModal(false)} />
      <ChipModal visible={typeModal} title="Event Type" options={EVENT_TYPES} selected={event.eventType}
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

  // Editable exam fields (local)
  const [title, setTitle] = useState('');
  const [shortTitle, setShortTitle] = useState('');
  const [conductingBody, setConductingBody] = useState('');
  const [category, setCategory] = useState('');
  const [examLevel, setExamLevel] = useState('');
  const [totalVacancies, setTotalVacancies] = useState('');
  const [officialWebsite, setOfficialWebsite] = useState('');
  const [notificationUrl, setNotificationUrl] = useState('');
  const [description, setDescription] = useState('');

  // Modal states
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
      setTotalVacancies(e.totalVacancies?.toString() ?? '');
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
      const vac = parseInt(totalVacancies, 10);
      if (!isNaN(vac) && vac !== exam?.totalVacancies) corrections.totalVacancies = vac;
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
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#6366F1" />
          <Text style={styles.loadingText}>Loading staged exam…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!exam) return null;

  const isPending = exam.reviewStatus === 'PENDING' || exam.reviewStatus === 'NEEDS_CORRECTION';

  const CONF = exam.aiConfidence;
  const confColor = !CONF ? '#9CA3AF' : CONF >= 0.8 ? '#10B981' : CONF >= 0.6 ? '#F59E0B' : '#EF4444';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Stack.Screen options={{ title: 'Review Staged Exam', headerShown: true }} />

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">

        {/* ── Banner ── */}
        <View style={styles.banner}>
          <View style={styles.bannerLeft}>
            <Text style={styles.bannerStatus}>{exam.reviewStatus}</Text>
            {exam.existingExamId && <View style={styles.updatePill}><Text style={styles.updatePillText}>UPDATE</Text></View>}
            {exam.isDuplicate && <View style={styles.dupPill}><Text style={styles.dupPillText}>DUPLICATE</Text></View>}
          </View>
          {CONF !== undefined && (
            <View style={[styles.confBadge, { borderColor: confColor }]}>
              <Text style={[styles.confText, { color: confColor }]}>AI {Math.round(CONF * 100)}%</Text>
            </View>
          )}
        </View>

        {/* ── AI Notes ── */}
        {exam.aiNotes && (
          <View style={styles.aiNotes}>
            <Ionicons name="bulb-outline" size={16} color="#6366F1" />
            <Text style={styles.aiNotesText}>{exam.aiNotes}</Text>
          </View>
        )}

        {/* ── Source Info ── */}
        <View style={styles.sourceInfo}>
          <Text style={styles.sourceInfoText} numberOfLines={1}>
            📌 {exam.scrapeJob?.scrapeSource?.label ?? 'Unknown Source'}
          </Text>
          <Text style={styles.sourceInfoText} numberOfLines={1}>
            🔗 {exam.sourceUrl ?? '—'}
          </Text>
          <Text style={styles.sourceInfoText}>
            📅 Scraped: {exam.scrapedAt ? new Date(exam.scrapedAt).toLocaleString('en-IN') : '—'} · {exam.sourceCount} source(s)
          </Text>
        </View>

        {/* ── Exam Fields ── */}
        <Section title="Exam Details">
          <Field label="Title" value={title} multiline onEdit={() => setEditField({ key: 'title', title: 'Title', value: title, multiline: true })} />
          <Field label="Short Title / Acronym" value={shortTitle} onEdit={() => setEditField({ key: 'shortTitle', title: 'Short Title', value: shortTitle })} />
          <Field label="Conducting Body" value={conductingBody} onEdit={() => setEditField({ key: 'conductingBody', title: 'Conducting Body', value: conductingBody })} />
          <TouchableOpacity style={styles.fieldRow} onPress={() => setCatModal(true)}>
            <View style={styles.fieldContent}>
              <Text style={styles.fieldLabel}>Category</Text>
              <Text style={[styles.fieldValue, !category && styles.fieldValueEmpty]}>{category ? category.replace(/_/g, ' ') : '—'}</Text>
            </View>
            <Ionicons name="chevron-down" size={16} color="#9CA3AF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.fieldRow} onPress={() => setLevelModal(true)}>
            <View style={styles.fieldContent}>
              <Text style={styles.fieldLabel}>Exam Level</Text>
              <Text style={[styles.fieldValue, !examLevel && styles.fieldValueEmpty]}>{examLevel || '—'}</Text>
            </View>
            <Ionicons name="chevron-down" size={16} color="#9CA3AF" />
          </TouchableOpacity>
          <Field label="Total Vacancies" value={totalVacancies} onEdit={() => setEditField({ key: 'totalVacancies', title: 'Total Vacancies', value: totalVacancies, numeric: true })} />
          <Field label="Official Website" value={officialWebsite} onEdit={() => setEditField({ key: 'officialWebsite', title: 'Official Website', value: officialWebsite })} placeholder="https://..." />
          <Field label="Notification URL" value={notificationUrl} onEdit={() => setEditField({ key: 'notificationUrl', title: 'Notification URL', value: notificationUrl })} placeholder="https://..." />
          <Field label="Description" value={description} multiline onEdit={() => setEditField({ key: 'description', title: 'Description', value: description, multiline: true })} placeholder="Add description..." />
        </Section>

        {/* ── Eligibility if present ── */}
        {(exam.minAge || exam.maxAge) && (
          <Section title="Eligibility">
            <View style={styles.eligibilityRow}>
              {exam.minAge && <View style={styles.eligCard}><Text style={styles.eligLabel}>Min Age</Text><Text style={styles.eligValue}>{exam.minAge}</Text></View>}
              {exam.maxAge && <View style={styles.eligCard}><Text style={styles.eligLabel}>Max Age</Text><Text style={styles.eligValue}>{exam.maxAge}</Text></View>}
            </View>
          </Section>
        )}

        {/* ── Lifecycle Events ── */}
        <Section title={`Lifecycle Events (${events.length})`}>
          {events.length === 0 ? (
            <Text style={styles.noEvents}>No events extracted by AI</Text>
          ) : (
            events
              .slice()
              .sort((a, b) => a.stageOrder - b.stageOrder)
              .map((ev) => (
                <EventCard
                  key={ev.id}
                  event={ev}
                  onUpdate={handleEventUpdate}
                  onDelete={handleEventDelete}
                />
              ))
          )}
        </Section>

        {/* ── Dedup Info ── */}
        <View style={styles.dedupBox}>
          <Text style={styles.dedupTitle}>Deduplication Info</Text>
          <Text style={styles.dedupRow}>Key: {exam.deduplicationKey ?? '—'}</Text>
          {exam.existingExamId && <Text style={styles.dedupRow}>🔗 Linked Exam ID: {exam.existingExamId}</Text>}
        </View>

        {/* ── Bottom padding ── */}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* ── Sticky Action Bar ── */}
      {isPending && (
        <View style={styles.actionBar}>
          <TouchableOpacity
            style={[styles.actionBarBtn, styles.rejectBtn]}
            onPress={() => { setReviewNote(''); setReviewModal('REJECTED'); }}
          >
            <Ionicons name="close" size={18} color="#FFF" />
            <Text style={styles.actionBarLabel}>Reject</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBarBtn, styles.flagBtn]}
            onPress={() => { setReviewNote(''); setReviewModal('NEEDS_CORRECTION'); }}
          >
            <Ionicons name="flag" size={18} color="#FFF" />
            <Text style={styles.actionBarLabel}>Need Fix</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBarBtn, styles.approveBtn]}
            onPress={() => { setReviewNote(''); setReviewModal('APPROVED'); }}
          >
            <Ionicons name="checkmark" size={18} color="#FFF" />
            <Text style={styles.actionBarLabel}>Approve</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── Review Note Modal ── */}
      <Modal
        visible={reviewModal !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setReviewModal(null)}
      >
        <SafeAreaView style={styles.chipModal}>
          <View style={styles.chipModalHeader}>
            <TouchableOpacity onPress={() => setReviewModal(null)}>
              <Text style={{ color: '#6B7280', fontSize: 15 }}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.chipModalTitle}>
              {reviewModal === 'APPROVED' ? '✅ Approve & Promote' : reviewModal === 'REJECTED' ? '❌ Reject' : '🚩 Flag for Fix'}
            </Text>
            <TouchableOpacity onPress={() => reviewModal && handleReview(reviewModal)} disabled={submitting}>
              {submitting
                ? <ActivityIndicator size="small" color="#6366F1" />
                : <Text style={{ color: '#6366F1', fontSize: 15, fontWeight: '700' }}>Submit</Text>
              }
            </TouchableOpacity>
          </View>
          <ScrollView style={{ flex: 1, padding: 20 }} keyboardShouldPersistTaps="handled">
            {reviewModal === 'APPROVED' && (
              <View style={styles.promoteInfo}>
                <Ionicons name="information-circle" size={20} color="#6366F1" />
                <Text style={styles.promoteInfoText}>
                  This will promote the staged exam to the live <Text style={{ fontWeight: '800' }}>Exam</Text> table
                  {exam.existingExamId ? ' as an UPDATE to existing exam.' : ' as a NEW exam.'}{'\n'}
                  All field edits you made on this screen will be saved.
                </Text>
              </View>
            )}
            <Text style={styles.noteLabel}>
              {reviewModal === 'APPROVED' ? 'Admin Note (optional)' : 'Reason / Note'}
            </Text>
            <TextInput
              style={[styles.editInput, styles.editInputMulti]}
              value={reviewNote}
              onChangeText={setReviewNote}
              placeholder={reviewModal === 'APPROVED' ? 'Any notes…' : 'Describe the issue…'}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
              autoFocus
            />
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* ── Field Edit Modal ── */}
      {editField && (
        <TextEditModal
          visible={true}
          title={editField.title}
          value={editField.value}
          multiline={editField.multiline}
          keyboardType={editField.numeric ? 'numeric' : 'default'}
          onSave={(v) => {
            const key = editField.key;
            if (key === 'title') setTitle(v);
            else if (key === 'shortTitle') setShortTitle(v);
            else if (key === 'conductingBody') setConductingBody(v);
            else if (key === 'totalVacancies') setTotalVacancies(v);
            else if (key === 'officialWebsite') setOfficialWebsite(v);
            else if (key === 'notificationUrl') setNotificationUrl(v);
            else if (key === 'description') setDescription(v);
          }}
          onClose={() => setEditField(null)}
        />
      )}

      {/* ── Category / Level chip modals ── */}
      <ChipModal visible={catModal} title="Category" options={EXAM_CATEGORIES}
        selected={category} onSelect={setCategory} onClose={() => setCatModal(false)} />
      <ChipModal visible={levelModal} title="Exam Level" options={EXAM_LEVELS}
        selected={examLevel} onSelect={setExamLevel} onClose={() => setLevelModal(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: '#6B7280' },
  scrollContent: { paddingBottom: 20 },

  // Banner
  banner: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#FFF', paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  bannerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  bannerStatus: { fontSize: 13, fontWeight: '800', color: '#374151' },
  updatePill: { backgroundColor: '#EEF2FF', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  updatePillText: { fontSize: 11, fontWeight: '700', color: '#6366F1' },
  dupPill: { backgroundColor: '#F3F4F6', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  dupPillText: { fontSize: 11, fontWeight: '700', color: '#9CA3AF' },
  confBadge: { borderWidth: 1.5, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  confText: { fontSize: 13, fontWeight: '700' },

  // AI Notes
  aiNotes: {
    flexDirection: 'row', gap: 10, backgroundColor: '#EEF2FF',
    marginHorizontal: 16, marginTop: 12, borderRadius: 12, padding: 12, alignItems: 'flex-start',
  },
  aiNotesText: { flex: 1, fontSize: 13, color: '#4338CA', lineHeight: 18 },

  // Source
  sourceInfo: {
    backgroundColor: '#FFF', marginHorizontal: 16, marginTop: 12, borderRadius: 12,
    padding: 12, gap: 4,
  },
  sourceInfoText: { fontSize: 12, color: '#6B7280' },

  // Section
  section: { marginHorizontal: 16, marginTop: 16 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },

  // Field
  fieldRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF',
    paddingHorizontal: 16, paddingVertical: 13,
    borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
    borderRadius: 0,
  },
  fieldContent: { flex: 1 },
  fieldLabel: { fontSize: 11, color: '#9CA3AF', fontWeight: '600', marginBottom: 3, textTransform: 'uppercase', letterSpacing: 0.3 },
  fieldValue: { fontSize: 15, color: '#111827', fontWeight: '500' },
  fieldValueEmpty: { color: '#D1D5DB', fontStyle: 'italic' },

  // Eligibility
  eligibilityRow: { flexDirection: 'row', gap: 12 },
  eligCard: { flex: 1, backgroundColor: '#FFF', padding: 14, borderRadius: 12, alignItems: 'center' },
  eligLabel: { fontSize: 11, color: '#9CA3AF', fontWeight: '600' },
  eligValue: { fontSize: 20, fontWeight: '800', color: '#111827', marginTop: 4 },

  // Event Card
  eventCard: {
    backgroundColor: '#FFF', borderRadius: 12, padding: 14, marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05,
    shadowRadius: 4, elevation: 1,
  },
  eventCardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  stagePill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#EEF2FF', alignSelf: 'flex-start',
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginBottom: 4,
  },
  stagePillText: { fontSize: 12, fontWeight: '700', color: '#6366F1' },
  typePill: {
    backgroundColor: '#F3F4F6', alignSelf: 'flex-start',
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
  },
  typePillText: { fontSize: 11, fontWeight: '600', color: '#6B7280' },
  eventToggles: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  miniToggle: { alignItems: 'center' },
  miniToggleLabel: { fontSize: 12, color: '#F59E0B' },
  deleteEventBtn: { padding: 6 },
  eventTitle: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  eventTitleText: { flex: 1, fontSize: 14, fontWeight: '600', color: '#111827' },
  datePair: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  dateBtn: { flex: 1, backgroundColor: '#F9FAFB', borderRadius: 8, padding: 8 },
  dateBtnLabel: { fontSize: 10, color: '#9CA3AF', fontWeight: '600' },
  dateBtnValue: { fontSize: 12, color: '#374151', fontWeight: '600', marginTop: 2 },
  dateSep: { width: 1, height: 30, backgroundColor: '#E5E7EB' },
  tbdToggle: { alignItems: 'center' },

  // Dedup
  dedupBox: {
    marginHorizontal: 16, marginTop: 16, backgroundColor: '#F9FAFB',
    borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#E5E7EB',
  },
  dedupTitle: { fontSize: 12, fontWeight: '700', color: '#9CA3AF', marginBottom: 6 },
  dedupRow: { fontSize: 11, color: '#6B7280', fontFamily: 'monospace', marginBottom: 2 },

  noEvents: { fontSize: 14, color: '#9CA3AF', textAlign: 'center', paddingVertical: 20 },

  // Action bar
  actionBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', gap: 10, padding: 16,
    backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#F3F4F6',
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08, shadowRadius: 12, elevation: 8,
  },
  actionBarBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 13, borderRadius: 12,
  },
  actionBarLabel: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  approveBtn: { backgroundColor: '#10B981', flex: 2 },
  flagBtn: { backgroundColor: '#F59E0B' },
  rejectBtn: { backgroundColor: '#EF4444' },

  // Chip Modal
  chipModal: { flex: 1, backgroundColor: '#FFF' },
  chipModalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  chipModalTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  chipList: { padding: 16 },
  chipItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 14, paddingHorizontal: 16, borderRadius: 12, marginBottom: 4,
    backgroundColor: '#F9FAFB',
  },
  chipItemActive: { backgroundColor: '#EEF2FF' },
  chipItemText: { fontSize: 14, color: '#374151', fontWeight: '500' },
  chipItemTextActive: { color: '#6366F1', fontWeight: '700' },

  // Text edit modal
  editInput: {
    borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: '#111827',
    backgroundColor: '#FAFAFA',
  },
  editInputMulti: { minHeight: 120, paddingTop: 14 },

  // Promote info
  promoteInfo: {
    flexDirection: 'row', gap: 12, backgroundColor: '#EEF2FF',
    borderRadius: 14, padding: 14, marginBottom: 16, alignItems: 'flex-start',
  },
  promoteInfoText: { flex: 1, fontSize: 13, color: '#4338CA', lineHeight: 20 },
  noteLabel: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 8 },
});
