import { DeleteAllButton } from "@/assets/svg/deleteAllButton";
import { GradientBackdrop } from "@/components/skia/GradientBackdrop";
import { appFontFamilyForText } from "@/constants/appFonts";
import { btnStyles } from "@/constants/btnStyles";
import { type GradientBackdropId } from "@/constants/gradientBackgroundPresets";
import {
  CONTENTS_INPUT_FONT_SIZE,
  styles,
  toolbarStyles,
} from "@/constants/styles";
import {
  normalizePreviewTextMaxLines,
  PREVIEW_TEXT_MAX_LINES,
  useSettings,
} from "@/contexts/settingsContext";
import { useBackgroundAnimation } from "@/hooks/useBackgroundAnimation";
import { useBlinkOpacityStyle } from "@/hooks/useBlinkOpacityStyle";
import { useEffects } from "@/hooks/useEffects";
import { useMarqueeAnimation } from "@/hooks/useMarqueeAnimation";
import { usePreviewPanelCanvas } from "@/hooks/usePreviewPanelCanvas";
import {
  resolveSpeechCanvasFallback,
  useSpeechBubble,
} from "@/hooks/useSpeechBubble";
import { useTextHistory, type TextSnapshot } from "@/hooks/useTextHistory";
import { useTextInput } from "@/hooks/useTextInput";
import { useTextMetrics } from "@/hooks/useTextMetrics";
import { resolveBubbleCanvasOpts } from "@/utils/skiaBubbleTextLayout";
import { getSizingPolicy } from "@/utils/textSizing";
import { Canvas } from "@shopify/react-native-skia";
import { Image } from "expo-image";
import { LinearGradient as LinearGradientExpo } from "expo-linear-gradient";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  InputAccessoryView,
  Keyboard,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  useWindowDimensions,
  View
} from "react-native";
import { BackgroundEffectLayer } from "./animation/BackgroundEffectLayer";
import { buildCanvas } from "./animation/buildCanvas";
import { buildPixelBackground } from "./animation/buildPixelBackground";
import { MarqueeCanvas } from "./animation/MarqueeCanvas";
import { PixelBackgroundCanvas } from "./animation/PixelBackgroundCanvas";

const inputAccessoryViewID = "doneAccessory";

type LayoutEvent = {
  nativeEvent: { layout: { height: number; width: number } };
};

type PreviewPanelProps = {
  onCursorMovers?: (up: () => void, down: () => void) => void;
  onUndoRedoControl?: (undo: () => void, redo: () => void) => void;
  onUndoRedoStateChange?: (canUndo: boolean, canRedo: boolean) => void;
};

