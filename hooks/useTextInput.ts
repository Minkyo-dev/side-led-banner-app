import { appFontFamilyForText } from "@/constants/appFonts";
import {
  CONTENTS_INPUT_FONT_SIZE,
  CONTENTS_INPUT_VIEWPORT_HEIGHT,
} from "@/constants/styles";
import {
  PRESET_SLOT_COUNT,
  PREVIEW_TEXT_MAX_LINES, useSettings
} from "@/contexts/settingsContext";
import { useCallback, useLayoutEffect, useMemo, useRef, useState, type RefObject } from "react";
import { Platform, ScrollView, TextInput, TextLayoutEvent, useWindowDimensions } from "react-native";

type WrappedLayoutLine = TextLayoutEvent["nativeEvent"]["lines"][number];

const TEXT_MEASURE_OFFSCREEN_LEFT = -100_000;
/** 텍스트 끝 여유*/
const INPUT_WIDTH_CURSOR_PAD = 28;

/** 커서가 스크롤 뷰포트 안에 남도록 하는 여백 */
const CURSOR_SCROLL_MARGIN = 28;
const INPUT_MARGIN = 16;
/** TextInput 인라인 스타일의 paddingTop + paddingBottom 합산 */
const TEXT_INPUT_VERTICAL_PADDING = 0;

function computePerLinePx(measuredTotalPx: number, logicalLines: number): number {
  return measuredTotalPx / logicalLines;
}

