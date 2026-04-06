import { ColorPicker } from "@/components/colorPicker";
import { backgroundColorPalette } from "@/constants/colorPalette";
import { styles } from "@/constants/styles";
import React from "react";
import { ScrollView, Text, View } from "react-native";
import { useSettings } from "../../contexts/settingsContext";
import { SettingsSliderBlock } from "./settingsSliderBlock";

interface BackgroundSectionProps {}

export const BackgroundSection = ({}: BackgroundSectionProps) => {
  // Context fields
  const { config, updateConfig } = useSettings();
  const { backgroundColor, backgroundBlur } = config.background;
  const setBackgroundColor = (color: string) =>
    updateConfig("background", { backgroundColor: color });
  const setBackgroundBlur = (value: number) =>
    updateConfig("background", { backgroundBlur: value });
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollViewContainer}
    >
      {/* background - color picker */}
      <View
        style={[styles.settingsRow, { borderBottomWidth: 0, marginBottom: 0 }]}
      >
        <Text style={styles.settingsRowLabel} allowFontScaling={false}>
          Background
        </Text>
      </View>
      <View style={styles.colorPickerContainer}>
        <ColorPicker
          colorList={backgroundColorPalette}
          selectedColor={backgroundColor}
          onColorSelect={setBackgroundColor}
        />
      </View>

      <SettingsSliderBlock
        label="Background Blur"
        value={backgroundBlur}
        onChange={setBackgroundBlur}
        minimumValue={0}
        maximumValue={100}
        step={1}
      />
    </ScrollView>
  );
};
