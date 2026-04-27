import { useEffect, useMemo, useState } from "react";

type BackgroundEffectPreset =
  | "none"
  | "effect1"
  | "heartBgA"
  | "speechBg1"
  | "speechBg2";
type BackgroundEffectFrame = "on" | "light" | "off";
type Effect1Sources = {
  left: number;
  right: number;
};

const FRAME_SEQUENCE: BackgroundEffectFrame[] = ["on", "light", "off"];
const FRAME_DURATION_MS = 260;

const EFFECT_1_SOURCES = {
  on: {
    left: require("@/assets/images/Effect 1_on_L.png"),
    right: require("@/assets/images/Effect 1_on_R.png"),
  },
  light: {
    left: require("@/assets/images/Effect 1_light_L.png"),
    right: require("@/assets/images/Effect 1_light_R.png"),
  },
  off: {
    left: require("@/assets/images/Effect 1_off_L.png"),
    right: require("@/assets/images/Effect 1_off_R.png"),
  },
} as const;

const HEART_BG_A_SOURCE = require("@/assets/images/Heart BG_A.png");

export type BackgroundEffectAnimationResult =
  | {
      kind: "none";
      isEnabled: false;
      imageSource: null;
      sources: null;
    }
  | {
      kind: "effect1";
      isEnabled: true;
      imageSource: null;
      sources: Effect1Sources;
    }
  | {
      kind: "heartBgA";
      isEnabled: true;
      imageSource: number;
      sources: null;
    }
  | {
      kind: "speechBg1" | "speechBg2";
      isEnabled: true;
      imageSource: null;
      sources: null;
    };

//각 배경 이펙트마다 렌더링 가능한 상태로 바꿈
export function useBackgroundEffectAnimation(preset: BackgroundEffectPreset) {
  const [frameIndex, setFrameIndex] = useState(0);
  const isEnabled = preset === "effect1";
  const isHeartEnabled = preset === "heartBgA";
  const isSpeechBg1 = preset === "speechBg1";
  const isSpeechBg2 = preset === "speechBg2";

  useEffect(() => {
    if (!isEnabled) {
      setFrameIndex(0);
      return;
    }
    const id = setInterval(() => {
      setFrameIndex((prev) => (prev + 1) % FRAME_SEQUENCE.length);
    }, FRAME_DURATION_MS);
    return () => clearInterval(id);
  }, [isEnabled]);

  return useMemo<BackgroundEffectAnimationResult>(() => {
    if (isHeartEnabled) {
      return {
        kind: "heartBgA",
        isEnabled: true,
        imageSource: HEART_BG_A_SOURCE,
        sources: null,
      } as const;
    }
    if (isSpeechBg1) {
      return {
        kind: "speechBg1",
        isEnabled: true,
        imageSource: null,
        sources: null,
      } as const;
    }
    if (isSpeechBg2) {
      return {
        kind: "speechBg2",
        isEnabled: true,
        imageSource: null,
        sources: null,
      } as const;
    }

    if (!isEnabled) {
      return {
        kind: "none",
        isEnabled: false,
        imageSource: null,
        sources: null,
      } as const;
    }
    const frame = FRAME_SEQUENCE[frameIndex];
    return {
      kind: "effect1",
      isEnabled: true,
      imageSource: null,
      sources: EFFECT_1_SOURCES[frame],
    } as const;
  }, [frameIndex, isEnabled, isHeartEnabled, isSpeechBg1, isSpeechBg2]);
}
