import type { AppLocaleKey } from "@/constants/language";

const CJK_DOT_SCALE = 1;

/** 1줄도트기준px용 */
export const PIXEL_LED_DOT_SIZE_PX = 8;
/** 다줄도트기준px용 */
export const PIXEL_LED_DOT_SIZE_PX_MULTILINE = 6;
/** 슬라이더100%기준px용 */
export const PIXEL_LED_REF_FONT_PX = 100;
/** 도트최소크기px용 */
export const PIXEL_LED_DOT_MIN_PX = 2;

export const PIXEL_LED_DOT_MASK_AA_DEFAULT = 0.12;
export const PIXEL_LED_DOT_MASK_AA_CRISP = 0.08;
export const PIXEL_LED_DOT_MASK_AA_SOFT = 0.18;

export type PixelFontCircleGrid = "galmuri11";

function isCjkLocale(locale: AppLocaleKey): boolean {
  return locale === "ja" || locale === "zhTC" || locale === "zhSC";
}

export function resolveReferencePixelLedDotPx(
  playOption: "one" | "multi",
  locale: AppLocaleKey,
): number {
  const scale = isCjkLocale(locale) ? CJK_DOT_SCALE : 1;
  return playOption === "multi"
    ? PIXEL_LED_DOT_SIZE_PX_MULTILINE * scale
    : PIXEL_LED_DOT_SIZE_PX * scale;
}

export function scalePixelLedDotByFontSize(
  referenceDotPx: number,
  fontSizePx: number,
): number {
  const fontSize = Math.max(1, fontSizePx);
  const scaled = referenceDotPx * (fontSize / PIXEL_LED_REF_FONT_PX);
  return Math.max(
    PIXEL_LED_DOT_MIN_PX,
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
  const floor = params.sliderFloor ?? 20;
  const maxBox = Math.max(1, params.maxFontSizeAtFullSlider ?? PIXEL_LED_REF_FONT_PX);
  const refDot = resolveReferencePixelLedDotPx(params.playOption, params.locale);
  const minRenderPx = Math.ceil(
    ((PIXEL_LED_DOT_MIN_PX - 0.5) * PIXEL_LED_REF_FONT_PX) / refDot,
  );
  return Math.max(
    floor,
    Math.min(
      PIXEL_LED_REF_FONT_PX,
      Math.ceil((minRenderPx * PIXEL_LED_REF_FONT_PX) / maxBox),
    ),
  );
}

export function isGalmuriPixelMode(
  locale: AppLocaleKey,
  effectSelectedItems: string[],
): boolean {
  return (
    (locale === "zhTC" || locale === "ja") &&
    effectSelectedItems.includes("Pixel")
  );
}

export function resolvePixelFontCircleGridMode(
  locale: AppLocaleKey,
  effectSelectedItems: string[],
): PixelFontCircleGrid | null {
  return isGalmuriPixelMode(locale, effectSelectedItems) ? "galmuri11" : null;
}

export function resolvePixelShaderSizePx(params: {
  playOption: "one" | "multi";
  locale: AppLocaleKey;
  fontSizePx?: number;
}): number {
  const fontSize = Math.max(1, params.fontSizePx ?? PIXEL_LED_REF_FONT_PX);
  return scalePixelLedDotByFontSize(
    resolveReferencePixelLedDotPx(params.playOption, params.locale),
    fontSize,
  );
}

/** 배경프레임도트용 */
export function resolvePixelBackgroundShaderSizePx(params: {
  playOption: "one" | "multi";
  locale: AppLocaleKey;
}): number {
  return resolveReferencePixelLedDotPx(params.playOption, params.locale);
}

export type PixelTextShaderUniforms = {
  textThreshold: number;
  panelAlphaThreshold: number;
  dotRadiusScale: number;
  sampleReachScale: number;
  sampleReachYScale: number;
  dotMaskAaScale: number;
};

const GALMURI_GRID_UNIFORMS: Omit<
  PixelTextShaderUniforms,
  "textThreshold" | "panelAlphaThreshold"
> = {
  dotRadiusScale: 0.46,
  sampleReachScale: 0.85,
  sampleReachYScale: 0.58,
  dotMaskAaScale: PIXEL_LED_DOT_MASK_AA_CRISP,
};

export function resolvePixelTextShaderUniforms(
  locale: AppLocaleKey,
  dotSizePx: number,
  options?: {
    koThinStrokes?: boolean;
    pixelFontCircleGrid?: PixelFontCircleGrid | null;
  },
): PixelTextShaderUniforms {
  const base: PixelTextShaderUniforms = {
    textThreshold: 0.45,
    panelAlphaThreshold: 0.12,
    dotRadiusScale: 0.46,
    sampleReachScale: 1,
    sampleReachYScale: 1,
    dotMaskAaScale: PIXEL_LED_DOT_MASK_AA_CRISP,
  };
  if (options?.pixelFontCircleGrid) {
    return {
      textThreshold: 0.28,
      panelAlphaThreshold: 0.08,
      ...GALMURI_GRID_UNIFORMS,
    };
  }
  if (options?.koThinStrokes) {
    const tight = dotSizePx <= 5;
    return {
      ...base,
      sampleReachScale: tight ? 0.58 : 0.64,
      sampleReachYScale: tight ? 0.24 : 0.32,
      dotRadiusScale: tight ? 0.35 : 0.38,
    };
  }
  if (!isCjkLocale(locale)) return base;
  const smallGrid = dotSizePx <= 6;
  return {
    ...base,
    textThreshold: smallGrid ? 0.4 : base.textThreshold,
  };
}

export function pixelGlyphPanelPadCells(
  locale: AppLocaleKey,
  dotSizePx: number,
  circleGrid?: boolean,
): number {
  if (circleGrid) return dotSizePx <= 6 ? 1 : 2;
  if (!isCjkLocale(locale)) return 1;
  return dotSizePx <= 6 ? 0 : 1;
}

export function hasPixelLedEffect(effectSelectedItems: string[]): boolean {
  return effectSelectedItems.includes("Pixel");
}

export function isPixelFontBoDianMode(
  locale: AppLocaleKey,
  effectSelectedItems: string[],
): boolean {
  return locale === "zhSC" && effectSelectedItems.includes("Pixel");
}

/** 글자도트셰이더표시용 */
export function hasPixelTextDotShader(
  locale: AppLocaleKey,
  effectSelectedItems: string[],
): boolean {
  if (resolvePixelFontCircleGridMode(locale, effectSelectedItems)) return true;
  return hasPixelLedEffect(effectSelectedItems) && locale !== "zhSC";
}

/** 구프리셋Pixel칩용 */
export function migrateLegacyEffectItems(items: string[]): string[] {
  return items.map((item) =>
    item === "Pixel2" || item === "PixelZhTC" ? "Pixel" : item,
  );
}

/** Skia도트셰이더uniform용 */
export function pixelLedDotUniforms(dotSize: number) {
  return { dotSize, dotRadius: dotSize * 0.46 };
}
