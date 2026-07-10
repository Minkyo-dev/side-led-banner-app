import { SplashLoadingScreen } from "@/components/SplashLoadingScreen";
import {
  APP_THEME_FONT_ASSETS,
  buildEagerFontAssets,
  buildLazyFontAssets,
  getSkiaFontAssets,
} from "@/constants/appFonts";
import { SettingsProvider } from "@/contexts/settingsContext";
import { preloadSkiaTypefaces } from "@/hooks/useCachedSkiaFont";
import { loadRewardedAd } from "@/hooks/useRewardedAd";
import { deviceLocaleToAppLocale } from "@/language/deviceLocale";
import * as amplitude from "@amplitude/analytics-react-native";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import * as Font from "expo-font";
import { useFonts } from "expo-font";
import { useLocales } from "expo-localization";
import * as NavigationBar from "expo-navigation-bar";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { requestTrackingPermissionsAsync } from "expo-tracking-transparency";
import React, { useEffect, useMemo, useState } from "react";
import { AppState, Platform } from "react-native";
import mobileAds from "react-native-google-mobile-ads";
import { KeyboardProvider } from "react-native-keyboard-controller";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { useColorScheme } from "@/hooks/use-color-scheme";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  // 기기 언어의 폰트 5개만 부팅 시 즉시 로드
  const locales = useLocales();
  const deviceAppLocale = useMemo(
    () => deviceLocaleToAppLocale(locales[0] ?? { languageCode: "en" }),
    [locales],
  );
  const eagerFontAssets = useMemo(
    () => ({ ...buildEagerFontAssets(deviceAppLocale), ...APP_THEME_FONT_ASSETS }),
    [deviceAppLocale],
  );
  const [fontsLoaded] = useFonts(eagerFontAssets);

  // 나머지 로케일 폰트는 백그라운드로 지연 로드
  useEffect(() => {
    if (!fontsLoaded) return;
    const lazyAssets = buildLazyFontAssets(deviceAppLocale);
    Font.loadAsync(lazyAssets).catch((err) => {
      if (__DEV__) console.warn("[fonts] lazy font load failed", err);
    });
  }, [fontsLoaded, deviceAppLocale]);

  useEffect(() => {
    preloadSkiaTypefaces(getSkiaFontAssets(deviceAppLocale));
  }, [deviceAppLocale]);

  useEffect(() => {
    if (Platform.OS !== "android") return;
    void NavigationBar.setPositionAsync("absolute");
    void NavigationBar.setBehaviorAsync("overlay-swipe");
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

    amplitude.init(key, undefined, {
      logLevel: amplitude.Types.LogLevel.Debug,
      flushIntervalMillis: 1000,
      flushQueueSize: 1,
    });

    const sub = AppState.addEventListener("change", (state) => {
      if (state === "background" || state === "inactive") amplitude.flush();
    });

    return () => sub.remove();
  }, []);

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  const isReady = fontsLoaded && minTimeElapsed;

  useEffect(() => {
    if (!isReady) return;
    (async () => {
      if (Platform.OS === "ios") {
        await requestTrackingPermissionsAsync();
      }
      await mobileAds().initialize();
      loadRewardedAd();
    })();
  }, [isReady]);

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <SafeAreaProvider>
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
      </SafeAreaProvider>
    </ThemeProvider>
  );
}