function snapInputViewportHeightPx(perLine: number, logicalLines: number, fallbackPx: number): number {
  return Math.max(fallbackPx, perLine * logicalLines) + INPUT_MARGIN;
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
    return selectionStart * (CONTENTS_INPUT_FONT_SIZE * 0.72);
  }

  const line = lineAtSelection(text, selectionStart, lines);
  if (!line) {
    return selectionStart * (CONTENTS_INPUT_FONT_SIZE * 0.72);
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
  inputScrollViewportW: number;
  textInputRef: RefObject<TextInput | null>;
}) {
  const { inputScrollViewportW, textInputRef } = params;
  const { config, ui, resolvedAppLocale: appLocale } = useSettings();
  const { previewText } = config.content;
  const { font, fontWeight } = config.appearance;
  const { activePreset } = ui;
  const { width: windowWidth } = useWindowDimensions();

  /** 입력 박스 높이는 one / multi 모두 멀티 최대 줄 수와 동일 */
  const inputViewportLogicalLines = PREVIEW_TEXT_MAX_LINES;
  const inputViewportFallbackPx = CONTENTS_INPUT_VIEWPORT_HEIGHT + TEXT_INPUT_VERTICAL_PADDING;

  const fontLineProbeText = useMemo(
    () =>
      Array.from({ length: inputViewportLogicalLines }, () => "Mg").join("\n"),
    [inputViewportLogicalLines],
  );

  const [inputViewportHeightPx, setInputViewportHeightPx] = useState(
    inputViewportFallbackPx,
  );
  // const [measuredLineHeightPx, setMeasuredLineHeightPx] = useState(CONTENTS_INPUT_LINE_HEIGHT);
  const inputViewportHeightRef = useRef(inputViewportFallbackPx);
  const fontProbeCommittedKeyRef = useRef<string | null>(null);
  const [measuredTextMaxW, setMeasuredTextMaxW] = useState(0);
  const [pendingSelection, setPendingSelection] = useState<
    { start: number; end: number } | undefined
  >({ start: 0, end: 0 });

  const inputScrollRef = useRef<ScrollView>(null);
  const inputScrollXRef = useRef(0);
  const wrappedLayoutLinesRef = useRef<WrappedLayoutLine[]>([]);
  const textChangeSignalRef = useRef(false);

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
    return maxChars * (CONTENTS_INPUT_FONT_SIZE * 0.72);
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
    const perLine = computePerLinePx(total, inputViewportLogicalLines);
    const next = snapInputViewportHeightPx(perLine, inputViewportLogicalLines, inputViewportFallbackPx);
    fontProbeCommittedKeyRef.current = fontMeasureKey;
    inputViewportHeightRef.current = next;
    // setMeasuredLineHeightPx(perLine);
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

  const signalTextChanged = useCallback(() => {
    textChangeSignalRef.current = true;
  }, []);

  const handleTextInputContentSizeChange = useCallback(
    (_w: number, h: number) => {
      if (!textChangeSignalRef.current) return;
      textChangeSignalRef.current = false;
      const next = h + INPUT_MARGIN;
      if (Math.abs(next - inputViewportHeightRef.current) < 1) return;
      inputViewportHeightRef.current = next;
      setInputViewportHeightPx(next);
    },
    [],
  );

  const resetInputScroll = useCallback(() => {
    if (inputScrollXRef.current === 0) return;
    inputScrollXRef.current = 0;
    inputScrollRef.current?.scrollTo({ x: 0, animated: false });
  }, []);

  const scrollToCursorX = useCallback(
    (cursorX: number) => {
      const viewportW = inputScrollViewportWResolved;
      if (viewportW <= 0) return;
      if (!needsHorizontalScroll) {
        resetInputScroll();
        return;
      }
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
    [inputHorizontalCanvasWidth, inputScrollViewportWResolved, needsHorizontalScroll, resetInputScroll],
  );

  const scrollInputToSelection = useCallback(
    (selectionStart: number) => {
      if (!needsHorizontalScroll) {
        resetInputScroll();
        return;
      }
      const lines = wrappedLayoutLinesRef.current;
      const cursorX = cursorXFromSelection(displayInputText, selectionStart, lines);
      scrollToCursorX(cursorX);
    },
    [displayInputText, needsHorizontalScroll, resetInputScroll, scrollToCursorX],
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
    setPendingSelection((prev) =>
      prev?.start === start && prev?.end === end ? prev : { start, end },
    );
    scrollInputToSelection(start);
  };

  const onInputScroll = (e: {
    nativeEvent: { contentOffset: { x: number } };
  }) => {
    inputScrollXRef.current = e.nativeEvent.contentOffset.x;
  };

  const moveCursorByLine = useCallback((direction: "up" | "down") => {
    const saved = selectionByPresetRef.current[activePreset];
    const pos = saved !== undefined ? saved.start : displayInputText.length;

    const lines = displayInputText.split("\n");
    let charCount = 0;
    let currentLine = lines.length - 1;
    let posInLine = lines[lines.length - 1]?.length ?? 0;

    for (let i = 0; i < lines.length; i++) {
      const lineEnd = charCount + lines[i].length;
      if (pos <= lineEnd) {
        currentLine = i;
        posInLine = pos - charCount;
        break;
      }
      charCount = lineEnd + 1;
    }

    const targetLine = direction === "up" ? currentLine - 1 : currentLine + 1;
    if (targetLine < 0 || targetLine >= lines.length) return;

    let newPos = 0;
    for (let i = 0; i < targetLine; i++) {
      newPos += lines[i].length + 1;
    }
    newPos += Math.min(posInLine, lines[targetLine].length);

    const next = { start: newPos, end: newPos };
    selectionByPresetRef.current[activePreset] = next;
    // setNativeProps로 네이티브 selection을 먼저 이동시켜 React 재렌더 시 중복 레이아웃 패스를 방지
    textInputRef.current?.setNativeProps({ selection: next });
    setPendingSelection(next);
  }, [activePreset, displayInputText, textInputRef]);

  const moveCursorUp = useCallback(() => moveCursorByLine("up"), [moveCursorByLine]);
  const moveCursorDown = useCallback(() => moveCursorByLine("down"), [moveCursorByLine]);

  const forceSelection = useCallback(
    (sel: { start: number; end: number }) => {
      if (activePreset >= 0 && activePreset < PRESET_SLOT_COUNT) {
        selectionByPresetRef.current[activePreset] = sel;
      }
      textInputRef.current?.setNativeProps({ selection: sel });
      setPendingSelection(sel);
    },
    [activePreset, textInputRef],
  );

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
    handleTextInputContentSizeChange,
    handleWrappedHeightMeasureLayout,
    measureOffscreenStyle,
    onSelectionChange,
    onInputScroll,
    scrollInputToSelection,
    signalTextChanged,
    moveCursorUp,
    moveCursorDown,
    forceSelection,
  };
}
