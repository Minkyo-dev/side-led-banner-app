import { useEffect, useState } from "react";
import {
  Easing,
  cancelAnimation,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import type { SkFont } from "@shopify/react-native-skia";
export interface UseMarqueePixelAnimationParams {
  text: string;
  speed: number;
  playOption: "one" | "multi";
  oneLineJoinMode: "space3" | "concat";
}

type TextLayoutEvent = {
  nativeEvent: { lines: { width: number }[] };
};

/**
 * Skia `Group` / `Text` 마퀴용 `translateX` (Reanimated shared value).
 * UI는 `.tsx` 컴포넌트에서 `useFont` + Skia `Canvas` 등으로 조합하고,
 * `useDerivedValue`로 `translateX.value`를 Skia `transform`에 연결하세요.
 */
export function useMarqueePixelAnimation({
  text,
  speed,
  playOption,
  oneLineJoinMode,
  font,
}: UseMarqueePixelAnimationParams & {font: SkFont | null}) {
  const translateX = useSharedValue(0);
  const [textWidth, setTextWidth] = useState(0);

  const baseText = playOption === "one" ? text.replace(/\n/g, "") : text;
  const displayText =
    oneLineJoinMode === "space3"
      ? playOption === "one"
        ? `${baseText}      `
        : baseText
            .split("\n")
            .map((line) => `${line}      `)
            .join("\n")
      : baseText;
  const spacer = 0;

  useEffect(() => {
    if (speed === 0 || textWidth === 0) {
      cancelAnimation(translateX);
      translateX.value = 0;
      return;
    }

    const totalShift = textWidth + spacer;
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
  }, [speed, text, playOption, oneLineJoinMode, textWidth, spacer]);

  useEffect(() => {
    if (font && displayText) {
      setTextWidth(font.measureText(displayText).width);
    } else {
      setTextWidth(0);
    }
  }, [font, displayText]);

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
    onTextLayout,
    SPACER: spacer,
    textWidth,
  };
}
