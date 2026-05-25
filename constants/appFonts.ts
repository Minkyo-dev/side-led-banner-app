import type { AppLocaleKey } from "@/constants/language";

/** `settings` `appearance.font` 값과 동일한 키 */
export type AppearanceFontId =
  | "montserrat"
  | "poppins"
  | "inter"
  | "rubik_one"
  | "bebas_neue"
  | "black_han_sans"
  | "jua"
  | "noto_sans_kr"
  | "m_plus_1"
  | "dela_gothic_one"
  | "mochiy_pop_one"
  | "noto_sans_jp"
  | "noto_sans_tc"
  | "zcool_qingke_huangyou"
  | "chango"
  | "zcool_kuaile"
  | "m_plus_1p"
  | "zcool_xiaowei"
  | "noto_sans_sc"
  | "ma_shan_zheng";

export interface FontFaceSet {
  regular: number;
  bold: number;
}

export interface FontDropdownItem {
  label: string;
  value: AppearanceFontId;
}

function singleFace(asset: number): FontFaceSet {
  return { regular: asset, bold: asset };
}

const montserrat = singleFace(
  require("@/assets/fonts/Montserrat/static/Montserrat-Black.ttf"),
);
const poppins = singleFace(require("@/assets/fonts/Poppins/Poppins-Black.ttf"));
const inter = singleFace(
  require("@/assets/fonts/Inter/static/Inter_28pt-Black.ttf"),
);
// Requested as "Rubik One"; bundled asset is the single-weight Rubik Mono One.
const rubikOne = singleFace(
  require("@/assets/fonts/Rubik_Mono_One/RubikMonoOne-Regular.ttf"),
);
const bebasNeue = singleFace(
  require("@/assets/fonts/Bebas_Neue/BebasNeue-Regular.ttf"),
);
const blackHanSans = singleFace(
  require("@/assets/fonts/Black_Han_Sans/BlackHanSans-Regular.ttf"),
);
const jua = singleFace(require("@/assets/fonts/Jua/Jua-Regular.ttf"));
const notoSansKr = singleFace(
  require("@/assets/fonts/Noto_Sans_KR/static/NotoSansKR-Black.ttf"),
);
const mPlus1 = singleFace(
  require("@/assets/fonts/M_PLUS_1/static/MPLUS1-Black.ttf"),
);
const delaGothicOne = singleFace(
  require("@/assets/fonts/Dela_Gothic_One/DelaGothicOne-Regular.ttf"),
);
const mochiyPopOne = singleFace(
  require("@/assets/fonts/Mochiy_Pop_One/MochiyPopOne-Regular.ttf"),
);
const notoSansJp = singleFace(
  require("@/assets/fonts/Noto_Sans_JP/static/NotoSansJP-Black.ttf"),
);
const notoSansTc = singleFace(
  require("@/assets/fonts/Noto_Sans_TC/static/NotoSansTC-Black.ttf"),
);
const zcoolQingKeHuangYou = singleFace(
  require("@/assets/fonts/ZCOOL_QingKe_HuangYou/ZCOOLQingKeHuangYou-Regular.ttf"),
);
const chango = singleFace(require("@/assets/fonts/Chango/Chango-Regular.ttf"));
const zcoolKuaiLe = singleFace(
  require("@/assets/fonts/ZCOOL_KuaiLe/ZCOOLKuaiLe-Regular.ttf"),
);
const mPlus1p = singleFace(
  require("@/assets/fonts/M_PLUS_1p/MPLUS1p-Black.ttf"),
);
const zcoolXiaoWei = singleFace(
  require("@/assets/fonts/ZCOOL_XiaoWei/ZCOOLXiaoWei-Regular.ttf"),
);
const notoSansSc = singleFace(
  require("@/assets/fonts/Noto_Sans_SC/static/NotoSansSC-Black.ttf"),
);
const maShanZheng = singleFace(
  require("@/assets/fonts/Ma_Shan_Zheng/MaShanZheng-Regular.ttf"),
);

/** Skia·RN 공통: 폰트 키별 regular / bold 에셋(require id) */
export const APP_FONT_FACE_SETS: Record<AppearanceFontId, FontFaceSet> = {
  montserrat,
  poppins,
  inter,
  rubik_one: rubikOne,
  bebas_neue: bebasNeue,
  black_han_sans: blackHanSans,
  jua,
  noto_sans_kr: notoSansKr,
  m_plus_1: mPlus1,
  dela_gothic_one: delaGothicOne,
  mochiy_pop_one: mochiyPopOne,
  noto_sans_jp: notoSansJp,
  noto_sans_tc: notoSansTc,
  zcool_qingke_huangyou: zcoolQingKeHuangYou,
  chango,
  zcool_kuaile: zcoolKuaiLe,
  m_plus_1p: mPlus1p,
  zcool_xiaowei: zcoolXiaoWei,
  noto_sans_sc: notoSansSc,
  ma_shan_zheng: maShanZheng,
};

