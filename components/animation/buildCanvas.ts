import type { useEffects } from "@/hooks/useEffects";
import type { usePreviewPanelCanvas } from "@/hooks/usePreviewPanelCanvas";
import type { MarqueeCanvasProps } from "./MarqueeCanvas";
import type { SharedValue } from "react-native-reanimated";

type SkiaEffects = ReturnType<typeof useEffects>;

export function buildCanvas(params: {
  canvas: ReturnType<typeof usePreviewPanelCanvas>;
  effects: SkiaEffects;
  blinkOpacity: number | SharedValue<number>;
  spacer: number;
  previewTextColor: string;
  gradientBackgroundPreset: string;
  hasBgPhoto: boolean;
  dropShadow: number;
}): MarqueeCanvasProps {
  return {
    canvas: params.canvas,
    isPixelEffect: params.effects.isPixelEffect,
    pixelShaderSize: params.effects.pixelShaderSize,
    showGradientBackdrop: params.effects.showGradientBackdrop,
    gradientBackgroundPreset: params.gradientBackgroundPreset,
    hasBgPhoto: params.hasBgPhoto,
    blinkOpacity: params.blinkOpacity,
    spacer: params.spacer,
    isGlowEffect: params.effects.isGlowEffect,
    glowBlurRadius: params.effects.glowBlurRadius,
    glowLayerColor: params.effects.glowLayerColor,
    skiaStrokeWidth: params.effects.skiaStrokeWidth,
    dropShadow: params.dropShadow,
    previewTextColor: params.previewTextColor,
  };
}
