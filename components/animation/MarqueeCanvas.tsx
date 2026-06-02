import { DOT_MATRIX_TEXT_SOURCE } from "@/components/animation/dotMatrixTextShader";
import { GradientBackdrop } from "@/components/skia/GradientBackdrop";
import { type GradientBackdropId } from "@/constants/gradientBackgroundPresets";
import { usePreviewPanelCanvas } from "@/hooks/usePreviewPanelCanvas";
import { useTilePicture } from "@/hooks/useTilePicture";
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
  /** false면 Pixel이어도 글자는 도트 셰이더 없이 벡터 */
  isPixelTextDots: boolean;
  isPixelColorMix: boolean;
  pixelShaderSize: number;
  pixelTextShaderUniforms: {
    textThreshold: number;
    panelAlphaThreshold: number;
    dotRadiusScale: number;
    sampleReachScale: number;
    sampleReachYScale: number;
    dotMaskAaScale: number;
  };
  pixelMaskDilateRadius: number;
  pixelMaskErodeRadius: number;
  pixelGlyphPadCells: number;
  showGradientBackdrop: boolean;
  gradientBackgroundPreset: string;
  hasBgPhoto: boolean;
  blinkOpacity: number | SharedValue<number>;
  spacer: number;
  isGlowEffect: boolean;
  glowBlurRadius: number;
  glowLayerColor: string;
  skiaStrokeWidthPx: number;
  pixelOutlineRings: number;
  dropShadow: number;
  previewTextColor: string;
  backgroundColor: string;
}

// dotted 글자 실루엣 바깥 한 격자(이상)에 흰 도트 — content는 textOnly fill 마스크
const OUTLINE_RING_DOT_SOURCE = Skia.RuntimeEffect.Make(`
  uniform shader content;
  uniform float dotSize;
  uniform float dotRadius;
  uniform float textThreshold;
  uniform float outlineRings;
  uniform float dotMaskAaScale;

  float coverageAt(half4 s) {
    return s.a;
  }

  float bodyCoverage(vec2 p) {
    vec2 cellOrigin = floor(p / dotSize) * dotSize;
    float m = coverageAt(content.eval(p));
    m = max(m, coverageAt(content.eval(cellOrigin + vec2(dotSize * 0.2, dotSize * 0.5))));
    m = max(m, coverageAt(content.eval(cellOrigin + vec2(dotSize * 0.8, dotSize * 0.5))));
    m = max(m, coverageAt(content.eval(cellOrigin + vec2(dotSize * 0.5, dotSize * 0.2))));
    m = max(m, coverageAt(content.eval(cellOrigin + vec2(dotSize * 0.5, dotSize * 0.8))));
    return m;
  }

  float maxBodyAtRing(vec2 cellCenter, float ringIndex) {
    float step = dotSize * ringIndex;
    float m = 0.0;
    m = max(m, bodyCoverage(cellCenter + vec2( step, 0.0)));
    m = max(m, bodyCoverage(cellCenter + vec2(-step, 0.0)));
    m = max(m, bodyCoverage(cellCenter + vec2(0.0,  step)));
    m = max(m, bodyCoverage(cellCenter + vec2(0.0, -step)));
    m = max(m, bodyCoverage(cellCenter + vec2( step,  step)));
    m = max(m, bodyCoverage(cellCenter + vec2(-step,  step)));
    m = max(m, bodyCoverage(cellCenter + vec2( step, -step)));
    m = max(m, bodyCoverage(cellCenter + vec2(-step, -step)));
    return m;
  }

  half4 main(vec2 pos) {
    vec2 cellOrigin = floor(pos / dotSize) * dotSize;
    vec2 cellCenter = cellOrigin + dotSize * 0.5;
    float selfCov = bodyCoverage(cellCenter);
    if (selfCov >= textThreshold) {
      return half4(0.0);
    }

    float rings = clamp(outlineRings, 1.0, 4.0);
    bool ring1 = maxBodyAtRing(cellCenter, 1.0) >= textThreshold;
    bool ring2 = rings >= 2.0 && maxBodyAtRing(cellCenter, 2.0) >= textThreshold && !ring1;
    bool ring3 = rings >= 3.0 && maxBodyAtRing(cellCenter, 3.0) >= textThreshold
      && maxBodyAtRing(cellCenter, 1.0) < textThreshold
      && maxBodyAtRing(cellCenter, 2.0) < textThreshold;
    bool ring4 = rings >= 4.0 && maxBodyAtRing(cellCenter, 4.0) >= textThreshold
      && maxBodyAtRing(cellCenter, 1.0) < textThreshold
      && maxBodyAtRing(cellCenter, 2.0) < textThreshold
      && maxBodyAtRing(cellCenter, 3.0) < textThreshold;
    if (!(ring1 || ring2 || ring3 || ring4)) {
      return half4(0.0);
    }

    float d = distance(pos, cellCenter);
    float aa = max(dotRadius * dotMaskAaScale, 0.001);
    float coverage = 1.0 - smoothstep(dotRadius - aa, dotRadius + 0.001, d);
    float mask = step(0.5, coverage);
    return half4(1.0, 1.0, 1.0, mask);
  }
`)!;

