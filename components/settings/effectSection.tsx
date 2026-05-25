import { uiThemeFontStyle } from "@/constants/appFonts";
import { btnStyles } from "@/constants/btnStyles";
import {
  DEFAULT_GRADIENT_BACKGROUND_PRESET_ID,
  GRADIENT_BACKGROUND_PRESETS,
} from "@/constants/gradientBackgroundPresets";
import { styles } from "@/constants/styles";
import type { EffectSectionLabelKey } from "@/language/effectSectionLabels";
import React from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";

import { type BannerConfig, useSettings } from "../../contexts/settingsContext";
import {
  SettingsSliderBlock,
  type SettingsSliderBlockProps,
} from "./settingsSliderBlock";

const PRIMARY_EFFECT_CHIP_ROWS = [
  ["Bold", "Blink", "Pixel"],
  ["Glow", "Gradient"],
] as const;

function getSliderPropsForEffect(
  effect: string,
  values: {
    glowIntensity: number;
    blinkSpeed: number;
  },
  setters: {
    setGlowIntensity: (v: number) => void;
    setBlinkSpeed: (v: number) => void;
  },
  tEffect: (key: EffectSectionLabelKey) => string,
): Omit<SettingsSliderBlockProps, "containerStyle"> | null {
  switch (effect) {
    case "Glow":
    case "Pixel Glow":
      return {
        label: tEffect("effectGlowIntensity"),
        value: values.glowIntensity,
        onChange: setters.setGlowIntensity,
        minimumValue: 0,
        maximumValue: 100,
        step: 1,
      };
    case "Blink":
      return {
        label: tEffect("effectBlinkFrequency"),
        value: values.blinkSpeed,
        onChange: setters.setBlinkSpeed,
        minimumValue: 1,
        maximumValue: 10,
        step: 1,
      };
    default:
      return null;
  }
}

