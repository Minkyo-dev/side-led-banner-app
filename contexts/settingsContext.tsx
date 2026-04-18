import React, { createContext, useContext, useMemo, useState } from "react";

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
    blurColor : string;
  };
  appearance: {
    font: string;
    fontSize: number;
    lineSpacing: number;
    textSelectedColor: string;
    outLine: number;
    dropShadow: number;
    effectSelectedItems: string[];
    blurIntensity: number;
    glowIntensity: number;
    glowColor: string;
    blinkSpeed : number;
    pixelSize: number;
    fontWeight: "normal" | "bold";
  };
  background: {
    backgroundColor: string;
    backgroundBlur: number;
  };
  motion: {
    textMoveSpeed: number;
  };
}

// UI State
export type TabType = "TEXT" | "BACKGROUND" | "EFFECT";
export interface UIState {
  isPlaying: boolean;
  activeTab: TabType;
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
}
const SettingsContext = createContext<SettingsContextValue | null>(null);
//해당 context 값을 제공하는 provider 컴포넌트
export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
};

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  //위에서 정의한 config를 하나의 state로 관리
  const [config, setConfig] = useState<BannerConfig>({
    content: {
      previewText:
        "Hello, World! asdlfkjas;dlkfja;sldkfja;sldkjfa;slkdjfas;dlkfjasd;flkj",
      playOption: "one",
      blurColor: "",
    },
    appearance: {
      font: "nanum_gothic",
      fontSize: 50,
      lineSpacing: 10,
      textSelectedColor: "#000000",
      outLine: 0,
      dropShadow: 50,
      effectSelectedItems: ["Bold"],
      blurIntensity: 0,
      glowIntensity: 50,
      fontWeight: "bold",
      glowColor: "#FFD700",
      blinkSpeed: 5,
      pixelSize: 6,
    },
    background: {
      backgroundColor: "#FFFFFF",
      backgroundBlur: 50,
    },
    motion: {
      textMoveSpeed: 50,
    },
  });

  const [ui, setUI] = useState<UIState>({
    isPlaying: false,
    activeTab: "TEXT",
    activePreset: 1,
  });

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
  // value 객체는 config, ui, 업데이트 함수, 그리고 fontItems와 effectItems를 포함하여 memoize하여 제공
  const value = useMemo(
    () => ({
      config,
      ui,
      updateConfig,
      updateUI,
      handleTextChange,
      fontItems,
      effectItems,
    }),
    [config, ui, fontItems, effectItems],
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}
