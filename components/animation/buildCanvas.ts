import type { useEffects } from "@/hooks/useEffects";
import type { usePreviewPanelCanvas } from "@/hooks/usePreviewPanelCanvas";
import type { MarqueeCanvasProps } from "./MarqueeCanvas";
import type { SharedValue } from "react-native-reanimated";

type SkiaEffects = ReturnType<typeof useEffects>;
type BuiltMarqueeCanvasProps = Omit<MarqueeCanvasProps, "gradientBackgroundPreset">;

export function buildCanvas(params: {
  canvas: ReturnType<typeof usePreviewPanelCanvas>;
  effects: SkiaEffects;
  blinkOpacity: number | SharedValue<number>;
  spacer: number;
  previewTextColor: string;
  hasBgPhoto: boolean;
  dropShadow: number;
  backgroundColor: string;
}): BuiltMarqueeCanvasProps {
  return {
    canvas: params.canvas,
    isPixelEffect: params.effects.isPixelEffect,
    pixelShaderSize: params.effects.pixelShaderSize,
    showGradientBackdrop: params.effects.showGradientBackdrop,
    hasBgPhoto: params.hasBgPhoto,
    blinkOpacity: params.blinkOpacity,
    spacer: params.spacer,
    isGlowEffect: params.effects.isGlowEffect,
    glowBlurRadius: params.effects.glowBlurRadius,
    glowLayerColor: params.effects.glowLayerColor,
    skiaStrokeWidthPx: params.effects.skiaStrokeWidthPx,
    pixelOutlineRings: params.effects.pixelOutlineRings,
    dropShadow: params.dropShadow,
    previewTextColor: params.previewTextColor,
    backgroundColor: params.backgroundColor,
  };
}
