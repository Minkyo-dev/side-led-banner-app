import { useSettingsRest } from "@/contexts/settingsContext";
import * as NavigationBar from "expo-navigation-bar";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Platform } from "react-native";

/** 전체화면 재생 시 상태바·Android 네비게이션 바 숨김 */
export function FullscreenSystemChrome() {
  const isPlaying = useSettingsRest().ui.isPlaying;

  useEffect(() => {
    if (Platform.OS !== "android") return;
    void NavigationBar.setVisibilityAsync(isPlaying ? "hidden" : "visible");
  }, [isPlaying]);

  return <StatusBar style="auto" hidden={isPlaying} />;
}
