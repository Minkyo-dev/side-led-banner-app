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
import { FilterMode } from "@shopify/react-native-skia";
import { useMemo } from "react";

export type UseTilePictureParams = {
  blob: import("@shopify/react-native-skia").SkTextBlob | null;
  textBlobs?: import("@shopify/react-native-skia").SkTextBlob[];
  textWidthPx: number;
  spacerPx: number;
  canvasWidthPx: number;
  canvasHeightPx: number;
  previewTextColor: string;
  glowLayerColor: string;
  isGlowEffect: boolean;
  isPixelEffect: boolean;
  isPixelColorMix: boolean;
  pixelShaderSize: number;
  pixelMaskDilateRadius?: number;
  pixelMaskErodeRadius?: number;
  pixelGlyphPadCells?: number;
  glowBlurRadius: number;
  strokeWidthPx: number;
  dropShadow: number;
  dropShadowBlur: number;
  glyphPositions: MarqueeGlyphPos[];
  font: SkFont | null;
  backgroundColor: string;
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
      p.pixelGlyphPadCells ?? 1,
    );
  }, [
    p.isPixelEffect,
    p.font,
    p.glyphPositions,
    p.pixelShaderSize,
    p.pixelGlyphPadCells,
  ]);

  const recordBase = useMemo(() => {
    const hasBlobs = p.textBlobs != null && p.textBlobs.length > 0;
    if (!p.blob && !hasBlobs) return null;
    return {
      blob: p.blob ?? p.textBlobs![0]!,
      textBlobs: hasBlobs ? p.textBlobs : undefined,
      periodWidth: periodPx,
      height: tileHeight,
      previewTextColor: p.previewTextColor,
      glowLayerColor: p.glowLayerColor,
      isGlowEffect: p.isGlowEffect,
      glowBlurRadius: p.glowBlurRadius,
      strokeWidthPx: p.strokeWidthPx,
      dropShadow: p.dropShadow,
      dropShadowBlur: p.dropShadowBlur,
      maskDilateRadius: p.isPixelEffect ? (p.pixelMaskDilateRadius ?? 1) : 0,
      maskErodeRadius: p.isPixelEffect ? (p.pixelMaskErodeRadius ?? 0) : 0,
      pixelCrispMask: p.isPixelEffect,
      pixelColorMix: p.isPixelColorMix,
      glyphLedPanels,
      glyphPositions: p.glyphPositions,
      font: p.font,
      backgroundColor: p.backgroundColor,
    };
  }, [
    p.blob,
    p.textBlobs,
    periodPx,
    tileHeight,
    p.previewTextColor,
    p.glowLayerColor,
    p.isGlowEffect,
    p.isPixelEffect,
    p.isPixelColorMix,
    p.glyphPositions,
    p.font,
    p.glowBlurRadius,
    p.strokeWidthPx,
    p.dropShadow,
    p.dropShadowBlur,
    p.backgroundColor,
    glyphLedPanels,
    p.pixelMaskDilateRadius,
    p.pixelMaskErodeRadius,
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
    return makeMarqueeStripPaint(
      tilePicture,
      periodPx,
      tileHeight,
      p.isPixelEffect ? FilterMode.Nearest : FilterMode.Linear,
    );
  }, [tilePicture, periodPx, tileHeight, p.isPixelEffect]);

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
