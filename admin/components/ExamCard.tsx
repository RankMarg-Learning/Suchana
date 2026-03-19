import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Exam } from '../services/api.service';
import { ExamStatus } from '../constants/enums';

interface ExamCardProps {
  exam: Exam;
  onPress: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onManageEvents?: () => void;
}

const RenderMetadata = ({ icon, color, label, data }: any) => {
  if (!data) return null;

  const entries = typeof data === 'object' && !Array.isArray(data)
    ? Object.entries(data)
    : [[label, String(data)]];

  return (
    <View style={styles.metaSection}>
      <View style={styles.metaHeader}>
        <Ionicons name={icon} size={14} color={color} />
        <Text style={[styles.metaLabel, { color }]}>{label}</Text>
      </View>
      <View style={styles.metaList}>
        {entries.map(([key, val]: any, idx) => (
          <View key={idx} style={styles.metaChip}>
            <Text style={styles.metaChipKey}>{key}: </Text>
            <Text style={styles.metaChipVal}>{String(val)}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export const ExamCard: React.FC<ExamCardProps> = ({
  exam,
  onPress,
  onEdit,
  onDelete,
  onManageEvents
}) => {
  const eventCount = exam._count?.lifecycleEvents || 0;

  const getStatusStyle = (status: string): { bg: string; text: string; icon: any } => {
    switch (status) {
      case ExamStatus.REGISTRATION_OPEN:
        return { bg: '#E8F5E9', text: '#2E7D32', icon: 'flash' };
      case ExamStatus.NOTIFICATION:
        return { bg: '#E3F2FD', text: '#1565C0', icon: 'calendar-outline' };
      case ExamStatus.RESULT_DECLARED:
        return { bg: '#F3E5F5', text: '#7B1FA2', icon: 'trophy' };
      case ExamStatus.ADMIT_CARD_OUT:
        return { bg: '#FFF3E0', text: '#E65100', icon: 'card' };
      default:
        return { bg: '#F5F5F5', text: '#616161', icon: 'list' };
    }
  };

  const statusStyle = getStatusStyle(exam.status);
  const isMissingLinks = !exam.officialWebsite || !exam.notificationUrl;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View style={styles.header}>
        <View style={styles.headerMain}>
          <Text style={styles.title} numberOfLines={2}>{exam.title}</Text>
          <View style={styles.badgeRow}>
            <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
              <Ionicons name={statusStyle.icon} size={12} color={statusStyle.text} style={{ marginRight: 4 }} />
              <Text style={[styles.statusText, { color: statusStyle.text }]}>
                {exam.status.replace(/_/g, ' ')}
              </Text>
            </View>
            {exam.isPublished ? (
              <View style={styles.liveBadge}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>LIVE</Text>
              </View>
            ) : (
              <View style={styles.draftBadge}>
                <Text style={styles.draftText}>DRAFT</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.body}>
        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Conducting Body</Text>
            <Text style={styles.infoValue} numberOfLines={1}>{exam.conductingBody || 'N/A'}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Events Added</Text>
            <View style={styles.eventCountRow}>
              <Text style={[styles.infoValue, { color: eventCount === 0 ? '#EF4444' : '#1A1A1A' }]}>
                {eventCount} Events
              </Text>
              {eventCount === 0 && <Ionicons name="alert-circle" size={14} color="#EF4444" style={{ marginLeft: 4 }} />}
            </View>
          </View>
        </View>

        {/* Dynamic Data Lists */}
        <View style={styles.metadataContainer}>
          <RenderMetadata
            icon="people"
            color="#10B981"
            label="Vacancies"
            data={exam.totalVacancies}
          />
          <RenderMetadata
            icon="wallet"
            color="#6366F1"
            label="Fees"
            data={exam.applicationFee}
          />
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statChip}>
            <Ionicons name="folder-outline" size={14} color="#6B7280" />
            <Text style={styles.statText}>{exam.category}</Text>
          </View>
          <View style={styles.statChip}>
            <Ionicons name="location-outline" size={14} color="#6B7280" />
            <Text style={styles.statText}>{exam.examLevel === 'STATE' ? exam.state : exam.examLevel}</Text>
          </View>
        </View>

        {isMissingLinks && (
          <View style={styles.warningBox}>
            <Ionicons name="warning-outline" size={14} color="#B45309" />
            <Text style={styles.warningText}>Missing Official URLs</Text>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <View style={styles.actionsLeft}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.editBtn]}
            onPress={(e) => { e.stopPropagation(); onEdit?.(); }}
          >
            <Ionicons name="create-outline" size={18} color="#2563EB" />
            <Text style={styles.editBtnText}>Edit Info</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.actionsRight}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.manageBtn]}
            onPress={(e) => { e.stopPropagation(); onManageEvents?.() || onPress(); }}
          >
            <Text style={styles.manageBtnText}>Manage Timeline</Text>
            <Ionicons name="arrow-forward" size={16} color="#FFF" style={{ marginLeft: 6 }} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteIconButton}
            onPress={(e) => { e.stopPropagation(); onDelete?.(); }}
          >
            <Ionicons name="trash-outline" size={20} color="#EF4444" />
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
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  header: {
    marginBottom: 12,
  },
  headerMain: {
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    lineHeight: 24,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2563EB',
    marginRight: 6,
  },
  liveText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#2563EB',
  },
  draftBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  draftText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#6B7280',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 4,
  },
  body: {
    paddingVertical: 12,
    gap: 12,
  },
  infoGrid: {
    flexDirection: 'row',
    gap: 20,
  },
  infoItem: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
  },
  eventCountRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 6,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  statText: {
    fontSize: 12,
    color: '#4B5563',
    fontWeight: '600',
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    padding: 8,
    borderRadius: 10,
    gap: 6,
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  warningText: {
    fontSize: 12,
    color: '#B45309',
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    justifyContent: 'space-between',
  },
  actionsLeft: {
    flexDirection: 'row',
  },
  actionsRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 6,
  },
  editBtn: {
    borderWidth: 1,
    borderColor: '#DBEAFE',
    backgroundColor: '#EFF6FF',
  },
  editBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2563EB',
  },
  manageBtn: {
    backgroundColor: '#2563EB',
    paddingVertical: 10,
    paddingHorizontal: 16,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  manageBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFF',
  },
  deleteIconButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  metadataContainer: {
    gap: 12,
    marginVertical: 4,
  },
  metaSection: {
    gap: 6,
  },
  metaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaLabel: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metaList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  metaChip: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  metaChipKey: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
  },
  metaChipVal: {
    fontSize: 11,
    fontWeight: '800',
    color: '#111827',
  }
});
