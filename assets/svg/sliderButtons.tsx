import { StyleSheet, View } from "react-native";
import Svg, { Path, Rect } from "react-native-svg";

export const SliderPlusButton = () => {
  return (
    <Svg width="26" height="24" viewBox="0 0 26 24" fill="none">
      <Path
        d="M4 12H20.5"
        stroke="#B4B4B4"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12 4V20.5"
        stroke="#B4B4B4"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export const SliderMinusButton = () => {
  return (
    <Svg width="27" height="24" viewBox="0 0 27 24" fill="none">
      <Path
        d="M5 12H21.5"
        stroke="#B4B4B4"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

type SliderThumbProps = {
  width?: number;
  height?: number;
};

export function SliderThumb({ width = 46, height = 31 }: SliderThumbProps) {
  return (
    <View style={[styles.shadow, { width, height }]}>
      <Svg width={width} height={height} viewBox="0 0 46 31" fill="none">
        <Rect x={4} y={3} width={38} height={23} rx={11.5} fill="white" />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  shadow: {
    alignItems: "center",
    justifyContent: "center",

    // iOS shadow
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.3,
    shadowRadius: 2,

    // Android shadow
    elevation: 4,
  },
});
