export const SPEECH_BUBBLE_PRESETS = {
  speechBg1: {
    previewSource: require("@/assets/images/Speech BG_1_A.png"),
    fullscreenLandscapeSource: require("@/assets/images/Speech BG_1_A.png"),
    fullscreenPortraitSource: require("@/assets/images/Speech BG_1_B.png"),
    previewHeightBoostPx: 12,
    // fullscreen에서 말풍선 안 삐져나오게 landscape/portrait text box 크기
    fullscreenTextBox: {
      landscape: { width: "85%", height: "100%" },
      portrait: { width: "74%", height: "86%" },
    },
    // preview 전용 text box 크기
    previewTextBox: {
      portrait: { width: "74%", height: "86%" },
    },
  },
  speechBg2: {
    previewSource: require("@/assets/images/Speech BG_2_A.png"),
    fullscreenLandscapeSource: require("@/assets/images/Speech BG_2_A.png"),
    fullscreenPortraitSource: require("@/assets/images/Speech BG_2_B.png"),
    previewHeightBoostPx: 12, // preview에서 자연스럽게 조이도록 이미지높이 조절절
    // fullscreen에서 말풍선 안 삐져나오게 landscape/portrait text box 크기
    fullscreenTextBox: {
      landscape: { width: "85%", height: "75%" },
      portrait: { width: "74%", height: "100%" },
    },
    // preview 전용 text box 크기
    previewTextBox: {
      portrait: { width: "80%", height: "50%" },
    },
  },
} as const;

export type SpeechBubblePresetId = keyof typeof SPEECH_BUBBLE_PRESETS;

export function isSpeechBubblePreset(kind: string): kind is SpeechBubblePresetId {
  return kind in SPEECH_BUBBLE_PRESETS;
}
