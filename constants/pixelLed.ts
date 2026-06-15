import type { AppLocaleKey } from "@/constants/language";

/** 1줄도트기준px용 */
export const PIXEL_LED_DOT_SIZE_PX = 6;
/** 다줄도트기준px용 */
export const PIXEL_LED_DOT_SIZE_PX_MULTILINE = 6;
/** 슬라이더100%기준px용 */
export const PIXEL_LED_REF_FONT_PX = 100;
/** 도트최소크기px용 */
export const PIXEL_LED_DOT_MIN_PX = 1;


export type PixelFontCircleGrid = "galmuri11";

export function resolveReferencePixelLedDotPx(
  playOption: "one" | "multi",
  _locale?: AppLocaleKey,
): number {
  return playOption === "multi"
    ? PIXEL_LED_DOT_SIZE_PX_MULTILINE
    : PIXEL_LED_DOT_SIZE_PX;
}

/** playOption별 도트 최솟값*/
export function resolvePixelDotMinPx(playOption: "one" | "multi"): number {
  return playOption === "one" ? PIXEL_LED_DOT_MIN_PX * 3 : PIXEL_LED_DOT_MIN_PX;
}

export function scalePixelLedDotByFontSize(
  referenceDotPx: number,
  fontSizePx: number,
  minDotPx = PIXEL_LED_DOT_MIN_PX,
): number {
  const fontSize = Math.max(1, fontSizePx);
  const scaled = referenceDotPx * (fontSize / PIXEL_LED_REF_FONT_PX);
  return Math.max(
    minDotPx,
    Math.min(255, Math.round(scaled)),
  );
}

/** Pixel크기슬라이더하한용 */
export function resolvePixelFontSizeSliderMinPercent(params: {
  playOption: "one" | "multi";
  locale: AppLocaleKey;
  maxFontSizeAtFullSlider?: number;
  sliderFloor?: number;
}): number {
  const SLIDER_MAX = 100;
  const floor = params.sliderFloor ?? 20;
  const maxBox = Math.max(
    1,
    params.maxFontSizeAtFullSlider ?? (
      params.playOption === "one"
        ? PIXEL_LED_REF_FONT_PX * 3
        : (PIXEL_LED_REF_FONT_PX / 2) * 3
    ),
  );
  const refDot = resolveReferencePixelLedDotPx(params.playOption);
  const dotMinPx = resolvePixelDotMinPx(params.playOption);
  const minRenderPx = Math.ceil((dotMinPx * PIXEL_LED_REF_FONT_PX) / refDot);
  return Math.max(
    floor,
    Math.min(
      SLIDER_MAX,
      Math.ceil((minRenderPx * SLIDER_MAX) / maxBox),
    ),
  );
}

/** CircleGrid모드반환용 */
export function resolvePixelFontCircleGridMode(
  effectSelectedItems: string[],
): PixelFontCircleGrid | null {
  return hasPixelLedEffect(effectSelectedItems) ? "galmuri11" : null;
}

export function resolvePixelShaderSizePx(params: {
  playOption: "one" | "multi";
  locale?: AppLocaleKey;
  fontSizePx?: number;
}): number {
  const fontSize = Math.max(1, params.fontSizePx ?? PIXEL_LED_REF_FONT_PX);
  return scalePixelLedDotByFontSize(
    resolveReferencePixelLedDotPx(params.playOption),
    fontSize,
    resolvePixelDotMinPx(params.playOption),
  );
}

/** 배경프레임도트용 */
export function resolvePixelBackgroundShaderSizePx(params: {
  playOption: "one" | "multi";
  locale?: AppLocaleKey;
}): number {
  return resolveReferencePixelLedDotPx(params.playOption);
}

export type PixelTextShaderUniforms = {
  textThreshold: number;
  panelAlphaThreshold: number;
  dotRadiusScale: number;
  sampleReachScale: number;
  sampleReachYScale: number;
  dotMaskAaScale: number;
};

/** Pixel텍스트셰이더용 */
export function resolvePixelTextShaderUniforms(): PixelTextShaderUniforms {
  return {
    textThreshold: 0.28,
    panelAlphaThreshold: 0.08,
    dotRadiusScale: 0.40,
    sampleReachScale: 0.85,
    sampleReachYScale: 0.58,
    dotMaskAaScale: 0.18,
  };
}

/** CircleGrid패딩셀 */
export function pixelGlyphPanelPadCells(dotSizePx: number): number {
  return dotSizePx <= 6 ? 1 : 2;
}

export function hasPixelLedEffect(effectSelectedItems: string[]): boolean {
  return effectSelectedItems.includes("Pixel");
}

/** 구프리셋Pixel칩용 */
export function migrateLegacyEffectItems(items: string[]): string[] {
  return items.map((item) =>
    item === "Pixel2" || item === "PixelZhTC" ? "Pixel" : item,
  );
}

/** Skia도트셰이더uniform용 */
export function pixelLedDotUniforms(dotSize: number) {
  return { dotSize, dotRadius: dotSize * 0.40 };
}
