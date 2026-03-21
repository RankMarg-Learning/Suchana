import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Alert, TextInput, ActivityIndicator, Modal, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  ArrowLeft, 
  Sparkles, 
  Clock, 
  FileText, 
  Globe, 
  Info, 
  Layers, 
  ShieldCheck, 
  X, 
  Flag, 
  Rocket, 
  Plus, 
  Link as LinkIcon,
  ChevronDown
} from 'lucide-react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import { scraperService, StagedExam, StagedEvent } from '@/services/api.service';
import { 
  EXAM_CATEGORIES, 
  EXAM_LEVELS, 
  LIFECYCLE_STAGES, 
  STAGE_ORDER_MAP,
  EXAM_STATUSES
} from '@/constants/enums';

// Components
import { StagedSection } from '@/components/staged/StagedSection';
import { StagedField } from '@/components/staged/StagedField';
import { StagedEventCard } from '@/components/staged/StagedEventCard';
import { ChipModal } from '@/components/staged/ChipModal';
import { TextEditModal } from '@/components/staged/TextEditModal';

export default function StagedDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [exam, setExam] = useState<StagedExam | null>(null);
  const [events, setEvents] = useState<StagedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Field states
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
  const [state, setState] = useState('');
  const [age, setAge] = useState('');
  const [examStatus, setExamStatus] = useState('');

  // UI States
  const [editField, setEditField] = useState<{ key: string; title: string; value: string; multiline?: boolean; numeric?: boolean } | null>(null);
  const [catModal, setCatModal] = useState(false);
  const [levelModal, setLevelModal] = useState(false);
  const [stateModal, setStateModal] = useState(false);
  const [statusModal, setStatusModal] = useState(false);
  const [reviewModal, setReviewModal] = useState<'APPROVED' | 'REJECTED' | 'NEEDS_CORRECTION' | null>(null);
  const [reviewNote, setReviewNote] = useState('');

  // Event Edit Helper States
  const [activeEvent, setActiveEvent] = useState<StagedEvent | null>(null);
  const [eventStageModal, setEventStageModal] = useState(false);
  const [eventTitleModal, setEventTitleModal] = useState(false);
  const [eventOrderModal, setEventOrderModal] = useState(false);
  const [eventDescriptionModal, setEventDescriptionModal] = useState(false);
  const [eventDateModal, setEventDateModal] = useState<{ open: boolean; type: 'start' | 'end' }>({ open: false, type: 'start' });

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
      setState(e.state ?? '');
      setAge(e.age ?? '');
      setExamStatus(e.status ?? '');
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
      if (state !== (exam?.state ?? '')) corrections.state = state;
      if (age !== (exam?.age ?? '')) corrections.age = age;
      if (examStatus !== (exam?.status ?? '')) corrections.status = examStatus;

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
        <Text style={styles.loadingText}>Extracting Intelligence…</Text>
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

      {/* Glass Floating Header */}
      <View style={styles.floatingHeader}>
        <LinearGradient colors={['#0f172a', '#1e293b']} style={styles.headerGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerBackBtn}>
            <ArrowLeft size={20} color="#cbd5e1" strokeWidth={3} />
          </TouchableOpacity>
          <View style={styles.headerTitles}>
             <Text style={styles.headerTitleTiny}>Review Portal</Text>
             <Text style={styles.headerTitleMain} numberOfLines={1}>{exam.shortTitle || exam.title}</Text>
          </View>
        </LinearGradient>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={{ height: 110 }} />
        <View style={styles.mainContent}>
          {/* AI Insights */}
          {exam.aiNotes && (
            <View style={styles.aiNotesWrapper}>
              <LinearGradient colors={['#EEF2FF', '#E0E7FF']} style={styles.aiNotesBanner}>
                <Sparkles size={18} color="#4F46E5" strokeWidth={2.5} />
                <Text style={styles.aiNotesText}>{exam.aiNotes}</Text>
              </LinearGradient>
            </View>
          )}

          {/* Quick Operational Sync */}
          <View style={styles.quickOpsContainer}>
            <View style={styles.quickOpsRow}>
              <TouchableOpacity style={styles.opsCard} onPress={() => setStatusModal(true)}>
                <View style={styles.opsIconBox}><ShieldCheck size={18} color="#6366F1" strokeWidth={2.5} /></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.opsLabel}>Current Phase</Text>
                  <Text style={styles.opsValue} numberOfLines={1}>{examStatus ? examStatus.replace(/_/g, ' ') : 'Not Set'}</Text>
                </View>
                <ChevronDown size={14} color="#94a3b8" />
              </TouchableOpacity>

              <View style={[styles.opsCard, { marginLeft: 12 }]}>
                <View style={styles.opsIconBox}><Sparkles size={18} color={confColor} strokeWidth={2.5} /></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.opsLabel}>Confidence Score</Text>
                  <Text style={[styles.opsValue, { color: confColor }]}>{CONF ? Math.round(CONF * 100) + '%' : 'TBD'}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* POSITIVE CHANGE: START WITH TIMELINE AS REQUESTED */}
          {(() => {
            const pastCount = events.filter(ev => !ev.isTBD && (ev.endsAt ? new Date(ev.endsAt) < new Date() : ev.startsAt ? new Date(ev.startsAt) < new Date() : false)).length;
            return (
              <View style={styles.timelineHeader}>
                 <View style={styles.timelineHeaderLeft}>
                    <Clock size={20} color="#4F46E5" strokeWidth={2.5} />
                    <Text style={styles.sectionTitle}>Timeline Flow</Text>
                    {events.length > 0 && (
                      <View style={styles.completionBadge}>
                        <Text style={styles.completionBadgeText}>{pastCount}/{events.length} EXTRACTED</Text>
                      </View>
                    )}
                 </View>
                 <TouchableOpacity style={styles.addEventBtn} onPress={handleAddEvent}>
                    <Plus size={18} color="#FFF" strokeWidth={3} />
                    <Text style={styles.addEventBtnText}>Add Event</Text>
                 </TouchableOpacity>
              </View>
            );
          })()}

          <View style={styles.timelineContainer}>
            {events.length === 0 ? (
              <View style={styles.emptyEvents}>
                <Clock size={48} color="#D1D5DB" strokeWidth={1} />
                <Text style={styles.emptyEventsText}>No timeline data extracted</Text>
                <TouchableOpacity onPress={handleAddEvent} style={styles.createFirstBtn}>
                  <Text style={styles.createFirstText}>Create First Event</Text>
                </TouchableOpacity>
              </View>
            ) : (
              events
                .slice()
                .sort((a, b) => a.stageOrder - b.stageOrder)
                .map((ev) => (
                  <StagedEventCard
                    key={ev.id}
                    event={ev}
                    onUpdate={handleEventUpdate}
                    onDelete={handleEventDelete}
                    onOpenStageModal={(e) => { setActiveEvent(e); setEventStageModal(true); }}
                    onOpenTitleModal={(e) => { setActiveEvent(e); setEventTitleModal(true); }}
                    onOpenDateModal={(e, type) => { setActiveEvent(e); setEventDateModal({ open: true, type }); }}
                    onOpenOrderModal={(e) => { setActiveEvent(e); setEventOrderModal(true); }}
                    onOpenDescriptionModal={(e) => { setActiveEvent(e); setEventDescriptionModal(true); }}
                  />
                ))
            )}
          </View>

          {/* Exam Profile Sections */}
          <StagedSection title="Core Information" icon={FileText}>
            <StagedField label="Full Exam Title" value={title} multiline onEdit={() => setEditField({ key: 'title', title: 'Exam Title', value: title, multiline: true })} />
            <StagedField label="Short Name / Code" value={shortTitle} onEdit={() => setEditField({ key: 'shortTitle', title: 'Short Title', value: shortTitle })} />
            <StagedField label="Conducting Body" value={conductingBody} onEdit={() => setEditField({ key: 'conductingBody', title: 'Conducting Body', value: conductingBody })} />

            <TouchableOpacity style={styles.customFieldRow} onPress={() => setCatModal(true)}>
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>Category</Text>
                <Text style={[styles.fieldValue, !category && styles.fieldValueEmpty]}>{category ? category.replace(/_/g, ' ') : 'Not Categorized'}</Text>
              </View>
              <View style={styles.fieldIconBadge}><Layers size={18} color="#6366F1" strokeWidth={2.5} /></View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.customFieldRow} onPress={() => setLevelModal(true)}>
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>Level / Difficulty</Text>
                <Text style={[styles.fieldValue, !examLevel && styles.fieldValueEmpty]}>{examLevel || 'Not Specified'}</Text>
              </View>
              <View style={styles.fieldIconBadge}><Info size={18} color="#6366F1" strokeWidth={2.5} /></View>
            </TouchableOpacity>

            <StagedField label="About the Exam" value={description} multiline onEdit={() => setEditField({ key: 'description', title: 'Exam Description', value: description, multiline: true })} />

            <TouchableOpacity style={styles.customFieldRow} onPress={() => setStateModal(true)}>
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>State / Region</Text>
                <Text style={[styles.fieldValue, !state && styles.fieldValueEmpty]}>{state || 'All India'}</Text>
              </View>
              <View style={styles.fieldIconBadge}><Globe size={18} color="#6366F1" strokeWidth={2.5} /></View>
            </TouchableOpacity>
          </StagedSection>

          <StagedSection title="Requirement Details" icon={ShieldCheck}>
            <StagedField label="Age Limit" value={age} onEdit={() => setEditField({ key: 'age', title: 'Age Limit', value: age })} />
            <StagedField label="Recruitment Vacancies" value={totalVacancies} multiline onEdit={() => setEditField({ key: 'totalVacancies', title: 'Total Vacancies', value: totalVacancies, multiline: true })} />
            <StagedField label="Salary / Grade Pay" value={salary} multiline onEdit={() => setEditField({ key: 'salary', title: 'Salary Details', value: salary, multiline: true })} />
            <StagedField label="Eligibility / Qualification" value={qualificationCriteria} multiline onEdit={() => setEditField({ key: 'qualificationCriteria', title: 'Qualification Details', value: qualificationCriteria, multiline: true })} />
            <StagedField label="Application Fee" value={applicationFee} multiline onEdit={() => setEditField({ key: 'applicationFee', title: 'Application Fee', value: applicationFee, multiline: true })} />
            <StagedField label="Extra Notes" value={additionalDetails} multiline isLast onEdit={() => setEditField({ key: 'additionalDetails', title: 'Additional Details', value: additionalDetails, multiline: true })} />
          </StagedSection>

          <StagedSection title="Digital Footprint" icon={LinkIcon}>
            <StagedField label="Official Website" value={officialWebsite} onEdit={() => setEditField({ key: 'officialWebsite', title: 'Official Website', value: officialWebsite })} />
            <StagedField label="PDF / Notification Source" value={notificationUrl} isLast onEdit={() => setEditField({ key: 'notificationUrl', title: 'Primary Source URL', value: notificationUrl })} />
          </StagedSection>

          {/* Source Intelligence */}
          <View style={styles.footerInfo}>
             <View style={styles.footerInfoRow}>
                <Globe size={14} color="#9CA3AF" />
                <Text style={styles.footerInfoText}>Extracted from {exam.scrapeJob?.scrapeSource?.label ?? 'Manual Source'}</Text>
             </View>
             <Text style={styles.footerDateText}>Processed on {exam.scrapedAt ? new Date(exam.scrapedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' }) : 'recently'}</Text>
          </View>

          <View style={{ height: 40 }} />
        </View>
      </ScrollView>

      {/* Primary Action Bar */}
      {isPending && (
        <View style={styles.actionBar}>
          <TouchableOpacity
            style={[styles.actionBarBtn, styles.rejectBtn]}
            onPress={() => { setReviewNote(''); setReviewModal('REJECTED'); }}
          >
            <X size={20} color="#FFF" strokeWidth={3} />
            <Text style={styles.actionBarLabel}>Reject</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBarBtn, styles.flagBtn]}
            onPress={() => { setReviewNote(''); setReviewModal('NEEDS_CORRECTION'); }}
          >
            <Flag size={18} color="#FFF" strokeWidth={2.5} />
            <Text style={styles.actionBarLabel}>Manual Fix</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBarBtn, styles.approveBtn]}
            onPress={() => { setReviewNote(''); setReviewModal('APPROVED'); }}
          >
            <LinearGradient colors={['#10B981', '#059669']} style={styles.approveGradient}>
              <Rocket size={20} color="#FFF" strokeWidth={2.5} />
              <Text style={styles.actionBarLabel}>Publish Live</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

      {/* MODALS */}
      <Modal visible={reviewModal !== null} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setReviewModal(null)}>
        <SafeAreaView style={styles.modalBg}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setReviewModal(null)} style={styles.circularBtn}>
              <X size={20} color="#6B7280" strokeWidth={2.5} />
            </TouchableOpacity>
            <Text style={styles.modalHeaderTitle}>
              {reviewModal === 'APPROVED' ? 'Final Polish' : reviewModal === 'REJECTED' ? 'Reject Data' : 'Correction Needed'}
            </Text>
            <TouchableOpacity onPress={() => reviewModal && handleReview(reviewModal)} disabled={submitting} style={styles.submitBtn}>
              {submitting ? <ActivityIndicator size="small" color="#FFF" /> : <Text style={styles.submitBtnText}>Submit</Text>}
            </TouchableOpacity>
          </View>
          <ScrollView style={{ padding: 24 }} keyboardShouldPersistTaps="handled">
            {reviewModal === 'APPROVED' && (
              <View style={styles.promoteAlert}>
                <ShieldCheck size={24} color="#10B981" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.promoteAlertTitle}>Ready for Launch</Text>
                  <Text style={styles.promoteAlertText}>
                    This data will be merged into the production database and instantly visible to all Suchana mobile users.
                  </Text>
                </View>
              </View>
            )}
            <Text style={styles.noteInputLabel}>Administrator Decision Notes</Text>
            <TextInput
              style={styles.decisionInput}
              value={reviewNote}
              onChangeText={setReviewNote}
              placeholder="State reason or leave final observations…"
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              autoFocus
            />
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Shared Modals */}
      {editField && (
        <TextEditModal
          visible={true}
          title={editField.title}
          value={editField?.value ?? ''}
          multiline={editField?.multiline}
          keyboardType={editField?.numeric ? 'numeric' : 'default'}
          onSave={(v) => {
            if (!editField) return;
            const k = editField.key;
            if (k === 'title') setTitle(v);
            else if (k === 'shortTitle') setShortTitle(v);
            else if (k === 'conductingBody') setConductingBody(v);
            else if (k === 'totalVacancies') setTotalVacancies(v);
            else if (k === 'qualificationCriteria') setQualificationCriteria(v);
            else if (k === 'applicationFee') setApplicationFee(v);
            else if (k === 'salary') setSalary(v);
            else if (k === 'additionalDetails') setAdditionalDetails(v);
            else if (k === 'officialWebsite') setOfficialWebsite(v);
            else if (k === 'notificationUrl') setNotificationUrl(v);
            else if (k === 'description') setDescription(v);
            else if (k === 'age') setAge(v);
          }}
          onClose={() => setEditField(null)}
        />
      )}

      {/* Event Edit Modals */}
      <ChipModal
        visible={eventStageModal}
        title="Event Stage"
        options={LIFECYCLE_STAGES}
        selected={activeEvent?.stage}
        onSelect={(v) => activeEvent && handleEventUpdate(activeEvent.id, { stage: v, stageOrder: STAGE_ORDER_MAP[v as keyof typeof STAGE_ORDER_MAP] ?? activeEvent.stageOrder })}
        onClose={() => setEventStageModal(false)}
      />
      {activeEvent && (
        <TextEditModal
          visible={eventTitleModal}
          title="Event Title"
          value={activeEvent.title}
          onSave={(v) => handleEventUpdate(activeEvent.id, { title: v })}
          onClose={() => setEventTitleModal(false)}
        />
      )}
      {activeEvent && eventDateModal.open && (
        <DateTimePicker
          value={
            eventDateModal.type === 'start'
              ? (activeEvent.startsAt ? new Date(activeEvent.startsAt) : new Date())
              : (activeEvent.endsAt ? new Date(activeEvent.endsAt) : new Date())
          }
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(e, d) => {
            setEventDateModal({ open: false, type: 'start' });
            if (e.type === 'set' && d) {
              const field = eventDateModal.type === 'start' ? 'startsAt' : 'endsAt';
              handleEventUpdate(activeEvent.id, { [field]: d.toISOString() });
            }
          }}
        />
      )}
      {activeEvent && (
        <TextEditModal
          visible={eventOrderModal}
          title="Display Order (priority)"
          value={activeEvent?.stageOrder?.toString() ?? '0'}
          keyboardType="numeric"
          suggestions={['10', '20', '30', '40', '50', '60', '70', '80', '90', '100']}
          onSave={(v) => activeEvent && handleEventUpdate(activeEvent.id, { stageOrder: parseInt(v) || activeEvent.stageOrder })}
          onClose={() => setEventOrderModal(false)}
        />
      )}
      {activeEvent && (
        <TextEditModal
          visible={eventDescriptionModal}
          title="Event Details"
          value={activeEvent?.description ?? ''}
          multiline
          onSave={(v) => handleEventUpdate(activeEvent.id, { description: v })}
          onClose={() => setEventDescriptionModal(false)}
        />
      )}

      <ChipModal visible={catModal} title="Exam Category" options={EXAM_CATEGORIES} selected={category} onSelect={setCategory} onClose={() => setCatModal(false)} />
      <ChipModal visible={levelModal} title="Exam Level" options={EXAM_LEVELS} selected={examLevel} onSelect={setExamLevel} onClose={() => setLevelModal(false)} />
      <ChipModal visible={statusModal} title="Exam Status" options={EXAM_STATUSES} selected={examStatus} onSelect={setExamStatus} onClose={() => setStatusModal(false)} />
      <ChipModal
        visible={stateModal}
        title="State / Region"
        options={[
          'All India', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
          'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala',
          'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha',
          'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
          'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu & Kashmir', 'Ladakh'
        ]}
        selected={state}
        onSelect={setState}
        onClose={() => setStateModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  loadingCentered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 16, color: '#4F46E5', fontSize: 16, fontWeight: '800', letterSpacing: 1 },
  scrollContent: { paddingBottom: 120 },

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
    width: 40, height: 40, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center', alignItems: 'center',
  },
  headerTitles: { flex: 1 },
  headerTitleTiny: { fontSize: 10, fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 },
  headerTitleMain: { fontSize: 16, fontWeight: '800', color: '#f8fafc' },

  mainContent: { paddingHorizontal: 16 },
  aiNotesWrapper: { marginBottom: 12 },
  aiNotesBanner: {
    flexDirection: 'row',
    gap: 12,
    padding: 12,
    borderRadius: 16,
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#dbeafe',
    alignItems: 'center',
  },
  aiNotesText: { flex: 1, fontSize: 12, color: '#1e40af', fontWeight: '600', lineHeight: 18 },

  // Timeline UI
  timelineHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingHorizontal: 4 },
  timelineHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: { fontSize: 11, fontWeight: '900', color: '#64748b', textTransform: 'uppercase', letterSpacing: 1.5 },
  completionBadge: { backgroundColor: '#f1f5f9', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, marginLeft: 8 },
  completionBadgeText: { fontSize: 8, fontWeight: '900', color: '#64748b' },
  addEventBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#3b82f6', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  addEventBtnText: { color: '#FFF', fontWeight: '800', fontSize: 11 },
  timelineContainer: { marginBottom: 20, paddingLeft: 8, borderLeftWidth: 2, borderLeftColor: '#f1f5f9', marginLeft: 8 },
  emptyEvents: { alignItems: 'center', padding: 32, backgroundColor: '#FFF', borderRadius: 24, borderWidth: 2, borderColor: '#F3F4F6', borderStyle: 'dashed' },
  emptyEventsText: { marginTop: 12, color: '#9CA3AF', fontWeight: '700', fontSize: 14 },
  createFirstBtn: { marginTop: 20, paddingHorizontal: 24, paddingVertical: 12, backgroundColor: '#F5F7FF', borderRadius: 16 },
  createFirstText: { color: '#4F46E5', fontWeight: '800', fontSize: 14 },

  // Custom Field Style
  customFieldRow: { flexDirection: 'row', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  fieldLabel: { fontSize: 11, fontWeight: '800', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 },
  fieldValue: { fontSize: 16, fontWeight: '600', color: '#1F2937' },
  fieldValueEmpty: { color: '#D1D5DB', fontStyle: 'italic' },
  fieldIconBadge: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#F5F7FF', justifyContent: 'center', alignItems: 'center' },

  footerInfo: { paddingVertical: 16, alignItems: 'center', gap: 4 },
  footerInfoRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  footerInfoText: { fontSize: 12, color: '#9CA3AF', fontWeight: '600' },
  footerDateText: { fontSize: 11, color: '#9CA3AF', fontWeight: '500' },

  quickOpsContainer: { marginBottom: 20 },
  quickOpsRow: { flexDirection: 'row', alignItems: 'center' },
  opsCard: { flex: 1, backgroundColor: '#FFF', borderRadius: 20, padding: 12, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  opsIconBox: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#f8fafc', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  opsLabel: { fontSize: 9, color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase', marginBottom: 2 },
  opsValue: { fontSize: 13, color: '#111827', fontWeight: '800' },

  // Action Bar
  actionBar: { 
    position: 'absolute', bottom: 24, left: 16, right: 16, 
    flexDirection: 'row', gap: 8, padding: 12, 
    borderRadius: 24, backgroundColor: '#1e293b', 
    shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 20, elevation: 20,
    alignItems: 'center',
  },
  actionBarBtn: { flex: 1, borderRadius: 14, overflow: 'hidden', height: 48, justifyContent: 'center', alignItems: 'center' },
  actionBarLabel: { color: '#FFF', fontWeight: '900', fontSize: 13 },
  rejectBtn: { backgroundColor: '#ef4444', flexDirection: 'row', gap: 6 },
  flagBtn: { backgroundColor: '#f59e0b', flexDirection: 'row', gap: 6 },
  approveBtn: { flex: 1.8 },
  approveGradient: { width: '100%', height: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },

  // Modals
  modalBg: { flex: 1, backgroundColor: '#FFF' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  modalHeaderTitle: { fontSize: 20, fontWeight: '900', color: '#111827' },
  circularBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#F9FAFB', justifyContent: 'center', alignItems: 'center' },
  submitBtn: { backgroundColor: '#4F46E5', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 14 },
  submitBtnText: { color: '#FFF', fontWeight: '800', fontSize: 14 },
  promoteAlert: { flexDirection: 'row', gap: 16, backgroundColor: '#ECFDF5', padding: 20, borderRadius: 24, marginBottom: 32, borderLeftWidth: 6, borderLeftColor: '#10B981' },
  promoteAlertTitle: { fontSize: 16, fontWeight: '900', color: '#065F46', marginBottom: 4 },
  promoteAlertText: { fontSize: 14, color: '#065F46', fontWeight: '600', lineHeight: 20 },
  noteInputLabel: { fontSize: 13, fontWeight: '800', color: '#6B7280', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 16, paddingLeft: 4 },
  decisionInput: { borderWidth: 2, borderColor: '#F3F4F6', borderRadius: 24, padding: 24, fontSize: 17, color: '#111827', backgroundColor: '#F9FAFB', minHeight: 180 },
});
