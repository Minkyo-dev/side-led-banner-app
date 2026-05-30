import {
  getDefaultAppearanceFontForLocale,
  getFontItemsForLocale,
} from "@/constants/appFonts";
import {
  APP_LOCALE_KEYS,
  type AppLanguagePreference,
  type AppLocaleKey,
} from "@/constants/language";
import { PRO_REWARD_DURATION_MS } from "@/constants/proMode";
import type { SpeechBubblePresetId } from "@/constants/speechBubblePresets";
import {
  type GoogleSheetLocaleRow,
  type GoogleSheetParseResult,
  useGoogleSheets,
} from "@/hooks/useGoogleSheets";
import { deviceLocaleToAppLocale } from "@/language/deviceLocale";
import type { EffectSectionLabelKey } from "@/language/effectSectionLabels";
import {
  effectChipLabel as resolveEffectChipLabel,
  tEffectSectionLabel,
} from "@/language/effectSectionLabels";
import type { RewardAdLabelKey } from "@/language/rewardAdLabels";
import { tRewardAdLabel } from "@/language/rewardAdLabels";
import type { TextSectionLabelKey } from "@/language/textSectionLabels";
import { tTextSectionLabel } from "@/language/textSectionLabels";
import {
  isProActive,
  readProExpiresAt,
  writeProExpiresAt,
} from "@/utils/proModeStorage";
import {
  persistPresetSlotsSnapshot,
  readPresetSlotsJson,
} from "@/utils/presetStorage";
import {
  normalizeOneLineJoinMode,
  type OneLineJoinMode,
} from "@/utils/viewMode";
import { useLocales } from "expo-localization";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

/** ?쒗듃 B~F ? ?댁슜??諛붾뚮㈃ 媛숈씠 諛붾뚮뒗 ?뺤닔*/
function sheetRowsLayoutRevision(rows: GoogleSheetLocaleRow[]): number {
  let h = 0;
  for (const r of rows) {
    h = (h * 47 + r.sheetRow) | 0;
    for (const k of APP_LOCALE_KEYS) {
      const s = r.locales[k] ?? "";
      for (let i = 0; i < s.length; i++) {
        h = (h * 31 + s.charCodeAt(i)) | 0;
      }
    }
  }
  return h;
}

/**
 * SettingsContext ?ъ슜 留ㅻ돱?? * 媛?媛?몄삤湲?(Getter)
 * const { config, ui } = useSettings();
 * const { fontSize, font } = config.appearance; // ?뱀젙 洹몃９?먯꽌 異붿텧
 * const { isPlaying } = ui; // UI ?곹깭 異붿텧
 * [Context ?낅뜲?댄듃 ?⑥닔 ?ъ슜踰?媛?대뱶]
 *
 * 媛??섏젙?섍린 (Setter)
 * * 1. 吏곸젒 ?낅뜲?댄듃 (Direct Update)
 * - ?뱀젙 洹몃９???щ윭 媛믪쓣 ?숈떆??蹂寃쏀븷 ?? * ?? updateConfig("appearance", { fontSize: 30, textSelectedColor: "#FF0000" })
 * ?? updateUI({ activeTab: "BACKGROUND", isPlaying: true })
 *
 * * 2. 媛쒕퀎 ?명꽣 ?⑥닔 ?뺤쓽 (Setter Pattern)
 * - 湲곗〈 useState??set?⑥닔泥섎읆 ?뱀젙 ?꾨뱶 ?낅뜲?댄듃瑜??꾪븳 ?⑥닔瑜?誘몃━ ?뺤쓽?대몢怨??ъ슜???? * const setFontSize = (value: number) => updateConfig("appearance", { fontSize: value });
 * // <Slider onChange={setFontSize} />
 *
 */
