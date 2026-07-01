export type OneLineJoinMode = "space6" | "lineClear";

/** 저장된 preset·구버전 값 호환 */
export function normalizeOneLineJoinMode(
  mode: string | undefined,
): OneLineJoinMode {
  if (mode === "space3" || mode === "space6") return "space6";
  if (mode === "concat" || mode === "lineClear") return "lineClear";
  return "space6";
}

export function buildMarqueeDisplayText(params: {
  text: string;
  playOption: "one" | "multi";
  oneLineJoinMode: OneLineJoinMode;
}): string {
  const { text, playOption, oneLineJoinMode } = params;
  const baseText = playOption === "one" ? text.replace(/\n/g, " ") : text;

  if (oneLineJoinMode === "lineClear") {
    return baseText;
  }

  const gap = " ".repeat(3);
  if (playOption === "one") {
    return `${baseText}${gap}`;
  }
  return baseText
  .split("\n")
  .map((line) => `${line}${gap}`)
  .join("\n");
}

/** Style B: 한 줄이 화면에서 완전히 빠진 뒤 다음이 나오도록 뷰포트 너비만큼 여백 */
export function resolveMarqueeJoinSpacerPx(params: {
  oneLineJoinMode: OneLineJoinMode;
  viewportWidthPx: number;
}): number {
  if (params.oneLineJoinMode !== "lineClear") return 0;
  return Math.max(0, params.viewportWidthPx);
}
