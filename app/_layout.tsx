import { SplashLoadingScreen } from "@/components/SplashLoadingScreen";
import { APP_FONT_ASSETS, APP_THEME_FONT_ASSETS } from "@/constants/appFonts";
import { SettingsProvider } from "@/contexts/settingsContext";
import * as amplitude from "@amplitude/analytics-react-native";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import * as NavigationBar from "expo-navigation-bar";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { AppState, Platform } from "react-native";
import { KeyboardProvider } from "react-native-keyboard-controller";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [fontsLoaded] = useFonts({
    ...APP_FONT_ASSETS,
    ...APP_THEME_FONT_ASSETS,
  });
  useEffect(() => {
    if (Platform.OS !== "android") return;
    void NavigationBar.setVisibilityAsync("hidden");
  }, []);

  //최소 0.75초 스플래쉬 강제
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setMinTimeElapsed(true), 750);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const key = process.env.EXPO_PUBLIC_AMPLITUDE_API_KEY ?? "";
    if (!key) return;
    amplitude.init(key);

    // New Architecture에서 NativeModules.AmplitudeReactNative가 null이면
    // context 플러그인이 platform을 "Web"으로 설정해서 수정.
    if (Platform.OS === "ios") {
      amplitude.add({
        name: "platform-fix",
        type: "enrichment" as const,
        setup: async () => undefined,
        execute: async (event) => {
          event.platform = "iOS";
          event.os_name = "ios";
          return event;
        },
      });
    }

    if (Platform.OS !== "ios") return;
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "background") amplitude.flush();
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  const isReady = fontsLoaded && minTimeElapsed;

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <SettingsProvider>
        <KeyboardProvider>
        {isReady ? (
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="settings" options={{ headerShown: false }} />
            <Stack.Screen
              name="openSourceInfo"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="sunnyList"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="credits"
              options={{ headerShown: false }}
            />
          </Stack>
        ) : (
          <SplashLoadingScreen />
        )}
        </KeyboardProvider>
        <StatusBar hidden />
      </SettingsProvider>
    </ThemeProvider>
  );
}
