import { PixelatedBackdrop } from "@/components/PixelatedBackdrop";
import { BannerConfig } from "@/contexts/settingsContext";
import { useBlinkOpacityStyle } from "@/hooks/useBlinkOpacityStyle";
import { useMarqueeAnimation } from "@/hooks/useMarqueeAnimation";
import React, { useMemo, useRef } from "react";
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
  const pixelCaptureRef = useRef<View>(null);
  const { previewText, playOption } = config.content;
  const {
    fontSize,
    textSelectedColor,
    lineSpacing,
    fontWeight,
    blurIntensity,
    effectSelectedItem,
    blinkSpeed,
    pixelBlockSize,
  } = config.appearance;

  const blinkStyle = useBlinkOpacityStyle(
    effectSelectedItem === "Blink",
    blinkSpeed,
  );
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
    playOption,
  });

  const blurShadowStyle = useMemo(() => {
    if (blurIntensity <= 0) return {};
    const amount = 0.1;
    const num = parseInt(textSelectedColor.replace("#", ""), 16);
    const r = num >> 16;
    const g = (num >> 8) & 0x00ff;
    const b = num & 0x0000ff;
    const newR = Math.round(r + (255 - r) * amount);
    const newG = Math.round(g + (255 - g) * amount);
    const newB = Math.round(b + (255 - b) * amount);
    return {
      textShadowColor: `rgb(${newR}, ${newG}, ${newB})`,
      textShadowRadius: blurIntensity,
    };
  }, [textSelectedColor, blurIntensity]);

  return (
    <Modal
      visible={visible}
      animationType="fade"
      supportedOrientations={["portrait", "landscape"]}
      statusBarTranslucent
    >
      <StatusBar hidden />
      <TouchableWithoutFeedback onPress={onClose}>
        <PixelatedBackdrop
          active={effectSelectedItem === "Pixel"}
          pixelSize={pixelBlockSize}
          captureRef={pixelCaptureRef}
          style={{ flex: 1 }}
        >
          <View
            ref={pixelCaptureRef}
            collapsable={false}
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
                blinkStyle,
              ]}
            >
            {[...Array(10)].map((_, i) => (
              <React.Fragment key={i}>
                <Text
                  style={{
                    fontSize,
                    color: textSelectedColor,
                    lineHeight: fontSize * (1.2 + lineSpacing / 100),
                    fontWeight,
                    ...blurShadowStyle,
                  }}
                  onTextLayout={onTextLayout}
                  allowFontScaling={false}
                >
                  {displayText}
                </Text>
                <View style={{ width: SPACER }} />
              </React.Fragment>
            ))}
            </Animated.View>
          </View>
        </PixelatedBackdrop>
      </TouchableWithoutFeedback>
    </Modal>
  );
};
