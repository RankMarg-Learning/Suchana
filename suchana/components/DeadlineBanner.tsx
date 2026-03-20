import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Linking } from 'react-native';
import { Zap } from 'lucide-react-native';
import type { Exam } from '@/types/exam';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function DeadlineBanner({ exams }: { exams: Exam[] }) {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const tint = useThemeColor({}, 'tint');
  const textPrimary = useThemeColor({}, 'text');

  const urgent = (exams ?? [])
    .filter(e => {
      const reg = e.lifecycleEvents?.find(ev => ev.stage === 'REGISTRATION');
      if (!reg?.endsAt) return false;
      const days = Math.ceil((new Date(reg.endsAt).getTime() - Date.now()) / 86400000);
      return days >= 0 && days <= 7;
    })
    .slice(0, 10);

  if (!urgent.length) return null;

  const cardColors = (colorScheme === 'dark' ? ['#431407', '#1F1206'] : ['#FFF7ED', '#FFEDD5']) as readonly [string, string];
  const cardBorder = colorScheme === 'dark' ? '#9a3412' : '#fed7aa';
  const cardTitleColor = colorScheme === 'dark' ? '#FFEDD5' : '#7c2d12';

  return (
    <View style={styles.wrapper}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14, paddingHorizontal: 20 }}>
        <Zap size={14} color="#F59E0B" fill="#F59E0B" style={{ marginRight: 6 }} />
        <Text style={[styles.header, { color: colorScheme === 'dark' ? '#FCD34D' : '#D97706' }]}>Hot Deadlines</Text>
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
                colors={cardColors}
                style={[styles.card, { borderColor: cardBorder }]}>
                <Text style={[styles.cardTitle, { color: cardTitleColor }]} numberOfLines={2}>{item.shortTitle}</Text>
                <View style={styles.row}>
                  {days !== null && (
                    <View style={[styles.daysBubble, { borderColor: '#ea580c', backgroundColor: 'rgba(234, 88, 12, 0.1)' }]}>
                      <Text style={[styles.daysText, { color: '#ea580c' }]}>{days}d left</Text>
                    </View>
                  )}
                  {reg?.actionUrl && (
                    <TouchableOpacity
                      style={[styles.applyBtn, { backgroundColor: '#ea580c' }]}
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
  header: { fontSize: 13, fontWeight: '800', letterSpacing: 0.5 },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    width: 180,
    marginRight: 12,
  },
  cardTitle: { fontSize: 14, fontWeight: '800', marginBottom: 12, height: 34 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  daysBubble: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
  },
  daysText: { fontSize: 11, fontWeight: '800' },
  applyBtn: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  applyText: { color: '#fff', fontSize: 11, fontWeight: '800' },
});
