import { SettingsProvider } from "@/contexts/settingsContext";
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColorScheme } from '@/hooks/use-color-scheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  return (
    
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <SettingsProvider>
      <Stack
      screenOptions={{
            contentStyle: { paddingBottom: insets.bottom } 
          }}>
        <Stack.Screen name="index" options={{ headerShown: false,  }} />
   
      </Stack>
      <StatusBar style="auto" />
      </SettingsProvider>
    </ThemeProvider>
  );
}
