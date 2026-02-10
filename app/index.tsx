import {
  MultipleLinePlayButton,
  OneLinePlayButton,
} from "@/assets/svg/playOptionButton";
import { PlayResumeButton } from "@/assets/svg/playResumeButton";
import { btnStyles } from "@/constants/btnStyles";
import { styles } from "@/constants/styles";
import React, { useEffect, useRef, useState } from "react";
import * as ScreenOrientation from "expo-screen-orientation";

import { ColorPicker } from "@/components/colorPicker";
import { SliderComponent } from "@/components/slider";
import {
  backgroundColorPalette,
  textColorPalette,
} from "@/constants/colorPalette";
import { LinearGradient as LinearGradientExpo } from "expo-linear-gradient";
import {
  Dimensions,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Animated from "react-native-reanimated";
import { useMarqueeAnimation } from "@/hooks/useMarqueeAnimation";
import { LedBannerFullScreen } from "@/components/ledBannerFullScreen";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function Index() {
  const insets = useSafeAreaInsets();

  // is playing state
  const [isPlaying, setIsPlaying] = useState(false);

  // 메인 화면은 portrait 고정, 전체화면 모달은 landscape 허용
  useEffect(() => {
    if (isPlaying) {
      ScreenOrientation.unlockAsync();
    } else {
      ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.PORTRAIT_UP,
      );
    }
  }, [isPlaying]);

  // scroll view ref
  const scrollViewRef = useRef<ScrollView>(null);
  const sectionPositions = useRef({ TEXT: 0, BACKGROUND: 0, EFFECT: 0 });
  // tab click scroll function
  const handleTabPress = (tab: "TEXT" | "BACKGROUND" | "EFFECT") => {
    setActiveTab(tab);
    scrollViewRef.current?.scrollTo({
      y: sectionPositions.current[tab],
      animated: true,
    });
  };
  // scroll event handler
  const handleScroll = (event: any) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    const positions = sectionPositions.current;

    // determine tab based on current scroll position
    if (scrollY >= positions.EFFECT - 50) {
      setActiveTab("EFFECT");
    } else if (scrollY >= positions.BACKGROUND - 50) {
      setActiveTab("BACKGROUND");
    } else {
      setActiveTab("TEXT");
    }
  };

  // preset button state
  const [activePreset, setActivePreset] = useState(1);
  const onClickPreset = (index: number) => {
    setActivePreset(index);
  };
  // preview text size state
  const [previewTextSize, setPreviewTextSize] = useState(100);
  // preview text state
  const [previewText, setPreviewText] = useState(
    "Hello, World! asdlfkjas;dlkfja;sldkfja;sldkjfa;slkdjfas;dlkfjasd;flkj",
  );
  // play option button state
  const [playOption, setPlayOption] = useState<"one" | "multi">("one");
  // tab state
  const [activeTab, setActiveTab] = useState<"TEXT" | "BACKGROUND" | "EFFECT">(
    "TEXT",
  );
  // font select items
  const fontItems = [
    { label: "Nanum Gothic", value: "nanum_gothic" },
    { label: "Noto Sans KR", value: "noto_sans_kr" },
    { label: "Roboto", value: "roboto" },
    { label: "Montserrat", value: "montserrat" },
    { label: "Open Sans", value: "open_sans" },
  ];
  // font select state
  const [font, setFont] = useState("nanum_gothic");
  // speed slider state
  const [textMoveSpeed, setTextMoveSpeed] = useState(50);
  // font size slider state
  const [fontSize, setFontSize] = useState(50);
  // out line slider state
  const [outLine, setOutLine] = useState(50);
  // drop shadow slider state
  const [dropShadow, setDropShadow] = useState(50);
  // background blur slider state
  const [backgroundBlur, setBackgroundBlur] = useState(50);
  // text color picker state
  const [textSelectedColor, setTextSelectedColor] = useState("#000000");
  // background color picker state
  const [backgroundColor, setBackgroundColor] = useState("#FFFFFF");
  // effect items state
  const [effectSelectedItem, setEffectSelectedItem] = useState("Bold");
  // effect items list
  const effectItems = ["Bold", "Blink", "Pixel", "Glow", "Gradient"];

  // marquee animation hook
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

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* preview container */}
      <View style={styles.previewContainer}>
        {/* preview */}
        <View
          style={[
            styles.preview,
            { overflow: "hidden", justifyContent: "center" },
          ]}
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
              style={[styles.previewText, { fontSize: previewTextSize }]}
              onTextLayout={onTextLayout}
            >
              {displayText}
            </Text>
            <View style={{ width: SPACER }} />
            <Text style={[styles.previewText, { fontSize: previewTextSize }]}>
              {displayText}
            </Text>
          </Animated.View>
        </View>
        {/* preset buttons container */}
        <View style={styles.presetButtonsContainer}>
          {[1, 2, 3, 4, 5].map((num, index) => {
            return (
              <TouchableOpacity
                key={index}
                style={
                  index === activePreset
                    ? btnStyles.presetButtonActive
                    : btnStyles.presetButton
                }
                onPress={() => onClickPreset(index)}
              >
                <LinearGradientExpo
                  colors={
                    index === activePreset
                      ? ["white", "#CCCCCC"]
                      : ["white", "#727272"]
                  } // 시작색, 끝색
                  start={{ x: 0, y: 0 }} // 왼쪽 위
                  end={{ x: 0.1, y: 0.2 }} // 오른쪽 아래
                  style={btnStyles.presetButtonGradient} // 기존 스타일 적용
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
            );
          })}
        </View>
        {/* contents input container */}
        <View style={styles.contentsInputContainer}>
          <TextInput
            editable={true}
            multiline={true}
            numberOfLines={3}
            style={styles.contentsInput}
            placeholder="Enter your text here"
            value={previewText}
            onChangeText={setPreviewText}
            textAlignVertical="top"
          />
          <View style={styles.contentsInputResetButtonContainer}>
            <TouchableOpacity
              onPress={() => {
                setPreviewText("");
              }}
              style={btnStyles.contentsInputResetButton}
            >
              <Text style={btnStyles.contentsInputResetButtonText}>×</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      {/* play bar container */}
      <View style={styles.playBarContainer}>
        {/* one line play button */}
        <TouchableOpacity
          style={{ flex: 0.15 }}
          onPress={() => setPlayOption("one")}
        >
          <OneLinePlayButton isActive={playOption === "one"} />
        </TouchableOpacity>
        {/* multiple line play button */}
        <TouchableOpacity
          style={{ flex: 0.15 }}
          onPress={() => setPlayOption("multi")}
        >
          <MultipleLinePlayButton isActive={playOption === "multi"} />
        </TouchableOpacity>
        {/* stop/resume button */}
        <TouchableOpacity
          style={btnStyles.playResumeButton}
          onPress={() => setIsPlaying(true)}
        >
          <PlayResumeButton isPlaying={isPlaying} />
        </TouchableOpacity>
      </View>
      {/* tab container */}
      <View style={styles.tabContainer}>
        {["TEXT", "BACKGROUND", "EFFECT"].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() =>
              handleTabPress(tab as "TEXT" | "BACKGROUND" | "EFFECT")
            }
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.activeTabText,
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <ScrollView
        ref={scrollViewRef}
        style={styles.settingsPanelContainer}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* TEXT 섹션 시작 */}
        <View
          onLayout={(e) => {
            sectionPositions.current.TEXT = e.nativeEvent.layout.y;
          }}
        >
          {/* text - font select */}
          <View style={styles.settingsRow}>
            <Text style={styles.settingsRowLabel}>Font</Text>
            <Dropdown
              data={fontItems}
              labelField="label"
              valueField="value"
              placeholder="Select font"
              iconColor="black"
              value={font}
              onChange={(item) => setFont(item.value)}
              style={styles.dropdownContainer}
              containerStyle={styles.dropdownContainer}
              selectedTextStyle={styles.dropdownSelectedTextStyle}
              itemContainerStyle={styles.dropdownItemContainerStyle}
              itemTextStyle={styles.dropdownItemTextStyle}
              iconStyle={styles.dropdownIconStyle}
              placeholderStyle={styles.dropdownPlaceholderStyle}
            />
          </View>

          {/* text - speed slider */}
          <View
            style={[
              styles.settingsRow,
              { borderBottomWidth: 0, marginBottom: 0 },
            ]}
          >
            <Text style={styles.settingsRowLabel}>Speed</Text>
            <View style={styles.settingsRowValueContainer}>
              <Text style={styles.settingsRowValue}>{textMoveSpeed}</Text>
            </View>
          </View>
          <SliderComponent
            value={textMoveSpeed}
            onChange={setTextMoveSpeed}
            minimumValue={0}
            maximumValue={100}
            step={5}
          />

          {/* text - size slider */}
          <View
            style={[
              styles.settingsRow,
              { borderBottomWidth: 0, marginBottom: 0 },
            ]}
          >
            <Text style={styles.settingsRowLabel}>Size</Text>
            <View style={styles.settingsRowValueContainer}>
              <Text style={styles.settingsRowValue}>{fontSize}</Text>
            </View>
          </View>
          <SliderComponent
            value={fontSize}
            onChange={setFontSize}
            minimumValue={10}
            maximumValue={100}
            step={1}
          />

          {/* text - color picker */}
          <View
            style={[
              styles.settingsRow,
              { borderBottomWidth: 0, marginBottom: 0 },
            ]}
          >
            <Text>Color</Text>
          </View>
          <View style={styles.colorPickerContainer}>
            <ColorPicker
              colorList={textColorPalette}
              selectedColor={textSelectedColor}
              onColorSelect={setTextSelectedColor}
            />
          </View>

          {/* text - out line slider */}
          <View
            style={[
              styles.settingsRow,
              { borderBottomWidth: 0, marginBottom: 0 },
            ]}
          >
            <Text style={styles.settingsRowLabel}>Out Line</Text>
            <View style={styles.settingsRowValueContainer}>
              <Text style={styles.settingsRowValue}>{outLine}</Text>
            </View>
          </View>
          <SliderComponent
            value={outLine}
            onChange={setOutLine}
            minimumValue={0}
            maximumValue={100}
            step={1}
          />

          {/* text - drop shadow slider */}
          <View
            style={[
              styles.settingsRow,
              { borderBottomWidth: 0, marginBottom: 0 },
            ]}
          >
            <Text style={styles.settingsRowLabel}>Drop Shadow</Text>
            <View style={styles.settingsRowValueContainer}>
              <Text style={styles.settingsRowValue}>{dropShadow}</Text>
            </View>
          </View>
          <SliderComponent
            value={dropShadow}
            onChange={setDropShadow}
            minimumValue={0}
            maximumValue={100}
            step={1}
          />
        </View>

        {/* BACKGROUND section start */}
        <View
          onLayout={(e) => {
            sectionPositions.current.BACKGROUND = e.nativeEvent.layout.y;
          }}
        >
          {/* background - color picker */}
          <View
            style={[
              styles.settingsRow,
              { borderBottomWidth: 0, marginBottom: 0 },
            ]}
          >
            <Text style={styles.settingsRowLabel}>Background</Text>
          </View>
          <View style={styles.colorPickerContainer}>
            <ColorPicker
              colorList={backgroundColorPalette}
              selectedColor={backgroundColor}
              onColorSelect={setBackgroundColor}
            />
          </View>

          {/* background - blur slider */}
          <View
            style={[
              styles.settingsRow,
              { borderBottomWidth: 0, marginBottom: 0 },
            ]}
          >
            <Text style={styles.settingsRowLabel}>Background Blur</Text>
            <View style={styles.settingsRowValueContainer}>
              <Text style={styles.settingsRowValue}>{backgroundBlur}</Text>
            </View>
          </View>
          <SliderComponent
            value={backgroundBlur}
            onChange={setBackgroundBlur}
            minimumValue={0}
            maximumValue={100}
            step={1}
          />
        </View>

        {/* EFFECT section start */}
        <View
          onLayout={(e) => {
            sectionPositions.current.EFFECT = e.nativeEvent.layout.y;
          }}
        >
          {/* effect - effect select */}
          <View
            style={[
              styles.settingsRow,
              { borderBottomWidth: 0, marginBottom: 0 },
            ]}
          >
            <Text>Effect</Text>
          </View>
          <ScrollView
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            style={styles.effectContainer}
          >
            {effectItems.map((effect, index) => {
              return (
                <TouchableOpacity
                  key={`effect-item-${index}`}
                  style={[
                    btnStyles.effectItemButton,
                    effectSelectedItem === effect &&
                      btnStyles.effectItemButtonActive,
                  ]}
                  onPress={() => setEffectSelectedItem(effect)}
                >
                  <Text
                    style={[
                      btnStyles.effectItemButtonText,
                      effectSelectedItem === effect &&
                        btnStyles.effectItemButtonTextActive,
                    ]}
                  >
                    {effect}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* effect - background effect select */}
          <View
            style={[
              styles.settingsRow,
              { borderBottomWidth: 0, marginBottom: 0 },
            ]}
          >
            <Text>Background Effect</Text>
          </View>
          <ScrollView
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            style={styles.effectImageContainer}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num, index) => {
              return (
                <Image
                  key={`effect-image-${index}`}
                  source={require(`@/assets/images/effectSample.png`)}
                  style={styles.effectImage}
                />
              );
            })}
          </ScrollView>
        </View>
      </ScrollView>

      {/* fullscreen LED banner modal */}
      <LedBannerFullScreen
        visible={isPlaying}
        onClose={() => setIsPlaying(false)}
        text={previewText}
        speed={textMoveSpeed}
        playOption={playOption}
        fontSize={previewTextSize}
        textColor={textSelectedColor}
        backgroundColor={backgroundColor}
      />
    </View>
  );
}
