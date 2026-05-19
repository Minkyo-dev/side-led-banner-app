import type { AppLocaleKey } from "@/constants/language";
import type { GoogleSheetLocaleRow } from "@/hooks/useGoogleSheets";
import {
  pickLocaleFromSheetRows,
  type SheetRowPickOptions,
} from "@/language/matchSheetRows";

/**
 * 리워드 광고 팝업 문자열 (게시 CSV 32~38행과 동기화).
 * 시트 A열 키: reward.headerBadge, reward.benefitColors, … (비어 있으면 행 번호·영/한 앵커로 매칭)
 */
export type RewardAdLabelKey =
  | "rewardHeaderBadge"
  | "rewardBenefitColors"
  | "rewardBenefitEffects"
  | "rewardBenefitFavorites"
  | "rewardBenefitOutlineShadow"
  | "rewardDescription"
  | "rewardWatchAd";

const LABELS: Record<RewardAdLabelKey, Record<AppLocaleKey, string>> = {
  rewardHeaderBadge: {
    ko: "LED Pop 프로 무료 사용",
    en: "Use LED Pop Pro for Free",
    ja: "LED Pop Proを無料で利用",
    zhTC: "免費使用 LED Pop Pro",
    zhSC: "免费使用 LED Pop Pro",
  },
  rewardBenefitColors: {
    ko: "모든 텍스트와 배경 색상 사용 가능",
    en: "All text and background colors available",
    ja: "すべてのテキストと背景色を利用可能",
    zhTC: "可使用所有文字和背景顏色",
    zhSC: "可使用所有文本和背景颜色",
  },
  rewardBenefitEffects: {
    ko: "모든 효과 사용 가능",
    en: "Access all effects",
    ja: "すべてのエフェクトを利用可能",
    zhTC: "可使用所有特效",
    zhSC: "可使用所有特效",
  },
  rewardBenefitFavorites: {
    ko: "모든 즐겨찾기 사용 가능",
    en: "All favorites available",
    ja: "すべてのお気に入りを利用可能",
    zhTC: "可使用所有收藏",
    zhSC: "可使用所有收藏",
  },
  rewardBenefitOutlineShadow: {
    ko: "외곽선과 그림자 사용 가능",
    en: "Outlines and shadows available",
    ja: "縁取りと影を利用可能",
    zhTC: "可使用輪廓和陰影",
    zhSC: "可使用轮廓和阴影",
  },
  rewardDescription: {
    ko: "광고 1회 시청 후 6시간 동안 동영상 광고 없이 Pro 버전을 사용할 수 있습니다.",
    en: "Watch one ad and use Pro without video ads for 6 hours.",
    ja: "広告を視聴すると、6時間動画広告なしでPro版を利用できます。",
    zhTC: "觀看一次廣告後，即可在6小時內免影片廣告並使用Pro版",
    zhSC: "观看一次广告后，即可在6小时内免视频广告并使用Pro版",
  },
  rewardWatchAd: {
    ko: "광고 보기",
    en: "Watch Ad",
    ja: "広告を見る",
    zhTC: "觀看廣告",
    zhSC: "观看广告",
  },
};

/** 게시 CSV 행 번호(1-based). 영·한 앵커가 같으면 시트 값이 코드 fallback보다 우선 */
const REWARD_SHEET_PICK: Partial<
  Record<RewardAdLabelKey, SheetRowPickOptions>
> = {
  rewardHeaderBadge: { sheetRow: 32 },
  rewardBenefitColors: { sheetRow: 33 },
  rewardBenefitEffects: { sheetRow: 34 },
  rewardBenefitFavorites: { sheetRow: 35 },
  rewardBenefitOutlineShadow: { sheetRow: 36 },
  rewardDescription: { sheetRow: 37 },
  rewardWatchAd: { sheetRow: 38 },
};

/** 시트 E/F 열이 뒤바뀌었거나 깨진 경우 코드 fallback을 씁니다. */
function reconcileRewardLocaleFromSheet(
  locale: AppLocaleKey,
  fromSheet: string,
  fb: Record<AppLocaleKey, string>,
): string {
  if (locale === "zhTC") {
    if (fromSheet === fb.zhSC || /walls/i.test(fromSheet)) return fb.zhTC;
  }
  if (locale === "zhSC") {
    if (fromSheet === fb.zhTC) return fb.zhSC;
  }
  return fromSheet;
}

export function tRewardAdLabel(
  key: RewardAdLabelKey,
  locale: AppLocaleKey,
  sheetRows?: GoogleSheetLocaleRow[] | null,
): string {
  const fb = LABELS[key];
  const opts = REWARD_SHEET_PICK[key];

  const fromSheet = pickLocaleFromSheetRows(
    sheetRows,
    locale,
    fb.en,
    fb.ko,
    opts,
  );
  if (fromSheet) {
    return reconcileRewardLocaleFromSheet(locale, fromSheet, fb);
  }

  const s = fb[locale];
  if (s) return s;
  return fb.en;
}
