import { LinearGradient as LinearGradientExpo } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  Text,
  TextInput,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import type { AnimatedStyle } from "react-native-reanimated";
import Animated from "react-native-reanimated";

import { btnStyles } from "@/constants/btnStyles";
import { styles } from "@/constants/styles";

type LayoutEvent = {
  nativeEvent: { layout: { height: number; width: number } };
};

type TextLayoutEvent = {
  nativeEvent: { lines: { width: number }[] };
};

type PreviewTheme = {
  backgroundColor: string;
  previewTextStyles: TextStyle;
  playOption: "one" | "multi"
};

type MarqueeProps = {
  displayText: string;
  animatedStyle: AnimatedStyle<ViewStyle>;
  onTextLayout: (e: TextLayoutEvent) => void;
  SPACER: number;
};

type InputProps = {
  previewText: string;
  setPreviewText: (text: string) => void;
  handleTextChange: (text: string) => void;
};

interface PreviewPanelParams {
  theme: PreviewTheme;
  marquee: MarqueeProps;
  input: InputProps;
  onPreviewLayout: (e: LayoutEvent) => void;
}

export default function PreviewPanel({
  theme,
  marquee,
  input,
  onPreviewLayout,
}: PreviewPanelParams) {
  const [activePreset, setActivePreset] = useState(0);
  const [inputText, setInputText] = useState(input.previewText);
 //입력창에 보이는 텍스트
  const getDisplayText = (text:String) => {
  if (!text) return "";
  // 이미 있는 기호들을 다 지우고 다시 깨끗하게 줄바꿈에 ↵ 붙임
  const cleanText = text.replace(/↵/g, ""); 
  return theme.playOption === "multi" 
    ? cleanText.replace(/\n/g, "↵\n") 
    : cleanText;
};

// 실제 데이터로 전환하기 위해 ↵ 지우는 함수
const handleTextChangeWithIcon = (e :any) => {
  const rawText = e.replace(/↵/g, ""); 
  input.handleTextChange(rawText);     // previewText에는 \n만 붙임
};
  return (
    <View style={styles.previewContainer}>
      {/* preview */}
      <View
        style={[
          styles.preview,
          {
            overflow: "hidden",
            justifyContent: "center",
            backgroundColor: theme.backgroundColor,
          },
        ]}
        onLayout={onPreviewLayout}
      >
        <Animated.View
          style={[
            {
              flexDirection: "row",
              position: "absolute",
              alignItems: "center",
            },
            marquee.animatedStyle,
          ]}
        >
          {[...Array(5)].map((_, i) => (
                        <React.Fragment key={i}>
                            <Text
                                style={[styles.previewText, theme.previewTextStyles]}
                                onTextLayout={i === 0 ? marquee.onTextLayout : undefined}
                            >
                                {marquee.displayText}
                            </Text>
                            <View style={{ width: marquee.SPACER }} />
                        </React.Fragment>
                    ))}
        </Animated.View>
      </View>

      {/* preset buttons container */}
      <View style={styles.presetButtonsContainer}>
        {[1, 2, 3, 4, 5].map((num, index) => (
          <TouchableOpacity
            key={index}
            style={
              index === activePreset
                ? btnStyles.presetButtonActive
                : btnStyles.presetButton
            }
            onPress={() => setActivePreset(index)}
          >
            <LinearGradientExpo
              colors={
                index === activePreset
                  ? ["white", "#CCCCCC"]
                  : ["white", "#727272"]
              }// 시작색, 끝색
              start={{ x: 0, y: 0 }}//왼쪽 위
              end={{ x: 0.1, y: 0.2 }}//오른쪽 아래
              style={btnStyles.presetButtonGradient}//기존 스타일 적용
            >
              <Text
                style={
                  index === activePreset
                    ? btnStyles.presetButtonActiveText
                    : btnStyles.presetButtonText
                }
              >
                {num}
              </Text>
            </LinearGradientExpo>
          </TouchableOpacity>
        ))}
      </View>

      {/* contents input container */}
      <View style={styles.contentsInputContainer}>
        <TextInput
          editable
          multiline
          numberOfLines={3}
          style={styles.contentsInput}
          placeholder="Enter your text here"
          value={getDisplayText(input.previewText)}
          onChangeText={handleTextChangeWithIcon}
          textAlignVertical="top"
        />
        <View style={styles.contentsInputResetButtonContainer}>
          <TouchableOpacity
            onPress={() => input.setPreviewText("")}
            style={btnStyles.contentsInputResetButton}
          >
            <Text style={btnStyles.contentsInputResetButtonText}>×</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}