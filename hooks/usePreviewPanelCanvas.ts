import type { SkFont, SkTextBlob } from "@shopify/react-native-skia";
import { useFont } from "@shopify/react-native-skia";
import { useEffect, useMemo, useState } from "react";
import { LayoutChangeEvent } from "react-native";
import type { SharedValue } from "react-native-reanimated";
import { useDerivedValue, useSharedValue } from "react-native-reanimated";

import { useSettings } from "@/contexts/settingsContext";
import { useSkiaAppearanceFont } from "@/hooks/useSkiaAppearanceFont";
import {
  buildMarqueeTextBlob,
  buildMarqueeTextBlobs,
} from "@/utils/buildMarqueeTextBlob";
import {
  BUBBLE_MAX_ROWS,
  BUBBLE_SAFE,
  bubbleGlyphs,
  bubbleLayouts,
  bubbleRows,
  type BubbleCanvasOpts,
} from "@/utils/skiaBubbleTextLayout";

type TextLayoutEvent = {
  nativeEvent: { lines: { width: number }[] };
};

type SkiaLineGlyphLayout = { x: number; text: string };
type SkiaLineLayout = { width: number; glyphs: SkiaLineGlyphLayout[] };

/** CJK문자 판별하는 용  */
function isCJKChar(ch: string): boolean {
  const code = ch.codePointAt(0) ?? 0;
  return (
    (code >= 0x4e00 && code <= 0x9fff) ||
    (code >= 0x3400 && code <= 0x4dbf) ||
    (code >= 0x20000 && code <= 0x2a6df) ||
    (code >= 0xf900 && code <= 0xfaff)
  );
}

function layoutSkiaLine(
  font: SkFont,
  text: string,
  letterSpacing: number,
  getCharFont?: (ch: string) => SkFont,
): SkiaLineLayout {
  if (text.length === 0) return { width: 0, glyphs: [] };
  let x = 0;
  const glyphs: SkiaLineGlyphLayout[] = [];
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]!;
    glyphs.push({ x, text: ch });
    const charFont = getCharFont ? getCharFont(ch) : font;
    const adv =
      charFont.measureText(ch).width + (i < text.length - 1 ? letterSpacing : 0);
    x += adv;
  }
  return { width: x, glyphs };
}

/** 마퀴 타일은 텍스트 너비 기준(고정). 프레임 가운데 정렬 x는 별도 오프셋으로 복원합니다. */
function normalizeGlyphsForMarquee(
  glyphs: { x: number; y: number; text: string }[],
): { glyphs: { x: number; y: number; text: string }[]; offsetX: number } {
  if (glyphs.length === 0) return { glyphs, offsetX: 0 };
  const minX = Math.min(...glyphs.map((g) => g.x));
  if (minX === 0) return { glyphs, offsetX: 0 };
  return {
    offsetX: minX,
    glyphs: glyphs.map((g) => ({ ...g, x: g.x - minX })),
  };
}

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
  appearanceFontOverride?: string | null;
  lineSpacingPx?: number;
  fallbackLayout?: { width: number; height: number };
  lineHeightRatio?: number;
  speechBubbleLayout?: BubbleCanvasOpts | null;
  isPixelMode?: boolean;
}

const ARK_PIXEL_CN_ASSET = require("@/assets/fonts/ark_pixel_16px/ArkPixel16px-zhHans.ttf");
const ARK_PIXEL_TW_ASSET = require("@/assets/fonts/ark_pixel_16px/ArkPixel16px-zhHant.ttf");

/** CJKFont선택용 */
function pickBestCJKFont(
  ch: string,
  cnFont: SkFont | null,
  twFont: SkFont | null,
  fallback: SkFont,
): SkFont {
  if (!isCJKChar(ch)) return fallback;
  if (cnFont) {
    const ids = cnFont.getGlyphIDs(ch, 1);
    if (ids.length > 0 && ids[0] !== 0) return cnFont;
  }
  if (twFont) {
    const ids = twFont.getGlyphIDs(ch, 1);
    if (ids.length > 0 && ids[0] !== 0) return twFont;
  }
  return fallback;
}

