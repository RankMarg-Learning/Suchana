
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, Alert } from 'react-native';
import { Calendar, Trash2, ChevronDown, CheckCircle2, Star, FileText } from 'lucide-react-native';
import Markdown from 'react-native-markdown-display';
import { StagedEvent } from '@/services/api.service';
import { LIFECYCLE_STAGES, LIFECYCLE_EVENT_TYPES, STAGE_ORDER_MAP } from '@/constants/enums';

interface StagedEventCardProps {
  event: StagedEvent;
  onUpdate: (id: string, data: any) => void;
  onDelete: (id: string) => void;
  onOpenStageModal: (event: StagedEvent) => void;
  onOpenTypeModal: (event: StagedEvent) => void;
  onOpenTitleModal: (event: StagedEvent) => void;
  onOpenDateModal: (event: StagedEvent, type: 'start' | 'end') => void;
  onOpenOrderModal: (event: StagedEvent) => void;
  onOpenDescriptionModal: (event: StagedEvent) => void;
}

export const StagedEventCardBase: React.FC<StagedEventCardProps> = ({
  event,
  onUpdate,
  onDelete,
  onOpenStageModal,
  onOpenTypeModal,
  onOpenTitleModal,
  onOpenDateModal,
  onOpenOrderModal,
  onOpenDescriptionModal,
}) => {
  const [isImportant, setIsImportant] = useState(event.isImportant);
  const [isTBD, setIsTBD] = useState(event.isTBD);

  const formatDate = (d?: string) => d ? new Date(d).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  }) : '';

  const isPast = !event.isTBD && (
    event.endsAt ? new Date(event.endsAt) < new Date() : 
    event.startsAt ? new Date(event.startsAt) < new Date() : false
  );

  const update = (data: any) => onUpdate(event.id, data);

  return (
    <View style={[
      styles.container, 
      isImportant && styles.importantContainer,
      isPast && styles.pastContainer
    ]}>
      <View style={styles.header}>
        <View style={styles.badges}>
          <TouchableOpacity onPress={() => onOpenStageModal(event)} style={styles.stagePill}>
            <Text style={styles.stagePillText}>{event.stage.replace(/_/g, ' ')}</Text>
            <ChevronDown size={10} color="#4F46E5" strokeWidth={3} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onOpenTypeModal(event)} style={styles.typePill}>
            <Text style={styles.typePillText}>{event.eventType.replace(/_/g, ' ')}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onOpenOrderModal(event)} style={styles.orderPill}>
            <Text style={styles.orderPillText}>#{event.stageOrder}</Text>
          </TouchableOpacity>
          {isPast && (
            <View style={styles.pastBadge}>
              <CheckCircle2 size={10} color="#64748b" strokeWidth={3} />
              <Text style={styles.pastBadgeText}>PAST</Text>
            </View>
          )}
        </View>
        <View style={styles.actions}>
          <TouchableOpacity 
            onPress={() => { setIsImportant(!isImportant); update({ isImportant: !isImportant }); }}
            style={[styles.starredIcon, isImportant && styles.starredActive]}
          >
            <Star size={16} color={isImportant ? '#F59E0B' : '#D1D5DB'} fill={isImportant ? '#F59E0B' : 'transparent'} strokeWidth={isImportant ? 2 : 2.5} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {
            Alert.alert('Delete Event', `Remove "${event.title}"?`, [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Delete', style: 'destructive', onPress: () => onDelete(event.id) },
            ]);
          }} style={styles.deleteBtn}>
            <Trash2 size={16} color="#EF4444" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity onPress={() => onOpenTitleModal(event)} style={styles.titleRow}>
        <Text style={[styles.titleText, isPast && styles.pastTitleText]}>{event.title}</Text>
        <Calendar size={12} color={isPast ? "#cbd5e1" : "#9CA3AF"} />
      </TouchableOpacity>

      <View style={styles.datesGrid}>
        <TouchableOpacity style={styles.dateChip} onPress={() => onOpenDateModal(event, 'start')}>
          <Text style={styles.dateLabel}>STARTS</Text>
          <Text style={[styles.dateValue, event.isTBD && styles.tbdValue]}>{event.isTBD ? 'TBD' : formatDate(event.startsAt) || '—'}</Text>
        </TouchableOpacity>
        <View style={styles.divider} />
        <TouchableOpacity style={styles.dateChip} onPress={() => onOpenDateModal(event, 'end')}>
          <Text style={styles.dateLabel}>ENDS</Text>
          <Text style={styles.dateValue}>{formatDate(event.endsAt) || '—'}</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.tbdControl} 
          onPress={() => { setIsTBD(!isTBD); update({ isTBD: !isTBD }); }}
          activeOpacity={0.7}
        >
          <Text style={styles.dateLabel}>DATE TBD</Text>
          <View style={[styles.miniCheck, isTBD && styles.miniCheckActive]}>
            {isTBD && <CheckCircle2 size={12} color="#FFF" strokeWidth={3} />}
          </View>
        </TouchableOpacity>
      </View>
      
      {event.description && (
        <TouchableOpacity style={styles.descriptionSection} onPress={() => onOpenDescriptionModal(event)}>
          <View style={isPast ? { opacity: 0.6 } : null}>
            <Markdown style={markdownStyles}>{event.description.replace(/\\n/g, '\n')}</Markdown>
          </View>
        </TouchableOpacity>
      )}
      {!event.description && (
         <TouchableOpacity style={styles.addDescription} onPress={() => onOpenDescriptionModal(event)}>
            <FileText size={10} color="#9CA3AF" />
            <Text style={styles.addDescriptionText}>Add details...</Text>
         </TouchableOpacity>
      )}
    </View>
  );
};

export const StagedEventCard = React.memo(StagedEventCardBase);

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#EEF2FF', // primary-50
    borderRadius: 16,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  importantContainer: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FEF3C7',
    borderWidth: 2,
    shadowColor: '#F59E0B',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  pastContainer: {
    backgroundColor: '#f8fafc',
    borderColor: '#e2e8f0',
    opacity: 0.85,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
  },
  stagePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  stagePillText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#4F46E5',
    textTransform: 'uppercase',
  },
  orderPill: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  orderPillText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#EF4444',
  },
  typePill: {
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  typePillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#6B7280',
    textTransform: 'uppercase',
  },
  pastBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  pastBadgeText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#64748b',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  starredIcon: {
    padding: 2,
  },
  starredActive: {
    // color: '#F59E0B'
  },
  deleteBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  titleText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
    lineHeight: 20,
  },
  pastTitleText: {
    color: '#94a3b8',
    textDecorationLine: 'line-through',
    textDecorationStyle: 'solid',
  },
  datesGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 12,
    gap: 12,
  },
  dateChip: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
  },
  tbdValue: {
    color: '#F59E0B',
  },
  divider: {
    width: 1,
    height: 20,
    backgroundColor: '#E5E7EB',
  },
  tbdControl: {
    alignItems: 'center',
    paddingLeft: 4,
  },
  miniCheck: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  miniCheckActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  descriptionSection: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  addDescription: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
    paddingLeft: 4,
  },
  addDescriptionText: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '600',
  },
});

const markdownStyles: any = {
  body: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 18,
    fontWeight: '500',
  },
  paragraph: {
    marginTop: 0,
    marginBottom: 4,
  },
  strong: {
    fontWeight: '700',
    color: '#374151',
  },
};
