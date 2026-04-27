import {
  persistPresetSlotsSnapshot,
  readPresetSlotsJson,
} from "@/utils/presetStorage";
import type { SpeechBubblePresetId } from "@/constants/speechBubblePresets";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

/**
 * SettingsContext 사용 매뉴얼
 * 값 가져오기 (Getter)
 * const { config, ui } = useSettings();
 * const { fontSize, font } = config.appearance; // 특정 그룹에서 추출
 * const { isPlaying } = ui; // UI 상태 추출
 * [Context 업데이트 함수 사용법 가이드]
 *
 * 값 수정하기 (Setter)
 * * 1. 직접 업데이트 (Direct Update)
 * - 특정 그룹의 여러 값을 동시에 변경할 때
 * 예) updateConfig("appearance", { fontSize: 30, textSelectedColor: "#FF0000" })
 * 예) updateUI({ activeTab: "BACKGROUND", isPlaying: true })
 *
 * * 2. 개별 세터 함수 정의 (Setter Pattern)
 * - 기존 useState의 set함수처럼 특정 필드 업데이트를 위한 함수를 미리 정의해두고 사용할 때
 * const setFontSize = (value: number) => updateConfig("appearance", { fontSize: value });
 * // <Slider onChange={setFontSize} />
 *
 */
//Banner content, appearance, background, motion 설정을 담는 context
export interface BannerConfig {
  content: {
    previewText: string;
    playOption: "one" | "multi";
    oneLineJoinMode: "space3" | "concat";
    blurColor: string;
  };
  appearance: {
    font: string;
    fontSize: number;
    lineSpacing: number;
    textSelectedColor: string;
    outLine: number;
    dropShadow: number;
    effectSelectedItems: string[];
    /** 효과 슬라이더 백업용 */
    effectParamValues: Partial<Record<string, number>>;
    blurIntensity: number;
    glowIntensity: number;
    glowColor: string;
    blinkSpeed: number;
    pixelSize: number;
    fontWeight: "normal" | "bold";
    /** Effect에서 Gradient 켰을 때 배경 물결 등 (wave만 구현) */
    gradientBackgroundPreset: string;
    /** 배경 가장자리 이미지 이펙트 프리셋 */
    backgroundEffectPreset:
      | "none"
      | "effect1"
      | "heartBgA"
      | SpeechBubblePresetId;
  };
  background: {
    backgroundColor: string;
    /** 사진 배경 uri · 없으면 단색만 */
    backgroundImageUri: string | null;
    backgroundBlur: number;
  };
  motion: {
    textMoveSpeed: number;
  };
}

/** 프리셋에 저장할 목록록(playOption 제외) */
export type PresetSnapshot = {
  content: Omit<BannerConfig["content"], "playOption">;
  appearance: BannerConfig["appearance"];
  background: BannerConfig["background"];
  motion: BannerConfig["motion"];
};

export const PRESET_SLOT_COUNT = 5;
const PRESET_AUTOSAVE_DEBOUNCE_MS = 100;

