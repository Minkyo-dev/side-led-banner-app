import type { AppLocaleKey } from "@/constants/language";

/** settings폰트키용 */
export type FontId =
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
  value: FontId;
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
  "ziti_guanjia_bodian" as const satisfies FontId;

/** Galmuri픽셀폰트ID용 */
export const GALMURI11_FONT_ID = "galmuri11" as const satisfies FontId;

/** 폰트에셋맵용 */
export const APP_FONT_FACE_SETS: Record<FontId, FontFaceSet> = {
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
      { label: "LINE Seed JP", value: "line_seed_jp" },
      { label: "Kaisei", value: "kaisei" },
      { label: "IBM Plex Sans JP", value: "ibm_plex_sans_jp" },
      { label: "Dela Gothic One", value: "dela_gothic_one" },
      { label: "Mochiy Pop One", value: "mochiy_pop_one" },
      
    ],
    zhTC: [
      { label: "Noto Sans TC", value: "noto_sans_tc" },
      { label: "ZCOOL QingKe HuangYou", value: "zcool_qingke_huangyou" },
      { label: "M PLUS Rounded 1c", value: "m_plus_rounded_1c" },
      { label: "Chen Yu Luo Yan", value: "chen_yu_luo_yan" },
      { label: "M PLUS 1p", value: "m_plus_1p" },
    ],
    zhSC: [
      { label: "Noto Sans SC", value: "noto_sans_sc" },
      { label: "M PLUS Rounded 1c", value: "m_plus_rounded_1c" },
      { label: "ZCOOL QingKe HuangYou", value: "zcool_qingke_huangyou" },
      { label: "Long Cang", value: "long_cang" },
      { label: "Noto Serif SC", value: "noto_serif_sc" },
    ],
  };

const DEFAULT_FONT: FontId = "black_han_sans";

