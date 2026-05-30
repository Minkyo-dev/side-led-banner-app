import type { AppLocaleKey } from "@/constants/language";

/** `settings` `appearance.font` 값과 동일한 키 */
export type AppearanceFontId =
  | "montserrat"
  | "poppins"
  | "inter"
  | "rubik_one"
  | "tektur"
  | "black_han_sans"
  | "do_hyeon"
  | "jua"
  | "nanum_square_neo"
  | "noto_sans_kr"
  | "kaisei"
  | "ibm_plex_sans_jp"
  | "dela_gothic_one"
  | "mochiy_pop_one"
  | "line_seed_jp"
  | "noto_sans_tc"
  | "zcool_qingke_huangyou"
  | "m_plus_rounded_1c"
  | "chen_yu_luo_yan"
  | "chango"
  | "zcool_kuaile"
  | "m_plus_1p"
  | "zcool_pixels"
  | "zcool_xiaowei"
  | "noto_sans_sc"
  | "long_cang"
  | "noto_serif_sc"
  | "ma_shan_zheng";

export interface FontFaceSet {
  regular: number;
  bold: number;
}

export interface FontDropdownItem {
  label: string;
  value: AppearanceFontId;
}

function fontFaceSet(regular: number, bold: number): FontFaceSet {
  return { regular, bold };
}

function singleFace(asset: number): FontFaceSet {
  return { regular: asset, bold: asset };
}

const montserrat = fontFaceSet(
  require("@/assets/fonts/Montserrat/static/Montserrat-Regular.ttf"),
  require("@/assets/fonts/Montserrat/static/Montserrat-Bold.ttf"),
);
const poppins = fontFaceSet(
  require("@/assets/fonts/Poppins/Poppins-Regular.ttf"),
  require("@/assets/fonts/Poppins/Poppins-Bold.ttf"),
);
const inter = fontFaceSet(
  require("@/assets/fonts/Inter/static/Inter_28pt-Regular.ttf"),
  require("@/assets/fonts/Inter/static/Inter_28pt-Bold.ttf"),
);
const rubikOne = fontFaceSet(
  require("@expo-google-fonts/rubik/400Regular/Rubik_400Regular.ttf"),
  require("@expo-google-fonts/rubik/700Bold/Rubik_700Bold.ttf"),
);
const tektur = fontFaceSet(
  require("@/assets/fonts/Tektur/static/Tektur-Regular.ttf"),
  require("@/assets/fonts/Tektur/static/Tektur-Bold.ttf"),
);
const blackHanSans = singleFace(
  require("@/assets/fonts/Black_Han_Sans/BlackHanSans-Regular.ttf"),
);
const doHyeon = singleFace(
  require("@expo-google-fonts/do-hyeon/400Regular/DoHyeon_400Regular.ttf"),
);
const jua = singleFace(require("@/assets/fonts/Jua/Jua-Regular.ttf"));
const nanumSquareNeo = fontFaceSet(
  require("@/assets/fonts/nanum-square-neo/nanum-square-neo/TTF/NanumSquareNeo-bRg.ttf"),
  require("@/assets/fonts/nanum-square-neo/nanum-square-neo/TTF/NanumSquareNeo-cBd.ttf"),
);
const notoSansKr = fontFaceSet(
  require("@/assets/fonts/Noto_Sans_KR/static/NotoSansKR-Regular.ttf"),
  require("@/assets/fonts/Noto_Sans_KR/static/NotoSansKR-Bold.ttf"),
);
const kaisei = fontFaceSet(
  require("@/assets/fonts/Kaisei_Tokumin/KaiseiTokumin-Regular.ttf"),
  require("@/assets/fonts/Kaisei_Tokumin/KaiseiTokumin-ExtraBold.ttf"),
);
const ibmPlexSansJp = fontFaceSet(
  require("@expo-google-fonts/ibm-plex-sans-jp/300Light/IBMPlexSansJP_300Light.ttf"),
  require("@expo-google-fonts/ibm-plex-sans-jp/700Bold/IBMPlexSansJP_700Bold.ttf"),
);
const delaGothicOne = singleFace(
  require("@expo-google-fonts/dela-gothic-one/400Regular/DelaGothicOne_400Regular.ttf"),
);
const mochiyPopOne = singleFace(
  require("@/assets/fonts/Mochiy_Pop_One/MochiyPopOne-Regular.ttf"),
);
const lineSeedJp = fontFaceSet(
  require("@expo-google-fonts/line-seed-jp/400Regular/LINESeedJP_400Regular.ttf"),
  require("@expo-google-fonts/line-seed-jp/800ExtraBold/LINESeedJP_800ExtraBold.ttf"),
);
const notoSansTc = fontFaceSet(
  require("@/assets/fonts/Noto_Sans_TC/static/NotoSansTC-Regular.ttf"),
  require("@/assets/fonts/Noto_Sans_TC/static/NotoSansTC-Bold.ttf"),
);
const zcoolQingKeHuangYou = singleFace(
  require("@/assets/fonts/ZCOOL_QingKe_HuangYou/ZCOOLQingKeHuangYou-Regular.ttf"),
);
const mPlusRounded1c = fontFaceSet(
  require("@/assets/fonts/M_PLUS_Rounded_1c/MPLUSRounded1c-Regular.ttf"),
  require("@/assets/fonts/M_PLUS_Rounded_1c/MPLUSRounded1c-Bold.ttf"),
);
const chenYuLuoYan = singleFace(
  require("@/assets/fonts/Chen_Yu_Luo_Yan/ChenYuluoyan-2.0-Thin.ttf"),
);
const chango = singleFace(require("@/assets/fonts/Chango/Chango-Regular.ttf"));
const zcoolKuaiLe = singleFace(
  require("@/assets/fonts/ZCOOL_KuaiLe/ZCOOLKuaiLe-Regular.ttf"),
);
const mPlus1p = fontFaceSet(
  require("@/assets/fonts/M_PLUS_1p/MPLUS1p-Regular.ttf"),
  require("@/assets/fonts/M_PLUS_1p/MPLUS1p-Bold.ttf"),
);
const zcoolPixels = singleFace(require("@/assets/fonts/Zpix/zpix.ttf"));
const zcoolXiaoWei = singleFace(
  require("@/assets/fonts/ZCOOL_XiaoWei/ZCOOLXiaoWei-Regular.ttf"),
);
const notoSansSc = fontFaceSet(
  require("@/assets/fonts/Noto_Sans_SC/static/NotoSansSC-Regular.ttf"),
  require("@/assets/fonts/Noto_Sans_SC/static/NotoSansSC-Bold.ttf"),
);
const longCang = singleFace(
  require("@/assets/fonts/Long_Cang/LongCang-Regular.ttf"),
);
const notoSerifSc = fontFaceSet(
  require("@expo-google-fonts/noto-serif-sc/400Regular/NotoSerifSC_400Regular.ttf"),
  require("@expo-google-fonts/noto-serif-sc/700Bold/NotoSerifSC_700Bold.ttf"),
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
  tektur,
  black_han_sans: blackHanSans,
  do_hyeon: doHyeon,
  jua,
  nanum_square_neo: nanumSquareNeo,
  noto_sans_kr: notoSansKr,
  kaisei,
  ibm_plex_sans_jp: ibmPlexSansJp,
  dela_gothic_one: delaGothicOne,
  mochiy_pop_one: mochiyPopOne,
  line_seed_jp: lineSeedJp,
  noto_sans_tc: notoSansTc,
  zcool_qingke_huangyou: zcoolQingKeHuangYou,
  m_plus_rounded_1c: mPlusRounded1c,
  chen_yu_luo_yan: chenYuLuoYan,
  chango,
  zcool_kuaile: zcoolKuaiLe,
  m_plus_1p: mPlus1p,
  zcool_pixels: zcoolPixels,
  zcool_xiaowei: zcoolXiaoWei,
  noto_sans_sc: notoSansSc,
  long_cang: longCang,
  noto_serif_sc: notoSerifSc,
  ma_shan_zheng: maShanZheng,
};

