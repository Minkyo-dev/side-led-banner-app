import {
  backgroundColorPalette,
  textColorPalette,
} from "@/constants/colorPalette";
import type { MarqueeGlyphPos } from "@/utils/buildMarqueeTextBlob";

type Rgb = { r: number; g: number; b: number };

const MIX_COLOR_FALLBACK = "#FF6E00";
const MIX_DISTANCE_MIN = 96;
const MIX_CONTRAST_MIN = 1.6;

const MIX_PALETTE = Array.from(
  new Set([...textColorPalette, ...backgroundColorPalette].map(normalizeHex)),
);

function normalizeHex(hex: string): string {
  const raw = hex.replace("#", "").trim().toUpperCase();
  return raw.length === 6 ? `#${raw}` : "#000000";
}

function hexToRgb(hex: string): Rgb {
  const safe = normalizeHex(hex);
  return {
    r: Number.parseInt(safe.slice(1, 3), 16),
    g: Number.parseInt(safe.slice(3, 5), 16),
    b: Number.parseInt(safe.slice(5, 7), 16),
  };
}

function srgbToLinear(channel: number): number {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function relativeLuminance(rgb: Rgb): number {
  return (
    0.2126 * srgbToLinear(rgb.r) +
    0.7152 * srgbToLinear(rgb.g) +
    0.0722 * srgbToLinear(rgb.b)
  );
}

function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(hexToRgb(a));
  const lb = relativeLuminance(hexToRgb(b));
  const lighter = Math.max(la, lb);
  const darker = Math.min(la, lb);
  return (lighter + 0.05) / (darker + 0.05);
}

function colorDistance(a: string, b: string): number {
  const aa = hexToRgb(a);
  const bb = hexToRgb(b);
  return Math.hypot(aa.r - bb.r, aa.g - bb.g, aa.b - bb.b);
}

function hashString(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pickMixPalette(backgroundColor: string): string[] {
  const bg = normalizeHex(backgroundColor);
  const filtered = MIX_PALETTE.filter(
    (color) =>
      color !== bg &&
      colorDistance(color, bg) >= MIX_DISTANCE_MIN &&
      contrastRatio(color, bg) >= MIX_CONTRAST_MIN,
  );

  if (filtered.length >= 3) {
    return filtered;
  }

  const withoutBg = MIX_PALETTE.filter((color) => color !== bg);
  return withoutBg.length > 0 ? withoutBg : [MIX_COLOR_FALLBACK];
}

export function assignGlyphMixColors(
  glyphs: MarqueeGlyphPos[],
  input: { backgroundColor: string },
): string[] {
  const palette = pickMixPalette(input.backgroundColor);
  const colors: string[] = [];

  for (let i = 0; i < glyphs.length; i++) {
    const glyph = glyphs[i]!;
    let color =
      palette[
        hashString(
          `${normalizeHex(input.backgroundColor)}:${glyph.text}:${i}:${Math.round(glyph.x)}:${Math.round(glyph.y)}`,
        ) % palette.length
      ] ?? MIX_COLOR_FALLBACK;

    const prevGlyph = glyphs[i - 1];
    const prevColor = colors[i - 1];
    if (
      prevGlyph &&
      prevColor &&
      !/^\s$/u.test(glyph.text) &&
      !/^\s$/u.test(prevGlyph.text) &&
      color === prevColor
    ) {
      const nextIndex = (palette.indexOf(color) + 1) % palette.length;
      color = palette[nextIndex] ?? color;
    }

    colors.push(color);
  }

  return colors;
}
