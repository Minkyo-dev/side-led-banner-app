import type { AppLocaleKey } from "@/constants/language";
import type { GoogleSheetLocaleRow } from "@/hooks/useGoogleSheets";
import {
  pickLocaleFromSheetRows,
  type SheetRowPickOptions,
} from "@/language/matchSheetRows";

/**
 * TEXT/설정 공통 오프라인 기본값.
 * 시트에서는 같은 행의 영어(C)·한글(B)이 코드 기본과 같으면 그 행의 현재 언어 열을 씁니다.
 */

export type TextSectionLabelKey =
  | "language"
  | "langFollowDevice"
  | "font"
  | "fontPlaceholder"
  | "color"
  /** 배경 탭*/
  | "backgroundColor"
  | "blur"
  | "speed"
  | "size"
  | "lineSpacing"
  | "letterSpacing"
  | "viewMode"
  | "outline"
  | "dropShadow"
  | "viewModeReset"
  | "viewModeContinuous"
  | "tabText"
  | "tabBackground"
  | "tabEffects";

/** TEXT 탭*/
export const TEXT_TAB_BODY_LABEL_KEYS = [
  "font",
  "speed",
  "size",
  "letterSpacing",
  "lineSpacing",
  "viewMode",
  "color",
  "outline",
  "dropShadow",
] as const satisfies readonly TextSectionLabelKey[];

/** BACKGROUND 탭  */
export const BACKGROUND_TAB_BODY_LABEL_KEYS = [
  "backgroundColor",
  "blur",
] as const satisfies readonly TextSectionLabelKey[];

const LABELS: Record<TextSectionLabelKey, Record<AppLocaleKey, string>> = {
  language: {
    ko: "언어",
    en: "Language",
    ja: "言語",
    zhTC: "語言",
    zhSC: "语言",
  },
  langFollowDevice: {
    ko: "기기 설정 따름",
    en: "Follow device",
    ja: "端末の設定に従う",
    zhTC: "跟隨裝置",
    zhSC: "跟随系统",
  },
  font: {
    ko: "글꼴",
    en: "Font",
    ja: "フォント",
    zhTC: "字體",
    zhSC: "字体",
  },
  fontPlaceholder: {
    ko: "글꼴 선택",
    en: "Select font",
    ja: "フォントを選択",
    zhTC: "選擇字體",
    zhSC: "选择字体",
  },
  color: {
    ko: "색상",
    en: "Color",
    ja: "カラー",
    zhTC: "顏色",
    zhSC: "颜色",
  },
  backgroundColor: {
    ko: "색상",
    en: "Color",
    ja: "カラー",
    zhTC: "顏色",
    zhSC: "颜色",
  },
  blur: {
    ko: "흐림",
    en: "Blur",
    ja: "ぼかし",
    zhTC: "模糊",
    zhSC: "模糊",
  },
  speed: {
    ko: "속도",
    en: "Speed",
    ja: "速度",
    zhTC: "速度",
    zhSC: "速度",
  },
  size: {
    ko: "크기",
    en: "Size",
    ja: "サイズ",
    zhTC: "大小",
    zhSC: "大小",
  },
  lineSpacing: {
    ko: "행간",
    en: "Line Spacing",
    ja: "行間",
    zhTC: "行間距",
    zhSC: "行间距",
  },
  letterSpacing: {
    ko: "자간",
    en: "Letter Spacing",
    ja: "文字間隔",
    zhTC: "字間距",
    zhSC: "字距",
  },
  viewMode: {
    ko: "보기 모드",
    en: "View Mode",
    ja: "表示モード",
    zhTC: "檢視模式",
    zhSC: "查看模式",
  },
  outline: {
    ko: "외곽선",
    en: "Outline",
    ja: "縁取り",
    zhTC: "輪廓",
    zhSC: "轮廓",
  },
  dropShadow: {
    ko: "그림자",
    en: "Drop Shadow",
    ja: "ドロップシャドウ",
    zhTC: "陰影",
    zhSC: "投影",
  },
  /** 한 줄 모드: 단어 사이 공백(리셋) — 시트 C/B 앵커는 Reset / 리셋 */
  viewModeReset: {
    ko: "리셋",
    en: "Reset",
    ja: "リセット",
    zhTC: "重設",
    zhSC: "重置",
  },
  /** 한 줄 모드: 문장 연속(concat) — 시트 C/B 앵커는 Continuous / 연속 */
  viewModeContinuous: {
    ko: "연속",
    en: "Continuous",
    ja: "連続",
    zhTC: "連續",
    zhSC: "连续",
  },
  /** 상단 탭 — 시트 첫 줄·배경·효과 구역의 영어 열과 맞춥니다 (Text / Background / Effects). */
  tabText: {
    ko: "텍스트",
    en: "Text",
    ja: "テキスト",
    zhTC: "文字",
    zhSC: "文本",
  },
  tabBackground: {
    ko: "배경",
    en: "Background",
    ja: "背景",
    zhTC: "背景",
    zhSC: "背景",
  },
  tabEffects: {
    ko: "효과",
    en: "Effects",
    ja: "エフェクト",
    zhTC: "特效",
    zhSC: "特效",
  },
};

/** 시트에 같은 영어가 여러 줄일 때 첫 번째 행의 값을 쓰고 나머지는 무시 */
const TEXT_SHEET_PICK: Partial<
  Record<TextSectionLabelKey, SheetRowPickOptions>
> = {
  color: { englishOccurrenceIndex: 0 },
  backgroundColor: { englishOccurrenceIndex: 1 },
  size: { sheetRow: 5 },
};

export function tTextSectionLabel(
  key: TextSectionLabelKey,
  locale: AppLocaleKey,
  sheetRows?: GoogleSheetLocaleRow[] | null,
): string {
  const fb = LABELS[key];
  const opts = TEXT_SHEET_PICK[key];

  const fromSheet = pickLocaleFromSheetRows(
    sheetRows,
    locale,
    fb.en,
    fb.ko,
    opts,
  );
  if (fromSheet) return fromSheet;

  const s = fb[locale];
  if (s) return s;
  return fb.en;
}
