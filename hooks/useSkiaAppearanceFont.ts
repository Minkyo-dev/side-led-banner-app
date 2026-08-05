import { resolveFontFaceSet } from "@/constants/appFonts";
import { useCachedSkiaFont, useResolvedFontAssetRef } from "@/hooks/useCachedSkiaFont";
import type { SkFont } from "@shopify/react-native-skia";
import { useMemo } from "react";

export function useSkiaAppearanceFont(
  appearanceFont: string,
  fontWeight: string | number,
  size: number,
): SkFont | null {
  const { regular: regularSrc, bold: boldSrc } = useMemo(
    () => resolveFontFaceSet(appearanceFont),
    [appearanceFont],
  );

  const isBold = fontWeight === "bold" || fontWeight === "700";
  const src = isBold && boldSrc !== regularSrc ? boldSrc : regularSrc;
  const resolvedSrc = useResolvedFontAssetRef(src);

  return useCachedSkiaFont(resolvedSrc, size);
}
