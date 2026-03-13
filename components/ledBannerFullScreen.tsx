import { BannerConfig } from "@/contexts/settingsContext";
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
  config: BannerConfig;
}

export const LedBannerFullScreen = ({
  visible,
  onClose,
  config,
}: LedBannerFullScreenProps) => {
  const { previewText, playOption } = config.content;
  const { fontSize, textSelectedColor, outLine, dropShadow, font } = config.appearance;
  const { backgroundColor } = config.background;
  const { textMoveSpeed } = config.motion;
  const {
    displayText,
    animatedStyle,
    onContainerLayout,
    onTextLayout,
    SPACER,
  } = useMarqueeAnimation({
    text: previewText, 
    speed: textMoveSpeed, 
    playOption});

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
            justifyContent: "flex-start",
            overflow: "hidden",
          }}
          onLayout={onContainerLayout}
        >
          <Animated.View
            style={[
              {
                flexDirection: "row",
                position: "absolute",
                top: 0,
                bottom: 0,
                alignItems: "center",
              },
              animatedStyle,
            ]}
          >
            <Text
              style={{ fontSize, color: textSelectedColor }}
              onTextLayout={onTextLayout}
            >
              {displayText}
            </Text>
            <View style={{ width: SPACER }} />
            <Text style={{ fontSize, color: textSelectedColor }}>{displayText}</Text>
            <View style={{ width: SPACER }} />
            <Text style={{ fontSize, color: textSelectedColor }}>{displayText}</Text>
            <View style={{ width: SPACER }} />
            <Text style={{ fontSize, color: textSelectedColor }}>{displayText}</Text>
            <View style={{ width: SPACER }} />
            <Text style={{ fontSize, color: textSelectedColor }}>{displayText}</Text>
            <View style={{ width: SPACER }} />
            <Text style={{ fontSize, color: textSelectedColor }}>{displayText}</Text>
            <View style={{ width: SPACER }} />
            <Text style={{ fontSize, color: textSelectedColor }}>{displayText}</Text>
            <View style={{ width: SPACER }} />
            <Text style={{ fontSize, color: textSelectedColor }}>{displayText}</Text>
            <View style={{ width: SPACER }} />
            <Text style={{ fontSize, color: textSelectedColor }}>{displayText}</Text>
            <View style={{ width: SPACER }} />
            <Text style={{ fontSize, color: textSelectedColor }}>{displayText}</Text>
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};
