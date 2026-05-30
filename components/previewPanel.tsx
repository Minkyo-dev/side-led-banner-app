import { DeleteAllButton } from "@/assets/svg/deleteAllButton";
import { appFontFamilyForText } from "@/constants/appFonts";
import { btnStyles } from "@/constants/btnStyles";
import {
  CONTENTS_INPUT_FONT_SIZE,
  CONTENTS_INPUT_LINE_HEIGHT,
  styles,
} from "@/constants/styles";
import {
  normalizePreviewTextMaxLines,
  PREVIEW_TEXT_MAX_LINES,
  useSettings,
} from "@/contexts/settingsContext";
import { useBackgroundAnimation } from "@/hooks/useBackgroundAnimation";
import { useBlinkOpacityStyle } from "@/hooks/useBlinkOpacityStyle";
import { useEffects } from "@/hooks/useEffects";
import { useMarqueeAnimation } from "@/hooks/useMarqueeAnimation";
import { usePreviewPanelCanvas } from "@/hooks/usePreviewPanelCanvas";
import { useTextInput } from "@/hooks/useTextInput";
import {
  resolveSpeechCanvasFallback,
  useSpeechBubble,
} from "@/hooks/useSpeechBubble";
import { useTextMetrics } from "@/hooks/useTextMetrics";
import { getSizingPolicy } from "@/utils/textSizing";
import { resolveBubbleCanvasOpts } from "@/utils/skiaBubbleTextLayout";
import { Image } from "expo-image";
import { LinearGradient as LinearGradientExpo } from "expo-linear-gradient";
import React, { useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  Keyboard,
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
import { buildCanvas } from "./animation/buildCanvas";
import { buildPixelBackground } from "./animation/buildPixelBackground";
import { MarqueeCanvas } from "./animation/MarqueeCanvas";
import { PixelBackgroundCanvas } from "./animation/PixelBackgroundCanvas";

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
    glowIntensity,
    glowColor,
    pixelColorMix,
  } = config.appearance;
  const { backgroundColor, backgroundImageUri, backgroundBlur } =
    config.background;
  const hasBgPhoto =
    backgroundImageUri != null && backgroundImageUri.length > 0;
  const { textMoveSpeed } = config.motion;
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const isPortrait = windowHeight >= windowWidth;

  const backgroundEdgeEffectAnim = useBackgroundAnimation(
    backgroundEffectPreset,
  );
  const sizingPolicy = useMemo(
    () => getSizingPolicy({ effectId: backgroundEdgeEffectAnim.id }),
    [backgroundEdgeEffectAnim.id],
  );

  const speechBubble = useSpeechBubble({
    speechBubbleId: sizingPolicy.speechBubbleId,
    effectId: backgroundEdgeEffectAnim.id,
    isPortrait,
    basisWidthPx: previewBox.width,
    viewportHeight: previewHeight,
  });

  const fullscreenSpeechBubble = useSpeechBubble({
    speechBubbleId: sizingPolicy.speechBubbleId,
    effectId: backgroundEdgeEffectAnim.id,
    isPortrait,
    basisWidthPx: windowWidth,
    viewportHeight: windowHeight,
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
      appearanceFont: font,
      fontWeight,
    });

  const { previewFontSize: fullscreenFontSize } = useTextMetrics({
    mode: "fullscreen",
    text: previewText,
    fontSize,
    lineSpacing,
    playOption,
    sizingPolicy,
    isSpeechBgActive: fullscreenSpeechBubble.isActive,
    speechMaxHeight: fullscreenSpeechBubble.maxTextHeight,
    windowWidth,
    windowHeight,
    isPortrait,
    appearanceFont: font,
    fontWeight,
  });

  const pixelViewportScale = useMemo(() => {
    if (!effectSelectedItems.includes("Pixel") || fullscreenFontSize <= 0) {
      return 1;
    }
    return Math.min(1, Math.max(0.15, previewFontSize / fullscreenFontSize));
  }, [effectSelectedItems, previewFontSize, fullscreenFontSize]);

  const effects = useEffects({
    effectSelectedItems,
    gradientBackgroundPreset,
    outLine,
    glowIntensity,
    glowColor,
    dropShadow,
    pixelColorMix,
    playOption,
    pixelViewportScale,
  });

  const marqueeViewportWidthPx =
    speechBubble.speechBoxPx?.widthPx ?? previewBox.width;

  const { displayText, translateX, onTextLayout, SPACER } = useMarqueeAnimation(
    {
      text: previewText,
      speed: textMoveSpeed,
      playOption,
      oneLineJoinMode,
      viewportWidthPx: marqueeViewportWidthPx,
      effectBleedPx: effects.effectSpacePx,
    },
  );

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
    speechBubbleLayout: resolveBubbleCanvasOpts({
      isSpeechActive: speechBubble.isActive,
      isPixelEffect: effects.isPixelEffect,
      pixelShaderSize: effects.pixelShaderSize,
      speechBubbleId: sizingPolicy.speechBubbleId,
    }),
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
    hasBgPhoto,
    dropShadow,
    backgroundColor,
  });

  const pixelBackgroundProps = useMemo(
    () =>
      buildPixelBackground({
        width: previewBox.width,
        height: previewBox.height,
        effects,
        hasBgPhoto,
        backgroundColor,
        backgroundImageUri: backgroundImageUri ?? null,
        gradientBackgroundPreset,
        backgroundEffect: backgroundEdgeEffectAnim,
        translateX,
        isPortrait,
        mode: "preview",
      }),
    [
      previewBox.width,
      previewBox.height,
      effects,
      hasBgPhoto,
      backgroundColor,
      backgroundImageUri,
      gradientBackgroundPreset,
      backgroundEdgeEffectAnim,
      translateX,
      isPortrait,
    ],
  );

  const onPreviewLayout = (e: LayoutEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setPreviewBox({ width, height });
    setPreviewHeight(height);
  };

  const {
    displayInputText,
    inputHorizontalCanvasWidth,
    pendingSelection,
    inputScrollRef,
    handleInputMeasureLayout,
    handleFontLinesProbeLayout,
    handleWrappedHeightMeasureLayout,
    handleInputContentSizeChange,
    measureOffscreenStyle,
    fontLineProbeText,
    onSelectionChange,
    onInputScroll,
    inputViewportHeightPx,
  } = useTextInput({
    previewText,
    activePreset,
    inputScrollViewportW,
    windowWidth,
    font,
    fontWeight,
  });

  const setPreviewText = (text: string) =>
    updateConfig("content", { previewText: text });
  const dismissKeyboard = () => Keyboard.dismiss();
  const inputSelectionRef = useRef({ start: 0, end: 0 });
  const [rejectedEnterSelection, setRejectedEnterSelection] = useState<
    { start: number; end: number } | undefined
  >(undefined);

  const onPreviewTextChange = (text: string) => {
    const next = normalizePreviewTextMaxLines(text);
    if (next === null) {
      setRejectedEnterSelection({ ...inputSelectionRef.current });
      return;
    }
    handleTextChange(text);
  };

  useLayoutEffect(() => {
    if (rejectedEnterSelection === undefined) return;
    const id = requestAnimationFrame(() => setRejectedEnterSelection(undefined));
    return () => cancelAnimationFrame(id);
  }, [rejectedEnterSelection]);

  const handleInputKeyPress = (e: { nativeEvent: { key: string } }) => {
    if (playOption !== "multi") return;
    if (e.nativeEvent.key !== "Enter") return;

    const lineCount = previewText.replace(/\r\n?/g, "\n").split("\n").length;
    if (lineCount >= PREVIEW_TEXT_MAX_LINES) {
      dismissKeyboard();
    }
  };

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
            backgroundColor:
              hasBgPhoto || effects.isPixelEffect ? undefined : backgroundColor,
          },
        ]}
        onLayout={onPreviewLayout}
      >
        {hasBgPhoto && !effects.isPixelEffect ? (
          <Image
            source={{ uri: backgroundImageUri }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            blurRadius={backgroundBlur / 8}
          />
        ) : null}
        {effects.isPixelEffect && previewBox.width > 0 && previewBox.height > 0 ? (
          <PixelBackgroundCanvas {...pixelBackgroundProps} />
        ) : null}
        <BackgroundEffectLayer
          effect={backgroundEdgeEffectAnim}
          translateX={translateX}
          isPortrait={isPortrait}
          mode="preview"
          suppressPixelManagedBackgrounds={effects.isPixelEffect}
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
              <MarqueeCanvas
                {...marqueeCanvasProps}
                gradientBackgroundPreset={gradientBackgroundPreset}
              />
            </View>
          </View>
        ) : (
          <View
            style={StyleSheet.absoluteFill}
            onLayout={canvas.onSkiaCanvasLayout}
          >
            <MarqueeCanvas
              {...marqueeCanvasProps}
              gradientBackgroundPreset={gradientBackgroundPreset}
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
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 0.1, y: 0.2 }}
              style={btnStyles.presetButtonGradient}
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
      <View
        id="contentsInputContainer"
        style={[
          styles.contentsInputContainer,
          { minHeight: inputViewportHeightPx },
        ]}
      >
        <Text
          allowFontScaling={false}
          style={[styles.contentsInput, measureOffscreenStyle]}
          onTextLayout={handleFontLinesProbeLayout}
          pointerEvents="none"
        >
          {fontLineProbeText}
        </Text>
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
          ref={inputScrollRef}
          horizontal
          nestedScrollEnabled
          keyboardShouldPersistTaps="handled"
          showsHorizontalScrollIndicator
          scrollEventThrottle={16}
          onScroll={onInputScroll}
          style={{ flex: 0.9, height: inputViewportHeightPx }}
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
            scrollEnabled={playOption === "multi"}
            style={[
              styles.contentsInput,
              {
                flex: 0,
                width: inputHorizontalCanvasWidth,
                height: inputViewportHeightPx,
                maxHeight: inputViewportHeightPx,
                paddingTop: 0,
                paddingBottom: 0,
                fontSize: CONTENTS_INPUT_FONT_SIZE,
                lineHeight: CONTENTS_INPUT_LINE_HEIGHT,
                fontFamily: appFontFamilyForText(
                  font,
                  fontWeight === "bold" ? "bold" : "normal",
                ),
              },
            ]}
            placeholder="Enter your text here"
            value={displayInputText}
            selection={rejectedEnterSelection ?? pendingSelection}
            onChangeText={onPreviewTextChange}
            onContentSizeChange={handleInputContentSizeChange}
            onKeyPress={handleInputKeyPress}
            onSelectionChange={(e) => {
              const { start, end } = e.nativeEvent.selection;
              inputSelectionRef.current = { start, end };
              onSelectionChange(e);
            }}
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
