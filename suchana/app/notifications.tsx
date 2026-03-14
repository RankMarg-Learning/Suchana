import React from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { ChevronLeft, Bell, BellOff, Calendar, ArrowRight } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { getUserNotifications } from '@/services/userService';
import { useUser } from '@/context/UserContext';

function formatNotificationDate(dateString: string) {
  if (!dateString) return 'Recently';
  try {
    const date = new Date(dateString);
    const now = new Date();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const d = date.getDate();
    const m = months[date.getMonth()];
    let h = date.getHours();
    const min = date.getMinutes().toString().padStart(2, '0');
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    h = h ? h : 12; // the hour '0' should be '12'
    return `${d} ${m}, ${h}:${min} ${ampm}`;
  } catch (e) {
    return 'Recently';
  }
}

export default function NotificationsScreen() {
  const router = useRouter();
  const { userId } = useUser();

  const { data: notifications = [], isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['notifications', userId],
    queryFn: () => getUserNotifications(userId!),
    enabled: !!userId,
  });

  const renderItem = ({ item }: { item: any }) => {
    const isImportant = item.isImportant;

    return (
      <TouchableOpacity
        style={[styles.notificationCard, isImportant && styles.importantCard]}
        onPress={() => router.push({ pathname: '/exam/[id]', params: { id: item.exam.id } })}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.iconContainer, isImportant && styles.importantIcon]}>
            <Bell size={18} color={isImportant ? '#FFF' : '#7C3AED'} />
          </View>
          <View style={styles.titleContainer}>
            <Text style={styles.examTitle} numberOfLines={1}>{item.exam.shortTitle || item.exam.title}</Text>
            <Text style={styles.eventTitle}>{item.title}</Text>
          </View>
          {isImportant && (
            <View style={styles.importantBadge}>
              <Text style={styles.importantText}>IMPORTANT</Text>
            </View>
          )}
        </View>

        {item.description && (
          <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
        )}

        <View style={styles.cardFooter}>
          <View style={styles.dateContainer}>
            <Calendar size={12} color="#6B7280" style={{ marginRight: 4 }} />
            <Text style={styles.dateText}>
              {formatNotificationDate(item.notifiedAt)}
            </Text>
          </View>
          <View style={styles.viewMore}>
            <Text style={styles.viewMoreText}>View Exam</Text>
            <ArrowRight size={14} color="#7C3AED" style={{ marginLeft: 4 }} />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <BellOff size={48} color="#3F3F46" />
      </View>
      <Text style={styles.emptyTitle}>No notifications yet</Text>
      <Text style={styles.emptySubtitle}>
        You'll receive alerts about registration dates, admit cards, and results for exams you follow.
      </Text>
      <TouchableOpacity
        style={styles.exploreBtn}
        onPress={() => router.push('/(tabs)/explore')}>
        <Text style={styles.exploreBtnText}>Follow More Exams</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.root}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={24} color="#F4F4F5" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 40 }} />
      </View>

      {isLoading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#7C3AED" />
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor="#7C3AED"
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0D0D0F' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1C1C1E',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1C1C1E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#F4F4F5',
    fontSize: 18,
    fontWeight: '800',
  },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: {
    padding: 16,
    gap: 12,
    flexGrow: 1,
  },
  notificationCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  importantCard: {
    borderColor: 'rgba(124, 58, 237, 0.4)',
    backgroundColor: 'rgba(124, 58, 237, 0.05)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  importantIcon: {
    backgroundColor: '#7C3AED',
  },
  titleContainer: {
    flex: 1,
  },
  examTitle: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  eventTitle: {
    color: '#F4F4F5',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 2,
  },
  importantBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  importantText: {
    color: '#EF4444',
    fontSize: 9,
    fontWeight: '800',
  },
  description: {
    color: '#9CA3AF',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '500',
  },
  viewMore: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewMoreText: {
    color: '#7C3AED',
    fontSize: 13,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 80,
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#1C1C1E',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    color: '#F4F4F5',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
  },
  emptySubtitle: {
    color: '#6B7280',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  exploreBtn: {
    backgroundColor: '#7C3AED',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 14,
  },
  exploreBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