export function MarqueeCanvas({
  canvas,
  isPixelEffect,
  isPixelTextDots,
  isPixelColorMix,
  pixelShaderSize,
  pixelTextShaderUniforms,
  pixelMaskDilateRadius,
  pixelMaskErodeRadius,
  pixelGlyphPadCells,
  showGradientBackdrop,
  gradientBackgroundPreset,
  hasBgPhoto,
  blinkOpacity,
  spacer,
  isGlowEffect,
  glowBlurRadius,
  glowLayerColor,
  skiaStrokeWidthPx,
  pixelOutlineRings,
  dropShadow,
  previewTextColor,
  backgroundColor,
}: MarqueeCanvasProps) {
  const blob = canvas.skiaTextBlob;
  const strokeWidthPx = skiaStrokeWidthPx;
  const dropShadowBlur = Math.round((dropShadow / 100) * 5);
  const layout = canvas.skiaCanvasLayout;
  const splitGlowFromDots = isPixelTextDots && isGlowEffect;
  const recordTextAsPixel = isPixelTextDots;
  const hasPixelOutlineDots = pixelOutlineRings > 0;

  const { stripPaint, glowStripPaint, stripWidth } = useTilePicture({
    blob,
    textWidthPx: canvas.skiaTextWidth,
    spacerPx: spacer,
    canvasWidthPx: layout.width,
    canvasHeightPx: layout.height,
    previewTextColor,
    glowLayerColor,
    isGlowEffect,
    isPixelEffect: recordTextAsPixel,
    isPixelColorMix: recordTextAsPixel && isPixelColorMix,
    pixelShaderSize,
    pixelGlyphPadCells,
    glowBlurRadius,
    strokeWidthPx,
    dropShadow,
    dropShadowBlur,
    glyphPositions: canvas.skiaGlyphPositions,
    font: canvas.skiaFont,
    backgroundColor,
    pixelMaskDilateRadius,
    pixelMaskErodeRadius,
  });

  const canDrawStrip = useMemo(
    () =>
      stripPaint != null && stripWidth > 0 && layout.width > 0 && layout.height > 0,
    [stripPaint, stripWidth, layout.width, layout.height],
  );

  const canDrawGlowStrip = useMemo(
    () =>
      splitGlowFromDots &&
      glowStripPaint != null &&
      stripWidth > 0 &&
      layout.height > 0,
    [splitGlowFromDots, glowStripPaint, stripWidth, layout.height],
  );

  const canDrawPixelOutlineDots = useMemo(
    () =>
      hasPixelOutlineDots &&
      stripPaint != null &&
      stripWidth > 0 &&
      layout.height > 0,
    [hasPixelOutlineDots, stripPaint, stripWidth, layout.height],
  );

  const pixelDotRadius = pixelShaderSize * pixelTextShaderUniforms.dotRadiusScale;

  const textDotShaderLayer = useMemo(
    () =>
      isPixelTextDots ? (
        <Paint>
          <RuntimeShader
            source={DOT_MATRIX_TEXT_SOURCE}
            uniforms={{
              dotSize: pixelShaderSize,
              dotRadius: pixelDotRadius,
              textThreshold: pixelTextShaderUniforms.textThreshold,
              panelAlphaThreshold: pixelTextShaderUniforms.panelAlphaThreshold,
              sampleReachScale: pixelTextShaderUniforms.sampleReachScale,
              sampleReachYScale: pixelTextShaderUniforms.sampleReachYScale,
              dotMaskAaScale: pixelTextShaderUniforms.dotMaskAaScale,
            }}
          />
        </Paint>
      ) : undefined,
    [isPixelTextDots, pixelShaderSize, pixelDotRadius, pixelTextShaderUniforms],
  );

  const outlineDotShaderLayer = useMemo(
    () =>
      hasPixelOutlineDots ? (
        <Paint>
          <RuntimeShader
            source={OUTLINE_RING_DOT_SOURCE}
            uniforms={{
              dotSize: pixelShaderSize,
              dotRadius: pixelDotRadius,
              textThreshold: pixelTextShaderUniforms.textThreshold,
              outlineRings: pixelOutlineRings,
              dotMaskAaScale: pixelTextShaderUniforms.dotMaskAaScale,
            }}
          />
        </Paint>
      ) : undefined,
    [
      hasPixelOutlineDots,
      pixelShaderSize,
      pixelDotRadius,
      pixelOutlineRings,
      pixelTextShaderUniforms,
    ],
  );

  return (
    <Canvas style={{ flex: 1 }} opaque={false}>
      {!isPixelEffect && showGradientBackdrop ? (
        <GradientBackdrop
          key={`gradient-${gradientBackgroundPreset}`}
          preset={gradientBackgroundPreset as GradientBackdropId}
          width={layout.width}
          height={layout.height}
        />
      ) : null}
      <Group opacity={blinkOpacity} transform={canvas.skiaMarqueeTransform}>
        {canDrawGlowStrip ? (
          <Rect
            x={0}
            y={0}
            width={stripWidth}
            height={layout.height}
            paint={glowStripPaint!}
          />
        ) : null}
        {isPixelTextDots && canDrawStrip ? (
          <Group layer={textDotShaderLayer}>
            <Rect
              x={0}
              y={0}
              width={stripWidth}
              height={layout.height}
              paint={stripPaint!}
            />
          </Group>
        ) : null}
        {isPixelEffect && !isPixelTextDots && canDrawStrip ? (
          <Rect
            x={0}
            y={0}
            width={stripWidth}
            height={layout.height}
            paint={stripPaint!}
          />
        ) : null}
        {canDrawPixelOutlineDots ? (
          <Group layer={outlineDotShaderLayer}>
            <Rect
              x={0}
              y={0}
              width={stripWidth}
              height={layout.height}
              paint={stripPaint!}
            />
          </Group>
        ) : null}
        {!isPixelEffect && canDrawStrip ? (
          <Rect
            x={0}
            y={0}
            width={stripWidth}
            height={layout.height}
            paint={stripPaint!}
          />
        ) : null}
      </Group>
    </Canvas>
  );
}
