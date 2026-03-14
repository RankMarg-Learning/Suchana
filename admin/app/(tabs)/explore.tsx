import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { examService, scraperService, ReviewStats } from '@/services/api.service';

export default function DashboardScreen() {
  const [examCount, setExamCount] = useState(0);
  const [scraperStats, setScraperStats] = useState<ReviewStats | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      const [examRes, scraperRes] = await Promise.all([
        examService.getAllExams({ limit: 1 }),
        scraperService.getStats(),
      ]);
      const exams = Array.isArray(examRes) ? examRes : (examRes.data || []);
      setExamCount(examRes?.meta?.total ?? exams.length);
      setScraperStats(scraperRes.data);
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
          <StatCard label="Live Exams" value={examCount} icon="document-text" color="#2196F3" />
          <StatCard label="Pending Review" value={scraperStats?.reviewQueue.pending ?? 0} icon="time-outline" color="#F59E0B" />
        </View>
        
        <View style={styles.statsRow}>
          <StatCard label="Approved" value={scraperStats?.reviewQueue.approved ?? 0} icon="checkmark-circle" color="#4CAF50" />
          <StatCard label="Duplicates" value={scraperStats?.reviewQueue.duplicates ?? 0} icon="git-merge-outline" color="#9C27B0" />
        </View>

        {scraperStats?.recentJobs && scraperStats.recentJobs.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Recent Scrape Jobs</Text>
            {scraperStats.recentJobs.slice(0, 4).map((job: any) => (
              <View key={job.id} style={styles.jobRow}>
                <View style={[styles.jobDot, {
                  backgroundColor: job.status === 'COMPLETED' ? '#10B981' : job.status === 'FAILED' ? '#EF4444' : '#F59E0B'
                }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.jobLabel} numberOfLines={1}>{job.scrapeSource?.label ?? '—'}</Text>
                  <Text style={styles.jobMeta}>{job.candidatesFound} candidates · {job.status}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={styles.announcement}>
          <Ionicons name="information-circle" size={24} color="#2196F3" />
          <View style={styles.announcementText}>
            <Text style={styles.announcementTitle}>System Operational</Text>
            <Text style={styles.announcementDesc}>Scraper pipeline active. Review queue monitored in real-time.</Text>
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
    marginBottom: 16,
  },
  jobRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  jobDot: {
    width: 8, height: 8, borderRadius: 4,
  },
  jobLabel: { fontSize: 13, fontWeight: '600', color: '#374151' },
  jobMeta: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
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
