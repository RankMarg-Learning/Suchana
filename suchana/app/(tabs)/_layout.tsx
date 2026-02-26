import { Tabs } from 'expo-router';
import React from 'react';
import { IconSymbol } from '@/components/ui/icon-symbol';

const TAB_BAR_STYLE = {
  backgroundColor: '#0D0D0F',
  borderTopColor: '#1C1C1E',
  borderTopWidth: 1,
  height: 64,
  paddingBottom: 10,
};

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#7C3AED',
        tabBarInactiveTintColor: '#4B5563',
        headerShown: false,
        tabBarStyle: TAB_BAR_STYLE,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <IconSymbol size={size} name="house.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, size }) => (
            <IconSymbol size={size} name="magnifyingglass" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <IconSymbol size={size} name="person.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