export function usePreviewPanelCanvas({
  displayText,
  translateX,
  onTextLayout,
  previewFontSize,
  appearanceFontOverride,
  lineSpacingPx,
  fallbackLayout,
  lineHeightRatio = 1.2,
  speechBubbleLayout = null,
  isPixelMode = false,
}: UsePreviewPanelCanvasParams) {
  const { config } = useSettings();
  const { font: appearanceFont, fontWeight, letterSpacing } = config.appearance;
  const { playOption } = config.content;
  const skiaAppearanceFont = appearanceFontOverride ?? appearanceFont;
  const skiaFont = useSkiaAppearanceFont(
    skiaAppearanceFont,
    fontWeight,
    previewFontSize,
  );
  const arkPixelCNFont = useFont(isPixelMode ? ARK_PIXEL_CN_ASSET : null, previewFontSize);
  const arkPixelTWFont = useFont(isPixelMode ? ARK_PIXEL_TW_ASSET : null, previewFontSize);

  const [skiaCanvasLayout, setSkiaCanvasLayout] = useState({
    width: 0,
    height: 0,
  });

  // 말풍선 ON/OFF 시 onLayout이 다른 View로 옮겨져 재측정이 안 될 수 있음 → stale 높이로 위쪽 붙음
  useEffect(() => {
    setSkiaCanvasLayout({ width: 0, height: 0 });
  }, [speechBubbleLayout != null]);

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

    const getCharFont =
      isPixelMode && (arkPixelCNFont || arkPixelTWFont)
        ? (ch: string): SkFont =>
            pickBestCJKFont(ch, arkPixelCNFont, arkPixelTWFont, skiaFont)
        : undefined;

    return rows.map((line) => layoutSkiaLine(skiaFont, line, letterSpacing, getCharFont));
  }, [
    displayText,
    skiaFont,
    letterSpacing,
    useBubbleLayout,
    speechBubbleLayout,
    playOption,
    isPixelMode,
    arkPixelCNFont,
    arkPixelTWFont,
  ]);

  const resolvedLineHeightRatio =
    lineSpacingPx != null
      ? lineHeightRatio + lineSpacingPx / Math.max(1, previewFontSize)
      : lineHeightRatio;

  const marqueePeriodPx = useMemo(() => {
    if (!skiaLineLayouts || skiaLineLayouts.length === 0) return 0;
    const rawWidth = skiaLineLayouts.reduce((max, row) => Math.max(max, row.width), 0);
    return drawW > 0 ? Math.max(rawWidth, drawW) : rawWidth;
  }, [skiaLineLayouts, drawW]);

  const skiaGlyphLayout = useMemo(() => {
    if (!skiaFont || !skiaLineLayouts || drawH <= 0) {
      return {
        glyphPositions: [] as { x: number; y: number; text: string }[],
        marqueeOffsetX: 0,
      };
    }

    const frameGlyphs = useBubbleLayout
      ? bubbleGlyphs({
          font: skiaFont,
          rows: skiaLineLayouts,
          frameWidth: drawW,
          frameHeight: drawH,
          safeWRatio:
            speechBubbleLayout!.safeWRatio ?? BUBBLE_SAFE.widthRatio,
          lineGapPx: lineSpacingPx,
          edgeInsetPx: speechBubbleLayout!.edgeInsetPx,
        })
      : lineLayoutsToGlyphs(
          skiaFont,
          skiaLineLayouts,
          previewFontSize,
          drawH,
          resolvedLineHeightRatio,
        );

    const { glyphs: glyphPositions, offsetX: marqueeOffsetX } =
      useBubbleLayout
        ? normalizeGlyphsForMarquee(frameGlyphs)
        : { glyphs: frameGlyphs, offsetX: 0 };

    return { glyphPositions, marqueeOffsetX };
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

  const skiaTextWidth = marqueePeriodPx;
  const marqueeOffsetX = useSharedValue(0);

  useEffect(() => {
    marqueeOffsetX.value = skiaGlyphLayout.marqueeOffsetX;
  }, [skiaGlyphLayout.marqueeOffsetX, marqueeOffsetX]);

  const skiaTextBlobs = useMemo((): SkTextBlob[] | null => {
    if (!skiaFont || skiaGlyphLayout.glyphPositions.length === 0) return null;
    if (isPixelMode) {
      const blobs = buildMarqueeTextBlobs(
        skiaGlyphLayout.glyphPositions,
        (ch) => pickBestCJKFont(ch, arkPixelCNFont, arkPixelTWFont, skiaFont),
      );
      return blobs.length > 0 ? blobs : null;
    }
    const blob = buildMarqueeTextBlob(skiaFont, skiaGlyphLayout.glyphPositions);
    return blob ? [blob] : null;
  }, [skiaFont, skiaGlyphLayout.glyphPositions, isPixelMode, arkPixelCNFont, arkPixelTWFont]);

  const skiaMarqueeTransform = useDerivedValue(() => [
    { translateX: translateX.value + marqueeOffsetX.value },
  ]);

  useEffect(() => {
    if (marqueePeriodPx <= 0) return;
    onTextLayout({
      nativeEvent: { lines: [{ width: marqueePeriodPx }] },
    });
  }, [marqueePeriodPx, onTextLayout]);

  const onSkiaCanvasLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setSkiaCanvasLayout({ width, height });
  };

  return {
    skiaFont,
    skiaTextWidth,
    skiaTextBlob: skiaTextBlobs?.[0] ?? null,
    skiaTextBlobs: skiaTextBlobs ?? undefined,
    skiaGlyphPositions: skiaGlyphLayout.glyphPositions,
    skiaMarqueeTransform,
    skiaCanvasLayout: { width: drawW, height: drawH },
    onSkiaCanvasLayout,
  };
}
