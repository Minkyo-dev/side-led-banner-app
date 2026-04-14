import {
  MultipleLinePlayButton,
  OneLinePlayButton,
} from "@/assets/svg/playOptionButton";
import { PlayResumeButton } from "@/assets/svg/playResumeButton";
import { LedBannerFullScreen } from "@/components/ledBannerFullScreen";
import PreviewPanel from "@/components/previewPanel";
import { BackgroundSection } from "@/components/settings/backgroundSection";
import { EffectSection } from "@/components/settings/effectSection";
import { TextSection } from "@/components/settings/textSection";
import { btnStyles } from "@/constants/btnStyles";
import { styles } from "@/constants/styles";
import { TabType, useSettings } from "@/contexts/settingsContext";
import * as NavigationBar from "expo-navigation-bar";
import * as ScreenOrientation from "expo-screen-orientation";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Index() {
  const insets = useSafeAreaInsets();

  const { config, ui, updateConfig, updateUI } = useSettings();
  const { playOption } = config.content;
  const { isPlaying, activeTab } = ui;

  // 메인 화면은 portrait 고정, 전체화면 모달은 landscape 허용
  const handlePlay = async () => {
    await NavigationBar.setVisibilityAsync("hidden");
    await ScreenOrientation.unlockAsync();
    updateUI({ isPlaying: true });
  };

  const handleStop = async () => {
    await NavigationBar.setVisibilityAsync("visible");
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
          style={{ flex: 0.15 }}
          onPress={() => updateConfig("content", { playOption: "one" })}
        >
          <OneLinePlayButton isActive={playOption === "one"} />
        </TouchableOpacity>
        {/* multiple line play button */}
        <TouchableOpacity
          style={{ flex: 0.15 }}
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
      </View>
      {/* tab container */}
      <View id="tabContainer" style={styles.tabContainer}>
        {["TEXT", "BACKGROUND", "EFFECT"].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() =>
              handleTabPress(tab as "TEXT" | "BACKGROUND" | "EFFECT")
            }
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.activeTabText,
              ]}
              allowFontScaling={false}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ flex: 1 }}>
        {activeTab === "TEXT" && <TextSection />}
        {activeTab === "BACKGROUND" && <BackgroundSection />}
        {activeTab === "EFFECT" && <EffectSection />}
      </View>

      {/* fullscreen LED banner modal */}
      <LedBannerFullScreen
        visible={isPlaying}
        onClose={handleStop}
        config={config}
      />
    </View>
  );
}
