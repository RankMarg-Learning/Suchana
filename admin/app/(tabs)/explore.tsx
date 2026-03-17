import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, StatusBar, RefreshControl, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { examService, scraperService, ReviewStats } from '@/services/api.service';

const { width } = Dimensions.get('window');

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
      const data = examRes.data;
      const exams = Array.isArray(data) ? data : [];
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
      <StatusBar barStyle="light-content" />
      <ScrollView 
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFF" />}
      >
        <LinearGradient colors={['#4F46E5', '#3730A3']} style={styles.heroBanner}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>Command Center</Text>
              <Text style={styles.subGreeting}>Suchana Admin Intelligence</Text>
            </View>
            <TouchableOpacity style={styles.refreshBtn} onPress={onRefresh}>
              <Ionicons name="reload" size={20} color="#FFF" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.mainStatsRow}>
            <View style={styles.mainStatItem}>
              <Text style={styles.mainStatValue}>{examCount}</Text>
              <Text style={styles.mainStatLabel}>Live Exams</Text>
            </View>
            <View style={styles.mainStatDivider} />
            <View style={styles.mainStatItem}>
              <Text style={styles.mainStatValue}>{scraperStats?.reviewQueue.pending ?? 0}</Text>
              <Text style={styles.mainStatLabel}>In Review</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.body}>
          <Text style={styles.sectionTitle}>Performance Overview</Text>
          <View style={styles.grid}>
            <StatCard label="Approved" value={scraperStats?.reviewQueue.approved ?? 0} icon="checkmark-circle" color="#10B981" />
            <StatCard label="Duplicates" value={scraperStats?.reviewQueue.duplicates ?? 0} icon="layers" color="#6366F1" />
            <StatCard label="Rejected" value={scraperStats?.reviewQueue.rejected ?? 0} icon="close-circle" color="#EF4444" />
            <StatCard label="Need Fixes" value={scraperStats?.reviewQueue.needsCorrection ?? 0} icon="hammer" color="#F59E0B" />
          </View>

          {scraperStats?.recentJobs && scraperStats.recentJobs.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Pipeline Activity</Text>
                <TouchableOpacity><Text style={styles.seeAll}>History</Text></TouchableOpacity>
              </View>
              <View style={styles.jobsCard}>
                {scraperStats.recentJobs.slice(0, 5).map((job: any, idx: number) => (
                  <View key={job.id} style={[styles.jobRow, idx === 0 && { borderTopWidth: 0 }]}>
                    <View style={[styles.jobIcon, { backgroundColor: job.status === 'COMPLETED' ? '#ECFDF5' : job.status === 'FAILED' ? '#FEF2F2' : '#FFFBEB' }]}>
                      <Ionicons 
                        name={job.status === 'COMPLETED' ? 'checkmark' : job.status === 'FAILED' ? 'close' : 'sync'} 
                        size={16} 
                        color={job.status === 'COMPLETED' ? '#10B981' : job.status === 'FAILED' ? '#EF4444' : '#F59E0B'} 
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.jobLabel} numberOfLines={1}>{job.scrapeSource?.label ?? 'Manual Job'}</Text>
                      <Text style={styles.jobMeta}>{job.candidatesFound} found · {new Date(job.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                    </View>
                    <View style={[styles.statusPill, { backgroundColor: job.status === 'COMPLETED' ? '#D1FAE5' : '#F3F4F6' }]}>
                      <Text style={[styles.statusPillText, { color: job.status === 'COMPLETED' ? '#065F46' : '#6B7280' }]}>{job.status}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          <LinearGradient colors={['#EFF6FF', '#DBEAFE']} style={styles.infoBanner}>
            <View style={styles.infoIconBox}>
              <Ionicons name="pulse" size={24} color="#3B82F6" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.infoTitle}>System Healthy</Text>
              <Text style={styles.infoDesc}>All crawlers and AI extraction engines are running within normal latency parameters.</Text>
            </View>
          </LinearGradient>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const StatCard = ({ label, value, icon, color }: any) => (
  <View style={styles.statCard}>
    <View style={[styles.iconBox, { backgroundColor: color + '15' }]}>
      <Ionicons name={icon} size={20} color={color} />
    </View>
    <View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  content: { paddingBottom: 40 },
  heroBanner: { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 40, borderBottomLeftRadius: 40, borderBottomRightRadius: 40 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  greeting: { fontSize: 28, fontWeight: '900', color: '#FFF' },
  subGreeting: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.7)', letterSpacing: 0.5 },
  refreshBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
  
  mainStatsRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 24, padding: 20 },
  mainStatItem: { flex: 1, alignItems: 'center' },
  mainStatValue: { fontSize: 24, fontWeight: '900', color: '#FFF' },
  mainStatLabel: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', marginTop: 4 },
  mainStatDivider: { width: 1, height: 30, backgroundColor: 'rgba(255,255,255,0.2)' },

  body: { paddingHorizontal: 20, marginTop: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#111827', marginBottom: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statCard: { width: (width - 52) / 2, backgroundColor: '#FFF', padding: 16, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 12, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  iconBox: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  statValue: { fontSize: 18, fontWeight: '800', color: '#111827' },
  statLabel: { fontSize: 11, fontWeight: '600', color: '#6B7280', marginTop: 1 },

  section: { marginTop: 32 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  seeAll: { fontSize: 13, fontWeight: '700', color: '#4F46E5' },
  jobsCard: { backgroundColor: '#FFF', borderRadius: 24, padding: 4, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 10, elevation: 2 },
  jobRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  jobIcon: { width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  jobLabel: { fontSize: 14, fontWeight: '700', color: '#1F2937' },
  jobMeta: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  statusPill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusPillText: { fontSize: 9, fontWeight: '800', textTransform: 'uppercase' },

  infoBanner: { marginTop: 32, borderRadius: 24, padding: 16, flexDirection: 'row', gap: 16, alignItems: 'center' },
  infoIconBox: { width: 48, height: 48, borderRadius: 16, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center' },
  infoTitle: { fontSize: 15, fontWeight: '800', color: '#1E40AF' },
  infoDesc: { fontSize: 12, color: '#3B82F6', marginTop: 2, lineHeight: 18, fontWeight: '500' },
});
