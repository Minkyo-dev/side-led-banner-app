import {
  MultipleLinePlayButton,
  OneLinePlayButton,
} from "@/assets/svg/playOptionButton";
import { PlayResumeButton } from "@/assets/svg/playResumeButton";
import AdmobBannerAd from "@/components/adMobs";
import { ProModeDebugFab } from "@/components/dev/proModeDebugFab";
import { RewardAdDebugFab } from "@/components/dev/rewardAdDebugFab";
import { SheetFetchDebugPanel } from "@/components/dev/sheetFetchDebugPanel";
import { LedBannerFullScreen } from "@/components/ledBannerFullScreen";
import PreviewPanel from "@/components/previewPanel";
import { ProModeStatusModal } from "@/components/proModeStatusModal";
import { RewardAdModal } from "@/components/rewardAdModal";
import { BackgroundSection } from "@/components/settings/backgroundSection";
import { EffectSection } from "@/components/settings/effectSection";
import { TextSection } from "@/components/settings/textSection";
import { btnStyles } from "@/constants/btnStyles";
import { styles } from "@/constants/styles";
import { TabType, useSettings } from "@/contexts/settingsContext";
import * as NavigationBar from "expo-navigation-bar";
import { Image } from "expo-image";
import { type Href, useRouter } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";
import { useRewardedAdShow } from "@/hooks/useRewardedAdShow";
import React, { useCallback, useEffect, useState } from "react";
import { Platform, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Index() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const {
    config,
    ui,
    updateConfig,
    updateUI,
    textSectionLabel,
    activateProFromReward,
  } = useSettings();
  const { playOption } = config.content;
  const { isPlaying, activeTab } = ui;
  const [rewardAdVisible, setRewardAdVisible] = useState(false);
  const [proStatusVisible, setProStatusVisible] = useState(false);

  useEffect(() => {
    if (Platform.OS !== "android") return;
    void NavigationBar.setVisibilityAsync("hidden");
  }, []);

  const handleRewardEarned = useCallback(() => {
    activateProFromReward();
  }, [activateProFromReward]);

  const { showRewardedAd } = useRewardedAdShow({
    onEarnedReward: handleRewardEarned,
  });

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
            labelKey:
              | "tabText"
              | "tabBackground"
              | "tabEffects";
          }[]
        ).map(({ id, labelKey }) => (
          <TouchableOpacity
            key={id}
            style={[styles.tab, activeTab === id && styles.activeTab]}
            onPress={() => handleTabPress(id)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === id && styles.activeTabText,
              ]}
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
      <AdmobBannerAd />
      <RewardAdModal
        visible={rewardAdVisible}
        onClose={() => setRewardAdVisible(false)}
        onWatchAd={showRewardedAd}
      />
      <ProModeStatusModal
        visible={proStatusVisible}
        onClose={() => setProStatusVisible(false)}
      />
      {/* fullscreen LED banner modal */}
      <LedBannerFullScreen
        visible={isPlaying}
        onClose={handleStop}
        config={config}
      />
      <RewardAdDebugFab onOpen={() => setRewardAdVisible(true)} />
      <ProModeDebugFab onOpen={() => setProStatusVisible(true)} />
      <SheetFetchDebugPanel />
    </View>
  );
}
