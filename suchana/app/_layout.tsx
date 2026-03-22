import { ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import * as SplashScreen from 'expo-splash-screen';
import { UserProvider, useUser } from '@/context/UserContext';
import { useFirstLaunchPermissions } from '@/hooks/useFirstLaunchPermissions';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { CustomLightTheme, CustomDarkTheme, Colors } from '@/constants/theme';
import { AdsProvider } from '@/context/AdsContext';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync().catch(() => {
  /* reloading the app might cause this error. */
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

function NavigationGuard() {
  const { isOnboarded, isLoading } = useUser();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return;

    // Check if splash screen can be hidden
    SplashScreen.hideAsync().catch(() => {});

    // Only redirect AWAY from onboarding if user is already fully set up.
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
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? CustomDarkTheme : CustomLightTheme;
  const currentColors = colorScheme === 'dark' ? Colors.dark : Colors.light;

  return (
    <QueryClientProvider client={queryClient}>
      <AdsProvider>
        <UserProvider>
          <ThemeProvider value={theme}>
            <NavigationGuard />
            <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="onboarding" options={{ headerShown: false }} />
              <Stack.Screen
                name="exam/[id]"
                options={{
                  headerShown: true,
                  headerStyle: { backgroundColor: currentColors.background },
                  headerTintColor: currentColors.text,
                  headerTitle: '',
                  headerBackTitle: 'Back',
                  headerShadowVisible: false,
                }}
              />
            </Stack>
            <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
          </ThemeProvider>
        </UserProvider>
      </AdsProvider>
    </QueryClientProvider>
  );
}
