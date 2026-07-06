import { resolveFontFaceSet } from "@/constants/appFonts";
import { useCachedSkiaFont } from "@/hooks/useCachedSkiaFont";
import type { SkFont } from "@shopify/react-native-skia";
import { useMemo } from "react";

function normalizeWeight(w: string | number): "normal" | "bold" {
  if (w === "bold" || w === "700") return "bold";
  return "normal";
}

/**
 * `appearance.font`(textSection)에 맞는 SkFont.
 * 단일 웨이트 폰트는 에셋을 한 번만 로드합니다.
 */
export function useSkiaAppearanceFont(
  appearanceFont: string,
  fontWeight: string | number,
  size: number,
): SkFont | null {
  const { regular: regularSrc, bold: boldSrc } = useMemo(
    () => resolveFontFaceSet(appearanceFont),
    [appearanceFont],
  );

  const src =
    normalizeWeight(fontWeight) === "bold" && boldSrc !== regularSrc
      ? boldSrc
      : regularSrc;

  return useCachedSkiaFont(src, size);
}
