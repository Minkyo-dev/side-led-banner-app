import type { SkFont, SkTextBlob } from "@shopify/react-native-skia";
import { useEffect, useMemo, useState } from "react";
import { LayoutChangeEvent } from "react-native";
import type { SharedValue } from "react-native-reanimated";
import { useDerivedValue } from "react-native-reanimated";

import { useSkiaAppearanceFont } from "@/hooks/useSkiaAppearanceFont";
import { buildMarqueeTextBlob } from "@/utils/buildMarqueeTextBlob";

type TextLayoutEvent = {
  nativeEvent: { lines: { width: number }[] };
};

type SkiaLineGlyphLayout = { x: number; text: string };
type SkiaLineLayout = { width: number; glyphs: SkiaLineGlyphLayout[] };

/** 한 줄짜리 글자 위치(가로)랑 그 줄 너비를 잡기 */
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

/** PreviewPanel 기본 줄 간격 */
const DEFAULT_LINE_HEIGHT_RATIO = 1.2;

/** 다중 줄일 때 줄마다 세로 위치(y)까지 붙임 */
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
  /** settings `appearance.font` (e.g. nanum_gothic) */
  appearanceFont: string;
  fontWeight: "normal" | "bold" | string;
  letterSpacing: number;
  lineSpacingPx?: number;
  /**
   * 글리프·그라데이션 크기 보정용
   */
  fallbackLayout?: { width: number; height: number };
  lineHeightRatio?: number;
}

/**
 * PreviewPanel의 Skia `Canvas` 마퀴: 폰트·폭·세로 정렬·`translateX` 동기화.
 */
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
}: UsePreviewPanelCanvasParams) {
  const skiaFont = useSkiaAppearanceFont(
    appearanceFont,
    fontWeight,
    previewFontSize,
  );

  /** 글 넣을 때 줄마다 한 번씩만 미리 계산 */
  const skiaLineLayouts = useMemo((): SkiaLineLayout[] | null => {
    if (!skiaFont) return null;
    return displayText
      .split("\n")
      .map((line) => layoutSkiaLine(skiaFont, line, letterSpacing));
  }, [displayText, skiaFont, letterSpacing]);

  const skiaTextWidth = useMemo(() => {
    if (!skiaLineLayouts || skiaLineLayouts.length === 0) return 0;
    let maxW = 0;
    for (const row of skiaLineLayouts) {
      maxW = Math.max(maxW, row.width);
    }
    return maxW;
  }, [skiaLineLayouts]);

  const [skiaCanvasLayout, setSkiaCanvasLayout] = useState({
    width: 0,
    height: 0,
  });

  const fbW = fallbackLayout?.width ?? 0;
  const fbH = fallbackLayout?.height ?? 0;
  const drawW = skiaCanvasLayout.width > 0 ? skiaCanvasLayout.width : fbW;
  const drawH = skiaCanvasLayout.height > 0 ? skiaCanvasLayout.height : fbH;
  const resolvedLineHeightRatio =
    lineSpacingPx != null
      ? lineHeightRatio + lineSpacingPx / Math.max(1, previewFontSize)
      : lineHeightRatio;

  const skiaTextBlob = useMemo((): SkTextBlob | null => {
    if (!skiaFont || !skiaLineLayouts || drawH <= 0) return null;
    const glyphPositions = lineLayoutsToGlyphs(
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
    resolvedLineHeightRatio,
  ]);

  const skiaMarqueeTransform = useDerivedValue(() => [
    { translateX: translateX.value },
  ]);

  /** Skia만 쓸 때도 `useMarqueeAnimation`의 `textWidth`가 갱신되도록 동기화 */
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