export const APP_FONT_ITEMS_BY_LOCALE: Record<AppLocaleKey, FontDropdownItem[]> =
  {
    en: [
      { label: "Montserrat", value: "montserrat" },
      { label: "Poppins", value: "poppins" },
      { label: "Inter", value: "inter" },
      { label: "Rubik One", value: "rubik_one" },
      { label: "Bebas Neue", value: "bebas_neue" },
    ],
    ko: [
      { label: "Black Han Sans", value: "black_han_sans" },
      { label: "Jua", value: "jua" },
      { label: "Noto Sans KR", value: "noto_sans_kr" },
    ],
    ja: [
      { label: "M PLUS 1", value: "m_plus_1" },
      { label: "Dela Gothic One", value: "dela_gothic_one" },
      { label: "Mochiy Pop One", value: "mochiy_pop_one" },
      { label: "Noto Sans JP", value: "noto_sans_jp" },
    ],
    zhTC: [
      { label: "Noto Sans TC", value: "noto_sans_tc" },
      { label: "ZCOOL QingKe HuangYou", value: "zcool_qingke_huangyou" },
      { label: "Chango", value: "chango" },
      { label: "ZCOOL KuaiLe", value: "zcool_kuaile" },
      { label: "M PLUS 1p", value: "m_plus_1p" },
    ],
    zhSC: [
      { label: "ZCOOL XiaoWei", value: "zcool_xiaowei" },
      { label: "ZCOOL KuaiLe", value: "zcool_kuaile" },
      { label: "Noto Sans SC", value: "noto_sans_sc" },
      { label: "ZCOOL QingKe HuangYou", value: "zcool_qingke_huangyou" },
      { label: "Ma Shan Zheng", value: "ma_shan_zheng" },
    ],
  };

const DEFAULT_APPEARANCE_FONT: AppearanceFontId = "black_han_sans";

export function isAppearanceFontId(value: string): value is AppearanceFontId {
  return Object.prototype.hasOwnProperty.call(APP_FONT_FACE_SETS, value);
}

export function getFontItemsForLocale(locale: AppLocaleKey): FontDropdownItem[] {
  return APP_FONT_ITEMS_BY_LOCALE[locale];
}

export function getDefaultAppearanceFontForLocale(
  locale: AppLocaleKey,
): AppearanceFontId {
  return APP_FONT_ITEMS_BY_LOCALE[locale][0]?.value ?? DEFAULT_APPEARANCE_FONT;
}

export function resolveAppearanceFontFaceSet(appearanceFont: string): FontFaceSet {
  if (isAppearanceFontId(appearanceFont)) {
    return APP_FONT_FACE_SETS[appearanceFont];
  }
  return APP_FONT_FACE_SETS[DEFAULT_APPEARANCE_FONT];
}

/** `expo-font` / RN `Text`·`TextInput`의 `fontFamily`로 쓰는 키 */
export function appFontFamilyForText(
  appearanceFont: string,
  fontWeight: "normal" | "bold",
): string {
  const base = `AppFont-${appearanceFont}`;
  return fontWeight === "bold" ? `${base}-bold` : base;
}

function buildAppFontAssets(): Record<string, number> {
  const out: Record<string, number> = {};
  (Object.keys(APP_FONT_FACE_SETS) as AppearanceFontId[]).forEach((id) => {
    const set = APP_FONT_FACE_SETS[id];
    out[appFontFamilyForText(id, "normal")] = set.regular;
    out[appFontFamilyForText(id, "bold")] = set.bold;
  });
  return out;
}

/** 루트에서 `useFonts` 한 번에 올릴 맵 — 키는 `appFontFamilyForText`와 동일 규칙 */
export const APP_FONT_ASSETS: Record<string, number> = buildAppFontAssets();

export const APP_THEME_FONT_FAMILY = "AppTheme";
export const APP_THEME_FONT_FAMILY_BOLD = "AppTheme-Bold";

export const APP_THEME_FONT_ASSETS: Record<string, number> = {
  [APP_THEME_FONT_FAMILY]: require("../assets/fonts/Tektur/static/Tektur-Regular.ttf"),
  [APP_THEME_FONT_FAMILY_BOLD]: require("../assets/fonts/Tektur/static/Tektur-Bold.ttf"),
};

export const uiThemeFontStyle = { fontFamily: APP_THEME_FONT_FAMILY } as const;
