import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Search, User, Bell } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useUser } from '@/context/UserContext';
import { useQuery } from '@tanstack/react-query';
import { fetchExams } from '@/services/examService';
import { cleanLabel } from '@/utils/format';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export function Navbar() {
  const router = useRouter();
  const { user } = useUser();
  const insets = useSafeAreaInsets();

  const background = useThemeColor({}, 'background');
  const textPrimary = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const tint = useThemeColor({}, 'tint');
  const border = useThemeColor({}, 'border');
  const cardBg = useThemeColor({}, 'card');

  // Fetch trending exams for the marquee
  const { data: trending = [] } = useQuery({
    queryKey: ['trending-marquee'],
    queryFn: async () => {
      const { exams } = await fetchExams({ limit: 10, isPublished: true });
      return exams;
    },
  });

  // Animation for the marquee
  const translateX = useRef(new Animated.Value(0)).current;
  const marqueeContentWidth = useRef(0);

  useEffect(() => {
    if (trending.length > 0) {
      const startAnimation = () => {
        translateX.setValue(SCREEN_WIDTH);
        Animated.loop(
          Animated.timing(translateX, {
            toValue: -1000, // Approximate width of content
            duration: 20000,
            easing: Easing.linear,
            useNativeDriver: true,
          })
        ).start();
      };
      startAnimation();
    }
  }, [trending]);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <View style={[styles.container, { backgroundColor: background, borderBottomColor: border, paddingTop: insets.top }]}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <View>
          <Text style={[styles.smallGreeting, { color: textMuted }]}>{greeting()}</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)')} activeOpacity={0.7}>
            <Text style={[styles.logo, { color: textPrimary }]}>Suchana</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.iconBtn, { backgroundColor: cardBg, borderColor: border }]}
            onPress={() => router.push('/search')}
          >
            <Search size={20} color={textPrimary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.profileBtn, { borderColor: border }]}
            onPress={() => router.push('/profile')}
          >
            {user?.name ? (
              <View style={[styles.avatar, { backgroundColor: tint }]}>
                <Text style={styles.avatarText}>{user.name.charAt(0).toUpperCase()}</Text>
              </View>
            ) : (
              <View style={[styles.avatar, { backgroundColor: border }]}>
                <User size={20} color={textMuted} />
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Marquee Banner (Only if trending content exists) */}
      {trending.length > 0 && (
        <View style={[styles.marqueeContainer, { borderTopColor: border }]}>
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>Trending</Text>
          </View>
          <Animated.View style={[styles.marqueeInner, { transform: [{ translateX }] }]}>
            {trending.map((exam, i) => (
              <TouchableOpacity
                key={exam.id}
                onPress={() => router.push(`/exam/${exam.slug}`)}
                style={styles.marqueeItem}
              >
                <Text style={[styles.marqueeStatus, { color: tint }]}>{cleanLabel(exam.status)}</Text>
                <Text style={[styles.marqueeTitle, { color: textPrimary }]}>{exam.shortTitle || exam.title}</Text>
                <Text style={[styles.marqueeSep, { color: border }]}>•</Text>
              </TouchableOpacity>
            ))}
          </Animated.View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    zIndex: 100,
  },
  topBar: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  smallGreeting: {
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: -2,
  },
  logo: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  profileBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    padding: 2,
  },
  avatar: {
    flex: 1,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
  },
  // Marquee styles
  marqueeContainer: {
    height: 36,
    borderTopWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  liveBadge: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 16,
    zIndex: 2,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFF',
  },
  liveText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '900',
  },
  marqueeInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  marqueeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 6,
  },
  marqueeStatus: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  marqueeTitle: {
    fontSize: 12,
    fontWeight: '600',
  },
  marqueeSep: {
    fontSize: 14,
    marginLeft: 8,
  },
});
