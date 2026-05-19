import { DeleteAllButton } from "@/assets/svg/deleteAllButton";
import { appFontFamilyForText } from "@/constants/appFonts";
import { btnStyles } from "@/constants/btnStyles";
import { styles } from "@/constants/styles";
import { useSettings } from "@/contexts/settingsContext";
import { useBackgroundEffectAnimation } from "@/hooks/useBackgroundEffectAnimation";
import { useEffects } from "@/hooks/useEffects";
import { useBlinkOpacityStyle } from "@/hooks/useBlinkOpacityStyle";
import { useMarqueeAnimation } from "@/hooks/useMarqueeAnimation";
import { usePreviewPanelCanvas } from "@/hooks/usePreviewPanelCanvas";
import { usePreviewPanelTextInput } from "@/hooks/usePreviewPanelTextInput";
import { useTextMetrics } from "@/hooks/useTextMetrics";
import {
  resolveSpeechCanvasFallback,
  useSpeechBubble,
} from "@/hooks/useSpeechBubble";
import { getSizingPolicy } from "@/utils/textSizing";
import { Image } from "expo-image";
import { LinearGradient as LinearGradientExpo } from "expo-linear-gradient";
import React, { useMemo, useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { buildCanvas } from "./animation/buildCanvas";
import { BackgroundEffectLayer } from "./animation/BackgroundEffectLayer";
import { MarqueeCanvas } from "./animation/MarqueeCanvas";

type LayoutEvent = {
  nativeEvent: { layout: { height: number; width: number } };
};

export default function PreviewPanel() {
  const [previewHeight, setPreviewHeight] = useState(0);
  const [previewBox, setPreviewBox] = useState({ width: 0, height: 0 });
  const [inputScrollViewportW, setInputScrollViewportW] = useState(0);

  const {
    config,
    handleTextChange,
    updateConfig,
    ui,
    loadPreset,
  } = useSettings();
  const { activePreset } = ui;

  const { previewText, playOption, oneLineJoinMode } = config.content;
  const {
    font,
    fontSize,
    textSelectedColor,
    outLine,
    lineSpacing,
    letterSpacing,
    dropShadow,
    fontWeight,
    effectSelectedItems,
    gradientBackgroundPreset,
    backgroundEffectPreset,
    blinkSpeed,
    pixelSize: configPixelSize,
    glowIntensity,
    glowColor,
  } = config.appearance;
  const { backgroundColor, backgroundImageUri, backgroundBlur } =
    config.background;
  const hasBgPhoto =
    backgroundImageUri != null && backgroundImageUri.length > 0;
  const { textMoveSpeed } = config.motion;
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const isPortrait = windowHeight >= windowWidth;

  const backgroundEdgeEffectAnim = useBackgroundEffectAnimation(
    backgroundEffectPreset,
  );
  const sizingPolicy = useMemo(
    () => getSizingPolicy({ effectId: backgroundEdgeEffectAnim.id }),
    [backgroundEdgeEffectAnim.id],
  );

  const effects = useEffects({
    effectSelectedItems,
    gradientBackgroundPreset,
    outLine,
    glowIntensity,
    glowColor,
    dropShadow,
    pixelSize: configPixelSize,
  });

  const speechBubble = useSpeechBubble({
    speechBubbleId: sizingPolicy.speechBubbleId,
    effectId: backgroundEdgeEffectAnim.id,
    isPortrait,
    basisWidthPx: previewBox.width,
    viewportHeight: previewHeight,
  });

  const { effectiveLineSpacing, previewFontSize, marqueeReferenceFontSize } =
    useTextMetrics({
      mode: "preview",
      previewHeight,
      text: previewText,
      fontSize,
      lineSpacing,
      playOption,
      sizingPolicy,
      isSpeechBgActive: speechBubble.isActive,
      speechMaxHeight: speechBubble.maxTextHeight,
    });

  const marqueeViewportWidthPx =
    speechBubble.speechBoxPx?.widthPx ?? previewBox.width;

  const { displayText, translateX, onContainerLayout, onTextLayout, SPACER } =
    useMarqueeAnimation({
      text: previewText,
      speed: textMoveSpeed,
      playOption,
      oneLineJoinMode,
      viewportWidthPx: marqueeViewportWidthPx,
      effectBleedPx: effects.effectSpacePx,
    });

  const canvasFallback = useMemo(
    () => resolveSpeechCanvasFallback(speechBubble.speechBoxPx, previewBox),
    [speechBubble.speechBoxPx, previewBox],
  );

  const canvas = usePreviewPanelCanvas({
    displayText,
    translateX,
    onTextLayout,
    previewFontSize,
    marqueeReferenceFontSize,
    appearanceFont: font,
    fontWeight,
    letterSpacing,
    lineSpacingPx: effectiveLineSpacing,
    fallbackLayout: canvasFallback,
    playOption,
    speechBubbleLayout: speechBubble.isActive ? {} : null,
  });

  const { opacity: blinkOpacity } = useBlinkOpacityStyle(
    effectSelectedItems.includes("Blink"),
    blinkSpeed,
  );

  const marqueeCanvasProps = buildCanvas({
    canvas,
    effects,
    blinkOpacity,
    spacer: SPACER,
    previewTextColor: textSelectedColor,
    gradientBackgroundPreset,
    hasBgPhoto,
    dropShadow,
  });

  const onPreviewLayout = (e: LayoutEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setPreviewBox({ width, height });
    setPreviewHeight(height);
    onContainerLayout(e);
  };

  const {
    displayInputText,
    inputHorizontalCanvasWidth,
    inputFixedHeight,
    pendingSelection,
    handleInputMeasureLayout,
    handleWrappedHeightMeasureLayout,
    handleInputContentSizeChange,
    measureOffscreenStyle,
    onSelectionChange,
  } = usePreviewPanelTextInput({
    previewText,
    activePreset,
    inputScrollViewportW,
    windowWidth,
    font,
    fontWeight,
  });

  const setPreviewText = (text: string) =>
    updateConfig("content", { previewText: text });

  return (
    <View style={styles.previewContainer}>
      {/* preview */}
      <View
        collapsable={false}
        style={[
          styles.preview,
          {
            justifyContent: "center",
            overflow: "hidden",
            backgroundColor: hasBgPhoto ? undefined : backgroundColor,
          },
        ]}
        onLayout={onPreviewLayout}
      >
        {hasBgPhoto ? (
          <Image
            source={{ uri: backgroundImageUri }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            blurRadius={backgroundBlur / 8}
          />
        ) : null}
        <BackgroundEffectLayer
          effect={backgroundEdgeEffectAnim}
          translateX={translateX}
          isPortrait={isPortrait}
          mode="preview"
        />
        {speechBubble.speechTextBoxConfig ? (
          <View
            style={{
              ...StyleSheet.absoluteFillObject,
              alignItems: "center",
              ...(speechBubble.speechTextTop == null
                ? { justifyContent: "center" }
                : null),
            }}
            pointerEvents="none"
          >
            <View
              style={speechBubble.textContainerStyle!}
              onLayout={canvas.onSkiaCanvasLayout}
            >
              <MarqueeCanvas {...marqueeCanvasProps} />
            </View>
          </View>
        ) : (
          <View
            style={StyleSheet.absoluteFill}
            onLayout={canvas.onSkiaCanvasLayout}
          >
            <MarqueeCanvas {...marqueeCanvasProps} />
          </View>
        )}
      </View>

      {/* preset buttons */}
      <View style={styles.presetButtonsContainer}>
        {[1, 2, 3, 4, 5].map((num, index) => (
          <TouchableOpacity
            key={index}
            style={
              index === activePreset
                ? btnStyles.presetButtonActive
                : btnStyles.presetButton
            }
            onPress={() => loadPreset(index)}
            accessibilityLabel={`Preset ${index + 1}`}
          >
            <LinearGradientExpo
              colors={
                index === activePreset
                  ? ["white", "#CCCCCC"]
                  : ["white", "#727272"]
              } // 시작색, 끝색
              start={{ x: 0, y: 0 }} //왼쪽 위
              end={{ x: 0.1, y: 0.2 }} //오른쪽 아래
              style={btnStyles.presetButtonGradient} //기존 스타일 적용
            >
              <Text
                allowFontScaling={false}
                style={
                  index === activePreset
                    ? btnStyles.presetButtonActiveText
                    : btnStyles.presetButtonText
                }
              >
                {num}
              </Text>
            </LinearGradientExpo>
          </TouchableOpacity>
        ))}
      </View>

      {/* contents input container */}
      <View id="contentsInputContainer" style={styles.contentsInputContainer}>
        <Text
          allowFontScaling={false}
          style={[styles.contentsInput, measureOffscreenStyle]}
          onTextLayout={handleInputMeasureLayout}
          pointerEvents="none"
        >
          {displayInputText || " "}
        </Text>
        <Text
          allowFontScaling={false}
          style={[
            styles.contentsInput,
            measureOffscreenStyle,
            { width: inputHorizontalCanvasWidth },
          ]}
          onTextLayout={handleWrappedHeightMeasureLayout}
          pointerEvents="none"
        >
          {displayInputText || " "}
        </Text>
        <ScrollView
          horizontal
          nestedScrollEnabled
          keyboardShouldPersistTaps="handled"
          showsHorizontalScrollIndicator
          style={{ flex: 0.9 }}
          contentContainerStyle={{ flexGrow: 1 }}
          onLayout={(e) => setInputScrollViewportW(e.nativeEvent.layout.width)}
          {...(Platform.OS === "ios"
            ? {
                scrollIndicatorInsets: { right: 1 },
                indicatorStyle: "white" as const,
              }
            : {})}
          {...(Platform.OS === "android" ? { persistentScrollbar: true } : {})}
        >
          <TextInput
            editable
            allowFontScaling={false}
            multiline={playOption === "multi"}
            scrollEnabled={false}
            style={[
              styles.contentsInput,
              {
                flex: 0,
                width: inputHorizontalCanvasWidth,
                height: inputFixedHeight,
                maxHeight: inputFixedHeight,
                paddingTop: 0,
                paddingBottom: 0,
                fontFamily: appFontFamilyForText(
                  font,
                  fontWeight === "bold" ? "bold" : "normal",
                ),
              },
            ]}
            placeholder="Enter your text here"
            value={displayInputText}
            selection={pendingSelection}
            onChangeText={handleTextChange}
            onContentSizeChange={handleInputContentSizeChange}
            onSelectionChange={onSelectionChange}
            textAlignVertical="top"
          />
        </ScrollView>
        <View
          id="contentsInputResetButtonContainer"
          style={styles.contentsInputResetButtonContainer}
        >
          <TouchableOpacity
            onPress={() => setPreviewText("")}
            style={btnStyles.contentsInputResetButton}
          >
            <DeleteAllButton />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
