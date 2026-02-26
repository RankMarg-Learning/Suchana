
import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { examService } from '@/services/api.service';

export default function DashboardScreen() {
  const [stats, setStats] = useState({ total: 0, active: 0, upcoming: 0 });
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      const response = await examService.getAllExams();
      const exams = Array.isArray(response) ? response : (response.data || []);
      setStats({
        total: exams.length,
        active: exams.filter((e: any) => e.status === 'ACTIVE').length,
        upcoming: exams.filter((e: any) => e.status === 'UPCOMING').length,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView 
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Text style={styles.header}>Dashboard</Text>
        
        <View style={styles.statsRow}>
          <StatCard label="Total Exams" value={stats.total} icon="document-text" color="#2196F3" />
          <StatCard label="Active" value={stats.active} icon="checkmark-circle" color="#4CAF50" />
        </View>
        
        <View style={styles.statsRow}>
          <StatCard label="Upcoming" value={stats.upcoming} icon="time" color="#FF9800" />
          <StatCard label="System Heat" value="Stable" icon="pulse" color="#9C27B0" />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Quick Actions</Text>
          <View style={styles.actionGrid}>
            <ActionButton icon="notifications" label="Push Test" />
            <ActionButton icon="cloud-done" label="Cache Clear" />
            <ActionButton icon="people" label="Users" />
            <ActionButton icon="settings" label="Config" />
          </View>
        </View>

        <View style={styles.announcement}>
          <Ionicons name="information-circle" size={24} color="#2196F3" />
          <View style={styles.announcementText}>
            <Text style={styles.announcementTitle}>Backend Operational</Text>
            <Text style={styles.announcementDesc}>All systems are running normally. Push notification worker is active.</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const StatCard = ({ label, value, icon, color }: any) => (
  <View style={styles.statCard}>
    <View style={[styles.iconCircle, { backgroundColor: color + '15' }]}>
      <Ionicons name={icon} size={24} color={color} />
    </View>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const ActionButton = ({ icon, label }: any) => (
  <TouchableOpacity style={styles.actionBtn}>
    <View style={styles.actionIcon}>
      <Ionicons name={icon} size={24} color="#666" />
    </View>
    <Text style={styles.actionLabel}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  content: {
    padding: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 20,
    marginTop: 8,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 20,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
  },
  actionBtn: {
    width: '20%',
    minWidth: 60,
    alignItems: 'center',
  },
  actionIcon: {
    width: 50,
    height: 50,
    backgroundColor: '#F5F5F5',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 11,
    color: '#666',
    fontWeight: '600',
  },
  announcement: {
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  announcementText: {
    flex: 1,
  },
  announcementTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1565C0',
  },
  announcementDesc: {
    fontSize: 12,
    color: '#1976D2',
    marginTop: 2,
  },
});
