import { TouchableOpacity } from "react-native";

import {
  SliderMinusButton,
  SliderPlusButton
} from "@/assets/svg/sliderButtons";
import { sliderComponentStyles as styles } from "@/constants/styles";
import { Slider } from "@miblanchard/react-native-slider";
import { View } from "react-native";

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
        <SliderMinusButton />
      </TouchableOpacity>
      <Slider
        animateTransitions
        disabled={disabled}
        trackClickable={true}
        trackStyle={styles.sliderTrack}
        thumbStyle={styles.sliderThumb}
        maximumValue={maximumValue}
        minimumValue={minimumValue}
        value={value}
        onValueChange={(value) => onChange(Math.round(value))}
        minimumTrackTintColor="#FF6E00"
        // renderThumbComponent={() => <SliderThumb />}
      />
      <TouchableOpacity
        style={styles.sliderButton}
        onPress={() => onChange(Math.min(maximumValue, value + step))}
      >
        <SliderPlusButton />
      </TouchableOpacity>
    </View>
  );
};
