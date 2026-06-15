import type { SkFont, SkTextBlob } from "@shopify/react-native-skia";
import { Skia } from "@shopify/react-native-skia";

export type MarqueeGlyphPos = { x: number; y: number; text: string };

/**
 * `layoutSkiaLine` + 다중 줄 y 배치 결과를 한 `SkTextBlob`으로 묶는용도도.
 * 자간은 이미 `x`에 반영되야 합니다.
 */
export function buildMarqueeTextBlob(
  font: SkFont,
  positions: MarqueeGlyphPos[],
): SkTextBlob | null {
  if (positions.length === 0) return null;
  const glyphs: number[] = [];
  const rsxforms: ReturnType<typeof Skia.RSXform>[] = [];
  for (const g of positions) {
    if (g.text.length === 0) continue;
    const ids = font.getGlyphIDs(g.text, g.text.length);
    if (ids.length === 0 || ids[0] === 0) continue;
    glyphs.push(ids[0]!);
    rsxforms.push(Skia.RSXform(1, 0, g.x, g.y));
  }
  if (glyphs.length === 0) return null;
  return Skia.TextBlob.MakeFromRSXformGlyphs(glyphs, rsxforms, font);
}

/** 글자마다 다른 SkFont — ja Pixel(가나 8-bit + 한자 Dotted Songti) 등 */
export function buildMarqueeTextBlobs(
  positions: MarqueeGlyphPos[],
  pickFont: (ch: string) => SkFont,
): SkTextBlob[] {
  if (positions.length === 0) return [];

  const byFont = new Map<SkFont, MarqueeGlyphPos[]>();
  for (const g of positions) {
    const ch = g.text;
    if (!ch) continue;
    const font = pickFont(ch);
    const bucket = byFont.get(font);
    if (bucket) {
      bucket.push(g);
    } else {
      byFont.set(font, [g]);
    }
  }

  const blobs: SkTextBlob[] = [];
  for (const [font, glyphs] of byFont) {
    const blob = buildMarqueeTextBlob(font, glyphs);
    if (blob) blobs.push(blob);
  }
  return blobs;
}
