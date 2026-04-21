import { useMemo } from "react";
import { TextStyle } from "react-native";

/** Text shadow tint for blur effect; must not trigger state updates (used during render). */
function mixBlurShadowColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = num >> 16;
  const g = (num >> 8) & 0x00ff;
  const b = num & 0x0000ff;
  const newR = Math.round(r + (255 - r) * amount);
  const newG = Math.round(g + (255 - g) * amount);
  const newB = Math.round(b + (255 - b) * amount);
  return `rgb(${newR}, ${newG}, ${newB})`;
}

export interface UsePreviewPanelNativeParams {
  fontWeight: TextStyle["fontWeight"];
  blurIntensity: number;
  textSelectedColor: string;
}

/**
 * PreviewPanel의 기존  Animated.View 의 Text의의 marquee style.
 */
export function usePreviewPanelNative({
  fontWeight,
  blurIntensity,
  textSelectedColor,
}: UsePreviewPanelNativeParams) {
  const previewTextSegmentStyle = useMemo<TextStyle>(
    () => ({
      fontWeight,
      ...(blurIntensity > 0
        ? {
            textShadowColor: mixBlurShadowColor(textSelectedColor, 0.1),
            textShadowRadius: blurIntensity,
          }
        : {}),
    }),
    [blurIntensity, fontWeight, textSelectedColor],
  );

  return { previewTextSegmentStyle };
}