/** appearance만 deep copy용 (배열·맵 참조 끊기) */
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
    oneLineJoinMode: "space3",
    blurColor: "",
  },
  appearance: {
    font: "nanum_gothic",
    fontSize: 50,
    lineSpacing: 10,
    textSelectedColor: "#000000",
    outLine: 0,
    dropShadow: 0,
    effectSelectedItems: ["Bold"],
    effectParamValues: {
      Glow: 50,
      Blink: 5,
      Pixel: 6,
      Blur: 0,
    },
    blurIntensity: 0,
    glowIntensity: 50,
    fontWeight: "bold",
    glowColor: "#FFD700",
    blinkSpeed: 5,
    pixelSize: 6,
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

/** 저장된 JSON과 기본값을 합쳐 필드 추가·누락에도 안전하게 복원 */
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

  const appearance = dupAppearance({
    ...base.appearance,
    ...appearancePartial,
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
  /** 선택된 프리셋 버튼 (0~4) */
  activePreset: number;
}
//여기서 제공할 config 및 업데이트 함수 정의
interface SettingsContextValue {
  config: BannerConfig;
  ui: UIState;
  updateConfig: <K extends keyof BannerConfig>(
    group: K,
    updates: Partial<BannerConfig[K]>,
  ) => void;
  updateUI: (updates: Partial<UIState>) => void;
  handleTextChange: (text: string) => void;
  fontItems: { label: string; value: string }[];
  effectItems: string[];
  savePreset: (index: number) => void;
  /** playOption은 유지된 채로 이전 슬롯을 자동 저장합니다*/
  loadPreset: (index: number) => void;
  resetPresetSlot: (index: number) => void;
}
const SettingsContext = createContext<SettingsContextValue | null>(null);
//해당 context 값을 제공하는 provider 컴포넌트
export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
};

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<BannerConfig>(DEFAULT_BANNER_CONFIG);

  const [presetSlots, setPresetSlots] = useState<PresetSnapshot[]>(() =>
    Array.from({ length: PRESET_SLOT_COUNT }, () =>
      presetFromConfig(DEFAULT_BANNER_CONFIG),
    ),
  );

  /** AsyncStorage에서 슬롯 복원 완료 전에는 자식을 마운트하지 않음(로드 전 저장·조작 레이스 방지) */
  const [presetsStorageReady, setPresetsStorageReady] = useState(false);
  /** state 커밋 전에도 “복원 완료” 여부를 동기적으로 알기 위함(저장 콜백에서 사용) */
  const presetsStorageReadyRef = useRef(false);

  const [ui, setUI] = useState<UIState>({
    isPlaying: false,
    activeTab: "TEXT",
    activePreset: 0,
  });

  /** 프리셋 저장/로드 시 최신 state용 */
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
        const raw = await readPresetSlotsJson();
        if (cancelled) return;
        let slots = blankSlots;
        if (raw) {
          const parsed = JSON.parse(raw) as unknown;
          if (Array.isArray(parsed) && parsed.length === PRESET_SLOT_COUNT) {
            slots = parsed.map((item) => normalizePresetSlot(item));
          }
        }
        setPresetSlots(slots);
      } catch {
        if (!cancelled) {
          setPresetSlots(blankSlots);
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

  // config 업데이트 함수
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
    const lines = text.split("\n");
    const filteredText = lines.length > 3 ? lines.slice(0, 3).join("\n") : text;
    updateConfig("content", { previewText: filteredText });
  };

  const savePreset = useCallback((index: number) => {
    if (index < 0 || index >= PRESET_SLOT_COUNT) return;
    setPresetSlots((prev) => {
      const next = [...prev];
      next[index] = presetFromConfig(configRef.current);
      if (presetsStorageReadyRef.current) {
        void persistPresetSlotsSnapshot(next).catch((err) => {
          if (__DEV__) console.warn("[presets] savePreset persist failed", err);
        });
      }
      return next;
    });
    setUI((prev) => ({ ...prev, activePreset: index }));
  }, []);

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

  const resetPresetSlot = useCallback((index: number) => {
    if (index < 0 || index >= PRESET_SLOT_COUNT) return;
    const blank = presetFromConfig(DEFAULT_BANNER_CONFIG);
    setPresetSlots((prev) => {
      const next = [...prev];
      next[index] = blank;
      if (presetsStorageReadyRef.current) {
        void persistPresetSlotsSnapshot(next).catch((err) => {
          if (__DEV__)
            console.warn("[presets] resetPresetSlot persist failed", err);
        });
      }
      return next;
    });
    if (index === activePresetRef.current) {
      setConfig(configFromPreset(blank, configRef.current.content.playOption));
    }
  }, []);

  // font select state
  const fontItems = useMemo(
    () => [
      { label: "Nanum Gothic", value: "nanum_gothic" },
      { label: "Noto Sans KR", value: "noto_sans_kr" },
      { label: "Roboto", value: "roboto" },
      { label: "Montserrat", value: "montserrat" },
      { label: "Open Sans", value: "open_sans" },
    ],
    [],
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
      updateConfig,
      updateUI,
      handleTextChange,
      fontItems,
      effectItems,
      savePreset,
      loadPreset,
      resetPresetSlot,
    }),
    [
      config,
      ui,
      fontItems,
      effectItems,
      savePreset,
      loadPreset,
      resetPresetSlot,
    ],
  );

  return (
    <SettingsContext.Provider value={value}>
      {presetsStorageReady ? children : null}
    </SettingsContext.Provider>
  );
}
