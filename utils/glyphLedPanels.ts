import type { MarqueeGlyphPos } from "@/utils/buildMarqueeTextBlob";
import type { SkFont } from "@shopify/react-native-skia";

export type GlyphLedPanelRect = {
  left: number;
  top: number;
  width: number;
  height: number;
};

/** 글자 1자당 LED 패널 사각형 (격자에 스냅) */
export function computeGlyphLedPanels(
  font: SkFont,
  glyphs: MarqueeGlyphPos[],
  dotSize: number,
  padCells = 1,
): GlyphLedPanelRect[] {
  const cell = Math.max(1, dotSize);
  const pad = Math.max(0, padCells) * cell;
  const m = font.getMetrics();
  const glyphTop = m.ascent;
  const glyphHeight = m.descent - m.ascent;
  const panels: GlyphLedPanelRect[] = [];

  for (const g of glyphs) {
    if (!g.text || /^\s$/u.test(g.text)) continue;
    const w = font.measureText(g.text).width;
    if (w <= 0) continue;

    let left = g.x - pad;
    let top = g.y + glyphTop - pad;
    let width = w + pad * 2;
    let height = glyphHeight + pad * 2;

    left = Math.floor(left / cell) * cell;
    top = Math.floor(top / cell) * cell;
    const right = Math.ceil((left + width) / cell) * cell;
    const bottom = Math.ceil((top + height) / cell) * cell;
    width = Math.max(cell, right - left);
    height = Math.max(cell, bottom - top);

    panels.push({ left, top, width, height });
  }

  return panels;
}
