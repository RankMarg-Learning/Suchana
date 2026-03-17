import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Platform } from 'react-native';
import Markdown from 'react-native-markdown-display';
import {
  Bell,
  ClipboardList,
  Contact,
  BookOpen,
  Key,
  Award,
  FolderCheck,
  PartyPopper,
  FileText,
  Clock,
  XCircle,
  AlertCircle,
  RefreshCcw,
  Pin
} from 'lucide-react-native';
import { cleanLabel } from '@/utils/format';
import type { LifecycleEvent } from '@/types/exam';

const STAGE_ICONS: Record<string, any> = {
  NOTIFICATION: Bell,
  REGISTRATION: ClipboardList,
  ADMIT_CARD: Contact,
  EXAM: BookOpen,
  ANSWER_KEY: Key,
  RESULT: Award,
  DOCUMENT_VERIFICATION: FolderCheck,
  JOINING: PartyPopper,
};

const EVENT_ICONS: Record<string, any> = {
  RELEASE: FileText,
  START: Clock,
  END: XCircle,
  CORRECTION: AlertCircle,
  RESCHEDULED: RefreshCcw,
  CANCELLED: XCircle,
  OTHER: Pin,
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
  console.log("event", event)
  const [isExpanded, setIsExpanded] = useState(false);
  const stage = event.stage || '';
  const eventType = event.eventType || '';
  const IconComponent = STAGE_ICONS[stage] || EVENT_ICONS[eventType] || Pin;
  const status = getStatus(event);

  return (
    <View style={styles.row}>
      {/* Left: connector */}
      <View style={styles.connector}>
        <View style={[styles.dot, { borderColor: status.color }]}>
          <IconComponent size={18} color={status.color} strokeWidth={2.5} />
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
        {event.stage && <Text style={styles.stage}>{cleanLabel(event.stage)}</Text>}
        <Text style={styles.date}>
          {formatDate(event.startsAt)}
          {event.endsAt ? ` – ${formatDate(event.endsAt)}` : ''}
        </Text>

        {event.description ? (
          <View style={styles.descContainer}>
            {isExpanded ? (
              <Markdown style={markdownStyles}>
                {event.description}
              </Markdown>
            ) : (
              <Text style={styles.desc} numberOfLines={1}>
                {event.description.replace(/[#*`\n]/g, ' ')}
              </Text>
            )}

            {event.description.length > 50 && (
              <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Text style={styles.moreBtn}>{isExpanded ? 'Show less' : 'more'}</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : null}

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
  row: { flexDirection: 'row', marginBottom: 0 },
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
  date: { color: '#9CA3AF', fontSize: 12, marginTop: 4 },
  descContainer: { marginTop: 4 },
  desc: { color: '#D1D5DB', fontSize: 12, lineHeight: 18 },
  moreBtn: {
    color: '#A78BFA',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
    alignSelf: 'flex-start'
  },
  actionBtn: {
    marginTop: 10,
    backgroundColor: '#3B0764',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#5B21B6',
  },
  actionText: { color: '#EDE9FE', fontSize: 13, fontWeight: '800' },
});

const markdownStyles = StyleSheet.create({
  body: {
    color: '#D1D5DB',
    fontSize: 12,
    lineHeight: 18,
  },
  paragraph: {
    marginTop: 0,
    marginBottom: 8,
  },
  strong: {
    fontWeight: 'bold',
    color: '#F4F4F5',
  },
  link: {
    color: '#A78BFA',
  },
  bullet_list: {
    marginBottom: 8,
  },
  ordered_list: {
    marginBottom: 8,
  },
});
