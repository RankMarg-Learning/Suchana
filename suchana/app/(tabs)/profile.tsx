import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Switch, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUser } from '@/context/UserContext';
import { updateUser } from '@/services/userService';
import { CategoryChip } from '@/components/CategoryChip';
import type { ExamCategory } from '@/types/exam';
import { useRouter } from 'expo-router';

const CATEGORIES: { label: string; value: ExamCategory }[] = [
  { label: 'UPSC', value: 'UPSC' },
  { label: 'SSC', value: 'SSC' },
  { label: 'Banking', value: 'BANKING' },
  { label: 'Railway', value: 'RAILWAY' },
  { label: 'Defence', value: 'DEFENCE' },
  { label: 'State PSC', value: 'STATE_PSC' },
  { label: 'Teaching', value: 'TEACHING' },
  { label: 'Police', value: 'POLICE' },
  { label: 'Medical', value: 'MEDICAL' },
  { label: 'Engineering', value: 'ENGINEERING' },
  { label: 'Law', value: 'LAW' },
];

export default function ProfileScreen() {
  const { user, userId, refreshUser, logout } = useUser();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [cats, setCats] = useState<ExamCategory[]>(
    (user?.preferredCategories as ExamCategory[]) ?? []
  );
  const [notifications, setNotifications] = useState(user?.notificationsEnabled ?? true);

  const toggleCat = (cat: ExamCategory) =>
    setCats(p => p.includes(cat) ? p.filter(x => x !== cat) : [...p, cat]);

  const handleSave = async () => {
    if (!userId) return;
    setSaving(true);
    try {
      await updateUser(userId, {
        preferredCategories: cats,
        notificationsEnabled: notifications,
      });
      await refreshUser();
      Alert.alert('Saved ✅', 'Your preferences have been updated!');
    } catch (_) {
      Alert.alert('Error', 'Could not save. Please try again.');
    } finally { setSaving(false); }
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Your preferences will be cleared from this device.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => { logout(); router.replace('/onboarding'); } },
    ]);
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.root} edges={['top']}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 }}>
          <Text style={{ fontSize: 64, marginBottom: 20 }}>🧑‍💼</Text>
          <Text style={{ color: '#F4F4F5', fontSize: 22, fontWeight: '800', marginBottom: 8, textAlign: 'center' }}>
            No Profile Yet
          </Text>
          <Text style={{ color: '#6B7280', fontSize: 14, textAlign: 'center', lineHeight: 22, marginBottom: 32 }}>
            Set up your profile to get personalised exam recommendations, save exams, and receive deadline alerts.
          </Text>
          <TouchableOpacity
            style={{ backgroundColor: '#7C3AED', borderRadius: 14, paddingVertical: 16, paddingHorizontal: 32 }}
            onPress={() => router.push('/onboarding')}>
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>Set Up Profile →</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }


  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Avatar block */}
        <View style={styles.avatarBlock}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user.name.charAt(0).toUpperCase()}</Text>
          </View>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.phone}>+91 {user.phone}</Text>
          {user.state && <Text style={styles.state}>📍 {user.state}{user.city ? `, ${user.city}` : ''}</Text>}
        </View>

        {/* Info chips */}
        <View style={styles.infoRow}>
          {user.gender && <View style={styles.infoChip}><Text style={styles.infoChipTxt}>
            {user.gender === 'MALE' ? '👨 Male' : user.gender === 'FEMALE' ? '👩 Female' : '🧑 Other'}
          </Text></View>}
          {user.qualification && <View style={styles.infoChip}><Text style={styles.infoChipTxt}>
            🎓 {user.qualification.replace('_', ' ')}
          </Text></View>}
          {user.employmentStatus && <View style={styles.infoChip}><Text style={styles.infoChipTxt}>
            💼 {user.employmentStatus}
          </Text></View>}
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{user.savedExamIds?.length ?? 0}</Text>
            <Text style={styles.statLabel}>Saved</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{user.preferredCategories?.length ?? 0}</Text>
            <Text style={styles.statLabel}>Categories</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{user.notificationsEnabled ? '🔔' : '🔕'}</Text>
            <Text style={styles.statLabel}>Notifs</Text>
          </View>
        </View>

        {/* Category preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Exam Preferences</Text>
          <Text style={styles.sectionHint}>Select all categories you're preparing for</Text>
          <View style={styles.chipGrid}>
            {CATEGORIES.map(c => (
              <CategoryChip
                key={c.value}
                label={c.label}
                value={c.value}
                selected={cats.includes(c.value)}
                onPress={() => toggleCat(c.value)}
              />
            ))}
          </View>
        </View>

        {/* Notifications toggle */}
        <View style={styles.section}>
          <View style={styles.toggleRow}>
            <View>
              <Text style={styles.toggleLabel}>🔔 Exam Notifications</Text>
              <Text style={styles.toggleHint}>Get alerts for registration, admit card, results</Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: '#2C2C2E', true: '#7C3AED' }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* Save button */}
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
          {saving
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.saveTxt}>Save Preferences</Text>}
        </TouchableOpacity>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutTxt}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0D0D0F' },
  avatarBlock: { alignItems: 'center', paddingTop: 28, paddingBottom: 16 },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#3B0764',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: '#7C3AED',
    marginBottom: 12,
  },
  avatarText: { color: '#C4B5FD', fontSize: 32, fontWeight: '800' },
  name: { color: '#F4F4F5', fontSize: 22, fontWeight: '800' },
  phone: { color: '#6B7280', fontSize: 14, marginTop: 4 },
  state: { color: '#9CA3AF', fontSize: 13, marginTop: 4 },
  infoRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, paddingHorizontal: 16, marginBottom: 16 },
  infoChip: {
    backgroundColor: '#1C1C1E',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2C2C2E',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  infoChipTxt: { color: '#9CA3AF', fontSize: 12, fontWeight: '600' },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    borderRadius: 14,
    backgroundColor: '#1C1C1E',
    borderWidth: 1,
    borderColor: '#2C2C2E',
    marginBottom: 20,
    overflow: 'hidden',
  },
  statBox: { flex: 1, alignItems: 'center', paddingVertical: 16 },
  statNum: { color: '#C4B5FD', fontSize: 22, fontWeight: '800' },
  statLabel: { color: '#6B7280', fontSize: 12, marginTop: 4 },
  section: { paddingHorizontal: 16, marginBottom: 20 },
  sectionTitle: { color: '#F4F4F5', fontSize: 16, fontWeight: '700', marginBottom: 4 },
  sectionHint: { color: '#6B7280', fontSize: 12, marginBottom: 12 },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  toggleLabel: { color: '#F4F4F5', fontSize: 15, fontWeight: '600', marginBottom: 4 },
  toggleHint: { color: '#6B7280', fontSize: 12 },
  saveBtn: {
    backgroundColor: '#7C3AED',
    borderRadius: 14,
    marginHorizontal: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  saveTxt: { color: '#fff', fontSize: 16, fontWeight: '700' },
  logoutBtn: {
    backgroundColor: '#1C1C1E',
    borderRadius: 14,
    marginHorizontal: 16,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  logoutTxt: { color: '#EF4444', fontSize: 15, fontWeight: '600' },
});
