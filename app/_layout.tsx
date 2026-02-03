import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    // Initialize database on app start (platform-specific import)
    // Wrap in try-catch to prevent silent failures
    import('@/src/services/database')
      .then(({ initDatabase }) => {
        return initDatabase();
      })
      .catch((error) => {
        console.error('Database initialization error:', error);
        // Don't block app startup if database fails
      });
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="add-item" options={{ presentation: 'modal', title: 'Add Item' }} />
        <Stack.Screen name="item-detail" options={{ title: 'Item Details' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
