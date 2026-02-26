
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Exam } from '../services/api.service';

interface ExamCardProps {
  exam: Exam;
  onPress: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const ExamCard: React.FC<ExamCardProps> = ({ exam, onPress, onEdit, onDelete }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return '#4CAF50';
      case 'UPCOMING': return '#2196F3';
      case 'COMPLETED': return '#9E9E9E';
      case 'CANCELLED': return '#F44336';
      default: return '#757575';
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title} numberOfLines={2}>{exam.title}</Text>
          <View style={styles.shortTitleRow}>
            <Text style={styles.shortTitle}>{exam.shortTitle}</Text>
            <View style={styles.dotSeparator} />
            <Text style={styles.categoryText}>{exam.category}</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(exam.status) }]}>
            <Text style={styles.statusText}>{exam.status}</Text>
          </View>
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.infoRow}>
          <View style={styles.iconContainer}>
            <Ionicons name="business" size={14} color="#2196F3" />
          </View>
          <Text style={styles.infoText} numberOfLines={1}>{exam.conductingBody}</Text>
        </View>
        {exam.totalVacancies && (
          <View style={styles.infoRow}>
            <View style={styles.iconContainer}>
              <Ionicons name="people" size={14} color="#4CAF50" />
            </View>
            <Text style={styles.infoText}>{exam.totalVacancies.toLocaleString()} Vacancies</Text>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <View style={styles.dateContainer}>
          <Ionicons name="time-outline" size={12} color="#999" />
          <Text style={styles.dateValue}>{new Date(exam.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</Text>
        </View>
        
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.editButton]} 
            onPress={(e) => { e.stopPropagation(); onEdit?.(); }}
          >
            <Ionicons name="pencil" size={16} color="#2196F3" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, styles.deleteButton]} 
            onPress={(e) => { e.stopPropagation(); onDelete?.(); }}
          >
            <Ionicons name="trash" size={16} color="#F44336" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1A1A1A',
    lineHeight: 26,
    letterSpacing: -0.5,
  },
  shortTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  shortTitle: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
  },
  dotSeparator: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#CCC',
    marginHorizontal: 8,
  },
  categoryText: {
    fontSize: 12,
    color: '#2196F3',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  headerRight: {
    alignItems: 'flex-end',
    marginLeft: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: 1,
  },
  body: {
    marginTop: 16,
    marginBottom: 20,
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 14,
    color: '#444',
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateValue: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  editButton: {
    backgroundColor: '#E3F2FD',
  },
  deleteButton: {
    backgroundColor: '#FFEBEE',
  },
});
