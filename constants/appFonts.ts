import type { AppLocaleKey } from "@/constants/language";

/** settings폰트키용 */
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
  | "zcool_kuaile"
  | "m_plus_1p"
  | "noto_sans_sc"
  | "long_cang"
  | "noto_serif_sc"
  | "ziti_guanjia_bodian"
  | "galmuri11";

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
  require("@/assets/fonts/Rubik/Rubik_400Regular.ttf"),
  require("@/assets/fonts/Rubik/Rubik_700Bold.ttf"),
);
const tektur = fontFaceSet(
  require("@/assets/fonts/Tektur/static/Tektur-Regular.ttf"),
  require("@/assets/fonts/Tektur/static/Tektur-Bold.ttf"),
);
const blackHanSans = singleFace(
  require("@/assets/fonts/Black_Han_Sans/BlackHanSans-Regular.ttf"),
);
const doHyeon = singleFace(
  require("@/assets/fonts/Do_Hyeon/DoHyeon_400Regular.ttf"),
);
const jua = singleFace(require("@/assets/fonts/Jua/Jua-Regular.ttf"));
const nanumSquareNeo = fontFaceSet(
  require("@/assets/fonts/nanum-square-neo/NanumSquareNeo-bRg.ttf"),
  require("@/assets/fonts/nanum-square-neo/NanumSquareNeo-cBd.ttf"),
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
  require("@/assets/fonts/IBM_Plex_Sans_JP/IBMPlexSansJP_300Light.ttf"),
  require("@/assets/fonts/IBM_Plex_Sans_JP/IBMPlexSansJP_700Bold.ttf"),
);
const delaGothicOne = singleFace(
  require("@/assets/fonts/Dela_Gothic_One/DelaGothicOne_400Regular.ttf"),
);
const mochiyPopOne = singleFace(
  require("@/assets/fonts/Mochiy_Pop_One/MochiyPopOne-Regular.ttf"),
);
const lineSeedJp = fontFaceSet(
  require("@/assets/fonts/LINE_Seed_JP/LINESeedJP_400Regular.ttf"),
  require("@/assets/fonts/LINE_Seed_JP/LINESeedJP_800ExtraBold.ttf"),
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
const zcoolKuaiLe = singleFace(
  require("@/assets/fonts/ZCOOL_KuaiLe/ZCOOLKuaiLe-Regular.ttf"),
);
const mPlus1p = fontFaceSet(
  require("@/assets/fonts/M_PLUS_1p/MPLUS1p-Regular.ttf"),
  require("@/assets/fonts/M_PLUS_1p/MPLUS1p-Bold.ttf"),
);
const notoSansSc = fontFaceSet(
  require("@/assets/fonts/Noto_Sans_SC/static/NotoSansSC-Regular.ttf"),
  require("@/assets/fonts/Noto_Sans_SC/static/NotoSansSC-Bold.ttf"),
);
const longCang = singleFace(
  require("@/assets/fonts/Long_Cang/LongCang-Regular.ttf"),
);
const notoSerifSc = fontFaceSet(
  require("@/assets/fonts/Noto_Serif_SC/NotoSerifSC_400Regular.ttf"),
  require("@/assets/fonts/Noto_Serif_SC/NotoSerifSC_700Bold.ttf"),
);
const zitiGuanjiaBodian = singleFace(
  require("@/assets/fonts/ZiTiGuanJiaBoDian/ZiTiGuanJiaBoDian-2.ttf"),
);
const galmuri11 = singleFace(
  require("@/assets/fonts/galmuri11/Galmuri11.ttf"),
);

/** zhSC픽셀폰트ID용 */
export const ZITI_GUANJIA_BODIAN_FONT_ID =
  "ziti_guanjia_bodian" as const satisfies AppearanceFontId;

/** Galmuri픽셀폰트ID용 */
export const GALMURI11_FONT_ID = "galmuri11" as const satisfies AppearanceFontId;

/** 폰트에셋맵용 */
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
  zcool_kuaile: zcoolKuaiLe,
  m_plus_1p: mPlus1p,
  noto_sans_sc: notoSansSc,
  long_cang: longCang,
  noto_serif_sc: notoSerifSc,
  ziti_guanjia_bodian: zitiGuanjiaBodian,
  galmuri11,
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

/** 삭제폰트매핑용 */
const LEGACY_APPEARANCE_FONT_IDS: Record<string, AppearanceFontId> = {
  bebas_neue: "tektur",
  m_plus_1: "kaisei",
  zen_kaku_gothic_new: "ibm_plex_sans_jp",
  noto_sans_jp: "line_seed_jp",
  bit8_dot_font: "line_seed_jp",
  hanyi_xiangsu_9px_fan: "noto_sans_tc",
  enikusu_hg: "kaisei",
  dotted_songti_circle: "noto_sans_sc",
  dotted_songti_square: "noto_sans_sc",
  dotted_songti_diamond: "noto_sans_sc",
  aa_xiaogou_pixel: "noto_sans_sc",
  zcool_pixels: "noto_sans_sc",
  chango: "noto_sans_tc",
  zcool_xiaowei: "noto_sans_tc",
  ma_shan_zheng: "noto_sans_sc",
  kslocalbaseballpark: "black_han_sans",
};

export function normalizeAppearanceFontId(
  value: string,
): AppearanceFontId | null {
  if (isAppearanceFontId(value)) return value;
  return LEGACY_APPEARANCE_FONT_IDS[value] ?? null;
}

/** 픽셀전용폰트용 */
export const APPEARANCE_FONTS_HIDDEN_FROM_PICKER = new Set<AppearanceFontId>([
  "ziti_guanjia_bodian",
  "galmuri11",
]);

export function isAppearanceFontHiddenFromPicker(
  appearanceFont: string,
): boolean {
  const id = normalizeAppearanceFontId(appearanceFont);
  return id != null && APPEARANCE_FONTS_HIDDEN_FROM_PICKER.has(id);
}

/** Skia전용폰트용 */
const SKIA_ONLY_APPEARANCE_FONTS = new Set<AppearanceFontId>([
  "ziti_guanjia_bodian",
  "galmuri11",
]);

export function isSkiaOnlyAppearanceFont(appearanceFont: string): boolean {
  const id = normalizeAppearanceFontId(appearanceFont);
  return id != null && SKIA_ONLY_APPEARANCE_FONTS.has(id);
}

/** Bold미지원폰트용 */
const APPEARANCE_FONTS_WITHOUT_BOLD = new Set<AppearanceFontId>([
  "dela_gothic_one",
  "mochiy_pop_one",
  "ziti_guanjia_bodian",
  "galmuri11",
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
  return APP_FONT_ITEMS_BY_LOCALE[locale].filter(
    (item) => !APPEARANCE_FONTS_HIDDEN_FROM_PICKER.has(item.value),
  );
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

/** RNfontFamily키용 */
export function appFontFamilyForText(
  appearanceFont: string,
  fontWeight: "normal" | "bold",
  locale?: AppLocaleKey,
): string {
  if (locale && isSkiaOnlyAppearanceFont(appearanceFont)) {
    return appFontFamilyForText(
      getDefaultAppearanceFontForLocale(locale),
      fontWeight,
    );
  }
  const id = normalizeAppearanceFontId(appearanceFont) ?? appearanceFont;
  const base = `AppFont-${id}`;
  return fontWeight === "bold" ? `${base}-bold` : base;
}

function buildAppFontAssets(): Record<string, number> {
  const out: Record<string, number> = {};
  (Object.keys(APP_FONT_FACE_SETS) as AppearanceFontId[]).forEach((id) => {
    if (SKIA_ONLY_APPEARANCE_FONTS.has(id)) return;
    const set = APP_FONT_FACE_SETS[id];
    out[appFontFamilyForText(id, "normal")] = set.regular;
    out[appFontFamilyForText(id, "bold")] = set.bold;
  });
  return out;
}

/** useFonts일괄로드용 */
export const APP_FONT_ASSETS: Record<string, number> = buildAppFontAssets();

export const APP_THEME_FONT_FAMILY = "AppTheme";
export const APP_THEME_FONT_FAMILY_BOLD = "AppTheme-Bold";

export const APP_THEME_FONT_ASSETS: Record<string, number> = {
  [APP_THEME_FONT_FAMILY]: require("../assets/fonts/Tektur/static/Tektur-Regular.ttf"),
  [APP_THEME_FONT_FAMILY_BOLD]: require("../assets/fonts/Tektur/static/Tektur-Bold.ttf"),
};

export const uiThemeFontStyle = { fontFamily: APP_THEME_FONT_FAMILY } as const;
