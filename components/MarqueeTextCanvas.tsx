import { GradientBackdrop } from "@/components/skia/GradientBackdrop";
import { type GradientBackdropId } from "@/constants/gradientBackgroundPresets";
import { usePreviewPanelCanvas } from "@/hooks/usePreviewPanelCanvas";
import {
    Blur,
    Canvas,
    Group,
    Paint,
    RuntimeShader,
    Shadow,
    Skia,
    Text as SkiaText,
} from "@shopify/react-native-skia";
import React from "react";
import type { SharedValue } from "react-native-reanimated";

interface MarqueeTextCanvasProps {
  canvas: ReturnType<typeof usePreviewPanelCanvas>;
  isPixelEffect: boolean;
  pixelShaderSize: number;
  showGradientBackdrop: boolean;
  gradientBackgroundPreset: string;
  hasBgPhoto: boolean;
  blinkOpacity: number | SharedValue<number>;
  segmentCount: number;
  spacer: number;
  isGlowEffect: boolean;
  glowBlurRadius: number;
  glowLayerColor: string;
  skiaStrokeWidth: number;
  dropShadow: number;
  previewTextColor: string;
  speechInsetPx: number;
}

const PIXELATE_SOURCE = Skia.RuntimeEffect.Make(`
  uniform shader content;
  uniform float pixelSize;

  half4 main(vec2 pos) {
    vec2 p = floor(pos / pixelSize) * pixelSize + (pixelSize / 2.0);
    return content.eval(p);
  }
`)!;

// Preview/Fullscreen 공통 Skia 마퀴 텍스트
export function MarqueeTextCanvas({
  canvas,
  isPixelEffect,
  pixelShaderSize,
  showGradientBackdrop,
  gradientBackgroundPreset,
  hasBgPhoto,
  blinkOpacity,
  segmentCount,
  spacer,
  isGlowEffect,
  glowBlurRadius,
  glowLayerColor,
  skiaStrokeWidth,
  dropShadow,
  previewTextColor,
  speechInsetPx,
}: MarqueeTextCanvasProps) {
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
            width={canvas.skiaCanvasLayout.width}
            height={canvas.skiaCanvasLayout.height}
            opacity={hasBgPhoto ? 0.4 : 1}
          />
        ) : null}
        <Group opacity={blinkOpacity} transform={canvas.skiaMarqueeTransform}>
          {[...Array(segmentCount)].map((_, seg) => {
            const segment = canvas.skiaTextWidth + spacer;
            const baseX = speechInsetPx + seg * segment;
            return (
              <Group key={`marquee-${seg}`}>
                {isGlowEffect ? (
                  <Group
                    layer={
                      <Paint>
                        <Blur blur={glowBlurRadius} mode="clamp" />
                      </Paint>
                    }
                  >
                    {canvas.skiaGlyphs.map((g, gi) => (
                      <SkiaText
                        key={`glow-${gi}`}
                        x={baseX + g.x}
                        y={g.y}
                        text={g.text}
                        font={canvas.skiaFont}
                        color={glowLayerColor}
                      >
                        {skiaStrokeWidth > 0 && (
                          <Paint
                            style="stroke"
                            strokeWidth={Math.round((skiaStrokeWidth / 100) * 30)}
                            color="white"
                          >
                            {dropShadow > 0 && (
                              <Shadow
                                dx={5}
                                dy={5}
                                blur={Math.round((dropShadow / 100) * 5)}
                                color="rgba(0, 0, 0, 0.5)"
                              />
                            )}
                          </Paint>
                        )}
                        {dropShadow > 0 && skiaStrokeWidth === 0 && (
                          <Shadow
                            dx={5}
                            dy={5}
                            blur={Math.round((dropShadow / 100) * 5)}
                            color="rgba(0, 0, 0, 0.5)"
                          />
                        )}
                      </SkiaText>
                    ))}
                  </Group>
                ) : null}
                {canvas.skiaGlyphs.map((g, gi) => (
                  <Group key={`${seg}-${gi}`}>
                    <SkiaText
                      x={baseX + g.x}
                      y={g.y}
                      text={g.text}
                      font={canvas.skiaFont}
                      color={previewTextColor}
                    >
                      {skiaStrokeWidth > 0 && (
                        <Paint
                          style="stroke"
                          strokeWidth={Math.round((skiaStrokeWidth / 100) * 30)}
                          color="white"
                        >
                          {dropShadow > 0 && (
                            <Shadow
                              dx={5}
                              dy={5}
                              blur={Math.round((dropShadow / 100) * 5)}
                              color="rgba(0, 0, 0, 0.5)"
                            />
                          )}
                        </Paint>
                      )}
                      {dropShadow > 0 && skiaStrokeWidth === 0 && (
                        <Shadow
                          dx={5}
                          dy={5}
                          blur={Math.round((dropShadow / 100) * 5)}
                          color="rgba(0, 0, 0, 0.5)"
                        />
                      )}
                    </SkiaText>
                  </Group>
                ))}
              </Group>
            );
          })}
        </Group>
      </Group>
    </Canvas>
  );
}