//Banner content, appearance, background, motion ?ㅼ젙???대뒗 context
export interface BannerConfig {
  content: {
    previewText: string;
    playOption: "one" | "multi";
    oneLineJoinMode: OneLineJoinMode;
    blurColor: string;
  };
  appearance: {
    font: string;
    fontSize: number;
    lineSpacing: number;
    letterSpacing: number;
    textSelectedColor: string;
    outLine: number;
    dropShadow: number;
    effectSelectedItems: string[];
    /** ?④낵 ?щ씪?대뜑 諛깆뾽??*/
    effectParamValues: Partial<Record<string, number>>;
    blurIntensity: number;
    glowIntensity: number;
    glowColor: string;
    blinkSpeed: number;
    pixelColorMix: boolean;
    fontWeight: "normal" | "bold";
    /** Effect?먯꽌 Gradient 耳곗쓣 ??諛곌꼍 臾쇨껐 ??(wave留?援ы쁽) */
    gradientBackgroundPreset: string;
    /** 諛곌꼍 媛?μ옄由??대?吏 ?댄럺???꾨━??*/
    backgroundEffectPreset:
      | "none"
      | "effect1"
      | "heartBgA"
      | SpeechBubblePresetId;
  };
  background: {
    backgroundColor: string;
    /** ?ъ쭊 諛곌꼍 uri 쨌 ?놁쑝硫??⑥깋留?*/
    backgroundImageUri: string | null;
    backgroundBlur: number;
  };
  motion: {
    textMoveSpeed: number;
  };
}

/** ?꾨━?뗭뿉 ??ν븷 紐⑸줉濡?playOption ?쒖쇅) */
export type PresetSnapshot = {
  content: Omit<BannerConfig["content"], "playOption">;
  appearance: BannerConfig["appearance"];
  background: BannerConfig["background"];
  motion: BannerConfig["motion"];
};

export const PRESET_SLOT_COUNT = 5;

export const PREVIEW_TEXT_MAX_LINES = 3;
const PRESET_AUTOSAVE_DEBOUNCE_MS = 500;

export function normalizePreviewTextMaxLines(text: string): string | null {
  const normalized = text.replace(/\r\n?/g, "\n");
  const lines = normalized.split("\n");
  if (lines.length <= PREVIEW_TEXT_MAX_LINES) {
    return normalized;
  }
  return null;
}

/** appearance留?deep copy??(諛곗뿴쨌留?李몄“ ?딄린) */
function dupAppearance(
  appearance: BannerConfig["appearance"],
): BannerConfig["appearance"] {
  return {
    ...appearance,
    effectSelectedItems: [...appearance.effectSelectedItems],
    effectParamValues: { ...(appearance.effectParamValues ?? {}) },
  };
}

function presetFromConfig(config: BannerConfig): PresetSnapshot {
  const { playOption: _p, ...contentRest } = config.content;
  return {
    content: { ...contentRest },
    appearance: dupAppearance(config.appearance),
    background: { ...config.background },
    motion: { ...config.motion },
  };
}

function configFromPreset(
  snap: PresetSnapshot,
  playOption: BannerConfig["content"]["playOption"],
): BannerConfig {
  return {
    content: {
      ...snap.content,
      playOption,
      oneLineJoinMode: normalizeOneLineJoinMode(snap.content.oneLineJoinMode),
    },
    appearance: dupAppearance(snap.appearance),
    background: { ...snap.background },
    motion: { ...snap.motion },
  };
}

const DEFAULT_BANNER_CONFIG: BannerConfig = {
  content: {
    previewText:
      "Hello, World! asdlfkjas;dlkfja;sldkfja;sldkjfa;slkdjfas;dlkfjasd;flkj",
    playOption: "one",
    oneLineJoinMode: "space6",
    blurColor: "",
  },
  appearance: {
    font: "black_han_sans",
    fontSize: 50,
    lineSpacing: 10,
    letterSpacing: 10,
    textSelectedColor: "#000000",
    outLine: 0,
    dropShadow: 0,
    effectSelectedItems: ["Bold"],
    effectParamValues: {
      Glow: 50,
      Blink: 5,
      Blur: 0,
    },
    blurIntensity: 0,
    glowIntensity: 50,
    fontWeight: "bold",
    glowColor: "#FFD700",
    blinkSpeed: 5,
    pixelColorMix: false,
    gradientBackgroundPreset: "wave",
    backgroundEffectPreset: "none",
  },
  background: {
    backgroundColor: "#FFFFFF",
    backgroundImageUri: null,
    backgroundBlur: 50,
  },
  motion: {
    textMoveSpeed: 50,
  },
};

