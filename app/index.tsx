import {
  MultipleLinePlayButton,
  OneLinePlayButton,
} from "@/assets/svg/playOptionButton";
import { PlayResumeButton } from "@/assets/svg/playResumeButton";
import { BackgroundSection } from "@/components/settings/backgroundSection";
import { EffectSection } from "@/components/settings/effectSection";
import { TextSection } from "@/components/settings/textSection";
import { btnStyles } from "@/constants/btnStyles";
import { styles } from "@/constants/styles";
import { TabType, useSettings } from "@/contexts/settingsContext";
import * as ScreenOrientation from "expo-screen-orientation";
import React, { useEffect, useMemo, useState } from "react";
import { Dimensions, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { LedBannerFullScreen } from "@/components/ledBannerFullScreen";
import PreviewPanel from "@/components/previewPanel";
import { useMarqueeAnimation } from "@/hooks/useMarqueeAnimation";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function Index() {
  const insets = useSafeAreaInsets();


  const { 
    config, ui, 
    updateConfig, updateUI, handleTextChange,
    fontItems, effectItems 
  } = useSettings();
  console.log(config);
  // config에서 index에 필요한 값들 추출
  const { previewText, playOption } = config.content;
  const { fontSize, textSelectedColor, outLine, dropShadow } = config.appearance;
  const { backgroundColor } = config.background;
  const { textMoveSpeed } = config.motion;
  const { isPlaying, activeTab, activePreset } = ui;

  // 메인 화면은 portrait 고정, 전체화면 모달은 landscape 허용
  useEffect(() => {
    if (isPlaying) {
      ScreenOrientation.unlockAsync();
    } else {
      ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.PORTRAIT_UP,
      );
    }
  }, [isPlaying]);

  // tab click scroll function
  const handleTabPress = (tab: TabType) => updateUI({ activeTab: tab });
  const onClickPreset = (index: number) => updateUI({ activePreset: index });
  const [previewHeight, setPreviewHeight] = useState(0);


 


  // marquee animation hook
  const {
    displayText,
    animatedStyle,
    onContainerLayout,
    onTextLayout,
    SPACER,
  } = useMarqueeAnimation({
    text: previewText,
    speed: textMoveSpeed,
    playOption,
  });

  const previewFontSize = useMemo(() => {
    if (previewHeight === 0) return 100;
    const lineCount =
      playOption === "one"
        ? 1
        : Math.min((previewText.match(/\n/g) || []).length + 1, 3);
    const lineHeightRatio = 1.2;
    const maxFontSize = Math.floor(
      previewHeight / (lineCount * lineHeightRatio),
    );
    return Math.floor(maxFontSize * (fontSize / 100));
  }, [previewHeight, playOption, previewText, fontSize]);

  const previewTextStyles = useMemo(() => {
    const outlineRadius = (outLine / 100) * 3;
    const shadowScale = dropShadow / 100;
    return {
      fontSize: previewFontSize,
      flexShrink: 0,
      color: textSelectedColor,
      textShadowColor: (outLine > 0 || dropShadow > 0) ? "rgba(0,0,0,0.7)" : undefined,
      textShadowOffset: (outLine > 0 || dropShadow > 0) ? { width: shadowScale * 4, height: shadowScale * 4 } : undefined,
      textShadowRadius: (outLine > 0 || dropShadow > 0) ? outlineRadius + shadowScale * 8 : undefined,
    };
  }, [previewFontSize, textSelectedColor, outLine, dropShadow]);

  const onPreviewLayout = (e: {
    nativeEvent: { layout: { height: number; width: number } };
  }) => {
    setPreviewHeight(e.nativeEvent.layout.height);
    onContainerLayout(e);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* preview container */}
      <PreviewPanel
        theme={{
          backgroundColor,
          previewTextStyles,
        }}
        marquee={{
          displayText,
          animatedStyle,
          onTextLayout,
          SPACER,
        }}
        input={{
          previewText,
          setPreviewText : (text) => updateConfig("content", { previewText: text }),
          handleTextChange,
        }}
        onPreviewLayout={onPreviewLayout}
      />
      {/* play bar container */}
      <View style={styles.playBarContainer}>
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
          onPress={() => updateUI({ isPlaying: true })}
        >
          <PlayResumeButton isPlaying={isPlaying} />
        </TouchableOpacity>
      </View>
      {/* tab container */}
      <View style={styles.tabContainer}>
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
        onClose={() => updateUI({ isPlaying: false })}
        config={config}
      />
    </View>
  );
}
