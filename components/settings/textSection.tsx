// components/TextSection.tsx
import { ColorPicker } from "@/components/colorPicker";
import { textColorPalette } from "@/constants/colorPalette";
import { styles } from "@/constants/styles";
import React, { useMemo } from "react";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSettings } from "../../contexts/settingsContext";
import { SettingsSliderBlock } from "./settingsSliderBlock";

interface TextSectionProps {}

export const TextSection = ({}: TextSectionProps) => {
  const insets = useSafeAreaInsets();
  const { height: windowH } = useWindowDimensions();
  /** 하단 네비바와 겹치지 않게 최대 높이를 설정 */
  const fontDropdownMaxHeight = useMemo(() => {
    const cap = Math.min(220, windowH * 0.32 - insets.bottom);
    return Math.max(140, cap);
  }, [insets.bottom, windowH]);

  const fontDropdownFlatListProps = useMemo(
    () => ({
      contentContainerStyle: { paddingBottom: insets.bottom + 8 },
    }),
    [insets.bottom],
  );

  const { config, updateConfig, fontItems } = useSettings();
  const { playOption, oneLineJoinMode } = config.content;
  const {
    font,
    fontSize,
    lineSpacing,
    letterSpacing,
    textSelectedColor,
    outLine,
    dropShadow,
  } = config.appearance;
  const { textMoveSpeed } = config.motion;
  const onFontChange = (item: { value: string }) =>
    updateConfig("appearance", { font: item.value });
  const setTextMoveSpeed = (value: number) =>
    updateConfig("motion", { textMoveSpeed: value });
  const setFontSize = (value: number) =>
    updateConfig("appearance", { fontSize: value });
  const setLineSpacing = (value: number) =>
    updateConfig("appearance", { lineSpacing: Math.max(0, value) });
  const setLetterSpacing = (value: number) =>
    updateConfig("appearance", { letterSpacing: Math.max(0, value) });
  const setTextSelectedColor = (color: string) =>
    updateConfig("appearance", { textSelectedColor: color });
  const setOutLine = (value: number) =>
    updateConfig("appearance", { outLine: value });
  const setDropShadow = (value: number) =>
    updateConfig("appearance", { dropShadow: value });
  const setOneLineJoinMode = (value: "space3" | "concat") =>
    updateConfig("content", { oneLineJoinMode: value });
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollViewContainer}
    >
      {/* text - font select */}
      <View style={styles.settingsRow}>
        <Text style={styles.settingsRowLabel} allowFontScaling={false}>
          Font
        </Text>
        <Dropdown
          data={fontItems}
          labelField="label"
          valueField="value"
          placeholder="Select font"
          iconColor="black"
          value={font}
          onChange={onFontChange}
          maxHeight={fontDropdownMaxHeight}
          showsVerticalScrollIndicator
          flatListProps={fontDropdownFlatListProps}
          style={styles.dropdownContainer}
          containerStyle={styles.dropdownContainer}
          selectedTextStyle={styles.dropdownSelectedTextStyle}
          selectedTextProps={{ allowFontScaling: false }}
          itemContainerStyle={styles.dropdownItemContainerStyle}
          itemTextStyle={styles.dropdownItemTextStyle}
          iconStyle={styles.dropdownIconStyle}
          placeholderStyle={styles.dropdownPlaceholderStyle}
        />
      </View>

      <SettingsSliderBlock
        label="Speed"
        value={textMoveSpeed}
        onChange={setTextMoveSpeed}
        minimumValue={0}
        maximumValue={100}
        step={1}
      />

      <SettingsSliderBlock
        label="Size"
        value={fontSize}
        onChange={setFontSize}
        minimumValue={10}
        maximumValue={100}
        step={1}
      />

      {playOption === "multi" ? (
        <SettingsSliderBlock
          label="Line Spacing"
          value={lineSpacing}
          onChange={setLineSpacing}
          minimumValue={0}
          maximumValue={40}
          step={1}
        />
      ) : null}
      <SettingsSliderBlock
        label="Letter Spacing"
        value={letterSpacing}
        onChange={setLetterSpacing}
        minimumValue={0}
        maximumValue={40}
        step={1}
      />

      <View style={styles.settingsRow}>
        <Text style={styles.settingsRowLabel} allowFontScaling={false}>
          View Mode
        </Text>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <TouchableOpacity
            onPress={() => setOneLineJoinMode("space3")}
            style={[
              styles.settingsRowValueContainer,
              oneLineJoinMode === "space3" && { backgroundColor: "#D0D0D0" },
            ]}
          >
            <Text style={styles.settingsRowValue} allowFontScaling={false}>
              Style A
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setOneLineJoinMode("concat")}
            style={[
              styles.settingsRowValueContainer,
              oneLineJoinMode === "concat" && { backgroundColor: "#D0D0D0" },
            ]}
          >
            <Text style={styles.settingsRowValue} allowFontScaling={false}>
              Style B
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* text - color picker */}
      <View
        style={[styles.settingsRow, { borderBottomWidth: 0, marginBottom: 0 }]}
      >
        <Text allowFontScaling={false}>Color</Text>
      </View>
      <View style={styles.colorPickerContainer}>
        <ColorPicker
          colorList={textColorPalette}
          selectedColor={textSelectedColor}
          onColorSelect={setTextSelectedColor}
        />
      </View>

      <SettingsSliderBlock
        label="Out Line"
        value={outLine}
        onChange={setOutLine}
        minimumValue={0}
        maximumValue={100}
        step={1}
      />

      <SettingsSliderBlock
        label="Drop Shadow"
        value={dropShadow}
        onChange={setDropShadow}
        minimumValue={0}
        maximumValue={100}
        step={1}
      />
    </ScrollView>
  );
};