/** ??λ맂 JSON怨?湲곕낯媛믪쓣 ?⑹퀜 ?꾨뱶 異붽?쨌?꾨씫?먮룄 ?덉쟾?섍쾶 蹂듭썝 */
function normalizePresetSlot(raw: unknown): PresetSnapshot {
  const base = DEFAULT_BANNER_CONFIG;
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return presetFromConfig(base);
  }
  const o = raw as Partial<PresetSnapshot>;

  const pct =
    o.content && typeof o.content === "object" && !Array.isArray(o.content)
      ? o.content
      : {};
  const appearancePartial: Partial<BannerConfig["appearance"]> =
    o.appearance &&
    typeof o.appearance === "object" &&
    !Array.isArray(o.appearance)
      ? (o.appearance as Partial<BannerConfig["appearance"]>)
      : {};

  const legacyLineSpacing =
    typeof (appearancePartial as { lineSpacing?: unknown }).lineSpacing ===
    "number"
      ? (appearancePartial as { lineSpacing: number }).lineSpacing
      : undefined;
  const legacyLetterSpacing =
    typeof (appearancePartial as { letterSpacing?: unknown }).letterSpacing ===
    "number"
      ? (appearancePartial as { letterSpacing: number }).letterSpacing
      : undefined;

  const appearance = dupAppearance({
    ...base.appearance,
    ...appearancePartial,
    lineSpacing: legacyLineSpacing ?? base.appearance.lineSpacing,
    letterSpacing: legacyLetterSpacing ?? base.appearance.letterSpacing,
    effectSelectedItems: Array.isArray(appearancePartial.effectSelectedItems)
      ? [...appearancePartial.effectSelectedItems]
      : base.appearance.effectSelectedItems,
    effectParamValues: {
      ...base.appearance.effectParamValues,
      ...appearancePartial.effectParamValues,
    },
  });

  const bgPartial =
    o.background &&
    typeof o.background === "object" &&
    !Array.isArray(o.background)
      ? o.background
      : {};
  const motionPartial =
    o.motion && typeof o.motion === "object" && !Array.isArray(o.motion)
      ? o.motion
      : {};

  return presetFromConfig({
    ...base,
    content: { ...base.content, ...pct },
    appearance,
    background: { ...base.background, ...bgPartial },
    motion: { ...base.motion, ...motionPartial },
  });
}

