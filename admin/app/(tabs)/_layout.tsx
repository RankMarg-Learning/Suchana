import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { HapticTab } from '@/components/haptic-tab';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const TAB_BAR_HEIGHT = 64;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#4a10e8ff',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarStyle: {
          position: 'relative',
          bottom: insets.bottom,
          height: TAB_BAR_HEIGHT,
          paddingBottom: 0,
          paddingTop: 0,
          backgroundColor: '#ffffffff',
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
          marginBottom: 8,
          letterSpacing: 0.1,
        },
        tabBarIconStyle: {
          marginBottom: 0,
        },
        tabBarItemStyle: {
          height: TAB_BAR_HEIGHT,
        },
        tabBarHideOnKeyboard: true,
        tabBarShowLabel: true,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Exams',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons size={22} name={focused ? 'list' : 'list-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="scraper"
        options={{
          title: 'Scraper',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons size={22} name={focused ? 'cloud-download' : 'cloud-download-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="review"
        options={{
          title: 'Review',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons size={24} name={focused ? 'shield-checkmark' : 'shield-checkmark-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Analytics',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons size={22} name={focused ? 'stats-chart' : 'stats-chart-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="content"
        options={{
          title: 'Content',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons size={22} name={focused ? 'layers' : 'layers-outline'} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
