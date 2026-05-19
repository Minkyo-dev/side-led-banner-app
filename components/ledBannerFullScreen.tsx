import { BackgroundEffectLayer } from "@/components/animation/BackgroundEffectLayer";
import { MarqueeCanvas } from "@/components/animation/MarqueeCanvas";
import { ledBannerFullScreenStyles as styles } from "@/constants/styles";
import { BannerConfig } from "@/contexts/settingsContext";
import { useBackgroundEffectAnimation } from "@/hooks/useBackgroundEffectAnimation";
import { useEffects } from "@/hooks/useEffects";
import { useBlinkOpacityStyle } from "@/hooks/useBlinkOpacityStyle";
import { useTextMetrics } from "@/hooks/useTextMetrics";
import { useMarqueeAnimation } from "@/hooks/useMarqueeAnimation";
import { usePreviewPanelCanvas } from "@/hooks/usePreviewPanelCanvas";
import {
  resolveSpeechCanvasFallback,
  useSpeechBubble,
} from "@/hooks/useSpeechBubble";
import { getSizingPolicy } from "@/utils/textSizing";
import { Image } from "expo-image";
import React, { useMemo } from "react";
import {
  Modal,
  Pressable,
  StatusBar,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { buildCanvas } from "./animation/buildCanvas";

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

  const { textMoveSpeed } = config.motion;
  const hasBgPhoto =
    backgroundImageUri != null && backgroundImageUri.length > 0;

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
    basisWidthPx: windowWidth,
    viewportHeight: windowHeight,
  });

  const marqueeViewportWidthPx =
    speechBubble.speechBoxPx?.widthPx ?? windowWidth;

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

  const {
    effectiveLineSpacing,
    previewFontSize,
    marqueeReferenceFontSize,
    fullscreenLineHeightRatio,
  } = useTextMetrics({
    mode: "fullscreen",
    text: displayText,
    fontSize,
    lineSpacing,
    playOption,
    sizingPolicy,
    isSpeechBgActive: speechBubble.isActive,
    speechMaxHeight: speechBubble.maxTextHeight,
    windowWidth,
    windowHeight,
    isPortrait,
  });

  const canvasFallback = useMemo(
    () =>
      resolveSpeechCanvasFallback(speechBubble.speechBoxPx, {
        width: windowWidth,
        height: windowHeight,
      }),
    [speechBubble.speechBoxPx, windowWidth, windowHeight],
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
    lineHeightRatio: fullscreenLineHeightRatio,
    playOption,
    speechBubbleLayout: speechBubble.isActive ? {} : null,
  });

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

  const handleFullscreenLayout = speechBubble.isActive
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
                  <MarqueeCanvas {...marqueeCanvasProps} />
                </View>
              </View>
            ) : (
              <MarqueeCanvas {...marqueeCanvasProps} />
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
