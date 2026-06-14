import { useSettings } from "@/contexts/settingsContext";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export function ProActiveBadge() {
  const { isProActive } = useSettings();
  if (!isProActive) return null;
  return (
    <View style={styles.badge}>
      <Text allowFontScaling={false} style={styles.text}>
        PRO
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: "absolute",
    right: 10,
    bottom: 210,
    zIndex: 9999,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  text: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
});
