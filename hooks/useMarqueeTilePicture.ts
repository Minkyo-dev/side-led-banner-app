import {
  computeEffectSpace,
  computeMarqueeTilePeriod,
  makeMarqueeStripPaint,
  recordMarqueeTilePicture,
  resolveMarqueeStripWidth,
} from "@/utils/recordMarqueeTilePicture";
import type { SkPaint, SkPicture } from "@shopify/react-native-skia";
import { useMemo } from "react";

export type UseMarqueeTilePictureParams = {
  blob: import("@shopify/react-native-skia").SkTextBlob | null;
  textWidthPx: number;
  spacerPx: number;
  canvasWidthPx: number;
  canvasHeightPx: number;
  previewTextColor: string;
  glowLayerColor: string;
  isGlowEffect: boolean;
  glowBlurRadius: number;
  strokeWidthPx: number;
  dropShadow: number;
  dropShadowBlur: number;
};

export type MarqueeTilePictureResult = {
  stripPaint: SkPaint | null;
  stripWidth: number;
  periodPx: number;
  tilePicture: SkPicture | null;
};

export function useMarqueeTilePicture(
  p: UseMarqueeTilePictureParams,
): MarqueeTilePictureResult {
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

  const tilePicture = useMemo(() => {
    if (!p.blob || p.canvasHeightPx <= 0) return null;
    return recordMarqueeTilePicture({
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
    });
  }, [
    p.blob,
    periodPx,
    p.canvasHeightPx,
    p.previewTextColor,
    p.glowLayerColor,
    p.isGlowEffect,
    p.glowBlurRadius,
    p.strokeWidthPx,
    p.dropShadow,
    p.dropShadowBlur,
  ]);

  const stripWidth = useMemo(
    () => resolveMarqueeStripWidth(p.canvasWidthPx, periodPx),
    [p.canvasWidthPx, periodPx],
  );

  const stripPaint = useMemo(() => {
    if (!tilePicture) return null;
    return makeMarqueeStripPaint(tilePicture, periodPx, tileHeight);
  }, [tilePicture, periodPx, tileHeight]);

  return { stripPaint, stripWidth, periodPx, tilePicture };
}
