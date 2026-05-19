import { APP_EXPO_ICON } from "@/constants/appModalIcon";
import { rewardAdModalStyles as styles } from "@/constants/styles";
import { useSettings } from "@/contexts/settingsContext";
import type { RewardAdLabelKey } from "@/language/rewardAdLabels";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import {
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type BenefitRow = {
  icon: keyof typeof Ionicons.glyphMap;
  labelKey: RewardAdLabelKey;
};

const BENEFIT_ROWS: BenefitRow[] = [
  { icon: "color-palette-outline", labelKey: "rewardBenefitColors" },
  { icon: "sparkles-outline", labelKey: "rewardBenefitEffects" },
  { icon: "star-outline", labelKey: "rewardBenefitFavorites" },
  { icon: "layers-outline", labelKey: "rewardBenefitOutlineShadow" },
];

type Props = {
  visible: boolean;
  onClose: () => void;
  onWatchAd?: () => void;
};

export function RewardAdModal({ visible, onClose, onWatchAd }: Props) {
  const { rewardAdLabel } = useSettings();

  const handleWatchAd = () => {
    onWatchAd?.();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.root}>
        <Pressable
          style={[styles.dim, { backgroundColor: "rgba(0,0,0,0.45)" }]}
          onPress={onClose}
        />
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
            accessibilityRole="button"
            accessibilityLabel="Close"
          >
            <Ionicons name="close" size={22} color="#8A8A8A" />
          </TouchableOpacity>

          <View style={styles.headerRow}>
            <View style={styles.appIcon}>
              <Image
                source={APP_EXPO_ICON}
                style={styles.appIconImage}
                contentFit="cover"
                accessibilityIgnoresInvertColors
              />
            </View>
            <Text style={styles.headerBadge} allowFontScaling={false} numberOfLines={2}>
              {rewardAdLabel("rewardHeaderBadge")}
            </Text>
          </View>

          {BENEFIT_ROWS.map(({ icon, labelKey }) => (
            <View key={labelKey} style={styles.benefitRow}>
              <View style={styles.benefitIconWrap}>
                <Ionicons name={icon} size={22} color="#1A1A1A" />
              </View>
              <Text style={styles.benefitText} allowFontScaling={false}>
                {rewardAdLabel(labelKey)}
              </Text>
            </View>
          ))}

          <Text style={styles.description} allowFontScaling={false}>
            {rewardAdLabel("rewardDescription")}
          </Text>

          <TouchableOpacity
            style={styles.ctaButton}
            activeOpacity={0.85}
            onPress={handleWatchAd}
          >
            <Text style={styles.ctaText} allowFontScaling={false}>
              {rewardAdLabel("rewardWatchAd")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
