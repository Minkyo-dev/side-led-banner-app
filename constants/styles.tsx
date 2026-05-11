import { uiThemeFontStyle } from "@/constants/appFonts";
import { Dimensions, StyleSheet } from "react-native";

/** 미리보기 하단 `TextInput`·측정용 `Text`와 동일 */
export const CONTENTS_INPUT_FONT_SIZE = 18;
const { width: SCREEN_WIDTH } = Dimensions.get("window");

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F6F6",
  },

  // ===
  scrollViewContainer: {
    paddingBottom: 30,
  },

  previewContainer: {
    height: (SCREEN_WIDTH - 18) * (355 / 373),
    // height: 224,
    flexDirection: "column",
    padding: 5,
    marginHorizontal: 9,
    backgroundColor: "black",
    borderRadius: 20,
    overflow: "hidden",
  },
  preview: {
    flex: 1,
    borderRadius: 15,
    backgroundColor: "#D9D9D9",
    overflow: "hidden",
  },
  previewText: {
    textAlign: "left",
    textAlignVertical: "center",
  },

  // ===
  presetButtonsContainer: {
    // flex: 0.15,
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },

  // ===
  contentsInputContainer: {
    height: 60,
    flexDirection: "row",
    paddingHorizontal: 5,
    marginTop: 2,
    marginBottom: 11,
  },
  contentsInput: {
    fontSize: CONTENTS_INPUT_FONT_SIZE,
    flex: 0.8,
    color: "white",
  },

  // ===
  contentsInputResetButtonContainer: {
    flex: 0.25,
    justifyContent: "center",
    alignItems: "flex-end",
  },

  // ===
  playBarContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    height: 63,
    paddingHorizontal: 5,
    paddingVertical: 5,
    marginTop: 8,
    marginHorizontal: 9,
    backgroundColor: "black",
    borderRadius: 20,
  },

  // ===
  tabContainer: {
    height: 50,
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#DDDDDD",
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: "center",
    borderBottomWidth: 3,
    borderBottomColor: "transparent",
  },
  activeTab: {
    borderBottomColor: "#FF6E00",
  },
  tabText: {
    ...uiThemeFontStyle,
    fontSize: 14,
    color: "#787878",
    fontWeight: "600",
  },
  activeTabText: {
    color: "#FF6E00",
  },

  // ===
  settingsPanelContainer: {
    flex: 1,
    marginBottom: 20,
  },
  settingsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginBottom: 5,
    borderBottomWidth: 2,
    borderBottomColor: "#DDDDDD",
    // backgroundColor: 'red',
  },
  settingsRowLabel: {
    ...uiThemeFontStyle,
    fontSize: 16,
    color: "black",
    fontWeight: "400",
  },

  // ===
  settingsRowValueContainer: {
    minWidth: 45,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E7E7E7",
    borderRadius: 24,
    paddingHorizontal: 5,
    paddingVertical: 5,
  },
  settingsRowValue: {
    ...uiThemeFontStyle,
    fontSize: 16,
    color: "black",
    fontWeight: "400",
  },

  // ===
  colorPickerContainer: {
    borderBottomWidth: 2,
    borderBottomColor: "#DDDDDD",
  },

  // ===
  dropdownContainer: {
    // 드롭다운 컨테이너 스타일
    width: "40%",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 24,
    backgroundColor: "#E7E7E7",
  },

  // ===
  dropdownPlaceholderStyle: { ...uiThemeFontStyle },
  dropdownSelectedTextStyle: {
    ...uiThemeFontStyle,
    // 선택된 텍스트 스타일
    fontSize: 16,
  },
  dropdownIconStyle: {
    width: 30,
  },

  // ===
  dropdownItemContainerStyle: {
    // 아이템 컨테이너 스타일
    borderRadius: 0,
  },
  dropdownItemTextStyle: {
    ...uiThemeFontStyle,
    // 아이템 텍스트 스타일
    fontSize: 16,
  },

  // ===
  slider: {
    flex: 1,
    height: 40,
  },

  // ===
  effectContainer: {
    flex: 1,
    gap: 10,
    marginHorizontal: 15,
  },

  // ===
  effectImageContainer: {
    flex: 1,
    flexDirection: "row",
    marginHorizontal: 15,
    marginTop: 10,
  },
  effectImage: {
    width: 100,
    height: 300,
    aspectRatio: 1,
    marginRight: 10,
    gap: 4,
    borderRadius: 8,
  },
  backgroundEffectRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
    flex: 0,
    minHeight: 188,
    alignItems: "flex-start",
  },
  backgroundEffectCard: {
    borderRadius: 10,
    padding: 3,
    borderWidth: 2,
    borderColor: "#BDBDBD",
    width: 92,
    overflow: "hidden",
    backgroundColor: "#FFF",
  },
  backgroundEffectThumb: {
    width: "100%",
    height: 180,
    aspectRatio: undefined,
  },
});

export const backgroundPhotoSheetStyles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "flex-end",
  },
  dim: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    paddingHorizontal: 10,
  },
  group: {
    borderRadius: 14,
    overflow: "hidden",
  },
  row: {
    paddingVertical: 16,
    alignItems: "center",
  },
  rowText: {
    ...uiThemeFontStyle,
    fontSize: 17,
    fontWeight: "400",
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
  cancelWrap: {
    marginTop: 10,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  cancelText: {
    ...uiThemeFontStyle,
    fontSize: 17,
    fontWeight: "600",
  },
});

export const heartBackgroundTickerStyles = StyleSheet.create({
  clip: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  row: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: "row",
  },
});

export const colorPickerStyles = StyleSheet.create({
  colorPickerContainer: {
    gap: 10,
    marginHorizontal: 15,
    marginBottom: 5,
  },
  colorPickerRow: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  colorPickerItemButton: {
    position: "relative",
  },
  colorPickerItem: {
    width: 32,
    height: 32,
    borderRadius: 50,
  },
  colorPickerItemActive: {
    position: "absolute",
    top: -4,
    left: -4,
    borderWidth: 2.5,
    borderColor: "black",
    width: 40,
    height: 40,
    borderRadius: 50,
  },
});

const SLIDER_WIDTH = SCREEN_WIDTH - 100; // 슬라이더의 총 너비 (버튼 공간 제외)
export const sliderComponentStyles = StyleSheet.create({
  sliderContainer: {
    height: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 15,
    paddingBottom: 30,
    marginHorizontal: 10,
    marginBottom: 5,
    borderBottomWidth: 2,
    borderBottomColor: "#DDDDDD",
  },
  sliderTrack: {
    width: SLIDER_WIDTH,
    backgroundColor: "#8F8D8A",
    borderRadius: 4,
    height: 4,
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.15,
    shadowRadius: 1,
  },
  sliderThumb: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    borderRadius: 24,
    height: 23,
    width: 38,
    elevation: 3,
  },
  sliderButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  sliderButtonText: {
    fontSize: 40,
    color: "#B4B4B4",
    fontWeight: "300",
    fontFamily: "Nunito",
  },
});

export const ledBannerFullScreenStyles = StyleSheet.create({
  root: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  layerPassThrough: {
    ...StyleSheet.absoluteFillObject,
  },
});
