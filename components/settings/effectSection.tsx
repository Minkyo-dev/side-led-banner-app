import { btnStyles } from "@/constants/btnStyles";
import { styles } from "@/constants/styles";
import React from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";

import { useSettings } from "../../contexts/settingsContext";
import { SliderComponent } from "../slider";

interface EffectSectionProps {}

export const EffectSection = ({}: EffectSectionProps) => {
  const { config, updateConfig, effectItems } = useSettings();

  const {
    effectSelectedItem,
    blurIntensity,
    glowIntensity,
    blinkSpeed,
    fontWeight,
  } = config.appearance;

  const setEffectSelectedItem = (effect: string) =>
    updateConfig("appearance", { effectSelectedItem: effect });

  const setBlurIntensity = (value: number) =>
    updateConfig("appearance", { blurIntensity: value });

  const setGlowIntensity = (value: number) =>
    updateConfig("appearance", { glowIntensity: value });

  const setBlinkSpeed = (value: number) =>
    updateConfig("appearance", { blinkSpeed: value });
const setFontWeight = (value:  "normal" | "bold") =>
    updateConfig("appearance", { fontWeight: value });

  const renderEffectSlider = () => {
    switch (effectSelectedItem) {
      
      case "Blur":
        return (
          <View style={{ marginTop: 12 }}>
            <View
              style={[
                styles.settingsRow,
                { borderBottomWidth: 0, marginBottom: 0 },
              ]}
            >
              <Text allowFontScaling={false}>Blur Intensity</Text>
              <Text allowFontScaling={false}>{blurIntensity}</Text>
            </View>
            <SliderComponent
              value={blurIntensity}
              onChange={setBlurIntensity}
              minimumValue={0}
              maximumValue={100}
              step={1}
            />
          </View>
        );

      case "Glow":
      case "Pixel Glow":
        return (
          <View style={{ marginTop: 12 }}>
            <View
              style={[
                styles.settingsRow,
                { borderBottomWidth: 0, marginBottom: 0 },
              ]}
            >
              <Text allowFontScaling={false}>Glow Intensity</Text>
              <Text allowFontScaling={false}>{glowIntensity}</Text>
            </View>
            <SliderComponent
              value={glowIntensity}
              onChange={setGlowIntensity}
              minimumValue={0}
              maximumValue={100}
              step={1}
            />
          </View>
        );

      case "Blink":
        return (
          <View style={{ marginTop: 12 }}>
            <View
              style={[
                styles.settingsRow,
                { borderBottomWidth: 0, marginBottom: 0 },
              ]}
            >
              <Text allowFontScaling={false}>Blink Speed</Text>
              <Text allowFontScaling={false}>{blinkSpeed}</Text>
            </View>
            <SliderComponent
              value={blinkSpeed}
              onChange={setBlinkSpeed}
              minimumValue={1}
              maximumValue={10}
              step={1}
            />
          </View>
        );

      default:
        return null;
    }
  };

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

  // 1. 선택 toggle
  setEffectSelectedItem(isSame ? "" : effect);

  // 2. bold 처리
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

      {renderEffectSlider()}

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