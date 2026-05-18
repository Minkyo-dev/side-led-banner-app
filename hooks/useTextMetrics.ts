import { useMemo } from "react";

import {
  FONT_SIZE_MIN,
  getRelLineSpacing,
  getFullscreenTextMetrics,
  getPreviewTextMetrics,
  getSizingPolicy,
  scaleFontSizeByHeight,
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

/** preview / fullscreen 공통: cap → (preview 일반 배경만) 박스 보정 */
export function useTextMetrics(input: TextMetricsInput) {
  const effectiveLineSpacing = useMemo(
    () =>
      getRelLineSpacing({
        requestedLineSpacingPx: input.lineSpacing,
        fontSizePercent: input.fontSize,
      }),
    [input.lineSpacing, input.fontSize],
  );

  const baseFontSize = useMemo(() => {
    if (input.mode === "fullscreen") {
      return resolveHeightScaledFontSize({
        fontSize: input.fontSize,
        windowWidth: input.windowWidth,
        windowHeight: input.windowHeight,
        isPortrait: input.isPortrait,
        isSpeechBgActive: input.isSpeechBgActive,
        portraitFontBoost: input.sizingPolicy.portraitFontBoost,
      });
    }
    return input.fontSize;
  }, [input]);

  const metrics = useMemo(() => {
    if (input.mode === "preview" && input.previewHeight <= 0) {
      return { lineCount: 1, fontSize: 100, height: 100 };
    }

    const cappedMetrics = getFullscreenTextMetrics({
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
      sizePct: input.fontSize,
    });

    if (input.mode === "fullscreen" || input.isSpeechBgActive) {
      return cappedMetrics;
    }

    return getPreviewTextMetrics({
      previewHeight: input.previewHeight,
      baseFontSize: cappedMetrics.fontSize,
      playOption: input.playOption,
      text: input.text,
      padding: input.sizingPolicy.previewPadding,
      lineHeightRatio: input.sizingPolicy.previewLineHeightRatio,
      lineSpacingPx: effectiveLineSpacing,
    });
  }, [input, baseFontSize, effectiveLineSpacing]);

  return {
    effectiveLineSpacing,
    previewFontSize: metrics.fontSize,
    fullscreenLineHeightRatio: input.sizingPolicy.fullscreenLineHeightRatio,
  };
}
