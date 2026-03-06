import { ColorPicker } from "@/components/colorPicker";
import { SliderComponent } from "@/components/slider";
import { backgroundColorPalette } from "@/constants/colorPalette";
import { styles } from "@/constants/styles";
import React from "react";
import { Text, View } from "react-native";
import { useSettings } from "../../contexts/settingsContext";

interface BackgroundSectionProps {
  onLayout: (e: any) => void;
}

export const BackgroundSection = ({ onLayout }: BackgroundSectionProps) => {
  // Context fields
  const {
    backgroundColor, setBackgroundColor,
    backgroundBlur, setBackgroundBlur
  } = useSettings();

  return (
    <View onLayout={onLayout}>
      {/* background - color picker */}
      <View style={[styles.settingsRow, { borderBottomWidth: 0, marginBottom: 0 }]}>
        <Text style={styles.settingsRowLabel}>Background</Text>
      </View>
      <View style={styles.colorPickerContainer}>
        <ColorPicker
          colorList={backgroundColorPalette}
          selectedColor={backgroundColor}
          onColorSelect={setBackgroundColor}
        />
      </View>

      {/* background - blur slider */}
      <View style={[styles.settingsRow, { borderBottomWidth: 0, marginBottom: 0 }]}>
        <Text style={styles.settingsRowLabel}>Background Blur</Text>
        <View style={styles.settingsRowValueContainer}>
          <Text style={styles.settingsRowValue}>{backgroundBlur}</Text>
        </View>
      </View>
      <SliderComponent
        value={backgroundBlur}
        onChange={setBackgroundBlur}
        minimumValue={0}
        maximumValue={100}
        step={1}
      />
    </View>
  );
};