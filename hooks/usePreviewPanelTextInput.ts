import { appFontFamilyForText } from "@/constants/appFonts";
import { CONTENTS_INPUT_FONT_SIZE } from "@/constants/styles";
import { PRESET_SLOT_COUNT } from "@/contexts/settingsContext";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { PixelRatio, TextLayoutEvent } from "react-native";

const TEXT_MEASURE_OFFSCREEN_LEFT = -100_000;
/** 텍스트 끝 여유*/
const INPUT_WIDTH_CURSOR_PAD = 28;
const INPUT_LINE_WIDTH_PER_CHAR_FACTOR = 0.72;
const INPUT_MAX_LINES = 3;
const INPUT_HEIGHT_FALLBACK = 84;
const INPUT_HEIGHT_BUFFER = 20;
const INPUT_HEIGHT_SAMPLE_GLYPH = "Ag";

/** 예전 입력란에서 쓰이던 줄바꿈 표시 문자(U+21B5)가 저장돼 있으면 제거 한 번 배포 했으면 다음 커밋에선 지워도 됩니다.*/
function stripLegacyInputMarkers(text: string): string {
  return text.replace(/\u21B5/g, "");
}

function clampSelection(
  sel: { start: number; end: number },
  maxLen: number,
): { start: number; end: number } {
  return {
    start: Math.max(0, Math.min(sel.start, maxLen)),
    end: Math.max(0, Math.min(sel.end, maxLen)),
  };
}

export function usePreviewPanelTextInput(params: {
  previewText: string;
  activePreset: number;
  inputScrollViewportW: number;
  windowWidth: number;
  font: string;
  fontWeight: "normal" | "bold";
}) {
  const {
    previewText,
    activePreset,
    inputScrollViewportW,
    windowWidth,
    font,
    fontWeight,
  } = params;

  const [measuredTextMaxW, setMeasuredTextMaxW] = useState(0);
  const [inputFixedHeight, setInputFixedHeight] = useState(INPUT_HEIGHT_FALLBACK);
  const [pendingSelection, setPendingSelection] = useState<
    { start: number; end: number } | undefined
  >(undefined);

  /** 세션 동안만 유지 프리셋마다 커서가 마지막으로 가도록 인덱스 설정정 */
  const selectionByPresetRef = useRef<
    Partial<Record<number, { start: number; end: number }>>
  >({});
  const presetSwitchEpochRef = useRef<number | undefined>(undefined);

  const displayInputText = previewText ? stripLegacyInputMarkers(previewText) : "";

  /**
   * `measuredTextMaxW`은 갱신 전 프레임에도 최장 줄이 minWidth에 갇히지 않도록 하고고
   * 기본적인 폭은 `CONTENTS_INPUT_FONT_SIZE`로 갑니다.
   */
  const longestLineWidth = useMemo(() => {
    if (!displayInputText) return 0;
    let maxChars = 0;
    for (const line of displayInputText.split("\n")) {
      if (line.length > maxChars) maxChars = line.length;
    }
    const scale = PixelRatio.getFontScale();
    const charPx =
      CONTENTS_INPUT_FONT_SIZE *
      scale *
      INPUT_LINE_WIDTH_PER_CHAR_FACTOR;
    return maxChars * charPx;
  }, [displayInputText]);

  const inputHorizontalCanvasWidth = useMemo(() => {
    /** 스크롤 뷰 가로 폭(입력 행에서 실제로 보이는 영역)= */
    const viewportFloor =
      inputScrollViewportW > 0
        ? inputScrollViewportW
        : Math.round(windowWidth * 0.45);
    const measuredWidth = measuredTextMaxW + INPUT_WIDTH_CURSOR_PAD;
    const heuristicWidth = longestLineWidth + INPUT_WIDTH_CURSOR_PAD;
    const contentNeed =
      measuredTextMaxW > 0
        ? measuredWidth
        : Math.max(measuredWidth, heuristicWidth);
    return Math.max(viewportFloor, contentNeed);
  }, [
    inputScrollViewportW,
    measuredTextMaxW,
    windowWidth,
    longestLineWidth,
  ]);

  useLayoutEffect(() => {
    const switched =
      presetSwitchEpochRef.current !== undefined &&
      presetSwitchEpochRef.current !== activePreset;
    presetSwitchEpochRef.current = activePreset;
    if (!switched) return;

    const len = displayInputText.length;
    const saved = selectionByPresetRef.current[activePreset];
    const next =
      saved !== undefined
        ? clampSelection(saved, len)
        : len > 0
          ? { start: len, end: len }
          : { start: 0, end: 0 };
    setPendingSelection(next);
  }, [activePreset, displayInputText]);

  useLayoutEffect(() => {
    if (pendingSelection === undefined) return;
    const id = requestAnimationFrame(() => setPendingSelection(undefined));
    return () => cancelAnimationFrame(id);
  }, [pendingSelection]);

  const handleInputMeasureLayout = (e: TextLayoutEvent) => {
    const maxWidth = e.nativeEvent.lines.reduce(
      (widest, line) => Math.max(widest, line.width),
      0,
    );
    setMeasuredTextMaxW(maxWidth);
  };

  const handleInputHeightMeasureLayout = (e: TextLayoutEvent) => {
    const lines = e.nativeEvent.lines.slice(0, INPUT_MAX_LINES);
    if (lines.length === 0) return;
    const measured = lines.reduce((sum, line) => sum + line.height, 0);
    const nextHeight = Math.ceil(measured + INPUT_HEIGHT_BUFFER);
    if (nextHeight > 0 && nextHeight !== inputFixedHeight) {
      setInputFixedHeight(nextHeight);
    }
  };

  const measureOffscreenStyle = useMemo(
    () => ({
      position: "absolute" as const,
      opacity: 0,
      left: TEXT_MEASURE_OFFSCREEN_LEFT,
      width: -TEXT_MEASURE_OFFSCREEN_LEFT,
      fontFamily: appFontFamilyForText(
        font,
        fontWeight === "bold" ? "bold" : "normal",
      ),
    }),
    [font, fontWeight],
  );

  const onSelectionChange = (e: {
    nativeEvent: { selection: { start: number; end: number } };
  }) => {
    const { start, end } = e.nativeEvent.selection;
    if (activePreset >= 0 && activePreset < PRESET_SLOT_COUNT) {
      selectionByPresetRef.current[activePreset] = { start, end };
    }
  };

  return {
    displayInputText,
    inputHorizontalCanvasWidth,
    inputFixedHeight,
    pendingSelection,
    handleInputMeasureLayout,
    handleInputHeightMeasureLayout,
    measureOffscreenStyle,
    inputHeightSampleLines: Array.from({ length: INPUT_MAX_LINES })
      .map(() => INPUT_HEIGHT_SAMPLE_GLYPH)
      .join("\n"),
    onSelectionChange,
  };
}