// UI State
export type TabType = "TEXT" | "BACKGROUND" | "EFFECT";
export interface UIState {
  isPlaying: boolean;
  activeTab: TabType;
  /** ?좏깮???꾨━??踰꾪듉 (0~4) */
  activePreset: number;
  /**
   * ?ㅼ젙 ?붾㈃?먯꽌 ?몄뼱 ?꾪솚 UI瑜?遺숈씪 ??`updateUI({ appLanguage: "ko" })` ?깆쑝濡?媛깆떊?댁＜?몄슂.
   */
  appLanguage: AppLanguagePreference;
}
//?ш린???쒓났??config 諛??낅뜲?댄듃 ?⑥닔 ?뺤쓽
interface SettingsContextValue {
  config: BannerConfig;
  ui: UIState;
  /** `appLanguage === "system"`????湲곌린 濡쒖??? ?꾨땲硫?`appLanguage`? ?숈씪 */
  resolvedAppLocale: AppLocaleKey;
  updateConfig: <K extends keyof BannerConfig>(
    group: K,
    updates: Partial<BannerConfig[K]>,
  ) => void;
  updateUI: (updates: Partial<UIState>) => void;
  handleTextChange: (text: string) => void;
  fontItems: { label: string; value: string }[];
  effectItems: string[];
  /** playOption? ?좎???梨꾨줈 ?댁쟾 ?щ’???먮룞 ??ν빀?덈떎*/
  loadPreset: (index: number) => void;
  /** ?뚯떛 ?꾩껜(?붾쾭洹몄슜). */
  sheetParseResult: GoogleSheetParseResult | null;
  sheetStringsLoading: boolean;
  sheetStringsError: Error | null;
  refetchSheetStrings: () => Promise<void>;
  /** ?쒗듃 ?곗꽑, ?놁쑝硫?肄붾뱶 fallback */
  textSectionLabel: (key: TextSectionLabelKey) => string;
  effectSectionLabel: (key: EffectSectionLabelKey) => string;
  effectChipLabel: (effectId: string) => string;
  rewardAdLabel: (key: RewardAdLabelKey) => string;
  isProMode: boolean;
  proExpiresAt: number | null;
  activateProFromReward: () => void;
  clearProMode: () => void;
  /**
   * 寃뚯떆 CSV ?됀룹? ?댁슜??諛붾??뚮쭏??諛붾?
   */
  sheetStringsRevision: number;
}
const SettingsContext = createContext<SettingsContextValue | null>(null);
//?대떦 context 媛믪쓣 ?쒓났?섎뒗 provider 而댄룷?뚰듃
export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
};

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  /**?ㅽ봽?덈뱶 ?쒗듃 ?곗씠??*/
  const {
    data: sheetData,
    loading: sheetStringsLoading,
    error: sheetStringsError,
    refetch: refetchSheetStrings,
  } = useGoogleSheets();

  /** 湲곌린 濡쒖???*/
  const locales = useLocales();
  const primaryLocale = locales[0];
  /** 湲곌린 濡쒖??쇱쓣 AppLocaleKey (ko, en, ja, zhTC, zhSC)濡?蹂??*/
  const deviceAppLocale = useMemo(
    () => deviceLocaleToAppLocale(primaryLocale ?? { languageCode: "en" }),
    [
      primaryLocale?.languageTag,
      primaryLocale?.languageCode,
      primaryLocale?.languageScriptCode,
      primaryLocale?.regionCode,
    ],
  );

  const [config, setConfig] = useState<BannerConfig>(DEFAULT_BANNER_CONFIG);

  const [presetSlots, setPresetSlots] = useState<PresetSnapshot[]>(() =>
    Array.from({ length: PRESET_SLOT_COUNT }, () =>
      presetFromConfig(DEFAULT_BANNER_CONFIG),
    ),
  );

  /** AsyncStorage?먯꽌 ?щ’ 蹂듭썝 ?꾨즺 ?꾩뿉???먯떇??留덉슫?명븯吏 ?딆쓬(濡쒕뱶 ????Β룹“???덉씠??諛⑹?) */
  const [presetsStorageReady, setPresetsStorageReady] = useState(false);
  /** state 而ㅻ컠 ?꾩뿉???쒕났???꾨즺???щ?瑜??숆린?곸쑝濡??뚭린 ?꾪븿(???肄쒕갚?먯꽌 ?ъ슜) */
  const presetsStorageReadyRef = useRef(false);

  const [ui, setUI] = useState<UIState>({
    isPlaying: false,
    activeTab: "TEXT",
    activePreset: 0,
    appLanguage: "system",
  });

  const [proExpiresAt, setProExpiresAt] = useState<number | null>(null);
  const isProMode = isProActive(proExpiresAt);

  const resolvedAppLocale: AppLocaleKey =
    ui.appLanguage === "system" ? deviceAppLocale : ui.appLanguage;

  const sheetParseResult = sheetData ?? null;
  const sheetRows = sheetData?.rows ?? null;

  const sheetStringsRevision = useMemo(
    () =>
      sheetData?.rows?.length ? sheetRowsLayoutRevision(sheetData.rows) : 0,
    [sheetData],
  );

  const textSectionLabel = useCallback(
    (key: TextSectionLabelKey) =>
      tTextSectionLabel(key, resolvedAppLocale, sheetRows),
    [resolvedAppLocale, sheetRows],
  );

  const effectSectionLabel = useCallback(
    (key: EffectSectionLabelKey) =>
      tEffectSectionLabel(key, resolvedAppLocale, sheetRows),
    [resolvedAppLocale, sheetRows],
  );

  const effectChipLabel = useCallback(
    (effectId: string) =>
      resolveEffectChipLabel(effectId, resolvedAppLocale, sheetRows),
    [resolvedAppLocale, sheetRows],
  );

  const rewardAdLabel = useCallback(
    (key: RewardAdLabelKey) =>
      tRewardAdLabel(key, resolvedAppLocale, sheetRows),
    [resolvedAppLocale, sheetRows],
  );

  const clearProMode = useCallback(() => {
    setProExpiresAt(null);
    void writeProExpiresAt(null);
  }, []);

  const activateProFromReward = useCallback(() => {
    const expiresAt = Date.now() + PRO_REWARD_DURATION_MS;
    setProExpiresAt(expiresAt);
    void writeProExpiresAt(expiresAt);
  }, []);

  useEffect(() => {
    if (!isProActive(proExpiresAt)) return;

    const timeoutId = setTimeout(() => {
      clearProMode();
    }, proExpiresAt! - Date.now());

    return () => clearTimeout(timeoutId);
  }, [proExpiresAt, clearProMode]);

  /** ?꾨━?????濡쒕뱶 ??理쒖떊 state??*/
  const configRef = useRef(config);
  const presetSlotsRef = useRef(presetSlots);
  const activePresetRef = useRef(ui.activePreset);
  useEffect(() => {
    configRef.current = config;
  }, [config]);
  useEffect(() => {
    presetSlotsRef.current = presetSlots;
  }, [presetSlots]);
  useEffect(() => {
    activePresetRef.current = ui.activePreset;
  }, [ui.activePreset]);

  useEffect(() => {
    if (!presetsStorageReadyRef.current) return;
    const timeoutId = setTimeout(() => {
      const active = activePresetRef.current;
      setPresetSlots((prev) => {
        if (active < 0 || active >= PRESET_SLOT_COUNT) return prev;
        const next = [...prev];
        next[active] = presetFromConfig(configRef.current);
        void persistPresetSlotsSnapshot(next).catch((err) => {
          if (__DEV__) console.warn("[presets] autosave persist failed", err);
        });
        return next;
      });
    }, PRESET_AUTOSAVE_DEBOUNCE_MS);

    return () => clearTimeout(timeoutId);
  }, [config, ui.activePreset]);

  useEffect(() => {
    let cancelled = false;
    const blankSlots = Array.from({ length: PRESET_SLOT_COUNT }, () =>
      presetFromConfig(DEFAULT_BANNER_CONFIG),
    );
    (async () => {
      try {
        const [raw, storedProExpiresAt] = await Promise.all([
          readPresetSlotsJson(),
          readProExpiresAt(),
        ]);
        if (cancelled) return;

        if (isProActive(storedProExpiresAt)) {
          setProExpiresAt(storedProExpiresAt);
        } else if (storedProExpiresAt != null) {
          void writeProExpiresAt(null);
        }

        let slots = blankSlots;
        if (raw) {
          const parsed = JSON.parse(raw) as unknown;
          if (Array.isArray(parsed) && parsed.length === PRESET_SLOT_COUNT) {
            slots = parsed.map((item) => normalizePresetSlot(item));
          }
        }
        setPresetSlots(slots);
        const active = activePresetRef.current;
        if (active >= 0 && active < slots.length) {
          const chosen = slots[active];
          if (chosen) {
            setConfig(
              configFromPreset(chosen, configRef.current.content.playOption),
            );
          }
        }
      } catch {
        if (!cancelled) {
          setPresetSlots(blankSlots);
          const active = activePresetRef.current;
          if (active >= 0 && active < blankSlots.length) {
            const chosen = blankSlots[active];
            if (chosen) {
              setConfig(
                configFromPreset(chosen, configRef.current.content.playOption),
              );
            }
          }
          void persistPresetSlotsSnapshot(blankSlots).catch((err) => {
            if (__DEV__)
              console.warn("[presets] persist after load error", err);
          });
        }
      } finally {
        if (!cancelled) {
          presetsStorageReadyRef.current = true;
          setPresetsStorageReady(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // config ?낅뜲?댄듃 ?⑥닔
  const updateConfig = <K extends keyof BannerConfig>(
    group: K,
    updates: Partial<BannerConfig[K]>,
  ) => {
    setConfig((prev) => ({
      ...prev,
      [group]: { ...prev[group], ...updates },
    }));
  };

  const updateUI = (updates: Partial<UIState>) => {
    setUI((prev) => ({ ...prev, ...updates }));
  };

  const handleTextChange = (text: string) => {
    const next = normalizePreviewTextMaxLines(text);
    if (next == null) return;
    updateConfig("content", { previewText: next });
  };

  const loadPreset = useCallback((slot: number) => {
    if (slot < 0 || slot >= PRESET_SLOT_COUNT) return;

    const cfg = configRef.current;
    const prev = activePresetRef.current;
    const slots = [...presetSlotsRef.current];

    if (prev !== slot) {
      slots[prev] = presetFromConfig(cfg);
    }

    const chosen = slots[slot];
    if (!chosen) return;

    if (presetsStorageReadyRef.current) {
      void persistPresetSlotsSnapshot(slots).catch((err) => {
        if (__DEV__) console.warn("[presets] loadPreset persist failed", err);
      });
    }
    setPresetSlots(slots);
    setConfig(configFromPreset(chosen, cfg.content.playOption));
    setUI((u) => ({ ...u, activePreset: slot }));
  }, []);

  useEffect(() => {
    const localeFonts = getFontItemsForLocale(resolvedAppLocale);
    if (localeFonts.some((item) => item.value === config.appearance.font)) {
      return;
    }

    setConfig((prev) => ({
      ...prev,
      appearance: {
        ...prev.appearance,
        font: getDefaultAppearanceFontForLocale(resolvedAppLocale),
      },
    }));
  }, [config.appearance.font, resolvedAppLocale]);

  // font select state
  const fontItems = useMemo(
    () => getFontItemsForLocale(resolvedAppLocale),
    [resolvedAppLocale],
  );
  // effect items list
  const effectItems = useMemo(
    () => ["Bold", "Blink", "Pixel", "Glow", "Gradient"],
    [],
  );
  const value = useMemo(
    () => ({
      config,
      ui,
      resolvedAppLocale,
      updateConfig,
      updateUI,
      handleTextChange,
      fontItems,
      effectItems,
      loadPreset,
      sheetParseResult,
      sheetStringsLoading,
      sheetStringsError,
      refetchSheetStrings,
      textSectionLabel,
      effectSectionLabel,
      effectChipLabel,
      rewardAdLabel,
      isProMode,
      proExpiresAt,
      activateProFromReward,
      clearProMode,
      sheetStringsRevision,
    }),
    [
      config,
      ui,
      resolvedAppLocale,
      fontItems,
      effectItems,
      loadPreset,
      sheetParseResult,
      sheetStringsLoading,
      sheetStringsError,
      refetchSheetStrings,
      textSectionLabel,
      effectSectionLabel,
      effectChipLabel,
      rewardAdLabel,
      isProMode,
      proExpiresAt,
      activateProFromReward,
      clearProMode,
      sheetStringsRevision,
    ],
  );

  return (
    <SettingsContext.Provider value={value}>
      {presetsStorageReady ? children : null}
    </SettingsContext.Provider>
  );
}
