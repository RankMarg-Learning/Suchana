import React from 'react';
import Markdown from 'react-native-markdown-display';
import { ScrollView, View, StyleSheet } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';

const markdownRules = {
  table: (node: any, children: any, parent: any, styles: any) => (
    <ScrollView horizontal key={node.key} showsHorizontalScrollIndicator={false}>
      <View style={styles.table}>
        {children}
      </View>
    </ScrollView>
  ),
  thead: (node: any, children: any, parent: any, styles: any) => (
    <View key={node.key} style={styles.thead}>{children}</View>
  ),
  tbody: (node: any, children: any, parent: any, styles: any) => (
    <View key={node.key} style={styles.tbody}>{children}</View>
  ),
};

import { formatDatesInText } from '@/utils/format';

interface Props {
  content: string;
  variant?: 'default' | 'fact';
  style?: any;
  includeTime?: boolean;
}

export function MarkdownRenderer({ content, variant = 'default', style, includeTime = false }: Props) {
  const textPrimary = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const border = useThemeColor({}, 'border');
  const cardBg = useThemeColor({}, 'card');
  const tint = useThemeColor({}, 'tint');

  const processedContent = React.useMemo(() => formatDatesInText(content, includeTime), [content, includeTime]);

  const baseStyles = {
    body: {
      color: textMuted,
      fontSize: 16,
      lineHeight: 26,
    },
    heading1: {
      fontSize: 26,
      fontWeight: '900' as const,
      color: textPrimary,
      marginTop: 24,
      marginBottom: 12,
    },
    heading2: {
      fontSize: 22,
      fontWeight: '800' as const,
      color: textPrimary,
      marginTop: 20,
      marginBottom: 10,
    },
    heading3: {
      fontSize: 19,
      fontWeight: '700' as const,
      color: textPrimary,
      marginTop: 16,
      marginBottom: 8,
    },
    strong: {
      fontWeight: 'bold' as const,
      color: textPrimary,
    },
    link: {
      color: tint,
    },
    table: {
      borderWidth: 1,
      borderColor: border,
      borderRadius: 8,
      marginVertical: 10,
      backgroundColor: cardBg,
    },
    thead: {
      backgroundColor: border,
      borderBottomWidth: 1,
      borderBottomColor: border,
    },
    th: {
      padding: 12,
      fontWeight: 'bold' as const,
      color: textPrimary,
      borderRightWidth: 1,
      borderRightColor: border,
      width: 140,
      fontSize: 13,
    },
    td: {
      padding: 12,
      color: textMuted,
      borderRightWidth: 1,
      borderRightColor: border,
      borderBottomWidth: 1,
      borderBottomColor: border,
      width: 140,
      fontSize: 13,
    },
    tr: {
      flexDirection: 'row' as const,
    },
  };

  const factStyles = {
    ...baseStyles,
    body: {
      color: textPrimary,
      fontSize: 14,
      fontWeight: '400' as const,
      lineHeight: 20,
    },
    strong: {
      fontWeight: '700' as const,
      color: textPrimary,
    },
    table: {
      borderWidth: 1,
      borderColor: border,
      borderRadius: 4,
      marginVertical: 4,
    },
    thead: {
      backgroundColor: border,
    },
    th: {
      color: textPrimary,
      padding: 8,
      fontWeight: '600' as const,
      width: 100,
      borderRightWidth: 1,
      borderColor: border,
    },
    td: {
      padding: 8,
      color: textMuted,
      width: 100,
      borderRightWidth: 1,
      borderBottomWidth: 1,
      borderColor: border,
    },
  };

  const activeStyles = variant === 'fact' ? factStyles : baseStyles;

  return (
    <Markdown style={{ ...activeStyles, ...style }} rules={markdownRules}>
      {processedContent}
    </Markdown>
  );
}
