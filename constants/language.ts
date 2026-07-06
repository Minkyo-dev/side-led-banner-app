/** 앱 locale 슬롯용 */
export const APP_LOCALE_KEYS = ["ko", "en", "ja", "zhTC", "zhSC", "fr", "es"] as const;

export type AppLocaleKey = (typeof APP_LOCALE_KEYS)[number];

/** system·locale 선택용 */
export type AppLanguagePreference = "system" | AppLocaleKey;
