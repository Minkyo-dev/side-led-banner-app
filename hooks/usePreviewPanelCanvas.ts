import type { SkFont, SkTextBlob } from "@shopify/react-native-skia";
import { useEffect, useMemo, useState } from "react";
import { LayoutChangeEvent } from "react-native";
import type { SharedValue } from "react-native-reanimated";
import { useDerivedValue } from "react-native-reanimated";

import { useSkiaAppearanceFont } from "@/hooks/useSkiaAppearanceFont";
import { buildMarqueeTextBlob } from "@/utils/buildMarqueeTextBlob";
import {
  bubbleGlyphs,
  bubbleLayouts,
  bubbleRows,
  BUBBLE_MAX_ROWS,
  BUBBLE_SAFE,
  type BubbleCanvasOpts,
} from "@/utils/skiaBubbleTextLayout";

type TextLayoutEvent = {
  nativeEvent: { lines: { width: number }[] };
};

type SkiaLineGlyphLayout = { x: number; text: string };
type SkiaLineLayout = { width: number; glyphs: SkiaLineGlyphLayout[] };

function layoutSkiaLine(
  font: SkFont,
  text: string,
  letterSpacing: number,
): SkiaLineLayout {
  if (text.length === 0) return { width: 0, glyphs: [] };
  let x = 0;
  const glyphs: SkiaLineGlyphLayout[] = [];
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]!;
    glyphs.push({ x, text: ch });
    const adv =
      font.measureText(ch).width + (i < text.length - 1 ? letterSpacing : 0);
    x += adv;
  }
  return { width: x, glyphs };
}

const DEFAULT_LINE_HEIGHT_RATIO = 1.2;

function lineLayoutsToGlyphs(
  font: SkFont,
  lineLayouts: SkiaLineLayout[],
  previewFontSize: number,
  canvasHeight: number,
  lineHeightRatio: number,
): { x: number; y: number; text: string }[] {
  const lineHeightPx = previewFontSize * lineHeightRatio;
  const m = font.getMetrics();
  const verticalCenterOffset = (m.ascent + m.descent) / 2;
  const n = lineLayouts.length;

  const out: { x: number; y: number; text: string }[] = [];
  for (let lineIndex = 0; lineIndex < n; lineIndex++) {
    const baselineY =
      canvasHeight / 2 +
      (lineIndex - (n - 1) / 2) * lineHeightPx -
      verticalCenterOffset;

    for (const g of lineLayouts[lineIndex]!.glyphs) {
      out.push({ x: g.x, y: baselineY, text: g.text });
    }
  }
  return out;
}

export interface UsePreviewPanelCanvasParams {
  displayText: string;
  translateX: SharedValue<number>;
  onTextLayout: (e: TextLayoutEvent) => void;
  previewFontSize: number;
  appearanceFont: string;
  fontWeight: "normal" | "bold" | string;
  letterSpacing: number;
  lineSpacingPx?: number;
  fallbackLayout?: { width: number; height: number };
  lineHeightRatio?: number;
  speechBubbleLayout?: BubbleCanvasOpts | null;
  playOption?: "one" | "multi";
}

export { BUBBLE_MAX_ROWS, BUBBLE_SAFE } from "@/utils/skiaBubbleTextLayout";

export function usePreviewPanelCanvas({
  displayText,
  translateX,
  onTextLayout,
  previewFontSize,
  appearanceFont,
  fontWeight,
  letterSpacing,
  lineSpacingPx,
  fallbackLayout,
  lineHeightRatio = DEFAULT_LINE_HEIGHT_RATIO,
  speechBubbleLayout = null,
  playOption = "multi",
}: UsePreviewPanelCanvasParams) {
  const skiaFont = useSkiaAppearanceFont(
    appearanceFont,
    fontWeight,
    previewFontSize,
  );

  const [skiaCanvasLayout, setSkiaCanvasLayout] = useState({
    width: 0,
    height: 0,
  });

  const hasCanvasLayout =
    skiaCanvasLayout.width > 0 && skiaCanvasLayout.height > 0;
  const fbW = fallbackLayout?.width ?? 0;
  const fbH = fallbackLayout?.height ?? 0;
  const drawW = hasCanvasLayout ? skiaCanvasLayout.width : fbW;
  const drawH = hasCanvasLayout ? skiaCanvasLayout.height : fbH;

  const useBubbleLayout =
    speechBubbleLayout != null && hasCanvasLayout;

  const skiaLineLayouts = useMemo((): SkiaLineLayout[] | null => {
    if (!skiaFont) return null;

    const rows = bubbleRows({
      text: displayText,
      maxRows: speechBubbleLayout?.maxRows ?? BUBBLE_MAX_ROWS,
      playOption,
    });

    if (useBubbleLayout) {
      return bubbleLayouts(skiaFont, rows, letterSpacing);
    }

    return rows.map((line) => layoutSkiaLine(skiaFont, line, letterSpacing));
  }, [
    displayText,
    skiaFont,
    letterSpacing,
    useBubbleLayout,
    speechBubbleLayout,
    playOption,
  ]);

  const skiaTextWidth = useMemo(() => {
    if (!skiaLineLayouts || skiaLineLayouts.length === 0) return 0;
    let maxW = 0;
    for (const row of skiaLineLayouts) {
      maxW = Math.max(maxW, row.width);
    }
    return maxW;
  }, [skiaLineLayouts]);

  const resolvedLineHeightRatio =
    lineSpacingPx != null
      ? lineHeightRatio + lineSpacingPx / Math.max(1, previewFontSize)
      : lineHeightRatio;

  const skiaTextBlob = useMemo((): SkTextBlob | null => {
    if (!skiaFont || !skiaLineLayouts || drawH <= 0) return null;

    const glyphPositions = useBubbleLayout
      ? bubbleGlyphs({
          font: skiaFont,
          rows: skiaLineLayouts,
          frameWidth: drawW,
          frameHeight: drawH,
          safeWRatio:
            speechBubbleLayout!.safeWRatio ?? BUBBLE_SAFE.widthRatio,
          lineGapPx: lineSpacingPx,
        })
      : lineLayoutsToGlyphs(
          skiaFont,
          skiaLineLayouts,
          previewFontSize,
          drawH,
          resolvedLineHeightRatio,
        );

    return buildMarqueeTextBlob(skiaFont, glyphPositions);
  }, [
    skiaFont,
    skiaLineLayouts,
    previewFontSize,
    drawH,
    drawW,
    resolvedLineHeightRatio,
    useBubbleLayout,
    speechBubbleLayout,
    lineSpacingPx,
  ]);

  const skiaMarqueeTransform = useDerivedValue(() => [
    { translateX: translateX.value },
  ]);

  useEffect(() => {
    if (!skiaLineLayouts || skiaLineLayouts.length === 0) return;
    const lineWidths = skiaLineLayouts.map((row) => row.width);
    const maxLineWidth = Math.max(...lineWidths);
    if (maxLineWidth <= 0) return;
    onTextLayout({
      nativeEvent: { lines: lineWidths.map((w) => ({ width: w })) },
    });
  }, [skiaLineLayouts, onTextLayout]);

  const onSkiaCanvasLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setSkiaCanvasLayout({ width, height });
  };

  return {
    skiaFont,
    skiaTextWidth,
    skiaTextBlob,
    skiaMarqueeTransform,
    skiaCanvasLayout: { width: drawW, height: drawH },
    onSkiaCanvasLayout,
  };
}
