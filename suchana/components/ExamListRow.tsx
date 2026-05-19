import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Bell, MapPin, Calendar, Bookmark, BookmarkCheck } from 'lucide-react-native';
import { cleanLabel, formatRelativeDate } from '@/utils/format';
import type { Exam } from '@/types/exam';
import { useThemeColor } from '@/hooks/use-theme-color';
import { ExamStatus } from '@/constants/enums';

const getStatusColor = (status: string): string => {
  switch (status) {
    case ExamStatus.REGISTRATION_OPEN: return '#10B981';
    case ExamStatus.REGISTRATION_CLOSED: return '#F59E0B';
    case ExamStatus.ADMIT_CARD_OUT: return '#8B5CF6';
    case ExamStatus.EXAM_ONGOING: return '#EF4444';
    case ExamStatus.RESULT_DECLARED: return '#8B5CF6';
    default: return '#FBBF24';
  }
};

interface ExamListRowProps {
  exam: Exam;
  isSaved?: boolean;
  onSaveToggle?: () => void;
  onPress: () => void;
}

export const ExamListRow = ({ exam, isSaved, onSaveToggle, onPress }: ExamListRowProps) => {
  const textPrimary = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const cardBg = useThemeColor({}, 'card');
  const border = useThemeColor({}, 'border');
  const tint = useThemeColor({}, 'tint');

  return (
    <TouchableOpacity style={[styles.container, { backgroundColor: cardBg, borderColor: border }]} onPress={onPress}>
      <View style={styles.iconContainer}>
        <View style={[styles.iconCircle, { backgroundColor: tint + '18' }]}>
          <Bell size={18} color={tint} />
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.conductingBody, { color: textMuted }]} numberOfLines={1}>{exam.conductingBody}</Text>
          <Text style={[styles.date, { color: textMuted }]}>{formatRelativeDate(exam.updatedAt)}</Text>
        </View>

        <Text style={[styles.title, { color: textPrimary }]} numberOfLines={2}>{exam.title}</Text>
        
        <View style={styles.statusRow}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(exam.status) + '15', borderColor: getStatusColor(exam.status) + '30' }]}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor(exam.status) }]} />
            <Text style={[styles.statusText, { color: getStatusColor(exam.status) }]}>{cleanLabel(exam.status)}</Text>
          </View>
          
          <View style={styles.meta}>
            <View style={styles.metaItem}>
              <MapPin size={10} color={textMuted} style={{ marginRight: 2 }} />
              <Text style={[styles.metaText, { color: textMuted }]}>{exam.state || 'National'}</Text>
            </View>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.saveBtn} onPress={onSaveToggle}>
        {isSaved ? (
          <BookmarkCheck size={20} color={tint} fill={tint} />
        ) : (
          <Bookmark size={20} color={textMuted} />
        )}
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    marginBottom: 8,
  },
  iconContainer: {
    marginRight: 10,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  conductingBody: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    flex: 1,
  },
  date: {
    fontSize: 9,
    fontWeight: '500',
    flexShrink: 0,
    marginLeft: 6,
  },
  title: {
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 16,
    marginBottom: 6,
  },
  meta: {
    flexDirection: 'row',
    gap: 10,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 10,
    fontWeight: '500',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 0.5,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginRight: 4,
  },
  statusText: {
    fontSize: 8,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  saveBtn: {
    padding: 6,
    marginLeft: 6,
  }
});
