import { glowColorToSkiaRgba } from "@/constants/colorPalette";
import {
  GRADIENT_BACKDROP_IDS,
  type GradientBackdropId,
} from "@/constants/gradientBackgroundPresets";
import { computeEffectSpace } from "@/utils/recordMarqueeTilePicture";
import { useMemo } from "react";

export type EffectsInput = {
  effectSelectedItems: string[];
  gradientBackgroundPreset: string;
  outLine: number;
  glowIntensity: number;
  glowColor: string;
  dropShadow: number;
  pixelSize: number;
};

/** Skia 마퀴: Pixel/Glow/Gradient·stroke·effect space */
export function useEffects(input: EffectsInput) {
  const isPixelEffect = input.effectSelectedItems.includes("Pixel");
  const isGlowEffect = input.effectSelectedItems.includes("Glow");
  const showGradientBackdrop =
    input.effectSelectedItems.includes("Gradient") &&
    GRADIENT_BACKDROP_IDS.includes(
      input.gradientBackgroundPreset as GradientBackdropId,
    );
  const pixelShaderSize = isPixelEffect ? Math.max(2, input.pixelSize) : 1;
  const skiaStrokeWidth = (input.outLine / 100) * 24;
  const skiaStrokeWidthPx = Math.round((skiaStrokeWidth / 100) * 30);

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
    skiaStrokeWidth,
    skiaStrokeWidthPx,
    glowBlurRadius,
    glowLayerColor,
    effectSpacePx,
  };
}
