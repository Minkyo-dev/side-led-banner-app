import { resolveAppearanceFontFaceSet } from "@/constants/appFonts";
import type { SkFont } from "@shopify/react-native-skia";
import { useFont } from "@shopify/react-native-skia";
import { useMemo } from "react";

function normalizeWeight(w: string | number): "normal" | "bold" {
  if (w === "bold" || w === "700") return "bold";
  return "normal";
}

/**
 * `appearance.font`(textSection)에 맞는 regular·bold TTF 쌍을 동시에 로드하고,
 * `fontWeight`에 해당하는 `SkFont`만 반환합니다.
 */
export function useSkiaAppearanceFont(
  appearanceFont: string,
  fontWeight: string | number,
  size: number,
): SkFont | null {
  const { regular: regularSrc, bold: boldSrc } = useMemo(
    () => resolveAppearanceFontFaceSet(appearanceFont),
    [appearanceFont],
  );

  const regularFont = useFont(regularSrc, size);
  const boldFont = useFont(boldSrc, size);

  return normalizeWeight(fontWeight) === "bold" ? boldFont : regularFont;
}
