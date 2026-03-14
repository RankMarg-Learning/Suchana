// ============================================================
// app/(tabs)/review.tsx
// Admin Review Queue — Staged Exam Review Pipeline
// ============================================================
import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView,
  StatusBar, RefreshControl, Alert, Modal, ScrollView, TextInput,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { scraperService, StagedExam, StagedEvent } from '@/services/api.service';

type ReviewFilter = 'PENDING' | 'NEEDS_CORRECTION' | 'APPROVED' | 'REJECTED' | 'ALL';

const FILTER_LABELS: Record<ReviewFilter, string> = {
  PENDING: 'Pending',
  NEEDS_CORRECTION: 'Fix Needed',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  ALL: 'All',
};

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  PENDING: { bg: '#FFF7ED', text: '#C2410C', border: '#FDBA74' },
  NEEDS_CORRECTION: { bg: '#FEF3C7', text: '#92400E', border: '#FCD34D' },
  APPROVED: { bg: '#D1FAE5', text: '#065F46', border: '#6EE7B7' },
  REJECTED: { bg: '#FEE2E2', text: '#991B1B', border: '#FCA5A5' },
};

const CONFIDENCE_COLOR = (v?: number) => {
  if (!v) return '#9CA3AF';
  if (v >= 0.8) return '#10B981';
  if (v >= 0.6) return '#F59E0B';
  return '#EF4444';
};

// ─── Event Row ────────────────────────────────────────────────
const EventRow = ({ event }: { event: StagedEvent }) => {
  const dateStr = event.startsAt
    ? new Date(event.startsAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : event.isTBD ? 'TBD' : '—';
  return (
    <View style={[styles.eventRow, event.isImportant && styles.eventRowImportant]}>
      <View style={styles.eventLeft}>
        {event.isImportant && <Ionicons name="star" size={10} color="#F59E0B" style={{ marginRight: 4 }} />}
        <View>
          <Text style={styles.eventStage}>{event.stage} · {event.eventType}</Text>
          <Text style={styles.eventTitle}>{event.title}</Text>
        </View>
      </View>
      <Text style={styles.eventDate}>{dateStr}</Text>
    </View>
  );
};

// ─── Staged Exam Card ─────────────────────────────────────────
const StagedExamCard = ({
  exam,
  onPress,
  onApprove,
  onReject,
  onFlag,
}: {
  exam: StagedExam;
  onPress: () => void;
  onApprove: () => void;
  onReject: () => void;
  onFlag: () => void;
}) => {
  const sc = STATUS_COLORS[exam.reviewStatus] ?? STATUS_COLORS.PENDING;
  const isPending = exam.reviewStatus === 'PENDING' || exam.reviewStatus === 'NEEDS_CORRECTION';

  return (
    <TouchableOpacity style={[styles.card, { borderLeftColor: sc.border }]} onPress={onPress} activeOpacity={0.85}>
      {/* Header row */}
      <View style={styles.cardHeader}>
        <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
          <Text style={[styles.statusText, { color: sc.text }]}>{exam.reviewStatus}</Text>
        </View>
        {exam.isDuplicate && (
          <View style={styles.dupBadge}>
            <Text style={styles.dupText}>DUPLICATE</Text>
          </View>
        )}
        {exam.existingExamId && !exam.isDuplicate && (
          <View style={styles.updateBadge}>
            <Text style={styles.updateText}>UPDATE</Text>
          </View>
        )}
        {exam.aiConfidence !== undefined && (
          <Text style={[styles.confidence, { color: CONFIDENCE_COLOR(exam.aiConfidence) }]}>
            AI {Math.round(exam.aiConfidence * 100)}%
          </Text>
        )}
      </View>

      {/* Title */}
      <Text style={styles.cardTitle} numberOfLines={2}>{exam.title}</Text>
      {exam.conductingBody && (
        <Text style={styles.cardBody}>{exam.conductingBody}</Text>
      )}

      {/* Meta row */}
      <View style={styles.metaRow}>
        {exam.category && (
          <View style={styles.catBadge}>
            <Text style={styles.catBadgeText}>{exam.category.replace(/_/g, ' ')}</Text>
          </View>
        )}
        {exam.totalVacancies && (
          <Text style={styles.metaItem}>
            <Ionicons name="people-outline" size={12} /> {exam.totalVacancies} posts
          </Text>
        )}
        {exam.sourceCount > 1 && (
          <Text style={styles.metaItem}>
            <Ionicons name="git-merge-outline" size={12} /> {exam.sourceCount} sources
          </Text>
        )}
      </View>

      {/* Events preview */}
      {exam.stagedEvents.length > 0 && (
        <View style={styles.eventsPreview}>
          {exam.stagedEvents.slice(0, 3).map((ev) => (
            <EventRow key={ev.id} event={ev} />
          ))}
          {exam.stagedEvents.length > 3 && (
            <Text style={styles.moreEvents}>+{exam.stagedEvents.length - 3} more events</Text>
          )}
        </View>
      )}

      {/* Source meta */}
      <Text style={styles.sourceMeta} numberOfLines={1}>
        {exam.scrapeJob?.scrapeSource?.label ?? '—'} · {exam.scrapedAt ? new Date(exam.scrapedAt).toLocaleDateString('en-IN') : '—'}
      </Text>

      {/* Actions */}
      {isPending && (
        <View style={styles.actionRow}>
          <TouchableOpacity style={[styles.actionBtn, styles.approveBtn]} onPress={onApprove}>
            <Ionicons name="checkmark" size={14} color="#FFF" />
            <Text style={styles.actionBtnText}>Approve</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.flagBtn]} onPress={onFlag}>
            <Ionicons name="flag" size={14} color="#FFF" />
            <Text style={styles.actionBtnText}>Fix</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.rejectBtn]} onPress={onReject}>
            <Ionicons name="close" size={14} color="#FFF" />
            <Text style={styles.actionBtnText}>Reject</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
};

