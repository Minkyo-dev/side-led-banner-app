// components/TextSection.tsx
import { ColorPicker } from "@/components/colorPicker";
import { SliderComponent } from "@/components/slider";
import { textColorPalette } from "@/constants/colorPalette";
import { styles } from "@/constants/styles";
import React from "react";
import { ScrollView, Text, View } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { useSettings } from "../../contexts/settingsContext";

interface TextSectionProps {}

export const TextSection = ({}: TextSectionProps) => {
  // Context fields
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

      {/* text - speed slider */}
      <View
        style={[styles.settingsRow, { borderBottomWidth: 0, marginBottom: 0 }]}
      >
        <Text style={styles.settingsRowLabel} allowFontScaling={false}>
          Speed
        </Text>
        <View style={styles.settingsRowValueContainer}>
          <Text style={styles.settingsRowValue} allowFontScaling={false}>
            {textMoveSpeed}
          </Text>
        </View>
      </View>
      <SliderComponent
        value={textMoveSpeed}
        onChange={setTextMoveSpeed}
        minimumValue={0}
        maximumValue={100}
        step={1}
      />

      {/* text - size slider */}
      <View
        style={[styles.settingsRow, { borderBottomWidth: 0, marginBottom: 0 }]}
      >
        <Text style={styles.settingsRowLabel} allowFontScaling={false}>
          Size
        </Text>
        <View style={styles.settingsRowValueContainer}>
          <Text style={styles.settingsRowValue} allowFontScaling={false}>
            {fontSize}
          </Text>
        </View>
      </View>
      <SliderComponent
        value={fontSize}
        onChange={setFontSize}
        minimumValue={10}
        maximumValue={100}
        step={1}
      />

      {/* text - line spacing slider */}
      <View
        style={[styles.settingsRow, { borderBottomWidth: 0, marginBottom: 0 }]}
      >
        <Text style={styles.settingsRowLabel} allowFontScaling={false}>
          Line Spacing
        </Text>
        <View style={styles.settingsRowValueContainer}>
          <Text style={styles.settingsRowValue} allowFontScaling={false}>
            {lineSpacing}
          </Text>
        </View>
      </View>
      <SliderComponent
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

      {/* text - out line slider */}
      <View
        style={[styles.settingsRow, { borderBottomWidth: 0, marginBottom: 0 }]}
      >
        <Text style={styles.settingsRowLabel} allowFontScaling={false}>
          Out Line
        </Text>
        <View style={styles.settingsRowValueContainer}>
          <Text style={styles.settingsRowValue} allowFontScaling={false}>
            {outLine}
          </Text>
        </View>
      </View>
      <SliderComponent
        value={outLine}
        onChange={setOutLine}
        minimumValue={0}
        maximumValue={100}
        step={1}
      />

      {/* text - drop shadow slider */}
      <View
        style={[styles.settingsRow, { borderBottomWidth: 0, marginBottom: 0 }]}
      >
        <Text style={styles.settingsRowLabel} allowFontScaling={false}>
          Drop Shadow
        </Text>
        <View style={styles.settingsRowValueContainer}>
          <Text style={styles.settingsRowValue} allowFontScaling={false}>
            {dropShadow}
          </Text>
        </View>
      </View>
      <SliderComponent
        value={dropShadow}
        onChange={setDropShadow}
        minimumValue={0}
        maximumValue={100}
        step={1}
      />
    </ScrollView>
  );
};
