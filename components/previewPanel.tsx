import { appFontFamilyForText } from "@/constants/appFonts";
import { btnStyles } from "@/constants/btnStyles";
import { glowColorToSkiaRgba } from "@/constants/colorPalette";
import {
  GRADIENT_BACKDROP_IDS,
  type GradientBackdropId,
} from "@/constants/gradientBackgroundPresets";
import {
  isSpeechBubblePreset,
  SPEECH_BUBBLE_PRESETS,
} from "@/constants/speechBubblePresets";
import { styles } from "@/constants/styles";
import { useSettings } from "@/contexts/settingsContext";
import { useBackgroundEffectAnimation } from "@/hooks/useBackgroundEffectAnimation";
import { useBlinkOpacityStyle } from "@/hooks/useBlinkOpacityStyle";
import { useMarqueeAnimation } from "@/hooks/useMarqueeAnimation";
import { usePreviewPanelCanvas } from "@/hooks/usePreviewPanelCanvas";
import { Image } from "expo-image";
import { LinearGradient as LinearGradientExpo } from "expo-linear-gradient";
import React, { useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextLayoutEvent,
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

const INTENTIONAL_NEWLINE_MARKER = "↵";

const TEXT_MAX_WIDTH = 100_000;
const INPUT_WIDTH_CURSOR_PAD = 28;
const INPUT_MAX_LINES = 3;
const INPUT_HEIGHT_FALLBACK = 84;
const INPUT_HEIGHT_BUFFER = 20;
const INPUT_HEIGHT_SAMPLE_GLYPH = "Ag";

function formatMultiLineInputDisplay(stored: string): string {
  const clean = stored.replace(/↵/g, "");
  return clean.replace(/\n/g, `${INTENTIONAL_NEWLINE_MARKER}\n`);
}

function stripMarkersForStorage(s: string): string {
  const M = INTENTIONAL_NEWLINE_MARKER;
  const withoutOrphanMarker = s.replace(new RegExp(`${M}(?!\\n)`, "g"), "");
  return withoutOrphanMarker.split(M).join("");
}

function storageIndexToDisplayIndex(
  stored: string,
  storageIdx: number,
): number {
  const prefix = stored.slice(0, storageIdx);
  return storageIdx + (prefix.match(/\n/g) || []).length;
}

function mergeWhenOnlyMarkerBeforeNewlineRemoved(
  prevDisplay: string,
  newInput: string,
): { text: string; cursorInMerged?: number } {
  if (newInput.length >= prevDisplay.length) return { text: newInput };
  for (let i = 0; i < prevDisplay.length; i++) {
    const oneRemoved = prevDisplay.slice(0, i) + prevDisplay.slice(i + 1);
    if (oneRemoved !== newInput) continue;
    if (
      prevDisplay[i] === INTENTIONAL_NEWLINE_MARKER &&
      prevDisplay[i + 1] === "\n"
    ) {
      const merged = prevDisplay.slice(0, i) + prevDisplay.slice(i + 2);
      return { text: merged, cursorInMerged: i };
    }
    return { text: newInput };
  }
  return { text: newInput };
}

export default function PreviewPanel() {
  const [previewHeight, setPreviewHeight] = useState(0);
  /** 미리보기 박스 전체 크기 — Skia 내부 onLayout이 0일 때 글리프·그라데이션 보정 */
  const [previewBox, setPreviewBox] = useState({ width: 0, height: 0 });
  const [inputScrollViewportW, setInputScrollViewportW] = useState(0);
  const [measuredTextMaxW, setMeasuredTextMaxW] = useState(0);
  const [inputFixedHeight, setInputFixedHeight] = useState(INPUT_HEIGHT_FALLBACK);
  const [pendingSelection, setPendingSelection] = useState<
    { start: number; end: number } | undefined
  >(undefined);
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
  const isNanumGothic = font === "nanum_gothic";
  const inputMaxLines = isNanumGothic ? 1 : INPUT_MAX_LINES;
  const { backgroundColor, backgroundImageUri, backgroundBlur } = config.background;
  const hasBgPhoto =
    backgroundImageUri != null && backgroundImageUri.length > 0;
  const { textMoveSpeed } = config.motion;
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const isPortrait = windowHeight >= windowWidth;

  const {
    displayText,
    translateX,
    onContainerLayout,
    onTextLayout,
    SPACER,
  } = useMarqueeAnimation({
    text: previewText,
    speed: textMoveSpeed,
    playOption,
    oneLineJoinMode,
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
    letterSpacing: lineSpacing,
    fallbackLayout: previewBox,
  });

  const { opacity: blinkOpacity } = useBlinkOpacityStyle(
    effectSelectedItems.includes("Blink"),
    blinkSpeed,
  );
  const backgroundEdgeEffectAnim =
    useBackgroundEffectAnimation(backgroundEffectPreset);
  let previewTextContainerSize: { width: `${number}%`; height: `${number}%` } | null =
    null;
  if (isSpeechBubblePreset(backgroundEdgeEffectAnim.id)) {
    const previewBox =
      SPEECH_BUBBLE_PRESETS[backgroundEdgeEffectAnim.id].previewTextBox;
    previewTextContainerSize = previewBox.portrait;
  }

  const onPreviewLayout = (e: LayoutEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setPreviewBox({ width, height });
    setPreviewHeight(height);
    onContainerLayout(e);
  };

  const getDisplayText = (text: string) => {
    if (!text) return "";
    return playOption === "multi"
      ? formatMultiLineInputDisplay(text)
      : text.replace(/\u21B5/g, "");
  };
  const displayInputText = getDisplayText(previewText);

  const inputHorizontalCanvasWidth = useMemo(() => {
    const minWidth = Math.max(inputScrollViewportW, windowWidth * 0.8);
    const measuredWidth = measuredTextMaxW + INPUT_WIDTH_CURSOR_PAD;
    return Math.max(minWidth, measuredWidth);
  }, [inputScrollViewportW, measuredTextMaxW, windowWidth]);

  const prevMultiLineDisplayRef = useRef<string>("");
  useLayoutEffect(() => {
    prevMultiLineDisplayRef.current = getDisplayText(previewText);
  }, [previewText, playOption]);

  useLayoutEffect(() => {
    if (pendingSelection === undefined) return;
    const id = requestAnimationFrame(() => setPendingSelection(undefined));
    return () => cancelAnimationFrame(id);
  }, [pendingSelection]);

  const handleTextChangeWithIcon = (e: string) => {
    const merged =
      playOption === "multi"
        ? mergeWhenOnlyMarkerBeforeNewlineRemoved(
            prevMultiLineDisplayRef.current,
            e,
          )
        : { text: e };

    const working = merged.text;
    const stripped = stripMarkersForStorage(working);
    const forStorage = isNanumGothic
      ? stripped.split("\n")[0] ?? ""
      : stripped;
    handleTextChange(forStorage);

    if (!isNanumGothic && playOption === "multi" && merged.cursorInMerged !== undefined) {
      const storageIdx = stripMarkersForStorage(
        working.slice(0, merged.cursorInMerged),
      ).length;
      const displayIdx = storageIndexToDisplayIndex(forStorage, storageIdx);
      setPendingSelection({ start: displayIdx, end: displayIdx });
    }
  };

  const setPreviewText = (text: string) =>
    updateConfig("content", { previewText: text });

  const handleInputMeasureLayout = (e: TextLayoutEvent) => {
    const maxWidth = e.nativeEvent.lines.reduce(
      (widest, line) => Math.max(widest, line.width),
      0,
    );
    setMeasuredTextMaxW(maxWidth);
  };

  const handleInputHeightMeasureLayout = (e: TextLayoutEvent) => {
    const lines = e.nativeEvent.lines.slice(0, inputMaxLines);
    if (lines.length === 0) return;
    const measured = lines.reduce((sum, line) => sum + line.height, 0);
    const nextHeight = Math.ceil(measured + INPUT_HEIGHT_BUFFER);
    if (nextHeight > 0 && nextHeight !== inputFixedHeight) {
      setInputFixedHeight(nextHeight);
    }
  };

  return (
    <View style={styles.previewContainer}>
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
        {previewTextContainerSize ? (
          <View
            style={{
              position: "absolute",
              width: previewTextContainerSize.width as `${number}%`,
              height: previewTextContainerSize.height as `${number}%`,
              alignSelf: "center",
              top: "14%",
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
              segmentCount={5}
              spacer={SPACER}
              isGlowEffect={isGlowEffect}
              glowBlurRadius={glowBlurRadius}
              glowLayerColor={glowLayerColor}
              skiaStrokeWidth={skiaStrokeWidth}
              dropShadow={dropShadow}
              previewTextColor={previewTextColor}
            />
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
              segmentCount={5}
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
        style={{ alignSelf: "flex-end", marginTop: 6, marginRight: 2 }}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text style={{ fontSize: 13, color: "#888" }} allowFontScaling={false}>
          Reset slot
        </Text>
      </TouchableOpacity>
      {/* contents input container */}
      <View id="contentsInputContainer" style={styles.contentsInputContainer}>
        <Text
          style={[
            styles.contentsInput,
            {
              position: "absolute",
              opacity: 0,
              left: -TEXT_MAX_WIDTH,
              width: TEXT_MAX_WIDTH,
              fontFamily: appFontFamilyForText(
                font,
                fontWeight === "bold" ? "bold" : "normal",
              ),
            },
          ]}
          onTextLayout={handleInputMeasureLayout}
          pointerEvents="none"
        >
          {displayInputText || " "}
        </Text>
        <Text
          style={[
            styles.contentsInput,
            {
              position: "absolute",
              opacity: 0,
              left: -TEXT_MAX_WIDTH,
              width: TEXT_MAX_WIDTH,
              fontFamily: appFontFamilyForText(
                font,
                fontWeight === "bold" ? "bold" : "normal",
              ),
            },
          ]}
          onTextLayout={handleInputHeightMeasureLayout}
          pointerEvents="none"
        >
          {Array.from({ length: inputMaxLines })
            .map(() => INPUT_HEIGHT_SAMPLE_GLYPH)
            .join("\n")}
        </Text>
        <ScrollView
          horizontal
          nestedScrollEnabled
          keyboardShouldPersistTaps="handled"
          showsHorizontalScrollIndicator
          style={{ flex: 0.8 }}
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
            multiline={playOption === "multi" && !isNanumGothic}
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
                includeFontPadding: false,
                fontFamily: appFontFamilyForText(
                  font,
                  fontWeight === "bold" ? "bold" : "normal",
                ),
              },
            ]}
            placeholder="Enter your text here"
            value={displayInputText}
            selection={pendingSelection}
            onChangeText={handleTextChangeWithIcon}
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
            <Text style={btnStyles.contentsInputResetButtonText}>×</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
