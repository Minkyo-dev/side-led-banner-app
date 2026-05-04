/**
 * 앱 표시 언어 슬롯(기기/앱 설정·스프레드시트 B~F 열과 동일한 다섯 값).
 */
export const APP_LOCALE_KEYS = ["ko", "en", "ja", "zhTC", "zhSC"] as const;

export type AppLocaleKey = (typeof APP_LOCALE_KEYS)[number];

/** `system`이면 기기 언어에서 `AppLocaleKey`를 추론합니다. */
export type AppLanguagePreference = "system" | AppLocaleKey;
//AppLocalKey => AppLanguagePreference로 변환