import { SPEECH_BUBBLE_PRESETS } from "@/constants/speechBubblePresets";
import {
  getSizingPolicy,
  resolveFullscreenMaxHeight,
  resolveSpeechBoxPx,
  resolveSpeechTextTopOffset,
} from "@/utils/textSizing";
import { Platform } from "react-native";
import { useMemo } from "react";
import type { ViewStyle } from "react-native";

type SpeechBubbleId = NonNullable<
  ReturnType<typeof getSizingPolicy>["speechBubbleId"]
>;

export type SpeechBubbleInput = {
  speechBubbleId: SpeechBubbleId | null;
  effectId: string;
  isPortrait: boolean;
  basisWidthPx: number;
  viewportHeight: number;
};

/** 말풍선 배경일 때 텍스트 박스 크기·위치·캔버스 fallback */
export function useSpeechBubble(input: SpeechBubbleInput) {
  const isActive = input.speechBubbleId != null;

  const speechPresetPlatform = isActive
    ? Platform.OS === "ios"
      ? SPEECH_BUBBLE_PRESETS[input.speechBubbleId!].ios
      : SPEECH_BUBBLE_PRESETS[input.speechBubbleId!].android
    : null;

  const speechTextBoxConfig = isActive
    ? input.isPortrait
      ? speechPresetPlatform!.fullscreenTextBox.portrait
      : speechPresetPlatform!.fullscreenTextBox.landscape
    : null;

  const maxTextHeight = useMemo(() => {
    if (input.viewportHeight <= 0) return 0;
    return resolveFullscreenMaxHeight({
      effectId: input.effectId,
      isPortrait: input.isPortrait,
      viewportHeight: input.viewportHeight,
    });
  }, [input.effectId, input.isPortrait, input.viewportHeight]);

  const speechBoxPx = useMemo(() => {
    if (
      !speechTextBoxConfig ||
      input.basisWidthPx <= 0 ||
      maxTextHeight <= 0
    ) {
      return null;
    }
    return resolveSpeechBoxPx({
      boxWidth: speechTextBoxConfig.width,
      basisWidthPx: input.basisWidthPx,
      maxHeightPx: maxTextHeight,
    });
  }, [speechTextBoxConfig, input.basisWidthPx, maxTextHeight]);

  const speechTextTop = useMemo(() => {
    if (!isActive || input.viewportHeight <= 0) return null;
    return resolveSpeechTextTopOffset({
      effectId: input.effectId,
      isPortrait: input.isPortrait,
      viewportHeight: input.viewportHeight,
    });
  }, [isActive, input.effectId, input.isPortrait, input.viewportHeight]);

  const textContainerStyle: ViewStyle | null = useMemo(() => {
    if (!isActive || !speechBoxPx || !speechTextBoxConfig) return null;
    return {
      position: "absolute",
      width: speechBoxPx.widthPx,
      height: speechBoxPx.heightPx,
      ...(speechTextTop != null
        ? { top: speechTextTop }
        : {
            transform: [{ translateY: speechTextBoxConfig.yOffset }],
          }),
    };
  }, [isActive, speechBoxPx, speechTextBoxConfig, speechTextTop]);

  return {
    isActive,
    speechTextBoxConfig,
    speechBoxPx,
    maxTextHeight,
    speechTextTop,
    textContainerStyle,
  };
}

export function resolveSpeechCanvasFallback(
  speechBoxPx: { widthPx: number; heightPx: number } | null,
  fallback: { width: number; height: number },
) {
  if (speechBoxPx) {
    return { width: speechBoxPx.widthPx, height: speechBoxPx.heightPx };
  }
  return fallback;
}
