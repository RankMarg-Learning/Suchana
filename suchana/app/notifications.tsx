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
import { useThemeColor } from '@/hooks/use-theme-color';

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

  const background = useThemeColor({}, 'background');
  const textPrimary = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const cardBg = useThemeColor({}, 'card');
  const tint = useThemeColor({}, 'tint');
  const border = useThemeColor({}, 'border');

  const { data: notifications = [], isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['notifications', userId],
    queryFn: () => getUserNotifications(userId!),
    enabled: !!userId,
  });

  const renderItem = ({ item }: { item: any }) => {
    const isImportant = item.isImportant;

    return (
      <TouchableOpacity
        style={[
          styles.notificationCard, 
          { backgroundColor: cardBg, borderColor: border },
          isImportant && { borderColor: tint + '66', backgroundColor: tint + '18' }
        ]}
        onPress={() => router.push({ pathname: '/exam/[id]', params: { id: item.exam.id } })}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.iconContainer, { backgroundColor: tint + '18' }, isImportant && { backgroundColor: tint }]}>
            <Bell size={18} color={isImportant ? '#FFF' : tint} />
          </View>
          <View style={styles.titleContainer}>
            <Text style={[styles.examTitle, { color: textMuted }]} numberOfLines={1}>{item.exam.shortTitle || item.exam.title}</Text>
            <Text style={[styles.eventTitle, { color: textPrimary }]}>{item.title}</Text>
          </View>
          {isImportant && (
            <View style={[styles.importantBadge, { backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.2)' }]}>
              <Text style={styles.importantText}>IMPORTANT</Text>
            </View>
          )}
        </View>

        {item.description && (
          <Text style={[styles.description, { color: textMuted }]} numberOfLines={2}>{item.description}</Text>
        )}

        <View style={[styles.cardFooter, { borderTopColor: border }]}>
          <View style={styles.dateContainer}>
            <Calendar size={12} color={textMuted} style={{ marginRight: 4 }} />
            <Text style={[styles.dateText, { color: textMuted }]}>
              {formatNotificationDate(item.notifiedAt)}
            </Text>
          </View>
          <View style={styles.viewMore}>
            <Text style={[styles.viewMoreText, { color: tint }]}>View Exam</Text>
            <ArrowRight size={14} color={tint} style={{ marginLeft: 4 }} />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={[styles.emptyIconContainer, { backgroundColor: cardBg }]}>
        <BellOff size={48} color={border} />
      </View>
      <Text style={[styles.emptyTitle, { color: textPrimary }]}>No notifications yet</Text>
      <Text style={[styles.emptySubtitle, { color: textMuted }]}>
        You'll receive alerts about registration dates, admit cards, and results for exams you follow.
      </Text>
      <TouchableOpacity
        style={[styles.exploreBtn, { backgroundColor: tint }]}
        onPress={() => router.push('/(tabs)/explore')}>
        <Text style={styles.exploreBtnText}>Follow More Exams</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: background }]}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: border }]}>
        <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: cardBg }]}>
          <ChevronLeft size={24} color={textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textPrimary }]}>Notifications</Text>
        <View style={{ width: 40 }} />
      </View>

      {isLoading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={tint} />
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
              tintColor={tint}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
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
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
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
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  examTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 2,
  },
  importantBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  importantText: {
    color: '#EF4444',
    fontSize: 9,
    fontWeight: '800',
  },
  description: {
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
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
    fontWeight: '500',
  },
  viewMore: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewMoreText: {
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
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  exploreBtn: {
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
