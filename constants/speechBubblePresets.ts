export const SPEECH_BUBBLE_PRESETS = {
  speechBg1: {
    previewSource: require("@/assets/images/Speech BG_1_A.png"),
    fullscreenLandscapeSource: require("@/assets/images/Speech BG_1_A.png"),
    fullscreenPortraitSource: require("@/assets/images/Speech BG_1_B.png"),
    ios: {
      previewHeightBoostPx: 20,
      // fullscreen에서 말풍선 안 삐져나오게 landscape/portrait text box 크기
      fullscreenTextBox: {
        landscape: { width: "82%", yOffset: 0 },
        portrait: { width: "70%", yOffset: 0 },
      },
      // preview 전용 text box 크기
      previewTextBox: {
        portrait: { width: "70%", yOffset: "14%" },
      },
    },
    android: {
      previewHeightBoostPx: 20,
      // fullscreen에서 말풍선 안 삐져나오게 landscape/portrait text box 크기
      fullscreenTextBox: {
        landscape: { width: "82%", yOffset: 0 },
        portrait: { width: "70%", yOffset: 0 },
      },
      // preview 전용 text box 크기
      previewTextBox: {
        portrait: { width: "70%", yOffset: "14%" },
      },
    },
  },
  speechBg2: {
    previewSource: require("@/assets/images/Speech BG_2_A.png"),
    fullscreenLandscapeSource: require("@/assets/images/Speech BG_2_A.png"),
    fullscreenPortraitSource: require("@/assets/images/Speech BG_2_B.png"),
    ios: {
      previewHeightBoostPx: 20, // preview에서 자연스럽게 조이도록 이미지높이 조절
      // fullscreen에서 말풍선 안 삐져나오게 landscape/portrait text box 크기
      fullscreenTextBox: {
        landscape: { width: "82%", yOffset: 10 },
        portrait: { width: "70%", yOffset: 10 },
      },
      // preview 전용 text box 크기
      previewTextBox: {
        portrait: { width: "76%", yOffset: "14%" },
      },
    },
    android: {
      previewHeightBoostPx: 20, // preview에서 자연스럽게 조이도록 이미지높이 조절
      // fullscreen에서 말풍선 안 삐져나오게 landscape/portrait text box 크기
      fullscreenTextBox: {
        landscape: { width: "82%", yOffset: -50 },
        portrait: { width: "70%", yOffset: 0 },
      },
      // preview 전용 text box 크기
      previewTextBox: {
        portrait: { width: "76%", yOffset: "14%" },
      },
    },
  },
} as const;

export type SpeechBubblePresetId = keyof typeof SPEECH_BUBBLE_PRESETS;

export function isSpeechBubblePreset(id: string): id is SpeechBubblePresetId {
  return id in SPEECH_BUBBLE_PRESETS;
}
