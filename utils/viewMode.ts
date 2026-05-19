/** Style A: 줄(또는 전체 텍스트) 끝에 넣는 공백 칸 수 (3칸은 구분이 약해 6칸) */
export const VIEW_MODE_LINE_GAP_SPACES = 6;

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
  const baseText = playOption === "one" ? text.replace(/\n/g, "") : text;

  if (oneLineJoinMode === "lineClear") {
    return baseText;
  }

  const gap = " ".repeat(VIEW_MODE_LINE_GAP_SPACES);
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
