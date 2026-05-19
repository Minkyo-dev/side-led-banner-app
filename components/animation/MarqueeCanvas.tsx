import { GradientBackdrop } from "@/components/skia/GradientBackdrop";
import { type GradientBackdropId } from "@/constants/gradientBackgroundPresets";
import { useMarqueeTilePicture } from "@/hooks/useMarqueeTilePicture";
import { usePreviewPanelCanvas } from "@/hooks/usePreviewPanelCanvas";
import {
  Canvas,
  Group,
  Paint,
  Rect,
  RuntimeShader,
  Skia,
} from "@shopify/react-native-skia";
import React, { useMemo } from "react";
import type { SharedValue } from "react-native-reanimated";

export interface MarqueeCanvasProps {
  canvas: ReturnType<typeof usePreviewPanelCanvas>;
  isPixelEffect: boolean;
  pixelShaderSize: number;
  showGradientBackdrop: boolean;
  gradientBackgroundPreset: string;
  hasBgPhoto: boolean;
  blinkOpacity: number | SharedValue<number>;
  spacer: number;
  isGlowEffect: boolean;
  glowBlurRadius: number;
  glowLayerColor: string;
  skiaStrokeWidth: number;
  dropShadow: number;
  previewTextColor: string;
}

const PIXELATE_SOURCE = Skia.RuntimeEffect.Make(`
  uniform shader content;
  uniform float pixelSize;

  half4 main(vec2 pos) {
    vec2 p = floor(pos / pixelSize) * pixelSize + (pixelSize / 2.0);
    return content.eval(p);
  }
`)!;

// Preview/Fullscreen 공통 Skia Marquee
export function MarqueeCanvas({
  canvas,
  isPixelEffect,
  pixelShaderSize,
  showGradientBackdrop,
  gradientBackgroundPreset,
  hasBgPhoto,
  blinkOpacity,
  spacer,
  isGlowEffect,
  glowBlurRadius,
  glowLayerColor,
  skiaStrokeWidth,
  dropShadow,
  previewTextColor,
}: MarqueeCanvasProps) {
  const blob = canvas.skiaTextBlob;
  const strokeWidthPx = Math.round((skiaStrokeWidth / 100) * 30);
  const dropShadowBlur = Math.round((dropShadow / 100) * 5);
  const layout = canvas.skiaCanvasLayout;

  const { stripPaint, stripWidth } = useMarqueeTilePicture({
    blob,
    textWidthPx: canvas.skiaTextWidth,
    spacerPx: spacer,
    canvasWidthPx: layout.width,
    canvasHeightPx: layout.height,
    previewTextColor,
    glowLayerColor,
    isGlowEffect,
    glowBlurRadius,
    strokeWidthPx,
    dropShadow,
    dropShadowBlur,
  });

  const canDrawStrip = useMemo(
    () =>
      stripPaint != null && stripWidth > 0 && layout.width > 0 && layout.height > 0,
    [stripPaint, stripWidth, layout.width, layout.height],
  );

  return (
    <Canvas style={{ flex: 1 }} opaque={false}>
      <Group
        layer={
          isPixelEffect ? (
            <Paint>
              <RuntimeShader
                source={PIXELATE_SOURCE}
                uniforms={{ pixelSize: pixelShaderSize }}
              />
            </Paint>
          ) : undefined
        }
      >
        {showGradientBackdrop ? (
          <GradientBackdrop
            key={`gradient-${gradientBackgroundPreset}`}
            preset={gradientBackgroundPreset as GradientBackdropId}
            width={layout.width}
            height={layout.height}
            opacity={hasBgPhoto ? 0.4 : 1}
          />
        ) : null}
        <Group opacity={blinkOpacity} transform={canvas.skiaMarqueeTransform}>
          {canDrawStrip ? (
            <Rect
              x={0}
              y={0}
              width={stripWidth}
              height={layout.height}
              paint={stripPaint!}
            />
          ) : null}
        </Group>
      </Group>
    </Canvas>
  );
}
