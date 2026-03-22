
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, CheckCircle2 } from 'lucide-react-native';

interface ChipModalProps {
  visible: boolean;
  title: string;
  options: string[];
  selected?: string;
  onSelect: (v: string) => void;
  onClose: () => void;
}

export const ChipModal: React.FC<ChipModalProps> = ({
  visible, title, options, selected, onSelect, onClose,
}) => (
  <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
    <SafeAreaView style={styles.modalBg}>
      <View style={styles.modalHeader}>
        <Text style={styles.modalHeaderTitle}>{title}</Text>
        <TouchableOpacity onPress={onClose} style={styles.modalCloseBtn}>
          <X size={24} color="#374151" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.chipList}>
        {options.map((opt) => (
          <TouchableOpacity
            key={opt}
            style={[styles.chipItem, selected === opt && styles.chipItemActive]}
            onPress={() => { onSelect(opt); onClose(); }}
          >
            <Text style={[styles.chipItemText, selected === opt && styles.chipItemTextActive]}>
              {opt.replace(/_/g, ' ')}
            </Text>
            {selected === opt && <CheckCircle2 size={20} color="#6366F1" strokeWidth={2.5} />}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  </Modal>
);

const styles = StyleSheet.create({
  modalBg: { flex: 1, backgroundColor: '#FFF' },
  modalHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalHeaderTitle: { fontSize: 18, fontWeight: '900', color: '#111827' },
  modalCloseBtn: { 
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipList: { padding: 12 },
  chipItem: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 14, 
    borderRadius: 14, 
    marginBottom: 8, 
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  chipItemActive: { 
    backgroundColor: '#F5F7FF', 
    borderColor: '#E0E7FF',
  },
  chipItemText: { fontSize: 16, fontWeight: '600', color: '#374151' },
  chipItemTextActive: { color: '#4F46E5', fontWeight: '800' },
});
