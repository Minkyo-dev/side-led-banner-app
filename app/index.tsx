import {
  MultipleLinePlayButton,
  OneLinePlayButton,
} from "@/assets/svg/playOptionButton";
import { PlayResumeButton } from "@/assets/svg/playResumeButton";
import BannerAdComponent from "@/components/admob/bannerAd";
import { RewardAdDebugFab } from "@/components/dev/rewardAdDebugFab";
import { ProDebugFab } from "@/components/dev/proDebugFab";
import { SheetFetchDebugPanel } from "@/components/dev/sheetFetchDebugPanel";
import { LedBannerFullScreen } from "@/components/ledBannerFullScreen";
import PreviewPanel from "@/components/previewPanel";
import { ProActiveBadge } from "@/components/ProActiveBadge";
import { RewardAdModal } from "@/components/rewardAdModal";
import { BackgroundSection } from "@/components/settings/backgroundSection";
import { EffectSection } from "@/components/settings/effectSection";
import { TextSection } from "@/components/settings/textSection";
import { btnStyles } from "@/constants/btnStyles";
import { styles } from "@/constants/styles";
import { TabType, useSettings } from "@/contexts/settingsContext";
import { useRewardedAd } from "@/hooks/useRewardedAd";
import { Image } from "expo-image";
import * as NavigationBar from "expo-navigation-bar";
import { type Href, useRouter } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";
import React, { useEffect, useRef, useState } from "react";
import { Keyboard, Platform, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
export default function Index() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { config, ui, updateConfig, updateUI, textSectionLabel, activatePro, openRewardAdModal } =
    useSettings();
  const { playOption } = config.content;
  const { isPlaying, activeTab, rewardAdVisible } = ui;
  const { loaded: rewardAdLoaded, show: showRewardedAd } = useRewardedAd(activatePro);

  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const { height: windowHeight } = useWindowDimensions();
  const baseWindowHeightRef = useRef(windowHeight);
  if (keyboardHeight === 0 && windowHeight > 0) {
    baseWindowHeightRef.current = Math.max(baseWindowHeightRef.current, windowHeight);
  }

  useEffect(() => {
    if (Platform.OS !== "android") return;
    void NavigationBar.setVisibilityAsync("hidden");
  }, []);

  useEffect(() => {
    if (Platform.OS !== "android") return;
    const show = Keyboard.addListener("keyboardDidShow", (e) =>
      setKeyboardHeight(e.endCoordinates.height),
    );
    const hide = Keyboard.addListener("keyboardDidHide", () =>
      setKeyboardHeight(0),
    );
    return () => { show.remove(); hide.remove(); };
  }, []);

  const handlePlay = async () => {
    await ScreenOrientation.unlockAsync();
    updateUI({ isPlaying: true });
  };

  const handleStop = async () => {
    await ScreenOrientation.lockAsync(
      ScreenOrientation.OrientationLock.PORTRAIT_UP,
    );
    updateUI({ isPlaying: false });
  };

  const handleTabPress = (tab: TabType) => updateUI({ activeTab: tab });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <PreviewPanel />

      <View id="playBarContainer" style={styles.playBarContainer}>
        {/* one line play button */}
        <TouchableOpacity
          style={btnStyles.playBarSideSlot}
          onPress={() => updateConfig("content", { playOption: "one" })}
        >
          <OneLinePlayButton isActive={playOption === "one"} />
        </TouchableOpacity>
        {/* multiple line play button */}
        <TouchableOpacity
          style={btnStyles.playBarSideSlot}
          onPress={() => updateConfig("content", { playOption: "multi" })}
        >
          <MultipleLinePlayButton isActive={playOption === "multi"} />
        </TouchableOpacity>
        {/* stop/resume button */}
        <TouchableOpacity
          style={btnStyles.playResumeButton}
          onPress={handlePlay}
        >
          <PlayResumeButton isPlaying={isPlaying} />
        </TouchableOpacity>
        {/* settings button */}
        <TouchableOpacity
          style={btnStyles.playBarSideSlot}
          onPress={() => router.push("/settings" as Href)}
          accessibilityLabel={textSectionLabel("settingsTitle")}
        >
          <Image
            source={require("@/assets/images/settings.png")}
            style={btnStyles.playBarSettingsImage}
            contentFit="contain"
          />
        </TouchableOpacity>
      </View>
      {/* tab container */}
      <View id="tabContainer" style={styles.tabContainer}>
        {(
          [
            { id: "TEXT" as const, labelKey: "tabText" as const },
            { id: "BACKGROUND" as const, labelKey: "tabBackground" as const },
            { id: "EFFECT" as const, labelKey: "tabEffects" as const },
          ] satisfies readonly {
            id: TabType;
            labelKey: "tabText" | "tabBackground" | "tabEffects";
          }[]
        ).map(({ id, labelKey }) => (
          <TouchableOpacity
            key={id}
            style={[styles.tab, activeTab === id && styles.activeTab]}
            onPress={() => handleTabPress(id)}
          >
            <Text
              style={[styles.tabText, activeTab === id && styles.activeTabText]}
              allowFontScaling={false}
            >
              {textSectionLabel(labelKey)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ flex: 1 }}>
        {activeTab === "TEXT" && <TextSection />}
        {activeTab === "BACKGROUND" && <BackgroundSection />}
        {activeTab === "EFFECT" && <EffectSection />}
      </View>
      <View>{/* Banner Ad placeholder */}</View>
      <BannerAdComponent style={{ height: 50 }} />
      <RewardAdModal
        visible={rewardAdVisible}
        onClose={() => updateUI({ rewardAdVisible: false })}
        adReady={rewardAdLoaded}
        onWatchAd={showRewardedAd}
      />
      {/* fullscreen LED banner modal */}
      <LedBannerFullScreen
        visible={isPlaying}
        onClose={handleStop}
      />
      {Platform.OS === "android" && keyboardHeight > 0 && (
        <TouchableOpacity
          onPress={() => Keyboard.dismiss()}
          style={[
            kbCloseStyles.button,
            { bottom: windowHeight < baseWindowHeightRef.current - 100 ? 8 : keyboardHeight + 8 },
          ]}
          hitSlop={8}
        >
          <Text allowFontScaling={false} style={kbCloseStyles.text}>
            close
          </Text>
        </TouchableOpacity>
      )}
      <ProActiveBadge />
      <RewardAdDebugFab onOpen={openRewardAdModal} />
      <ProDebugFab />
      <SheetFetchDebugPanel />
    </View>
  );
}


const kbCloseStyles = StyleSheet.create({
  button: {
    position: "absolute",
    right: 12,
    backgroundColor: "#E7E7E7",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#333",
    paddingHorizontal: 14,
    paddingVertical: 6,
    zIndex: 100,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  text: {
    fontSize: 14,
    color: "#333",
    fontWeight: "600",
  },
});
