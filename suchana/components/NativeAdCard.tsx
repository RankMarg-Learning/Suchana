import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface Props {
    title?: string;
    description?: string;
    image?: string;
    cta?: string;
    onPress?: () => void;
    style?: object;
}


export function NativeAdCard({
    title = "Unlock Your Dream Career",
    description = "Join 10L+ aspirants on Suchana Pro for detailed mock tests and eligibility tracking.",
    cta = "Get Started",
    onPress,
    style
}: Props) {

    const handlePress = () => {
        if (onPress) onPress();
    }

    return (
        <TouchableOpacity
            activeOpacity={0.9}
            onPress={handlePress}
            style={[styles.container, style]}>

            <LinearGradient
                colors={['#1e1b4b', '#1e1b4b', '#000']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}>

                <View style={styles.topRow}>
                    <View style={styles.proBadge}>
                        <Text style={styles.proBadgeText}>PROMOTED</Text>
                    </View>
                    <Text style={styles.adTag}>Ad</Text>
                </View>

                <View style={styles.contentRow}>
                    <View style={styles.textContainer}>
                        <Text style={styles.title}>{title}</Text>
                        <Text style={styles.description} numberOfLines={2}>
                            {description}
                        </Text>
                    </View>

                    <TouchableOpacity style={styles.ctaBtn} onPress={handlePress}>
                        <Text style={styles.ctaText}>{cta}</Text>
                    </TouchableOpacity>
                </View>

            </LinearGradient>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        marginVertical: 12,
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#312e81',
    },
    gradient: {
        padding: 16,
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    proBadge: {
        backgroundColor: '#4338ca',
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 3,
    },
    proBadgeText: {
        color: '#fff',
        fontSize: 9,
        fontWeight: '800',
        letterSpacing: 1,
    },
    adTag: {
        color: '#6366f1',
        fontSize: 10,
        fontWeight: '700',
    },
    contentRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    textContainer: {
        flex: 1,
    },
    title: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '800',
        marginBottom: 4,
    },
    description: {
        color: '#94a3b8',
        fontSize: 12,
        lineHeight: 18,
    },
    ctaBtn: {
        backgroundColor: '#fff',
        borderRadius: 10,
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    ctaText: {
        color: '#1e1b4b',
        fontSize: 13,
        fontWeight: '800',
    },
});
