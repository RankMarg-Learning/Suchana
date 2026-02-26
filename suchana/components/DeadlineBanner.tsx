import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Linking } from 'react-native';
import type { Exam } from '@/types/exam';
import { useRouter } from 'expo-router';

export function DeadlineBanner({ exams }: { exams: Exam[] }) {
  const router = useRouter();

  const urgent = exams
    .filter(e => {
      const reg = e.lifecycleEvents?.find(ev => ev.eventType === 'REGISTRATION');
      if (!reg?.endsAt) return false;
      const days = Math.ceil((new Date(reg.endsAt).getTime() - Date.now()) / 86400000);
      return days >= 0 && days <= 7;
    })
    .slice(0, 5);

  if (!urgent.length) return null;

  return (
    <View style={styles.wrapper}>
      <Text style={styles.header}>⚡ Closing Soon</Text>
      <FlatList
        horizontal
        data={urgent}
        keyExtractor={i => i.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: 16 }}
        renderItem={({ item }) => {
          const reg = item.lifecycleEvents?.find(ev => ev.eventType === 'REGISTRATION');
          const days = reg?.endsAt
            ? Math.ceil((new Date(reg.endsAt).getTime() - Date.now()) / 86400000)
            : null;
          return (
            <TouchableOpacity style={styles.card} onPress={() => router.push({ pathname: '/exam/[id]', params: { id: item.id } })}>
              <Text style={styles.cardTitle} numberOfLines={2}>{item.shortTitle}</Text>
              {days !== null && (
                <View style={styles.daysBubble}>
                  <Text style={styles.daysText}>{days}d</Text>
                </View>
              )}
              {reg?.actionUrl && (
                <TouchableOpacity onPress={() => Linking.openURL(reg.actionUrl!)}>
                  <Text style={styles.applyLink}>Apply →</Text>
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 16 },
  header: { color: '#F59E0B', fontSize: 13, fontWeight: '700', marginBottom: 10, paddingHorizontal: 16 },
  card: {
    backgroundColor: '#1F1206',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#78350F',
    padding: 12,
    width: 160,
    marginLeft: 16,
  },
  cardTitle: { color: '#FDE68A', fontSize: 13, fontWeight: '700', marginBottom: 8 },
  daysBubble: {
    backgroundColor: '#D97706',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  daysText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  applyLink: { color: '#FBBF24', fontSize: 12, fontWeight: '700' },
});
