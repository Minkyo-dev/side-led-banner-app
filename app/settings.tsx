import type { AppLocaleKey } from "@/constants/language";
import { settingsStyles } from "@/constants/settingsStyles";
import { styles as base } from "@/constants/styles";
import { useSettings } from "@/contexts/settingsContext";
import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { type Href, useRouter } from "expo-router";
import React, { useMemo } from "react";
import {
  Linking,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const INSTAGRAM_URL = "https://www.instagram.com/sunnyinnolab/";
const TWITTER_URL = "https://x.com/Sunnyinnolab";

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    updateUI,
    textSectionLabel,
    resolvedAppLocale,
  } = useSettings();

  const languageDropdownItems = useMemo(
    () => [
      { label: "한국어", value: "ko" as const },
      { label: "English", value: "en" as const },
      { label: "日本語", value: "ja" as const },
      { label: "繁體中文", value: "zhTC" as const },
      { label: "简体中文", value: "zhSC" as const },
    ],
    [],
  );

  const onAppLanguageChange = (item: { value: string }) =>
    updateUI({ appLanguage: item.value as AppLocaleKey });

  const appVersion = useMemo(
    () => Constants.expoConfig?.version ?? "1.0.0",
    [],
  );

  const openUrl = (url: string) => {
    void Linking.openURL(url).catch(() => {
    });
  };

  return (
    <View style={[base.container, { paddingTop: insets.top }]}>
      <View style={settingsStyles.header}>
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
        <View style={settingsStyles.titleRow}>
          <Ionicons name="settings-outline" size={22} color="black" />
          <Text style={settingsStyles.titleText} allowFontScaling={false}>
            {textSectionLabel("settingsTitle")}
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={base.scrollViewContainer}
      >
        <NavigationRow
          label={textSectionLabel("howToUse")}
          onPress={() => {
            /** TODO: How To Use 화면 연결 */
          }}
        />

        <View style={base.settingsRow}>
          <Text style={base.settingsRowLabel} allowFontScaling={false}>
            {textSectionLabel("language")}
          </Text>
          <Dropdown
            data={languageDropdownItems}
            labelField="label"
            valueField="value"
            value={resolvedAppLocale}
            onChange={onAppLanguageChange}
            autoScroll={false}
            maxHeight={240}
            showsVerticalScrollIndicator
            style={[base.dropdownContainer, { width: "56%" }]}
            containerStyle={[base.dropdownContainer, { width: "56%" }]}
            selectedTextStyle={base.dropdownSelectedTextStyle}
            selectedTextProps={{ allowFontScaling: false }}
            itemContainerStyle={base.dropdownItemContainerStyle}
            itemTextStyle={base.dropdownItemTextStyle}
            iconStyle={base.dropdownIconStyle}
            iconColor="black"
          />
        </View>

        <NavigationRow
          label={textSectionLabel("sunnyGames")}
          onPress={() => router.push("/sunnyList" as Href)}
        />

        <LinkRow
          label={textSectionLabel("instagram")}
          linkText={textSectionLabel("link")}
          onPress={() => openUrl(INSTAGRAM_URL)}
        />

        <LinkRow
          label={textSectionLabel("twitter")}
          linkText={textSectionLabel("link")}
          onPress={() => openUrl(TWITTER_URL)}
        />

        <NavigationRow
          label={textSectionLabel("credits")}
          onPress={() => {
            /** TODO: Credits*/
          }}
        />

        <NavigationRow
          label={textSectionLabel("openSourceInfo")}
          onPress={() => router.push("/openSourceInfo" as Href)}
        />

        <View style={base.settingsRow}>
          <Text style={base.settingsRowLabel} allowFontScaling={false}>
            {textSectionLabel("appVersion")}
          </Text>
          <Text
            style={settingsStyles.versionValueText}
            allowFontScaling={false}
          >
            V {appVersion}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

function NavigationRow({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={base.settingsRow} onPress={onPress}>
      <Text style={base.settingsRowLabel} allowFontScaling={false}>
        {label}
      </Text>
      <Ionicons name="chevron-forward" size={20} color="#787878" />
    </TouchableOpacity>
  );
}

function LinkRow({
  label,
  linkText,
  onPress,
}: {
  label: string;
  linkText: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={base.settingsRow} onPress={onPress}>
      <Text style={base.settingsRowLabel} allowFontScaling={false}>
        {label}
      </Text>
      <Text style={settingsStyles.rootLinkText} allowFontScaling={false}>
        {linkText}
      </Text>
    </TouchableOpacity>
  );
}