export const APP_FONT_ITEMS_BY_LOCALE: Record<AppLocaleKey, FontDropdownItem[]> =
  {
    en: [
      { label: "Montserrat", value: "montserrat" },
      { label: "Poppins", value: "poppins" },
      { label: "Inter", value: "inter" },
      { label: "Rubik", value: "rubik_one" },
      { label: "Tektur", value: "tektur" },
    ],
    ko: [
      { label: "Black Han Sans", value: "black_han_sans" },
      { label: "Do Hyeon", value: "do_hyeon" },
      { label: "Jua", value: "jua" },
      { label: "Nanum Square Neo", value: "nanum_square_neo" },
      { label: "Noto Sans KR", value: "noto_sans_kr" },
    ],
    ja: [
      { label: "Kaisei", value: "kaisei" },
      { label: "IBM Plex Sans JP", value: "ibm_plex_sans_jp" },
      { label: "Dela Gothic One", value: "dela_gothic_one" },
      { label: "Mochiy Pop One", value: "mochiy_pop_one" },
      { label: "LINE Seed JP", value: "line_seed_jp" },
    ],
    zhTC: [
      { label: "Noto Sans TC", value: "noto_sans_tc" },
      { label: "ZCOOL QingKe HuangYou", value: "zcool_qingke_huangyou" },
      { label: "M PLUS Rounded 1c", value: "m_plus_rounded_1c" },
      { label: "Chen Yu Luo Yan", value: "chen_yu_luo_yan" },
      { label: "M PLUS 1p", value: "m_plus_1p" },
    ],
    zhSC: [
      { label: "M PLUS Rounded 1c", value: "m_plus_rounded_1c" },
      { label: "ZCOOL QingKe HuangYou", value: "zcool_qingke_huangyou" },
      { label: "Noto Sans SC", value: "noto_sans_sc" },
      { label: "Long Cang", value: "long_cang" },
      { label: "Noto Serif SC", value: "noto_serif_sc" },
    ],
  };

const DEFAULT_APPEARANCE_FONT: AppearanceFontId = "black_han_sans";

/** 예전 `bebas_neue` 프리셋·설정 호환 */
const LEGACY_APPEARANCE_FONT_IDS: Record<string, AppearanceFontId> = {
  bebas_neue: "tektur",
  m_plus_1: "kaisei",
  zen_kaku_gothic_new: "ibm_plex_sans_jp",
  noto_sans_jp: "line_seed_jp",
};

export function normalizeAppearanceFontId(
  value: string,
): AppearanceFontId | null {
  if (isAppearanceFontId(value)) return value;
  return LEGACY_APPEARANCE_FONT_IDS[value] ?? null;
}

/** Bold 효과·`fontWeight: bold`가 의미 없는 단일 웨이트 폰트 */
const APPEARANCE_FONTS_WITHOUT_BOLD = new Set<AppearanceFontId>([
  "dela_gothic_one",
  "mochiy_pop_one",
]);

export function appearanceFontSupportsBold(appearanceFont: string): boolean {
  const id = normalizeAppearanceFontId(appearanceFont);
  if (!id) return true;
  return !APPEARANCE_FONTS_WITHOUT_BOLD.has(id);
}

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
  const id = normalizeAppearanceFontId(appearanceFont);
  if (id) {
    return APP_FONT_FACE_SETS[id];
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
