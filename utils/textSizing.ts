import { countRows } from "@/utils/skiaBubbleTextLayout";

const DEFAULT_LINE_HEIGHT_RATIO = 1.2;
const FULLSCREEN_LINE_HEIGHT_RATIO = 1.16;
export const FONT_SIZE_MIN = 20;
const FONT_SIZE_MAX = 100;
const SPEECH_TEXT_HEIGHT_PADDING = 24;
const PORTRAIT_FONT_BOOST = 0.8;
const PREVIEW_VERTICAL_TEXT_PADDING = {
  default: 0,
  speechBg1: 12,
  speechBg2: 24,
} as const;
/** Speech BG 없을 때: 뷰포트 세로 대비 텍스트 영역 비율 */
export const DEFAULT_MAX_TEXT_HEIGHT_RATIO = {
  portrait: 0.5,
  landscape: 1,
} as const;

/**
 * 말풍선 원본 아트보드(px) 기준 텍스트 박스 layout.
 * landscape 전체화면: top·height = viewportHeight × 비율
 */
export const SPEECH_BG_TEXT_LAYOUT = {
  speechBg1: {
    portrait: {
      textHeightRatio: 264.5 / 393,
      topOffsetRatio: null as number | null,
    },
    landscape: {
      /** 393px 중 텍스트 264.5px, 위 64px / 아래 64.5px */
      textHeightRatio: 264.5 / 393,
      topOffsetRatio: 64 / 393,
    },
  },
  speechBg2: {
    portrait: {
      textHeightRatio: 389 / 518,
      topOffsetRatio: null as number | null,
    },
    landscape: {
      /** 518px 중 텍스트 385px, 위 20px / 아래 ~109px(디자인상 ~90px) */
      textHeightRatio: 385 / 518,
      topOffsetRatio: 28 / 518,
    },
  },
} as const;

type SpeechBubbleId = keyof typeof SPEECH_BG_TEXT_LAYOUT;

function getSpeechTextLayout(
  speechBubbleId: SpeechBubbleId,
  isPortrait: boolean,
) {
  return isPortrait
    ? SPEECH_BG_TEXT_LAYOUT[speechBubbleId].portrait
    : SPEECH_BG_TEXT_LAYOUT[speechBubbleId].landscape;
}

export function getSpeechBubbleId(effectId: string): SpeechBubbleId | null {
  return effectId === "speechBg1" || effectId === "speechBg2" ? effectId : null;
}

export function resolveFullscreenMaxHeight(params: {
  effectId: string;
  isPortrait: boolean;
  viewportHeight: number;
}): number {
  const { effectId, isPortrait, viewportHeight } = params;
  const height = Math.max(1, viewportHeight);
  const speechBubbleId = getSpeechBubbleId(effectId);
  const ratio =
    speechBubbleId == null
      ? isPortrait
        ? DEFAULT_MAX_TEXT_HEIGHT_RATIO.portrait
        : DEFAULT_MAX_TEXT_HEIGHT_RATIO.landscape
      : getSpeechTextLayout(speechBubbleId, isPortrait).textHeightRatio;
  return Math.max(1, Math.floor(height * ratio));
}

/** landscape 등: 원본 top 비율. null이면 preset `yOffset`(중앙+translateY) 사용 */
export function resolveSpeechTextTopOffset(params: {
  effectId: string;
  isPortrait: boolean;
  viewportHeight: number;
}): number | null {
  const { effectId, isPortrait, viewportHeight } = params;
  const speechBubbleId = getSpeechBubbleId(effectId);
  if (speechBubbleId == null) return null;
  const topOffsetRatio = getSpeechTextLayout(speechBubbleId, isPortrait).topOffsetRatio;
  if (topOffsetRatio == null) return null;
  return Math.max(0, Math.floor(Math.max(1, viewportHeight) * topOffsetRatio));
}

