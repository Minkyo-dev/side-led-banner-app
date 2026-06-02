import { BackgroundEffectLayer } from "@/components/animation/BackgroundEffectLayer";
import { MarqueeCanvas } from "@/components/animation/MarqueeCanvas";
import { ledBannerFullScreenStyles as styles } from "@/constants/styles";
import { BannerConfig } from "@/contexts/settingsContext";
import { useBackgroundAnimation } from "@/hooks/useBackgroundAnimation";
import { useBlinkOpacityStyle } from "@/hooks/useBlinkOpacityStyle";
import { useEffects } from "@/hooks/useEffects";
import { useMarqueeAnimation } from "@/hooks/useMarqueeAnimation";
import { usePreviewPanelCanvas } from "@/hooks/usePreviewPanelCanvas";
import {
    resolveSpeechCanvasFallback,
    useSpeechBubble,
} from "@/hooks/useSpeechBubble";
import { useTextMetrics } from "@/hooks/useTextMetrics";
import { resolveBubbleCanvasOpts } from "@/utils/skiaBubbleTextLayout";
import { getSizingPolicy } from "@/utils/textSizing";
import { Image } from "expo-image";
import React, { useCallback, useMemo, useState } from "react";
import {
    Modal,
    Pressable,
    StatusBar,
    StyleSheet,
    useWindowDimensions,
    View,
} from "react-native";
import { buildCanvas } from "./animation/buildCanvas";
import { buildPixelBackground } from "./animation/buildPixelBackground";
import { PixelBackgroundCanvas } from "./animation/PixelBackgroundCanvas";

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
    pixelColorMix,
  } = config.appearance;

  const { backgroundColor, backgroundImageUri, backgroundBlur } =
    config.background;

  const { textMoveSpeed } = config.motion;
  const hasBgPhoto =
    backgroundImageUri != null && backgroundImageUri.length > 0;

  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
  const stageWidth = stageSize.width > 0 ? stageSize.width : windowWidth;
  const stageHeight = stageSize.height > 0 ? stageSize.height : windowHeight;
  const isPortrait = stageHeight >= stageWidth;

  const onStageLayout = useCallback(
    (e: { nativeEvent: { layout: { width: number; height: number } } }) => {
      const { width, height } = e.nativeEvent.layout;
      setStageSize((prev) =>
        prev.width === width && prev.height === height ? prev : { width, height },
      );
    },
    [],
  );

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
    basisWidthPx: stageWidth,
    viewportHeight: stageHeight,
  });

  const {
    effectiveLineSpacing,
    previewFontSize,
    marqueeReferenceFontSize,
    fullscreenLineHeightRatio,
  } = useTextMetrics({
    mode: "fullscreen",
    text: previewText,
    fontSize,
    lineSpacing,
    playOption,
    sizingPolicy,
    isSpeechBgActive: speechBubble.isActive,
    speechMaxHeight: speechBubble.maxTextHeight,
    windowWidth: stageWidth,
    windowHeight: stageHeight,
    isPortrait,
    appearanceFont: font,
    fontWeight,
  });

  const effects = useEffects({
    effectSelectedItems,
    gradientBackgroundPreset,
    outLine,
    glowIntensity,
    glowColor,
    dropShadow,
    pixelColorMix,
    playOption,
    fontSizePx: previewFontSize,
  });

  const speechBubbleCanvasLayout = useMemo(
    () =>
      resolveBubbleCanvasOpts({
        isSpeechActive: speechBubble.isActive,
        isPixelEffect: effects.isPixelEffect,
        pixelShaderSize: effects.pixelShaderSize,
        speechBubbleId: sizingPolicy.speechBubbleId,
      }),
    [
      speechBubble.isActive,
      effects.isPixelEffect,
      effects.pixelShaderSize,
      sizingPolicy.speechBubbleId,
    ],
  );

  const marqueeViewportWidthPx =
    speechBubble.speechBoxPx?.widthPx ?? stageWidth;

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

  const { opacity: blinkOpacity } = useBlinkOpacityStyle(
    effectSelectedItems.includes("Blink"),
    blinkSpeed,
  );

  const canvasFallback = useMemo(
    () =>
      resolveSpeechCanvasFallback(speechBubble.speechBoxPx, {
        width: stageWidth,
        height: stageHeight,
      }),
    [speechBubble.speechBoxPx, stageWidth, stageHeight],
  );

  const canvas = usePreviewPanelCanvas({
    displayText,
    translateX,
    onTextLayout,
    previewFontSize,
    marqueeReferenceFontSize,
    appearanceFont: font,
    appearanceFontOverride: effects.pixelSkiaFontOverride,
    fontWeight,
    letterSpacing,
    lineSpacingPx: effectiveLineSpacing,
    fallbackLayout: canvasFallback,
    lineHeightRatio: fullscreenLineHeightRatio,
    playOption,
    speechBubbleLayout: speechBubbleCanvasLayout,
  });

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
        width: stageWidth,
        height: stageHeight,
        effects,
        hasBgPhoto,
        backgroundColor,
        backgroundImageUri: backgroundImageUri ?? null,
        gradientBackgroundPreset,
        backgroundEffect: backgroundEdgeEffectAnim,
        translateX,
        isPortrait,
        mode: "fullscreen",
      }),
    [
      stageWidth,
      stageHeight,
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

  return (
    <Modal
      visible={visible}
      animationType="fade"
      presentationStyle="fullScreen"
      supportedOrientations={["portrait", "landscape"]}
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}
    >
      <StatusBar hidden />
      <View style={styles.root} onLayout={onStageLayout}>
        <View style={styles.layerPassThrough} pointerEvents="box-none">
          <View
            collapsable={false}
            style={[
              styles.flex,
              {
                backgroundColor:
                  hasBgPhoto || effects.isPixelEffect
                    ? undefined
                    : backgroundColor,
                justifyContent: "flex-start",
                overflow: "hidden",
              },
            ]}
            pointerEvents="box-none"
          >
            {hasBgPhoto && !effects.isPixelEffect ? (
              <Image
                source={{ uri: backgroundImageUri }}
                style={StyleSheet.absoluteFill}
                contentFit="cover"
                blurRadius={backgroundBlur / 8}
              />
            ) : null}
            {effects.isPixelEffect ? (
              <PixelBackgroundCanvas {...pixelBackgroundProps} />
            ) : null}
            <BackgroundEffectLayer
              effect={backgroundEdgeEffectAnim}
              translateX={translateX}
              isPortrait={isPortrait}
              mode="fullscreen"
              suppressPixelManagedBackgrounds={effects.isPixelEffect}
            />
            {speechBubble.isActive ? (
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
