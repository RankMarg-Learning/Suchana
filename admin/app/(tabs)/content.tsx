import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, Modal, TextInput, Switch, ActivityIndicator,
  StatusBar, RefreshControl, KeyboardAvoidingView, Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { configService, HomeBanner, AppConfig } from '@/services/api.service';

// ─── Types ────────────────────────────────────────────────────
type Tab = 'banners' | 'config';

// ─── Banner Form State ────────────────────────────────────────
const EMPTY_BANNER: Partial<HomeBanner> = {
  imageUrl: '', actionUrl: '', title: '', description: '',
  priority: 0, isActive: true, expiresAt: '',
};

// ─── Main Screen ──────────────────────────────────────────────
export default function ContentConfigScreen() {
  const [tab, setTab] = useState<Tab>('banners');
  const [refreshing, setRefreshing] = useState(false);

  // Banners
  const [banners, setBanners] = useState<HomeBanner[]>([]);
  const [bannersLoading, setBannersLoading] = useState(true);
  const [showBannerModal, setShowBannerModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState<HomeBanner | null>(null);
  const [bannerForm, setBannerForm] = useState<Partial<HomeBanner>>(EMPTY_BANNER);
  const [bannerSaving, setBannerSaving] = useState(false);
  const [showExpiryPicker, setShowExpiryPicker] = useState(false);

  // App Config
  const [configs, setConfigs] = useState<AppConfig[]>([]);
  const [configsLoading, setConfigsLoading] = useState(true);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [editingConfig, setEditingConfig] = useState<AppConfig | null>(null);
  const [configForm, setConfigForm] = useState({ key: '', value: '', description: '' });
  const [configSaving, setConfigSaving] = useState(false);

  // ── Fetch ─────────────────────────────────────────────────
  const fetchBanners = useCallback(async () => {
    try { setBannersLoading(true); setBanners(await configService.getBanners()); }
    catch { Alert.alert('Error', 'Failed to load banners'); }
    finally { setBannersLoading(false); }
  }, []);

  const fetchConfigs = useCallback(async () => {
    try { setConfigsLoading(true); setConfigs(await configService.getAllConfigs()); }
    catch { Alert.alert('Error', 'Failed to load app configs'); }
    finally { setConfigsLoading(false); }
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchBanners(), fetchConfigs()]);
    setRefreshing(false);
  };

  useFocusEffect(useCallback(() => {
    fetchBanners();
    fetchConfigs();
  }, [fetchBanners, fetchConfigs]));

  // ── Banner Operations ──────────────────────────────────────
  const openBannerModal = (banner?: HomeBanner) => {
    setEditingBanner(banner || null);
    setBannerForm(banner ? { ...banner } : EMPTY_BANNER);
    setShowBannerModal(true);
  };

  const saveBanner = async () => {
    if (!bannerForm.imageUrl) { Alert.alert('Validation', 'Image URL is required.'); return; }
    try {
      setBannerSaving(true);
      if (editingBanner) {
        const updated = await configService.updateBanner(editingBanner.id, bannerForm);
        setBanners(b => b.map(x => x.id === updated.id ? updated : x));
      } else {
        const created = await configService.createBanner(bannerForm);
        setBanners(b => [created, ...b]);
      }
      setShowBannerModal(false);
    } catch { Alert.alert('Error', 'Failed to save banner'); }
    finally { setBannerSaving(false); }
  };

  const toggleBannerActive = async (banner: HomeBanner) => {
    try {
      const updated = await configService.updateBanner(banner.id, { isActive: !banner.isActive });
      setBanners(b => b.map(x => x.id === updated.id ? updated : x));
    } catch { Alert.alert('Error', 'Failed to toggle banner'); }
  };

  const deleteBanner = (banner: HomeBanner) => {
    Alert.alert('Delete Banner', `Delete "${banner.title || banner.imageUrl}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await configService.deleteBanner(banner.id);
            setBanners(b => b.filter(x => x.id !== banner.id));
          } catch { Alert.alert('Error', 'Failed to delete banner'); }
        }
      }
    ]);
  };

  // ── Config Operations ──────────────────────────────────────
  const openConfigModal = (config?: AppConfig) => {
    setEditingConfig(config || null);
    setConfigForm(config
      ? { key: config.key, value: JSON.stringify(config.value, null, 2), description: config.description || '' }
      : { key: '', value: '', description: '' });
    setShowConfigModal(true);
  };

  const saveConfig = async () => {
    if (!configForm.key.trim()) { Alert.alert('Validation', 'Key is required.'); return; }
    let parsedValue: any;
    try { parsedValue = JSON.parse(configForm.value); }
    catch { parsedValue = configForm.value; }
    try {
      setConfigSaving(true);
      const saved = await configService.setConfig(configForm.key, parsedValue, configForm.description || undefined);
      setConfigs(c => {
        const exists = c.find(x => x.id === saved.id || x.key === saved.key);
        return exists ? c.map(x => (x.key === saved.key ? saved : x)) : [saved, ...c];
      });
      setShowConfigModal(false);
    } catch { Alert.alert('Error', 'Failed to save config'); }
    finally { setConfigSaving(false); }
  };

  const deleteConfig = (config: AppConfig) => {
    Alert.alert('Delete Config', `Delete key "${config.key}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await configService.deleteConfig(config.id);
            setConfigs(c => c.filter(x => x.id !== config.id));
          } catch { Alert.alert('Error', 'Failed to delete config'); }
        }
      }
    ]);
  };

  // ── Render ─────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <LinearGradient colors={['#1E1B4B', '#312E81']} style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerEyebrow}>Admin Panel</Text>
            <Text style={styles.headerTitle}>Content & Config</Text>
          </View>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => tab === 'banners' ? openBannerModal() : openConfigModal()}
          >
            <Ionicons name="add" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* Tab Switcher */}
        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.tabBtn, tab === 'banners' && styles.tabBtnActive]}
            onPress={() => setTab('banners')}
          >
            <Ionicons name="images-outline" size={16} color={tab === 'banners' ? '#6366F1' : 'rgba(255,255,255,0.6)'} />
            <Text style={[styles.tabBtnText, tab === 'banners' && styles.tabBtnTextActive]}>Home Banners</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabBtn, tab === 'config' && styles.tabBtnActive]}
            onPress={() => setTab('config')}
          >
            <Ionicons name="settings-outline" size={16} color={tab === 'config' ? '#6366F1' : 'rgba(255,255,255,0.6)'} />
            <Text style={[styles.tabBtnText, tab === 'config' && styles.tabBtnTextActive]}>App Config</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Content */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#6366F1']} />}
      >
        {tab === 'banners' ? (
          bannersLoading ? (
            <View style={styles.centered}><ActivityIndicator size="large" color="#6366F1" /></View>
          ) : banners.length === 0 ? (
            <EmptyState icon="images-outline" text="No banners yet" sub="Tap + to create your first home banner." />
          ) : (
            banners.map(banner => (
              <BannerCard
                key={banner.id}
                banner={banner}
                onEdit={() => openBannerModal(banner)}
                onDelete={() => deleteBanner(banner)}
                onToggle={() => toggleBannerActive(banner)}
              />
            ))
          )
        ) : (
          configsLoading ? (
            <View style={styles.centered}><ActivityIndicator size="large" color="#6366F1" /></View>
          ) : configs.length === 0 ? (
            <EmptyState icon="settings-outline" text="No config keys yet" sub="Tap + to add your first app config entry." />
          ) : (
            configs.map(config => (
              <ConfigCard
                key={config.id}
                config={config}
                onEdit={() => openConfigModal(config)}
                onDelete={() => deleteConfig(config)}
              />
            ))
          )
        )}
      </ScrollView>

      {/* ─── Banner Modal ─────────────────────────────────── */}
      <Modal visible={showBannerModal} animationType="slide" transparent onRequestClose={() => setShowBannerModal(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <View style={styles.overlay}>
            <View style={styles.modalSheet}>
              <View style={styles.modalHandle} />
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{editingBanner ? 'Edit Banner' : 'New Banner'}</Text>
                <TouchableOpacity onPress={() => setShowBannerModal(false)}>
                  <Ionicons name="close" size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>
              <ScrollView showsVerticalScrollIndicator={false}>
                <FieldGroup label="Image URL *">
                  <TextInput
                    style={styles.input}
                    placeholder="https://cdn.example.com/banner.jpg"
                    placeholderTextColor="#9CA3AF"
                    value={bannerForm.imageUrl}
                    onChangeText={v => setBannerForm(f => ({ ...f, imageUrl: v }))}
                    autoCapitalize="none"
                  />
                </FieldGroup>
                <FieldGroup label="Title">
                  <TextInput
                    style={styles.input}
                    placeholder="Banner headline"
                    placeholderTextColor="#9CA3AF"
                    value={bannerForm.title}
                    onChangeText={v => setBannerForm(f => ({ ...f, title: v }))}
                  />
                </FieldGroup>
                <FieldGroup label="Description">
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Short description…"
                    placeholderTextColor="#9CA3AF"
                    value={bannerForm.description}
                    onChangeText={v => setBannerForm(f => ({ ...f, description: v }))}
                    multiline
                  />
                </FieldGroup>
                <FieldGroup label="Action URL">
                  <TextInput
                    style={styles.input}
                    placeholder="https://…"
                    placeholderTextColor="#9CA3AF"
                    value={bannerForm.actionUrl}
                    onChangeText={v => setBannerForm(f => ({ ...f, actionUrl: v }))}
                    autoCapitalize="none"
                  />
                </FieldGroup>
                <View style={styles.rowFields}>
                  <FieldGroup label="Priority" style={{ flex: 1 }}>
                    <TextInput
                      style={styles.input}
                      placeholder="0"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="numeric"
                      value={String(bannerForm.priority ?? 0)}
                      onChangeText={v => setBannerForm(f => ({ ...f, priority: parseInt(v) || 0 }))}
                    />
                  </FieldGroup>
                  <FieldGroup label="Expires At" style={{ flex: 1 }}>
                    <TouchableOpacity 
                      style={[styles.input, { flexDirection: 'row', alignItems: 'center', gap: 8 }]} 
                      onPress={() => setShowExpiryPicker(true)}
                    >
                      <Ionicons name="calendar-outline" size={20} color="#6366F1" />
                      <Text style={{ 
                        fontSize: 15, 
                        color: bannerForm.expiresAt ? '#111827' : '#9CA3AF',
                        fontWeight: bannerForm.expiresAt ? '600' : '400' 
                      }}>
                        {bannerForm.expiresAt ? format(new Date(bannerForm.expiresAt), 'PPP') : 'Never'}
                      </Text>
                      {!!bannerForm.expiresAt && (
                        <TouchableOpacity 
                          style={{ marginLeft: 'auto', padding: 4 }} 
                          onPress={() => setBannerForm(f => ({ ...f, expiresAt: '' }))}
                        >
                          <Ionicons name="close-circle" size={18} color="#EF4444" />
                        </TouchableOpacity>
                      )}
                    </TouchableOpacity>
                    {showExpiryPicker && (
                      <DateTimePicker
                        value={bannerForm.expiresAt ? new Date(bannerForm.expiresAt) : new Date()}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={(e, d) => {
                          setShowExpiryPicker(false);
                          if (e.type === 'set' && d) {
                            setBannerForm(f => ({ ...f, expiresAt: d.toISOString() }));
                          } else if (e.type === 'dismissed' && !bannerForm.expiresAt) {
                            setBannerForm(f => ({ ...f, expiresAt: '' }));
                          }
                        }}
                      />
                    )}
                  </FieldGroup>
                </View>
                <View style={styles.switchRow}>
                  <View>
                    <Text style={styles.switchLabel}>Active</Text>
                    <Text style={styles.switchSub}>Show on home screen</Text>
                  </View>
                  <Switch
                    value={bannerForm.isActive ?? true}
                    onValueChange={v => setBannerForm(f => ({ ...f, isActive: v }))}
                    trackColor={{ true: '#6366F1', false: '#D1D5DB' }}
                    thumbColor="#FFF"
                  />
                </View>
                <TouchableOpacity style={styles.saveBtn} onPress={saveBanner} disabled={bannerSaving}>
                  <LinearGradient colors={['#6366F1', '#4F46E5']} style={styles.saveBtnGrad}>
                    {bannerSaving
                      ? <ActivityIndicator color="#FFF" />
                      : <><Ionicons name="checkmark" size={20} color="#FFF" /><Text style={styles.saveBtnText}>Save Banner</Text></>}
                  </LinearGradient>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ─── Config Modal ──────────────────────────────────── */}
      <Modal visible={showConfigModal} animationType="slide" transparent onRequestClose={() => setShowConfigModal(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <View style={styles.overlay}>
            <View style={styles.modalSheet}>
              <View style={styles.modalHandle} />
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{editingConfig ? `Edit: ${editingConfig.key}` : 'New Config Key'}</Text>
                <TouchableOpacity onPress={() => setShowConfigModal(false)}>
                  <Ionicons name="close" size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>
              <ScrollView showsVerticalScrollIndicator={false}>
                <FieldGroup label="Key *">
                  <TextInput
                    style={[styles.input, editingConfig && { backgroundColor: '#F3F4F6', color: '#9CA3AF' }]}
                    placeholder="e.g. FEATURE_FLAG_DARK_MODE"
                    placeholderTextColor="#9CA3AF"
                    value={configForm.key}
                    onChangeText={v => setConfigForm(f => ({ ...f, key: v }))}
                    autoCapitalize="characters"
                    editable={!editingConfig}
                  />
                </FieldGroup>
                <FieldGroup label="Value (JSON or plain text)">
                  <TextInput
                    style={[styles.input, styles.textAreaTall, { fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' }]}
                    placeholder={'true\n\nor\n\n{"limit": 10}'}
                    placeholderTextColor="#9CA3AF"
                    value={configForm.value}
                    onChangeText={v => setConfigForm(f => ({ ...f, value: v }))}
                    multiline
                    autoCapitalize="none"
                  />
                </FieldGroup>
                <FieldGroup label="Description">
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="What does this config do?"
                    placeholderTextColor="#9CA3AF"
                    value={configForm.description}
                    onChangeText={v => setConfigForm(f => ({ ...f, description: v }))}
                    multiline
                  />
                </FieldGroup>
                <TouchableOpacity style={styles.saveBtn} onPress={saveConfig} disabled={configSaving}>
                  <LinearGradient colors={['#6366F1', '#4F46E5']} style={styles.saveBtnGrad}>
                    {configSaving
                      ? <ActivityIndicator color="#FFF" />
                      : <><Ionicons name="checkmark" size={20} color="#FFF" /><Text style={styles.saveBtnText}>Save Config</Text></>}
                  </LinearGradient>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

// ─── Sub-components ────────────────────────────────────────────
function BannerCard({ banner, onEdit, onDelete, onToggle }: {
  banner: HomeBanner; onEdit(): void; onDelete(): void; onToggle(): void;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={[styles.priorityBadge, { backgroundColor: banner.isActive ? '#DCFCE7' : '#F3F4F6' }]}>
          <Text style={[styles.priorityText, { color: banner.isActive ? '#16A34A' : '#9CA3AF' }]}>
            {banner.isActive ? 'Active' : 'Hidden'}
          </Text>
        </View>
        <View style={styles.cardActions}>
          <Switch
            value={banner.isActive}
            onValueChange={onToggle}
            trackColor={{ true: '#6366F1', false: '#D1D5DB' }}
            thumbColor="#FFF"
            style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
          />
          <TouchableOpacity onPress={onEdit} style={styles.actionIcon}>
            <Ionicons name="create-outline" size={20} color="#6366F1" />
          </TouchableOpacity>
          <TouchableOpacity onPress={onDelete} style={styles.actionIcon}>
            <Ionicons name="trash-outline" size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>

      {banner.title && <Text style={styles.cardTitle}>{banner.title}</Text>}
      {banner.description && <Text style={styles.cardDesc} numberOfLines={2}>{banner.description}</Text>}

      <View style={styles.urlRow}>
        <Ionicons name="image-outline" size={14} color="#9CA3AF" />
        <Text style={styles.urlText} numberOfLines={1}>{banner.imageUrl}</Text>
      </View>
      {banner.actionUrl && (
        <View style={styles.urlRow}>
          <Ionicons name="link-outline" size={14} color="#9CA3AF" />
          <Text style={styles.urlText} numberOfLines={1}>{banner.actionUrl}</Text>
        </View>
      )}

      <View style={styles.cardFooter}>
        <View style={styles.pill}>
          <Ionicons name="layers-outline" size={12} color="#6B7280" />
          <Text style={styles.pillText}>Priority {banner.priority}</Text>
        </View>
        {banner.expiresAt && (
          <View style={styles.pill}>
            <Ionicons name="time-outline" size={12} color="#6B7280" />
            <Text style={styles.pillText}>Expires {banner.expiresAt.split('T')[0]}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

function ConfigCard({ config, onEdit, onDelete }: {
  config: AppConfig; onEdit(): void; onDelete(): void;
}) {
  const valueStr = (() => {
    try { return JSON.stringify(config.value, null, 2); } catch { return String(config.value); }
  })();
  const isBoolean = typeof config.value === 'boolean';

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.keyBadge}>
          <Ionicons name="key-outline" size={12} color="#6366F1" />
          <Text style={styles.keyText}>{config.key}</Text>
        </View>
        <View style={styles.cardActions}>
          <TouchableOpacity onPress={onEdit} style={styles.actionIcon}>
            <Ionicons name="create-outline" size={20} color="#6366F1" />
          </TouchableOpacity>
          <TouchableOpacity onPress={onDelete} style={styles.actionIcon}>
            <Ionicons name="trash-outline" size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>

      {config.description && <Text style={styles.cardDesc}>{config.description}</Text>}

      <View style={styles.valueBox}>
        {isBoolean ? (
          <View style={[styles.boolChip, { backgroundColor: config.value ? '#DCFCE7' : '#FEE2E2' }]}>
            <Ionicons name={config.value ? 'checkmark-circle' : 'close-circle'} size={16} color={config.value ? '#16A34A' : '#DC2626'} />
            <Text style={[styles.boolText, { color: config.value ? '#16A34A' : '#DC2626' }]}>
              {config.value ? 'true' : 'false'}
            </Text>
          </View>
        ) : (
          <Text style={styles.valueText} numberOfLines={4}>{valueStr}</Text>
        )}
      </View>

      <Text style={styles.updatedText}>
        Updated {new Date(config.updatedAt).toLocaleDateString('en-IN')}
      </Text>
    </View>
  );
}

function EmptyState({ icon, text, sub }: { icon: any; text: string; sub: string }) {
  return (
    <View style={styles.emptyState}>
      <Ionicons name={icon} size={56} color="#D1D5DB" />
      <Text style={styles.emptyText}>{text}</Text>
      <Text style={styles.emptySub}>{sub}</Text>
    </View>
  );
}

function FieldGroup({ label, children, style }: { label: string; children: React.ReactNode; style?: any }) {
  return (
    <View style={[styles.fieldGroup, style]}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 0 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  headerEyebrow: { fontSize: 12, color: 'rgba(255,255,255,0.6)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  headerTitle: { fontSize: 28, fontWeight: '900', color: '#FFF' },
  addBtn: {
    width: 44, height: 44, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
  },
  tabRow: { flexDirection: 'row', gap: 8, paddingBottom: 0 },
  tabBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 12, borderTopLeftRadius: 14, borderTopRightRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  tabBtnActive: { backgroundColor: '#FFF' },
  tabBtnText: { fontSize: 13, fontWeight: '700', color: 'rgba(255,255,255,0.6)' },
  tabBtnTextActive: { color: '#6366F1' },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, gap: 12 },
  centered: { flex: 1, paddingTop: 80, alignItems: 'center' },
  // Cards
  card: {
    backgroundColor: '#FFF', borderRadius: 20, padding: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 12, elevation: 3,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  cardActions: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionIcon: { padding: 6 },
  cardTitle: { fontSize: 16, fontWeight: '800', color: '#111827', marginBottom: 4 },
  cardDesc: { fontSize: 13, color: '#6B7280', lineHeight: 19, marginBottom: 10 },
  urlRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  urlText: { fontSize: 12, color: '#9CA3AF', flex: 1 },
  cardFooter: { flexDirection: 'row', gap: 8, marginTop: 12 },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F3F4F6', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  pillText: { fontSize: 12, color: '#6B7280', fontWeight: '600' },
  priorityBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  priorityText: { fontSize: 12, fontWeight: '700' },
  keyBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#EEF2FF', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, maxWidth: '70%' },
  keyText: { fontSize: 12, fontWeight: '800', color: '#4F46E5', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  valueBox: { backgroundColor: '#F8FAFC', borderRadius: 12, padding: 12, marginVertical: 10, borderWidth: 1, borderColor: '#F1F5F9' },
  valueText: { fontSize: 12, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', color: '#374151', lineHeight: 18 },
  boolChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, alignSelf: 'flex-start' },
  boolText: { fontSize: 14, fontWeight: '800' },
  updatedText: { fontSize: 11, color: '#9CA3AF', marginTop: 4 },
  // Modals
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: '#FFF', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, maxHeight: '92%' },
  modalHandle: { width: 40, height: 5, backgroundColor: '#E5E7EB', borderRadius: 3, alignSelf: 'center', marginBottom: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 22, fontWeight: '900', color: '#111827' },
  fieldGroup: { marginBottom: 20 },
  fieldLabel: { fontSize: 12, fontWeight: '800', color: '#374151', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 },
  input: { backgroundColor: '#F9FAFB', borderRadius: 16, padding: 16, fontSize: 15, color: '#111827', borderWidth: 1.5, borderColor: '#F3F4F6' },
  textArea: { height: 80, textAlignVertical: 'top' },
  textAreaTall: { height: 140, textAlignVertical: 'top' },
  rowFields: { flexDirection: 'row', gap: 12 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: 16, padding: 16, marginBottom: 20, borderWidth: 1.5, borderColor: '#F3F4F6' },
  switchLabel: { fontSize: 15, fontWeight: '700', color: '#111827' },
  switchSub: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  saveBtn: { borderRadius: 20, overflow: 'hidden', marginBottom: 12, shadowColor: '#4F46E5', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 12, elevation: 6 },
  saveBtnGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, gap: 10 },
  saveBtnText: { color: '#FFF', fontSize: 17, fontWeight: '900', letterSpacing: 0.3 },
  emptyState: { paddingTop: 80, alignItems: 'center', gap: 12 },
  emptyText: { fontSize: 18, fontWeight: '800', color: '#374151' },
  emptySub: { fontSize: 13, color: '#9CA3AF', textAlign: 'center' },
});
