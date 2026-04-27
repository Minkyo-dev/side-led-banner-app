import {
  SPEECH_BUBBLE_PRESETS,
  isSpeechBubblePreset,
} from "@/constants/speechBubblePresets";
import type { BackgroundEffectAnimationResult } from "@/hooks/useBackgroundEffectAnimation";
import { Image } from "expo-image";
import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import type { SharedValue } from "react-native-reanimated";
import { HeartBackgroundTicker } from "./HeartBackgroundTicker";

type BackgroundEffectLayerMode = "preview" | "fullscreen";

interface BackgroundEffectLayerProps {
  effect: BackgroundEffectAnimationResult;
  translateX: SharedValue<number>;
  isPortrait: boolean;
  mode: BackgroundEffectLayerMode;
}

const HEART_BG_B_SOURCE = require("@/assets/images/Heart BG_B.png");

// Preview/Fullscreen 공통 배경 이펙트 레이어 렌더링용 (응원봉의 edgestyle을 참고고)
export function BackgroundEffectLayer({
  effect,
  translateX,
  isPortrait,
  mode,
}: BackgroundEffectLayerProps) {
  const isFullscreenPortrait = mode === "fullscreen" && isPortrait;
  const effect1EdgeStyle = isFullscreenPortrait
    ? {
        top: "37.5%" as const,
        bottom: "37.5%" as const,
        width: "50%" as const,
        height: "25%" as const,
      }
    : {
        top: 0 as const,
        bottom: 0 as const,
        width: "50%" as const,
        height: "100%" as const,
      };

  if (effect.id === "effect1" && effect.sources) {
    return (
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <Image
          source={effect.sources.left}
          style={{ position: "absolute", left: 0, ...effect1EdgeStyle }}
          contentFit="fill"
        />
        <Image
          source={effect.sources.right}
          style={{ position: "absolute", right: 0, ...effect1EdgeStyle }}
          contentFit="fill"
        />
      </View>
    );
  }

  if (effect.id === "heartBgA" && effect.imageSource) {
    const heartSource = isFullscreenPortrait
      ? HEART_BG_B_SOURCE
      : effect.imageSource;
    return <HeartBackgroundTicker source={heartSource} translateX={translateX} />;
  }

  if (isSpeechBubblePreset(effect.id)) {
    const preset = SPEECH_BUBBLE_PRESETS[effect.id];
    const platformPreset = Platform.OS === "ios" ? preset.ios : preset.android;
    const source =
      mode === "preview"
        ? preset.previewSource
        : isPortrait
          ? preset.fullscreenPortraitSource
          : preset.fullscreenLandscapeSource;
    const previewInset = (platformPreset.previewHeightBoostPx ?? 0) / 2;
    const imageStyle =
      mode === "preview" && previewInset > 0
        ? {
            ...StyleSheet.absoluteFillObject,
            top: -previewInset,
            bottom: -previewInset,
          }
        : StyleSheet.absoluteFill;
    return (
      <Image
        source={source}
        style={imageStyle}
        contentFit="fill"
      />
    );
  }

  return null;
}
