import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import type { LifecycleEvent } from '@/types/exam';

const EVENT_ICONS: Record<string, string> = {
  NOTIFICATION_OUT:       '📢',
  REGISTRATION:           '📝',
  CORRECTION_WINDOW:      '✏️',
  ADMIT_CARD_RELEASE:     '🪪',
  EXAM_CITY_INTIMATION:   '📍',
  EXAM_DATE:              '📅',
  ANSWER_KEY_PROVISIONAL: '🔑',
  ANSWER_KEY_FINAL:       '✅',
  RESULT:                 '🏆',
  SCORE_CARD_RELEASE:     '📊',
  CUTOFF_RELEASE:         '📉',
  PHYSICAL_TEST:          '💪',
  SKILL_TEST:             '🛠️',
  INTERVIEW:              '🎤',
  DOCUMENT_VERIFICATION:  '📂',
  FINAL_MERIT_LIST:       '🏅',
  JOINING_DATE:           '🎉',
  OTHER:                  '📌',
};

function formatDate(iso: string | null | undefined) {
  if (!iso) return 'TBD';
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function getStatus(event: LifecycleEvent): { label: string; color: string } {
  if (event.isTBD) return { label: 'TBD', color: '#9CA3AF' };
  const now = Date.now();
  const start = event.startsAt ? new Date(event.startsAt).getTime() : null;
  const end = event.endsAt ? new Date(event.endsAt).getTime() : null;
  if (end && now > end) return { label: 'Closed', color: '#6B7280' };
  if (start && now >= start && (!end || now <= end)) return { label: 'Active', color: '#34D399' };
  return { label: 'Upcoming', color: '#FBBF24' };
}

export function TimelineItem({ event, isLast }: { event: LifecycleEvent; isLast: boolean }) {
  const icon = EVENT_ICONS[event.eventType] ?? '📌';
  const status = getStatus(event);

  return (
    <View style={styles.row}>
      {/* Left: connector */}
      <View style={styles.connector}>
        <View style={[styles.dot, { borderColor: status.color }]}>
          <Text style={styles.icon}>{icon}</Text>
        </View>
        {!isLast && <View style={styles.line} />}
      </View>

      {/* Right: content */}
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>{event.title}</Text>
          <View style={[styles.statusBadge, { borderColor: status.color }]}>
            <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
          </View>
        </View>
        {event.stage && <Text style={styles.stage}>{event.stage}</Text>}
        <Text style={styles.date}>
          {formatDate(event.startsAt)}
          {event.endsAt ? ` – ${formatDate(event.endsAt)}` : ''}
        </Text>
        {event.description ? <Text style={styles.desc}>{event.description}</Text> : null}
        {event.actionUrl ? (
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => Linking.openURL(event.actionUrl!)}>
            <Text style={styles.actionText}>{event.actionLabel ?? 'Open →'}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row:       { flexDirection: 'row', marginBottom: 0 },
  connector: { width: 40, alignItems: 'center' },
  dot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1C1C1E',
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: { fontSize: 16 },
  line: { width: 2, flex: 1, backgroundColor: '#2C2C2E', marginTop: 4 },
  content: { flex: 1, paddingLeft: 12, paddingBottom: 24 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  title: { color: '#F4F4F5', fontSize: 14, fontWeight: '700', flex: 1, marginRight: 8 },
  statusBadge: {
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  statusText: { fontSize: 10, fontWeight: '700' },
  stage: { color: '#A78BFA', fontSize: 12, fontWeight: '600', marginTop: 2 },
  date:  { color: '#9CA3AF', fontSize: 12, marginTop: 4 },
  desc:  { color: '#6B7280', fontSize: 12, marginTop: 4 },
  actionBtn: {
    marginTop: 8,
    backgroundColor: '#3B0764',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignSelf: 'flex-start',
  },
  actionText: { color: '#C4B5FD', fontSize: 13, fontWeight: '700' },
});
