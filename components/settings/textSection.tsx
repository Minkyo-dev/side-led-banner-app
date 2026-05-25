// components/TextSection.tsx
import { ColorPicker } from "@/components/colorPicker";
import { btnStyles } from "@/constants/btnStyles";
import { textColorPalette } from "@/constants/colorPalette";
import { styles } from "@/constants/styles";
import React, { useCallback, useMemo, useState } from "react";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { normalizeOneLineJoinMode } from "@/utils/viewMode";
import { useSettings } from "../../contexts/settingsContext";
import { SettingsSliderBlock } from "./settingsSliderBlock";

export const TextSection = () => {
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

  /** 폰트 라벨 중 가장 긴 텍스트 폭에 맞춰 드롭다운 폭을 자동 산출(두 줄 줄바꿈 방지) */
  const [maxFontLabelWidth, setMaxFontLabelWidth] = useState(0);
  const onFontLabelLayout = useCallback(
    (e: { nativeEvent: { layout: { width: number } } }) => {
      const w = e.nativeEvent.layout.width;
      setMaxFontLabelWidth((prev) => (w > prev ? w : prev));
    },
    [],
  );
  const fontDropdownWidth = useMemo(() => {
    if (!maxFontLabelWidth) return undefined;
    const ICON_WIDTH = 30; // dropdownIconStyle.width
    const HORIZONTAL_PADDING = 10 * 2; // dropdownContainer.paddingHorizontal
    const BUFFER = 8;
    return Math.ceil(maxFontLabelWidth) + ICON_WIDTH + HORIZONTAL_PADDING + BUFFER;
  }, [maxFontLabelWidth]);

  const {
    config,
    updateConfig,
    fontItems,
    textSectionLabel,
  } = useSettings();
  const { playOption, oneLineJoinMode: oneLineJoinModeRaw } = config.content;
  const oneLineJoinMode = normalizeOneLineJoinMode(oneLineJoinModeRaw);
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
  const setOneLineJoinMode = (value: "space6" | "lineClear") =>
    updateConfig("content", { oneLineJoinMode: value });

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollViewContainer}
    >
      {/* text - font select */}
      <View style={styles.settingsRow}>
        <Text style={styles.settingsRowLabel} allowFontScaling={false}>
          {textSectionLabel("font")}
        </Text>
        {/* 가장 긴 라벨 폭을 알아내기 위한 투명 view */}
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            opacity: 0,
            height: 0,
            overflow: "hidden",
          }}
        >
          {fontItems.map((item) => (
            <Text
              key={item.value}
              style={styles.dropdownItemTextStyle}
              allowFontScaling={false}
              onLayout={onFontLabelLayout}
            >
              {item.label}
            </Text>
          ))}
        </View>
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
          style={[
            styles.dropdownContainer,
            fontDropdownWidth ? { width: fontDropdownWidth } : null,
          ]}
          containerStyle={[
            styles.dropdownContainer,
            fontDropdownWidth ? { width: fontDropdownWidth } : null,
          ]}
          selectedTextStyle={styles.dropdownSelectedTextStyle}
          selectedTextProps={{ allowFontScaling: false, numberOfLines: 1 }}
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
        minimumValue={20}
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
            onPress={() => setOneLineJoinMode("space6")}
            style={[
              btnStyles.effectItemButton,
              oneLineJoinMode === "space6" && btnStyles.effectItemButtonActive,
            ]}
          >
            <Text
              style={[
                btnStyles.effectItemButtonText,
                oneLineJoinMode === "space6" &&
                  btnStyles.effectItemButtonTextActive,
              ]}
              allowFontScaling={false}
            >
              {textSectionLabel("viewModeReset")}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setOneLineJoinMode("lineClear")}
            style={[
              btnStyles.effectItemButton,
              oneLineJoinMode === "lineClear" &&
                btnStyles.effectItemButtonActive,
            ]}
          >
            <Text
              style={[
                btnStyles.effectItemButtonText,
                oneLineJoinMode === "lineClear" &&
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
