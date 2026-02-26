import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { UserProvider, useUser } from '@/context/UserContext';
import { useFirstLaunchPermissions } from '@/hooks/useFirstLaunchPermissions';

function NavigationGuard() {
  const { isOnboarded, isLoading } = useUser();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return;
    // Only redirect AWAY from onboarding if user is already fully set up.
    // Never force users INTO onboarding — it's optional for personalization.
    const inOnboarding = segments[0] === 'onboarding';
    if (isOnboarded && inOnboarding) {
      router.replace('/(tabs)');
    }
  }, [isOnboarded, isLoading]);

  return null;
}

export const unstable_settings = { anchor: '(tabs)' };

export default function RootLayout() {
  // Ask for notification + location permissions once on first-ever launch
  useFirstLaunchPermissions();

  return (
    <UserProvider>
      <ThemeProvider value={DarkTheme}>
        <NavigationGuard />
        <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
          <Stack.Screen
            name="exam/[id]"
            options={{
              headerShown: true,
              headerStyle: { backgroundColor: '#0D0D0F' },
              headerTintColor: '#F4F4F5',
              headerTitle: '',
              headerBackTitle: 'Back',
            }}
          />
        </Stack>
        <StatusBar style="light" />
      </ThemeProvider>
    </UserProvider>
  );
}
