import { DOT_MATRIX_TEXT_SOURCE } from "@/components/animation/dotMatrixTextShader";
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

function isNearWhiteColor(color: string): boolean {
  const s = color.trim().toLowerCase().replace(/\s/g, "");
  const hex = s.startsWith("#") ? s.slice(1) : null;
  if (hex) {
    let r: number, g: number, b: number;
    if (hex.length === 3 || hex.length === 4) {
      r = parseInt(hex[0] + hex[0], 16);
      g = parseInt(hex[1] + hex[1], 16);
      b = parseInt(hex[2] + hex[2], 16);
    } else {
      r = parseInt(hex.slice(0, 2), 16);
      g = parseInt(hex.slice(2, 4), 16);
      b = parseInt(hex.slice(4, 6), 16);
    }
    return r > 229 && g > 229 && b > 229;
  }
  const rgb = s.match(/^rgba?\((\d+),(\d+),(\d+)/);
  if (rgb) {
    return Number(rgb[1]) > 229 && Number(rgb[2]) > 229 && Number(rgb[3]) > 229;
  }
  return s === "white";
}

const OUTLINE_RING_DOT_SOURCE = Skia.RuntimeEffect.Make(`
  uniform shader content;
  uniform float dotSize;
  uniform float dotRadius;
  uniform float textThreshold;
  uniform float outlineRings;
  uniform float dotMaskAaScale;
  uniform float outlineLuminance;

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
    float aa = max(dotRadius * dotMaskAaScale, 0.5);
    float mask = 1.0 - smoothstep(dotRadius - aa, dotRadius + aa, d);
    return half4(half3(outlineLuminance), mask);
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
    textBlobs: canvas.skiaTextBlobs,
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

  const outlineLuminance = useMemo(
    () => isNearWhiteColor(backgroundColor) || isNearWhiteColor(previewTextColor) ? 0.5 : 1.0,
    [backgroundColor, previewTextColor],
  );

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
              outlineLuminance,
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
      outlineLuminance,
    ],
  );

  return (
    <Canvas style={{ flex: 1 }} opaque={false}>
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
