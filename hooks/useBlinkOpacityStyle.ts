import { useEffect } from "react";
import {
    cancelAnimation,
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
} from "react-native-reanimated";

/** blinkSpeed 1 - 10 */
function blinkHalfCycleMs(speed: number) {
  const s = Math.min(10, Math.max(1, speed));
  const slow = 900;
  const fast = 80;
  return Math.round(slow - ((s - 1) / 9) * (slow - fast));
}

export function useBlinkOpacityStyle(active: boolean, blinkSpeed: number) {
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (!active) {
      cancelAnimation(opacity);
      opacity.value = 1;
      return;
    }
    const half = blinkHalfCycleMs(blinkSpeed);
    opacity.value = 1;
    opacity.value = withRepeat(
      withTiming(0, {
        duration: half,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true,
    );
  }, [active, blinkSpeed]);

  return useAnimatedStyle(() => ({ opacity: opacity.value }));
}
