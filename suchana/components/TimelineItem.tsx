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
import { useThemeColor } from '@/hooks/use-theme-color';
import { useColorScheme } from '@/hooks/use-color-scheme';

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


function getStatus(
  event: LifecycleEvent,
  effectiveEndsAt?: number | null,
): { label: string; color: string } | null {
  if (event.isTBD || !event.startsAt) return { label: 'TBD', color: '#9CA3AF' };

  const now = Date.now();
  const start = new Date(event.startsAt).getTime();

  const end: number | null =
    event.endsAt
      ? new Date(event.endsAt).getTime()
      : effectiveEndsAt ?? null;
  if (end !== null && now > end) return null;

  if (now >= start && (end === null || now <= end))
    return { label: 'Active', color: '#34D399' };

  return { label: 'Upcoming', color: '#FBBF24' };
}

export function TimelineItem({
  event,
  isLast,
  nextEventStartsAt,
}: {
  event: LifecycleEvent;
  isLast: boolean;
  nextEventStartsAt?: string | null;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const textPrimary = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const border = useThemeColor({}, 'border');
  const cardBg = useThemeColor({}, 'card');
  const tint = useThemeColor({}, 'tint');

  const stage = event.stage || '';
  const eventType = event.eventType || '';
  const IconComponent = STAGE_ICONS[stage] || EVENT_ICONS[eventType] || Pin;

  const effectiveEndsAt: number | null = nextEventStartsAt
    ? new Date(nextEventStartsAt).getTime()
    : null;

  const status = getStatus(event, effectiveEndsAt);
  const colorScheme = useColorScheme();

  const markdownStyles = StyleSheet.create({
    body: {
      color: textMuted,
      fontSize: 12,
      lineHeight: 18,
    },
    paragraph: {
      marginTop: 0,
      marginBottom: 8,
    },
    strong: {
      fontWeight: 'bold',
      color: textPrimary,
    },
    link: {
      color: tint,
    },
    bullet_list: {
      marginBottom: 8,
    },
    ordered_list: {
      marginBottom: 8,
    },
  });

  // Completed events (status === null) fall back to a muted gray dot
  const dotColor = status?.color ?? '#6B7280';

  return (
    <View style={styles.row}>
      {/* Left: connector */}
      <View style={styles.connector}>
        <View style={[styles.dot, { borderColor: dotColor, backgroundColor: cardBg }]}>
          <IconComponent size={18} color={dotColor} strokeWidth={2.5} />
        </View>
        {!isLast && <View style={[styles.line, { backgroundColor: border }]} />}
      </View>

      {/* Right: content */}
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={[styles.title, { color: textPrimary }]}>{event.title}</Text>
          {/* Only render the badge when status is non-null (i.e. not completed) */}
          {status !== null && (
            <View style={[styles.statusBadge, { borderColor: status.color }]}>
              <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
            </View>
          )}
        </View>
        {event.stage && <Text style={[styles.stage, { color: tint }]}>{cleanLabel(event.stage)}</Text>}
        <Text style={[styles.date, { color: textMuted }]}>
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
              <Text style={[styles.desc, { color: textMuted }]} numberOfLines={1}>
                {event.description.replace(/[#*`\n]/g, ' ')}
              </Text>
            )}

            {event.description.length > 50 && (
              <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Text style={[styles.moreBtn, { color: tint }]}>{isExpanded ? 'Show less' : 'more'}</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : null}

        {event.actionUrl ? (
          status === null ? (
            // Completed event – show button as disabled/closed
            <TouchableOpacity
              disabled
              style={[
                styles.actionBtn,
                {
                  borderColor: '#6B7280',
                  backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                  opacity: 0.55,
                },
              ]}>
              <Text style={[styles.actionText, { color: '#9CA3AF' }]}>Closed</Text>
            </TouchableOpacity>
          ) : (
            // Active / Upcoming – fully interactive
            <TouchableOpacity
              style={[styles.actionBtn, { borderColor: tint, backgroundColor: colorScheme === 'dark' ? '#3B0764' : tint }]}
              onPress={() => Linking.openURL(event.actionUrl!)}>
              <Text style={[styles.actionText, { color: colorScheme === 'dark' ? '#EDE9FE' : '#FFF' }]}>{event.actionLabel ?? 'Open →'}</Text>
            </TouchableOpacity>
          )
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
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: { fontSize: 16 },
  line: { width: 2, flex: 1, marginTop: 4 },
  content: { flex: 1, paddingLeft: 12, paddingBottom: 24 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  title: { fontSize: 14, fontWeight: '700', flex: 1, marginRight: 8 },
  statusBadge: {
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  statusText: { fontSize: 10, fontWeight: '700' },
  stage: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  date: { fontSize: 12, marginTop: 4 },
  descContainer: { marginTop: 4 },
  desc: { fontSize: 12, lineHeight: 18 },
  moreBtn: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
    alignSelf: 'flex-start'
  },
  actionBtn: {
    marginTop: 10,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignSelf: 'flex-start',
    borderWidth: 1,
  },
  actionText: { fontSize: 13, fontWeight: '800' },
});
