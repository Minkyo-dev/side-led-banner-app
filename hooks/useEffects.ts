import { GALMURI11_FONT_ID, ZITI_GUANJIA_BODIAN_FONT_ID } from "@/constants/appFonts";
import { glowColorToSkiaRgba } from "@/constants/colorPalette";
import {
  GRADIENT_BACKDROP_IDS,
  type GradientBackdropId,
} from "@/constants/gradientBackgroundPresets";
import {
  hasPixelLedEffect,
  isPixelFontBoDianMode,
  pixelGlyphPanelPadCells,
  resolvePixelBackgroundShaderSizePx,
  resolvePixelFontCircleGridMode,
  resolvePixelShaderSizePx,
  resolvePixelTextShaderUniforms,
} from "@/constants/pixelLed";
import { useSettings } from "@/contexts/settingsContext";
import { computeEffectSpace } from "@/utils/recordTile";
import { useMemo } from "react";

export type EffectsInput = {
  effectSelectedItems: string[];
  gradientBackgroundPreset: string;
  outLine: number;
  glowIntensity: number;
  glowColor: string;
  dropShadow: number;
  pixelColorMix: boolean;
  playOption: "one" | "multi";
  fontSizePx?: number;
};

/** Skia마퀴효과용 */
export function useEffects(input: EffectsInput) {
  const { resolvedAppLocale } = useSettings();
  const isPixelEffect = hasPixelLedEffect(input.effectSelectedItems);
  const pixelFontCircleGrid = resolvePixelFontCircleGridMode(
    resolvedAppLocale,
    input.effectSelectedItems,
  );
  const isPixelFontMode = isPixelFontBoDianMode(
    resolvedAppLocale,
    input.effectSelectedItems,
  );
  const isPixelCircleGrid = pixelFontCircleGrid != null;
  const isPixelTextDots = isPixelEffect && !isPixelFontMode;
  const useThinKoPixelStrokes =
    isPixelTextDots &&
    resolvedAppLocale === "ko" &&
    input.effectSelectedItems.includes("Pixel");
  const isGlowEffect = input.effectSelectedItems.includes("Glow");
  const showGradientBackdrop =
    input.effectSelectedItems.includes("Gradient") &&
    GRADIENT_BACKDROP_IDS.includes(
      input.gradientBackgroundPreset as GradientBackdropId,
    );

  const pixelPlay = { playOption: input.playOption, locale: resolvedAppLocale };
  const pixelShaderSize = isPixelEffect
    ? resolvePixelShaderSizePx({ ...pixelPlay, fontSizePx: input.fontSizePx })
    : 1;
  const pixelBackgroundShaderSize = isPixelEffect
    ? resolvePixelBackgroundShaderSizePx(pixelPlay)
    : 1;

  const pixelTextShaderUniforms = resolvePixelTextShaderUniforms(
    resolvedAppLocale,
    pixelShaderSize,
    { koThinStrokes: useThinKoPixelStrokes, pixelFontCircleGrid },
  );
  const koPixelTight =
    useThinKoPixelStrokes &&
    (pixelShaderSize <= 5 || input.playOption === "multi");
  const pixelMaskErodeRadius = useThinKoPixelStrokes
    ? Math.max(1, Math.round(pixelShaderSize / (koPixelTight ? 5 : 7)))
    : 0;
  const pixelMaskDilateRadius =
    isPixelTextDots && !useThinKoPixelStrokes && !isPixelCircleGrid ? 1 : 0;
  const pixelGlyphPadCells = pixelGlyphPanelPadCells(
    resolvedAppLocale,
    pixelShaderSize,
    isPixelCircleGrid,
  );
  const skiaStrokeWidthPx = Math.round(((input.outLine / 100) * 24 * 30) / 100);
  const pixelOutlineRings =
    isPixelTextDots && input.outLine > 0
      ? Math.max(1, Math.min(4, Math.ceil((input.outLine / 100) * 3)))
      : 0;
  const isPixelColorMix = isPixelTextDots && isPixelEffect && input.pixelColorMix;

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
    isPixelTextDots,
    pixelSkiaFontOverride: isPixelCircleGrid
      ? GALMURI11_FONT_ID
      : isPixelFontMode
        ? ZITI_GUANJIA_BODIAN_FONT_ID
        : null,
    isGlowEffect,
    showGradientBackdrop,
    pixelShaderSize,
    pixelBackgroundShaderSize,
    pixelTextShaderUniforms,
    pixelMaskDilateRadius,
    pixelMaskErodeRadius,
    pixelGlyphPadCells,
    skiaStrokeWidthPx,
    pixelOutlineRings,
    isPixelColorMix,
    glowBlurRadius,
    glowLayerColor,
    effectSpacePx,
  };
}
