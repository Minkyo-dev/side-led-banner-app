import { useMarqueeAnimation } from "@/hooks/useMarqueeAnimation";
import React from "react";
import {
  Modal,
  StatusBar,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import Animated from "react-native-reanimated";

interface LedBannerFullScreenProps {
  visible: boolean;
  onClose: () => void;
  text: string;
  speed: number;
  playOption: "one" | "multi";
  fontSize: number;
  textColor: string;
  backgroundColor: string;
}

export const LedBannerFullScreen = ({
  visible,
  onClose,
  text,
  speed,
  playOption,
  fontSize,
  textColor,
  backgroundColor,
}: LedBannerFullScreenProps) => {
  const {
    displayText,
    animatedStyle,
    onContainerLayout,
    onTextLayout,
    SPACER,
  } = useMarqueeAnimation({ text, speed, playOption });

  return (
    <Modal
      visible={visible}
      animationType="fade"
      supportedOrientations={["portrait", "landscape"]}
      statusBarTranslucent
    >
      <StatusBar hidden />
      <TouchableWithoutFeedback onPress={onClose}>
        <View
          style={{
            flex: 1,
            backgroundColor,
            justifyContent: "center",
            overflow: "hidden",
          }}
          onLayout={onContainerLayout}
        >
          <Animated.View
            style={[
              {
                flexDirection: "row",
                position: "absolute",
                alignItems: "center",
              },
              animatedStyle,
            ]}
          >
            <Text
              style={{ fontSize, color: textColor }}
              onTextLayout={onTextLayout}
            >
              {displayText}
            </Text>
            <View style={{ width: SPACER }} />
            <Text style={{ fontSize, color: textColor }}>
              {displayText}
            </Text>
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};
