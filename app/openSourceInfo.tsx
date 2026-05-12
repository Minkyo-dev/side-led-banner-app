import {
  openSourceInfoStyles,
  settingsStyles,
} from "@/constants/settingsStyles";
import { styles as base } from "@/constants/styles";
import { useSettings } from "@/contexts/settingsContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import {
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import pkg from "../package.json";

function stripVersionPrefix(v: string): string {
  return v.replace(/^[\^~>=<\s]+/, "").trim();
}

type OssEntry = { name: string; version: string };

export default function OpenSourceInfoScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { textSectionLabel } = useSettings();

  const entries = useMemo<OssEntry[]>(() => {
    const deps = (pkg as { dependencies?: Record<string, string> })
      .dependencies;
    if (!deps) return [];
    return Object.entries(deps)
      .map(([name, version]) => ({
        name: name.replace(/^@/, ""),
        version: stripVersionPrefix(version),
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  return (
    <View style={[base.container, { paddingTop: insets.top }]}>
      <View style={settingsStyles.headerInline}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={settingsStyles.backButton}
          accessibilityLabel="Back"
          hitSlop={10}
        >
          <Ionicons
            name={Platform.OS === "ios" ? "chevron-back" : "arrow-back"}
            size={24}
            color="black"
          />
        </TouchableOpacity>
        <Text style={settingsStyles.titleText} allowFontScaling={false}>
          {textSectionLabel("openSourceInfo")}
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={base.scrollViewContainer}
      >
        {entries.map(({ name, version }) => (
          <View key={name} style={openSourceInfoStyles.row}>
            <Text
              style={openSourceInfoStyles.nameText}
              numberOfLines={1}
              ellipsizeMode="middle"
              allowFontScaling={false}
            >
              {name}
            </Text>
            <Text
              style={openSourceInfoStyles.versionText}
              allowFontScaling={false}
            >
              {version}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

