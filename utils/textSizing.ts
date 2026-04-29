const DEFAULT_LINE_HEIGHT_RATIO = 1.2;
const FULLSCREEN_LINE_HEIGHT_RATIO = 1.16;
const SPEECH_TEXT_HEIGHT_PADDING = 24;
const PORTRAIT_FONT_BOOST = 4.05;
const PREVIEW_VERTICAL_TEXT_PADDING = {
  default: 0,
  speechBg1: 12,
  speechBg2: 24,
} as const;
const SPEECH_BG_MAX_TEXT_HEIGHT = {
  speechBg1: { portrait: 400, landscape: 200 },
  speechBg2: { portrait: 400, landscape: 200 },
} as const;
type SpeechBubbleId = keyof typeof SPEECH_BG_MAX_TEXT_HEIGHT;

export function getSpeechBubbleId(effectId: string): SpeechBubbleId | null {
  return effectId === "speechBg1" || effectId === "speechBg2" ? effectId : null;
}

export function getTextSizingPolicy(params: {
  effectId: string;
  isPortrait: boolean;
}) {
  const { effectId, isPortrait } = params;
  const speechBubbleId = getSpeechBubbleId(effectId);
  const previewPadding =
    speechBubbleId == null
      ? PREVIEW_VERTICAL_TEXT_PADDING.default
      : PREVIEW_VERTICAL_TEXT_PADDING[speechBubbleId];
  const fullscreenMaxHeight =
    speechBubbleId == null
      ? null
      : isPortrait
        ? SPEECH_BG_MAX_TEXT_HEIGHT[speechBubbleId].portrait
        : SPEECH_BG_MAX_TEXT_HEIGHT[speechBubbleId].landscape;
  return {
    speechBubbleId,
    previewLineHeightRatio: DEFAULT_LINE_HEIGHT_RATIO,
    fullscreenLineHeightRatio: FULLSCREEN_LINE_HEIGHT_RATIO,
    speechTextHeightPadding: SPEECH_TEXT_HEIGHT_PADDING,
    portraitFontBoost: PORTRAIT_FONT_BOOST,
    previewPadding,
    fullscreenMaxHeight,
    clampByMaxHeight: speechBubbleId != null,
  };
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
    maxLines = 3,
    fallbackFontSize = 100,
  } = params;

  if (previewHeight === 0) {
    return { lineCount: 1, fontSize: fallbackFontSize, height: fallbackFontSize };
  }
  const lineCount = getLineCountForMode({ text, playOption, maxLines });
  const availableHeight = Math.max(1, previewHeight - padding);
  const maxFontSize = Math.max(
    1,
    Math.floor(availableHeight / (lineCount * lineHeightRatio)),
  );
  const percentBasedFontSize = Math.floor(maxFontSize * ((fontSizePercent ?? 100) / 100));
  const desiredFontSize = baseFontSize ?? percentBasedFontSize;
  const fontSize = Math.max(1, Math.min(desiredFontSize, maxFontSize));
  const height = Math.max(
    1,
    Math.ceil(fontSize * lineHeightRatio * lineCount + padding),
  );
  return { lineCount, fontSize, height };
}

export function getHeightScaledFontSize(params: {
  baseFontSize: number;
  targetHeight: number;
  referenceHeight: number;
}) {
  const { baseFontSize, targetHeight, referenceHeight } = params;
  if (referenceHeight <= 0) return Math.max(1, Math.floor(baseFontSize));
  const scaled = baseFontSize * (Math.max(1, targetHeight) / referenceHeight);
  return Math.max(1, Math.floor(scaled));
}

export function getFullscreenTextMetrics(params: {
  displayText: string;
  baseFontSize: number;
  lineHeightRatio: number;
  maxHeight: number;
  padding: number;
  clampByMaxHeight: boolean;
}) {
  const {
    displayText,
    baseFontSize,
    lineHeightRatio,
    maxHeight,
    padding,
    clampByMaxHeight,
  } = params;

  const lineCount = Math.max(1, displayText.split("\n").length);
  const availableHeight = Math.max(1, maxHeight - padding);
  const maxFontSizeByHeight = Math.max(
    1,
    Math.floor(availableHeight / (lineHeightRatio * lineCount)),
  );
  const fontSize = clampByMaxHeight
    ? Math.max(1, Math.min(baseFontSize, maxFontSizeByHeight))
    : baseFontSize;

  const rawHeight = Math.max(
    1,
    Math.ceil(fontSize * lineHeightRatio * lineCount + padding),
  );
  const height = clampByMaxHeight ? Math.min(rawHeight, maxHeight) : rawHeight;

  return { lineCount, fontSize, height };
}
