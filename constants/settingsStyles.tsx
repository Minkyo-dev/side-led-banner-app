import { uiThemeFontStyle } from "@/constants/appFonts";
import { StyleSheet } from "react-native";

export const settingsStyles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 18,
  },
  headerInline: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 18,
    gap: 8,
  },
  backButton: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginLeft: 4,
  },
  titleText: {
    ...uiThemeFontStyle,
    fontSize: 22,
    fontWeight: "700",
    color: "black",
  },
  rootLinkText: {
    ...uiThemeFontStyle,
    fontSize: 16,
    color: "#2A7BE4",
    fontWeight: "500",
  },
  /** Settings 루트 페이지의 App Version 값 텍스트 */
  versionValueText: {
    ...uiThemeFontStyle,
    fontSize: 16,
    color: "#787878",
    fontWeight: "400",
  },
});

/** Open Source Info 스크린*/
export const openSourceInfoStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 15,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#DDDDDD",
    gap: 12,
  },
  nameText: {
    ...uiThemeFontStyle,
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    color: "black",
  },
  versionText: {
    ...uiThemeFontStyle,
    fontSize: 14,
    fontWeight: "400",
    color: "#9A9A9A",
  },
});

const SUNNY_LIST_THUMBNAIL_SIZE = 44;

export const sunnyListStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#DDDDDD",
    gap: 14,
  },
  thumbnail: {
    width: SUNNY_LIST_THUMBNAIL_SIZE,
    height: SUNNY_LIST_THUMBNAIL_SIZE,
    borderRadius: 10,
    backgroundColor: "#E7E7E7",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  thumbnailImage: {
    width: "100%",
    height: "100%",
  },
  thumbnailPlaceholderText: {
    ...uiThemeFontStyle,
    fontSize: 20,
    fontWeight: "700",
    color: "#9A9A9A",
  },
  appName: {
    ...uiThemeFontStyle,
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
    color: "black",
  },
  linkText: {
    ...uiThemeFontStyle,
    fontSize: 15,
    color: "#9A9A9A",
    fontWeight: "500",
  },
});