export function getSizingPolicy(params: { effectId: string }) {
  const { effectId } = params;
  const speechBubbleId = getSpeechBubbleId(effectId);
  const previewPadding =
    speechBubbleId == null
      ? PREVIEW_VERTICAL_TEXT_PADDING.default
      : PREVIEW_VERTICAL_TEXT_PADDING[speechBubbleId];
  return {
    speechBubbleId,
    previewLineHeightRatio: DEFAULT_LINE_HEIGHT_RATIO,
    fullscreenLineHeightRatio: FULLSCREEN_LINE_HEIGHT_RATIO,
    speechTextHeightPadding: SPEECH_TEXT_HEIGHT_PADDING,
    portraitFontBoost: PORTRAIT_FONT_BOOST,
    previewPadding,
    clampByMaxHeight: true,
  };
}

export function getRelLineSpacing(params: {
  requestedLineSpacingPx: number;
  fontSizePercent: number;
}) {
  const { requestedLineSpacingPx, fontSizePercent } = params;
  const requested = Math.max(0, requestedLineSpacingPx);
  const clampedFontSize = Math.max(FONT_SIZE_MIN, Math.min(FONT_SIZE_MAX, fontSizePercent));
  const t =
    (clampedFontSize - FONT_SIZE_MIN) / (FONT_SIZE_MAX - FONT_SIZE_MIN);
  const scale = 1 - t;
  return requested * scale;
}

export function getLineCountForMode(params: {
  text: string;
  playOption: "one" | "multi";
  maxLines?: number;
}) {
  const { text, playOption, maxLines = 3 } = params;
  if (playOption === "one") return 1;
  return Math.min((text.match(/\n/g) || []).length + 1, maxLines);
}

export function getPreviewFontSize(params: {
  previewHeight: number;
  fontSizePercent: number;
  playOption: "one" | "multi";
  text: string;
  padding?: number;
  lineHeightRatio?: number;
  maxLines?: number;
  fallbackFontSize?: number;
}) {
  return getPreviewTextMetrics(params).fontSize;
}

export function getPreviewTextMetrics(params: {
  previewHeight: number;
  fontSizePercent?: number;
  baseFontSize?: number;
  playOption: "one" | "multi";
  text: string;
  padding?: number;
  lineHeightRatio?: number;
  lineSpacingPx?: number;
  maxLines?: number;
  fallbackFontSize?: number;
}) {
  const {
    previewHeight,
    fontSizePercent,
    baseFontSize,
    playOption,
    text,
    padding = 0,
    lineHeightRatio = DEFAULT_LINE_HEIGHT_RATIO,
    lineSpacingPx,
    maxLines = 3,
    fallbackFontSize = 100,
  } = params;

  if (previewHeight === 0) {
    return { lineCount: 1, fontSize: fallbackFontSize, height: fallbackFontSize };
  }
  const lineCount = countRows(text, playOption, maxLines);
  const availableHeight = Math.max(1, previewHeight - padding);
  const requestedLineSpacingPx = Math.max(0, lineSpacingPx ?? 0);
  const effectiveLineHeightRatio = lineHeightRatio;

  const maxFontSizeForBox = Math.max(
    1,
    Math.floor(availableHeight / (lineCount * effectiveLineHeightRatio)),
  );

  if (lineSpacingPx == null) {
    const percentBasedFontSize = Math.floor(
      maxFontSizeForBox * ((fontSizePercent ?? 100) / 100),
    );
    const desiredFontSize = baseFontSize ?? percentBasedFontSize;
    const fontSize = Math.max(1, Math.min(desiredFontSize, maxFontSizeForBox));
    const rawH = Math.max(
      1,
      Math.ceil(fontSize * effectiveLineHeightRatio * lineCount + padding),
    );
    const fillBox = (fontSizePercent ?? 100) >= FONT_SIZE_MAX;
    const height = fillBox ? previewHeight : rawH;
    return { lineCount, fontSize, height };
  }

  const percentBasedFontSize = Math.floor(
    maxFontSizeForBox * ((fontSizePercent ?? 100) / 100),
  );
  const desiredFontSize = baseFontSize ?? percentBasedFontSize;
  const fontSize = Math.max(1, Math.min(desiredFontSize, maxFontSizeForBox));

  const lineBodyPx = fontSize * effectiveLineHeightRatio * lineCount;
  const gapBudgetPx = Math.max(0, availableHeight - lineBodyPx);
  const interLineGapPx =
    lineCount > 1
      ? Math.min(
          requestedLineSpacingPx,
          Math.floor(gapBudgetPx / (lineCount - 1)),
        )
      : 0;
  const totalLineGapPx = Math.max(0, lineCount - 1) * interLineGapPx;
  const rawH = Math.max(1, Math.ceil(lineBodyPx + totalLineGapPx + padding));
  const fillBox = (fontSizePercent ?? 100) >= FONT_SIZE_MAX;
  const height = fillBox ? previewHeight : rawH;
  return { lineCount, fontSize, height };
}

