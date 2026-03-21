import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Alert, TextInput, ActivityIndicator, Modal,
  Dimensions, Switch, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import {
  ArrowLeft,
  Clock,
  FileText,
  Globe,
  Info,
  Layers,
  ShieldCheck,
  X,
  Rocket,
  Plus,
  Link as LinkIcon,
  Trash2,
  Megaphone,
  Send,
  ChevronRight,
  ChevronDown,
  Layout,
  Star as StarIcon
} from 'lucide-react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { examService, lifecycleService, Exam, LifecycleEvent } from '@/services/api.service';
import {
  EXAM_CATEGORIES,
  EXAM_LEVELS,
  EXAM_STATUSES,
  LIFECYCLE_STAGES,
  STAGE_ORDER_MAP
} from '@/constants/enums';

// Components
import { StagedSection } from '@/components/staged/StagedSection';
import { StagedField } from '@/components/staged/StagedField';
import { StagedEventCard } from '@/components/staged/StagedEventCard';
import { ChipModal } from '@/components/staged/ChipModal';
import { TextEditModal } from '@/components/staged/TextEditModal';

const { width } = Dimensions.get('window');

export default function ExamDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [exam, setExam] = useState<Exam | null>(null);
  const [events, setEvents] = useState<LifecycleEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Field states (synced with DB)
  const [title, setTitle] = useState('');
  const [shortTitle, setShortTitle] = useState('');
  const [conductingBody, setConductingBody] = useState('');
  const [category, setCategory] = useState('');
  const [examLevel, setExamLevel] = useState('');
  const [examStatus, setExamStatus] = useState('');
  const [state, setState] = useState('');
  const [age, setAge] = useState('');
  const [totalVacancies, setTotalVacancies] = useState('');
  const [qualificationCriteria, setQualificationCriteria] = useState('');
  const [applicationFee, setApplicationFee] = useState('');
  const [salary, setSalary] = useState('');
  const [additionalDetails, setAdditionalDetails] = useState('');
  const [officialWebsite, setOfficialWebsite] = useState('');
  const [notificationUrl, setNotificationUrl] = useState('');
  const [description, setDescription] = useState('');
  const [isPublished, setIsPublished] = useState(true);

  // UI States
  const [editField, setEditField] = useState<{ key: string; title: string; value: string; multiline?: boolean; numeric?: boolean } | null>(null);
  const [catModal, setCatModal] = useState(false);
  const [levelModal, setLevelModal] = useState(false);
  const [statusModal, setStatusModal] = useState(false);
  const [stateModal, setStateModal] = useState(false);

  // Notification Modal States
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [notifying, setNotifying] = useState(false);
  const [notifyType, setNotifyType] = useState<'CUSTOM' | 'RESULT' | 'ADMIT_CARD' | 'REGISTRATION' | 'EXAM_DATE'>('CUSTOM');
  const [notifyAudience, setNotifyAudience] = useState<'BOOKMARKED' | 'INTERESTED'>('BOOKMARKED');
  const [notifyTitle, setNotifyTitle] = useState('');
  const [notifyBody, setNotifyBody] = useState('');

  // Event Edit Helper States
  const [activeEvent, setActiveEvent] = useState<LifecycleEvent | null>(null);
  const [eventStageModal, setEventStageModal] = useState(false);
  const [eventTitleModal, setEventTitleModal] = useState(false);
  const [eventOrderModal, setEventOrderModal] = useState(false);
  const [eventDescriptionModal, setEventDescriptionModal] = useState(false);
  const [eventDateModal, setEventDateModal] = useState<{ open: boolean; type: 'start' | 'end' }>({ open: false, type: 'start' });

  const fetchData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [res, timelineRes] = await Promise.all([
        examService.getExamById(id),
        lifecycleService.getEventsByExamId(id)
      ]);
      const e = res.data || res;
      setExam(e);
      setEvents(timelineRes.data?.events || timelineRes.data || (Array.isArray(timelineRes) ? timelineRes : []));

      setTitle(e.title ?? '');
      setShortTitle(e.shortTitle ?? '');
      setConductingBody(e.conductingBody ?? '');
      setCategory(e.category ?? '');
      setExamLevel(e.examLevel ?? '');
      setExamStatus(e.status ?? '');
      setState(e.state ?? '');
      setAge(e.age ?? '');
      setTotalVacancies(e.totalVacancies ?? '');
      setQualificationCriteria(e.qualificationCriteria ?? '');
      setApplicationFee(e.applicationFee ?? '');
      setSalary(e.salary ?? '');
      setAdditionalDetails(e.additionalDetails ?? '');
      setOfficialWebsite(e.officialWebsite ?? '');
      setNotificationUrl(e.notificationUrl ?? '');
      setDescription(e.description ?? '');
      setIsPublished(e.isPublished ?? true);
    } catch (e) {
      Alert.alert('Error', 'Failed to load exam details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleUpdateField = async (key: string, value: any) => {
    if (!id) return;
    setUpdating(true);
    try {
      await examService.updateExam(id, { [key]: value });
      // Update local state is handled by the calling onSave
    } catch (e: any) {
      Alert.alert('Update Failed', e?.response?.data?.error?.message ?? 'Unknown error');
      fetchData(); // Rollback
    } finally {
      setUpdating(false);
    }
  };

  const handleAddEvent = () => {
    router.push({
      pathname: '/add-event',
      params: {
        examId: id,
        examTitle: exam?.shortTitle || exam?.title,
      }
    });
  };

  const handleEventUpdate = async (eventId: string, data: any) => {
    try {
      await lifecycleService.updateEvent(id!, eventId, data);
      setEvents((prev) => prev.map((ev) => ev.id === eventId ? { ...ev, ...data } : ev));
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.error?.message ?? 'Update failed');
    }
  };

  const handleEventDelete = async (eventId: string) => {
    try {
      await lifecycleService.deleteEvent(id!, eventId);
      setEvents((prev) => prev.filter((ev) => ev.id !== eventId));
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.error?.message ?? 'Delete failed');
    }
  };

  // Notification Broadcast Logic
  const handleSendNotification = async () => {
    if (!id) return;
    try {
      setNotifying(true);
      const result = await examService.notifyBookmarkedUsers(id, notifyTitle, notifyBody, notifyAudience);
      Alert.alert('Success', `Notification sent to  users.`);
      setShowNotifyModal(false);
      resetNotifyForm();
    } catch (err) {
      Alert.alert('Error', 'Failed to send notification');
    } finally {
      setNotifying(false);
    }
  };

  const resetNotifyForm = () => {
    setNotifyType('CUSTOM');
    setNotifyAudience('BOOKMARKED');
    setNotifyTitle('');
    setNotifyBody('');
  };

  const handleNotifyTypeSelect = (type: typeof notifyType) => {
    setNotifyType(type);
    if (!exam) return;
    const sTitle = exam.shortTitle || exam.title;
    switch (type) {
      case 'RESULT':
        setNotifyTitle(`🎉 Result Declared: ${sTitle}`);
        setNotifyBody(`${sTitle} results are now available. Check your status now!`);
        break;
      case 'ADMIT_CARD':
        setNotifyTitle(`🎟️ Admit Card Out: ${sTitle}`);
        setNotifyBody(`Download your admit card for ${sTitle}. Tap to view links.`);
        break;
      case 'REGISTRATION':
        setNotifyTitle(`📝 Apply Now: ${sTitle}`);
        setNotifyBody(`Registration for ${sTitle} has started. Don't miss the deadline!`);
        break;
      case 'EXAM_DATE':
        setNotifyTitle(`📅 Exam Dates Announced: ${sTitle}`);
        setNotifyBody(`The examination dates for ${sTitle} have been officially announced.`);
        break;
      default:
        setNotifyTitle('');
        setNotifyBody('');
    }
  };

  const handleDeleteExam = () => {
    Alert.alert('Delete Exam', 'Irreversible action. All events and user bookmarks will be purged.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete Everywhere', style: 'destructive', onPress: async () => {
          try {
            await examService.deleteExam(id!);
            router.back();
          } catch (e) { Alert.alert('Error', 'Deletion failed'); }
        }
      }
    ]);
  };

  if (loading) {
    return (
      <View style={styles.loadingCentered}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  if (!exam) return null;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Stack.Screen options={{ headerShown: false }} />

      {/* Floating Midnight Header */}
      <View style={styles.floatingHeader}>
        <LinearGradient colors={['#0f172a', '#1e293b']} style={styles.headerGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerBackBtn}>
            <ArrowLeft size={18} color="#cbd5e1" strokeWidth={3} />
          </TouchableOpacity>
          <View style={styles.headerTitles}>
            <Text style={styles.headerTitleTiny}>Exam Management</Text>
            <Text style={styles.headerTitleMain} numberOfLines={1}>{exam.shortTitle || exam.title}</Text>
          </View>
          <TouchableOpacity onPress={handleDeleteExam} style={styles.headerDeleteBtn}>
            <Trash2 size={18} color="#ef4444" strokeWidth={2.5} />
          </TouchableOpacity>
        </LinearGradient>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={{ height: 110 }} />
        <View style={styles.mainContent}>
          {/* Broadcaster Quick Access */}
          <TouchableOpacity
            style={styles.notifyBanner}
            onPress={() => setShowNotifyModal(true)}
            activeOpacity={0.9}
          >
            <LinearGradient colors={['#8B5CF6', '#6366F1']} style={styles.notifyBannerGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <View style={styles.notifyContent}>
                <View style={styles.notifyIconWrapper}><Megaphone size={24} color="#FFF" /></View>
                <View>
                  <Text style={styles.notifyTitleText}>Broadcast Update</Text>
                  <Text style={styles.notifySubtitleText}>Send push to bookmarked users</Text>
                </View>
              </View>
              <ChevronRight size={20} color="#FFF" />
            </LinearGradient>
          </TouchableOpacity>

          {/* Quick Operational Controls */}
          <View style={styles.quickOpsContainer}>
            <View style={styles.quickOpsRow}>
              <TouchableOpacity style={styles.opsCard} onPress={() => setStatusModal(true)}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.opsLabel}>Current Phase</Text>
                  <Text style={styles.opsValue} numberOfLines={1}>{examStatus ? examStatus.replace(/_/g, ' ') : 'Not Set'}</Text>
                </View>
                <ChevronDown size={14} color="#94a3b8" />
              </TouchableOpacity>

              <View style={[styles.opsCard, { marginLeft: 10 }]}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.opsLabel}>Live Visibility</Text>
                  <Text style={[styles.opsValue, { color: isPublished ? "#10b981" : "#64748b" }]}>{isPublished ? 'Searchable' : 'Hidden'}</Text>
                </View>
                <Switch
                  value={isPublished}
                  onValueChange={(v: boolean) => { setIsPublished(v); handleUpdateField('isPublished', v); }}
                  trackColor={{ false: '#e2e8f0', true: '#818cf8' }}
                  thumbColor={isPublished ? '#4f46e5' : '#f8fafc'}
                  style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
                />
              </View>
            </View>
          </View>

          {/* Timeline View - Admin Fast Changes */}
          {(() => {
            const pastCount = events.filter(ev => !ev.isTBD && (ev.endsAt ? new Date(ev.endsAt) < new Date() : ev.startsAt ? new Date(ev.startsAt) < new Date() : false)).length;
            return (
              <View style={styles.timelineHeader}>
                <View style={styles.timelineHeaderLeft}>
                  <Clock size={16} color="#3b82f6" strokeWidth={3} />
                  <Text style={styles.sectionTitle}>Timeline Flow</Text>
                  {events.length > 0 && (
                    <View style={styles.completionBadge}>
                      <Text style={styles.completionBadgeText}>{pastCount}/{events.length} COMPLETED</Text>
                    </View>
                  )}
                </View>
                <TouchableOpacity style={styles.addEventBtn} onPress={handleAddEvent}>
                  <Plus size={14} color="#FFF" strokeWidth={3} />
                  <Text style={styles.addEventBtnText}>Add Event</Text>
                </TouchableOpacity>
              </View>
            );
          })()}

          <View style={styles.timelineContainer}>
            {events.length === 0 ? (
              <View style={styles.emptyEvents}>
                <Clock size={40} color="#cbd5e1" strokeWidth={1.5} />
                <Text style={styles.emptyEventsText}>No active timeline found</Text>
              </View>
            ) : (
              events
                .slice()
                .sort((a, b) => a.stageOrder - b.stageOrder)
                .map((ev) => (
                  <StagedEventCard
                    key={ev.id}
                    event={ev as any}
                    onUpdate={handleEventUpdate}
                    onDelete={handleEventDelete}
                    onOpenStageModal={(e) => { setActiveEvent(e as any); setEventStageModal(true); }}
                    onOpenTitleModal={(e) => { setActiveEvent(e as any); setEventTitleModal(true); }}
                    onOpenDateModal={(e, type) => { setActiveEvent(e as any); setEventDateModal({ open: true, type }); }}
                    onOpenOrderModal={(e) => { setActiveEvent(e as any); setEventOrderModal(true); }}
                    onOpenDescriptionModal={(e) => { setActiveEvent(e as any); setEventDescriptionModal(true); }}
                  />
                ))
            )}
          </View>

          {/* Core Fields */}
          <StagedSection title="Identity & Discovery" icon={FileText}>
            <StagedField label="Full Official Title" value={title} multiline onEdit={() => setEditField({ key: 'title', title: 'Display Title', value: title, multiline: true })} />
            <StagedField label="Short Name (Code)" value={shortTitle} onEdit={() => setEditField({ key: 'shortTitle', title: 'Short Title', value: shortTitle })} />
            <StagedField label="Conducting Body" value={conductingBody} onEdit={() => setEditField({ key: 'conductingBody', title: 'Board / Authority', value: conductingBody })} />

            <TouchableOpacity style={styles.customFieldRow} onPress={() => setCatModal(true)}>
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>Discovery Category</Text>
                <Text style={[styles.fieldValue, !category && styles.fieldValueEmpty]}>{category ? category.replace(/_/g, ' ') : 'Not Categorized'}</Text>
              </View>
              <View style={styles.fieldIconBadge}><Layers size={18} color="#6366F1" strokeWidth={2.5} /></View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.customFieldRow} onPress={() => setLevelModal(true)}>
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>Visibility Level</Text>
                <Text style={[styles.fieldValue, !examLevel && styles.fieldValueEmpty]}>{examLevel || 'Not Specified'}</Text>
              </View>
              <View style={styles.fieldIconBadge}><Layout size={18} color="#6366F1" strokeWidth={2.5} /></View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.customFieldRow} onPress={() => setStateModal(true)}>
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>State / Region</Text>
                <Text style={[styles.fieldValue, !state && styles.fieldValueEmpty]}>{state || 'All India'}</Text>
              </View>
              <View style={styles.fieldIconBadge}><Globe size={18} color="#6366F1" strokeWidth={2.5} /></View>
            </TouchableOpacity>

            <StagedField label="Marketing Description" value={description} multiline onEdit={() => setEditField({ key: 'description', title: 'Exam Overview', value: description, multiline: true })} />
          </StagedSection>

          <StagedSection title="Eligibility Matrix" icon={ShieldCheck}>
            <StagedField label="Age Limit" value={age} onEdit={() => setEditField({ key: 'age', title: 'Age Limit', value: age })} />
            <StagedField label="Total Openings" value={totalVacancies} multiline onEdit={() => setEditField({ key: 'totalVacancies', title: 'Vacancy Count', value: totalVacancies, multiline: true })} />
            <StagedField label="Educational Criteria" value={qualificationCriteria} multiline onEdit={() => setEditField({ key: 'qualificationCriteria', title: 'Eligibility Criteria', value: qualificationCriteria, multiline: true })} />
            <StagedField label="Pay Scale / Grade" value={salary} multiline onEdit={() => setEditField({ key: 'salary', title: 'Salary Details', value: salary, multiline: true })} />
            <StagedField label="Fee Structure" value={applicationFee} multiline onEdit={() => setEditField({ key: 'applicationFee', title: 'Application Fees', value: applicationFee, multiline: true })} />
            <StagedField label="Additional Intelligence" value={additionalDetails} multiline isLast onEdit={() => setEditField({ key: 'additionalDetails', title: 'Public Notes', value: additionalDetails, multiline: true })} />
          </StagedSection>

          <StagedSection title="Official Assets" icon={LinkIcon}>
            <StagedField label="Primary Website" value={officialWebsite} onEdit={() => setEditField({ key: 'officialWebsite', title: 'Official Portal', value: officialWebsite })} />
            <StagedField label="Notification PDF" value={notificationUrl} isLast onEdit={() => setEditField({ key: 'notificationUrl', title: 'Notification URL', value: notificationUrl })} />
          </StagedSection>

          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* Broadcast Modal */}
      <Modal visible={showNotifyModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowNotifyModal(false)}>
        <SafeAreaView style={styles.modalBg}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowNotifyModal(false)} style={styles.circularBtn}><X size={20} color="#6B7280" /></TouchableOpacity>
            <Text style={styles.modalHeaderTitle}>Broadcast Update</Text>
            <TouchableOpacity onPress={handleSendNotification} disabled={notifying} style={styles.submitBtn}>
              {notifying ? <ActivityIndicator size="small" color="#FFF" /> : <Text style={styles.submitBtnText}>Send</Text>}
            </TouchableOpacity>
          </View>
          <ScrollView style={{ padding: 24 }} keyboardShouldPersistTaps="handled">
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Targeting Audience</Text>
              <View style={styles.audienceSelector}>
                <TouchableOpacity style={[styles.audienceChip, notifyAudience === 'BOOKMARKED' && styles.audienceChipActive]} onPress={() => setNotifyAudience('BOOKMARKED')}>
                  <Text style={[styles.audienceText, notifyAudience === 'BOOKMARKED' && styles.audienceTextActive]}>Bookmarked</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.audienceChip, notifyAudience === 'INTERESTED' && styles.audienceChipActive]} onPress={() => setNotifyAudience('INTERESTED')}>
                  <Text style={[styles.audienceText, notifyAudience === 'INTERESTED' && styles.audienceTextActive]}>Interested</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Smart Templates</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {['CUSTOM', 'RESULT', 'ADMIT_CARD', 'REGISTRATION', 'EXAM_DATE'].map((t) => (
                  <TouchableOpacity key={t} style={[styles.typeChip, notifyType === t && styles.typeChipActive]} onPress={() => handleNotifyTypeSelect(t as any)}>
                    <Text style={[styles.typeChipText, notifyType === t && styles.typeChipTextActive]}>{t.replace('_', ' ')}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Alert Title</Text>
              <TextInput style={styles.input} value={notifyTitle} onChangeText={setNotifyTitle} placeholder="Notification heading..." />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Body Content</Text>
              <TextInput style={[styles.input, styles.textArea]} value={notifyBody} onChangeText={setNotifyBody} placeholder="Full message context..." multiline numberOfLines={4} />
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Editing Modals */}
      {editField && (
        <TextEditModal
          visible={true}
          title={editField?.title ?? ''}
          value={editField?.value ?? ''}
          multiline={editField?.multiline}
          keyboardType={editField?.numeric ? 'numeric' : 'default'}
          onSave={async (v) => {
            if (!editField) return;
            const k = editField.key;
            await handleUpdateField(k, v);
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

      <ChipModal visible={catModal} title="Exam Category" options={EXAM_CATEGORIES} selected={category} onSelect={(v) => { setCategory(v); handleUpdateField('category', v); }} onClose={() => setCatModal(false)} />
      <ChipModal visible={levelModal} title="Exam Level" options={EXAM_LEVELS} selected={examLevel} onSelect={(v) => { setExamLevel(v); handleUpdateField('examLevel', v); }} onClose={() => setLevelModal(false)} />
      <ChipModal visible={statusModal} title="Exam Phase" options={EXAM_STATUSES} selected={examStatus} onSelect={(v) => { setExamStatus(v); handleUpdateField('status', v); }} onClose={() => setStatusModal(false)} />
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
        onSelect={(v) => { setState(v); handleUpdateField('state', v); }}
        onClose={() => setStateModal(false)}
      />

      <ChipModal
        visible={eventStageModal}
        title="Stage"
        options={LIFECYCLE_STAGES}
        selected={activeEvent?.stage}
        onSelect={(v) => activeEvent && handleEventUpdate(activeEvent.id, { stage: v, stageOrder: STAGE_ORDER_MAP[v as keyof typeof STAGE_ORDER_MAP] ?? activeEvent.stageOrder })}
        onClose={() => setEventStageModal(false)}
      />
      {activeEvent && (
        <TextEditModal
          visible={eventTitleModal}
          title="Event Title"
          value={activeEvent?.title ?? ''}
          onSave={(v) => activeEvent && handleEventUpdate(activeEvent.id, { title: v })}
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
          onSave={(v) => activeEvent && handleEventUpdate(activeEvent.id, { description: v })}
          onClose={() => setEventDescriptionModal(false)}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  loadingCentered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { paddingBottom: 100 },

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
  headerDeleteBtn: {
    width: 36, height: 36, borderRadius: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    justifyContent: 'center', alignItems: 'center',
  },

  mainContent: { paddingHorizontal: 16 },

  notifyBanner: { marginBottom: 16, borderRadius: 20, overflow: 'hidden', elevation: 12, shadowColor: '#3b82f6', shadowOpacity: 0.3, shadowRadius: 15 },
  notifyBannerGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14 },
  notifyContent: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  notifyIconWrapper: { width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
  notifyTitleText: { color: '#FFF', fontWeight: '900', fontSize: 16 },
  notifySubtitleText: { color: 'rgba(255,255,255,0.8)', fontSize: 12 },

  timelineHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingHorizontal: 4 },
  timelineHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: { fontSize: 11, fontWeight: '900', color: '#64748b', textTransform: 'uppercase', letterSpacing: 1.5 },
  completionBadge: { backgroundColor: '#f1f5f9', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, marginLeft: 8 },
  completionBadgeText: { fontSize: 8, fontWeight: '900', color: '#64748b' },
  addEventBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#3b82f6', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  addEventBtnText: { color: '#FFF', fontWeight: '800', fontSize: 11 },
  timelineContainer: { marginBottom: 20, paddingLeft: 8, borderLeftWidth: 2, borderLeftColor: '#f1f5f9', marginLeft: 8 },
  emptyEvents: { alignItems: 'center', padding: 32, backgroundColor: '#FFF', borderRadius: 24, borderStyle: 'dashed', borderWidth: 1, borderColor: '#cbd5e1' },
  emptyEventsText: { marginTop: 12, color: '#94a3b8', fontWeight: '600' },

  customFieldRow: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  fieldLabel: { fontSize: 10, fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  fieldValue: { fontSize: 15, fontWeight: '700', color: '#1e293b' },
  fieldValueEmpty: { color: '#cbd5e1', fontStyle: 'italic' },
  fieldIconBadge: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center' },

  quickOpsContainer: { marginBottom: 20 },
  quickOpsRow: { flexDirection: 'row', alignItems: 'center' },
  opsCard: { flex: 1, backgroundColor: '#FFF', borderRadius: 20, padding: 12, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  opsIconBox: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#f8fafc', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  opsLabel: { fontSize: 9, color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase', marginBottom: 2 },
  opsValue: { fontSize: 13, color: '#1e293b', fontWeight: '800' },

  publishToggleRow: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#f8fafc', borderRadius: 16, marginTop: 8, marginHorizontal: 8, marginBottom: 8 },

  modalBg: { flex: 1, backgroundColor: '#FFF' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  modalHeaderTitle: { fontSize: 20, fontWeight: '900', color: '#111827' },
  circularBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#F9FAFB', justifyContent: 'center', alignItems: 'center' },
  submitBtn: { backgroundColor: '#4F46E5', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 14 },
  submitBtnText: { color: '#FFF', fontWeight: '800', fontSize: 14 },

  inputGroup: { marginBottom: 24 },
  inputLabel: { fontSize: 12, fontWeight: '800', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
  input: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#F3F4F6', borderRadius: 16, padding: 16, fontSize: 16, color: '#1F2937' },
  textArea: { minHeight: 120, textAlignVertical: 'top' },

  audienceSelector: { flexDirection: 'row', gap: 12 },
  audienceChip: { flex: 1, padding: 14, borderRadius: 14, backgroundColor: '#F9FAFB', alignItems: 'center', borderWidth: 1, borderColor: '#F3F4F6' },
  audienceChipActive: { backgroundColor: '#4F46E5', borderColor: '#4F46E5' },
  audienceText: { fontWeight: '700', color: '#6B7280' },
  audienceTextActive: { color: '#FFF' },

  typeChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, backgroundColor: '#F9FAFB', marginRight: 8, borderWidth: 1, borderColor: '#F3F4F6' },
  typeChipActive: { backgroundColor: '#4F46E5', borderColor: '#4F46E5' },
  typeChipText: { fontWeight: '700', color: '#6B7280', fontSize: 13 },
  typeChipTextActive: { color: '#FFF' },
});
