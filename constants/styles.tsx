import { uiThemeFontStyle } from "@/constants/appFonts";
import { PREVIEW_TEXT_MAX_LINES } from "@/contexts/settingsContext";
import { Dimensions, Platform, StyleSheet } from "react-native";

export const CONTENTS_INPUT_FONT_SIZE = 24;
export const CONTENTS_INPUT_LINE_HEIGHT = Math.round(
  CONTENTS_INPUT_FONT_SIZE * 1.2,
);
export const CONTENTS_INPUT_VIEWPORT_HEIGHT =
  PREVIEW_TEXT_MAX_LINES * CONTENTS_INPUT_LINE_HEIGHT;
const { width: SCREEN_WIDTH } = Dimensions.get("window");

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F6F6",
  },

  scrollViewContainer: {
    paddingBottom: 30,
  },

  previewContainer: {
    height: (SCREEN_WIDTH - 18) * (355 / 373),
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

  presetButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },

  contentsInputContainer: {
    minHeight: CONTENTS_INPUT_VIEWPORT_HEIGHT,
    flexDirection: "row",
    alignItems: "stretch",
    paddingHorizontal: 5,
    marginTop: 2,
    marginBottom: 5,
  },
  contentsInput: {
    fontSize: CONTENTS_INPUT_FONT_SIZE,
    lineHeight: CONTENTS_INPUT_LINE_HEIGHT,
    flex: 0.8,
    color: "white",
    ...Platform.select({
      android: { includeFontPadding: false },
      default: {},
    }),
  },

  contentsInputResetButtonContainer: {
    flex: 0.25,
    justifyContent: "center",
    alignItems: "flex-end",
  },

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
  },
  settingsRowLabel: {
    ...uiThemeFontStyle,
    fontSize: 16,
    color: "black",
    fontWeight: "400",
  },

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

  colorPickerContainer: {
    borderBottomWidth: 2,
    borderBottomColor: "#DDDDDD",
  },

  dropdownContainer: {
    width: "55%",
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 24,
    backgroundColor: "#E7E7E7",
  },
  dropdownMenuContainer: {
    paddingVertical: 4,
    paddingBottom: 2,
  },

  dropdownPlaceholderStyle: { ...uiThemeFontStyle },
  dropdownSelectedTextStyle: {
    ...uiThemeFontStyle,
    fontSize: 17,
  },
  dropdownIconStyle: {
    width: 30,
  },

  dropdownItemContainerStyle: {
    borderRadius: 0,
  },
  dropdownItemContent: {
    width: "100%",
  },
  dropdownItemTextStyle: {
    ...uiThemeFontStyle,
    fontSize: 17,
    flexShrink: 1,
  },

  effectContainer: {
    flex: 1,
    gap: 10,
    marginHorizontal: 15,
  },
  effectChipSectionContainer: {
    gap: 10,
    marginHorizontal: 15,
  },
  effectChipWrapRow: {
    flex: 0,
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-start",
    alignSelf: "stretch",
  },

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
  backgroundEffectCard: {
    borderRadius: 10,
    padding: 3,
    borderWidth: 2,
    borderColor: "#BDBDBD",
    width: 92,
    overflow: "hidden",
    backgroundColor: "#FFF",
  },
  backgroundEffectCardSelected: {
    borderColor: "#FF6E00",
  },
  backgroundEffectThumb: {
    width: "100%",
    height: 180,
    aspectRatio: undefined,
  },
});

export const rewardAdModalStyles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 28,
  },
  dim: {
    ...StyleSheet.absoluteFillObject,
  },
  card: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: "#FFFFFF",
    borderRadius: 32,
    paddingTop: 54,
    paddingBottom: 28,
    paddingHorizontal: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
    marginTop: 40,
    position: "relative",
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    backgroundColor: "#EFEFEF",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  appIconContainer: {
    position: "absolute",
    top: -40,
    alignSelf: "center",
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: "#1A1A1A",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  appIconImage: {
    width: "100%",
    height: "100%",
    borderRadius: 20,
  },
  contentContainer: {
    width: "100%",
    alignItems: "center",
  },
  headerBadge: {
    ...uiThemeFontStyle,
    fontSize: 20,
    fontWeight: "bold",
    color: "#1A1A1A",
    textAlign: "center",
    lineHeight: 26,
    marginBottom: 24,
    paddingHorizontal: 10,
  },
  benefitContainer: {
    width: "100%",
    marginBottom: 24,
  },
  benefitRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  checkIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  benefitText: {
    ...uiThemeFontStyle,
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    color: "#333333",
    lineHeight: 21,
  },
  ctaButton: {
    width: "83.18%",
    aspectRatio: 277 / 56,
    alignSelf: "center",
  },
  ctaButtonBg: {
    ...StyleSheet.absoluteFillObject,
  },
  ctaButtonContent: {
    position: "absolute",
    left: "31.39%",
    top: "25%",
    bottom: "25%",
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  ctaPlayBg: {
    height: "100%",
    aspectRatio: 1,
  },
  ctaButtonText: {
    fontSize: 15,
    fontWeight: "600",
    flexShrink: 1,
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

const SLIDER_WIDTH = SCREEN_WIDTH - 100;
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

export const settingsFooterStyles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 24,
    paddingBottom: 24,
    paddingHorizontal: 20,
    gap: 12,
    backgroundColor: "#F9F9F9",
  },
  logo: {
    width: 130,
    height: 36,
  },
  linksRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  linkText: {
    fontSize: 12,
    color: "#666666",
    fontWeight: "500",
  },
  separator: {
    fontSize: 11,
    color: "#CCCCCC",
  },
});

export function resolveDropdownMaxHeight(
  contentHeightPx: number,
  windowHeight: number,
  options?: { capPx?: number; menuPaddingPx?: number },
): number {
  const capPx = options?.capPx ?? 220;
  const menuPaddingPx = options?.menuPaddingPx ?? 6;
  const cap = Math.min(capPx, Math.floor(windowHeight * 0.32));
  if (contentHeightPx <= 0) {
    return cap;
  }
  return Math.min(cap, Math.ceil(contentHeightPx + menuPaddingPx));
}