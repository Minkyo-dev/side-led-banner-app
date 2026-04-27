/**
 * 사용 방법 (새로 background effect 추가할 때)
 * 1. BackgroundEffectPreset 타입에 새로운 키 추가
 * 2) 정적인 이미지의 경우에는 heartBgA 참조해서 넣어주세요 (isEnabled는 응원봉 반짝이는 효과 여부입니다)
 * 3) 애니메이션 (effect1)의 경우에는 sources 로 Effect1Soruces참고해주세요
 * 4) id는 effect 식별자입니다.
 */
import {
  isSpeechBubblePreset,
  type SpeechBubblePresetId,
} from "@/constants/speechBubblePresets";
import { useEffect, useMemo, useState } from "react";

type BackgroundEffectPreset =
  | "none"
  | "effect1"
  | "heartBgA"
  | SpeechBubblePresetId;
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
      id: "none";
      isEnabled: false;
      imageSource: null;
      sources: null;
    }
  | {
      id: "effect1";
      isEnabled: true;
      imageSource: null;
      sources: Effect1Sources;
    }
  | {
      id: "heartBgA";
      isEnabled: false;
      imageSource: number;
      sources: null;
    }
  | {
      id: SpeechBubblePresetId;
      isEnabled: false;
      imageSource: null;
      sources: null;
    };

//각 배경 이펙트마다 렌더링 가능한 상태로 바꿈
export function useBackgroundEffectAnimation(preset: BackgroundEffectPreset) {
  const [frameIndex, setFrameIndex] = useState(0);
  const isEnabled = preset === "effect1";
  const isHeartEnabled = preset === "heartBgA";
  const isSpeechBubble = isSpeechBubblePreset(preset);

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
        id: "heartBgA",
        isEnabled: false,
        imageSource: HEART_BG_A_SOURCE,
        sources: null,
      } as const;
    }
    if (isSpeechBubble) {
      return {
        id: preset,
        isEnabled: false,
        imageSource: null,
        sources: null,
      } as const;
    }

    if (!isEnabled) {
      return {
        id: "none",
        isEnabled: false,
        imageSource: null,
        sources: null,
      } as const;
    }
    const frame = FRAME_SEQUENCE[frameIndex];
    return {
      id: "effect1",
      isEnabled: true,
      imageSource: null,
      sources: EFFECT_1_SOURCES[frame],
    } as const;
  }, [frameIndex, isEnabled, isHeartEnabled, isSpeechBubble, preset]);
}
