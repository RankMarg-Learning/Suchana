import React from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, 
  ActivityIndicator, RefreshControl, Image, ScrollView, Modal 
} from 'react-native';
import { useRouter } from 'expo-router';
import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchSeoPages } from '@/services/examService';
import { useThemeColor } from '@/hooks/use-theme-color';
import { ArrowRight, BookOpen, Clock, FileText, SlidersHorizontal, X, ChevronRight } from 'lucide-react-native';
import { cleanLabel } from '@/utils/format';
import { NativeAdCard } from '@/components/NativeAdCard';
import { AdBanner } from '@/components/AdBanner';
import { ARTICLE_CATEGORIES } from '@/constants/enums';

export default function ArticlesScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = React.useState<string>('ALL');
  const [isModalVisible, setIsModalVisible] = React.useState(false);

  const background = useThemeColor({}, 'background');
  const textPrimary = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const tint = useThemeColor({}, 'tint');
  const border = useThemeColor({}, 'border');
  const cardBg = useThemeColor({}, 'card');

  const allCategories = [
    { label: 'All Articles', value: 'ALL' },
    ...ARTICLE_CATEGORIES
  ];

  const quickCategories = allCategories.slice(0, 8);

  const {
    data: articlePages,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching
  } = useInfiniteQuery({
    queryKey: ['articles-infinite', selectedCategory],
    queryFn: ({ pageParam = 1 }) => fetchSeoPages({ 
        limit: 15, 
        page: pageParam,
        category: selectedCategory === 'ALL' ? undefined : selectedCategory 
    }),
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.pages.length < 15) return undefined;
      return allPages.length + 1;
    },
    initialPageParam: 1,
  });

  const articles = articlePages?.pages.flatMap(p => p.pages) ?? [];

  const renderArticleItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[styles.articleCard, { backgroundColor: cardBg, borderColor: border }]}
      onPress={() => router.push(`/${item.slug}`)}
      activeOpacity={0.8}
    >
      <View style={styles.articleContent}>
        {item.ogImage && (
          <Image source={{ uri: item.ogImage }} style={styles.articleImage} />
        )}
        <View style={styles.articleText}>
          <View style={styles.categoryRow}>
            <View style={[styles.tag, { backgroundColor: tint + '12' }]}>
              <Text style={[styles.tagText, { color: tint }]}>{cleanLabel(item.category) || 'Article'}</Text>
            </View>
            <View style={styles.metaItem}>
              <Clock size={11} color={textMuted} />
              <Text style={[styles.metaText, { color: textMuted }]}>5 min read</Text>
            </View>
          </View>
          <Text style={[styles.articleTitle, { color: textPrimary }]} numberOfLines={2}>{item.title}</Text>
          <View style={styles.articleFooter}>
            <Text style={[styles.dateText, { color: textMuted }]}>
              {new Date(item.updatedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
            </Text>
            <View style={[styles.arrowCircle, { backgroundColor: tint + '15' }]}>
                <ArrowRight size={14} color={tint} />
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.root, { backgroundColor: background }]}>
      <FlatList
        data={articles}
        keyExtractor={item => item.id}
        renderItem={renderArticleItem}
        contentContainerStyle={styles.listContainer}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) fetchNextPage();
        }}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={tint} />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.headerTextGroup}>
                <Text style={[styles.headerTitle, { color: textPrimary }]}>Knowledge Hub</Text>
                <Text style={[styles.headerSub, { color: textMuted }]}>Expert articles and preparation strategies</Text>
            </View>
            
            <View style={styles.filterRow}>
                <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false} 
                    contentContainerStyle={styles.filterContainer}
                    style={styles.filterScroll}
                >
                    {quickCategories.map((cat) => (
                        <TouchableOpacity
                            key={cat.value}
                            onPress={() => setSelectedCategory(cat.value)}
                            style={[
                                styles.filterChip,
                                { borderColor: border, backgroundColor: cardBg },
                                selectedCategory === cat.value && { backgroundColor: tint, borderColor: tint }
                            ]}
                        >
                            <Text style={[
                                styles.filterChipText,
                                { color: textMuted },
                                selectedCategory === cat.value && { color: '#fff' }
                            ]}>
                                {cat.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
                <TouchableOpacity 
                    style={[styles.moreBtn, { backgroundColor: cardBg, borderColor: border }]}
                    onPress={() => setIsModalVisible(true)}
                >
                    <SlidersHorizontal size={18} color={tint} />
                </TouchableOpacity>
            </View>
          </View>
        }
        ListFooterComponent={
          articles.length > 0 ? (
            <View style={styles.footer}>
              {isFetchingNextPage && <ActivityIndicator color={tint} style={{ marginBottom: 20 }} />}
              <AdBanner placement="ARTICLES_FOOTER" />
            </View>
          ) : null
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.empty}>
              <FileText size={48} color={border} />
              <Text style={[styles.emptyText, { color: textMuted }]}>No articles found yet.</Text>
            </View>
          ) : (
            <View style={styles.loader}>
              <ActivityIndicator size="large" color={tint} />
            </View>
          )
        }
      />

      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: background }]}>
                <View style={styles.modalHeader}>
                    <Text style={[styles.modalTitle, { color: textPrimary }]}>All Categories</Text>
                    <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                        <X size={24} color={textPrimary} />
                    </TouchableOpacity>
                </View>
                <FlatList
                    data={allCategories}
                    keyExtractor={(item) => item.value}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[
                                styles.modalItem,
                                { borderBottomColor: border },
                                selectedCategory === item.value && { backgroundColor: tint + '10' }
                            ]}
                            onPress={() => {
                                setSelectedCategory(item.value);
                                setIsModalVisible(false);
                            }}
                        >
                            <Text style={[
                                styles.modalItemText,
                                { color: textPrimary },
                                selectedCategory === item.value && { color: tint, fontWeight: '800' }
                            ]}>
                                {item.label}
                            </Text>
                            {selectedCategory === item.value && <ChevronRight size={18} color={tint} />}
                        </TouchableOpacity>
                    )}
                    contentContainerStyle={{ paddingBottom: 40 }}
                />
            </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  listContainer: { paddingBottom: 40 },
  header: { paddingTop: 20, paddingBottom: 4 },
  headerTextGroup: { paddingHorizontal: 16, marginBottom: 12 },
  headerTitle: { fontSize: 28, fontWeight: '900', letterSpacing: -0.5 },
  headerSub: { fontSize: 14, fontWeight: '500', marginTop: 2 },
  articleCard: {
    marginHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    padding: 10,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  articleContent: { flexDirection: 'row', gap: 12 },
  articleText: { flex: 1, justifyContent: 'space-between', paddingVertical: 0 },
  categoryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  tag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  tagText: { fontSize: 9, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  dateText: { fontSize: 10, fontWeight: '600' },
  articleTitle: { fontSize: 14, fontWeight: '800', lineHeight: 20, marginBottom: 6 },
  articleFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 10, fontWeight: '700' },
  articleImage: { width: 80, height: 80, borderRadius: 14, backgroundColor: '#f3f4f6' },
  arrowCircle: { width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  footer: { paddingVertical: 16 },
  empty: { padding: 40, alignItems: 'center' },
  emptyText: { marginTop: 10, fontSize: 14, fontWeight: '600' },
  loader: { padding: 30, alignItems: 'center' },
  filterRow: { flexDirection: 'row', alignItems: 'center', paddingRight: 16 },
  filterScroll: { flex: 1 },
  filterContainer: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1.2,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '800',
  },
  moreBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1.2,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    height: '70%',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  modalItemText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
