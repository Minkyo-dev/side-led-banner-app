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
import React, { useLayoutEffect, useMemo, useRef, useState } from "react";
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


const INTENTIONAL_NEWLINE_MARKER = "↵";


function formatMultiLineInputDisplay(stored: string): string {
  const clean = stored.replace(/↵/g, "");
  return clean.replace(/\n/g, `${INTENTIONAL_NEWLINE_MARKER}\n`);
}

function stripMarkersForStorage(s: string): string {
  const M = INTENTIONAL_NEWLINE_MARKER;
  const withoutOrphanMarker = s.replace(
    new RegExp(`${M}(?!\\n)`, "g"),
    "",
  );
  return withoutOrphanMarker.split(M).join("");
}

function storageIndexToDisplayIndex(stored: string, storageIdx: number): number {
  const prefix = stored.slice(0, storageIdx);
  return storageIdx + (prefix.match(/\n/g) || []).length;
}


function mergeWhenOnlyMarkerBeforeNewlineRemoved(
  prevDisplay: string,
  newInput: string,
): { text: string; cursorInMerged?: number } {
  if (newInput.length >= prevDisplay.length) return { text: newInput };
  for (let i = 0; i < prevDisplay.length; i++) {
    const oneRemoved =
      prevDisplay.slice(0, i) + prevDisplay.slice(i + 1);
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
  const [activePreset, setActivePreset] = useState(0);
  const [previewHeight, setPreviewHeight] = useState(0);
  const [pendingSelection, setPendingSelection] = useState<
    { start: number; end: number } | undefined
  >(undefined);
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

  const getDisplayText = (text: string) => {
    if (!text) return "";
    return playOption === "multi"
      ? formatMultiLineInputDisplay(text)
      : text.replace(/\u21B5/g, "");
  };

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
    const forStorage = stripMarkersForStorage(working);
    handleTextChange(forStorage);

    if (playOption === "multi" && merged.cursorInMerged !== undefined) {
      const storageIdx = stripMarkersForStorage(
        working.slice(0, merged.cursorInMerged),
      ).length;
      const displayIdx = storageIndexToDisplayIndex(forStorage, storageIdx);
      setPendingSelection({ start: displayIdx, end: displayIdx });
    }
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
          selection={pendingSelection}
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
