// ============================================================
// app/(tabs)/scraper.tsx
// Scraper Management Tab — Sources, Jobs, Trigger
// ============================================================
import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView,
  StatusBar, RefreshControl, Alert, Modal, TextInput, ScrollView,
  Switch, ActivityIndicator, Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { scraperService, ScrapeSource, ScrapeJob } from '@/services/api.service';

const HINT_CATEGORIES = [
  'GOVERNMENT_JOBS', 'BANKING_JOBS', 'RAILWAY_JOBS', 'DEFENCE_JOBS',
  'POLICE_JOBS', 'UPSC', 'SSC', 'STATE_PSC', 'TEACHING_ELIGIBILITY', 'OTHER',
];

// ─── Status Badge ─────────────────────────────────────────────
const StatusBadge = ({ status }: { status: string }) => {
  const colors: Record<string, { bg: string; text: string }> = {
    RUNNING: { bg: '#FFF3CD', text: '#856404' },
    COMPLETED: { bg: '#D1FAE5', text: '#065F46' },
    PARTIAL: { bg: '#FEE2E2', text: '#991B1B' },
    FAILED: { bg: '#FEE2E2', text: '#991B1B' },
  };
  const c = colors[status] ?? { bg: '#F3F4F6', text: '#374151' };
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <Text style={[styles.badgeText, { color: c.text }]}>{status}</Text>
    </View>
  );
};

// ─── Job Card ─────────────────────────────────────────────────
const JobCard = ({ job }: { job: ScrapeJob }) => {
  const date = new Date(job.startedAt).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  });
  return (
    <View style={styles.jobCard}>
      <View style={styles.jobRow}>
        <StatusBadge status={job.status} />
        <Text style={styles.jobDate}>{date}</Text>
      </View>
      <Text style={styles.jobSource}>{job.scrapeSource?.label ?? '—'}</Text>
      <View style={styles.jobMeta}>
        <Text style={styles.jobMetaText}>
          <Ionicons name="documents-outline" size={12} /> {job._count?.stagedExams ?? 0} staged
        </Text>
        <Text style={styles.jobMetaText}>
          <Ionicons name="checkmark-circle-outline" size={12} /> {job.candidatesFound} candidates
        </Text>
        {job.errorMessage ? (
          <Text style={[styles.jobMetaText, { color: '#EF4444' }]} numberOfLines={1}>
            ⚠ {job.errorMessage}
          </Text>
        ) : null}
      </View>
    </View>
  );
};

// ─── Source Card ──────────────────────────────────────────────
const SourceCard = ({
  source,
  onTrigger,
  onEdit,
  onDelete,
  triggering,
}: {
  source: ScrapeSource;
  onTrigger: () => void;
  onEdit: () => void;
  onDelete: () => void;
  triggering: boolean;
}) => {
  const lastJob = source.scrapeJobs?.[0];
  return (
    <View style={[styles.sourceCard, !source.isActive && styles.sourceCardInactive]}>
      <View style={styles.sourceHeader}>
        <View style={styles.sourceTypeBadge}>
          <Text style={styles.sourceTypeText}>{source.sourceType}</Text>
        </View>
        {!source.isActive && (
          <View style={[styles.badge, { backgroundColor: '#F3F4F6' }]}>
            <Text style={[styles.badgeText, { color: '#9CA3AF' }]}>DISABLED</Text>
          </View>
        )}
      </View>
      <Text style={styles.sourceLabel} numberOfLines={1}>{source.label}</Text>
      <Text style={styles.sourceUrl} numberOfLines={1}>{source.url}</Text>
      {source.hintCategory && (
        <View style={styles.hintBadge}>
          <Text style={styles.hintText}>{source.hintCategory}</Text>
        </View>
      )}
      {lastJob && (
        <View style={styles.lastJobRow}>
          <StatusBadge status={lastJob.status} />
          <Text style={styles.lastJobDate}>
            {new Date(lastJob.startedAt).toLocaleDateString('en-IN')} · {lastJob.candidatesFound} found
          </Text>
        </View>
      )}
      <View style={styles.sourceActions}>
        <TouchableOpacity
          style={[styles.triggerBtn, triggering && styles.triggerBtnDisabled]}
          onPress={onTrigger}
          disabled={triggering}
        >
          {triggering ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <>
              <Ionicons name="play" size={14} color="#FFF" />
              <Text style={styles.triggerText}>Run</Text>
            </>
          )}
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconAction} onPress={onEdit}>
          <Ionicons name="pencil" size={16} color="#6B7280" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconAction} onPress={async () => { await Linking.openURL(source.url); }}>
          <Ionicons name="open-outline" size={16} color="#6B7280" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.iconAction, styles.iconActionDanger]} onPress={onDelete}>
          <Ionicons name="trash-outline" size={16} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ─── Add/Edit Source Modal ─────────────────────────────────────
