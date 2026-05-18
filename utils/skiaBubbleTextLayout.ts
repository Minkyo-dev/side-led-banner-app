import type { SkFont } from "@shopify/react-native-skia";

export const BUBBLE_SAFE = {
  widthRatio: 0.88,
  heightRatio: 0.72,
} as const;

export const BUBBLE_MAX_ROWS = 3;

export type BubbleGlyph = { x: number; y: number; text: string };

export type BubbleRowLayout = {
  text: string;
  width: number;
  glyphs: { x: number; text: string }[];
};

export type BubbleLayoutOpts = {
  frameWidth: number;
  frameHeight: number;
  safeWRatio?: number;
  safeHRatio?: number;
  maxRows?: number;
  lineGapPx?: number;
};

export type BubbleCanvasOpts = Omit<BubbleLayoutOpts, "frameWidth" | "frameHeight">;

export function splitEnterRows(text: string): string[] {
  return text.replace(/\r\n?/g, "\n").split("\n");
}

export function countRows(
  text: string,
  playOption: "one" | "multi" = "multi",
  maxRows = BUBBLE_MAX_ROWS,
): number {
  if (playOption === "one") return 1;
  const rows = splitEnterRows(text);
  if (rows.length === 0) return 1;
  return Math.min(maxRows, rows.length);
}

export function bubbleRows(params: {
  text: string;
  maxRows?: number;
  playOption?: "one" | "multi";
}): string[] {
  const { text, maxRows = BUBBLE_MAX_ROWS, playOption = "multi" } = params;
  const manual = splitEnterRows(text);
  if (playOption === "one") {
    const one = manual.join(" ").trim();
    return one.length > 0 ? [one] : [];
  }
  return manual.slice(0, maxRows);
}

function rowGlyphs(
  font: SkFont,
  text: string,
  letterSpacing: number,
): BubbleRowLayout {
  if (text.length === 0) return { text: "", width: 0, glyphs: [] };
  let x = 0;
  const glyphs: { x: number; text: string }[] = [];
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]!;
    glyphs.push({ x, text: ch });
    x +=
      font.measureText(ch).width + (i < text.length - 1 ? letterSpacing : 0);
  }
  return { text, width: x, glyphs };
}

export function bubbleLayouts(
  font: SkFont,
  rows: string[],
  letterSpacing: number,
): BubbleRowLayout[] {
  return rows.map((row) => rowGlyphs(font, row, letterSpacing));
}

export function bubbleGlyphs(params: {
  font: SkFont;
  rows: Pick<BubbleRowLayout, "width" | "glyphs">[];
  frameWidth: number;
  frameHeight: number;
  safeWRatio?: number;
  safeHRatio?: number;
  lineGapPx?: number;
}): BubbleGlyph[] {
  const {
    font,
    rows,
    frameWidth,
    frameHeight,
    safeWRatio = BUBBLE_SAFE.widthRatio,
    lineGapPx = 0,
  } = params;

  const n = rows.length;
  if (n === 0 || frameWidth <= 0 || frameHeight <= 0) return [];

  const metrics = font.getMetrics();
  const rowH = metrics.descent - metrics.ascent;
  const gap = Math.max(0, lineGapPx);
  const blockH = rowH * n + gap * Math.max(0, n - 1);

  const safeW = frameWidth * safeWRatio;
  const safeLeft = (frameWidth - safeW) / 2;
  const blockTop = Math.max(
    0,
    Math.min((frameHeight - blockH) / 2, frameHeight - blockH),
  );
  const baseY = blockTop - metrics.ascent;
  const rowStep = rowH + gap;

  const out: BubbleGlyph[] = [];
  for (let i = 0; i < n; i++) {
    const row = rows[i]!;
    const y = baseY + i * rowStep;
    const x0 = safeLeft + (safeW - row.width) / 2;
    for (const g of row.glyphs) {
      out.push({ x: x0 + g.x, y, text: g.text });
    }
  }
  return out;
}

export function layoutBubbleText(params: {
  font: SkFont;
  text: string;
  letterSpacing: number;
  playOption?: "one" | "multi";
  opts: BubbleLayoutOpts;
}) {
  const { font, text, letterSpacing, playOption = "multi", opts } = params;
  const {
    frameWidth,
    frameHeight,
    safeWRatio = BUBBLE_SAFE.widthRatio,
    safeHRatio = BUBBLE_SAFE.heightRatio,
    maxRows = BUBBLE_MAX_ROWS,
    lineGapPx,
  } = opts;

  const rows = bubbleRows({ text, maxRows, playOption });
  const layouts = bubbleLayouts(font, rows, letterSpacing);
  const glyphs = bubbleGlyphs({
    font,
    rows: layouts,
    frameWidth,
    frameHeight,
    safeWRatio,
    safeHRatio: safeHRatio,
    lineGapPx,
  });
  return { rows, layouts, glyphs };
}
