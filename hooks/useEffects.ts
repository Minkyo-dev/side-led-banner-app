import { glowColorToSkiaRgba } from "@/constants/colorPalette";
import {
  GRADIENT_BACKDROP_IDS,
  type GradientBackdropId,
} from "@/constants/gradientBackgroundPresets";
import {
  pixelDotLocaleScale,
  pixelGlyphPanelPadCells,
  resolvePixelTextShaderUniforms,
} from "@/constants/language";
import { useSettings } from "@/contexts/settingsContext";
import { computeEffectSpace } from "@/utils/recordTile";
import { useMemo } from "react";

/** 격자 한 칸(px) = LED 1개 크기. 클수록 POP처럼 굵은 원형 모듈 */
const PIXEL_DOT_SIZE_PX = 12;
const PIXEL_DOT_SIZE_PX_MULTILINE = 6;

export type EffectsInput = {
  effectSelectedItems: string[];
  gradientBackgroundPreset: string;
  outLine: number;
  glowIntensity: number;
  glowColor: string;
  dropShadow: number;
  pixelColorMix: boolean;
  playOption: "one" | "multi";
  /**
   * Pixel dot px 배율. fullscreen = 1.
   * preview는 previewFont/fullscreenFont 비율로 축소해 격자 밀도를 맞춤.
   */
  pixelViewportScale?: number;
};

/** Skia 마퀴: Pixel/Glow/Gradient·stroke·effect space */
export function useEffects(input: EffectsInput) {
  const { resolvedAppLocale } = useSettings();
  const isPixelEffect = input.effectSelectedItems.includes("Pixel");
  const isGlowEffect = input.effectSelectedItems.includes("Glow");
  const showGradientBackdrop =
    input.effectSelectedItems.includes("Gradient") &&
    GRADIENT_BACKDROP_IDS.includes(
      input.gradientBackgroundPreset as GradientBackdropId,
    );
  const basePixelDotPx =
    input.playOption === "multi"
      ? PIXEL_DOT_SIZE_PX_MULTILINE
      : PIXEL_DOT_SIZE_PX;
  const pixelScale = Math.min(
    1,
    Math.max(0.15, input.pixelViewportScale ?? 1),
  );
  const localeDotScale = pixelDotLocaleScale(resolvedAppLocale);
  const pixelShaderSize = isPixelEffect
    ? Math.max(1, basePixelDotPx * pixelScale * localeDotScale)
    : 1;
  const pixelTextShaderUniforms = resolvePixelTextShaderUniforms(
    resolvedAppLocale,
    pixelShaderSize,
  );
  const pixelGlyphPadCells = pixelGlyphPanelPadCells(
    resolvedAppLocale,
    pixelShaderSize,
  );
  const strokeWidthScale = (input.outLine / 100) * 24;
  const skiaStrokeWidthPx = Math.round((strokeWidthScale / 100) * 30);
  /** Pixel 모드: dotted 글자 바깥 흰 도트 링 개수 (Text → Outline 슬라이더) */
  const pixelOutlineRings =
    isPixelEffect && input.outLine > 0
      ? Math.max(1, Math.min(4, Math.ceil((input.outLine / 100) * 3)))
      : 0;
  const isPixelColorMix = isPixelEffect && input.pixelColorMix;

  const glowBlurRadius = useMemo(
    () => Math.max(2, Math.min(18, 2 + (input.glowIntensity / 100) * 16)),
    [input.glowIntensity],
  );
  const glowLayerColor = useMemo(
    () => glowColorToSkiaRgba(input.glowColor, input.glowIntensity),
    [input.glowColor, input.glowIntensity],
  );
  const effectSpacePx = useMemo(
    () =>
      computeEffectSpace({
        isGlowEffect,
        glowBlurRadius,
        strokeWidthPx: skiaStrokeWidthPx,
        dropShadow: input.dropShadow,
      }),
    [isGlowEffect, glowBlurRadius, skiaStrokeWidthPx, input.dropShadow],
  );

  return {
    isPixelEffect,
    isGlowEffect,
    showGradientBackdrop,
    pixelShaderSize,
    pixelTextShaderUniforms,
    pixelGlyphPadCells,
    skiaStrokeWidthPx,
    pixelOutlineRings,
    isPixelColorMix,
    glowBlurRadius,
    glowLayerColor,
    effectSpacePx,
  };
}
