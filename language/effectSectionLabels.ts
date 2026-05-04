import type { AppLocaleKey } from "@/constants/language";
import type { GoogleSheetLocaleRow } from "@/hooks/useGoogleSheets";
import {
  pickLocaleFromSheetRows,
  type SheetRowPickOptions,
} from "@/language/matchSheetRows";

export type EffectSectionLabelKey =
  | "effectHeading"
  | "backgroundEffectHeading"
  | "gradientBackgroundHeading"
  | "noEffect"
  | "effectGlowIntensity"
  | "effectBlinkFrequency"
  | "effectPixelBlockSize"
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
  },
  backgroundEffectHeading: {
    ko: "배경 효과",
    en: "Background Effect",
    ja: "背景エフェクト",
    zhTC: "背景特效",
    zhSC: "背景特效",
  },
  gradientBackgroundHeading: {
    ko: "그라데이션 배경",
    en: "Gradient background",
    ja: "グラデーション背景",
    zhTC: "漸層背景",
    zhSC: "渐变背景",
  },
  noEffect: {
    ko: "효과 없음",
    en: "No Effect",
    ja: "なし",
    zhTC: "無效果",
    zhSC: "无效果",
  },
  effectGlowIntensity: {
    ko: "글로우 강도",
    en: "Glow Intensity",
    ja: "グロー強度",
    zhTC: "發光強度",
    zhSC: "发光强度",
  },
  effectBlinkFrequency: {
    ko: "깜빡임 빈도",
    en: "Blink Frequency",
    ja: "点滅",
    zhTC: "閃爍頻率",
    zhSC: "闪烁频率",
  },
  effectPixelBlockSize: {
    ko: "픽셀 블록 크기",
    en: "Pixel block size",
    ja: "ピクセルブロックサイズ",
    zhTC: "像素區塊大小",
    zhSC: "像素块大小",
  },
  effectBold: {
    ko: "굵게",
    en: "Bold",
    ja: "太字",
    zhTC: "粗體",
    zhSC: "加粗",
  },
  effectBlink: {
    ko: "깜빡임",
    en: "Blink",
    ja: "点滅",
    zhTC: "閃爍",
    zhSC: "闪烁",
  },
  effectPixel: {
    ko: "픽셀",
    en: "Pixel",
    ja: "ピクセル",
    zhTC: "像素",
    zhSC: "像素",
  },
  effectGlow: {
    ko: "글로우",
    en: "Glow",
    ja: "グロー",
    zhTC: "發光",
    zhSC: "发光",
  },
  effectGradient: {
    ko: "그라데이션",
    en: "Gradient",
    ja: "グラデーション",
    zhTC: "漸層",
    zhSC: "渐变",
  },
};

/**
 * 게시 시트에서 효과·배경 관련 줄을 **우선** 집는다(`strictSheetRow` 없음 → 그 줄에
 * 현재 언어 칸이 비면 C/B 앵커 매칭으로 이어짐). 줄 번호는 사용 중인 CSV와 맞출 것.
 */
const EFFECT_SHEET_PICK: Partial<
  Record<EffectSectionLabelKey, SheetRowPickOptions>
> = {
  effectBlinkFrequency: { sheetRow: 24 },
  backgroundEffectHeading: { sheetRow: 25 },
  effectPixelBlockSize: { sheetRow: 26 },
  effectGlowIntensity: { sheetRow: 27 },
  gradientBackgroundHeading: { sheetRow: 28 },
};

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
    EFFECT_SHEET_PICK[key],
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
