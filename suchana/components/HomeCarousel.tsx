import React, { useRef, useState, useEffect } from 'react';
import {
    View,
    FlatList,
    Image,
    Dimensions,
    StyleSheet,
    TouchableOpacity,
    Linking,
    Text,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { HomeBanner } from '@/types/config';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useColorScheme } from '@/hooks/use-color-scheme';

const { width } = Dimensions.get('window');
const CAROUSEL_WIDTH = width - 40;
const CAROUSEL_HEIGHT = CAROUSEL_WIDTH * (1 / 3);

interface Props {
    banners: HomeBanner[];
}

export function HomeCarousel({ banners }: Props) {
    const flatListRef = useRef<FlatList>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const colorScheme = useColorScheme();
    const tint = useThemeColor({}, 'tint');
    const border = useThemeColor({}, 'border');
    const cardBg = useThemeColor({}, 'card');

    useEffect(() => {
        if (banners.length <= 1) return;

        const interval = setInterval(() => {
            const nextIndex = (activeIndex + 1) % banners.length;
            flatListRef.current?.scrollToIndex({
                index: nextIndex,
                animated: true,
            });
            setActiveIndex(nextIndex);
        }, 5000);

        return () => clearInterval(interval);
    }, [activeIndex, banners.length]);

    const handlePress = (actionUrl?: string | null) => {
        if (actionUrl) {
            Linking.openURL(actionUrl);
        }
    };

    const renderItem = ({ item }: { item: HomeBanner }) => (
        <TouchableOpacity
            activeOpacity={0.9}
            style={[styles.slide, { backgroundColor: cardBg, borderColor: border }]}
            onPress={() => handlePress(item.actionUrl)}
        >
            <Image
                source={{ uri: item.imageUrl }}
                style={styles.image}
                resizeMode="cover"
            />
            <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.8)']}
                style={styles.gradient}
            >
                {item.title && <Text style={styles.title} numberOfLines={1}>{item.title}</Text>}
                {item.description && (
                    <Text style={styles.description} numberOfLines={2}>
                        {item.description}
                    </Text>
                )}
            </LinearGradient>
        </TouchableOpacity>
    );

    if (banners.length === 0) return null;

    return (
        <View style={styles.container}>
            <FlatList
                ref={flatListRef}
                data={banners}
                renderItem={renderItem}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id}
                onMomentumScrollEnd={(event) => {
                    const index = Math.round(
                        event.nativeEvent.contentOffset.x / CAROUSEL_WIDTH
                    );
                    setActiveIndex(index);
                }}
                snapToInterval={CAROUSEL_WIDTH + 10}
                decelerationRate="fast"
                contentContainerStyle={styles.listContent}
            />
            {banners.length > 1 && (
                <View style={styles.pagination}>
                    {banners.map((_, index) => (
                        <View
                            key={index}
                            style={[
                                styles.dot,
                                { backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)' },
                                activeIndex === index && [styles.activeDot, { backgroundColor: tint }],
                            ]}
                        />
                    ))}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginVertical: 15,
    },
    listContent: {
        paddingHorizontal: 20,
        gap: 10,
    },
    slide: {
        width: CAROUSEL_WIDTH,
        height: CAROUSEL_HEIGHT,
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    gradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '100%',
        justifyContent: 'flex-end',
        padding: 12,
    },
    title: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '900',
        marginBottom: 2,
    },
    description: {
        color: '#d4d4d8',
        fontSize: 11,
        fontWeight: '600',
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 10,
        gap: 6,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    activeDot: {
        width: 16,
    },
});
