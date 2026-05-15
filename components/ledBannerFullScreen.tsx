import { BackgroundEffectLayer } from "@/components/animation/BackgroundEffectLayer";
import { MarqueeCanvas } from "@/components/animation/MarqueeCanvas";
import { glowColorToSkiaRgba } from "@/constants/colorPalette";
import {
  GRADIENT_BACKDROP_IDS,
  type GradientBackdropId,
} from "@/constants/gradientBackgroundPresets";
import { SPEECH_BUBBLE_PRESETS } from "@/constants/speechBubblePresets";
import { ledBannerFullScreenStyles as styles } from "@/constants/styles";
import { BannerConfig } from "@/contexts/settingsContext";
import { useBackgroundEffectAnimation } from "@/hooks/useBackgroundEffectAnimation";
import { useBlinkOpacityStyle } from "@/hooks/useBlinkOpacityStyle";
import { useMarqueeAnimation } from "@/hooks/useMarqueeAnimation";
import { usePreviewPanelCanvas } from "@/hooks/usePreviewPanelCanvas";
import {
  FONT_SIZE_MIN,
  getFontScaledLineSpacingPx,
  getFullscreenTextMetrics,
  getTextSizingPolicy,
  resolveFullscreenMaxHeight,
  resolveSpeechTextTopOffset,
  scaleFontSizeByHeight,
} from "@/utils/textSizing";
import { computeMarqueeSegmentCount } from "@/utils/marqueeSegments";
import { Image } from "expo-image";
import React, { useMemo } from "react";
import {
  Modal,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  useWindowDimensions,
  View,
  type ViewStyle,
} from "react-native";

interface LedBannerFullScreenProps {
  visible: boolean;
  onClose: () => void;
  config: BannerConfig;
}

