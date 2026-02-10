import { useEffect } from "react";
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

const SPACER = 80;

interface UseMarqueeAnimationParams {
  text: string;
  speed: number;
  playOption: "one" | "multi";
}

export function useMarqueeAnimation({
  text,
  speed,
  playOption,
}: UseMarqueeAnimationParams) {
  const translateX = useSharedValue(0);
  const textWidth = useSharedValue(0);
  const containerWidth = useSharedValue(0);

  const displayText =
    playOption === "one" ? text.replace(/\n/g, "   ") : text;

  useEffect(() => {
    if (speed === 0 || textWidth.value === 0) {
      cancelAnimation(translateX);
      translateX.value = 0;
      return;
    }

    const totalShift = textWidth.value + SPACER;
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
  }, [speed, text, playOption]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const onContainerLayout = (e: { nativeEvent: { layout: { width: number } } }) => {
    containerWidth.value = e.nativeEvent.layout.width;
  };

  const onTextLayout = (e: { nativeEvent: { lines: { width: number }[] } }) => {
    const maxLineWidth = Math.max(
      ...e.nativeEvent.lines.map((l) => l.width),
    );
    if (maxLineWidth !== textWidth.value) {
      textWidth.value = maxLineWidth;
    }
  };

  return {
    displayText,
    animatedStyle,
    onContainerLayout,
    onTextLayout,
    SPACER,
  };
}
