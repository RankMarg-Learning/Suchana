
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LifecycleEvent } from '../services/api.service';
import { format } from 'date-fns';

interface TimelineItemProps {
  event: LifecycleEvent;
  isLast: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const TimelineItem: React.FC<TimelineItemProps> = ({ event, isLast, onEdit, onDelete }) => {
  return (
    <View style={styles.container}>
      <View style={styles.timeline}>
        <View style={[styles.dot, { backgroundColor: event.isConfirmed ? '#4CAF50' : '#FF9800' }]} />
        {!isLast && <View style={styles.line} />}
      </View>
      
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <View style={styles.titleRow}>
               {event.stage ? (
                 <Text style={styles.stageText}>{event.stage}</Text>
               ) : null}
               <Text style={styles.title}>{event.title}</Text>
            </View>
            <View style={styles.typeRow}>
              <Text style={styles.type}>{event.eventType.replace(/_/g, ' ')}</Text>
              {!event.isConfirmed && (
                <View style={styles.tentativeBadge}>
                  <Text style={styles.tentativeText}>TENTATIVE</Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.actionButtons}>
            {onEdit && (
              <TouchableOpacity style={styles.actionBtn} onPress={onEdit}>
                <Ionicons name="pencil-outline" size={16} color="#2196F3" />
              </TouchableOpacity>
            )}
            {onDelete && (
              <TouchableOpacity style={styles.actionBtn} onPress={onDelete}>
                <Ionicons name="trash-outline" size={16} color="#F44336" />
              </TouchableOpacity>
            )}
          </View>
        </View>
        
        <View style={styles.timeRow}>
          <Ionicons name="calendar-outline" size={14} color="#666" />
          <Text style={styles.timeText}>
            {event.isTBD ? 'Dates: To Be Decided' : (
              event.startsAt ? format(new Date(event.startsAt), 'MMM dd, yyyy - hh:mm a') : 'No date set'
            )}
          </Text>
        </View>

        {event.description && (
          <Text style={styles.description}>{event.description}</Text>
        )}

        {event.actionUrl && (
          <View style={styles.actionLinkRow}>
             <Ionicons name="link-outline" size={14} color="#2196F3" />
             <Text style={styles.actionLink}>
                {event.actionLabel || 'View Link'}
             </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    minHeight: 80,
  },
  timeline: {
    width: 20,
    alignItems: 'center',
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    zIndex: 1,
    marginTop: 6,
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: '#E0E0E0',
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
    marginBottom: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  stageText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FFF',
    backgroundColor: '#333',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  type: {
    fontSize: 10,
    fontWeight: '800',
    color: '#666',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    padding: 4,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  timeText: {
    fontSize: 13,
    color: '#666',
  },
  description: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
    marginBottom: 8,
  },
  actionLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionLink: {
    fontSize: 13,
    color: '#2196F3',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  tentativeBadge: {
    borderWidth: 1,
    borderColor: '#FF9800',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  tentativeText: {
    fontSize: 8,
    color: '#FF9800',
    fontWeight: '800',
  },
});