export function scaleFontSizeByHeight(params: {
  baseFontSize: number;
  targetHeight: number;
  referenceHeight: number;
}) {
  const { baseFontSize, targetHeight, referenceHeight } = params;
  if (referenceHeight <= 0) return Math.max(1, Math.floor(baseFontSize));
  const scaled = baseFontSize * (Math.max(1, targetHeight) / referenceHeight);
  return Math.max(1, Math.floor(scaled));
}

export function resolvePctWidthPx(
  width: number | string,
  basisPx: number,
): number {
  if (basisPx <= 0) return 0;
  if (typeof width === "number") return width;
  const trimmed = width.trim();
  if (trimmed.endsWith("%")) {
    return basisPx * (parseFloat(trimmed) / 100);
  }
  const parsed = parseFloat(trimmed);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function resolveSpeechBoxPx(params: {
  boxWidth: number | string;
  basisWidthPx: number;
  maxHeightPx: number;
}) {
  const { boxWidth, basisWidthPx, maxHeightPx } = params;
  return {
    widthPx: resolvePctWidthPx(boxWidth, basisWidthPx),
    heightPx: Math.max(1, maxHeightPx),
  };
}

export function getFullscreenTextMetrics(params: {
  displayText: string;
  baseFontSize: number;
  lineHeightRatio: number;
  lineSpacingPx?: number;
  maxHeight: number;
  padding: number;
  clampByMaxHeight: boolean;
  speechBg?: boolean;
  playOption?: "one" | "multi";
  sizePct?: number;
}) {
  const {
    displayText,
    baseFontSize,
    lineHeightRatio,
    lineSpacingPx,
    maxHeight,
    padding,
    clampByMaxHeight,
    speechBg = false,
    playOption = "multi",
    sizePct = baseFontSize,
  } = params;

  const lineCount = countRows(displayText, playOption);
  const availableHeight = Math.max(1, maxHeight - padding);
  const requestedLineSpacingPx = Math.max(0, lineSpacingPx ?? 0);
  const effectiveLineHeightRatio = lineHeightRatio;
  const maxLineSpacingPx =
    lineCount > 1
      ? Math.max(
          0,
          Math.floor(
            (availableHeight -
              Math.max(1, baseFontSize) * effectiveLineHeightRatio * lineCount) /
              (lineCount - 1),
          ),
        )
      : requestedLineSpacingPx;
  const interLineGapPx = Math.min(requestedLineSpacingPx, maxLineSpacingPx);
  const totalLineGapPx = Math.max(0, lineCount - 1) * interLineGapPx;
  const maxFontSizeByHeight = Math.max(
    1,
    lineSpacingPx == null
      ? Math.floor(availableHeight / (lineHeightRatio * lineCount))
      : Math.floor(
          (availableHeight - totalLineGapPx) /
            (effectiveLineHeightRatio * lineCount),
        ),
  );
  const fontSize = clampByMaxHeight
    ? Math.max(1, Math.min(baseFontSize, maxFontSizeByHeight))
    : baseFontSize;

  const rawHeight = Math.max(
    1,
    lineSpacingPx == null
      ? Math.ceil(fontSize * lineHeightRatio * lineCount + padding)
      : Math.ceil(
          fontSize * effectiveLineHeightRatio * lineCount + totalLineGapPx + padding,
        ),
  );
  const fillBox =
    speechBg || (clampByMaxHeight && sizePct >= FONT_SIZE_MAX);
  const height = fillBox ? maxHeight : Math.min(rawHeight, maxHeight);

  return { lineCount, fontSize, height };
}
