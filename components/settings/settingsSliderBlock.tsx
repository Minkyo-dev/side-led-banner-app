import { SliderComponent } from "@/components/slider";
import { styles } from "@/constants/styles";
import React from "react";
import { StyleProp, Text, View, ViewStyle } from "react-native";

const rowNoBottomBorder: ViewStyle = {
  borderBottomWidth: 0,
  marginBottom: 0,
};

export type SettingsSliderBlockProps = {
  label: string;
  value: number;
  onChange: (value: number) => void;
  minimumValue: number;
  maximumValue: number;
  step?: number;
  /** false : 슬라이더 렌더 X*/
  showSlider?: boolean;
  disabled?: boolean;
  /** 라벨 + 슬라이더 묶음 스타일 지정하려면*/
  containerStyle?: StyleProp<ViewStyle>;
};

/**
 * text, effect등 설정 패널용 라벨과 숫자행과 슬라이더 묶음 컴포넌트
 */
export function SettingsSliderBlock({
  label,
  value,
  onChange,
  minimumValue,
  maximumValue,
  step = 1,
  showSlider = true,
  disabled = false,
  containerStyle,
}: SettingsSliderBlockProps) {
  return (
    <View style={containerStyle}>
      <View style={[styles.settingsRow, rowNoBottomBorder]}>
        <Text style={styles.settingsRowLabel} allowFontScaling={false}>
          {label}
        </Text>
        <View style={styles.settingsRowValueContainer}>
          <Text style={styles.settingsRowValue} allowFontScaling={false}>
            {value}
          </Text>
        </View>
      </View>
      {showSlider ? (
        <SliderComponent
          value={value}
          onChange={onChange}
          minimumValue={minimumValue}
          maximumValue={maximumValue}
          step={step}
          disabled={disabled}
        />
      ) : null}
    </View>
  );
}
