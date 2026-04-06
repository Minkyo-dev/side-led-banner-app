// components/TextSection.tsx
import { ColorPicker } from "@/components/colorPicker";
import { textColorPalette } from "@/constants/colorPalette";
import { styles } from "@/constants/styles";
import React from "react";
import { ScrollView, Text, View } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { useSettings } from "../../contexts/settingsContext";
import { SettingsSliderBlock } from "./settingsSliderBlock";

interface TextSectionProps {}

export const TextSection = ({}: TextSectionProps) => {
  const { config, updateConfig, fontItems } = useSettings();
  const { playOption } = config.content;
  const {
    font,
    fontSize,
    lineSpacing,
    textSelectedColor,
    outLine,
    dropShadow,
  } = config.appearance;
  const { textMoveSpeed } = config.motion;
  const setFont = (font: string) => () => updateConfig("appearance", { font });
  const setTextMoveSpeed = (value: number) =>
    updateConfig("motion", { textMoveSpeed: value });
  const setFontSize = (value: number) =>
    updateConfig("appearance", { fontSize: value });
  const setLineSpacing = (value: number) =>
    updateConfig("appearance", { lineSpacing: value });
  const setTextSelectedColor = (color: string) =>
    updateConfig("appearance", { textSelectedColor: color });
  const setOutLine = (value: number) =>
    updateConfig("appearance", { outLine: value });
  const setDropShadow = (value: number) =>
    updateConfig("appearance", { dropShadow: value });
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
          onChange={setFont}
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

      <SettingsSliderBlock
        label="Line Spacing"
        value={lineSpacing}
        onChange={setLineSpacing}
        minimumValue={0}
        maximumValue={100}
        step={1}
        disabled={playOption === "one"}
      />

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
