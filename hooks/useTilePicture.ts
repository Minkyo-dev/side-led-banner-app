import {
  computeEffectSpace,
  computeMarqueeTilePeriod,
  makeMarqueeStripPaint,
  recordTile,
  resolveMarqueeStripWidth,
} from "@/utils/recordTile";
import type { MarqueeGlyphPos } from "@/utils/buildMarqueeTextBlob";
import { computeGlyphLedPanels } from "@/utils/glyphLedPanels";
import type { SkFont, SkPaint } from "@shopify/react-native-skia";
import { useMemo } from "react";

export type UseTilePictureParams = {
  blob: import("@shopify/react-native-skia").SkTextBlob | null;
  textWidthPx: number;
  spacerPx: number;
  canvasWidthPx: number;
  canvasHeightPx: number;
  previewTextColor: string;
  glowLayerColor: string;
  isGlowEffect: boolean;
  isPixelEffect: boolean;
  pixelShaderSize: number;
  glowBlurRadius: number;
  strokeWidthPx: number;
  dropShadow: number;
  dropShadowBlur: number;
  glyphPositions: MarqueeGlyphPos[];
  font: SkFont | null;
};

type TilePictureHookResult = {
  stripPaint: SkPaint | null;
  glowStripPaint: SkPaint | null;
  stripWidth: number;
};

export function useTilePicture(
  p: UseTilePictureParams,
): TilePictureHookResult {
  const effectBleedPx = computeEffectSpace({
    isGlowEffect: p.isGlowEffect,
    glowBlurRadius: p.glowBlurRadius,
    strokeWidthPx: p.strokeWidthPx,
    dropShadow: p.dropShadow,
  });
  const periodPx = computeMarqueeTilePeriod({
    textWidthPx: p.textWidthPx,
    spacerPx: p.spacerPx,
    effectBleedPx,
  });
  const tileHeight = Math.max(1, Math.ceil(p.canvasHeightPx));
  const splitGlowFromDots = p.isPixelEffect && p.isGlowEffect;

  const glyphLedPanels = useMemo(() => {
    if (!p.isPixelEffect || !p.font || p.glyphPositions.length === 0) {
      return [];
    }
    return computeGlyphLedPanels(
      p.font,
      p.glyphPositions,
      p.pixelShaderSize,
      1,
    );
  }, [p.isPixelEffect, p.font, p.glyphPositions, p.pixelShaderSize]);

  const recordBase = useMemo(() => {
    if (!p.blob) return null;
    return {
      blob: p.blob,
      periodWidth: periodPx,
      height: tileHeight,
      previewTextColor: p.previewTextColor,
      glowLayerColor: p.glowLayerColor,
      isGlowEffect: p.isGlowEffect,
      glowBlurRadius: p.glowBlurRadius,
      strokeWidthPx: p.strokeWidthPx,
      dropShadow: p.dropShadow,
      dropShadowBlur: p.dropShadowBlur,
      maskDilateRadius: 0,
      pixelCrispMask: p.isPixelEffect,
      glyphLedPanels,
    };
  }, [
    p.blob,
    periodPx,
    tileHeight,
    p.previewTextColor,
    p.glowLayerColor,
    p.isGlowEffect,
    p.isPixelEffect,
    p.glyphPositions,
    p.font,
    p.glowBlurRadius,
    p.strokeWidthPx,
    p.dropShadow,
    p.dropShadowBlur,
    glyphLedPanels,
  ]);

  const tilePicture = useMemo(() => {
    if (!recordBase || p.canvasHeightPx <= 0) return null;
    return recordTile({
      ...recordBase,
      layerMode: p.isPixelEffect ? "textOnly" : "full",
    });
  }, [recordBase, p.canvasHeightPx, p.isPixelEffect]);

  const glowTilePicture = useMemo(() => {
    if (!splitGlowFromDots || !recordBase || p.canvasHeightPx <= 0) return null;
    return recordTile({
      ...recordBase,
      layerMode: "glowOnly",
    });
  }, [splitGlowFromDots, recordBase, p.canvasHeightPx]);

  const stripWidth = useMemo(
    () => resolveMarqueeStripWidth(p.canvasWidthPx, periodPx),
    [p.canvasWidthPx, periodPx],
  );

  const stripPaint = useMemo(() => {
    if (!tilePicture) return null;
    return makeMarqueeStripPaint(tilePicture, periodPx, tileHeight);
  }, [tilePicture, periodPx, tileHeight]);

  const glowStripPaint = useMemo(() => {
    if (!glowTilePicture) return null;
    return makeMarqueeStripPaint(glowTilePicture, periodPx, tileHeight);
  }, [glowTilePicture, periodPx, tileHeight]);

  return {
    stripPaint,
    glowStripPaint,
    stripWidth,
  };
}
