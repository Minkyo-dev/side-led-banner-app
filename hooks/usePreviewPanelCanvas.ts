import type { SkFont } from "@shopify/react-native-skia";
import { useEffect, useMemo, useState } from "react";
import { LayoutChangeEvent } from "react-native";
import type { SharedValue } from "react-native-reanimated";
import { useDerivedValue } from "react-native-reanimated";

import { useSkiaAppearanceFont } from "@/hooks/useSkiaAppearanceFont";

type TextLayoutEvent = {
  nativeEvent: { lines: { width: number }[] };
};

function measureSkiaLineWidth(
  font: SkFont,
  text: string,
  letterSpacing: number,
): number {
  if (text.length === 0) return 0;
  let w = 0;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]!;
    w += font.measureText(ch).width;
    if (i < text.length - 1) w += letterSpacing;
  }
  return w;
}

function skiaGlyphLayouts(
  font: SkFont,
  text: string,
  letterSpacing: number,
): { x: number; text: string }[] {
  if (text.length === 0) return [];
  let x = 0;
  const out: { x: number; text: string }[] = [];
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]!;
    out.push({ x, text: ch });
    x += font.measureText(ch).width + (i < text.length - 1 ? letterSpacing : 0);
  }
  return out;
}

/** PreviewPanel 기본 줄 간격 */
const DEFAULT_LINE_HEIGHT_RATIO = 1.2;

function layoutMultilineSkiaGlyphs(
  font: SkFont,
  displayText: string,
  letterSpacing: number,
  previewFontSize: number,
  canvasHeight: number,
  lineHeightRatio: number,
): { x: number; y: number; text: string }[] {
  const lines = displayText.split("\n");
  const lineHeightPx = previewFontSize * lineHeightRatio;
  const m = font.getMetrics();
  const verticalCenterOffset = (m.ascent + m.descent) / 2;
  const n = lines.length;

  const out: { x: number; y: number; text: string }[] = [];
  for (let lineIndex = 0; lineIndex < n; lineIndex++) {
    const line = lines[lineIndex]!;
    const baselineY =
      canvasHeight / 2 +
      (lineIndex - (n - 1) / 2) * lineHeightPx -
      verticalCenterOffset;

    const row = skiaGlyphLayouts(font, line, letterSpacing);
    for (const g of row) {
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
  fallbackLayout,
  lineHeightRatio = DEFAULT_LINE_HEIGHT_RATIO,
}: UsePreviewPanelCanvasParams) {
  const skiaFont = useSkiaAppearanceFont(
    appearanceFont,
    fontWeight,
    previewFontSize,
  );

  const skiaTextWidth = useMemo(() => {
    if (!skiaFont) return 0;
    const lines = displayText.split("\n");
    let maxW = 0;
    for (const line of lines) {
      maxW = Math.max(
        maxW,
        measureSkiaLineWidth(skiaFont, line, letterSpacing),
      );
    }
    return maxW;
  }, [displayText, skiaFont, letterSpacing]);

  const [skiaCanvasLayout, setSkiaCanvasLayout] = useState({
    width: 0,
    height: 0,
  });

  const fbW = fallbackLayout?.width ?? 0;
  const fbH = fallbackLayout?.height ?? 0;
  const drawW = skiaCanvasLayout.width > 0 ? skiaCanvasLayout.width : fbW;
  const drawH = skiaCanvasLayout.height > 0 ? skiaCanvasLayout.height : fbH;

  const skiaGlyphs = useMemo(() => {
    if (!skiaFont || drawH <= 0) return [];
    return layoutMultilineSkiaGlyphs(
      skiaFont,
      displayText,
      letterSpacing,
      previewFontSize,
      drawH,
      lineHeightRatio,
    );
  }, [
    displayText,
    skiaFont,
    letterSpacing,
    previewFontSize,
    drawH,
    lineHeightRatio,
  ]);

  const skiaMarqueeTransform = useDerivedValue(() => [
    { translateX: translateX.value },
  ]);

  /** RN `Text` 없이 Skia만 쓸 때도 `useMarqueeAnimation`의 `textWidth`가 갱신되도록 동기화 */
  useEffect(() => {
    if (!skiaFont) return;
    const lines = displayText.split("\n");
    const lineWidths = lines.map((line) =>
      measureSkiaLineWidth(skiaFont, line, letterSpacing),
    );
    const maxLineWidth = lineWidths.length > 0 ? Math.max(...lineWidths) : 0;
    if (maxLineWidth <= 0) return;
    onTextLayout({
      nativeEvent: { lines: lineWidths.map((w) => ({ width: w })) },
    });
  }, [skiaFont, displayText, letterSpacing, onTextLayout]);

  const onSkiaCanvasLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setSkiaCanvasLayout({ width, height });
  };

  return {
    skiaFont,
    skiaTextWidth,
    skiaGlyphs,
    skiaMarqueeTransform,
    /** 글리프·그라데이션에 쓸 실제 그리기 크기 (fallback 반영) */
    skiaCanvasLayout: { width: drawW, height: drawH },
    onSkiaCanvasLayout,
  };
}
