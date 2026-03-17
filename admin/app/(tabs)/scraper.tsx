import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  StatusBar, RefreshControl, Alert, Modal, TextInput, ScrollView,
  Switch, ActivityIndicator, Linking, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { scraperService, ScrapeSource, ScrapeJob } from '@/services/api.service';
import { format } from 'date-fns';

type Tab = 'sources' | 'jobs';

export default function ScraperScreen() {
  const [tab, setTab] = useState<Tab>('sources');
  const [sources, setSources] = useState<ScrapeSource[]>([]);
  const [jobs, setJobs] = useState<ScrapeJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingSource, setEditingSource] = useState<ScrapeSource | undefined>(undefined);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const [sRes, jRes] = await Promise.all([
        scraperService.listSources(),
        scraperService.listJobs()
      ]);
      setSources(sRes.data || []);
      setJobs(jRes.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAll();
  };

  const handleTrigger = async (id: string) => {
    try {
      Alert.alert('Triggering...', 'Job has been queued.');
      await scraperService.triggerScrape(id);
      fetchAll();
    } catch (e) {
      Alert.alert('Error', 'Failed to trigger scrape');
    }
  };

  const handleSaveSource = async (data: Partial<ScrapeSource>) => {
    try {
      if (editingSource) {
        await scraperService.updateSource(editingSource.id, data);
      } else {
        await scraperService.createSource(data);
      }
      setModalVisible(false);
      setEditingSource(undefined);
      fetchAll();
    } catch (e) {
      Alert.alert('Error', 'Failed to save source');
    }
  };

  const handleDeleteSource = (id: string) => {
    Alert.alert('Delete Source', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await scraperService.deleteSource(id);
          fetchAll();
        }
      }
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#1F2937', '#111827']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Scraper</Text>
            <Text style={styles.headerSub}>Manage sources & automated jobs</Text>
          </View>
        </View>

        <View style={styles.tabsContainer}>
          <View style={styles.tabsBackground}>
            {(['sources', 'jobs'] as Tab[]).map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.tabItem, tab === t && styles.tabItemActive]}
                onPress={() => setTab(t)}
              >
                <Text style={[styles.tabItemText, tab === t && styles.tabItemTextActive]}>
                  {t === 'sources' ? `Sources` : `Jobs`}
                </Text>
                {t === 'sources' && sources.length > 0 && (
                  <View style={[styles.tabBadge, tab === t && styles.tabBadgeActive]}>
                    <Text style={[styles.tabBadgeText, tab === t && styles.tabBadgeTextActive]}>{sources.length}</Text>
                  </View>
                )}
                {t === 'jobs' && jobs.length > 0 && (
                  <View style={[styles.tabBadge, tab === t && styles.tabBadgeActive]}>
                    <Text style={[styles.tabBadgeText, tab === t && styles.tabBadgeTextActive]}>{jobs.length}</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {loading && !refreshing ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color="#4F46E5" />
            <Text style={styles.loadingText}>Loading Scraper Data...</Text>
          </View>
        ) : tab === 'sources' ? (
          <FlatList
            data={sources}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <SourceCard
                source={item}
                onEdit={() => { setEditingSource(item); setModalVisible(true); }}
                onDelete={() => handleDeleteSource(item.id)}
                onTrigger={() => handleTrigger(item.id)}
              />
            )}
            contentContainerStyle={styles.list}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4F46E5" />}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Ionicons name="cloud-offline-outline" size={64} color="#D1D5DB" />
                <Text style={styles.emptyTitle}>No Sources Found</Text>
                <Text style={styles.emptyMsg}>Add your first scraper source to start ingesting exams.</Text>
              </View>
            }
          />
        ) : (
          <FlatList
            data={jobs}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <JobCard job={item} />}
            contentContainerStyle={styles.list}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4F46E5" />}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Ionicons name="timer-outline" size={64} color="#D1D5DB" />
                <Text style={styles.emptyTitle}>No Recent Jobs</Text>
                <Text style={styles.emptyMsg}>Trigger a scrape to see job activity here.</Text>
              </View>
            }
          />
        )}
      </View>

      <SourceModal
        visible={modalVisible}
        initial={editingSource}
        onClose={() => { setModalVisible(false); setEditingSource(undefined); }}
        onSave={handleSaveSource}
      />

      <TouchableOpacity
        style={[
          styles.fab,
          { bottom: (Platform.OS === 'ios' ? 0 : 0) + 12 }
        ]}
        onPress={() => { setEditingSource(undefined); setModalVisible(true); }}
      >
        <LinearGradient
          colors={['#4F46E5', '#3730A3']}
          style={styles.fabGradient}
        >
          <Ionicons name="add" size={26} color="#FFF" />
          <Text style={styles.fabText}>New Source</Text>
        </LinearGradient>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

