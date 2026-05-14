import React, { useState } from 'react';
import Markdown from 'react-native-markdown-display';
import { ScrollView, View, Text, StyleSheet, Linking, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  ExternalLink, Info, AlertTriangle, Lightbulb, 
  ArrowRight, Send, Calendar, MessageCircle, 
  BookOpen, ChevronDown, CheckCircle 
} from 'lucide-react-native';
import { useThemeColor } from '@/hooks/use-theme-color';
import { formatDatesInText } from '@/utils/format';

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
  image: (node: any, children: any, parent: any, styles: any) => {
    const { src, alt } = node.attributes;
    return (
      <Image
        key={node.key}
        source={{ uri: src }}
        style={styles.image}
        accessibilityLabel={alt}
        resizeMode="contain"
      />
    );
  },
  ins: (node: any, children: any, parent: any, styles: any) => (
    <Text key={node.key} style={{ textDecorationLine: 'underline' }}>{children}</Text>
  ),
  u: (node: any, children: any, parent: any, styles: any) => (
    <Text key={node.key} style={{ textDecorationLine: 'underline' }}>{children}</Text>
  ),
};

interface Props {
  content: string;
  variant?: 'default' | 'fact';
  style?: any;
  includeTime?: boolean;
}

export function MarkdownRenderer({ content, variant = 'default', style, includeTime = false }: Props) {
  const router = useRouter();
  const textPrimary = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const border = useThemeColor({}, 'border');
  const cardBg = useThemeColor({}, 'card');
  const tint = useThemeColor({}, 'tint');

  const handleLinkPress = (url: string) => {
    if (url.startsWith('http')) {
      Linking.openURL(url);
      return true;
    }
    if (url.startsWith('/')) {
        router.push(url as any);
        return true;
    }
    return false;
  };

  const processedContent = React.useMemo(() => {
    let final = content.replace(/\\n/g, "\n");
    return formatDatesInText(final, includeTime);
  }, [content, includeTime]);

  // Parsing logic for blocks
  const blocks = React.useMemo(() => {
    if (!processedContent) return [];
    
    // Regex to find shortcodes: [TYPE: Content]
    const shortcodeRegex = /\[(MCQ|BUTTON|TELEGRAM|WHATSAPP|TIMELINE|READMORE|BOOK|BOOKGRID):([\s\S]*?)\]/gi;
    
    const result = [];
    let lastIndex = 0;
    let match;

    while ((match = shortcodeRegex.exec(processedContent)) !== null) {
      // Add text before the shortcode
      if (match.index > lastIndex) {
        result.push({ type: 'markdown', content: processedContent.substring(lastIndex, match.index) });
      }
      
      // Add the shortcode block
      result.push({ type: match[1].toUpperCase(), data: match[2] });
      lastIndex = shortcodeRegex.lastIndex;
    }
    
    // Add remaining text
    if (lastIndex < processedContent.length) {
      result.push({ type: 'markdown', content: processedContent.substring(lastIndex) });
    }
    
    return result;
  }, [processedContent]);

  const baseStyles = {
    body: { color: textMuted, fontSize: 16, lineHeight: 26 },
    heading1: { fontSize: 26, fontWeight: '900' as const, color: textPrimary, marginTop: 24, marginBottom: 12 },
    heading2: { fontSize: 22, fontWeight: '800' as const, color: textPrimary, marginTop: 20, marginBottom: 10 },
    heading3: { fontSize: 19, fontWeight: '700' as const, color: textPrimary, marginTop: 16, marginBottom: 8 },
    strong: { fontWeight: 'bold' as const, color: textPrimary },
    link: { color: tint },
    table: { borderWidth: 1, borderColor: border, borderRadius: 8, marginVertical: 10, backgroundColor: cardBg },
    thead: { backgroundColor: border, borderBottomWidth: 1, borderBottomColor: border },
    th: { padding: 12, fontWeight: 'bold' as const, color: textPrimary, borderRightWidth: 1, borderRightColor: border, width: 140, fontSize: 16 },
    td: { padding: 12, color: textMuted, borderRightWidth: 1, borderRightColor: border, borderBottomWidth: 1, borderBottomColor: border, width: 140, fontSize: 16 },
    tr: { flexDirection: 'row' as const },
    image: { width: '100%', height: 200, borderRadius: 12, marginVertical: 10 },
  };

  const activeStyles = variant === 'fact' ? { ...baseStyles, body: { ...baseStyles.body, color: textPrimary, fontSize: 14 } } : baseStyles;

  const renderBlock = (block: any, index: number) => {
    switch (block.type) {
      case 'markdown':
        return (
          <Markdown 
            key={index}
            style={{ ...activeStyles, ...style }} 
            rules={markdownRules}
            onLinkPress={handleLinkPress}
          >
            {block.content}
          </Markdown>
        );
      case 'BUTTON': {
        const [label, url, align] = block.data.split('|').map((s: string) => s.trim());
        return (
          <View key={index} style={[styles.buttonContainer, align === 'left' ? styles.alignLeft : align === 'right' ? styles.alignRight : styles.alignCenter]}>
             <TouchableOpacity style={[styles.customButton, { backgroundColor: tint }]} onPress={() => Linking.openURL(url)}>
                <Text style={styles.buttonText}>{label}</Text>
             </TouchableOpacity>
          </View>
        );
      }
      case 'MCQ': {
        const [question, optionsStr, answer, solution] = block.data.split('|').map((s: string) => s.trim());
        const options = optionsStr.split(';').map((s: string) => s.trim());
        return <MCQComponent key={index} question={question} options={options} answer={parseInt(answer)} solution={solution} styles={activeStyles} handleLinkPress={handleLinkPress} />;
      }
      case 'TELEGRAM':
      case 'WHATSAPP':
      case 'TIMELINE': {
        const [label, url] = block.data.split('|').map((s: string) => s.trim());
        const isTelegram = block.type === 'TELEGRAM';
        const isWhatsapp = block.type === 'WHATSAPP';
        const isTimeline = block.type === 'TIMELINE';
        
        // Colors from web
        const color = isTelegram ? '#0088cc' : isWhatsapp ? '#25d366' : '#7c3aed';
        const Icon = isTelegram ? Send : isWhatsapp ? MessageCircle : Calendar;
        
        return (
          <TouchableOpacity 
            key={index} 
            style={[styles.socialCard, { backgroundColor: color + '10', borderColor: color + '25' }]}
            onPress={() => Linking.openURL(url)}
          >
            <View style={[styles.socialIcon, { backgroundColor: color }]}>
                <Icon size={20} color="#fff" />
            </View>
            <View style={styles.socialText}>
                <Text style={[styles.socialLabel, { color }]}>
                    {isTelegram ? 'LATEST UPDATES' : isWhatsapp ? 'INSTANT ALERTS' : 'EXAM SCHEDULE'}
                </Text>
                <Text style={[styles.socialTitle, { color: textPrimary }]} numberOfLines={2}>
                    {label}
                </Text>
            </View>
            <View style={[styles.socialBadge, { backgroundColor: color }]}>
                <Text style={styles.socialBadgeText}>{isTimeline ? 'VIEW' : 'JOIN'}</Text>
            </View>
          </TouchableOpacity>
        );
      }
      case 'READMORE': {
        const [label, url] = block.data.split('|').map((s: string) => s.trim());
        return (
            <TouchableOpacity 
                key={index} 
                style={[styles.readMore, { backgroundColor: 'transparent', borderTopColor: border, borderBottomColor: border }]}
                onPress={() => handleLinkPress(url)}
            >
                <View style={[styles.readMoreBadge, { backgroundColor: tint }]}>
                    <Text style={styles.readMoreBadgeText}>READ MORE</Text>
                </View>
                <Text style={[styles.readMoreText, { color: textPrimary }]} numberOfLines={2}>{label}</Text>
                <ArrowRight size={18} color={tint} />
            </TouchableOpacity>
        );
      }
      case 'BOOKGRID': {
        const booksRaw = block.data || "";
        const books = booksRaw.split(';').map((b: string) => b.trim()).filter(Boolean);
        return (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} key={index} contentContainerStyle={styles.bookGrid}>
            {books.map((bookStr: string, idx: number) => {
              const parts = bookStr.split('|').map(s => s.trim());
              if (parts.length < 3) return null;
              const bUrl = parts.pop()!;
              const bImage = parts.pop()!;
              const bTitle = parts.join(' | ');
              return <BookCard key={idx} title={bTitle} image={bImage} url={bUrl} isMini />;
            })}
          </ScrollView>
        );
      }
      case 'BOOK': {
        const [title, image, url] = block.data.split('|').map((s: string) => s.trim());
        return <BookCard key={index} title={title} image={image} url={url} />;
      }
      default:
        return null;
    }
  };

  return (
    <View style={styles.root}>
      {blocks.map(renderBlock)}
    </View>
  );
}