// ─── Review Modal ─────────────────────────────────────────────
const ReviewModal = ({
  visible,
  exam,
  decision,
  onClose,
  onSubmit,
}: {
  visible: boolean;
  exam: StagedExam | null;
  decision: 'APPROVED' | 'REJECTED' | 'NEEDS_CORRECTION' | null;
  onClose: () => void;
  onSubmit: (note: string, corrections: any) => void;
}) => {
  const [note, setNote] = useState('');
  const [corrTitle, setCorrTitle] = useState('');
  const [corrConductingBody, setCorrConductingBody] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (visible && exam) {
      setNote('');
      setCorrTitle(exam.title ?? '');
      setCorrConductingBody(exam.conductingBody ?? '');
    }
  }, [visible, exam]);

  const handleSubmit = async () => {
    setSubmitting(true);
    const corrections: any = {};
    if (corrTitle && corrTitle !== exam?.title) corrections.title = corrTitle;
    if (corrConductingBody && corrConductingBody !== exam?.conductingBody) corrections.conductingBody = corrConductingBody;
    try {
      await onSubmit(note, Object.keys(corrections).length ? corrections : undefined);
    } finally {
      setSubmitting(false);
    }
  };

  if (!exam || !decision) return null;

  const decisionColors: Record<string, string> = {
    APPROVED: '#10B981',
    REJECTED: '#EF4444',
    NEEDS_CORRECTION: '#F59E0B',
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>
            {decision === 'APPROVED' ? '✅ Approve' : decision === 'REJECTED' ? '❌ Reject' : '🚩 Flag for Fix'}
          </Text>
          <TouchableOpacity onPress={handleSubmit} disabled={submitting}>
            {submitting
              ? <ActivityIndicator size="small" color={decisionColors[decision]} />
              : <Text style={[styles.modalSave, { color: decisionColors[decision] }]}>Submit</Text>
            }
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.modalBody} keyboardShouldPersistTaps="handled">
          <View style={styles.reviewTarget}>
            <Text style={styles.reviewTargetTitle} numberOfLines={2}>{exam.title}</Text>
            {exam.conductingBody && (
              <Text style={styles.reviewTargetSub}>{exam.conductingBody}</Text>
            )}
          </View>

          {decision === 'APPROVED' && (
            <>
              <Text style={styles.fieldLabel}>Correct Title (optional)</Text>
              <TextInput
                style={styles.textInput}
                value={corrTitle}
                onChangeText={setCorrTitle}
                placeholder="Title correction…"
              />
              <Text style={styles.fieldLabel}>Correct Conducting Body (optional)</Text>
              <TextInput
                style={styles.textInput}
                value={corrConductingBody}
                onChangeText={setCorrConductingBody}
                placeholder="Conducting body correction…"
              />
            </>
          )}

          <Text style={styles.fieldLabel}>
            {decision === 'APPROVED' ? 'Admin Note (optional)' : 'Reason *'}
          </Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            value={note}
            onChangeText={setNote}
            placeholder={
              decision === 'REJECTED'
                ? 'Why is this being rejected?'
                : decision === 'NEEDS_CORRECTION'
                ? 'What needs to be fixed?'
                : 'Any notes for this approval…'
            }
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          {decision === 'APPROVED' && (
            <View style={styles.approvalInfo}>
              <Ionicons name="information-circle" size={18} color="#6366F1" />
              <Text style={styles.approvalInfoText}>
                Approving will promote this staged exam to the live Exam table{exam.existingExamId ? ' as an update to existing exam' : ' as a new exam'}.
              </Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

// ─── Main Screen ──────────────────────────────────────────────
export default function ReviewScreen() {
  const [filter, setFilter] = useState<ReviewFilter>('PENDING');
  const [staged, setStaged] = useState<StagedExam[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    pending: 0, approved: 0, rejected: 0, needsCorrection: 0, duplicates: 0,
  });
  const [reviewModal, setReviewModal] = useState<{
    visible: boolean;
    exam: StagedExam | null;
    decision: 'APPROVED' | 'REJECTED' | 'NEEDS_CORRECTION' | null;
  }>({ visible: false, exam: null, decision: null });

  const router = useRouter();

  const fetchStats = useCallback(async () => {
    try {
      const res = await scraperService.getStats();
      setStats(res.data.reviewQueue);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const fetchStaged = useCallback(async (filterVal: ReviewFilter) => {
    try {
      const params: any = { limit: 50, isDuplicate: false };
      if (filterVal !== 'ALL') params.reviewStatus = filterVal;
      const res = await scraperService.listStagedExams(params);
      setStaged(res.data ?? []);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchStats(), fetchStaged(filter)]);
    setLoading(false);
    setRefreshing(false);
  }, [filter, fetchStats, fetchStaged]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const onRefresh = () => { setRefreshing(true); fetchAll(); };

  const handleFilterChange = (f: ReviewFilter) => {
    setFilter(f);
    setLoading(true);
    fetchStaged(f).then(() => setLoading(false));
  };

  const openReview = (exam: StagedExam, decision: 'APPROVED' | 'REJECTED' | 'NEEDS_CORRECTION') => {
    setReviewModal({ visible: true, exam, decision });
  };

  const submitReview = async (note: string, corrections?: any) => {
    const { exam, decision } = reviewModal;
    if (!exam || !decision) return;
    try {
      await scraperService.reviewStagedExam(exam.id, decision, note || undefined, corrections);
      setReviewModal({ visible: false, exam: null, decision: null });
      Alert.alert(
        decision === 'APPROVED' ? '✅ Approved' : decision === 'REJECTED' ? '❌ Rejected' : '🚩 Flagged',
        decision === 'APPROVED' ? 'Exam has been promoted to the live system.' : 'Decision recorded.',
      );
      fetchAll();
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.error?.message ?? 'Review failed');
    }
  };

  const FILTERS: ReviewFilter[] = ['PENDING', 'NEEDS_CORRECTION', 'APPROVED', 'REJECTED', 'ALL'];
  const filterCounts: Partial<Record<ReviewFilter, number>> = {
    PENDING: stats.pending,
    NEEDS_CORRECTION: stats.needsCorrection,
    APPROVED: stats.approved,
    REJECTED: stats.rejected,
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Review Queue</Text>
          <Text style={styles.headerSub}>{stats.pending} pending · {stats.duplicates} duplicates</Text>
        </View>
        <TouchableOpacity style={styles.refreshBtn} onPress={onRefresh}>
          <Ionicons name="refresh" size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>

      {/* Filter bar */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterBar}
        contentContainerStyle={styles.filterContent}
      >
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterChip, filter === f && styles.filterChipActive]}
            onPress={() => handleFilterChange(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {FILTER_LABELS[f]}
              {filterCounts[f] !== undefined ? ` (${filterCounts[f]})` : ''}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#6366F1" />
          <Text style={styles.loadingText}>Loading staged exams…</Text>
        </View>
      ) : (
        <FlatList
          data={staged}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <StagedExamCard
              exam={item}
              onPress={() => router.push({ pathname: '/staged-detail/[id]', params: { id: item.id } })}
              onApprove={() => openReview(item, 'APPROVED')}
              onReject={() => openReview(item, 'REJECTED')}
              onFlag={() => openReview(item, 'NEEDS_CORRECTION')}
            />
          )}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="checkmark-done-circle-outline" size={64} color="#D1D5DB" />
              <Text style={styles.emptyTitle}>
                {filter === 'PENDING' ? 'Queue is Clear! 🎉' : 'Nothing Here'}
              </Text>
              <Text style={styles.emptyMsg}>
                {filter === 'PENDING' ? 'All staged exams have been reviewed.' : `No ${FILTER_LABELS[filter].toLowerCase()} items.`}
              </Text>
            </View>
          }
        />
      )}

      <ReviewModal
        visible={reviewModal.visible}
        exam={reviewModal.exam}
        decision={reviewModal.decision}
        onClose={() => setReviewModal({ visible: false, exam: null, decision: null })}
        onSubmit={submitReview}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#FFF',
    borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#111827' },
  headerSub: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  refreshBtn: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: '#F3F4F6',
    justifyContent: 'center', alignItems: 'center',
  },
  filterBar: { backgroundColor: '#FFF', maxHeight: 56, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  filterContent: { paddingHorizontal: 16, paddingVertical: 10, gap: 8, flexDirection: 'row' },
  filterChip: {
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  filterChipActive: { backgroundColor: '#6366F1' },
  filterText: { fontSize: 13, fontWeight: '600', color: '#6B7280' },
  filterTextActive: { color: '#FFF' },
  list: { padding: 16, paddingBottom: 100 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: '#6B7280' },
  empty: { alignItems: 'center', paddingTop: 80, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#374151', marginTop: 16 },
  emptyMsg: { fontSize: 14, color: '#9CA3AF', marginTop: 8, textAlign: 'center' },
  // Card
  card: {
    backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 14,
    borderLeftWidth: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 10, elevation: 2,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  statusText: { fontSize: 11, fontWeight: '700' },
  dupBadge: { backgroundColor: '#F3F4F6', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  dupText: { fontSize: 11, fontWeight: '700', color: '#6B7280' },
  updateBadge: { backgroundColor: '#EEF2FF', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  updateText: { fontSize: 11, fontWeight: '700', color: '#6366F1' },
  confidence: { fontSize: 12, fontWeight: '700', marginLeft: 'auto' },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#111827', lineHeight: 22, marginBottom: 4 },
  cardBody: { fontSize: 13, color: '#6B7280', marginBottom: 10 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  catBadge: { backgroundColor: '#EEF2FF', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  catBadgeText: { fontSize: 11, fontWeight: '600', color: '#6366F1' },
  metaItem: { fontSize: 12, color: '#6B7280', fontWeight: '500' },
  eventsPreview: {
    backgroundColor: '#F9FAFB', borderRadius: 10, padding: 10, marginBottom: 10,
  },
  eventRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  eventRowImportant: { backgroundColor: '#FFFBEB', borderRadius: 6, paddingHorizontal: 6 },
  eventLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  eventStage: { fontSize: 10, color: '#9CA3AF', fontWeight: '600', textTransform: 'uppercase' },
  eventTitle: { fontSize: 13, color: '#374151', fontWeight: '600' },
  eventDate: { fontSize: 12, color: '#6B7280', marginLeft: 8 },
  moreEvents: { fontSize: 12, color: '#6366F1', fontWeight: '600', marginTop: 4 },
  sourceMeta: { fontSize: 11, color: '#9CA3AF', marginBottom: 12 },
  actionRow: { flexDirection: 'row', gap: 8 },
  actionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 4, paddingVertical: 9, borderRadius: 10,
  },
  actionBtnText: { color: '#FFF', fontWeight: '700', fontSize: 13 },
  approveBtn: { backgroundColor: '#10B981' },
  flagBtn: { backgroundColor: '#F59E0B' },
  rejectBtn: { backgroundColor: '#EF4444' },
  // Modal
  modalContainer: { flex: 1, backgroundColor: '#FFF' },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  modalTitle: { fontSize: 17, fontWeight: '700', color: '#111827' },
  modalSave: { fontSize: 16, fontWeight: '700' },
  modalBody: { flex: 1, padding: 20 },
  reviewTarget: {
    backgroundColor: '#F9FAFB', borderRadius: 14, padding: 16, marginBottom: 8,
  },
  reviewTargetTitle: { fontSize: 16, fontWeight: '700', color: '#111827', lineHeight: 22 },
  reviewTargetSub: { fontSize: 13, color: '#6B7280', marginTop: 4 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6, marginTop: 16 },
  textInput: {
    borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: '#111827',
    backgroundColor: '#FAFAFA',
  },
  textArea: { minHeight: 100, paddingTop: 12 },
  approvalInfo: {
    flexDirection: 'row', gap: 10, backgroundColor: '#EEF2FF',
    borderRadius: 12, padding: 14, marginTop: 20, alignItems: 'flex-start',
  },
  approvalInfoText: { flex: 1, fontSize: 13, color: '#4338CA', lineHeight: 18 },
});
