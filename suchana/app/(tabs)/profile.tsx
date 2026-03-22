import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Switch, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Bell,
  BellOff,
  User,
  MapPin,
  GraduationCap,
  Briefcase,
  CheckCircle,
  ChevronRight,
} from 'lucide-react-native';
import { useUser } from '@/context/UserContext';
import { updateUser } from '@/services/userService';
import { useRouter } from 'expo-router';
import { NativeAdCard } from '@/components/NativeAdCard';
import { AdBanner } from '@/components/AdBanner';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useColorScheme } from '@/hooks/use-color-scheme';

import { SafeNotifications } from '@/services/notificationService';

export default function ProfileScreen() {
  const { user, userId, refreshUser, logout } = useUser();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [notifications, setNotifications] = useState(user?.notificationsEnabled ?? true);
  const colorScheme = useColorScheme();

  const background = useThemeColor({}, 'background');
  const textPrimary = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const cardBg = useThemeColor({}, 'card');
  const tint = useThemeColor({}, 'tint');
  const border = useThemeColor({}, 'border');

  const handleSave = async () => {
    if (!userId) return;
    setSaving(true);
    try {
      await updateUser(userId, {
        notificationsEnabled: notifications,
      });

      if (notifications) {
        await SafeNotifications.registerPushToken(userId);
      } else {
        const token = await SafeNotifications.getExpoPushTokenAsync();
        if (token) await SafeNotifications.deactivatePushToken(token);
      }

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
      <SafeAreaView style={[styles.root, { backgroundColor: background }]} edges={['top']}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 }}>
          <View style={{ marginBottom: 20, backgroundColor: cardBg, padding: 24, borderRadius: 40 }}>
            <User size={64} color={tint} />
          </View>
          <Text style={{ color: textPrimary, fontSize: 22, fontWeight: '800', marginBottom: 8, textAlign: 'center' }}>
            No Profile Yet
          </Text>
          <Text style={{ color: textMuted, fontSize: 14, textAlign: 'center', lineHeight: 22, marginBottom: 32 }}>
            Set up your profile to get personalised exam recommendations, save exams, and receive deadline alerts.
          </Text>
          <TouchableOpacity
            style={{ backgroundColor: tint, borderRadius: 14, paddingVertical: 16, paddingHorizontal: 32, flexDirection: 'row', alignItems: 'center' }}
            onPress={() => router.push('/onboarding')}>
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700', marginRight: 8 }}>Set Up Profile</Text>
            <ChevronRight size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: background }]} edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Avatar block */}
        <View style={styles.avatarBlock}>
          <View style={[styles.avatar, { backgroundColor: tint + '18', borderColor: tint }]}>
            <Text style={[styles.avatarText, { color: tint }]}>{user.name.charAt(0).toUpperCase()}</Text>
          </View>
          <Text style={[styles.name, { color: textPrimary }]}>{user.name}</Text>
          <Text style={[styles.phone, { color: textMuted }]}>+91 {user.phone}</Text>
          {user.state && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
              <MapPin size={14} color={textMuted} style={{ marginRight: 6 }} />
              <Text style={[styles.state, { color: textMuted }]}>{user.state}{user.city ? `, ${user.city}` : ''}</Text>
            </View>
          )}
        </View>

        {/* Info chips */}
        <View style={styles.infoRow}>
          {user.gender && (
            <View style={[styles.infoChip, { backgroundColor: cardBg, borderColor: border }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <User size={12} color={textMuted} style={{ marginRight: 6 }} />
                <Text style={[styles.infoChipTxt, { color: textMuted }]}>{user.gender.charAt(0) + user.gender.slice(1).toLowerCase()}</Text>
              </View>
            </View>
          )}
          {user.qualification && (
            <View style={[styles.infoChip, { backgroundColor: cardBg, borderColor: border }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <GraduationCap size={12} color={textMuted} style={{ marginRight: 6 }} />
                <Text style={[styles.infoChipTxt, { color: textMuted }]}>{user.qualification.replace('_', ' ')}</Text>
              </View>
            </View>
          )}
          {user.employmentStatus && (
            <View style={[styles.infoChip, { backgroundColor: cardBg, borderColor: border }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Briefcase size={12} color={textMuted} style={{ marginRight: 6 }} />
                <Text style={[styles.infoChipTxt, { color: textMuted }]}>{user.employmentStatus.charAt(0) + user.employmentStatus.slice(1).toLowerCase()}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Stats */}
        <View style={[styles.statsRow, { backgroundColor: cardBg, borderColor: border }]}>
          <TouchableOpacity
            style={styles.statBox}
            onPress={() => router.push('/explore')}>
            <Text style={[styles.statNum, { color: tint }]}>{user.savedExamIds?.length ?? 0}</Text>
            <Text style={[styles.statLabel, { color: textMuted }]}>Saved</Text>
          </TouchableOpacity>
          <View style={styles.statBox}>
            <Text style={[styles.statNum, { color: tint }]}>{user.preferredCategories?.length ?? 0}</Text>
            <Text style={[styles.statLabel, { color: textMuted }]}>Categories</Text>
          </View>
          <TouchableOpacity
            style={styles.statBox}
            onPress={() => router.push('/')}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
              {user.notificationsEnabled ? <Bell size={18} color={tint} /> : <BellOff size={18} color={textMuted} />}
            </View>
            <Text style={[styles.statLabel, { color: textMuted }]}>Alerts</Text>
          </TouchableOpacity>
        </View>

        {/* Native Ad in Profile */}
        <NativeAdCard placement="PROFILE_MIDDLE" style={{ marginHorizontal: 16, marginBottom: 20 }} />

        {/* Notifications toggle */}
        <View style={styles.section}>
          <View style={[styles.toggleRow, { backgroundColor: cardBg, borderColor: border }]}>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                <Bell size={18} color={tint} style={{ marginRight: 10 }} />
                <Text style={[styles.toggleLabel, { color: textPrimary, marginBottom: 0 }]}>Exam Notifications</Text>
              </View>
              <Text style={[styles.toggleHint, { color: textMuted }]}>Get alerts for registration, admit cards, and results</Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: border, true: tint }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* Save button */}
        <TouchableOpacity style={[styles.saveBtn, { backgroundColor: tint }]} onPress={handleSave} disabled={saving}>
          {saving
            ? <ActivityIndicator color="#fff" />
            : <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <CheckCircle size={20} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.saveTxt}>Save Preferences</Text>
            </View>}
        </TouchableOpacity>

        {/* Logout */}
        <TouchableOpacity style={[styles.logoutBtn, { backgroundColor: cardBg, borderColor: border }]} onPress={handleLogout}>
          <Text style={styles.logoutTxt}>Sign Out</Text>
        </TouchableOpacity>

        <AdBanner placement="PROFILE_BOTTOM" style={{ margin: 16 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  avatarBlock: { alignItems: 'center', paddingTop: 28, paddingBottom: 16 },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2,
    marginBottom: 12,
  },
  avatarText: { fontSize: 32, fontWeight: '800' },
  name: { fontSize: 22, fontWeight: '800' },
  phone: { fontSize: 14, marginTop: 4 },
  state: { fontSize: 13, marginTop: 4 },
  infoRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, paddingHorizontal: 16, marginBottom: 16 },
  infoChip: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  infoChipTxt: { fontSize: 12, fontWeight: '600' },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 20,
    overflow: 'hidden',
  },
  statBox: { flex: 1, alignItems: 'center', paddingVertical: 16 },
  statNum: { fontSize: 22, fontWeight: '800' },
  statLabel: { fontSize: 12, marginTop: 4 },
  section: { paddingHorizontal: 16, marginBottom: 20 },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
  },
  toggleLabel: { fontSize: 15, fontWeight: '600', marginBottom: 4 },
  toggleHint: { fontSize: 12 },
  saveBtn: {
    borderRadius: 14,
    marginHorizontal: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  saveTxt: { color: '#fff', fontSize: 16, fontWeight: '700' },
  logoutBtn: {
    borderRadius: 14,
    marginHorizontal: 16,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
  },
  logoutTxt: { color: '#EF4444', fontSize: 15, fontWeight: '600' },
});
