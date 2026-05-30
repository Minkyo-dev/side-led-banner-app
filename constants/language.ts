/**
 * 앱 표시 언어 슬롯(기기/앱 설정·스프레드시트 B~F 열과 동일한 다섯 값).
 */
export const APP_LOCALE_KEYS = ["ko", "en", "ja", "zhTC", "zhSC"] as const;

export type AppLocaleKey = (typeof APP_LOCALE_KEYS)[number];

/** `system`이면 기기 언어에서 `AppLocaleKey`를 추론합니다. */
export type AppLanguagePreference = "system" | AppLocaleKey;
//AppLocalKey => AppLanguagePreference로 변환

/**
 * 한자권 Pixel LED 격자 — ko/en 대비 약 절반.
 * 이보다 작추면 셀 수가 줄어 획 디테일이 사라져 오히려 뭉개짐.
 */
export const CJK_PIXEL_DOT_LOCALE_SCALE = 0.5;

export function isCjkAppLocale(locale: AppLocaleKey): boolean {
  return locale === "ja" || locale === "zhTC" || locale === "zhSC";
}

export function pixelDotLocaleScale(locale: AppLocaleKey): number {
  return isCjkAppLocale(locale) ? CJK_PIXEL_DOT_LOCALE_SCALE : 1;
}

/** 최단 입점(방사형) 보조 — 한자는 threshold를 약간만 낮춤 */
export function resolvePixelTextShaderUniforms(
  locale: AppLocaleKey,
  dotSizePx: number,
): { textThreshold: number; panelAlphaThreshold: number } {
  const base = { textThreshold: 0.45, panelAlphaThreshold: 0.08 };
  if (!isCjkAppLocale(locale)) return base;
  const smallGrid = dotSizePx <= 6;
  return {
    textThreshold: smallGrid ? 0.38 : 0.42,
    panelAlphaThreshold: 0.06,
  };
}

/** 작은 격자에서 패널 패딩이 겹치면 흰 도트 fringe — 한자·소형 셀은 패딩 축소 */
export function pixelGlyphPanelPadCells(
  locale: AppLocaleKey,
  dotSizePx: number,
): number {
  if (!isCjkAppLocale(locale)) return 1;
  return dotSizePx <= 6 ? 0 : 1;
}