
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LifecycleEvent } from '../services/api.service';
import { format } from 'date-fns';
import { LifecycleStage, LifecycleEventType } from '@/constants/enums';

interface TimelineItemProps {
  event: LifecycleEvent;
  isLast: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const TimelineItem: React.FC<TimelineItemProps> = ({ event, isLast, onEdit, onDelete }) => {
  const isImportant = !!event.isImportant;
  const isTBD = !!event.isTBD;

  return (
    <View style={[styles.container, isImportant && styles.importantContainer]}>
      <View style={styles.timeline}>
        <View style={[
          styles.dot, 
          isTBD ? styles.dotTBD : styles.dotActive,
          isImportant && styles.dotImportant
        ]}>
          {isImportant && <Ionicons name="star" size={8} color="#FFF" />}
        </View>
        {!isLast && <View style={styles.line} />}
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <View style={styles.titleRow}>
              {event.stage ? (
                <View style={[styles.stageBadge, { backgroundColor: getStageColor(event.stage as LifecycleStage) }]}>
                  <Text style={styles.stageText}>{event.stage.replace(/_/g, ' ')}</Text>
                </View>
              ) : null}
              <Text style={[styles.title, isImportant && styles.importantTitle]}>{event.title}</Text>
              {isTBD && (
                <View style={styles.tbdBadge}>
                  <Text style={styles.tbdText}>TBD</Text>
                </View>
              )}
            </View>
            <View style={styles.typeRow}>
              <View style={styles.eventTypeBadge}>
                <Text style={styles.type}>{event.eventType.replace(/_/g, ' ')}</Text>
              </View>
              {event.isImportant && (
                <View style={styles.priorityBadge}>
                  <Ionicons name="flash" size={10} color="#F59E0B" />
                  <Text style={styles.priorityText}>PRIORITY</Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.actionButtons}>
            {onEdit && (
              <TouchableOpacity style={styles.actionBtn} onPress={onEdit}>
                <Ionicons name="pencil-outline" size={18} color="#4F46E5" />
              </TouchableOpacity>
            )}
            {onDelete && (
              <TouchableOpacity style={styles.actionBtn} onPress={onDelete}>
                <Ionicons name="trash-outline" size={18} color="#EF4444" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.timeRow}>
          <Ionicons name="calendar-outline" size={14} color="#6B7280" />
          <Text style={[styles.timeText, isTBD && styles.tbdTimeText]}>
            {isTBD ? 'Dates to be announced' : (
              event.startsAt 
                ? format(new Date(event.startsAt), 'MMM dd, yyyy • hh:mm a') 
                : 'No start date'
            )}
            {event.endsAt && !isTBD && ` — ${format(new Date(event.endsAt), 'MMM dd')}`}
          </Text>
        </View>

        {event.description && (
          <Text style={styles.description} numberOfLines={3}>{event.description}</Text>
        )}

        {event.actionUrl && (
          <View style={styles.actionLinkRow}>
            <Ionicons name="return-down-forward" size={14} color="#4F46E5" />
            <Text style={styles.actionLink}>
              {event.actionLabel || 'Direct Link'}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const getStageColor = (stage: LifecycleStage) => {
  switch (stage) {
    case LifecycleStage.NOTIFICATION: return '#6366F1';
    case LifecycleStage.REGISTRATION: return '#10B981';
    case LifecycleStage.ADMIT_CARD: return '#F59E0B';
    case LifecycleStage.EXAM: return '#EF4444';
    case LifecycleStage.RESULT: return '#8B5CF6';
    default: return '#6B7280';
  }
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    minHeight: 100,
    backgroundColor: 'transparent',
  },
  importantContainer: {
    backgroundColor: '#FFFBEB',
    borderRadius: 16,
    marginHorizontal: -8,
    paddingHorizontal: 8,
    paddingVertical: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  timeline: {
    width: 24,
    alignItems: 'center',
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    zIndex: 2,
    marginTop: 8,
    borderWidth: 2,
    borderColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotActive: { backgroundColor: '#4F46E5' },
  dotTBD: { backgroundColor: '#9CA3AF' },
  dotImportant: { backgroundColor: '#F59E0B', width: 18, height: 18, borderRadius: 9 },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: '#E5E7EB',
    marginTop: -4,
  },
  content: {
    flex: 1,
    paddingLeft: 16,
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  stageBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  stageText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#FFF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  importantTitle: { color: '#B45309' },
  tbdBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  tbdText: { fontSize: 8, fontWeight: '800', color: '#6B7280' },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  eventTypeBadge: {
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  type: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  priorityText: { fontSize: 9, fontWeight: '900', color: '#D97706' },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
    opacity: 0.8,
  },
  timeText: {
    fontSize: 12,
    color: '#312E81',
    fontWeight: '700',
  },
  tbdTimeText: { color: '#9CA3AF', fontWeight: '500' },
  description: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 18,
    marginBottom: 8,
  },
  actionLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionLink: {
    fontSize: 12,
    color: '#4F46E5',
    fontWeight: '800',
    textDecorationLine: 'underline',
  },
});
