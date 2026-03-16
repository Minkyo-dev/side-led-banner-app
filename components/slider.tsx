import { StyleSheet, Text, TouchableOpacity } from "react-native";

import Slider from "@react-native-community/slider";
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
        <Text style={styles.sliderButtonText}>−</Text>
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
        thumbImage={require("@/assets/images/sliderThumbButton.png")}
      />
      <TouchableOpacity
        style={styles.sliderButton}
        onPress={() => onChange(Math.min(maximumValue, value + step))}
      >
        <Text style={styles.sliderButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  sliderContainer: {
    height: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    // paddingVertical: 10,
    paddingTop: 15,
    paddingBottom: 30,
    marginBottom: 5,
    borderBottomWidth: 2,
    borderBottomColor: "#DDDDDD",
    // backgroundColor: 'blue',
  },
  slider: {
    flex: 1,
    height: 40,
    paddingTop: 4,
  },
  sliderButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  sliderButtonText: {
    fontSize: 30,
    color: "#B4B4B4",
    fontWeight: "400",
  },
});
