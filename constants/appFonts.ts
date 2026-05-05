/** `settings` `appearance.font` 값과 동일한 키 */
export type AppearanceFontId =
  | "nanum_gothic"
  | "noto_sans_kr"
  | "roboto"
  | "montserrat"
  | "open_sans";

export interface FontFaceSet {
  regular: number;
  bold: number;
}

const nanumGothic: FontFaceSet = {
  regular: require("@/assets/fonts/Nanum_Gothic/NanumGothic-Regular.ttf"),
  bold: require("@/assets/fonts/Nanum_Gothic/NanumGothic-Bold.ttf"),
};

const notoSansKr: FontFaceSet = {
  regular: require("@/assets/fonts/Noto_Sans_KR/static/NotoSansKR-Regular.ttf"),
  bold: require("@/assets/fonts/Noto_Sans_KR/static/NotoSansKR-Bold.ttf"),
};

const roboto: FontFaceSet = {
  regular: require("@/assets/fonts/Roboto/static/Roboto-Regular.ttf"),
  bold: require("@/assets/fonts/Roboto/static/Roboto-Bold.ttf"),
};

const montserrat: FontFaceSet = {
  regular: require("@/assets/fonts/Montserrat/static/Montserrat-Regular.ttf"),
  bold: require("@/assets/fonts/Montserrat/static/Montserrat-Bold.ttf"),
};

const openSans: FontFaceSet = {
  regular: require("@/assets/fonts/Open_Sans/static/OpenSans-Regular.ttf"),
  bold: require("@/assets/fonts/Open_Sans/static/OpenSans-Bold.ttf"),
};

/** Skia·RN 공통: 폰트 키별 regular / bold 에셋(require id) */
export const APP_FONT_FACE_SETS: Record<AppearanceFontId, FontFaceSet> = {
  nanum_gothic: nanumGothic,
  noto_sans_kr: notoSansKr,
  roboto,
  montserrat,
  open_sans: openSans,
};

const DEFAULT_APPEARANCE_FONT: AppearanceFontId = "nanum_gothic";

export function resolveAppearanceFontFaceSet(appearanceFont: string): FontFaceSet {
  if (
    Object.prototype.hasOwnProperty.call(APP_FONT_FACE_SETS, appearanceFont)
  ) {
    return APP_FONT_FACE_SETS[appearanceFont as AppearanceFontId];
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
