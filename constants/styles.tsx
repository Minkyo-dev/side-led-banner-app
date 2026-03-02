import { Dimensions, StyleSheet } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F6F6",
  },
  previewContainer: {
    height: (SCREEN_WIDTH - 18) * (355 / 373),
    padding: 5,
    marginHorizontal: 9,
    backgroundColor: "black",
    borderRadius: 20,
  },
  preview: {
    flex: 0.55,
    borderRadius: 15,
    backgroundColor: "#D9D9D9",
  },
  previewText: {
    textAlign: "left",
    textAlignVertical: "center",
  },
  presetButtonsContainer: {
    flex: 0.15,
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    marginHorizontal: 10,
  },
  contentsInputContainer: {
    flex: 0.3,
    flexDirection: "row",
    marginHorizontal: 10,
    marginTop: 8,
    marginBottom: 11,
  },
  contentsInput: {
    fontSize: 18,
    flex: 0.8,
    color: "white",
  },
  contentsInputResetButtonContainer: {
    flex: 0.2,
    justifyContent: "center",
    alignItems: "center",
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
    // backgroundColor: 'red',
  },
  settingsRowLabel: {
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
    fontSize: 16,
    color: "black",
    fontWeight: "400",
  },
  colorPickerContainer: {
    borderBottomWidth: 2,
    borderBottomColor: "#DDDDDD",
  },
  dropdownContainer: {
    // 드롭다운 컨테이너 스타일
    width: "40%",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 24,
    backgroundColor: "#E7E7E7",
  },
  dropdownPlaceholderStyle: {},
  dropdownSelectedTextStyle: {
    // 선택된 텍스트 스타일
    fontSize: 16,
  },
  dropdownItemContainerStyle: {
    // 아이템 컨테이너 스타일
    borderRadius: 0,
  },
  dropdownItemTextStyle: {
    // 아이템 텍스트 스타일
    fontSize: 16,
  },
  dropdownIconStyle: {
    width: 30,
  },
  slider: {
    flex: 1,
    height: 40,
  },
  effectContainer: {
    flex: 1,
    gap: 10,
    marginHorizontal: 15,
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
});
