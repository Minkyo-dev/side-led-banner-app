import React, { useEffect, useMemo } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
  visible: boolean;
  onClose: () => void;
  onGallery: () => void;
  onCamera: () => void;
  onDefault: () => void;
};

function useSheetColors() {
  const scheme = useColorScheme();
  const dark = scheme === "dark";
  return useMemo(
    () =>
      dark
        ? {
            dim: "rgba(0,0,0,0.58)",
            surface: "#2C2C2E",
            label: "#FFFFFF",
            divider: "rgba(255,255,255,0.14)",
            cancel: "#0A84FF",
          }
        : {
            dim: "rgba(0,0,0,0.35)",
            surface: "#F2F2F7",
            label: "#000000",
            divider: "rgba(60,60,60,0.16)",
            cancel: "#007AFF",
          },
    [dark],
  );
}

export function BackgroundPhotoSheet({
  visible,
  onClose,
  onGallery,
  onCamera,
  onDefault,
}: Props) {
  const insets = useSafeAreaInsets();
  const { width: winW, height: winH } = useWindowDimensions();
  const colors = useSheetColors();

  const slideH = useMemo(
    () => Math.min(winH * 0.45, 420),
    [winH],
  );
  const isLandscape = winW > winH;
  const sheetMax = isLandscape ? Math.min(520, winW * 0.92) : undefined;

  const y = useSharedValue(slideH);

  useEffect(() => {
    if (!visible) {
      y.value = slideH;
    }
  }, [slideH, visible, y]);

  useEffect(() => {
    if (!visible) return;
    y.value = slideH;
    y.value = withTiming(0, { duration: 260 });
  }, [visible, slideH, y]);

  const sheetAnim = useAnimatedStyle(() => ({
    transform: [{ translateY: y.value }],
  }));

  const closeSheet = () => {
    y.value = withTiming(slideH, { duration: 220 }, (done) => {
      if (done) scheduleOnRN(onClose);
    });
  };

  const row = (label: string, action: () => void) => (
    <TouchableOpacity
      style={styles.row}
      activeOpacity={0.65}
      onPress={() => {
        action();
        closeSheet();
      }}
    >
      <Text
        style={[styles.rowText, { color: colors.label }]}
        allowFontScaling={false}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={closeSheet}
    >
      <View style={styles.root}>
        <Pressable style={[styles.dim, { backgroundColor: colors.dim }]} onPress={closeSheet} />
        <Animated.View
          style={[
            styles.sheet,
            sheetMax != null && { maxWidth: sheetMax, width: "100%", alignSelf: "center" },
            { paddingBottom: Math.max(insets.bottom, 12) + 8 },
            sheetAnim,
          ]}
        >
          <View
            style={[
              styles.group,
              { backgroundColor: colors.surface },
            ]}
          >
            {row("Choose from Gallery", onGallery)}
            <View style={[styles.divider, { backgroundColor: colors.divider }]} />
            {row("Take a Photo", onCamera)}
            <View style={[styles.divider, { backgroundColor: colors.divider }]} />
            {row("Default Image", onDefault)}
          </View>
          <TouchableOpacity
            style={[
              styles.cancelWrap,
              { backgroundColor: colors.surface },
            ]}
            activeOpacity={0.65}
            onPress={closeSheet}
          >
            <Text
              style={[styles.cancelText, { color: colors.cancel }]}
              allowFontScaling={false}
            >
              Cancel
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "flex-end",
  },
  dim: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    paddingHorizontal: 10,
  },
  group: {
    borderRadius: 14,
    overflow: "hidden",
  },
  row: {
    paddingVertical: 16,
    alignItems: "center",
  },
  rowText: {
    fontSize: 17,
    fontWeight: "400",
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
  cancelWrap: {
    marginTop: 10,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  cancelText: {
    fontSize: 17,
    fontWeight: "600",
  },
});
