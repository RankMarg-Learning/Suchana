import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Linking } from 'react-native';
import { Zap } from 'lucide-react-native';
import type { Exam } from '@/types/exam';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export function DeadlineBanner({ exams }: { exams: Exam[] }) {
  const router = useRouter();

  const urgent = (exams ?? [])
    .filter(e => {
      const reg = e.lifecycleEvents?.find(ev => ev.stage === 'REGISTRATION');
      if (!reg?.endsAt) return false;
      const days = Math.ceil((new Date(reg.endsAt).getTime() - Date.now()) / 86400000);
      return days >= 0 && days <= 7;
    })
    .slice(0, 10);

  if (!urgent.length) return null;

  return (
    <View style={styles.wrapper}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14, paddingHorizontal: 20 }}>
        <Zap size={14} color="#FCD34D" fill="#FCD34D" style={{ marginRight: 6 }} />
        <Text style={[styles.header, { marginBottom: 0, paddingHorizontal: 0 }]}>Hot Deadlines</Text>
      </View>
      <FlatList
        horizontal
        data={urgent}
        keyExtractor={i => i.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20 }}
        renderItem={({ item }) => {
          const reg = item.lifecycleEvents?.find(ev => ev.stage === 'REGISTRATION');
          const days = reg?.endsAt
            ? Math.ceil((new Date(reg.endsAt).getTime() - Date.now()) / 86400000)
            : null;
          return (
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => router.push({ pathname: '/exam/[id]', params: { id: item.id } })}>
              <LinearGradient
                colors={['#431407', '#1F1206']}
                style={styles.card}>
                <Text style={styles.cardTitle} numberOfLines={2}>{item.shortTitle}</Text>
                <View style={styles.row}>
                  {days !== null && (
                    <View style={styles.daysBubble}>
                      <Text style={styles.daysText}>{days}d left</Text>
                    </View>
                  )}
                  {reg?.actionUrl && (
                    <TouchableOpacity
                      style={styles.applyBtn}
                      onPress={() => Linking.openURL(reg.actionUrl!)}>
                      <Text style={styles.applyText}>Apply</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </LinearGradient>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 24 },
  header: { color: '#FCD34D', fontSize: 13, fontWeight: '800', marginBottom: 14, paddingHorizontal: 20, letterSpacing: 0.5 },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#9a3412',
    padding: 14,
    width: 180,
    marginRight: 12,
  },
  cardTitle: { color: '#FFEDD5', fontSize: 14, fontWeight: '800', marginBottom: 12, height: 34 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  daysBubble: {
    backgroundColor: 'rgba(234, 88, 12, 0.2)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#ea580c',
  },
  daysText: { color: '#fbbf24', fontSize: 11, fontWeight: '800' },
  applyBtn: {
    backgroundColor: '#ea580c',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  applyText: { color: '#fff', fontSize: 11, fontWeight: '800' },
});
