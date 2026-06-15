import type { AppLocaleKey } from "@/constants/language";
import { settingsStyles } from "@/constants/settingsStyles";
import { styles as base, resolveDropdownMaxHeight, settingsFooterStyles } from "@/constants/styles";
import { useSettings } from "@/contexts/settingsContext";
import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { type Href, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Image,
  Linking,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SUNNY_LINKS = {
  homepage: "https://ssongyc.github.io/sunny-homepage/",
  instagram: "https://www.instagram.com/sunnyinnolab/",
  twitter: "https://x.com/Sunnyinnolab",
  terms: "https://marmalade-neptune-dbe.notion.site/Terms-Conditions-c18656ce6c6045e590f652bf8291f28b?pvs=74",
  privacy: "https://marmalade-neptune-dbe.notion.site/Privacy-Policy-ced8ead72ced4d8791ca4a71a289dd6b",
} as const;

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { height: windowH } = useWindowDimensions();
  const [languageDropdownContentHeight, setLanguageDropdownContentHeight] = useState(0);
  const { updateUI, textSectionLabel, resolvedAppLocale } = useSettings();

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

  const languageDropdownMaxHeight = useMemo(
    () => resolveDropdownMaxHeight(languageDropdownContentHeight, windowH),
    [languageDropdownContentHeight, windowH],
  );

  const onAppLanguageChange = (item: { value: string }) =>
    updateUI({ appLanguage: item.value as AppLocaleKey });

  const appVersion = useMemo(() => Constants.expoConfig?.version ?? "1.0.0", []);

  const openUrl = (url: string) => {
    void Linking.openURL(url).catch(() => {});
  };

  return (
    <View style={[base.container, {paddingTop: insets.top, backgroundColor: "#FFFFFF" }]}>
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
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[base.scrollViewContainer, { paddingBottom: 40 }]}
      >
        <NavigationRow
          label={textSectionLabel("howToUse")}
          onPress={() => {}}
        />

        <View style={base.settingsRow}>
          <Text style={base.settingsRowLabel} allowFontScaling={false}>
            {textSectionLabel("language")}
          </Text>
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              opacity: 0,
              height: 0,
              overflow: "hidden",
            }}
          >
            <View onLayout={(e) => setLanguageDropdownContentHeight(e.nativeEvent.layout.height)}>
              {languageDropdownItems.map((item) => (
                <View key={item.value} style={base.dropdownItemContainerStyle}>
                  <View style={base.dropdownItemContent}>
                    <Text style={base.dropdownItemTextStyle} allowFontScaling={false}>
                      {item.label}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
          <Dropdown
            data={languageDropdownItems}
            labelField="label"
            valueField="value"
            value={resolvedAppLocale}
            onChange={onAppLanguageChange}
            autoScroll={false}
            maxHeight={languageDropdownMaxHeight}
            showsVerticalScrollIndicator
            style={[base.dropdownContainer, { width: "56%" }]}
            containerStyle={[
              base.dropdownContainer,
              base.dropdownMenuContainer,
              { width: "56%" },
            ]}
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
          onPress={() => openUrl(SUNNY_LINKS.instagram)}
        />

        <LinkRow
          label={textSectionLabel("twitter")}
          linkText={textSectionLabel("link")}
          onPress={() => openUrl(SUNNY_LINKS.twitter)}
        />

        <NavigationRow
          label={textSectionLabel("credits")}
          onPress={() => router.push("/credits" as Href)}
        />

        <NavigationRow
          label={textSectionLabel("openSourceInfo")}
          onPress={() => router.push("/openSourceInfo" as Href)}
        />

        <View style={base.settingsRow}>
          <Text style={base.settingsRowLabel} allowFontScaling={false}>
            {textSectionLabel("appVersion")}
          </Text>
          <Text style={settingsStyles.versionValueText} allowFontScaling={false}>
            V {appVersion}
          </Text>
        </View>
      </ScrollView>

      <SettingsFooter
        onLogoPress={() => openUrl(SUNNY_LINKS.homepage)}
        onTermsPress={() => openUrl(SUNNY_LINKS.terms)}
        onPrivacyPress={() => openUrl(SUNNY_LINKS.privacy)}
      />
    </View>
  );
}

function NavigationRow({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={base.settingsRow} onPress={onPress}>
      <Text style={base.settingsRowLabel} allowFontScaling={false}>
        {label}
      </Text>
      <Ionicons name="chevron-forward" size={20} color="#787878" />
    </TouchableOpacity>
  );
}

function LinkRow({ label, linkText, onPress }: { label: string; linkText: string; onPress: () => void }) {
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

interface SettingsFooterProps {
  onLogoPress: () => void;
  onTermsPress: () => void;
  onPrivacyPress: () => void;
}

export function SettingsFooter({ onLogoPress, onTermsPress, onPrivacyPress }: SettingsFooterProps) {
  const { bottom } = useSafeAreaInsets();
  return (
    <View style={[settingsFooterStyles.container, { paddingBottom: Math.max(bottom, 24) }]}>
      <TouchableOpacity onPress={onLogoPress} activeOpacity={0.7}>
        <Image
          source={require("@/assets/images/SIL_logo_setting_mini_black_text.png")}
          style={settingsFooterStyles.logo}
          resizeMode="contain"
        />
      </TouchableOpacity>
      
      <View style={settingsFooterStyles.linksRow}>
        <TouchableOpacity onPress={onTermsPress}>
          <Text style={settingsFooterStyles.linkText} allowFontScaling={false}>
            Terms of Service
          </Text>
        </TouchableOpacity>
        
        <Text style={settingsFooterStyles.separator} allowFontScaling={false}>
          |
        </Text>
        
        <TouchableOpacity onPress={onPrivacyPress}>
          <Text style={settingsFooterStyles.linkText} allowFontScaling={false}>
            Privacy Policy
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

