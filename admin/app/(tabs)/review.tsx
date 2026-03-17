import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  StatusBar, RefreshControl, Alert, Modal, ScrollView, TextInput,
  ActivityIndicator, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { scraperService, StagedExam, StagedEvent } from '@/services/api.service';

const { width } = Dimensions.get('window');

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
          <View style={styles.confidenceRow}>
            <View style={[styles.aiDot, { backgroundColor: CONFIDENCE_COLOR(exam.aiConfidence) }]} />
            <Text style={[styles.confidence, { color: CONFIDENCE_COLOR(exam.aiConfidence) }]}>
              {Math.round(exam.aiConfidence * 100)}%
            </Text>
          </View>
        )}
      </View>

      <Text style={styles.cardTitle} numberOfLines={2}>{exam.title}</Text>
      {exam.conductingBody && (
        <Text style={styles.cardBody}>{exam.conductingBody}</Text>
      )}

      <View style={styles.metaRow}>
        {exam.category && (
          <View style={styles.catBadge}>
            <Text style={styles.catBadgeText}>{exam.category.replace(/_/g, ' ')}</Text>
          </View>
        )}
        <View style={styles.metaChip}>
          <Ionicons name="people-outline" size={12} color="#6B7280" />
          <Text style={styles.metaItem}>
            {typeof exam.totalVacancies === 'object' && exam.totalVacancies !== null
              ? (exam.totalVacancies as any).count || Object.values(exam.totalVacancies)[0] || '0'
              : exam.totalVacancies || '0'} posts
          </Text>
        </View>
        {exam.sourceCount > 1 && (
          <View style={styles.metaChip}>
            <Ionicons name="git-merge-outline" size={12} color="#6B7280" />
            <Text style={styles.metaItem}>{exam.sourceCount} sources</Text>
          </View>
        )}
      </View>

      {exam.stagedEvents.length > 0 && (
        <View style={styles.eventsPreview}>
          <Text style={styles.previewTitle}>TIMELINE PREVIEW</Text>
          {exam.stagedEvents.slice(0, 3).map((ev) => (
            <EventRow key={ev.id} event={ev} />
          ))}
          {exam.stagedEvents.length > 3 && (
            <Text style={styles.moreEvents}>+{exam.stagedEvents.length - 3} more lifecycle events</Text>
          )}
        </View>
      )}

      <Text style={styles.sourceMeta} numberOfLines={1}>
        Via {exam.scrapeJob?.scrapeSource?.label ?? 'Manual Import'} · {exam.scrapedAt ? new Date(exam.scrapedAt).toLocaleDateString('en-IN') : 'Just now'}
      </Text>

      {isPending && (
        <View style={styles.actionRow}>
          <TouchableOpacity style={[styles.actionBtn, styles.approveBtn]} onPress={onApprove}>
            <Ionicons name="checkmark-circle" size={16} color="#FFF" />
            <Text style={styles.actionBtnText}>Approve</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.flagBtn]} onPress={onFlag}>
            <Ionicons name="flag" size={16} color="#FFF" />
            <Text style={styles.actionBtnText}>Fix</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.rejectBtn]} onPress={onReject}>
            <Ionicons name="close-circle" size={16} color="#FFF" />
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

  const decisionLabels: Record<string, string> = {
    APPROVED: 'Confirm Approval',
    REJECTED: 'Confirm Rejection',
    NEEDS_CORRECTION: 'Request Corrections',
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose} style={styles.modalCloseBtn}>
            <Ionicons name="close" size={24} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>{decisionLabels[decision]}</Text>
          <TouchableOpacity onPress={handleSubmit} disabled={submitting} style={styles.modalSaveBtn}>
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
              <Text style={styles.fieldLabel}>Verify Final Title</Text>
              <TextInput
                style={styles.textInput}
                value={corrTitle}
                onChangeText={setCorrTitle}
                placeholder="Final title for live system…"
              />
              <Text style={styles.fieldLabel}>Verify Conducting Body</Text>
              <TextInput
                style={styles.textInput}
                value={corrConductingBody}
                onChangeText={setCorrConductingBody}
                placeholder="Verify organization name…"
              />
            </>
          )}

          <Text style={styles.fieldLabel}>
            {decision === 'APPROVED' ? 'Admin Note (Optional)' : 'Review Feedback / Reason *'}
          </Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            value={note}
            onChangeText={setNote}
            placeholder={
              decision === 'REJECTED'
                ? 'State why this entry is being rejected…'
                : decision === 'NEEDS_CORRECTION'
                  ? 'Detail the missing or incorrect info…'
                  : 'Any internal notes for this promotes…'
            }
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          {decision === 'APPROVED' && (
            <View style={styles.approvalInfo}>
              <Ionicons name="rocket-outline" size={20} color="#4338CA" />
              <View style={{ flex: 1 }}>
                <Text style={styles.approvalInfoTitle}>Ready for Launch</Text>
                <Text style={styles.approvalInfoText}>
                  Promoting this will make it LIVE on the platform. {exam.existingExamId ? 'This will update the existing exam record.' : 'A new exam entry will be created.'}
                </Text>
              </View>
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
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" />

      <LinearGradient
        colors={['#4F46E5', '#3730A3']}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Review Queue</Text>
            <Text style={styles.headerSub}>{stats.pending} pending for review · {stats.duplicates} duplicates deleted</Text>
          </View>
          <TouchableOpacity style={styles.refreshBtn} onPress={onRefresh}>
            <Ionicons name="refresh" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.filterContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
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
                </Text>
                {filterCounts[f] !== undefined && (
                  <View style={[styles.countBadge, filter === f && styles.countBadgeActive]}>
                    <Text style={[styles.countText, filter === f && styles.countTextActive]}>{filterCounts[f]}</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </LinearGradient>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={styles.loadingText}>Fetching staged exams…</Text>
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
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4F46E5" />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="checkmark-done-circle-outline" size={80} color="#D1D5DB" />
              <Text style={styles.emptyTitle}>
                {filter === 'PENDING' ? 'Queue is Clear! 🎉' : 'No Items Found'}
              </Text>
              <Text style={styles.emptyMsg}>
                {filter === 'PENDING' ? 'All ingested exams have been processed.' : `There are no ${FILTER_LABELS[filter].toLowerCase()} staged exams at the moment.`}
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
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  header: {
    paddingTop: 20,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerTitle: { fontSize: 26, fontWeight: '900', color: '#FFF' },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 2, fontWeight: '600' },
  refreshBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },

  filterContainer: { marginTop: 4 },
  filterContent: { gap: 10, paddingRight: 24 },
  filterChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.1)' },
  filterChipActive: { backgroundColor: '#FFF' },
  filterText: { fontSize: 13, fontWeight: '700', color: 'rgba(255,255,255,0.7)' },
  filterTextActive: { color: '#4F46E5' },
  countBadge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  countBadgeActive: { backgroundColor: '#EEF2FF' },
  countText: { fontSize: 10, fontWeight: '800', color: '#FFF' },
  countTextActive: { color: '#4F46E5' },
  list: { padding: 20, paddingBottom: 100 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 16, color: '#4F46E5', fontWeight: '700' },
  empty: { alignItems: 'center', paddingTop: 80, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 22, fontWeight: '900', color: '#1F2937', marginTop: 16 },
  emptyMsg: { fontSize: 15, color: '#6B7280', marginTop: 8, textAlign: 'center', lineHeight: 20 },
  // Card
  card: {
    backgroundColor: '#FFF', borderRadius: 24, padding: 20, marginBottom: 16,
    borderLeftWidth: 6,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 15, elevation: 3,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 10, fontWeight: '900', textTransform: 'uppercase' },
  dupBadge: { backgroundColor: '#F3F4F6', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  dupText: { fontSize: 10, fontWeight: '900', color: '#6B7280' },
  updateBadge: { backgroundColor: '#EEF2FF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  updateText: { fontSize: 10, fontWeight: '900', color: '#6366F1' },
  confidenceRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginLeft: 'auto' },
  aiDot: { width: 6, height: 6, borderRadius: 3 },
  confidence: { fontSize: 12, fontWeight: '800' },
  cardTitle: { fontSize: 18, fontWeight: '800', color: '#111827', lineHeight: 24, marginBottom: 6 },
  cardBody: { fontSize: 14, color: '#6B7280', fontWeight: '500', marginBottom: 12 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  catBadge: { backgroundColor: '#F3F4F6', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  catBadgeText: { fontSize: 11, fontWeight: '700', color: '#4B5563', textTransform: 'uppercase' },
  metaChip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#F9FAFB', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  metaItem: { fontSize: 12, color: '#4B5563', fontWeight: '700' },
  eventsPreview: {
    backgroundColor: '#F9FAFB', borderRadius: 16, padding: 16, marginBottom: 16,
  },
  previewTitle: { fontSize: 10, fontWeight: '800', color: '#9CA3AF', marginBottom: 10, letterSpacing: 1 },
  eventRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  eventRowImportant: { backgroundColor: '#FEF3C7', borderRadius: 10, paddingHorizontal: 8, marginHorizontal: -4 },
  eventLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  eventStage: { fontSize: 10, color: '#9CA3AF', fontWeight: '800', textTransform: 'uppercase' },
  eventTitle: { fontSize: 13, color: '#1F2937', fontWeight: '700' },
  eventDate: { fontSize: 12, color: '#4B5563', fontWeight: '600', marginLeft: 8 },
  moreEvents: { fontSize: 12, color: '#6366F1', fontWeight: '800', marginTop: 10 },
  sourceMeta: { fontSize: 11, color: '#9CA3AF', fontWeight: '500', marginBottom: 16 },
  actionRow: { flexDirection: 'row', gap: 10 },
  actionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 12, borderRadius: 14,
  },
  actionBtnText: { color: '#FFF', fontWeight: '800', fontSize: 13 },
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
  modalCloseBtn: { padding: 8 },
  modalSaveBtn: { paddingHorizontal: 16 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
  modalSave: { fontSize: 16, fontWeight: '800' },
  modalBody: { flex: 1, padding: 24 },
  reviewTarget: {
    backgroundColor: '#F9FAFB', borderRadius: 20, padding: 20, marginBottom: 12,
  },
  reviewTargetTitle: { fontSize: 17, fontWeight: '800', color: '#111827', lineHeight: 24 },
  reviewTargetSub: { fontSize: 14, color: '#6B7280', marginTop: 6, fontWeight: '500' },
  fieldLabel: { fontSize: 14, fontWeight: '700', color: '#374151', marginBottom: 8, marginTop: 20 },
  textInput: {
    borderWidth: 1.5, borderColor: '#F3F4F6', borderRadius: 16,
    paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: '#111827',
    backgroundColor: '#F9FAFB',
  },
  textArea: { minHeight: 120, paddingTop: 14 },
  approvalInfo: {
    flexDirection: 'row', gap: 14, backgroundColor: '#EEF2FF',
    borderRadius: 20, padding: 20, marginTop: 24, alignItems: 'flex-start',
  },
  approvalInfoTitle: { fontSize: 15, fontWeight: '800', color: '#312E81', marginBottom: 2 },
  approvalInfoText: { fontSize: 13, color: '#4338CA', lineHeight: 18, fontWeight: '500' },
});