function MCQComponent({ question, options, answer, solution, styles: markdownStyles, handleLinkPress }: any) {
  const [selected, setSelected] = useState<number | null>(null);
  const tint = useThemeColor({}, 'tint');
  const textPrimary = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const cardBg = useThemeColor({}, 'card');
  const border = useThemeColor({}, 'border');
  const background = useThemeColor({}, 'background');

  const showResult = selected !== null;

  return (
    <View style={styles.mcqContainer}>
      <Markdown 
        style={{ ...markdownStyles, body: { ...markdownStyles.body, fontSize: 18, fontWeight: '800', lineHeight: 24, marginBottom: 16, color: textPrimary } }}
        onLinkPress={handleLinkPress}
      >
        {question}
      </Markdown>
      <View style={styles.optionsList}>
        {options.map((opt: string, idx: number) => {
          const isCorrect = idx + 1 === answer;
          const isSelected = selected === idx;
          
          let stateStyle = { backgroundColor: cardBg, borderColor: border };
          if (showResult) {
            if (isCorrect) stateStyle = { backgroundColor: '#10b98115', borderColor: '#10b981' };
            else if (isSelected) stateStyle = { backgroundColor: '#ef444415', borderColor: '#ef4444' };
          }

          return (
            <TouchableOpacity 
              key={idx} 
              disabled={showResult}
              onPress={() => setSelected(idx)}
              style={[styles.optionBtn, stateStyle]}
            >
              <View style={[styles.optionIndex, { backgroundColor: showResult && isCorrect ? '#10b981' : showResult && isSelected ? '#ef4444' : border }]}>
                <Text style={styles.optionIndexText}>{String.fromCharCode(65 + idx)}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Markdown 
                  style={{ ...markdownStyles, body: { ...markdownStyles.body, fontSize: 15, fontWeight: '600', color: textPrimary } }} 
                  onLinkPress={handleLinkPress}
                >
                  {opt}
                </Markdown>
              </View>
              {showResult && isCorrect && <CheckCircle size={18} color="#10b981" />}
              {showResult && isSelected && !isCorrect && <AlertTriangle size={18} color="#ef4444" />}
            </TouchableOpacity>
          );
        })}
      </View>
      {showResult && (
        <View style={[styles.solutionBox, { backgroundColor: cardBg, borderColor: border }]}>
            <View style={styles.solutionHeader}>
                <Lightbulb size={16} color={tint} />
                <Text style={[styles.solutionTitle, { color: tint }]}>Explanation</Text>
            </View>
            <Markdown 
              style={{ ...markdownStyles, body: { ...markdownStyles.body, fontSize: 14, lineHeight: 22, color: textMuted } }} 
              onLinkPress={handleLinkPress}
            >
              {solution}
            </Markdown>
        </View>
      )}
    </View>
  );
}

