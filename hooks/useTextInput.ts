import { appFontFamilyForText } from "@/constants/appFonts";
import type { AppLocaleKey } from "@/constants/language";
import {
    CONTENTS_INPUT_FONT_SIZE,
    CONTENTS_INPUT_LINE_HEIGHT,
    CONTENTS_INPUT_VIEWPORT_HEIGHT,
} from "@/constants/styles";
import {
    PRESET_SLOT_COUNT,
    PREVIEW_TEXT_MAX_LINES,
} from "@/contexts/settingsContext";
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Platform, ScrollView, TextLayoutEvent } from "react-native";

type WrappedLayoutLine = TextLayoutEvent["nativeEvent"]["lines"][number];

const TEXT_MEASURE_OFFSCREEN_LEFT = -100_000;
/** 텍스트 끝 여유*/
const INPUT_WIDTH_CURSOR_PAD = 28;
const INPUT_LINE_WIDTH_PER_CHAR_FACTOR = 0.72;
/** 커서가 스크롤 뷰포트 안에 남도록 하는 여백 */
const CURSOR_SCROLL_MARGIN = 28;

function snapInputViewportHeightPx(
  measuredTotalPx: number,
  logicalLines: number,
  fallbackPx: number,
): number {
  const perLine = Math.max(
    CONTENTS_INPUT_LINE_HEIGHT,
    Math.ceil(measuredTotalPx / logicalLines),
  );
  return Math.max(fallbackPx, perLine * logicalLines);
}

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

function lineAtSelection(
  text: string,
  selectionStart: number,
  lines: WrappedLayoutLine[],
): WrappedLayoutLine | undefined {
  if (!lines.length) return undefined;

  let textIndex = 0;
  for (const line of lines) {
    const lineText = line.text;
    const lineEnd = textIndex + lineText.length;

    if (selectionStart <= lineEnd) {
      return line;
    }

    textIndex = lineEnd;
    if (text[textIndex] === "\n") {
      textIndex += 1;
    }
  }

  return lines[lines.length - 1];
}

function cursorXFromSelection(
  text: string,
  selectionStart: number,
  lines: WrappedLayoutLine[],
): number {
  if (!lines.length) {
    const charPx = CONTENTS_INPUT_FONT_SIZE * INPUT_LINE_WIDTH_PER_CHAR_FACTOR;
    return selectionStart * charPx;
  }

  const line = lineAtSelection(text, selectionStart, lines);
  if (!line) {
    const charPx = CONTENTS_INPUT_FONT_SIZE * INPUT_LINE_WIDTH_PER_CHAR_FACTOR;
    return selectionStart * charPx;
  }

  let textIndex = 0;
  for (const candidate of lines) {
    const lineText = candidate.text;
    const lineEnd = textIndex + lineText.length;

    if (selectionStart <= lineEnd) {
      const offsetInLine = Math.max(0, selectionStart - textIndex);
      const ratio =
        lineText.length > 0 ? offsetInLine / lineText.length : 0;
      return candidate.x + candidate.width * ratio;
    }

    textIndex = lineEnd;
    if (text[textIndex] === "\n") {
      textIndex += 1;
    }
  }

  return line.x + line.width;
}