const SourceModal = ({
  visible,
  initial,
  onClose,
  onSave,
}: {
  visible: boolean;
  initial?: ScrapeSource;
  onClose: () => void;
  onSave: (data: any) => void;
}) => {
  const [url, setUrl] = useState(initial?.url ?? '');
  const [label, setLabel] = useState(initial?.label ?? '');
  const [sourceType, setSourceType] = useState<'LISTING' | 'DETAIL'>(initial?.sourceType ?? 'LISTING');
  const [hintCategory, setHintCategory] = useState(initial?.hintCategory ?? '');
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      setUrl(initial?.url ?? '');
      setLabel(initial?.label ?? '');
      setSourceType(initial?.sourceType ?? 'LISTING');
      setHintCategory(initial?.hintCategory ?? '');
      setIsActive(initial?.isActive ?? true);
    }
  }, [visible, initial]);

  const handleSave = async () => {
    if (!url.trim() || !label.trim()) {
      Alert.alert('Validation', 'URL and Label are required');
      return;
    }
    setSaving(true);
    try {
      await onSave({ url: url.trim(), label: label.trim(), sourceType, hintCategory: hintCategory || undefined, isActive });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>{initial ? 'Edit Source' : 'Add Source'}</Text>
          <TouchableOpacity onPress={handleSave} disabled={saving}>
            {saving ? <ActivityIndicator size="small" color="#6366F1" /> : <Text style={styles.modalSave}>Save</Text>}
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.modalBody} keyboardShouldPersistTaps="handled">
          <Text style={styles.fieldLabel}>URL *</Text>
          <TextInput
            style={styles.textInput}
            value={url}
            onChangeText={setUrl}
            placeholder="https://example.com/jobs"
            autoCapitalize="none"
            keyboardType="url"
          />
          <Text style={styles.fieldLabel}>Label *</Text>
          <TextInput
            style={styles.textInput}
            value={label}
            onChangeText={setLabel}
            placeholder="FreeJobAlert — Latest Jobs Listing"
          />
          <Text style={styles.fieldLabel}>Source Type</Text>
          <View style={styles.typeToggle}>
            {(['LISTING', 'DETAIL'] as const).map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.typeBtn, sourceType === t && styles.typeBtnActive]}
                onPress={() => setSourceType(t)}
              >
                <Text style={[styles.typeBtnText, sourceType === t && styles.typeBtnTextActive]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.fieldLabel}>Category Hint (optional)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
            <TouchableOpacity
              style={[styles.catChip, !hintCategory && styles.catChipActive]}
              onPress={() => setHintCategory('')}
            >
              <Text style={[styles.catChipText, !hintCategory && styles.catChipTextActive]}>None</Text>
            </TouchableOpacity>
            {HINT_CATEGORIES.map((c) => (
              <TouchableOpacity
                key={c}
                style={[styles.catChip, hintCategory === c && styles.catChipActive]}
                onPress={() => setHintCategory(c)}
              >
                <Text style={[styles.catChipText, hintCategory === c && styles.catChipTextActive]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <View style={styles.switchRow}>
            <Text style={styles.fieldLabel}>Active</Text>
            <Switch value={isActive} onValueChange={setIsActive} trackColor={{ true: '#6366F1' }} />
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

// ─── Main Screen ──────────────────────────────────────────────
type Tab = 'sources' | 'jobs';

export default function ScraperScreen() {
  const [tab, setTab] = useState<Tab>('sources');
  const [sources, setSources] = useState<ScrapeSource[]>([]);
  const [jobs, setJobs] = useState<ScrapeJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [triggeringId, setTriggeringId] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSource, setEditingSource] = useState<ScrapeSource | undefined>(undefined);

  const fetchSources = useCallback(async () => {
    try {
      const res = await scraperService.listSources({ limit: 50 });
      setSources(res.data ?? []);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const fetchJobs = useCallback(async () => {
    try {
      const res = await scraperService.listJobs({ limit: 50 });
      setJobs(res.data ?? []);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchSources(), fetchJobs()]);
    setLoading(false);
    setRefreshing(false);
  }, [fetchSources, fetchJobs]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const onRefresh = () => { setRefreshing(true); fetchAll(); };

  const handleTrigger = async (source: ScrapeSource) => {
    Alert.alert(
      'Start Scrape?',
      `This will scrape "${source.label}". The job runs in the background.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Run', onPress: async () => {
            setTriggeringId(source.id);
            try {
              await scraperService.triggerScrape(source.id);
              Alert.alert('✅ Job Started', 'The scrape job has been queued. Check Jobs tab for status.');
              setTimeout(fetchJobs, 2000);
            } catch (e: any) {
              Alert.alert('Error', e?.response?.data?.error?.message ?? 'Failed to trigger scrape');
            } finally {
              setTriggeringId(null);
            }
          }
        }
      ]
    );
  };

  const handleSaveSource = async (data: any) => {
    try {
      if (editingSource) {
        await scraperService.updateSource(editingSource.id, data);
      } else {
        await scraperService.createSource(data);
      }
      setModalVisible(false);
      setEditingSource(undefined);
      fetchSources();
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.error?.message ?? 'Failed to save source');
    }
  };

  const handleDeleteSource = (source: ScrapeSource) => {
    Alert.alert(
      'Delete Source',
      `Remove "${source.label}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive', onPress: async () => {
            try {
              await scraperService.deleteSource(source.id);
              fetchSources();
            } catch (e: any) {
              Alert.alert('Error', e?.response?.data?.error?.message ?? 'Delete failed');
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Scraper</Text>
          <Text style={styles.headerSub}>Manage sources &amp; jobs</Text>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => { setEditingSource(undefined); setModalVisible(true); }}
        >
          <Ionicons name="add" size={22} color="#FFF" />
          <Text style={styles.addBtnText}>Source</Text>
        </TouchableOpacity>
      </View>

      {/* Tab Switcher */}
      <View style={styles.tabs}>
        {(['sources', 'jobs'] as Tab[]).map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, tab === t && styles.tabActive]}
            onPress={() => setTab(t)}
          >
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t === 'sources' ? `Sources (${sources.length})` : `Jobs (${jobs.length})`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#6366F1" />
          <Text style={styles.loadingText}>Loading…</Text>
        </View>
      ) : tab === 'sources' ? (
        <FlatList
          data={sources}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <SourceCard
              source={item}
              onTrigger={() => handleTrigger(item)}
              onEdit={() => { setEditingSource(item); setModalVisible(true); }}
              onDelete={() => handleDeleteSource(item)}
              triggering={triggeringId === item.id}
            />
          )}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="cloud-offline-outline" size={64} color="#D1D5DB" />
              <Text style={styles.emptyTitle}>No Sources Yet</Text>
              <Text style={styles.emptyMsg}>Add a URL to start scraping exam data</Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={jobs}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <JobCard job={item} />}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="time-outline" size={64} color="#D1D5DB" />
              <Text style={styles.emptyTitle}>No Jobs Yet</Text>
              <Text style={styles.emptyMsg}>Trigger a scrape from the Sources tab</Text>
            </View>
          }
        />
      )}

      <SourceModal
        visible={modalVisible}
        initial={editingSource}
        onClose={() => { setModalVisible(false); setEditingSource(undefined); }}
        onSave={handleSaveSource}
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
  addBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#6366F1', paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 12, shadowColor: '#6366F1', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  addBtnText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  tabs: {
    flexDirection: 'row', backgroundColor: '#FFF',
    paddingHorizontal: 16, paddingBottom: 0,
    borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  tab: {
    paddingVertical: 14, paddingHorizontal: 20,
    borderBottomWidth: 3, borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: '#6366F1' },
  tabText: { fontSize: 14, fontWeight: '600', color: '#9CA3AF' },
  tabTextActive: { color: '#6366F1' },
  list: { padding: 16, paddingBottom: 100 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: '#6B7280' },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#374151', marginTop: 16 },
  emptyMsg: { fontSize: 14, color: '#9CA3AF', marginTop: 8, textAlign: 'center' },
  // Source Card
  sourceCard: {
    backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  sourceCardInactive: { opacity: 0.6 },
  sourceHeader: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  sourceTypeBadge: {
    backgroundColor: '#EEF2FF', paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 6,
  },
  sourceTypeText: { fontSize: 11, fontWeight: '700', color: '#6366F1' },
  sourceLabel: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 4 },
  sourceUrl: { fontSize: 12, color: '#6B7280', marginBottom: 8 },
  hintBadge: {
    alignSelf: 'flex-start', backgroundColor: '#FEF3C7',
    paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginBottom: 8,
  },
  hintText: { fontSize: 11, fontWeight: '600', color: '#92400E' },
  lastJobRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  lastJobDate: { fontSize: 12, color: '#6B7280' },
  sourceActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  triggerBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#6366F1', paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 10, flex: 1, justifyContent: 'center',
  },
  triggerBtnDisabled: { backgroundColor: '#A5B4FC' },
  triggerText: { color: '#FFF', fontWeight: '700', fontSize: 13 },
  iconAction: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: '#F3F4F6',
    justifyContent: 'center', alignItems: 'center',
  },
  iconActionDanger: { backgroundColor: '#FEE2E2' },
  // Job card
  jobCard: {
    backgroundColor: '#FFF', borderRadius: 14, padding: 14, marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05,
    shadowRadius: 6, elevation: 1,
  },
  jobRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  jobDate: { fontSize: 11, color: '#9CA3AF' },
  jobSource: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 6 },
  jobMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  jobMetaText: { fontSize: 12, color: '#6B7280' },
  // Badge
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  // Modal
  modalContainer: { flex: 1, backgroundColor: '#FFF' },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  modalTitle: { fontSize: 17, fontWeight: '700', color: '#111827' },
  modalSave: { fontSize: 16, fontWeight: '700', color: '#6366F1' },
  modalBody: { flex: 1, padding: 20 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6, marginTop: 16 },
  textInput: {
    borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: '#111827',
    backgroundColor: '#FAFAFA',
  },
  typeToggle: { flexDirection: 'row', gap: 10 },
  typeBtn: {
    flex: 1, paddingVertical: 10, borderRadius: 10,
    borderWidth: 1.5, borderColor: '#E5E7EB', alignItems: 'center',
  },
  typeBtnActive: { borderColor: '#6366F1', backgroundColor: '#EEF2FF' },
  typeBtnText: { fontSize: 13, fontWeight: '700', color: '#9CA3AF' },
  typeBtnTextActive: { color: '#6366F1' },
  categoryScroll: { marginVertical: 8 },
  catChip: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
    backgroundColor: '#F3F4F6', marginRight: 8,
  },
  catChipActive: { backgroundColor: '#6366F1' },
  catChipText: { fontSize: 12, fontWeight: '600', color: '#6B7280' },
  catChipTextActive: { color: '#FFF' },
  switchRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginTop: 20,
  },
});
