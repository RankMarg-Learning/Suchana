import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Bell, MapPin, Calendar, Bookmark, BookmarkCheck } from 'lucide-react-native';
import { cleanLabel, formatRelativeDate } from '@/utils/format';
import type { Exam } from '@/types/exam';
import { useThemeColor } from '@/hooks/use-theme-color';

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

        <View style={styles.meta}>
          <View style={styles.metaItem}>
            <MapPin size={12} color={textMuted} style={{ marginRight: 4 }} />
            <Text style={[styles.metaText, { color: textMuted }]}>{exam.state || 'National'}</Text>
          </View>
          <View style={styles.metaItem}>
            <Calendar size={12} color={textMuted} style={{ marginRight: 4 }} />
            <Text style={[styles.metaText, { color: textMuted }]}>{cleanLabel(exam.category)}</Text>
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
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  iconContainer: {
    marginRight: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
    marginBottom: 4,
  },
  conductingBody: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    flex: 1,
  },
  date: {
    fontSize: 10,
    fontWeight: '500',
    flexShrink: 0,
    marginLeft: 6,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 18,
    marginBottom: 8,
  },
  meta: {
    flexDirection: 'row',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 11,
    fontWeight: '500',
  },
  saveBtn: {
    padding: 8,
    marginLeft: 8,
  }
});
