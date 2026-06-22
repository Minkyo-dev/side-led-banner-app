import {
  MultipleLinePlayButton,
  OneLinePlayButton,
} from "@/assets/svg/playOptionButton";
import { PlayResumeButton } from "@/assets/svg/playResumeButton";
import BannerAdComponent from "@/components/admob/bannerAd";
import { ProDebugFab } from "@/components/dev/proDebugFab";
import { RewardAdDebugFab } from "@/components/dev/rewardAdDebugFab";
import { SheetFetchDebugPanel } from "@/components/dev/sheetFetchDebugPanel";
import { LedBannerFullScreen } from "@/components/ledBannerFullScreen";
import PreviewPanel from "@/components/previewPanel";
import { RewardAdModal } from "@/components/rewardAdModal";
import { BackgroundSection } from "@/components/settings/backgroundSection";
import { EffectSection } from "@/components/settings/effectSection";
import { TextSection } from "@/components/settings/textSection";
import { btnStyles } from "@/constants/btnStyles";
import { styles, toolbarStyles } from "@/constants/styles";
import { TabType, useSettings } from "@/contexts/settingsContext";
import { useRewardedAd } from "@/hooks/useRewardedAd";
import * as amplitude from "@amplitude/analytics-react-native";
import { Image } from "expo-image";
import * as NavigationBar from "expo-navigation-bar";
import { type Href, useRouter } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";
import React, { useCallback, useEffect, useRef } from "react";
import { Platform, Text, TouchableOpacity, View, useColorScheme } from "react-native";
import { KeyboardAvoidingView, KeyboardToolbar } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";


function DismissButton(props: any) {
  const isDark = useColorScheme() === "dark";
  const color = isDark ? "#ffffff" : "#2c2c2c";
  return (
    <TouchableOpacity onPress={props.onPress} style={props.style}>
      <Text allowFontScaling={false} style={[styles.accessoryClose, { color }]}>✔</Text>
    </TouchableOpacity>
  );
}

export default function Index() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { config, ui, updateConfig, updateUI, textSectionLabel, activatePro, openRewardAdModal } =
    useSettings();
  const { playOption } = config.content;
  const { isPlaying, activeTab, rewardAdVisible } = ui;
  const { loaded: rewardAdLoaded, show: showRewardedAd } = useRewardedAd(activatePro);

  useEffect(() => {
    if (Platform.OS !== "android") return;
    void NavigationBar.setVisibilityAsync("hidden");
  }, []);

  const handlePlay = async () => {
    amplitude.track("Play_clicked", {
      play_mode: playOption,
      font: config.appearance.font,
      fontSize: config.appearance.fontSize,
      textMoveSpeed: config.motion.textMoveSpeed,
      letterSpacing: config.appearance.letterSpacing,
      lineSpacing: config.appearance.lineSpacing,
      textColor: config.appearance.textSelectedColor,
      outLine: config.appearance.outLine,
      dropShadow: config.appearance.dropShadow,
      backgroundColor: config.background.backgroundColor,
      backgroundBlur: config.background.backgroundBlur,
      has_photo: config.background.backgroundImageUri != null,
      effects: config.appearance.effectSelectedItems.join(","),
      backgroundEffect: config.appearance.backgroundEffectPreset,
    });
    await ScreenOrientation.unlockAsync();
    updateUI({ isPlaying: true });
  };

  const handleStop = async () => {
    await ScreenOrientation.lockAsync(
      ScreenOrientation.OrientationLock.PORTRAIT_UP,
    );
    updateUI({ isPlaying: false });
  };

  const handleTabPress = (tab: TabType) => {
    if (tab === "TEXT") {
      amplitude.track("Text_clicked", {
        font: config.appearance.font,
        fontSize: config.appearance.fontSize,
        textMoveSpeed: config.motion.textMoveSpeed,
        letterSpacing: config.appearance.letterSpacing,
        lineSpacing: config.appearance.lineSpacing,
        textColor: config.appearance.textSelectedColor,
        outLine: config.appearance.outLine,
        dropShadow: config.appearance.dropShadow,
      });
    } else if (tab === "BACKGROUND") {
      amplitude.track("BG_clicked", {
        backgroundColor: config.background.backgroundColor,
        backgroundBlur: config.background.backgroundBlur,
        has_photo: config.background.backgroundImageUri != null,
      });
    } else if (tab === "EFFECT") {
      amplitude.track("Effects_clicked", {
        effects: config.appearance.effectSelectedItems.join(","),
        backgroundEffect: config.appearance.backgroundEffectPreset,
        gradientPreset: config.appearance.effectSelectedItems.includes("Gradient")
          ? config.appearance.gradientBackgroundPreset
          : null,
      });
    }
    updateUI({ activeTab: tab });
  };

  const isDark = useColorScheme() === "dark";
  const toolbarBtn = isDark ? "#ffffff" : "#2c2c2c";

  const cursorUpRef = useRef<(() => void) | null>(null);
  const cursorDownRef = useRef<(() => void) | null>(null);
  const onCursorMovers = useCallback((up: () => void, down: () => void) => {
    cursorUpRef.current = up;
    cursorDownRef.current = down;
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
        <PreviewPanel onCursorMovers={onCursorMovers} />
        
        <View id="playBarContainer" style={styles.playBarContainer}>
          {/* one line play button */}
          <TouchableOpacity
            style={btnStyles.playBarSideSlot}
            onPress={() => {
              amplitude.track("OneL_clicked");
              updateConfig("content", { playOption: "one" });
            }}
          >
            <OneLinePlayButton isActive={playOption === "one"} />
          </TouchableOpacity>
          {/* multiple line play button */}
          <TouchableOpacity
            style={btnStyles.playBarSideSlot}
            onPress={() => {
              amplitude.track("ThreeL_clicked");
              updateConfig("content", { playOption: "multi" });
            }}
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
            onPress={() => {
              amplitude.track("Setting_clicked");
              router.push("/settings" as Href);
            }}
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
        <BannerAdComponent />
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
        <RewardAdDebugFab onOpen={openRewardAdModal} />
        <ProDebugFab />
        <SheetFetchDebugPanel />
      </KeyboardAvoidingView>
      <KeyboardToolbar>
        <KeyboardToolbar.Content>
          <View style={toolbarStyles.cursorNavContainer}>
            {/* <TouchableOpacity
              onPress={() => cursorUpRef.current?.()}
              style={toolbarStyles.cursorNavButton}
              accessible={false}
              focusable={false}
            >
              <Text style={[toolbarStyles.cursorNavText, { color: toolbarBtn }]}>↑</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => cursorDownRef.current?.()}
              style={toolbarStyles.cursorNavButton}
              accessible={false}
              focusable={false}
            >
              <Text style={[toolbarStyles.cursorNavText, { color: toolbarBtn }]}>↓</Text>
            </TouchableOpacity> */}
          </View>
        </KeyboardToolbar.Content>
        <KeyboardToolbar.Done button={DismissButton} />
      </KeyboardToolbar>
    </View>
  );
}