export const LedBannerFullScreen = ({
  visible,
  onClose,
  config,
}: LedBannerFullScreenProps) => {
  const { previewText, playOption, oneLineJoinMode } = config.content;
  const {
    font,
    fontSize,
    dropShadow,
    textSelectedColor,
    lineSpacing,
    letterSpacing,
    fontWeight,
    glowIntensity,
    glowColor,
    effectSelectedItems,
    gradientBackgroundPreset,
    backgroundEffectPreset,
    blinkSpeed,
    outLine,
    pixelSize: configPixelSize,
  } = config.appearance;

  const { backgroundColor, backgroundImageUri, backgroundBlur } =
    config.background;

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

  const { animatedStyle: blinkStyle, opacity: blinkOpacity } =
    useBlinkOpacityStyle(effectSelectedItems.includes("Blink"), blinkSpeed);
  const backgroundEdgeEffectAnim = useBackgroundEffectAnimation(
    backgroundEffectPreset,
  );
  const hasBgPhoto =
    backgroundImageUri != null && backgroundImageUri.length > 0;
  const { textMoveSpeed } = config.motion;
  const { displayText, translateX, onTextLayout, SPACER } = useMarqueeAnimation(
    {
      text: previewText,
      speed: textMoveSpeed,
      playOption,
      oneLineJoinMode,
    },
  );
  const isSpeechBgActive =
    backgroundEdgeEffectAnim.id === "speechBg1" ||
    backgroundEdgeEffectAnim.id === "speechBg2";
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const isPortrait = windowHeight >= windowWidth;
  const sizingPolicy = useMemo(
    () =>
      getTextSizingPolicy({
        effectId: backgroundEdgeEffectAnim.id,
      }),
    [backgroundEdgeEffectAnim.id],
  );
  const speechBgId = sizingPolicy.speechBubbleId;
  const landscapeHeight = Math.max(1, Math.min(windowWidth, windowHeight));
  const effectiveLineSpacing = useMemo(
    () =>
      getFontScaledLineSpacingPx({
        requestedLineSpacingPx: lineSpacing,
        fontSizePercent: fontSize,
      }),
    [lineSpacing, fontSize],
  );
  const heightScaledFontSize = useMemo(() => {
    const scaled = scaleFontSizeByHeight({
      baseFontSize: fontSize,
      targetHeight: windowHeight,
      referenceHeight: landscapeHeight,
    });
    const portraitSized = isPortrait
      ? Math.max(FONT_SIZE_MIN, Math.floor(scaled * sizingPolicy.portraitFontBoost))
      : scaled;
    const atMaxSize = fontSize >= 100;
    if (!isSpeechBgActive && !isPortrait && atMaxSize) {
      return Math.max(FONT_SIZE_MIN, Math.floor(portraitSized * 2));
    }
    return Math.max(FONT_SIZE_MIN, portraitSized);
  }, [
    fontSize,
    windowHeight,
    landscapeHeight,
    isPortrait,
    isSpeechBgActive,
    sizingPolicy.portraitFontBoost,
  ]);
  const fullscreenTextMetrics = useMemo(() => {
    return getFullscreenTextMetrics({
      displayText,
      baseFontSize: heightScaledFontSize,
      lineHeightRatio: sizingPolicy.fullscreenLineHeightRatio,
      lineSpacingPx: effectiveLineSpacing,
      maxHeight: resolveFullscreenMaxHeight({
        effectId: backgroundEdgeEffectAnim.id,
        isPortrait,
        viewportHeight: windowHeight,
      }),
      padding: isSpeechBgActive ? 0 : sizingPolicy.speechTextHeightPadding,
      clampByMaxHeight: sizingPolicy.clampByMaxHeight,
    });
  }, [
    displayText,
    heightScaledFontSize,
    effectiveLineSpacing,
    sizingPolicy,
    isSpeechBgActive,
    backgroundEdgeEffectAnim.id,
    isPortrait,
    windowHeight,
  ]);
  const speechPresetPlatform = isSpeechBgActive
    ? Platform.OS === "ios"
      ? SPEECH_BUBBLE_PRESETS[backgroundEdgeEffectAnim.id].ios
      : SPEECH_BUBBLE_PRESETS[backgroundEdgeEffectAnim.id].android
    : null;
  const speechTextBoxConfig = isSpeechBgActive
    ? isPortrait
      ? speechPresetPlatform!.fullscreenTextBox.portrait
      : speechPresetPlatform!.fullscreenTextBox.landscape
    : null;
  const speechTextTop = useMemo(
    () =>
      isSpeechBgActive
        ? resolveSpeechTextTopOffset({
            effectId: backgroundEdgeEffectAnim.id,
            isPortrait,
            viewportHeight: windowHeight,
          })
        : null,
    [isSpeechBgActive, backgroundEdgeEffectAnim.id, isPortrait, windowHeight],
  );
  const speechTextContainerStyle: ViewStyle = isSpeechBgActive
    ? {
        position: "absolute",
        width: speechTextBoxConfig!.width,
        height: fullscreenTextMetrics.height,
        ...(speechTextTop != null
          ? { top: speechTextTop }
          : {
              transform: [{ translateY: speechTextBoxConfig!.yOffset }],
            }),
      }
    : {};

  const canvas = usePreviewPanelCanvas({
    displayText,
    translateX,
    onTextLayout,
    previewFontSize: fullscreenTextMetrics.fontSize,
    appearanceFont: font,
    fontWeight,
    letterSpacing,
    lineSpacingPx: effectiveLineSpacing,
    fallbackLayout: { width: windowWidth, height: windowHeight },
    lineHeightRatio: sizingPolicy.fullscreenLineHeightRatio,
  });

  const marqueeSegmentCount = useMemo(
    () =>
      computeMarqueeSegmentCount({
        viewportWidthPx: canvas.skiaCanvasLayout.width,
        textWidthPx: canvas.skiaTextWidth,
        spacerPx: SPACER,
        minSegments: 4,
        maxSegments: 24,
        bufferSegments: isGlowEffect ? 3 : 2,
      }),
    [
      canvas.skiaCanvasLayout.width,
      canvas.skiaTextWidth,
      SPACER,
      isGlowEffect,
    ],
  );

  const handleFullscreenLayout = isSpeechBgActive
    ? undefined
    : canvas.onSkiaCanvasLayout;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      supportedOrientations={["portrait", "landscape"]}
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <StatusBar hidden />
      <View style={styles.root}>
        <View style={styles.layerPassThrough} pointerEvents="box-none">
          <View
            collapsable={false}
            style={[
              styles.flex,
              {
                backgroundColor: hasBgPhoto ? undefined : backgroundColor,
                justifyContent: "flex-start",
                overflow: "hidden",
              },
            ]}
            onLayout={handleFullscreenLayout}
            pointerEvents="box-none"
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
              mode="fullscreen"
            />
            {isSpeechBgActive ? (
              <View
                style={{
                  ...StyleSheet.absoluteFillObject,
                  alignItems: "center",
                  ...(speechTextTop == null ? { justifyContent: "center" } : null),
                }}
                pointerEvents="none"
              >
                <View
                  style={speechTextContainerStyle}
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
                    previewTextColor={textSelectedColor}
                  />
                </View>
              </View>
            ) : (
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
                previewTextColor={textSelectedColor}
              />
            )}
          </View>
        </View>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityLabel="Close fullscreen"
        />
      </View>
    </Modal>
  );
};
