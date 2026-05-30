import { useMemo } from "react";

import { useSkiaAppearanceFont } from "@/hooks/useSkiaAppearanceFont";
import { skiaRowHeightPx } from "@/utils/skiaTextBlockMetrics";
import {
  FONT_SIZE_MAX,
  FONT_SIZE_MIN,
  getFullscreenTextMetrics,
  getPreviewTextMetrics,
  getRelLineSpacing,
  getSizingPolicy,
  scaleFontSizeByHeight,
  type SkiaFontProbe,
} from "@/utils/textSizing";

type SizingPolicy = ReturnType<typeof getSizingPolicy>;

type TextMetricsBase = {
  text: string;
  fontSize: number;
  lineSpacing: number;
  playOption: "one" | "multi";
  sizingPolicy: SizingPolicy;
  isSpeechBgActive: boolean;
  speechMaxHeight: number;
  appearanceFont: string;
  fontWeight: "normal" | "bold";
};

export type TextMetricsInput =
  | (TextMetricsBase & { mode: "preview"; previewHeight: number })
  | (TextMetricsBase & {
      mode: "fullscreen";
      windowWidth: number;
      windowHeight: number;
      isPortrait: boolean;
    });

function resolveHeightScaledFontSize(params: {
  fontSize: number;
  windowWidth: number;
  windowHeight: number;
  isPortrait: boolean;
  isSpeechBgActive: boolean;
  portraitFontBoost: number;
}): number {
  const landscapeHeight = Math.max(
    1,
    Math.min(params.windowWidth, params.windowHeight),
  );
  const scaled = scaleFontSizeByHeight({
    baseFontSize: params.fontSize,
    targetHeight: params.windowHeight,
    referenceHeight: landscapeHeight,
  });
  const portraitSized = params.isPortrait
    ? Math.max(FONT_SIZE_MIN, Math.floor(scaled * params.portraitFontBoost))
    : scaled;
  const atMaxSize = params.fontSize >= 100;
  if (!params.isSpeechBgActive && !params.isPortrait && atMaxSize) {
    return Math.max(FONT_SIZE_MIN, Math.floor(portraitSized * 2));
  }
  return Math.max(FONT_SIZE_MIN, portraitSized);
}

function resolveTextMetrics(
  input: TextMetricsInput,
  sizePct: number,
  effectiveLineSpacing: number,
  skiaFontProbe: SkiaFontProbe | undefined,
) {
  if (input.mode === "preview" && input.previewHeight <= 0) {
    return { lineCount: 1, fontSize: 100, height: 100 };
  }

  const baseFontSize =
    input.mode === "fullscreen"
      ? resolveHeightScaledFontSize({
          fontSize: sizePct,
          windowWidth: input.windowWidth,
          windowHeight: input.windowHeight,
          isPortrait: input.isPortrait,
          isSpeechBgActive: input.isSpeechBgActive,
          portraitFontBoost: input.sizingPolicy.portraitFontBoost,
        })
      : sizePct;

  if (input.mode === "fullscreen" || input.isSpeechBgActive) {
    return getFullscreenTextMetrics({
      displayText: input.text,
      baseFontSize,
      lineHeightRatio: input.sizingPolicy.fullscreenLineHeightRatio,
      lineSpacingPx: effectiveLineSpacing,
      maxHeight: input.speechMaxHeight,
      padding: input.isSpeechBgActive
        ? 0
        : input.sizingPolicy.speechTextHeightPadding,
      clampByMaxHeight: input.sizingPolicy.clampByMaxHeight,
      speechBg: input.isSpeechBgActive,
      playOption: input.playOption,
      sizePct,
      skiaFontProbe,
    });
  }

  return getPreviewTextMetrics({
    previewHeight: input.previewHeight,
    playOption: input.playOption,
    text: input.text,
    padding: input.sizingPolicy.previewPadding,
    lineHeightRatio: input.sizingPolicy.previewLineHeightRatio,
    lineSpacingPx: effectiveLineSpacing,
    fontSizePercent: sizePct,
    skiaFontProbe,
  });
}

const SKIA_PROBE_FONT_SIZE = FONT_SIZE_MAX;

/** preview / fullscreen 공통: cap → (preview 일반 배경만) 박스 보정 */
export function useTextMetrics(input: TextMetricsInput) {
  const probeFont = useSkiaAppearanceFont(
    input.appearanceFont,
    input.fontWeight,
    SKIA_PROBE_FONT_SIZE,
  );

  const skiaFontProbe = useMemo((): SkiaFontProbe | undefined => {
    if (!probeFont) return undefined;
    return {
      rowHeightPxAtProbe: skiaRowHeightPx(probeFont),
      probeFontSize: SKIA_PROBE_FONT_SIZE,
    };
  }, [probeFont]);

  const effectiveLineSpacing = useMemo(
    () =>
      getRelLineSpacing({
        requestedLineSpacingPx: input.lineSpacing,
        fontSizePercent: input.fontSize,
      }),
    [input.lineSpacing, input.fontSize],
  );

  const referenceLineSpacing = useMemo(
    () =>
      getRelLineSpacing({
        requestedLineSpacingPx: input.lineSpacing,
        fontSizePercent: FONT_SIZE_MAX,
      }),
    [input.lineSpacing],
  );

  const metrics = useMemo(
    () =>
      resolveTextMetrics(
        input,
        input.fontSize,
        effectiveLineSpacing,
        skiaFontProbe,
      ),
    [input, effectiveLineSpacing, skiaFontProbe],
  );

  const referenceMetrics = useMemo(
    () =>
      resolveTextMetrics(
        input,
        FONT_SIZE_MAX,
        referenceLineSpacing,
        skiaFontProbe,
      ),
    [input, referenceLineSpacing, skiaFontProbe],
  );

  return {
    effectiveLineSpacing,
    previewFontSize: metrics.fontSize,
    marqueeReferenceFontSize: referenceMetrics.fontSize,
    fullscreenLineHeightRatio: input.sizingPolicy.fullscreenLineHeightRatio,
  };
}
