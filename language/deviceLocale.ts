import type { AppLocaleKey } from "@/constants/language";

type LocaleLike = {
  languageCode?: string | null;
  languageScriptCode?: string | null;
  regionCode?: string | null;
};

/**
 * `expo-localization` 등에서 온 값을 앱 로케일 키로 매핑합니다.
 * (스프레드시트 B~F와 동일한 다섯 분기)
 */
export function deviceLocaleToAppLocale(locale: LocaleLike): AppLocaleKey {
  const code = (locale.languageCode ?? "").toLowerCase();
  const script = (locale.languageScriptCode ?? "").toLowerCase();
  const region = (locale.regionCode ?? "").toUpperCase();

  if (code === "ko") return "ko";
  if (code === "ja") return "ja";
  if (code === "en") return "en";

  if (code === "zh") {
    if (script === "hant" || region === "TW" || region === "HK" || region === "MO") {
      return "zhTC";
    }
    if (script === "hans" || region === "CN" || region === "SG") {
      return "zhSC";
    }
    return "zhSC";
  }

  return "en";
}
