
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LucideIcon } from 'lucide-react-native';

interface StagedSectionProps {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}

export const StagedSection: React.FC<StagedSectionProps> = React.memo(({ title, icon: Icon, children }) => (
  <View style={styles.section}>
    <View style={styles.header}>
      <Icon size={16} color="#3b82f6" strokeWidth={3} />
      <Text style={styles.title}>{title}</Text>
    </View>
    <View style={styles.content}>
      {children}
    </View>
  </View>
));

const styles = StyleSheet.create({
  section: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  title: {
    fontSize: 12,
    fontWeight: '900',
    color: '#334155', // Slate 700
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  content: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 2,
    shadowColor: '#64748b', // Slate 500
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#f1f5f9', // Slate 100
  },
});