/** 삭제폰트매핑용 */
const LEGACY_FONT_IDS: Record<string, FontId> = {
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

export function normalizeFontId(
  value: string,
): FontId | null {
  if (isFontId(value)) return value;
  return LEGACY_FONT_IDS[value] ?? null;
}

/** 픽셀전용폰트용 */
export const FONTS_HIDDEN_FROM_PICKER = new Set<FontId>([
  "ziti_guanjia_bodian",
  "galmuri11",
]);

export function isFontHiddenFromPicker(
  appearanceFont: string,
): boolean {
  const id = normalizeFontId(appearanceFont);
  return id != null && FONTS_HIDDEN_FROM_PICKER.has(id);
}

/** Skia전용폰트용 */
const SKIA_ONLY_FONTS = new Set<FontId>([
  "ziti_guanjia_bodian",
  "galmuri11",
]);

export function isSkiaOnlyFont(appearanceFont: string): boolean {
  const id = normalizeFontId(appearanceFont);
  return id != null && SKIA_ONLY_FONTS.has(id);
}

/** Bold미지원폰트용 */
const FONTS_WITHOUT_BOLD = new Set<FontId>([
  "dela_gothic_one",
  "mochiy_pop_one",
  "ziti_guanjia_bodian",
  "galmuri11",
]);

export function supportsBold(appearanceFont: string): boolean {
  const id = normalizeFontId(appearanceFont);
  if (!id) return true;
  return !FONTS_WITHOUT_BOLD.has(id);
}

export function isFontId(value: string): value is FontId {
  return Object.prototype.hasOwnProperty.call(APP_FONT_FACE_SETS, value);
}

export function getFontItemsForLocale(locale: AppLocaleKey): FontDropdownItem[] {
  return APP_FONT_ITEMS_BY_LOCALE[locale].filter(
    (item) => !FONTS_HIDDEN_FROM_PICKER.has(item.value),
  );
}

export function getDefaultForLocale(
  locale: AppLocaleKey,
): FontId {
  return APP_FONT_ITEMS_BY_LOCALE[locale][0]?.value ?? DEFAULT_FONT;
}

const FONT_ID_TO_LOCALES: Partial<Record<FontId, Set<AppLocaleKey>>> = {};
(Object.keys(APP_FONT_ITEMS_BY_LOCALE) as AppLocaleKey[]).forEach((locale) => {
  APP_FONT_ITEMS_BY_LOCALE[locale].forEach((item) => {
    const set = FONT_ID_TO_LOCALES[item.value] ?? new Set<AppLocaleKey>();
    set.add(locale);
    FONT_ID_TO_LOCALES[item.value] = set;
  });
});

/**
 * 선택된 폰트가 주어진 locale 에 속하는지 판단.
 * 앱 UI 언어 와 무관하게, 폰트 자체 기준으로 판단해야 영어 UI에서 한글 폰트를 선택하는 경우에서도 글자별 fallback이 올바르게 동작함.
 * 일부 폰트(예: ZCOOL QingKe HuangYou)는 zhTC·zhSC 양쪽 목록에 모두 있으므로,
 * 단일 locale로 단정하지 않고 멤버십으로 판단함.
 */
export function fontBelongsToLocale(
  appearanceFont: string,
  locale: AppLocaleKey,
): boolean {
  const id = normalizeFontId(appearanceFont);
  if (!id) return false;
  return FONT_ID_TO_LOCALES[id]?.has(locale) ?? false;
}

export function resolveFontFaceSet(appearanceFont: string): FontFaceSet {
  const id = normalizeFontId(appearanceFont);
  if (id) {
    return APP_FONT_FACE_SETS[id];
  }
  return APP_FONT_FACE_SETS[DEFAULT_FONT];
}

/** RNfontFamily키용 */
export function appFontFamilyForText(
  appearanceFont: string,
  fontWeight: "normal" | "bold",
  locale?: AppLocaleKey,
): string {
  if (locale && isSkiaOnlyFont(appearanceFont)) {
    return appFontFamilyForText(
      getDefaultForLocale(locale),
      fontWeight,
    );
  }
  const id = normalizeFontId(appearanceFont) ?? appearanceFont;
  const base = `AppFont-${id}`;
  return fontWeight === "bold" ? `${base}-bold` : base;
}

function buildFontAssetsForIds(ids: FontId[]): Record<string, number> {
  const out: Record<string, number> = {};
  ids.forEach((id) => {
    if (SKIA_ONLY_FONTS.has(id)) return;
    const set = APP_FONT_FACE_SETS[id];
    out[appFontFamilyForText(id, "normal")] = set.regular;
    out[appFontFamilyForText(id, "bold")] = set.bold;
  });
  return out;
}

export function getEagerFontIdsForLocale(locale: AppLocaleKey): FontId[] {
  return APP_FONT_ITEMS_BY_LOCALE[locale].map((item) => item.value);
}

/** 부트 시점에 즉시 로드할 폰트*/
export function buildEagerFontAssets(
  locale: AppLocaleKey,
): Record<string, number> {
  return buildFontAssetsForIds(getEagerFontIdsForLocale(locale));
}

/** 나머지 로케일 용 폰트*/
export function buildLazyFontAssets(
  locale: AppLocaleKey,
): Record<string, number> {
  const eagerIds = new Set(getEagerFontIdsForLocale(locale));
  const remainingIds = (Object.keys(APP_FONT_FACE_SETS) as FontId[]).filter(
    (id) => !eagerIds.has(id) && !SKIA_ONLY_FONTS.has(id),
  );
  return buildFontAssetsForIds(remainingIds);
}

export const APP_THEME_FONT_FAMILY = "AppTheme";
export const APP_THEME_FONT_FAMILY_BOLD = "AppTheme-Bold";

export const APP_THEME_FONT_ASSETS: Record<string, number> = {
  [APP_THEME_FONT_FAMILY]: require("../assets/fonts/Tektur/static/Tektur-Regular.ttf"),
  [APP_THEME_FONT_FAMILY_BOLD]: require("../assets/fonts/Tektur/static/Tektur-Bold.ttf"),
};

export const uiThemeFontStyle = { fontFamily: APP_THEME_FONT_FAMILY } as const;
