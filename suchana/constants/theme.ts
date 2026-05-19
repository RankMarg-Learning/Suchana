import { DefaultTheme as NavDefaultTheme, DarkTheme as NavDarkTheme } from '@react-navigation/native';
import { Platform } from 'react-native';

const tintColorLight = '#7C3AED';
const tintColorDark = '#A78BFA';

export const Colors = {
  light: {
    text: '#0F172A', // Slate 900 (matches web)
    textMuted: '#64748B', // Slate 500 (matches web)
    background: '#FFFFFF',
    card: '#F8FAFC', // Slate 50 (softer than Zinc)
    border: '#F1F5F9', // Slate 100
    tint: tintColorLight,
    icon: '#64748B',
    tabIconDefault: '#64748B',
    tabIconSelected: tintColorLight,
    accent: '#F5F3FF',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
  },
  dark: {
    text: '#F8FAFC', // Slate 50
    textMuted: '#94A3B8', // Slate 400
    background: '#020617', // Slate 950
    card: '#0F172A', // Slate 900
    border: '#1E293B', // Slate 800
    tint: tintColorDark,
    icon: '#94A3B8',
    tabIconDefault: '#94A3B8',
    tabIconSelected: tintColorDark,
    accent: '#2E1065',
    success: '#059669',
    warning: '#D97706',
    error: '#DC2626',
  },
};

export const CustomLightTheme = {
  ...NavDefaultTheme,
  colors: {
    ...NavDefaultTheme.colors,
    primary: Colors.light.tint,
    background: Colors.light.background,
    card: Colors.light.card,
    text: Colors.light.text,
    border: Colors.light.border,
    notification: Colors.light.error,
  },
};

export const CustomDarkTheme = {
  ...NavDarkTheme,
  colors: {
    ...NavDarkTheme.colors,
    primary: Colors.dark.tint,
    background: Colors.dark.background,
    card: Colors.dark.card,
    text: Colors.dark.text,
    border: Colors.dark.border,
    notification: Colors.dark.error,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
