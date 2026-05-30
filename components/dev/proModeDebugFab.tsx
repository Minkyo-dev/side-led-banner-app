import { DEBUG_FAB_BOTTOM } from "@/constants/debugFabLayout";
import { uiThemeFontStyle } from "@/constants/appFonts";
import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";

type Props = {
  onOpen: () => void;
};

export function ProModeDebugFab({ onOpen }: Props) {
  if (!__DEV__) {
    return null;
  }

  return (
    <Pressable
      style={styles.fab}
      onPress={onOpen}
      accessibilityLabel="Pro mode status (debug)"
    >
      <Text style={styles.fabText} allowFontScaling={false}>
        Pro
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    right: 10,
    bottom: DEBUG_FAB_BOTTOM.pro,
    zIndex: 9999,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  fabText: {
    ...uiThemeFontStyle,
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
});
