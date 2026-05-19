import {
  buildMarqueeDisplayText,
  normalizeOneLineJoinMode,
  resolveMarqueeJoinSpacerPx,
  type OneLineJoinMode,
} from "@/utils/viewMode";
import { useEffect, useState } from "react";
import {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

export interface UseMarqueeAnimationParams {
  text: string;
  speed: number;
  playOption: "one" | "multi";
  oneLineJoinMode: OneLineJoinMode | "space3" | "concat";
  /** Style B(lineClear)*/
  viewportWidthPx?: number;
  /** 타일 끝 여유(글로우·stroke)*/
  effectBleedPx?: number;
}

export type { OneLineJoinMode } from "@/utils/viewMode";

type ContainerLayoutEvent = {
  nativeEvent: { layout: { width: number } };
};

type TextLayoutEvent = {
  nativeEvent: { lines: { width: number }[] };
};

/**
 * RN `Animated.View` 마퀴용 `translateX` + `animatedStyle`.(Animated.View 재사용할 시)
 * Skia 전용 오프셋은 `useMarqueePixelAnimation` 등에서 `translateX`만 공유하는 게 좋을 거 같습니다.
 */
export function useMarqueeAnimation({
  text,
  speed,
  playOption,
  oneLineJoinMode: oneLineJoinModeRaw,
  viewportWidthPx = 0,
  effectBleedPx = 0,
}: UseMarqueeAnimationParams) {
  const translateX = useSharedValue(0);
  const [textWidth, setTextWidth] = useState(0);
  const oneLineJoinMode = normalizeOneLineJoinMode(oneLineJoinModeRaw);

  const displayText = buildMarqueeDisplayText({
    text,
    playOption,
    oneLineJoinMode,
  });
  const spacer = resolveMarqueeJoinSpacerPx({
    oneLineJoinMode,
    viewportWidthPx,
  });

  useEffect(() => {
    if (speed === 0 || textWidth === 0) {
      cancelAnimation(translateX);
      translateX.value = 0;
      return;
    }

    const totalShift = textWidth + spacer + effectBleedPx;
    const duration = (totalShift / (speed * 2)) * 1000;

    translateX.value = 0;
    translateX.value = withRepeat(
      withTiming(-totalShift, {
        duration,
        easing: Easing.linear,
      }),
      -1,
      false,
    );
  }, [
    speed,
    text,
    playOption,
    oneLineJoinMode,
    textWidth,
    spacer,
    effectBleedPx,
  ]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const onContainerLayout = (_e: ContainerLayoutEvent) => {
    /*containerWidth관련 logic */
  };

  const onTextLayout = (e: TextLayoutEvent) => {
    const widths = e.nativeEvent.lines.map((l) => l.width);
    const maxLineWidth = widths.length > 0 ? Math.max(...widths) : 0;
    if (maxLineWidth !== textWidth) {
      setTextWidth(maxLineWidth);
    }
  };

  return {
    displayText,
    translateX,
    animatedStyle,
    onContainerLayout,
    onTextLayout,
    SPACER: spacer,
  };
}
