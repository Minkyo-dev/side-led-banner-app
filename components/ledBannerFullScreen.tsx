import { BackgroundEffectLayer } from "@/components/animation/BackgroundEffectLayer";
import { MarqueeCanvas } from "@/components/animation/MarqueeCanvas";
import { PixelatedBackgroundImage } from "@/components/animation/PixelBackgroundImage";
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

  const {
    backgroundColor,
    backgroundImageUri,
    backgroundBlur,
    backgroundPixelSize,
  } = config.background;

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

  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const isPortrait = windowHeight >= windowWidth;

  const isSpeechBgActive =
    backgroundEdgeEffectAnim.id === "speechBg1" ||
    backgroundEdgeEffectAnim.id === "speechBg2";
  const speechPresetPlatform = isSpeechBgActive
    ? Platform.OS === "ios"
      ? SPEECH_BUBBLE_PRESETS[backgroundEdgeEffectAnim.id].ios
      : SPEECH_BUBBLE_PRESETS[backgroundEdgeEffectAnim.id].android
    : null;
  const speechTextContainerStyle: ViewStyle = isSpeechBgActive
    ? isPortrait
      ? speechPresetPlatform!.fullscreenTextBox.portrait
      : speechPresetPlatform!.fullscreenTextBox.landscape
    : {};

  const canvas = usePreviewPanelCanvas({
    displayText,
    translateX,
    onTextLayout,
    previewFontSize: fontSize,
    appearanceFont: font,
    fontWeight,
    letterSpacing: lineSpacing,
    fallbackLayout: { width: windowWidth, height: windowHeight },
  });

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
            onLayout={canvas.onSkiaCanvasLayout}
            pointerEvents="box-none"
          >
            {hasBgPhoto ? (
              <PixelatedBackgroundImage
                uri={backgroundImageUri}
                pixelSize={backgroundPixelSize}
                blurRadius={backgroundBlur / 3}
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
                  position: "absolute",
                  alignSelf: "center",
                  top: 0,
                  ...speechTextContainerStyle,
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
                  segmentCount={10}
                  spacer={SPACER}
                  isGlowEffect={isGlowEffect}
                  glowBlurRadius={glowBlurRadius}
                  glowLayerColor={glowLayerColor}
                  skiaStrokeWidth={skiaStrokeWidth}
                  dropShadow={dropShadow}
                  previewTextColor={textSelectedColor}
                />
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
                segmentCount={10}
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
