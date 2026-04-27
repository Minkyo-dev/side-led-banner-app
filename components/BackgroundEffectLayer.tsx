import { HeartBackgroundTicker } from "@/components/HeartBackgroundTicker";
import type { BackgroundEffectAnimationResult } from "@/hooks/useBackgroundEffectAnimation";
import { Image } from "expo-image";
import React from "react";
import { StyleSheet, View } from "react-native";
import type { SharedValue } from "react-native-reanimated";

type BackgroundEffectLayerMode = "preview" | "fullscreen";

interface BackgroundEffectLayerProps {
  effect: BackgroundEffectAnimationResult;
  translateX: SharedValue<number>;
  isPortrait: boolean;
  mode: BackgroundEffectLayerMode;
}

const HEART_BG_B_SOURCE = require("@/assets/images/Heart BG_B.png");

// Preview/Fullscreen 공통 배경 이펙트 레이어 렌더링용
export function BackgroundEffectLayer({
  effect,
  translateX,
  isPortrait,
  mode,
}: BackgroundEffectLayerProps) {
  const isFullscreenPortrait = mode === "fullscreen" && isPortrait;
  const effect1EdgeStyle = isFullscreenPortrait
    ? {
        top: "25%" as const,
        bottom: "25%" as const,
        width: "50%" as const,
        height: "50%" as const,
      }
    : {
        top: 0 as const,
        bottom: 0 as const,
        width: "50%" as const,
        height: "100%" as const,
      };

  if (effect.kind === "effect1" && effect.sources) {
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

  if (effect.kind === "heartBgA" && effect.imageSource) {
    const heartSource = isFullscreenPortrait
      ? HEART_BG_B_SOURCE
      : effect.imageSource;
    return <HeartBackgroundTicker source={heartSource} translateX={translateX} />;
  }

  if (effect.kind === "speechBg1") {
    return (
      <Image
        source={
          isPortrait
            ? require("@/assets/images/Speech BG_1_B.png")
            : require("@/assets/images/Speech BG_1_A.png")
        }
        style={StyleSheet.absoluteFill}
        contentFit="fill"
      />
    );
  }

  if (effect.kind === "speechBg2") {
    return (
      <Image
        source={
          isPortrait
            ? require("@/assets/images/Speech BG_2_B.png")
            : require("@/assets/images/Speech BG_2_A.png")
        }
        style={StyleSheet.absoluteFill}
        contentFit="fill"
      />
    );
  }

  return null;
}
