// contexts/LedBannerSettingsContext.tsx
import React, { createContext, useContext, useMemo, useState } from "react";

type TabType = "TEXT" | "BACKGROUND" | "EFFECT";

type SettingsContextValue = {
  // is playing state
  isPlaying: boolean;
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
  // play option button state
  playOption: "one" | "multi";
  setPlayOption: React.Dispatch<React.SetStateAction<"one" | "multi">>;
  // preset button state
  activePreset: number;
  setActivePreset: React.Dispatch<React.SetStateAction<number>>;
  // tab state
  activeTab: TabType;
  setActiveTab: React.Dispatch<React.SetStateAction<TabType>>;
  // preview text state
  previewText: string;
  setPreviewText: React.Dispatch<React.SetStateAction<string>>;
  handleTextChange: (text: string) => void; // RN TextInput용 핸들러
  // font select items
  fontItems: { label: string; value: string }[];
  // font select state
  font: string;
  setFont: React.Dispatch<React.SetStateAction<string>>;
  // speed slider state
  textMoveSpeed: number;
  setTextMoveSpeed: React.Dispatch<React.SetStateAction<number>>;
  // font size slider state
  fontSize: number;
  setFontSize: React.Dispatch<React.SetStateAction<number>>;
  // out line slider state
  outLine: number;
  setOutLine: React.Dispatch<React.SetStateAction<number>>;
  // drop shadow slider state
  dropShadow: number;
  setDropShadow: React.Dispatch<React.SetStateAction<number>>;
  // background blur slider state
  backgroundBlur: number;
  setBackgroundBlur: React.Dispatch<React.SetStateAction<number>>;
  // text color picker state
  textSelectedColor: string;
  setTextSelectedColor: React.Dispatch<React.SetStateAction<string>>;
  // background color picker state
  backgroundColor: string;
  setBackgroundColor: React.Dispatch<React.SetStateAction<string>>;
  // effect items state
  effectSelectedItem: string;
  setEffectSelectedItem: React.Dispatch<React.SetStateAction<string>>;
  // effect items list
  effectItems: string[];
};

const SettingsContext = createContext<SettingsContextValue | null>(
  null,
);

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within Provider");
  return ctx;
};

export function SettingsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // is playing state
  const [isPlaying, setIsPlaying] = useState(false);

  // play option button state
  const [playOption, setPlayOption] = useState<"one" | "multi">("one");

  // preset button state
  const [activePreset, setActivePreset] = useState(1);

  // tab state
  const [activeTab, setActiveTab] = useState<TabType>("TEXT");

  // preview text state
  const [previewText, setPreviewText] = useState(
    "Hello, World! asdlfkjas;dlkfja;sldkfja;sldkjfa;slkdjfas;dlkfjasd;flkj",
  );

  // RN TextInput 개행 제한 핸들러
  const handleTextChange = (text: string) => {
    const lines = text.split("\n");
    if (lines.length > 3) {
      setPreviewText(lines.slice(0, 3).join("\n"));
    } else {
      setPreviewText(text);
    }
  };

  // font select items
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

  // font select state
  const [font, setFont] = useState("nanum_gothic");

  // speed slider state
  const [textMoveSpeed, setTextMoveSpeed] = useState(50);

  // font size slider state
  const [fontSize, setFontSize] = useState(50);

  // out line slider state
  const [outLine, setOutLine] = useState(50);

  // drop shadow slider state
  const [dropShadow, setDropShadow] = useState(50);

  // background blur slider state
  const [backgroundBlur, setBackgroundBlur] = useState(50);

  // text color picker state
  const [textSelectedColor, setTextSelectedColor] = useState("#000000");

  // background color picker state
  const [backgroundColor, setBackgroundColor] = useState("#FFFFFF");

  // effect items state
  const [effectSelectedItem, setEffectSelectedItem] = useState("Bold");

  // effect items list
  const effectItems = useMemo(() => ["Bold", "Blink", "Pixel", "Glow", "Gradient"], []);

  const value: SettingsContextValue = {
    // is playing state
    isPlaying,
    setIsPlaying,
    // play option button state
    playOption,
    setPlayOption,
    // preset button state
    activePreset,
    setActivePreset,
    // tab state
    activeTab,
    setActiveTab,
    // preview text state
    previewText,
    setPreviewText,
    handleTextChange,
    // font select items
    fontItems,
    // font select state
    font,
    setFont,
    // speed slider state
    textMoveSpeed,
    setTextMoveSpeed,
    // font size slider state
    fontSize,
    setFontSize,
    // out line slider state
    outLine,
    setOutLine,
    // drop shadow slider state
    dropShadow,
    setDropShadow,
    // background blur slider state
    backgroundBlur,
    setBackgroundBlur,
    // text color picker state
    textSelectedColor,
    setTextSelectedColor,
    // background color picker state
    backgroundColor,
    setBackgroundColor,
    // effect items state
    effectSelectedItem,
    setEffectSelectedItem,
    // effect items list
    effectItems,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}