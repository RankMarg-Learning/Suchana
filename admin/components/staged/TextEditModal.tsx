
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Check } from 'lucide-react-native';

interface TextEditModalProps {
  visible: boolean;
  title: string;
  value: string;
  onSave: (v: string) => void;
  onClose: () => void;
  multiline?: boolean;
  keyboardType?: any;
  suggestions?: string[];
}

export const TextEditModal: React.FC<TextEditModalProps> = ({
  visible, title, value, onSave, onClose, multiline = false, keyboardType = 'default', suggestions = [],
}) => {
  const [text, setText] = useState(value);
  useEffect(() => { if (visible) setText(value); }, [visible, value]);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.modalBg}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
          style={{ flex: 1 }}
        >
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
              <X size={20} color="#6B7280" strokeWidth={2.5} />
            </TouchableOpacity>
            <Text style={styles.modalHeaderTitle}>{title}</Text>
            <TouchableOpacity 
              onPress={() => { onSave(text); onClose(); }} 
              style={styles.saveButton}
            >
              <Check size={20} color="#FFF" strokeWidth={3} />
            </TouchableOpacity>
          </View>
          
          <ScrollView 
            style={styles.form} 
            contentContainerStyle={{ paddingBottom: 40 }}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.label}>Update {title}</Text>
            
            {suggestions.length > 0 && (
              <View style={styles.suggestions}>
                {suggestions.map((s) => (
                  <TouchableOpacity 
                    key={s} 
                    onPress={() => setText(s)} 
                    style={[styles.suggestionChip, text === s && styles.suggestionChipActive]}
                  >
                    <Text style={[styles.suggestionText, text === s && styles.suggestionTextActive]}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            <TextInput
              style={[styles.input, multiline && styles.inputMulti]}
              value={text}
              onChangeText={setText}
              autoFocus
              multiline={multiline}
              numberOfLines={multiline ? 8 : 1}
              textAlignVertical={multiline ? 'top' : 'center'}
              keyboardType={keyboardType}
              placeholder={`Enter ${title.toLowerCase()}…`}
              placeholderTextColor="#9CA3AF"
            />
            {multiline && (
              <Text style={styles.helper}>TIP: Use markdown for rich formatting in long descriptions.</Text>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBg: { flex: 1, backgroundColor: '#FFF' },
  modalHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalHeaderTitle: { fontSize: 18, fontWeight: '900', color: '#111827' },
  cancelButton: { 
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButton: { 
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  form: { padding: 24 },
  label: { 
    fontSize: 12, 
    fontWeight: '800', 
    color: '#6B7280', 
    textTransform: 'uppercase', 
    letterSpacing: 1,
    marginBottom: 12,
  },
  input: { 
    borderWidth: 2, 
    borderColor: '#F3F4F6', 
    borderRadius: 20, 
    padding: 20, 
    fontSize: 17, 
    color: '#111827', 
    backgroundColor: '#F9FAFB',
    minHeight: 64,
  },
  inputMulti: { minHeight: 180, paddingTop: 20 },
  helper: {
    marginTop: 12,
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  suggestions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  suggestionChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  suggestionChipActive: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  suggestionText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4B5563',
  },
  suggestionTextActive: {
    color: '#FFF',
  },
});
