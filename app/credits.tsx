import {
  creditsStyles,
  settingsStyles,
} from "@/constants/settingsStyles";
import { styles as base } from "@/constants/styles";
import { useSettingsRest } from "@/contexts/settingsContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
type CreditEntry = { role: string; names: string; subtitle?: string; leftAlign?: boolean };

const CREDITS: CreditEntry[] = [
  { role: "Producer", names: "R.S." },
  { role: "Programmers", names: "Chanwoo, MinKyo" },
  { role: "UIUX Designer", names: "Jaden" },
  { role: "QA Testers", names: "SJ, JA" },
  {
    role: "Special Thanks",
    names: "Korean developers / UIUX designers / Artists in Toronto, Kevin, ASH",
    leftAlign: true,
  },
];

export default function CreditsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { textSectionLabel } = useSettingsRest();

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
          {textSectionLabel("credits")}
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={base.scrollViewContainer}
      >
        {CREDITS.map(({ role, names, subtitle, leftAlign }) => (
          <View key={role} style={creditsStyles.row}>
            <Text style={creditsStyles.roleText} allowFontScaling={false}>
              {role}
            </Text>
              <Text style={creditsStyles.namesText} allowFontScaling={false}>
              </Text>
            <Text
              style={[creditsStyles.namesText, leftAlign && creditsStyles.namesTextLeft]}
              allowFontScaling={false}
            >
              {names}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
