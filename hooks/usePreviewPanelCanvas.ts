import type { SkFont, SkTextBlob } from "@shopify/react-native-skia";
import { useFont } from "@shopify/react-native-skia";
import { useEffect, useMemo, useState } from "react";
import { LayoutChangeEvent } from "react-native";
import type { SharedValue } from "react-native-reanimated";
import { useDerivedValue, useSharedValue } from "react-native-reanimated";

import {
  getDefaultAppearanceFontForLocale,
  resolveAppearanceFontFaceSet,
} from "@/constants/appFonts";
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

function getSpaceAdvanceWidth(font: SkFont): number {
  const ids = font.getGlyphIDs(" ", 1);
  if (ids.length > 0 && ids[0] !== 0) {
    const widths = font.getGlyphWidths(ids);
    if (widths.length > 0 && widths[0] != null && widths[0] > 0) return widths[0];
  }
  return 0;
}

function layoutSkiaLine(
  font: SkFont,
  text: string,
  letterSpacing: number,
  getCharFont?: (ch: string) => SkFont,
): SkiaLineLayout {
  if (text.length === 0) return { width: 0, glyphs: [] };

  const glyphs: SkiaLineGlyphLayout[] = [];
  let x = 0;

  if (!getCharFont) {
    const advances = font.getGlyphWidths(font.getGlyphIDs(text));
    for (let i = 0; i < text.length; i++) {
      const ch = text[i]!;
      glyphs.push({ x, text: ch });
      const isSpace = ch === " ";
      x += (advances[i] ?? 0) + (!isSpace && i < text.length - 1 ? letterSpacing : 0);
    }
  } else {
    for (let i = 0; i < text.length; i++) {
      const ch = text[i]!;
      glyphs.push({ x, text: ch });
      const charFont = getCharFont(ch);
      const adv =
        ch === " "
          ? getSpaceAdvanceWidth(charFont)
          : charFont.measureText(ch).width + (i < text.length - 1 ? letterSpacing : 0);
      x += adv;
    }
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

// 로케일 폴백 폰트 에셋 (각 로케일 기본 폰트)
const JA_FALLBACK_ASSET = resolveAppearanceFontFaceSet(getDefaultAppearanceFontForLocale("ja")).regular;
const KO_FALLBACK_ASSET = resolveAppearanceFontFaceSet(getDefaultAppearanceFontForLocale("ko")).regular;
const TC_FALLBACK_ASSET = resolveAppearanceFontFaceSet(getDefaultAppearanceFontForLocale("zhTC")).regular;

function isHangulChar(ch: string): boolean {
  const code = ch.codePointAt(0) ?? 0;
  return (code >= 0xac00 && code <= 0xd7a3) || (code >= 0x1100 && code <= 0x11ff);
}

function isJapaneseKanaChar(ch: string): boolean {
  const code = ch.codePointAt(0) ?? 0;
  return (
    (code >= 0x3040 && code <= 0x309f) ||  // Hiragana
    (code >= 0x30a0 && code <= 0x30ff) ||  // Katakana
    (code >= 0xff65 && code <= 0xff9f)     // 반각 Katakana
  );
}

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
  const { config, resolvedAppLocale } = useSettings();
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

  // 픽셀 모드 아닐 때 로케일 폴백 폰트
  const jaFallbackFont = useFont(!isPixelMode && resolvedAppLocale !== "ja" ? JA_FALLBACK_ASSET : null, previewFontSize);
  const koFallbackFont = useFont(!isPixelMode && resolvedAppLocale !== "ko" ? KO_FALLBACK_ASSET : null, previewFontSize);
  const tcFallbackFont = useFont(!isPixelMode && resolvedAppLocale !== "zhTC" ? TC_FALLBACK_ASSET : null, previewFontSize);

  // 문자별 폰트 선택기
  const localeCharFontPicker = useMemo((): ((ch: string) => SkFont) | null => {
    if (!skiaFont || isPixelMode) return null;
    if (!jaFallbackFont && !koFallbackFont && !tcFallbackFont) return null;
    const font = skiaFont;
    const locale = resolvedAppLocale;
    return (ch) => {
      if (isHangulChar(ch)) return koFallbackFont ?? font;
      if (isJapaneseKanaChar(ch)) return jaFallbackFont ?? font;
      if (isCJKChar(ch)) {
        if (locale === "zhSC") return font; // 이미 간체 폰트
        if (locale === "zhTC") return font; // 이미 번체 폰트
        return tcFallbackFont ?? font;
      }
      return font;
    };
  }, [skiaFont, isPixelMode, resolvedAppLocale, jaFallbackFont, koFallbackFont, tcFallbackFont]);

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

    const rows = useBubbleLayout || playOption !== "one"
      ? bubbleRows({
          text: displayText,
          maxRows: speechBubbleLayout?.maxRows ?? BUBBLE_MAX_ROWS,
          playOption,
        })
      : (displayText.length > 0 ? [displayText] : []);

    if (useBubbleLayout) {
      return bubbleLayouts(skiaFont, rows, letterSpacing);
    }

    const getCharFont: ((ch: string) => SkFont) | undefined =
      isPixelMode && (arkPixelCNFont || arkPixelTWFont)
        ? (ch) => pickBestCJKFont(ch, arkPixelCNFont, arkPixelTWFont, skiaFont)
        : (localeCharFontPicker ?? undefined);

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
    localeCharFontPicker,
  ]);

  const resolvedLineHeightRatio =
    lineSpacingPx != null
      ? lineHeightRatio + lineSpacingPx / Math.max(1, previewFontSize)
      : lineHeightRatio;

  const marqueePeriodPx = useMemo(() => {
    if (!skiaLineLayouts || skiaLineLayouts.length === 0) return 0;
    return skiaLineLayouts.reduce((max, row) => Math.max(max, row.width), 0);
  }, [skiaLineLayouts]);

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
    if (localeCharFontPicker) {
      const blobs = buildMarqueeTextBlobs(skiaGlyphLayout.glyphPositions, localeCharFontPicker);
      return blobs.length > 0 ? blobs : null;
    }
    const blob = buildMarqueeTextBlob(skiaFont, skiaGlyphLayout.glyphPositions);
    return blob ? [blob] : null;
  }, [skiaFont, skiaGlyphLayout.glyphPositions, isPixelMode, arkPixelCNFont, arkPixelTWFont, localeCharFontPicker]);

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
    marqueeOffsetX,
    skiaCanvasLayout: { width: drawW, height: drawH },
    onSkiaCanvasLayout,
  };
}
