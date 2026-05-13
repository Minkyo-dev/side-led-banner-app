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
  TextBlob,
} from "@shopify/react-native-skia";
import React from "react";
import type { SharedValue } from "react-native-reanimated";

interface MarqueeCanvasProps {
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
}

const PIXELATE_SOURCE = Skia.RuntimeEffect.Make(`
  uniform shader content;
  uniform float pixelSize;

  half4 main(vec2 pos) {
    vec2 p = floor(pos / pixelSize) * pixelSize + (pixelSize / 2.0);
    return content.eval(p);
  }
`)!;

// Preview/Fullscreen 공통 Skia Marquee Text
export function MarqueeCanvas({
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
}: MarqueeCanvasProps) {
  const blob = canvas.skiaTextBlob;
  const strokeWidthPx = Math.round((skiaStrokeWidth / 100) * 30);
  const dropShadowBlur = Math.round((dropShadow / 100) * 5);

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
          {blob
            ? [...Array(segmentCount)].map((_, seg) => {
                const segment = canvas.skiaTextWidth + spacer;
                const baseX = seg * segment;
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
                        <TextBlob
                          x={baseX}
                          y={0}
                          blob={blob}
                          color={glowLayerColor}
                        >
                          {skiaStrokeWidth > 0 && (
                            <Paint
                              style="stroke"
                              strokeWidth={strokeWidthPx}
                              color="white"
                            >
                              {dropShadow > 0 && (
                                <Shadow
                                  dx={5}
                                  dy={5}
                                  blur={dropShadowBlur}
                                  color="rgba(0, 0, 0, 0.5)"
                                />
                              )}
                            </Paint>
                          )}
                          {dropShadow > 0 && skiaStrokeWidth === 0 && (
                            <Shadow
                              dx={5}
                              dy={5}
                              blur={dropShadowBlur}
                              color="rgba(0, 0, 0, 0.5)"
                            />
                          )}
                        </TextBlob>
                      </Group>
                    ) : null}
                    <Group key={`main-${seg}`}>
                      <TextBlob
                        x={baseX}
                        y={0}
                        blob={blob}
                        color={previewTextColor}
                      >
                        {skiaStrokeWidth > 0 && (
                          <Paint
                            style="stroke"
                            strokeWidth={strokeWidthPx}
                            color="white"
                          >
                            {dropShadow > 0 && (
                              <Shadow
                                dx={5}
                                dy={5}
                                blur={dropShadowBlur}
                                color="rgba(0, 0, 0, 0.5)"
                              />
                            )}
                          </Paint>
                        )}
                        {dropShadow > 0 && skiaStrokeWidth === 0 && (
                          <Shadow
                            dx={5}
                            dy={5}
                            blur={dropShadowBlur}
                            color="rgba(0, 0, 0, 0.5)"
                          />
                        )}
                      </TextBlob>
                    </Group>
                  </Group>
                );
              })
            : null}
        </Group>
      </Group>
    </Canvas>
  );
}
