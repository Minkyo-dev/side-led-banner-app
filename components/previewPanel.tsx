import { DeleteAllButton } from "@/assets/svg/deleteAllButton";
import { appFontFamilyForText, uiThemeFontStyle } from "@/constants/appFonts";
import { btnStyles } from "@/constants/btnStyles";
import { glowColorToSkiaRgba } from "@/constants/colorPalette";
import {
  GRADIENT_BACKDROP_IDS,
  type GradientBackdropId,
} from "@/constants/gradientBackgroundPresets";
import { SPEECH_BUBBLE_PRESETS } from "@/constants/speechBubblePresets";
import { styles } from "@/constants/styles";
import { useSettings } from "@/contexts/settingsContext";
import { useBackgroundEffectAnimation } from "@/hooks/useBackgroundEffectAnimation";
import { useBlinkOpacityStyle } from "@/hooks/useBlinkOpacityStyle";
import { useMarqueeAnimation } from "@/hooks/useMarqueeAnimation";
import { usePreviewPanelCanvas } from "@/hooks/usePreviewPanelCanvas";
import { usePreviewPanelTextInput } from "@/hooks/usePreviewPanelTextInput";
import { computeMarqueeSegmentCount } from "@/utils/marqueeSegments";
import {
  getFontScaledLineSpacingPx,
  getPreviewTextMetrics,
  getTextSizingPolicy,
  getFullscreenTextMetrics,
  resolveFullscreenMaxHeight,
  resolveSpeechTextTopOffset,
} from "@/utils/textSizing";
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
    resetPresetSlot,
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
    () =>
      getTextSizingPolicy({
        effectId: backgroundEdgeEffectAnim.id,
      }),
    [backgroundEdgeEffectAnim.id],
  );
  const isSpeechBgActive = sizingPolicy.speechBubbleId != null;
  const effectiveLineSpacing = useMemo(
    () =>
      getFontScaledLineSpacingPx({
        requestedLineSpacingPx: lineSpacing,
        fontSizePercent: fontSize,
      }),
    [lineSpacing, fontSize],
  );

  const { displayText, translateX, onContainerLayout, onTextLayout, SPACER } =
    useMarqueeAnimation({
      text: previewText,
      speed: textMoveSpeed,
      playOption,
      oneLineJoinMode,
    });
  const speechTextMaxHeight = useMemo(() => {
    if (previewHeight <= 0) return 0;
    return resolveFullscreenMaxHeight({
      effectId: backgroundEdgeEffectAnim.id,
      isPortrait,
      viewportHeight: previewHeight,
    });
  }, [previewHeight, backgroundEdgeEffectAnim.id, isPortrait]);
  const previewTextMetrics = useMemo(() => {
    if (previewHeight <= 0) {
      return { lineCount: 1, fontSize: 100, height: 100 };
    }
    const cappedMetrics = getFullscreenTextMetrics({
      displayText,
      baseFontSize: fontSize,
      lineHeightRatio: sizingPolicy.fullscreenLineHeightRatio,
      lineSpacingPx: effectiveLineSpacing,
      maxHeight: speechTextMaxHeight,
      padding: isSpeechBgActive ? 0 : sizingPolicy.speechTextHeightPadding,
      clampByMaxHeight: sizingPolicy.clampByMaxHeight,
    });
    if (isSpeechBgActive) {
      return cappedMetrics;
    }
    return getPreviewTextMetrics({
      previewHeight,
      baseFontSize: cappedMetrics.fontSize,
      playOption,
      text: previewText,
      padding: sizingPolicy.previewPadding,
      lineHeightRatio: sizingPolicy.previewLineHeightRatio,
      lineSpacingPx: effectiveLineSpacing,
    });
  }, [
    previewHeight,
    speechTextMaxHeight,
    displayText,
    fontSize,
    effectiveLineSpacing,
    sizingPolicy,
    isSpeechBgActive,
    playOption,
    previewText,
  ]);
  const previewFontSize = previewTextMetrics.fontSize;

  const previewTextColor = textSelectedColor;

  const isPixelEffect = effectSelectedItems.includes("Pixel");
  const isGlowEffect = effectSelectedItems.includes("Glow");
  const showGradientBackdrop =
    effectSelectedItems.includes("Gradient") &&
    GRADIENT_BACKDROP_IDS.includes(
      gradientBackgroundPreset as GradientBackdropId,
    );
  const pixelShaderSize = isPixelEffect ? Math.max(2, configPixelSize) : 1;
  const skiaStrokeWidth = (outLine / 100) * 24;

  const glowBlurRadius = useMemo(
    () => Math.max(2, Math.min(18, 2 + (glowIntensity / 100) * 16)),
    [glowIntensity],
  );
  const glowLayerColor = useMemo(
    () => glowColorToSkiaRgba(glowColor, glowIntensity),
    [glowColor, glowIntensity],
  );

  const canvas = usePreviewPanelCanvas({
    displayText,
    translateX,
    onTextLayout,
    previewFontSize,
    appearanceFont: font,
    fontWeight,
    letterSpacing,
    lineSpacingPx: effectiveLineSpacing,
    fallbackLayout: previewBox,
  });

  const marqueeSegmentCount = useMemo(
    () =>
      computeMarqueeSegmentCount({
        viewportWidthPx: canvas.skiaCanvasLayout.width,
        textWidthPx: canvas.skiaTextWidth,
        spacerPx: SPACER,
        minSegments: 3,
        maxSegments: 12,
        bufferSegments: isGlowEffect ? 3 : 2,
      }),
    [
      canvas.skiaCanvasLayout.width,
      canvas.skiaTextWidth,
      SPACER,
      isGlowEffect,
    ],
  );

  const { opacity: blinkOpacity } = useBlinkOpacityStyle(
    effectSelectedItems.includes("Blink"),
    blinkSpeed,
  );
  const speechPresetPlatform = isSpeechBgActive
    ? Platform.OS === "ios"
      ? SPEECH_BUBBLE_PRESETS[sizingPolicy.speechBubbleId!].ios
      : SPEECH_BUBBLE_PRESETS[sizingPolicy.speechBubbleId!].android
    : null;
  const speechTextBoxConfig = isSpeechBgActive
    ? isPortrait
      ? speechPresetPlatform!.fullscreenTextBox.portrait
      : speechPresetPlatform!.fullscreenTextBox.landscape
    : null;
  const speechTextTop = useMemo(() => {
    if (!isSpeechBgActive || previewHeight <= 0) return null;
    return resolveSpeechTextTopOffset({
      effectId: backgroundEdgeEffectAnim.id,
      isPortrait,
      viewportHeight: previewHeight,
    });
  }, [
    isSpeechBgActive,
    previewHeight,
    backgroundEdgeEffectAnim.id,
    isPortrait,
  ]);

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
        {speechTextBoxConfig ? (
          <View
            style={{
              ...StyleSheet.absoluteFillObject,
              alignItems: "center",
              ...(speechTextTop == null ? { justifyContent: "center" } : null),
            }}
            pointerEvents="none"
          >
            <View
              style={{
                position: "absolute",
                width: speechTextBoxConfig.width,
                height: previewTextMetrics.height,
                ...(speechTextTop != null
                  ? { top: speechTextTop }
                  : {
                      transform: [{ translateY: speechTextBoxConfig.yOffset }],
                    }),
              }}
              onLayout={canvas.onSkiaCanvasLayout}
            >
              <MarqueeCanvas
                canvas={canvas}
                isPixelEffect={isPixelEffect}
                pixelShaderSize={pixelShaderSize}
                showGradientBackdrop={showGradientBackdrop}
                gradientBackgroundPreset={gradientBackgroundPreset}
                hasBgPhoto={hasBgPhoto}
                blinkOpacity={blinkOpacity}
                segmentCount={marqueeSegmentCount}
                spacer={SPACER}
                isGlowEffect={isGlowEffect}
                glowBlurRadius={glowBlurRadius}
                glowLayerColor={glowLayerColor}
                skiaStrokeWidth={skiaStrokeWidth}
                dropShadow={dropShadow}
                previewTextColor={previewTextColor}
              />
            </View>
          </View>
        ) : (
          <View
            style={StyleSheet.absoluteFill}
            onLayout={canvas.onSkiaCanvasLayout}
          >
            <MarqueeCanvas
              canvas={canvas}
              isPixelEffect={isPixelEffect}
              pixelShaderSize={pixelShaderSize}
              showGradientBackdrop={showGradientBackdrop}
              gradientBackgroundPreset={gradientBackgroundPreset}
              hasBgPhoto={hasBgPhoto}
              blinkOpacity={blinkOpacity}
              segmentCount={marqueeSegmentCount}
              spacer={SPACER}
              isGlowEffect={isGlowEffect}
              glowBlurRadius={glowBlurRadius}
              glowLayerColor={glowLayerColor}
              skiaStrokeWidth={skiaStrokeWidth}
              dropShadow={dropShadow}
              previewTextColor={previewTextColor}
            />
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
      <TouchableOpacity
        onPress={() => resetPresetSlot(activePreset)}
        accessibilityRole="button"
        accessibilityLabel="Reset current preset slot"
        style={{
          alignSelf: "flex-end",
          marginTop: 2,
          marginRight: 2,
          marginBottom: 0,
        }}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text
          allowFontScaling={false}
          style={[uiThemeFontStyle, { fontSize: 13, color: "#888" }]}
        >
          Reset slot
        </Text>
      </TouchableOpacity>

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
