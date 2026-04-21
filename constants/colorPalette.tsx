export function glowColorToSkiaRgba(
  hex: string,
  glowIntensity: number,
): string {
  const raw = hex.replace("#", "").trim();
  const safe = raw.length === 6 ? raw : "FFD700";
  const r = Number.parseInt(safe.slice(0, 2), 16);
  const g = Number.parseInt(safe.slice(2, 4), 16);
  const b = Number.parseInt(safe.slice(4, 6), 16);
  const a = 0.28 + (glowIntensity / 100) * 0.52;
  return `rgba(${r},${g},${b},${a})`;
}

export const textColorPalette = [
    "#FFFFFF",
    "#C4C4C4",
    "#A6A6A6",
    "#FF1B1B",
    "#FFF200",
    "#00D42A",
    "#4759FF",
    "#D4008D",
    "#FF019A",
    "#000000",
    "#5F5F5F",
    "#7C7C7C",
    "#FF6E00",
    "#4DFF47",
    "#0077FF",
    "#7300FF",
    "#C676FF",
    "#970002",
]

export const backgroundColorPalette = [
    "#FFFFFF",
    "#C4C4C4",
    "#A6A6A6",
    "#FF1B1B",
    "#FFF200",
    "#00D42A",
    "#4759FF",
    "#D4008D",
    "#FF019A",
    "#000000",
    "#5F5F5F",
    "#7C7C7C",
    "#FF6E00",
    "#4DFF47",
    "#0077FF",
    "#7300FF",
    "#C676FF",
    "#970002",
]