function BookCard({ title, image, url, isMini }: any) {
    const tint = useThemeColor({}, 'tint');
    const border = useThemeColor({}, 'border');
    const textPrimary = useThemeColor({}, 'text');
    const textMuted = useThemeColor({}, 'textMuted');
    const cardBg = useThemeColor({}, 'card');

    return (
        <TouchableOpacity 
            style={[
                styles.bookCard, 
                { backgroundColor: cardBg, borderColor: border },
                isMini && styles.bookCardMini
            ]}
            onPress={() => Linking.openURL(url)}
        >
            <View style={[styles.bookBadge, { backgroundColor: tint }]}>
                <Text style={styles.bookBadgeText}>TOPPER RECOMMENDED</Text>
            </View>
            <Image source={{ uri: image }} style={isMini ? styles.bookImageMini : styles.bookImage} resizeMode="contain" />
            <View style={styles.bookInfo}>
                <Text style={[styles.bookTitle, { color: textPrimary }, isMini && styles.bookTitleMini]} numberOfLines={2}>{title}</Text>
                {!isMini && (
                    <View style={[styles.bookBtn, { backgroundColor: tint + '15' }]}>
                        <BookOpen size={14} color={tint} />
                        <Text style={[styles.bookBtnText, { color: tint }]}>See Book</Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
  root: { width: '100%' },
  buttonContainer: { marginVertical: 20, width: '100%' },
  alignLeft: { alignItems: 'flex-start' },
  alignCenter: { alignItems: 'center' },
  alignRight: { alignItems: 'flex-end' },
  customButton: { paddingHorizontal: 32, paddingVertical: 14, borderRadius: 100 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  mcqContainer: { marginVertical: 24 },
  mcqQuestion: { fontSize: 18, fontWeight: '800', lineHeight: 24, marginBottom: 16 },
  optionsList: { gap: 10 },
  optionBtn: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, borderWidth: 1, gap: 12 },
  optionIndex: { width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  optionIndexText: { color: '#fff', fontSize: 14, fontWeight: '900' },
  optionText: { flex: 1, fontSize: 15, fontWeight: '600' },
  solutionBox: { marginTop: 16, padding: 16, borderRadius: 16, borderWidth: 1 },
  solutionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  solutionTitle: { fontSize: 14, fontWeight: '800', textTransform: 'uppercase' },
  solutionText: { fontSize: 14, lineHeight: 22 },
  socialCard: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 20, borderWidth: 1, marginVertical: 12, gap: 12 },
  socialIcon: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  socialText: { flex: 1 },
  socialLabel: { fontSize: 10, fontWeight: '900', letterSpacing: 1, marginBottom: 4, textTransform: 'uppercase' },
  socialTitle: { fontSize: 16, fontWeight: '800', lineHeight: 20 },
  socialBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  socialBadgeText: { color: '#fff', fontSize: 10, fontWeight: '900', textTransform: 'uppercase' },
  readMore: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, marginVertical: 16, gap: 12, borderTopWidth: 1, borderBottomWidth: 1, borderRadius: 0 },
  readMoreBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  readMoreBadgeText: { color: '#fff', fontSize: 9, fontWeight: '900', textTransform: 'uppercase' },
  readMoreText: { flex: 1, fontSize: 15, fontWeight: '800' },
  bookCard: { borderRadius: 24, borderWidth: 1, padding: 20, marginVertical: 20, alignItems: 'center' },
  bookCardMini: { width: 160, marginRight: 16, marginVertical: 10, padding: 12 },
  bookBadge: { position: 'absolute', top: -10, alignSelf: 'center', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8 },
  bookBadgeText: { color: '#fff', fontSize: 9, fontWeight: '900', textTransform: 'uppercase' },
  bookImage: { width: 140, height: 180, marginVertical: 16 },
  bookImageMini: { width: 100, height: 130, marginVertical: 8 },
  bookInfo: { width: '100%', alignItems: 'center' },
  bookTitle: { fontSize: 17, fontWeight: '800', textAlign: 'center', marginBottom: 16 },
  bookTitleMini: { fontSize: 13, marginBottom: 4 },
  bookBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 },
  bookBtnText: { fontSize: 14, fontWeight: '700' },
  bookGrid: { paddingRight: 20 },
});