export const EffectSection = () => {
  const {
    config,
    updateConfig,
    effectItems,
    effectSectionLabel,
    effectChipLabel,
  } = useSettings();

  const {
    effectSelectedItems,
    effectParamValues,
    gradientBackgroundPreset,
    backgroundEffectPreset,
    glowIntensity,
    blinkSpeed,
  } = config.appearance;

  const fxVals = effectParamValues ?? {};

  const setGlowIntensity = (value: number) =>
    updateConfig("appearance", {
      glowIntensity: value,
      effectParamValues: { ...fxVals, Glow: value },
    });

  const setBlinkSpeed = (value: number) =>
    updateConfig("appearance", {
      blinkSpeed: value,
      effectParamValues: { ...fxVals, Blink: value },
    });

  const setFontWeight = (value: "normal" | "bold") =>
    updateConfig("appearance", { fontWeight: value });

  const values = { glowIntensity, blinkSpeed };
  const setters = {
    setGlowIntensity,
    setBlinkSpeed,
  };
  const pinnedEffectIds = new Set(PRIMARY_EFFECT_CHIP_ROWS.flat());
  const effectChipRows = [
    ...PRIMARY_EFFECT_CHIP_ROWS.map((row) =>
      row.filter((effect) => effectItems.includes(effect)),
    ).filter((row) => row.length > 0),
    ...effectItems
      .filter((effect) => !pinnedEffectIds.has(effect))
      .reduce<string[][]>((rows, effect) => {
        const lastRow = rows.at(-1);
        if (lastRow == null || lastRow.length >= 3) {
          rows.push([effect]);
        } else {
          lastRow.push(effect);
        }
        return rows;
      }, []),
  ];
  const stackedSliderBlocks: {
    key: string;
    props: SettingsSliderBlockProps;
  }[] = [];
  for (const effect of effectItems) {
    if (!effectSelectedItems.includes(effect)) continue;
    const props = getSliderPropsForEffect(
      effect,
      values,
      setters,
      effectSectionLabel,
    );
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
        <Text style={styles.settingsRowLabel} allowFontScaling={false}>
          {effectSectionLabel("effectHeading")}
        </Text>
      </View>

      <View style={styles.effectChipSectionContainer}>
        {effectChipRows.map((row, rowIndex) => (
          <View
            key={`effect-row-${rowIndex}`}
            style={[styles.effectChipWrapRow, { justifyContent: "flex-start" }]}
          >
            {row.map((effect) => (
              <TouchableOpacity
                key={effect}
                style={[
                  btnStyles.effectItemButton,
                  { alignSelf: "flex-start" },
                  effectSelectedItems.includes(effect) &&
                    btnStyles.effectItemButtonActive,
                ]}
                onPress={() => {
                  const isOn = effectSelectedItems.includes(effect);
                  const next = isOn
                    ? effectSelectedItems.filter((e) => e !== effect)
                    : [...effectSelectedItems, effect];

                  if (isOn) {
                    updateConfig("appearance", { effectSelectedItems: next });
                  } else {
                    const fx = fxVals;
                    const patch: Partial<BannerConfig["appearance"]> = {
                      effectSelectedItems: next,
                    };
                    if (effect === "Glow") {
                      patch.glowIntensity = fx.Glow ?? glowIntensity;
                    } else if (effect === "Blink") {
                      patch.blinkSpeed = fx.Blink ?? blinkSpeed;
                    } else if (effect === "Gradient") {
                      patch.gradientBackgroundPreset =
                        gradientBackgroundPreset ??
                        DEFAULT_GRADIENT_BACKGROUND_PRESET_ID;
                    }
                    updateConfig("appearance", patch);
                  }

                  if (effect === "Bold") {
                    setFontWeight(next.includes("Bold") ? "bold" : "normal");
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
                  {effectChipLabel(effect)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>

      {stackedSliderBlocks.length > 0 ? (
        <View style={{ marginTop: 12 }}>
          {stackedSliderBlocks.map(({ key, props }, i) => (
            <SettingsSliderBlock
              key={key}
              slotId={`effect-${key}`}
              {...props}
              containerStyle={{ marginTop: i === 0 ? 0 : 10 }}
            />
          ))}
        </View>
      ) : null}

      {effectSelectedItems.includes("Gradient") ? (
        <View style={{ marginTop: 14, marginHorizontal: 15 }}>
          <Text
            allowFontScaling={false}
            style={[styles.settingsRowLabel, { marginBottom: 8 }]}
          >
            {effectSectionLabel("gradientBackgroundHeading")}
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.effectContainer}
          >
            {GRADIENT_BACKGROUND_PRESETS.map((p) => {
              const selected = gradientBackgroundPreset === p.id;
              return (
                <TouchableOpacity
                  key={p.id}
                  style={[
                    btnStyles.effectItemButton,
                    selected && btnStyles.effectItemButtonActive,
                    { minWidth: 76, paddingVertical: 8 },
                  ]}
                  onPress={() =>
                    updateConfig("appearance", {
                      gradientBackgroundPreset: p.id,
                    })
                  }
                >
                  <Text
                    style={[
                      btnStyles.effectItemButtonText,
                      selected && btnStyles.effectItemButtonTextActive,
                    ]}
                    allowFontScaling={false}
                  >
                    {p.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      ) : null}

      {/* effect - background effect select */}
      <View
        style={[styles.settingsRow, { borderBottomWidth: 0, marginBottom: 0 }]}
      >
        <Text style={styles.settingsRowLabel} allowFontScaling={false}>
          {effectSectionLabel("backgroundEffectHeading")}
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.effectImageContainer}
        contentContainerStyle={{
          flexDirection: "row",
          alignItems: "flex-start",
          gap: 10,
          paddingRight: 5,
          minHeight: 188,
        }}
      >
        <TouchableOpacity
          style={[
            styles.backgroundEffectCard,
            backgroundEffectPreset === "none" &&
              styles.backgroundEffectCardSelected,
          ]}
          onPress={() =>
            updateConfig("appearance", {
              backgroundEffectPreset: "none",
            })
          }
        >
          <View
            style={{
              height: 180,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text
              allowFontScaling={false}
              style={{
                ...uiThemeFontStyle,
                fontSize: 16,
                fontWeight: "400",
                color:
                  backgroundEffectPreset === "none" ? "#FF6E00" : "#000000",
              }}
            >
              {effectSectionLabel("noEffect")}
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.backgroundEffectCard,
            backgroundEffectPreset === "effect1" &&
              styles.backgroundEffectCardSelected,
          ]}
          onPress={() =>
            updateConfig("appearance", {
              backgroundEffectPreset:
                backgroundEffectPreset === "effect1" ? "none" : "effect1",
            })
          }
        >
          <Image
            source={require("@/assets/images/Effect_1_on_L.png")}
            style={[styles.effectImage, styles.backgroundEffectThumb]}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.backgroundEffectCard,
            backgroundEffectPreset === "heartBgA" &&
              styles.backgroundEffectCardSelected,
          ]}
          onPress={() =>
            updateConfig("appearance", {
              backgroundEffectPreset:
                backgroundEffectPreset === "heartBgA" ? "none" : "heartBgA",
            })
          }
        >
          <Image
            source={require("@/assets/images/Heart_BG_B.png")}
            style={[styles.effectImage, styles.backgroundEffectThumb]}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.backgroundEffectCard,
            backgroundEffectPreset === "speechBg1" &&
              styles.backgroundEffectCardSelected,
          ]}
          onPress={() =>
            updateConfig("appearance", {
              backgroundEffectPreset:
                backgroundEffectPreset === "speechBg1" ? "none" : "speechBg1",
            })
          }
        >
          <Image
            source={require("@/assets/images/Speech_BG_1_B.png")}
            style={[styles.effectImage, styles.backgroundEffectThumb]}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.backgroundEffectCard,
            backgroundEffectPreset === "speechBg2" &&
              styles.backgroundEffectCardSelected,
          ]}
          onPress={() =>
            updateConfig("appearance", {
              backgroundEffectPreset:
                backgroundEffectPreset === "speechBg2" ? "none" : "speechBg2",
            })
          }
        >
          <Image
            source={require("@/assets/images/Speech_BG_2_B.png")}
            style={[styles.effectImage, styles.backgroundEffectThumb]}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </ScrollView>
    </ScrollView>
  );
};
