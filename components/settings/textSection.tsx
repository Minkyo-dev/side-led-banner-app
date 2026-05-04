// components/TextSection.tsx
import { ColorPicker } from "@/components/colorPicker";
import { btnStyles } from "@/constants/btnStyles";
import { textColorPalette } from "@/constants/colorPalette";
import type { AppLocaleKey } from "@/constants/language";
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

  const {
    config,
    updateConfig,
    fontItems,
    updateUI,
    textSectionLabel,
    resolvedAppLocale,
  } = useSettings();
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
  const onAppLanguageChange = (item: { value: string }) =>
    updateUI({ appLanguage: item.value as AppLocaleKey });

  /** Follow device 항목 없음 — `appLanguage === "system"`이면 표시값은 `resolvedAppLocale` */
  const languageDropdownItems = useMemo(
    () => [
      { label: "한국어", value: "ko" as const },
      { label: "English", value: "en" as const },
      { label: "日本語", value: "ja" as const },
      { label: "繁體中文", value: "zhTC" as const },
      { label: "简体中文", value: "zhSC" as const },
    ],
    [],
  );

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollViewContainer}
    >
      <View style={styles.settingsRow}>
        <Text style={styles.settingsRowLabel} allowFontScaling={false}>
          {textSectionLabel("language")}
        </Text>
        <Dropdown
          data={languageDropdownItems}
          labelField="label"
          valueField="value"
          value={resolvedAppLocale}
          onChange={onAppLanguageChange}
          autoScroll={false}
          maxHeight={fontDropdownMaxHeight}
          showsVerticalScrollIndicator
          flatListProps={fontDropdownFlatListProps}
          style={[styles.dropdownContainer, { width: "56%" }]}
          containerStyle={[styles.dropdownContainer, { width: "56%" }]}
          selectedTextStyle={styles.dropdownSelectedTextStyle}
          selectedTextProps={{ allowFontScaling: false }}
          itemContainerStyle={styles.dropdownItemContainerStyle}
          itemTextStyle={styles.dropdownItemTextStyle}
          iconStyle={styles.dropdownIconStyle}
          iconColor="black"
        />
      </View>

      {/* text - font select */}
      <View style={styles.settingsRow}>
        <Text style={styles.settingsRowLabel} allowFontScaling={false}>
          {textSectionLabel("font")}
        </Text>
        <Dropdown
          data={fontItems}
          labelField="label"
          valueField="value"
          placeholder={textSectionLabel("fontPlaceholder")}
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
        label={textSectionLabel("speed")}
        value={textMoveSpeed}
        onChange={setTextMoveSpeed}
        minimumValue={0}
        maximumValue={100}
        step={1}
      />

      <SettingsSliderBlock
        slotId="fontSize"
        label={textSectionLabel("size")}
        value={fontSize}
        onChange={setFontSize}
        minimumValue={10}
        maximumValue={100}
        step={1}
      />
      <SettingsSliderBlock
        label={textSectionLabel("letterSpacing")}
        value={letterSpacing}
        onChange={setLetterSpacing}
        minimumValue={0}
        maximumValue={40}
        step={1}
      />
      {playOption === "multi" ? (
        <SettingsSliderBlock
          label={textSectionLabel("lineSpacing")}
          value={lineSpacing}
          onChange={setLineSpacing}
          minimumValue={0}
          maximumValue={40}
          step={1}
        />
      ) : null}
      

      <View style={styles.settingsRow}>
        <Text style={styles.settingsRowLabel} allowFontScaling={false}>
          {textSectionLabel("viewMode")}
        </Text>
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "flex-end",
            alignItems: "center",
          }}
        >
          <TouchableOpacity
            onPress={() => setOneLineJoinMode("space3")}
            style={[
              btnStyles.effectItemButton,
              oneLineJoinMode === "space3" && btnStyles.effectItemButtonActive,
            ]}
          >
            <Text
              style={[
                btnStyles.effectItemButtonText,
                oneLineJoinMode === "space3" &&
                  btnStyles.effectItemButtonTextActive,
              ]}
              allowFontScaling={false}
            >
              {textSectionLabel("viewModeReset")}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setOneLineJoinMode("concat")}
            style={[
              btnStyles.effectItemButton,
              oneLineJoinMode === "concat" && btnStyles.effectItemButtonActive,
            ]}
          >
            <Text
              style={[
                btnStyles.effectItemButtonText,
                oneLineJoinMode === "concat" &&
                  btnStyles.effectItemButtonTextActive,
              ]}
              allowFontScaling={false}
            >
              {textSectionLabel("viewModeContinuous")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* text - color picker */}
      <View
        style={[styles.settingsRow, { borderBottomWidth: 0, marginBottom: 0 }]}
      >
        <Text style={styles.settingsRowLabel} allowFontScaling={false}>
          {textSectionLabel("color")}
        </Text>
      </View>
      <View style={styles.colorPickerContainer}>
        <ColorPicker
          colorList={textColorPalette}
          selectedColor={textSelectedColor}
          onColorSelect={setTextSelectedColor}
        />
      </View>

      <SettingsSliderBlock
        label={textSectionLabel("outline")}
        value={outLine}
        onChange={setOutLine}
        minimumValue={0}
        maximumValue={100}
        step={1}
      />

      <SettingsSliderBlock
        label={textSectionLabel("dropShadow")}
        value={dropShadow}
        onChange={setDropShadow}
        minimumValue={0}
        maximumValue={100}
        step={1}
      />
    </ScrollView>
  );
};
