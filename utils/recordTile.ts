import {
  FilterMode,
  PaintStyle,
  Skia,
  TileMode,
  type SkImageFilter,
  type SkPaint,
  type SkPicture,
  type SkTextBlob,
} from "@shopify/react-native-skia";
import type { GlyphLedPanelRect } from "@/utils/glyphLedPanels";

/** Pixel: 글자 패널 배경(셰이더에서 꺼진 LED 영역) */
const GLYPH_PANEL_MASK_ALPHA = 0.22;

const DROP_SHADOW_RGBA = Skia.Color("rgba(0, 0, 0, 0.5)");

export type MarqueeTileLayerMode = "full" | "glowOnly" | "textOnly";

export type RecordMarqueeTileParams = {
  blob: SkTextBlob;
  periodWidth: number;
  height: number;
  previewTextColor: string;
  glowLayerColor: string;
  isGlowEffect: boolean;
  glowBlurRadius: number;
  strokeWidthPx: number;
  dropShadow: number;
  dropShadowBlur: number;
  layerMode?: MarqueeTileLayerMode;
  /** Pixel 도트용 마스크를 살짝 두껍게 (얇은 획 보강) */
  maskDilateRadius?: number;
  /** Pixel: 셀당 LED 1개 — 마스크 경계 흐림 최소화 */
  pixelCrispMask?: boolean;
  /** Pixel: 글자 1자당 LED 패널 사각형 */
  glyphLedPanels?: GlyphLedPanelRect[];
};

function composeFilters(
  outer: SkImageFilter | null,
  inner: SkImageFilter | null,
): SkImageFilter | null {
  if (!outer) return inner;
  if (!inner) return outer;
  return Skia.ImageFilter.MakeCompose(outer, inner);
}

function withDropShadow(blur: number): SkImageFilter {
  return Skia.ImageFilter.MakeDropShadow(
    5,
    5,
    blur,
    blur,
    DROP_SHADOW_RGBA,
  );
}

function withBlur(radius: number): SkImageFilter {
  return Skia.ImageFilter.MakeBlur(radius, radius, TileMode.Clamp);
}

function setPaintFilters(paint: SkPaint, ...filters: (SkImageFilter | null)[]) {
  let chain: SkImageFilter | null = null;
  for (let i = filters.length - 1; i >= 0; i--) {
    const f = filters[i];
    if (!f) continue;
    chain = composeFilters(f, chain);
  }
  if (chain) {
    paint.setImageFilter(chain);
  }
}

function drawBlobLayer(
  canvas: ReturnType<ReturnType<typeof Skia.PictureRecorder>["beginRecording"]>,
  blob: SkTextBlob,
  params: {
    fillColor: string;
    strokeWidthPx: number;
    dropShadowBlur: number;
    dropShadowEnabled: boolean;
    glowBlurRadius?: number;
  },
) {
  const { strokeWidthPx, dropShadowBlur, dropShadowEnabled, glowBlurRadius } =
    params;
  const blur =
    glowBlurRadius != null && glowBlurRadius > 0
      ? withBlur(glowBlurRadius)
      : null;

  if (strokeWidthPx > 0) {
    const stroke = Skia.Paint();
    stroke.setAntiAlias(true);
    stroke.setStyle(PaintStyle.Stroke);
    stroke.setStrokeWidth(strokeWidthPx);
    stroke.setColor(Skia.Color("white"));
    if (dropShadowEnabled) {
      setPaintFilters(stroke, blur, withDropShadow(dropShadowBlur));
    } else if (blur) {
      stroke.setImageFilter(blur);
    }
    canvas.drawTextBlob(blob, 0, 0, stroke);
  }

  const fill = Skia.Paint();
  fill.setAntiAlias(true);
  fill.setColor(Skia.Color(params.fillColor));
  if (dropShadowEnabled && strokeWidthPx === 0) {
    setPaintFilters(fill, blur, withDropShadow(dropShadowBlur));
  } else if (blur) {
    fill.setImageFilter(blur);
  }
  canvas.drawTextBlob(blob, 0, 0, fill);
}

