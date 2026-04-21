import { GradientBackdrop } from "@/components/skia/GradientBackdrop";
import {
  GRADIENT_BACKDROP_IDS,
  type GradientBackdropId,
} from "@/constants/gradientBackgroundPresets";
import { glowColorToSkiaRgba } from "@/constants/colorPalette";
import { Image } from "expo-image";
import { BannerConfig } from "@/contexts/settingsContext";
import { useBlinkOpacityStyle } from "@/hooks/useBlinkOpacityStyle";
import { useMarqueeAnimation } from "@/hooks/useMarqueeAnimation";
import { usePreviewPanelCanvas } from "@/hooks/usePreviewPanelCanvas";
import {
    Blur,
    Canvas,
    Group,
    Paint,
    RuntimeShader,
    Skia,
    Text as SkiaText,
} from "@shopify/react-native-skia";
import React, { useMemo } from "react";
import {
    Modal,
    Pressable,
    StatusBar,
    StyleSheet,
    useWindowDimensions,
    View,
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
  const { previewText, playOption } = config.content;
  const {
    font,
    fontSize,
    textSelectedColor,
    lineSpacing,
    fontWeight,
    blurIntensity,
    glowIntensity,
    glowColor,
    effectSelectedItems,
    gradientBackgroundPreset,
    blinkSpeed,
    outLine,
    pixelSize: configPixelSize,
  } = config.appearance;

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
  const { backgroundColor, backgroundImageUri } = config.background;
  const hasBgPhoto =
    backgroundImageUri != null && backgroundImageUri.length > 0;
  const { textMoveSpeed } = config.motion;
  const {
    displayText,
    translateX,
    animatedStyle,
    onTextLayout,
    SPACER,
  } = useMarqueeAnimation({
    text: previewText,
    speed: textMoveSpeed,
    playOption,
  });

  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

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
  const source = Skia.RuntimeEffect.Make(`
    uniform shader content;
    uniform float pixelSize;
  
    half4 main(vec2 pos) {
      // 픽셀 크기에 맞춰 좌표에 격자 형태의 필터
      vec2 p = floor(pos / pixelSize) * pixelSize + (pixelSize / 2.0);
      return content.eval(p);
    }
  `)!;

  const blurShadowStyle = useMemo(() => {
    if (blurIntensity <= 0) return {};
    const amount = 0.1;
    const num = parseInt(textSelectedColor.replace("#", ""), 16);
    const r = num >> 16;
    const g = (num >> 8) & 0x00ff;
    const b = num & 0x0000ff;
    const newR = Math.round(r + (255 - r) * amount);
    const newG = Math.round(g + (255 - g) * amount);
    const newB = Math.round(b + (255 - b) * amount);
    return {
      textShadowColor: `rgb(${newR}, ${newG}, ${newB})`,
      textShadowRadius: blurIntensity,
    };
  }, [textSelectedColor, blurIntensity]);

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
                <Image
                  source={{ uri: backgroundImageUri }}
                  style={StyleSheet.absoluteFill}
                  contentFit="cover"
                />
              ) : null}
              <Canvas style={styles.flex} opaque={false}>
                {showGradientBackdrop ? (
                  <GradientBackdrop
                    key={`gradient-${gradientBackgroundPreset}`}
                    preset={gradientBackgroundPreset as GradientBackdropId}
                    width={canvas.skiaCanvasLayout.width}
                    height={canvas.skiaCanvasLayout.height}
                    opacity={hasBgPhoto ? 0.4 : 1}
                  />
                ) : null}
                <Group
                  opacity={blinkOpacity}
                  transform={canvas.skiaMarqueeTransform}
                  layer={
                    isPixelEffect ? (
                      <Paint>
                        <RuntimeShader
                          source={source}
                          uniforms={{ pixelSize: pixelShaderSize }}
                        />
                      </Paint>
                    ) : undefined
                  }
                >
                  {[...Array(10)].map((_, seg) => {
                    const segment = canvas.skiaTextWidth + SPACER;
                    const baseX = seg * segment;
                    return (
                      <Group key={`marquee-${seg}`}>
                        {isGlowEffect ? (
                          <Group
                            layer={
                              <Paint>
                                <Blur blur={glowBlurRadius} mode="clamp" />
                              </Paint>
                            }
                          >
                            {canvas.skiaGlyphs.map((g, gi) => (
                              <SkiaText
                                key={`glow-${gi}`}
                                x={baseX + g.x}
                                y={g.y}
                                text={g.text}
                                font={canvas.skiaFont}
                                color={glowLayerColor}
                              />
                            ))}
                          </Group>
                        ) : null}
                        {canvas.skiaGlyphs.map((g, gi) => (
                          <Group key={`${seg}-${gi}`}>
                            {skiaStrokeWidth > 0 ? (
                              <SkiaText
                                x={baseX + g.x}
                                y={g.y}
                                text={g.text}
                                font={canvas.skiaFont}
                                color="gray"
                                style="stroke"
                                strokeWidth={skiaStrokeWidth}
                              />
                            ) : null}
                            <SkiaText
                              x={baseX + g.x}
                              y={g.y}
                              text={g.text}
                              font={canvas.skiaFont}
                              color={textSelectedColor}
                            />
                          </Group>
                        ))}
                      </Group>
                    );
                  })}
                </Group>
              </Canvas>
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

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  layerPassThrough: {
    ...StyleSheet.absoluteFillObject,
  },
});
