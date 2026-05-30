import { appFontFamilyForText } from "@/constants/appFonts";
import {
  CONTENTS_INPUT_FONT_SIZE,
  CONTENTS_INPUT_LINE_HEIGHT,
  CONTENTS_INPUT_VIEWPORT_HEIGHT,
} from "@/constants/styles";
import {
  PRESET_SLOT_COUNT,
  PREVIEW_TEXT_MAX_LINES,
} from "@/contexts/settingsContext";
import type { ComponentProps } from "react";
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Platform, ScrollView, TextInput, TextLayoutEvent } from "react-native";

type WrappedLayoutLine = TextLayoutEvent["nativeEvent"]["lines"][number];

type TextInputContentSizeChangeEvent = Parameters<
  NonNullable<ComponentProps<typeof TextInput>["onContentSizeChange"]>
>[0];

const TEXT_MEASURE_OFFSCREEN_LEFT = -100_000;
/** 텍스트 끝 여유*/
const INPUT_WIDTH_CURSOR_PAD = 28;
const INPUT_LINE_WIDTH_PER_CHAR_FACTOR = 0.72;
const INPUT_HEIGHT_BUFFER = 0;
/** 커서가 스크롤 뷰포트 안에 남도록 하는 여백 */
const CURSOR_SCROLL_MARGIN = 28;

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

function cursorXFromSelection(
  text: string,
  selectionStart: number,
  lines: WrappedLayoutLine[],
): number {
  if (!lines.length) {
    const charPx = CONTENTS_INPUT_FONT_SIZE * INPUT_LINE_WIDTH_PER_CHAR_FACTOR;
    return selectionStart * charPx;
  }

  let textIndex = 0;
  for (const line of lines) {
    const lineText = line.text;
    const lineEnd = textIndex + lineText.length;

    if (selectionStart <= lineEnd) {
      const offsetInLine = Math.max(0, selectionStart - textIndex);
      const ratio =
        lineText.length > 0 ? offsetInLine / lineText.length : 0;
      return line.x + line.width * ratio;
    }

    textIndex = lineEnd;
    if (text[textIndex] === "\n") {
      textIndex += 1;
    }
  }

  const last = lines[lines.length - 1];
  return last.x + last.width;
}

export function useTextInput(params: {
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
  const [measuredTextMaxW, setMeasuredTextMaxW] = useState(0);
  const [inputFixedHeight, setInputFixedHeight] = useState(
    inputViewportFallbackPx,
  );
  /** `TextInput`에서 실제로 보이는 높이 */
  const contentSizeHeightRef = useRef(0);
  /** 입력 폭과 동일하게 줄바꿈된 오프스크린 `Text`에서 합산한 높이 */
  const wrappedMeasureHeightRef = useRef(0);
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
  }, [inputScrollViewportW, measuredTextMaxW, windowWidth, longestLineWidth]);

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

  useLayoutEffect(() => {
    setInputViewportHeightPx(inputViewportFallbackPx);
  }, [font, fontWeight, inputViewportFallbackPx]);

  const handleFontLinesProbeLayout = (e: TextLayoutEvent) => {
    const lines = e.nativeEvent.lines;
    if (!lines.length) return;
    const total = lines
      .slice(0, inputViewportLogicalLines)
      .reduce((sum, line) => sum + line.height, 0);
    const next = Math.ceil(total);
    if (next > 0) {
      setInputViewportHeightPx((prev) => (prev !== next ? next : prev));
    }
  };

  const handleInputMeasureLayout = (e: TextLayoutEvent) => {
    const maxWidth = e.nativeEvent.lines.reduce(
      (widest, line) => Math.max(widest, line.width),
      0,
    );
    setMeasuredTextMaxW(maxWidth);
  };

  const applyMergedInputHeight = () => {
    const merged = Math.max(
      wrappedMeasureHeightRef.current,
      contentSizeHeightRef.current,
      1,
    );
    const nextHeight = Math.min(
      inputViewportHeightPx,
      Math.ceil(merged + INPUT_HEIGHT_BUFFER),
    );
    if (nextHeight > 0) {
      setInputFixedHeight((prev) => (nextHeight !== prev ? nextHeight : prev));
    }
  };

  const scrollInputToSelection = useCallback(
    (selectionStart: number) => {
      const viewportW =
        inputScrollViewportW > 0
          ? inputScrollViewportW
          : Math.round(windowWidth * 0.45);
      if (viewportW <= 0) return;

      const cursorX = cursorXFromSelection(
        displayInputText,
        selectionStart,
        wrappedLayoutLinesRef.current,
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
      inputScrollViewportW,
      windowWidth,
    ],
  );

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

  /**
   * TextInput의 가로 폭에서 줄바꿈된 모든 시각적 줄의 높이를 확인차 합산
   */
  const handleWrappedHeightMeasureLayout = (e: TextLayoutEvent) => {
    const lines = e.nativeEvent.lines;
    if (lines.length === 0) return;
    wrappedLayoutLinesRef.current = lines;
    wrappedMeasureHeightRef.current = lines.reduce(
      (sum, line) => sum + line.height,
      0,
    );
    applyMergedInputHeight();

    const saved = selectionByPresetRef.current[activePreset];
    const pos =
      saved !== undefined ? saved.end : displayInputText.length;
    requestAnimationFrame(() => scrollInputToSelection(pos));
  };

  const handleInputContentSizeChange = (e: TextInputContentSizeChangeEvent) => {
    const h = e.nativeEvent.contentSize.height;
    contentSizeHeightRef.current = h > 0 ? h : 0;
    applyMergedInputHeight();
  };

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
      ),
      ...Platform.select({
        android: { includeFontPadding: false as const },
        default: {},
      }),
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
    inputFixedHeight,
    inputViewportHeightPx,
    fontLineProbeText,
    pendingSelection,
    inputScrollRef,
    handleInputMeasureLayout,
    handleFontLinesProbeLayout,
    handleWrappedHeightMeasureLayout,
    handleInputContentSizeChange,
    measureOffscreenStyle,
    onSelectionChange,
    onInputScroll,
    scrollInputToSelection,
  };
}
