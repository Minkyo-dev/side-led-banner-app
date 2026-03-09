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
  const {
    font,
    setFont,
    fontItems,
    textMoveSpeed,
    setTextMoveSpeed,
    fontSize,
    setFontSize,
    textSelectedColor,
    setTextSelectedColor,
    outLine,
    setOutLine,
    dropShadow,
    setDropShadow,
  } = useSettings();

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* text - font select */}
      <View style={styles.settingsRow}>
        <Text style={styles.settingsRowLabel}>Font</Text>
        <Dropdown
          data={fontItems}
          labelField="label"
          valueField="value"
          placeholder="Select font"
          iconColor="black"
          value={font}
          onChange={(item) => setFont(item.value)}
          style={styles.dropdownContainer}
          containerStyle={styles.dropdownContainer}
          selectedTextStyle={styles.dropdownSelectedTextStyle}
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
        <Text style={styles.settingsRowLabel}>Speed</Text>
        <View style={styles.settingsRowValueContainer}>
          <Text style={styles.settingsRowValue}>{textMoveSpeed}</Text>
        </View>
      </View>
      <SliderComponent
        value={textMoveSpeed}
        onChange={setTextMoveSpeed}
        minimumValue={0}
        maximumValue={100}
        step={5}
      />

      {/* text - size slider */}
      <View
        style={[styles.settingsRow, { borderBottomWidth: 0, marginBottom: 0 }]}
      >
        <Text style={styles.settingsRowLabel}>Size</Text>
        <View style={styles.settingsRowValueContainer}>
          <Text style={styles.settingsRowValue}>{fontSize}</Text>
        </View>
      </View>
      <SliderComponent
        value={fontSize}
        onChange={setFontSize}
        minimumValue={10}
        maximumValue={100}
        step={1}
      />

      {/* text - color picker */}
      <View
        style={[styles.settingsRow, { borderBottomWidth: 0, marginBottom: 0 }]}
      >
        <Text>Color</Text>
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
        <Text style={styles.settingsRowLabel}>Out Line</Text>
        <View style={styles.settingsRowValueContainer}>
          <Text style={styles.settingsRowValue}>{outLine}</Text>
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
        <Text style={styles.settingsRowLabel}>Drop Shadow</Text>
        <View style={styles.settingsRowValueContainer}>
          <Text style={styles.settingsRowValue}>{dropShadow}</Text>
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
