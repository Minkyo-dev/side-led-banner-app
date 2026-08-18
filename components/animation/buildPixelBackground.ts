import type { BackgroundEffectAnimationResult } from "@/hooks/useBackgroundAnimation";
import type { useEffects } from "@/hooks/useEffects";
import type { BackgroundEffectImageMode } from "./resolveBackgroundEffectImage";
import type { PixelBackgroundCanvasProps } from "./PixelBackgroundCanvas";

type SkiaEffects = ReturnType<typeof useEffects>;

export function buildPixelBackground(params: {
  width: number;
  height: number;
  effects: SkiaEffects;
  hasBgPhoto: boolean;
  backgroundColor: string;
  backgroundImageUri?: string | null;
  gradientBackgroundPreset: string;
  backgroundEffect: BackgroundEffectAnimationResult;
  isPortrait: boolean;
  mode: BackgroundEffectImageMode;
}): PixelBackgroundCanvasProps {
  return {
    width: params.width,
    height: params.height,
    isPixelEffect: params.effects.isPixelEffect,
    pixelShaderSize: params.effects.pixelBackgroundShaderSize,
    showGradientBackdrop: params.effects.showGradientBackdrop,
    gradientBackgroundPreset: params.gradientBackgroundPreset,
    hasBgPhoto: params.hasBgPhoto,
    backgroundColor: params.backgroundColor,
    backgroundImageUri: params.backgroundImageUri,
    backgroundEffect: params.backgroundEffect,
    isPortrait: params.isPortrait,
    mode: params.mode,
  };
}
