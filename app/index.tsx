import {
  MultipleLinePlayButton,
  OneLinePlayButton,
} from "@/assets/svg/playOptionButton";
import { PlayResumeButton } from "@/assets/svg/playResumeButton";
import { BackgroundSection } from "@/components/settings/backgroundSection";
import { EffectSection } from "@/components/settings/effectSection";
import { TextSection } from "@/components/settings/textSection";
import { btnStyles } from "@/constants/btnStyles";
import { backgroundColorPalette } from "@/constants/colorPalette";
import { styles } from "@/constants/styles";
import { SettingsProvider } from "@/contexts/settingsContext";
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

  // is playing state
  const [isPlaying, setIsPlaying] = useState(false);

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
  const handleTabPress = (tab: "TEXT" | "BACKGROUND" | "EFFECT") => {
    setActiveTab(tab);
  };

  // preset button state
  const [activePreset, setActivePreset] = useState(1);
  const onClickPreset = (index: number) => {
    setActivePreset(index);
  };
  const [previewHeight, setPreviewHeight] = useState(0);
  const [previewText, setPreviewText] = useState(
    "Hello, World! asdlfkjas;dlkfja;sldkfja;sldkjfa;slkdjfas;dlkfjasd;flkj",
  );

  const handleTextChange = (text: string) => {
    const lines = text.split("\n");
    if (lines.length > 3) {
      setPreviewText(lines.slice(0, 3).join("\n"));
    } else {
      setPreviewText(text);
    }
  };
  // play option button state
  const [playOption, setPlayOption] = useState<"one" | "multi">("one");
  // tab state
  const [activeTab, setActiveTab] = useState<"TEXT" | "BACKGROUND" | "EFFECT">(
    "TEXT",
  );
  // font select items
  const fontItems = [
    { label: "Nanum Gothic", value: "nanum_gothic" },
    { label: "Noto Sans KR", value: "noto_sans_kr" },
    { label: "Roboto", value: "roboto" },
    { label: "Montserrat", value: "montserrat" },
    { label: "Open Sans", value: "open_sans" },
  ];
  // font select state
  const [font, setFont] = useState("nanum_gothic");
  // speed slider state
  const [textMoveSpeed, setTextMoveSpeed] = useState(50);
  // font size slider state
  const [fontSize, setFontSize] = useState(50);
  // out line slider state
  const [outLine, setOutLine] = useState(50);
  // drop shadow slider state
  const [dropShadow, setDropShadow] = useState(50);
  // background blur slider state
  const [backgroundBlur, setBackgroundBlur] = useState(50);
  // text color picker state
  const [textSelectedColor, setTextSelectedColor] = useState("#000000");
  // background color picker state
  const [backgroundColor, setBackgroundColor] = useState("#FFFFFF");
  // effect items state
  const [effectSelectedItem, setEffectSelectedItem] = useState("Bold");
  // effect items list
  const effectItems = ["Bold", "Blink", "Pixel", "Glow", "Gradient"];

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
    const result: any = {
      fontSize: previewFontSize,
      flexShrink: 0,
      color: textSelectedColor,
    };

    const outlineRadius = (outLine / 100) * 3;
    const shadowScale = dropShadow / 100;

    if (outLine > 0 || dropShadow > 0) {
      result.textShadowColor = "rgba(0,0,0,0.7)";
      result.textShadowOffset = {
        width: shadowScale * 4,
        height: shadowScale * 4,
      };
      result.textShadowRadius = outlineRadius + shadowScale * 8;
    }

    return result;
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
          setPreviewText,
          handleTextChange,
        }}
        onPreviewLayout={onPreviewLayout}
      />
      {/* play bar container */}
      <View style={styles.playBarContainer}>
        {/* one line play button */}
        <TouchableOpacity
          style={{ flex: 0.15 }}
          onPress={() => setPlayOption("one")}
        >
          <OneLinePlayButton isActive={playOption === "one"} />
        </TouchableOpacity>
        {/* multiple line play button */}
        <TouchableOpacity
          style={{ flex: 0.15 }}
          onPress={() => setPlayOption("multi")}
        >
          <MultipleLinePlayButton isActive={playOption === "multi"} />
        </TouchableOpacity>
        {/* stop/resume button */}
        <TouchableOpacity
          style={btnStyles.playResumeButton}
          onPress={() => setIsPlaying(true)}
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
      <SettingsProvider
        value={{
          fontItems,
          font,
          setFont,
          textMoveSpeed,
          setTextMoveSpeed,
          fontSize,
          setFontSize,
          textSelectedColor,
          setTextSelectedColor,
          outLine,
          setOutLine,
          dropShadow,
          setDropShadow,
          backgroundColorPalette,
          backgroundColor,
          setBackgroundColor,
          backgroundBlur,
          setBackgroundBlur,
          effectItems,
          effectSelectedItem,
          setEffectSelectedItem,
        }}
      >
        {activeTab === "TEXT" && <TextSection />}
        {activeTab === "BACKGROUND" && <BackgroundSection />}
        {activeTab === "EFFECT" && <EffectSection />}
      </SettingsProvider>

      {/* fullscreen LED banner modal */}
      <LedBannerFullScreen
        visible={isPlaying}
        onClose={() => setIsPlaying(false)}
        text={previewText}
        speed={textMoveSpeed}
        playOption={playOption}
        fontSize={fontSize}
        textColor={textSelectedColor}
        backgroundColor={backgroundColor}
      />
    </View>
  );
}