export function useTextInput(params: {
  previewText: string;
  activePreset: number;
  inputScrollViewportW: number;
  windowWidth: number;
  font: string;
  fontWeight: "normal" | "bold";
  appLocale: AppLocaleKey;
}) {
  const {
    previewText,
    activePreset,
    inputScrollViewportW,
    windowWidth,
    font,
    fontWeight,
    appLocale,
  } = params;

  /** 입력 박스 높이는 one / multi 모두 멀티 최대 줄 수와 동일 */
  const inputViewportLogicalLines = PREVIEW_TEXT_MAX_LINES;
  const inputViewportFallbackPx = CONTENTS_INPUT_VIEWPORT_HEIGHT;

  const fontLineProbeText = useMemo(
    () =>
      Array.from({ length: inputViewportLogicalLines }, () => "Mg").join("\n"),
    [inputViewportLogicalLines],
  );

  const [inputViewportHeightPx, setInputViewportHeightPx] = useState(
    inputViewportFallbackPx,
  );
  const inputViewportHeightRef = useRef(inputViewportFallbackPx);
  const fontProbeCommittedKeyRef = useRef<string | null>(null);
  const [measuredTextMaxW, setMeasuredTextMaxW] = useState(0);
  const [pendingSelection, setPendingSelection] = useState<
    { start: number; end: number } | undefined
  >(undefined);

  const inputScrollRef = useRef<ScrollView>(null);
  const inputScrollXRef = useRef(0);
  const wrappedLayoutLinesRef = useRef<WrappedLayoutLine[]>([]);

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
    const charPx = CONTENTS_INPUT_FONT_SIZE * INPUT_LINE_WIDTH_PER_CHAR_FACTOR;
    return maxChars * charPx;
  }, [displayInputText]);

  const inputScrollViewportWResolved = useMemo(
    () =>
      inputScrollViewportW > 0
        ? inputScrollViewportW
        : Math.round(windowWidth * 0.45),
    [inputScrollViewportW, windowWidth],
  );

  /** 뷰포트 최소 폭을 제외한 실제 텍스트 필요 폭 */
  const inputContentWidth = useMemo(() => {
    const measuredWidth = measuredTextMaxW + INPUT_WIDTH_CURSOR_PAD;
    const heuristicWidth = longestLineWidth + INPUT_WIDTH_CURSOR_PAD;
    return measuredTextMaxW > 0
      ? measuredWidth
      : Math.max(measuredWidth, heuristicWidth);
  }, [measuredTextMaxW, longestLineWidth]);

  const inputHorizontalCanvasWidth = useMemo(
    () => Math.max(inputScrollViewportWResolved, inputContentWidth),
    [inputScrollViewportWResolved, inputContentWidth],
  );

  /** 전체 콘텐츠가 뷰포트 안에 들어오면 가로 스크롤 비활성 */
  const needsHorizontalScroll = useMemo(
    () =>
      inputScrollViewportWResolved > 0 &&
      inputContentWidth > inputScrollViewportWResolved,
    [inputContentWidth, inputScrollViewportWResolved],
  );

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

  const fontMeasureKey = `${font}|${fontWeight}`;

  useLayoutEffect(() => {
    fontProbeCommittedKeyRef.current = null;
    inputViewportHeightRef.current = inputViewportFallbackPx;
    setInputViewportHeightPx(inputViewportFallbackPx);
  }, [fontMeasureKey, inputViewportFallbackPx]);

  const handleFontLinesProbeLayout = (e: TextLayoutEvent) => {
    if (fontProbeCommittedKeyRef.current === fontMeasureKey) return;
    const lines = e.nativeEvent.lines;
    if (lines.length < inputViewportLogicalLines) return;
    const total = lines
      .slice(0, inputViewportLogicalLines)
      .reduce((sum, line) => sum + line.height, 0);
    const next = snapInputViewportHeightPx(
      total,
      inputViewportLogicalLines,
      inputViewportFallbackPx,
    );
    fontProbeCommittedKeyRef.current = fontMeasureKey;
    inputViewportHeightRef.current = next;
    setInputViewportHeightPx(next);
  };

  const handleInputMeasureLayout = (e: TextLayoutEvent) => {
    const maxWidth = e.nativeEvent.lines.reduce(
      (widest, line) => Math.max(widest, line.width),
      0,
    );
    setMeasuredTextMaxW(maxWidth);
  };

  const handleWrappedHeightMeasureLayout = (e: TextLayoutEvent) => {
    const lines = e.nativeEvent.lines;
    if (lines.length === 0) return;
    wrappedLayoutLinesRef.current = lines;

    const saved = selectionByPresetRef.current[activePreset];
    const pos =
      saved !== undefined ? saved.end : displayInputText.length;
    requestAnimationFrame(() => scrollInputToSelection(pos));
  };

  const resetInputScroll = useCallback(() => {
    if (inputScrollXRef.current === 0) return;
    inputScrollXRef.current = 0;
    inputScrollRef.current?.scrollTo({ x: 0, animated: false });
  }, []);

  const scrollInputToSelection = useCallback(
    (selectionStart: number) => {
      const viewportW = inputScrollViewportWResolved;
      if (viewportW <= 0) return;

      if (!needsHorizontalScroll) {
        resetInputScroll();
        return;
      }

      const lines = wrappedLayoutLinesRef.current;
      const currentLine = lineAtSelection(
        displayInputText,
        selectionStart,
        lines,
      );
      if (currentLine && currentLine.width <= viewportW) {
        const targetX = Math.max(0, currentLine.x);
        if (inputScrollXRef.current !== targetX) {
          inputScrollXRef.current = targetX;
          inputScrollRef.current?.scrollTo({ x: targetX, animated: false });
        }
        return;
      }

      const cursorX = cursorXFromSelection(
        displayInputText,
        selectionStart,
        lines,
      );
      const maxScrollX = Math.max(0, inputHorizontalCanvasWidth - viewportW);
      const margin = CURSOR_SCROLL_MARGIN;
      let scrollX = inputScrollXRef.current;

      if (cursorX < scrollX + margin) {
        scrollX = Math.max(0, cursorX - margin);
      } else if (cursorX > scrollX + viewportW - margin) {
        scrollX = Math.min(maxScrollX, cursorX - viewportW + margin);
      }

      inputScrollXRef.current = scrollX;
      inputScrollRef.current?.scrollTo({ x: scrollX, animated: false });
    },
    [
      displayInputText,
      inputHorizontalCanvasWidth,
      inputScrollViewportWResolved,
      needsHorizontalScroll,
      resetInputScroll,
    ],
  );

  useLayoutEffect(() => {
    if (!needsHorizontalScroll) {
      resetInputScroll();
    }
  }, [needsHorizontalScroll, resetInputScroll]);

  useLayoutEffect(() => {
    const saved = selectionByPresetRef.current[activePreset];
    const pos =
      saved !== undefined ? saved.end : displayInputText.length;
    scrollInputToSelection(pos);
  }, [
    activePreset,
    displayInputText,
    inputHorizontalCanvasWidth,
    scrollInputToSelection,
  ]);

  const measureOffscreenStyle = useMemo(
    () => ({
      position: "absolute" as const,
      opacity: 0,
      left: TEXT_MEASURE_OFFSCREEN_LEFT,
      width: -TEXT_MEASURE_OFFSCREEN_LEFT,
      fontSize: CONTENTS_INPUT_FONT_SIZE,
      lineHeight: CONTENTS_INPUT_LINE_HEIGHT,
      fontFamily: appFontFamilyForText(
        font,
        fontWeight === "bold" ? "bold" : "normal",
        appLocale,
      ),
      ...Platform.select({
        android: { includeFontPadding: false as const },
        default: {},
      }),
    }),
    [font, fontWeight, appLocale],
  );

  const onSelectionChange = (e: {
    nativeEvent: { selection: { start: number; end: number } };
  }) => {
    const { start, end } = e.nativeEvent.selection;
    if (activePreset >= 0 && activePreset < PRESET_SLOT_COUNT) {
      selectionByPresetRef.current[activePreset] = { start, end };
    }
    scrollInputToSelection(end);
  };

  const onInputScroll = (e: {
    nativeEvent: { contentOffset: { x: number } };
  }) => {
    inputScrollXRef.current = e.nativeEvent.contentOffset.x;
  };

  return {
    displayInputText,
    inputHorizontalCanvasWidth,
    needsHorizontalScroll,
    inputViewportHeightPx,
    fontLineProbeText,
    pendingSelection,
    inputScrollRef,
    handleInputMeasureLayout,
    handleFontLinesProbeLayout,
    handleWrappedHeightMeasureLayout,
    measureOffscreenStyle,
    onSelectionChange,
    onInputScroll,
    scrollInputToSelection,
  };
}
