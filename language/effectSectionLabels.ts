import type { AppLocaleKey } from "@/constants/language";
import type { GoogleSheetLocaleRow } from "@/hooks/useGoogleSheets";
import { pickLocaleFromSheetRows } from "@/language/matchSheetRows";

export type EffectSectionLabelKey =
  | "effectHeading"
  | "backgroundEffectHeading"
  | "gradientBackgroundHeading"
  | "noEffect"
  | "effectGlowIntensity"
  | "effectBlinkFrequency"
  | "effectPixelationHeading"
  | "effectMix"
  | "effectPixelColorMix"
  | "effectBold"
  | "effectBlink"
  | "effectPixel"
  | "effectGlow"
  | "effectGradient";

const LABELS: Record<EffectSectionLabelKey, Record<AppLocaleKey, string>> = {
  effectHeading: {
    ko: "효과",
    en: "Effects",
    ja: "エフェクト",
    zhTC: "特效",
    zhSC: "特效",
    fr: "Effets",
    es: "Efectos",
  },
  backgroundEffectHeading: {
    ko: "배경 효과",
    en: "Background Effect",
    ja: "背景エフェクト",
    zhTC: "背景特效",
    zhSC: "背景特效",
    fr: "Effet d'arrière-plan",
    es: "Efecto de fondo",
  },
  gradientBackgroundHeading: {
    ko: "그라데이션 배경",
    en: "Gradient background",
    ja: "グラデーション背景",
    zhTC: "漸層背景",
    zhSC: "渐变背景",
    fr: "Arrière-plan dégradé",
    es: "Fondo degradado",
  },
  noEffect: {
    ko: "효과 없음",
    en: "No Effect",
    ja: "なし",
    zhTC: "無效果",
    zhSC: "无效果",
    fr: "Aucun effet",
    es: "Sin efecto",
  },
  effectGlowIntensity: {
    ko: "글로우 강도",
    en: "Glow Intensity",
    ja: "グロー強度",
    zhTC: "發光強度",
    zhSC: "发光强度",
    fr: "Intensité de la lueur",
    es: "Intensidad de brillo",
  },
  effectBlinkFrequency: {
    ko: "깜빡임 빈도",
    en: "Blink Frequency",
    ja: "点滅",
    zhTC: "閃爍頻率",
    zhSC: "闪烁频率",
    fr: "Fréquence de clignotement",
    es: "Frecuencia de parpadeo",
  },
  effectPixelationHeading: {
    ko: "Pixelation",
    en: "Pixelation",
    ja: "Pixelation",
    zhTC: "Pixelation",
    zhSC: "Pixelation",
    fr: "Pixelation",
    es: "Pixelation",
  },
  effectMix: {
    ko: "mix",
    en: "mix",
    ja: "mix",
    zhTC: "mix",
    zhSC: "mix",
    fr: "mix",
    es: "mix",
  },
  effectPixelColorMix: {
    ko: "픽셀 색상 혼합",
    en: "Pixel Color Mix",
    ja: "ピクセル色ミックス",
    zhTC: "像素色彩混合",
    zhSC: "像素颜色混合",
    fr: "Mélange de couleurs de pixels",
    es: "Mezcla de color de píxeles",
  },
  effectBold: {
    ko: "굵게",
    en: "Bold",
    ja: "太字",
    zhTC: "粗體",
    zhSC: "加粗",
    fr: "Gras",
    es: "Negrita",
  },
  effectBlink: {
    ko: "깜빡임",
    en: "Blink",
    ja: "点滅",
    zhTC: "閃爍",
    zhSC: "闪烁",
    fr: "Clignotement",
    es: "Parpadeo",
  },
  effectPixel: {
    ko: "픽셀",
    en: "Pixel",
    ja: "ピクセル",
    zhTC: "像素",
    zhSC: "像素",
    fr: "Pixel",
    es: "Píxel",
  },
  effectGlow: {
    ko: "글로우",
    en: "Glow",
    ja: "グロー",
    zhTC: "發光",
    zhSC: "发光",
    fr: "Lueur",
    es: "Brillo",
  },
  effectGradient: {
    ko: "그라데이션",
    en: "Gradient",
    ja: "グラデーション",
    zhTC: "漸層",
    zhSC: "渐变",
    fr: "Dégradé",
    es: "Degradado",
  },
};

/** 시트 C열(영어)·B열(한글)이 `LABELS[key].en` / `.ko`와 일치하는 행에서 현재 locale 값을 씀. */

export function tEffectSectionLabel(
  key: EffectSectionLabelKey,
  locale: AppLocaleKey,
  sheetRows?: GoogleSheetLocaleRow[] | null,
): string {
  const fb = LABELS[key];
  const fromSheet = pickLocaleFromSheetRows(
    sheetRows,
    locale,
    fb.en,
    fb.ko,
  );
  if (fromSheet) return fromSheet;
  const s = fb[locale];
  if (s) return s;
  return fb.en;
}

const EFFECT_ID_TO_KEY: Partial<Record<string, EffectSectionLabelKey>> = {
  Bold: "effectBold",
  Blink: "effectBlink",
  Pixel: "effectPixel",
  Glow: "effectGlow",
  Gradient: "effectGradient",
};

export function effectChipLabel(
  effectId: string,
  locale: AppLocaleKey,
  sheetRows?: GoogleSheetLocaleRow[] | null,
): string {
  const key = EFFECT_ID_TO_KEY[effectId];
  if (!key) return effectId;
  return tEffectSectionLabel(key, locale, sheetRows);
}