function SourceCard({ source, onEdit, onDelete, onTrigger }: { source: ScrapeSource, onEdit: () => void, onDelete: () => void, onTrigger: () => void }) {
  return (
    <View style={styles.sourceCard}>
      <View style={styles.sourceHeader}>
        <View style={styles.sourceBadge}>
          <Text style={styles.sourceTypeText}>{source.sourceType}</Text>
        </View>
        <TouchableOpacity onPress={onEdit}>
          <Ionicons name="ellipsis-horizontal" size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>
      <Text style={styles.sourceLabel}>{source.label}</Text>
      <Text style={styles.sourceUrl} numberOfLines={1}>{source.url}</Text>

      {source.sourceType === 'DETAIL' && (
        <View style={styles.hintBadge}>
          <Ionicons name="bulb-outline" size={12} color="#92400E" />
          <Text style={styles.hintText}>Requires manual trigger frequently</Text>
        </View>
      )}

      {source.createdAt && (
        <View style={styles.lastJobRow}>
          <Ionicons name="time-outline" size={14} color="#4B5563" />
          <Text style={styles.lastJobDate}>Created: {format(new Date(source.createdAt), 'MMM d, HH:mm')}</Text>
        </View>
      )}

      <View style={styles.sourceActions}>
        <TouchableOpacity style={styles.triggerBtn} onPress={onTrigger}>
          <LinearGradient colors={['#4F46E5', '#3730A3']} style={styles.triggerGradient}>
            <Ionicons name="play" size={16} color="#FFF" />
            <Text style={styles.triggerText}>Trigger Scrape</Text>
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconAction} onPress={() => Linking.openURL(source.url)}>
          <Ionicons name="open-outline" size={20} color="#4B5563" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.iconAction, styles.iconActionDanger]} onPress={onDelete}>
          <Ionicons name="trash-outline" size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function JobCard({ job }: { job: ScrapeJob }) {
  const isSuccess = job.status === 'COMPLETED';
  const isRunning = job.status === 'RUNNING';

  return (
    <View style={styles.jobCard}>
      <View style={styles.jobRow}>
        <Text style={styles.jobDate}>{format(new Date(job.startedAt), 'MMM d, HH:mm:ss')}</Text>
        <View style={[styles.badge, { backgroundColor: isSuccess ? '#D1FAE5' : isRunning ? '#FEF3C7' : '#FEE2E2' }]}>
          <Text style={[styles.badgeText, { color: isSuccess ? '#059669' : isRunning ? '#D97706' : '#DC2626' }]}>{job.status}</Text>
        </View>
      </View>
      <Text style={styles.jobSource}>{job.scrapeSource?.label || 'Source Unavailable'}</Text>
      <View style={styles.jobMeta}>
        <View style={styles.metaChipSmall}>
          <Ionicons name="add-circle-outline" size={14} color="#10B981" />
          <Text style={styles.jobMetaText}>{job.candidatesFound} Found</Text>
        </View>
        {job.errorMessage && (
          <View style={[styles.metaChipSmall, { backgroundColor: '#FEF2F2' }]}>
            <Ionicons name="alert-circle-outline" size={14} color="#EF4444" />
            <Text style={[styles.jobMetaText, { color: '#EF4444' }]} numberOfLines={1}>{job.errorMessage}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

function SourceModal({ visible, initial, onClose, onSave }: { visible: boolean, initial?: ScrapeSource, onClose: () => void, onSave: (d: any) => void }) {
  const [label, setLabel] = useState(initial?.label || '');
  const [url, setUrl] = useState(initial?.url || '');
  const [sourceType, setSourceType] = useState<ScrapeSource['sourceType']>(initial?.sourceType || 'LISTING');
  const [hintCategory, setHintCategory] = useState(initial?.hintCategory || '');
  const [isActive, setIsActive] = useState(initial ? initial.isActive : true);

  useEffect(() => {
    if (visible) {
      setLabel(initial?.label || '');
      setUrl(initial?.url || '');
      setSourceType(initial?.sourceType || 'LISTING');
      setHintCategory(initial?.hintCategory || '');
      setIsActive(initial ? initial.isActive : true);
    }
  }, [visible, initial]);

  return (
    <Modal visible={visible} animationType="slide">
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose} style={styles.modalCloseBtn}>
            <Ionicons name="close" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>{initial ? 'Edit Source' : 'New Source'}</Text>
          <TouchableOpacity onPress={() => onSave({ label, url, sourceType, hintCategory: hintCategory || undefined, isActive })} style={styles.modalSaveBtn}>
            <Text style={styles.modalSave}>Save</Text>
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.modalBody}>
          <Text style={styles.fieldLabel}>Label</Text>
          <TextInput style={styles.textInput} value={label} onChangeText={setLabel} placeholder="e.g. UPSC Official Notifications" />

          <Text style={styles.fieldLabel}>Source URL</Text>
          <TextInput style={styles.textInput} value={url} onChangeText={setUrl} placeholder="https://..." autoCapitalize="none" />

          <Text style={styles.fieldLabel}>Page Type</Text>
          <View style={styles.typeToggle}>
            <TouchableOpacity
              style={[styles.typeBtn, sourceType === 'LISTING' && styles.typeBtnActive]}
              onPress={() => setSourceType('LISTING')}
            >
              <Text style={[styles.typeBtnText, sourceType === 'LISTING' && styles.typeBtnTextActive]}>List Page</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.typeBtn, sourceType === 'DETAIL' && styles.typeBtnActive]}
              onPress={() => setSourceType('DETAIL')}
            >
              <Text style={[styles.typeBtnText, sourceType === 'DETAIL' && styles.typeBtnTextActive]}>Single Exam</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.fieldLabel}>Category Hint</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
            {[
              { id: '', label: 'None' },
              { id: 'GOVERNMENT_JOBS', label: 'Gov. Jobs' },
              { id: 'BANKING_JOBS', label: 'Banking' },
              { id: 'RAILWAY_JOBS', label: 'Railway' },
              { id: 'DEFENCE_JOBS', label: 'Defence' },
              { id: 'POLICE_JOBS', label: 'Police' },
              { id: 'UPSC', label: 'UPSC' },
              { id: 'SSC', label: 'SSC' },
              { id: 'STATE_PSC', label: 'State PSC' },
              { id: 'TEACHING_ELIGIBILITY', label: 'Teaching' },
              { id: 'ENGINEERING_ENTRANCE', label: 'Engineering' },
              { id: 'MEDICAL_ENTRANCE', label: 'Medical' },
              { id: 'OTHER', label: 'Other' },
            ].map(c => (
              <TouchableOpacity
                key={c.id}
                style={[styles.catChip, hintCategory === c.id && styles.catChipActive]}
                onPress={() => setHintCategory(c.id)}
              >
                <Text style={[styles.catChipText, hintCategory === c.id && styles.catChipTextActive]}>{c.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.switchRow}>
            <Text style={styles.fieldLabel}>Active Status</Text>
            <Switch value={isActive} onValueChange={setIsActive} />
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  header: {
    paddingTop: 20, paddingHorizontal: 24, paddingBottom: 24,
    borderBottomLeftRadius: 32, borderBottomRightRadius: 32,
  },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  headerTitle: { fontSize: 26, fontWeight: '900', color: '#FFF' },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 2, fontWeight: '600' },

  tabsContainer: { marginTop: 4 },
  tabsBackground: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 16, padding: 4 },
  tabItem: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 12, gap: 8 },
  tabItemActive: { backgroundColor: '#FFF' },
  tabItemText: { fontSize: 14, fontWeight: '700', color: 'rgba(255,255,255,0.7)' },
  tabItemTextActive: { color: '#4F46E5' },
  tabBadge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  tabBadgeActive: { backgroundColor: '#EEF2FF' },
  tabBadgeText: { fontSize: 10, fontWeight: '800', color: '#FFF' },
  tabBadgeTextActive: { color: '#4F46E5' },

  content: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  loadingText: { marginTop: 12, color: '#4F46E5', fontWeight: '700' },
  list: { padding: 20, paddingBottom: 100 },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: '#1F2937', marginTop: 16 },
  emptyMsg: { fontSize: 14, color: '#6B7280', marginTop: 8, textAlign: 'center' },

  // Source Card
  sourceCard: {
    backgroundColor: '#FFF', borderRadius: 24, padding: 20, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05,
    shadowRadius: 10, elevation: 2,
  },
  sourceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  sourceBadge: { backgroundColor: '#EEF2FF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  sourceTypeText: { fontSize: 10, fontWeight: '800', color: '#6366F1', textTransform: 'uppercase' },
  sourceLabel: { fontSize: 17, fontWeight: '800', color: '#111827', marginBottom: 4 },
  sourceUrl: { fontSize: 13, color: '#6B7280', marginBottom: 12 },
  hintBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start',
    backgroundColor: '#FEF3C7', paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 8, marginBottom: 12,
  },
  hintText: { fontSize: 11, fontWeight: '800', color: '#92400E' },
  lastJobRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#F9FAFB', padding: 12, borderRadius: 16, marginBottom: 16,
  },
  lastJobDate: { fontSize: 12, color: '#4B5563', fontWeight: '500' },
  sourceActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  triggerBtn: {
    flex: 1, height: 44, borderRadius: 14, overflow: 'hidden',
  },
  triggerGradient: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  triggerText: { color: '#FFF', fontWeight: '800', fontSize: 14 },
  iconAction: {
    width: 44, height: 44, borderRadius: 14, backgroundColor: '#F3F4F6',
    justifyContent: 'center', alignItems: 'center',
  },
  iconActionDanger: { backgroundColor: '#FEF2F2' },

  // Job card
  jobCard: {
    backgroundColor: '#FFF', borderRadius: 24, padding: 20, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05,
    shadowRadius: 10, elevation: 2,
  },
  jobRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  jobDate: { fontSize: 12, color: '#9CA3AF', fontWeight: '500' },
  jobSource: { fontSize: 16, fontWeight: '800', color: '#1F2937', marginBottom: 12 },
  jobMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  metaChipSmall: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#F3F4F6', paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: 10,
  },
  jobMetaText: { fontSize: 12, color: '#4B5563', fontWeight: '700' },

  // Badge
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 10, fontWeight: '900', textTransform: 'uppercase' },

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
  modalSave: { fontSize: 16, fontWeight: '800', color: '#6366F1' },
  modalBody: { flex: 1, padding: 24 },
  fieldLabel: { fontSize: 14, fontWeight: '700', color: '#374151', marginBottom: 8, marginTop: 20 },
  textInput: {
    borderWidth: 1.5, borderColor: '#F3F4F6', borderRadius: 16,
    paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: '#111827',
    backgroundColor: '#F9FAFB',
  },
  typeToggle: { flexDirection: 'row', gap: 12 },
  typeBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 14,
    borderWidth: 1.5, borderColor: '#F3F4F6', alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  typeBtnActive: { borderColor: '#6366F1', backgroundColor: '#EEF2FF' },
  typeBtnText: { fontSize: 14, fontWeight: '700', color: '#9CA3AF' },
  typeBtnTextActive: { color: '#6366F1' },
  categoryScroll: { marginVertical: 8 },
  catChip: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12,
    backgroundColor: '#F3F4F6', marginRight: 10,
  },
  catChipActive: { backgroundColor: '#6366F1' },
  catChipText: { fontSize: 13, fontWeight: '700', color: '#6B7280' },
  catChipTextActive: { color: '#FFF' },
  switchRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginTop: 24, padding: 16,
    backgroundColor: '#F9FAFB', borderRadius: 16,
  },
  fab: {
    position: 'absolute',
    right: 20,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#4F46E5',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  fabGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  fabText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});
