import { btnStyles } from "@/constants/btnStyles";
import { styles } from "@/constants/styles";
import React from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";

import { useSettings } from "../../contexts/settingsContext";
import {
  SettingsSliderBlock,
  type SettingsSliderBlockProps,
} from "./settingsSliderBlock";

interface EffectSectionProps {}

export const EffectSection = ({}: EffectSectionProps) => {
  const { config, updateConfig, effectItems } = useSettings();

  const {
    effectSelectedItem,
    blurIntensity,
    glowIntensity,
    blinkSpeed,
    pixelBlockSize,
  } = config.appearance;

  const setEffectSelectedItem = (effect: string) =>
    updateConfig("appearance", { effectSelectedItem: effect });

  const setBlurIntensity = (value: number) =>
    updateConfig("appearance", { blurIntensity: value });

  const setGlowIntensity = (value: number) =>
    updateConfig("appearance", { glowIntensity: value });

  const setBlinkSpeed = (value: number) =>
    updateConfig("appearance", { blinkSpeed: value });

  const setPixelBlockSize = (value: number) =>
    updateConfig("appearance", { pixelBlockSize: value });

  const setFontWeight = (value: "normal" | "bold") =>
    updateConfig("appearance", { fontWeight: value });

  const getEffectSliderProps =
    (): Omit<SettingsSliderBlockProps, "containerStyle"> | null => {
      switch (effectSelectedItem) {
        case "Blur":
          return {
            label: "Blur Intensity",
            value: blurIntensity,
            onChange: setBlurIntensity,
            minimumValue: 0,
            maximumValue: 100,
            step: 1,
          };
        case "Glow":
        case "Pixel Glow":
          return {
            label: "Glow Intensity",
            value: glowIntensity,
            onChange: setGlowIntensity,
            minimumValue: 0,
            maximumValue: 100,
            step: 1,
          };
        case "Blink":
          return {
            label: "Blink frequency",
            value: blinkSpeed,
            onChange: setBlinkSpeed,
            minimumValue: 1,
            maximumValue: 10,
            step: 1,
          };
        case "Pixel":
          return {
            label: "Pixel block size",
            value: pixelBlockSize,
            onChange: setPixelBlockSize,
            minimumValue: 2,
            maximumValue: 24,
            step: 1,
          };
        default:
          return null;
      }
    };

  const effectSliderProps = getEffectSliderProps();

  return (
    <ScrollView
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
              effectSelectedItem === effect && btnStyles.effectItemButtonActive,
            ]}
            onPress={() => {
              const isSame = effectSelectedItem === effect;

              setEffectSelectedItem(isSame ? "" : effect);

              if (effect === "Bold") {
                setFontWeight(isSame ? "normal" : "bold");
              }
            }}
          >
            <Text
              style={[
                btnStyles.effectItemButtonText,
                effectSelectedItem === effect &&
                  btnStyles.effectItemButtonTextActive,
              ]}
              allowFontScaling={false}
            >
              {effect}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {effectSliderProps ? (
        <SettingsSliderBlock
          {...effectSliderProps}
          containerStyle={{ marginTop: 12 }}
        />
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
