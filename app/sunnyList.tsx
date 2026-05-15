import {
  settingsStyles,
  sunnyListStyles,
} from "@/constants/settingsStyles";
import { styles as base } from "@/constants/styles";
import {
  SUNNY_APPS,
  type SunnyAppEntry,
} from "@/constants/sunnyApps";
import { useSettings } from "@/contexts/settingsContext";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React from "react";
import {
  Linking,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function pickStoreUrl(entry: SunnyAppEntry): string {
  if (Platform.OS === "android") return entry.playStoreUrl;
  if (Platform.OS === "ios") return entry.appStoreUrl;
  return entry.appStoreUrl;
}

export default function SunnyListScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { textSectionLabel } = useSettings();

  const openStore = (entry: SunnyAppEntry) => {
    const url = pickStoreUrl(entry);
    void Linking.openURL(url).catch(() => {
    });
  };

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
          {textSectionLabel("sunnyGames")}
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={base.scrollViewContainer}
      >
        {SUNNY_APPS.map((entry) => (
          <TouchableOpacity
            key={entry.id}
            style={sunnyListStyles.row}
            onPress={() => openStore(entry)}
            activeOpacity={0.7}
          >
            <View style={sunnyListStyles.thumbnail}>
              {entry.thumbnail ? (
                <Image
                  source={entry.thumbnail}
                  style={sunnyListStyles.thumbnailImage}
                  contentFit="cover"
                />
              ) : (
                <Text
                  style={sunnyListStyles.thumbnailPlaceholderText}
                  allowFontScaling={false}
                >
                  {entry.name.charAt(0).toUpperCase()}
                </Text>
              )}
            </View>
            <Text
              style={sunnyListStyles.appName}
              numberOfLines={1}
              allowFontScaling={false}
            >
              {entry.name}
            </Text>
            <Text style={sunnyListStyles.linkText} allowFontScaling={false}>
              {textSectionLabel("link")}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
