import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Bell, MapPin, Calendar, Bookmark, BookmarkCheck } from 'lucide-react-native';
import { cleanLabel } from '@/utils/format';
import type { Exam } from '@/types/exam';

interface ExamListRowProps {
  exam: Exam;
  isSaved?: boolean;
  onSaveToggle?: () => void;
  onPress: () => void;
}

export const ExamListRow = ({ exam, isSaved, onSaveToggle, onPress }: ExamListRowProps) => {
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return 'Updated today';
      if (diffDays === 1) return 'Updated yesterday';
      if (diffDays < 7) return `Updated ${diffDays}d ago`;

      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${date.getDate()} ${months[date.getMonth()]}`;
    } catch (e) {
      return 'Recently';
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.iconContainer}>
        <View style={styles.iconCircle}>
           <Bell size={18} color="#7C3AED" />
        </View>
      </View>
      
      <View style={styles.content}>
        <View style={styles.header}>
            <Text style={styles.conductingBody} numberOfLines={1}>{exam.conductingBody}</Text>
            <Text style={styles.date}>{formatDate(exam.updatedAt)}</Text>
        </View>
        
        <Text style={styles.title} numberOfLines={2}>{exam.title}</Text>
        
        <View style={styles.meta}>
            <View style={styles.metaItem}>
                <MapPin size={12} color="#6B7280" style={{ marginRight: 4 }} />
                <Text style={styles.metaText}>{exam.state || 'National'}</Text>
            </View>
            <View style={styles.metaItem}>
                <Calendar size={12} color="#6B7280" style={{ marginRight: 4 }} />
                <Text style={styles.metaText}>{cleanLabel(exam.category)}</Text>
            </View>
        </View>
      </View>

      <TouchableOpacity style={styles.saveBtn} onPress={onSaveToggle}>
        {isSaved ? (
          <BookmarkCheck size={20} color="#7C3AED" fill="#7C3AED" />
        ) : (
          <Bookmark size={20} color="#4B5563" />
        )}
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#161618',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#242426',
  },
  iconContainer: {
    marginRight: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
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
    color: '#9CA3AF',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  date: {
    color: '#4B5563',
    fontSize: 10,
    fontWeight: '500',
  },
  title: {
    color: '#E2E8F0',
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
    color: '#6B7280',
    fontSize: 11,
    fontWeight: '500',
  },
  saveBtn: {
    padding: 8,
    marginLeft: 8,
  }
});
