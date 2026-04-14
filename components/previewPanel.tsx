import { appFontFamilyForText } from "@/constants/appFonts";
import { btnStyles } from "@/constants/btnStyles";
import { glowColorToSkiaRgba } from "@/constants/colorPalette";
import { styles } from "@/constants/styles";
import { useSettings } from "@/contexts/settingsContext";
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
import { LinearGradient as LinearGradientExpo } from "expo-linear-gradient";
import React, { useMemo, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type LayoutEvent = {
  nativeEvent: { layout: { height: number; width: number } };
};

export default function PreviewPanel() {
  const [activePreset, setActivePreset] = useState(0);
  const [previewHeight, setPreviewHeight] = useState(0);
  const { config, handleTextChange, updateConfig } = useSettings();

  const { previewText, playOption } = config.content;
  const {
    font,
    fontSize,
    textSelectedColor,
    outLine,
    lineSpacing,
    fontWeight,
    effectSelectedItems,
    blinkSpeed,
    pixelSize: configPixelSize,
    glowIntensity,
    glowColor,
  } = config.appearance;
  const { backgroundColor } = config.background;
  const { textMoveSpeed } = config.motion;

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
  const pixelShaderSize = isPixelEffect ? Math.max(2, configPixelSize) : 1;
  const skiaStrokeWidth = (outLine / 100) * 24;

  const source = Skia.RuntimeEffect.Make(`
  uniform shader content;
  uniform float pixelSize;

  half4 main(vec2 pos) {
    vec2 p = floor(pos / pixelSize) * pixelSize + (pixelSize / 2.0);
    return content.eval(p);
  }
`)!;

  
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
  });

  const { opacity: blinkOpacity } = useBlinkOpacityStyle(
    effectSelectedItems.includes("Blink"),
    blinkSpeed,
  );

  const onPreviewLayout = (e: LayoutEvent) => {
    setPreviewHeight(e.nativeEvent.layout.height);
    onContainerLayout(e);
  };

  //입력창에 보이는 텍스트
  const getDisplayText = (text: string) => {
    if (!text) return "";
    const cleanText = text.replace(/↵/g, "");
    return playOption === "multi"
      ? cleanText.replace(/\n/g, "\↵\n")
      : cleanText;
  };

  // ↵ 기호 제거 및 줄바꿈 처리
  // 입력창에서 텍스트 변경 시 ↵ 기호 제거 및 줄바꿈 처리
  const handleTextChangeWithIcon = (e: string) => {
    const rawText = e.replace(/↵/g, "");
    handleTextChange(rawText);// previewText에는 \n만 붙임
  };

  const setPreviewText = (text: string) =>
    updateConfig("content", { previewText: text });

  return (
    <View style={styles.previewContainer}>

      <View
        collapsable={false}
        style={[
          styles.preview,
          {
            justifyContent: "center",
            backgroundColor,
          },
        ]}
        onLayout={onPreviewLayout}
      >
        <View
          style={StyleSheet.absoluteFill}
          onLayout={canvas.onSkiaCanvasLayout}
        >
          <Canvas style={{ flex: 1 }}>
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
              {[...Array(5)].map((_, seg) => {
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
                          color={previewTextColor}
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

      <View style={styles.presetButtonsContainer}>
        {[1, 2, 3, 4, 5].map((num, index) => (
          <TouchableOpacity
            key={index}
            style={
              index === activePreset
                ? btnStyles.presetButtonActive
                : btnStyles.presetButton
            }
            onPress={() => setActivePreset(index)}
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
      {/* contents input container */}
      <View id="contentsInputContainer" style={styles.contentsInputContainer}>
        <TextInput
          editable
          multiline
          numberOfLines={3}
          style={[
            styles.contentsInput,
            {
              fontFamily: appFontFamilyForText(
                font,
                fontWeight === "bold" ? "bold" : "normal",
              ),
            },
          ]}
          placeholder="Enter your text here"
          value={getDisplayText(previewText)}
          onChangeText={handleTextChangeWithIcon}
          textAlignVertical="top"
        />
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
