import { Tabs } from 'expo-router';
import React from 'react';

import { Ionicons } from '@expo/vector-icons';
import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Exams',
          tabBarIcon: ({ color }) => <Ionicons size={24} name="list" color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <Ionicons size={24} name="stats-chart" color={color} />,
        }}
      />
    </Tabs>
  );
}
