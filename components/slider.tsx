import { Text, TouchableOpacity } from "react-native";

import Slider from "@react-native-community/slider";
import { View } from "react-native";
import { sliderComponentStyles as styles } from "@/constants/styles";

export const SliderComponent = ({
  value,
  onChange,
  minimumValue = 0,
  maximumValue = 100,
  step = 5,
  disabled = false,
}: {
  value: number;
  onChange: (value: number) => void;
  minimumValue: number;
  maximumValue: number;
  step: number;
  disabled?: boolean;
}) => {
  return (
    <View style={styles.sliderContainer}>
      <TouchableOpacity
        style={styles.sliderButton}
        onPress={() => onChange(Math.max(minimumValue, value - step))}
      >
        <Text style={styles.sliderButtonText} allowFontScaling={false}>
          −
        </Text>
      </TouchableOpacity>
      <Slider
        disabled={disabled}
        style={styles.slider}
        minimumValue={minimumValue}
        maximumValue={maximumValue}
        value={value}
        onValueChange={(value: number) => {
          onChange(Math.round(value));
        }}
        minimumTrackTintColor="#FF6E00"
        maximumTrackTintColor="#8F8D8A"
        thumbImage={require("@/assets/images/sliderThumbBtn.png")}
      />
      <TouchableOpacity
        style={styles.sliderButton}
        onPress={() => onChange(Math.min(maximumValue, value + step))}
      >
        <Text style={styles.sliderButtonText} allowFontScaling={false}>
          +
        </Text>
      </TouchableOpacity>
    </View>
  );
};

