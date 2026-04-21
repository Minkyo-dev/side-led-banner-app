import { APP_FONT_ASSETS } from "@/constants/appFonts";
import { SettingsProvider } from "@/contexts/settingsContext";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColorScheme } from "@/hooks/use-color-scheme";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const [fontsLoaded] = useFonts(APP_FONT_ASSETS);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <SettingsProvider>
        {fontsLoaded ? (
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
          </Stack>
        ) : null}
        <StatusBar style="auto" />
      </SettingsProvider>
    </ThemeProvider>
  );
}
