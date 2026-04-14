import { ColorPicker } from "@/components/colorPicker";
import { btnStyles } from "@/constants/btnStyles";
import { textColorPalette } from "@/constants/colorPalette";
import { styles } from "@/constants/styles";
import React from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";

import { useSettings } from "../../contexts/settingsContext";
import {
  SettingsSliderBlock,
  type SettingsSliderBlockProps,
} from "./settingsSliderBlock";

interface EffectSectionProps {}

function getSliderPropsForEffect(
  effect: string,
  values: {
    blurIntensity: number;
    glowIntensity: number;
    blinkSpeed: number;
    pixelSize: number;
  },
  setters: {
    setBlurIntensity: (v: number) => void;
    setGlowIntensity: (v: number) => void;
    setBlinkSpeed: (v: number) => void;
    setPixelSize: (v: number) => void;
  },
): Omit<SettingsSliderBlockProps, "containerStyle"> | null {
  switch (effect) {
    case "Blur":
      return {
        label: "Blur Intensity",
        value: values.blurIntensity,
        onChange: setters.setBlurIntensity,
        minimumValue: 0,
        maximumValue: 100,
        step: 1,
      };
    case "Glow":
    case "Pixel Glow":
      return {
        label: "Glow Intensity",
        value: values.glowIntensity,
        onChange: setters.setGlowIntensity,
        minimumValue: 0,
        maximumValue: 100,
        step: 1,
      };
    case "Blink":
      return {
        label: "Blink frequency",
        value: values.blinkSpeed,
        onChange: setters.setBlinkSpeed,
        minimumValue: 1,
        maximumValue: 10,
        step: 1,
      };
    case "Pixel":
      return {
        label: "Pixel block size",
        value: values.pixelSize,
        onChange: setters.setPixelSize,
        minimumValue: 2,
        maximumValue: 24,
        step: 1,
      };
    default:
      return null;
  }
}

export const EffectSection = ({}: EffectSectionProps) => {
  const { config, updateConfig, effectItems } = useSettings();

  const {
    effectSelectedItems,
    blurIntensity,
    glowIntensity,
    glowColor,
    blinkSpeed,
    pixelSize,
  } = config.appearance;

  const setBlurIntensity = (value: number) =>
    updateConfig("appearance", { blurIntensity: value });

  const setGlowIntensity = (value: number) =>
    updateConfig("appearance", { glowIntensity: value });

  const setGlowColor = (color: string) =>
    updateConfig("appearance", { glowColor: color });

  const setBlinkSpeed = (value: number) =>
    updateConfig("appearance", { blinkSpeed: value });

  const setPixelSize = (value: number) =>
    updateConfig("appearance", { pixelSize: value });

  const setFontWeight = (value: "normal" | "bold") =>
    updateConfig("appearance", { fontWeight: value });

  const values = { blurIntensity, glowIntensity, blinkSpeed, pixelSize };
  const setters = {
    setBlurIntensity,
    setGlowIntensity,
    setBlinkSpeed,
    setPixelSize,
  };
  const stackedSliderBlocks: { key: string; props: SettingsSliderBlockProps }[] =
    [];
  for (const effect of effectItems) {
    if (!effectSelectedItems.includes(effect)) continue;
    const props = getSliderPropsForEffect(effect, values, setters);
    if (!props) continue;
    stackedSliderBlocks.push({ key: effect, props });
  }

  return (
    <ScrollView
      id="effectSection"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollViewContainer}
    >
      {/* effect - effect select */}
      <View
        style={[styles.settingsRow, { borderBottomWidth: 0, marginBottom: 0 }]}
      >
        <Text allowFontScaling={false}>Effect</Text>
      </View>

      <ScrollView
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        style={styles.effectContainer}
      >
        {effectItems.map((effect, index) => (
          <TouchableOpacity
            key={`effect-item-${index}`}
            style={[
              btnStyles.effectItemButton,
              effectSelectedItems.includes(effect) &&
                btnStyles.effectItemButtonActive,
            ]}
            onPress={() => {
              const isOn = effectSelectedItems.includes(effect);
              const next = isOn
                ? effectSelectedItems.filter((e) => e !== effect)
                : [...effectSelectedItems, effect];

              updateConfig("appearance", { effectSelectedItems: next });

              if (effect === "Bold") {
                setFontWeight(next.includes("Bold") ? "bold" : "normal");
              }

              if (next.length === 0) {
                updateConfig("motion", { textMoveSpeed: 0 });
              }
            }}
          >
            <Text
              style={[
                btnStyles.effectItemButtonText,
                effectSelectedItems.includes(effect) &&
                  btnStyles.effectItemButtonTextActive,
              ]}
              allowFontScaling={false}
            >
              {effect}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {effectSelectedItems.includes("Glow") ? (
        <>
          <View
            style={[
              styles.settingsRow,
              { borderBottomWidth: 0, marginBottom: 0, marginTop: 12 },
            ]}
          >
            <Text allowFontScaling={false}>Glow color</Text>
          </View>
          <View style={styles.colorPickerContainer}>
            <ColorPicker
              colorList={textColorPalette}
              selectedColor={glowColor}
              onColorSelect={setGlowColor}
            />
          </View>
        </>
      ) : null}

      {stackedSliderBlocks.length > 0 ? (
        <View style={{ marginTop: 12 }}>
          {stackedSliderBlocks.map(({ key, props }, i) => (
            <SettingsSliderBlock
              key={key}
              {...props}
              containerStyle={{ marginTop: i === 0 ? 0 : 10 }}
            />
          ))}
        </View>
      ) : null}

      {/* effect - background effect select */}
      <View
        style={[styles.settingsRow, { borderBottomWidth: 0, marginBottom: 0 }]}
      >
        <Text allowFontScaling={false}>Background Effect</Text>
      </View>

      <ScrollView
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        style={styles.effectImageContainer}
      >
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num, index) => (
          <Image
            key={`effect-image-${index}`}
            source={require("@/assets/images/effectSample.png")}
            style={styles.effectImage}
          />
        ))}
      </ScrollView>
    </ScrollView>
  );
};