export default function PreviewPanel({ onCursorMovers, onUndoRedoControl, onUndoRedoStateChange }: PreviewPanelProps) {
  const [previewHeight, setPreviewHeight] = useState(0);
  const [previewBox, setPreviewBox] = useState({ width: 0, height: 0 });
  const [inputScrollViewportW, setInputScrollViewportW] = useState(0);

  const {
    config,
    handleTextChange,
    updateConfig,
    ui,
    loadPreset,
    resolvedAppLocale,
  } = useSettings();
  const { activePreset } = ui;

  const { previewText, playOption } = config.content;
  const { font, textSelectedColor, gradientBackgroundPreset, dropShadow } =
    config.appearance;
  const { backgroundColor, backgroundImageUri, backgroundBlur } =
    config.background;
  const hasBgPhoto =
    backgroundImageUri != null && backgroundImageUri.length > 0;
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const isPortrait = windowHeight >= windowWidth;

  const backgroundEdgeEffectAnim = useBackgroundAnimation();
  const sizingPolicy = useMemo(
    () => getSizingPolicy({ effectId: backgroundEdgeEffectAnim.id }),
    [backgroundEdgeEffectAnim.id],
  );

  const speechBubble = useSpeechBubble({
    speechBubbleId: sizingPolicy.speechBubbleId,
    effectId: backgroundEdgeEffectAnim.id,
    isPortrait,
    basisWidthPx: previewBox.width,
    viewportHeight: previewHeight,
  });

  const { effectiveLineSpacing, previewFontSize } = useTextMetrics({
    mode: "preview",
    previewHeight,
    sizingPolicy,
    isSpeechBgActive: speechBubble.isActive,
    speechMaxHeight: speechBubble.maxTextHeight,
  });

  const effects = useEffects({ fontSizePx: previewFontSize });

  const marqueeViewportWidthPx =
    speechBubble.speechBoxPx?.widthPx ?? previewBox.width;

  const { displayText, translateX, onTextLayout, SPACER } = useMarqueeAnimation(
    {
      viewportWidthPx: marqueeViewportWidthPx,
      effectBleedPx: effects.effectSpacePx,
    },
  );

  const canvasFallback = useMemo(
    () => resolveSpeechCanvasFallback(speechBubble.speechBoxPx, previewBox),
    [speechBubble.speechBoxPx, previewBox],
  );

  const canvas = usePreviewPanelCanvas({
    displayText,
    translateX,
    onTextLayout,
    previewFontSize,
    appearanceFontOverride: effects.pixelSkiaFontOverride,
    lineSpacingPx: effectiveLineSpacing,
    fallbackLayout: canvasFallback,
    isPixelMode: effects.isPixelEffect,
    speechBubbleLayout: resolveBubbleCanvasOpts({
      isSpeechActive: speechBubble.isActive,
      isPixelEffect: effects.isPixelEffect,
      pixelShaderSize: effects.pixelShaderSize,
      speechBubbleId: sizingPolicy.speechBubbleId,
    }),
  });

  const { opacity: blinkOpacity } = useBlinkOpacityStyle();

  const marqueeCanvasProps = buildCanvas({
    canvas,
    effects,
    blinkOpacity,
    spacer: SPACER,
    previewTextColor: textSelectedColor,
    hasBgPhoto,
    dropShadow,
    backgroundColor,
  });

  const pixelBackgroundProps = useMemo(
    () =>
      buildPixelBackground({
        width: previewBox.width,
        height: previewBox.height,
        effects,
        hasBgPhoto,
        backgroundColor,
        backgroundImageUri: backgroundImageUri ?? null,
        gradientBackgroundPreset,
        backgroundEffect: backgroundEdgeEffectAnim,
        translateX,
        isPortrait,
        mode: "preview",
      }),
    [
      previewBox.width,
      previewBox.height,
      effects,
      hasBgPhoto,
      backgroundColor,
      backgroundImageUri,
      gradientBackgroundPreset,
      backgroundEdgeEffectAnim,
      translateX,
      isPortrait,
    ],
  );

  const onPreviewLayout = (e: LayoutEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setPreviewBox({ width, height });
    setPreviewHeight(height);
  };

  const textInputRef = useRef<TextInput>(null);

  const {
    displayInputText,
    inputHorizontalCanvasWidth,
    needsHorizontalScroll,
    inputScrollRef,
    handleMeasureLayout,
    measureOffscreenStyle,
    onInputScroll,
    inputViewportHeightPx,
    moveCursorUp,
    moveCursorDown,
  } = useTextInput({ inputScrollViewportW, textInputRef });

  const history = useTextHistory(previewText);

  useEffect(() => {
    onCursorMovers?.(moveCursorUp, moveCursorDown);
  }, [onCursorMovers, moveCursorUp, moveCursorDown]);

  useEffect(() => {
    onUndoRedoStateChange?.(history.canUndo, history.canRedo);
  }, [history.canUndo, history.canRedo, onUndoRedoStateChange]);

  const handleUndo = useCallback(() => {
    const snapshot = history.undo();
    if (!snapshot) return;
    updateConfig("content", { previewText: snapshot.text });
    const safeStart = Math.min(snapshot.sel.start, snapshot.text.length);
    const safeEnd = Math.min(snapshot.sel.end, snapshot.text.length);
    setForcedSnapshot({ text: snapshot.text, sel: { start: safeStart, end: safeEnd } });
  }, [history, updateConfig]);

  const handleRedo = useCallback(() => {
    const snapshot = history.redo();
    if (!snapshot) return;
    updateConfig("content", { previewText: snapshot.text });
    const safeStart = Math.min(snapshot.sel.start, snapshot.text.length);
    const safeEnd = Math.min(snapshot.sel.end, snapshot.text.length);
    setForcedSnapshot({ text: snapshot.text, sel: { start: safeStart, end: safeEnd } });
  }, [history, updateConfig]);

  useEffect(() => {
    onUndoRedoControl?.(handleUndo, handleRedo);
  }, [onUndoRedoControl, handleUndo, handleRedo]);

  const isDark = useColorScheme() === "dark";
  const toolbarBg = isDark ? "#2c2c2e" : "#f1f1f1";
  const toolbarBtn = isDark ? "#ffffff" : "#2c2c2c";

  const setPreviewText = (text: string) =>
    updateConfig("content", { previewText: text });
  const inputSelectionRef = useRef({ start: 0, end: 0 });
  const [forcedSnapshot, setForcedSnapshot] = useState<TextSnapshot | undefined>(undefined);

  const lineCount = previewText.replace(/\r\n?/g, "\n").split("\n").length;
  const atMaxLines = lineCount >= PREVIEW_TEXT_MAX_LINES;

  //3줄일 시 submit 버튼의 요청을 받지 않는다
  const [dynamicSubmitActive, setDynamicSubmitActive] = useState(false);
  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => setDynamicSubmitActive(true));
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setDynamicSubmitActive(false));
    return () => { showSub.remove(); hideSub.remove(); };
  }, []);

  // 3줄일 때 onSubmitEditing 무시
  const handleSubmitEditing = () => { if (atMaxLines) return; };

  const onPreviewTextChange = (text: string) => {
    const next = normalizePreviewTextMaxLines(text);
    if (next === null) {
      // 붙여넣기 등으로 3줄 초과 시 되돌리기
      const revertSel = { ...inputSelectionRef.current };
      textInputRef.current?.setNativeProps({ text: displayInputText, selection: revertSel });
      setForcedSnapshot({ text: displayInputText, sel: revertSel });
      return;
    }
    setForcedSnapshot(undefined);
    handleTextChange(text);
    history.onTextChange(text, inputSelectionRef.current);
  };

  return (
    <View style={styles.previewContainer}>
      {/* preview */}
      <View
        collapsable={false}
        style={[
          styles.preview,
          {
            justifyContent: "center",
            overflow: "hidden",
            backgroundColor:
              hasBgPhoto || effects.isPixelEffect ? undefined : backgroundColor,
          },
        ]}
        onLayout={onPreviewLayout}
      >
        {hasBgPhoto && !effects.isPixelEffect ? (
          <Image
            source={{ uri: backgroundImageUri }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            blurRadius={backgroundBlur / 8}
          />
        ) : null}
        {effects.isPixelEffect &&
        previewBox.width > 0 &&
        previewBox.height > 0 ? (
          <PixelBackgroundCanvas {...pixelBackgroundProps} />
        ) : null}
        {!effects.isPixelEffect &&
        effects.showGradientBackdrop &&
        previewBox.width > 0 &&
        previewBox.height > 0 ? (
          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <Canvas style={{ flex: 1 }} opaque={false}>
              <GradientBackdrop
                key={`gradient-${gradientBackgroundPreset}`}
                preset={gradientBackgroundPreset as GradientBackdropId}
                width={previewBox.width}
                height={previewBox.height}
              />
            </Canvas>
          </View>
        ) : null}
        <BackgroundEffectLayer
          effect={backgroundEdgeEffectAnim}
          translateX={translateX}
          isPortrait={isPortrait}
          mode="preview"
          suppressPixelManagedBackgrounds={effects.isPixelEffect}
        />
        {speechBubble.speechTextBoxConfig ? (
          <View
            style={{
              ...StyleSheet.absoluteFillObject,
              alignItems: "center",
              ...(speechBubble.speechTextTop == null
                ? { justifyContent: "center" }
                : null),
            }}
            pointerEvents="none"
          >
            <View
              style={speechBubble.textContainerStyle!}
              onLayout={canvas.onSkiaCanvasLayout}
            >
              <MarqueeCanvas {...marqueeCanvasProps} />
            </View>
          </View>
        ) : (
          <View
            style={StyleSheet.absoluteFill}
            onLayout={canvas.onSkiaCanvasLayout}
          >
            <MarqueeCanvas {...marqueeCanvasProps} />
          </View>
        )}
      </View>

      {/* preset buttons */}
      <View style={styles.presetButtonsContainer}>
        {[1, 2, 3, 4, 5].map((num, index) => (
          <TouchableOpacity
            key={index}
            style={
              index === activePreset
                ? btnStyles.presetButtonActive
                : btnStyles.presetButton
            }
            onPress={() => loadPreset(index)}
            accessibilityLabel={`Preset ${index + 1}`}
          >
            <LinearGradientExpo
              colors={
                index === activePreset
                  ? ["white", "#CCCCCC"]
                  : ["white", "#727272"]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 0.1, y: 0.2 }}
              style={btnStyles.presetButtonGradient}
            >
              <Text
                allowFontScaling={false}
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
      <View
        id="contentsInputContainer"
        style={[
          styles.contentsInputContainer,
          { height: inputViewportHeightPx },
        ]}
      >
        <Text
          allowFontScaling={false}
          style={[styles.contentsInput, measureOffscreenStyle]}
          onTextLayout={handleMeasureLayout}
          pointerEvents="none"
        >
          {displayInputText || " "}
        </Text>
        <ScrollView
          ref={inputScrollRef}
          horizontal
          nestedScrollEnabled
          scrollEnabled={needsHorizontalScroll}
          keyboardShouldPersistTaps="handled"
          showsHorizontalScrollIndicator={needsHorizontalScroll}
          scrollEventThrottle={16}
          onScroll={onInputScroll}
          style={{ flex: 0.9, height: inputViewportHeightPx }}
          contentContainerStyle={{ flexGrow: 1 }}
          onLayout={(e) => setInputScrollViewportW(e.nativeEvent.layout.width)}
          {...(Platform.OS === "ios"
            ? {
                scrollIndicatorInsets: { right: 1 },
                indicatorStyle: "white" as const,
              }
            : {})}
          {...(Platform.OS === "android" ? { persistentScrollbar: true } : {})}
        >
          <TextInput
            ref={textInputRef}
            editable
            allowFontScaling={false}
            multiline={true}
            scrollEnabled={false}
            style={[
              styles.contentsInput,
              {
                flex: 0,
                width: inputHorizontalCanvasWidth,
                paddingTop: 2,
                paddingBottom: 2,
                fontSize: CONTENTS_INPUT_FONT_SIZE,
                fontFamily: appFontFamilyForText(
                  font,
                  config.appearance.fontWeight === "bold" ? "bold" : "normal",
                  resolvedAppLocale,
                ),
              },
            ]}
            placeholder="Enter your text here"
            value={forcedSnapshot?.text ?? displayInputText}
            selection={forcedSnapshot?.sel}
            submitBehavior={dynamicSubmitActive ? (atMaxLines ? "submit" : "newline") : "newline"}
            onSubmitEditing={handleSubmitEditing}
            onChangeText={onPreviewTextChange}
            onSelectionChange={(e) => {
              const { start, end } = e.nativeEvent.selection;
              inputSelectionRef.current = { start, end };
              if (forcedSnapshot !== undefined) setForcedSnapshot(undefined);
            }}
            textAlignVertical="top"
            inputAccessoryViewID={Platform.OS === "ios" ? inputAccessoryViewID : undefined}
          />
        </ScrollView>
        
        {Platform.OS === "ios" && (
          <InputAccessoryView nativeID={inputAccessoryViewID}>
            <View style={[styles.accessoryBar, { backgroundColor: toolbarBg }]}>
              <View style={toolbarStyles.cursorNavContainer}>
                <TouchableOpacity
                  onPress={handleUndo}
                  style={toolbarStyles.cursorNavButton}
                  disabled={!history.canUndo}
                  accessible={false}
                  focusable={false}
                >
                  <Text allowFontScaling={false} style={[toolbarStyles.cursorNavText, { color: toolbarBtn, opacity: history.canUndo ? 1 : 0.3 }]}>↩</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleRedo}
                  style={toolbarStyles.cursorNavButton}
                  disabled={!history.canRedo}
                  accessible={false}
                  focusable={false}
                >
                  <Text allowFontScaling={false} style={[toolbarStyles.cursorNavText, { color: toolbarBtn, opacity: history.canRedo ? 1 : 0.3 }]}>↪</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity onPress={Keyboard.dismiss} hitSlop={8}>
                <Text allowFontScaling={false} style={styles.accessoryClose}>
                  ✔
                </Text>
              </TouchableOpacity>
            </View>
          </InputAccessoryView>
        )}
        <View
          id="contentsInputResetButtonContainer"
          style={styles.contentsInputResetButtonContainer}
        >
          <TouchableOpacity
            onPress={() => {
              history.commitSnapshot(previewText, inputSelectionRef.current);
              setPreviewText("");
              history.onTextChange("", { start: 0, end: 0 });
            }}
            style={btnStyles.contentsInputResetButton}
          >
            <DeleteAllButton />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
