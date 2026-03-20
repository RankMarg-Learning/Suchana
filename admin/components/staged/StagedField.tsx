
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Pencil } from 'lucide-react-native';
import Markdown from 'react-native-markdown-display';

interface StagedFieldProps {
  label: string;
  value?: string | number | null;
  onEdit: () => void;
  multiline?: boolean;
  placeholder?: string;
  isLast?: boolean;
}

export const StagedField: React.FC<StagedFieldProps> = React.memo(({
  label, value, onEdit, multiline = false, placeholder = '—', isLast = false,
}) => (
  <View style={[styles.container, isLast && styles.lastContainer]}>
    <View style={styles.content}>
      <Text style={styles.label}>{label}</Text>
      {value && String(value).length > 0 ? (
        <View style={styles.markdownWrapper}>
          <Markdown style={markdownStyles}>{String(value).replace(/\\n/g, '\n')}</Markdown>
        </View>
      ) : (
        <Text style={[styles.value, !value && styles.valueEmpty]}>
          {placeholder}
        </Text>
      )}
    </View>
    <TouchableOpacity 
      onPress={onEdit}
      style={styles.editButton}
      activeOpacity={0.7}
    >
      <Pencil size={15} color="#94a3b8" strokeWidth={3} />
    </TouchableOpacity>
  </View>
));

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc', // Slate 50
  },
  lastContainer: {
    borderBottomWidth: 0,
  },
  content: {
    flex: 1,
    paddingRight: 12,
  },
  label: {
    fontSize: 10,
    fontWeight: '900',
    color: '#94a3b8', // Slate 400
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  value: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b', // Slate 800
    lineHeight: 22,
  },
  valueEmpty: {
    color: '#D1D5DB',
    fontStyle: 'italic',
  },
  editButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#f1f5f9', // Slate 100
    justifyContent: 'center',
    alignItems: 'center',
  },
  markdownWrapper: {
    marginTop: 4,
  },
});

const markdownStyles: any = {
  body: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
    fontWeight: '600',
  },
  paragraph: {
    marginTop: 0,
    marginBottom: 4,
  },
  list_item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 2,
  },
  strong: {
    fontWeight: '800',
    color: '#111827',
  },
};
