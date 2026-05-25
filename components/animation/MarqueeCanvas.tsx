import { GradientBackdrop } from "@/components/skia/GradientBackdrop";
import { type GradientBackdropId } from "@/constants/gradientBackgroundPresets";
import { useTilePicture } from "@/hooks/useTilePicture";
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
  skiaStrokeWidthPx: number;
  pixelOutlineRings: number;
  dropShadow: number;
  previewTextColor: string;
  backgroundColor: string;
}

// LED: 셀당 1도트. 타일에 글자별 패널(저알파) + 글자(고알파) 기록
const DOT_MATRIX_SOURCE = Skia.RuntimeEffect.Make(`
  uniform shader content;
  uniform float dotSize;
  uniform float dotRadius;
  uniform float textThreshold;
  uniform float panelAlphaThreshold;
  uniform float offLedR;
  uniform float offLedG;
  uniform float offLedB;
  uniform float offLedAlpha;

  half3 unpremultiply(half4 c) {
    return c.a > 0.001 ? c.rgb / c.a : half3(0.0);
  }

  float ledDotMask(vec2 pos, vec2 cellCenter) {
    float d = distance(pos, cellCenter);
    float aa = dotRadius * 0.12;
    return 1.0 - smoothstep(dotRadius - aa, dotRadius + 0.001, d);
  }

  half4 main(vec2 pos) {
    vec2 cellOrigin = floor(pos / dotSize) * dotSize;
    vec2 cellCenter = cellOrigin + dotSize * 0.5;
    float mask = ledDotMask(pos, cellCenter);
    if (mask <= 0.0) {
      return half4(0.0);
    }

    half4 sampled = content.eval(cellCenter);
    if (sampled.a < panelAlphaThreshold) {
      return half4(0.0);
    }

    bool on = sampled.a >= textThreshold;

    if (on) {
      half3 rgb = unpremultiply(sampled);
      return half4(rgb * mask, mask);
    }

    return half4(offLedR, offLedG, offLedB, offLedAlpha * mask);
  }
`)!;

function resolveOffLedUniforms(backgroundColor: string) {
  const raw = backgroundColor.replace("#", "").trim().toLowerCase();
  const hex = raw.length === 6 ? raw : "000000";
  const r = Number.parseInt(hex.slice(0, 2), 16) / 255;
  const g = Number.parseInt(hex.slice(2, 4), 16) / 255;
  const b = Number.parseInt(hex.slice(4, 6), 16) / 255;
  const lum = 0.299 * r + 0.587 * g + 0.114 * b;
  if (lum < 0.45) {
    return { offLedR: 0.2, offLedG: 0.2, offLedB: 0.22, offLedAlpha: 0.92 };
  }
  return { offLedR: 0.72, offLedG: 0.72, offLedB: 0.76, offLedAlpha: 0.88 };
}

// dotted 글자 실루엣 바깥 한 격자(이상)에 흰 도트 — content는 textOnly fill 마스크
const OUTLINE_RING_DOT_SOURCE = Skia.RuntimeEffect.Make(`
  uniform shader content;
  uniform float dotSize;
  uniform float dotRadius;
  uniform float textThreshold;
  uniform float outlineRings;

  float coverageAt(half4 s) {
    return s.a;
  }

  float bodyCoverage(vec2 p) {
    return coverageAt(content.eval(p));
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
    float aa = dotRadius * 0.12;
    float mask = 1.0 - smoothstep(dotRadius - aa, dotRadius + 0.001, d);
    return half4(1.0, 1.0, 1.0, mask);
  }
`)!;

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
  const splitGlowFromDots = isPixelEffect && isGlowEffect;
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
    isPixelEffect,
    pixelShaderSize,
    glowBlurRadius,
    strokeWidthPx,
    dropShadow,
    dropShadowBlur,
    glyphPositions: canvas.skiaGlyphPositions,
    font: canvas.skiaFont,
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

  const offLedUniforms = useMemo(
    () => resolveOffLedUniforms(backgroundColor),
    [backgroundColor],
  );

  const dotShaderLayer = useMemo(
    () =>
      isPixelEffect ? (
        <Paint>
          <RuntimeShader
            source={DOT_MATRIX_SOURCE}
            uniforms={{
              dotSize: pixelShaderSize,
              dotRadius: pixelShaderSize * 0.44,
              textThreshold: 0.55,
              panelAlphaThreshold: 0.08,
              ...offLedUniforms,
            }}
          />
        </Paint>
      ) : undefined,
    [isPixelEffect, pixelShaderSize, offLedUniforms],
  );

  const outlineDotShaderLayer = useMemo(
    () =>
      hasPixelOutlineDots ? (
        <Paint>
          <RuntimeShader
            source={OUTLINE_RING_DOT_SOURCE}
            uniforms={{
              dotSize: pixelShaderSize,
              dotRadius: pixelShaderSize * 0.44,
              textThreshold: 0.55,
              outlineRings: pixelOutlineRings,
            }}
          />
        </Paint>
      ) : undefined,
    [hasPixelOutlineDots, pixelShaderSize, pixelOutlineRings],
  );

  return (
    <Canvas style={{ flex: 1 }} opaque={false}>
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
        {canDrawGlowStrip ? (
          <Rect
            x={0}
            y={0}
            width={stripWidth}
            height={layout.height}
            paint={glowStripPaint!}
          />
        ) : null}
        {isPixelEffect && canDrawStrip ? (
          <Group layer={dotShaderLayer}>
            <Rect
              x={0}
              y={0}
              width={stripWidth}
              height={layout.height}
              paint={stripPaint!}
            />
          </Group>
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