/** 텍스트 1벌 + 간격의 타일을 SkPicture로 기록합니다. */
export function recordTile(
  p: RecordMarqueeTileParams,
): SkPicture | null {
  const periodWidth = Math.max(1, Math.ceil(p.periodWidth));
  const height = Math.max(1, Math.ceil(p.height));
  const dropShadowEnabled = p.dropShadow > 0;
  const mode = p.layerMode ?? "full";
  const drawGlow =
    p.isGlowEffect && (mode === "full" || mode === "glowOnly");
  const drawText = mode === "full" || mode === "textOnly";

  const bounds = Skia.XYWHRect(0, 0, periodWidth, height);
  const recorder = Skia.PictureRecorder();
  const canvas = recorder.beginRecording(bounds);

  if (drawGlow) {
    drawBlobLayer(canvas, p.blob, {
      fillColor: p.glowLayerColor,
      strokeWidthPx: p.strokeWidthPx,
      dropShadowBlur: p.dropShadowBlur,
      dropShadowEnabled,
      glowBlurRadius: p.glowBlurRadius,
    });
  }

  if (drawText) {
    if (mode === "textOnly") {
      const dilate = Math.max(0, p.maskDilateRadius ?? 0);
      const panels = p.glyphLedPanels ?? [];
      if (panels.length > 0) {
        const panelPaint = Skia.Paint();
        panelPaint.setAntiAlias(false);
        panelPaint.setColor(
          Skia.Color(`rgba(255,255,255,${GLYPH_PANEL_MASK_ALPHA})`),
        );
        for (const panel of panels) {
          canvas.drawRect(
            Skia.XYWHRect(panel.left, panel.top, panel.width, panel.height),
            panelPaint,
          );
        }
      }
      const fill = Skia.Paint();
      fill.setAntiAlias(!p.pixelCrispMask);
      fill.setColor(Skia.Color(p.previewTextColor));
      if (dilate > 0) {
        fill.setImageFilter(Skia.ImageFilter.MakeDilate(dilate, dilate, null));
      }
      canvas.drawTextBlob(p.blob, 0, 0, fill);
    } else {
      drawBlobLayer(canvas, p.blob, {
        fillColor: p.previewTextColor,
        strokeWidthPx: p.strokeWidthPx,
        dropShadowBlur: p.dropShadowBlur,
        dropShadowEnabled,
      });
    }
  }

  return recorder.finishRecordingAsPicture();
}

/** 글로우·stroke·shadow가 타일 경계에서 잘리지 않도록 하는 여유(px) */
export function computeEffectSpace(params: {
  isGlowEffect: boolean;
  glowBlurRadius: number;
  strokeWidthPx: number;
  dropShadow: number;
}): number {
  return Math.ceil(
    (params.isGlowEffect ? params.glowBlurRadius * 2.5 : 0) +
      params.strokeWidthPx * 2 +
      (params.dropShadow > 0 ? 12 : 0) +
      2,
  );
}

export function computeMarqueeTilePeriod(params: {
  textWidthPx: number;
  spacerPx: number;
  effectBleedPx: number;
}): number {
  return Math.max(
    1,
    params.textWidthPx + params.spacerPx + params.effectBleedPx,
  );
}

export function makeMarqueePictureShader(
  picture: SkPicture,
  tileWidth: number,
  tileHeight: number,
  filterMode: FilterMode = FilterMode.Linear,
) {
  const tileRect = Skia.XYWHRect(
    0,
    0,
    Math.max(1, tileWidth),
    Math.max(1, tileHeight),
  );
  return picture.makeShader(
    TileMode.Repeat,
    TileMode.Clamp,
    filterMode,
    undefined,
    tileRect,
  );
}

export function makeMarqueeStripPaint(
  picture: SkPicture,
  tileWidth: number,
  tileHeight: number,
): SkPaint {
  const paint = Skia.Paint();
  paint.setShader(
    makeMarqueePictureShader(picture, tileWidth, tileHeight, FilterMode.Linear),
  );
  return paint;
}

/** 뷰포트 + 스크롤 여유를 덮을 스트립 너비 */
export function resolveMarqueeStripWidth(
  viewportWidthPx: number,
  periodPx: number,
): number {
  const viewport = Math.max(0, viewportWidthPx);
  const period = Math.max(1, periodPx);
  return Math.max(viewport + period * 2, period * 2);
}
