import { proModeStatusModalStyles as styles } from "@/constants/styles";
import { useSettings } from "@/contexts/settingsContext";
import {
  formatProExpiresAt,
  formatProRemaining,
} from "@/utils/formatProRemaining";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Props = {
  visible: boolean;
  onClose: () => void;
};

export function ProModeStatusModal({ visible, onClose }: Props) {
  const {
    isProMode,
    proExpiresAt,
    activateProFromReward,
    clearProMode,
  } = useSettings();

  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!visible) return;

    setNow(Date.now());
    const intervalId = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(intervalId);
  }, [visible]);

  const remainingMs =
    isProMode && proExpiresAt != null ? proExpiresAt - now : 0;

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

          <Text style={styles.title} allowFontScaling={false}>
            Pro Mode
          </Text>

          <View
            style={[
              styles.statusBadge,
              isProMode ? styles.statusBadgeOn : styles.statusBadgeOff,
            ]}
          >
            <Text
              style={[
                styles.statusBadgeText,
                isProMode ? styles.statusBadgeTextOn : styles.statusBadgeTextOff,
              ]}
              allowFontScaling={false}
            >
              {isProMode ? "ON" : "OFF"}
            </Text>
          </View>

          {isProMode && proExpiresAt != null ? (
            <View style={styles.detailBlock}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel} allowFontScaling={false}>
                  Remaining
                </Text>
                <Text style={styles.detailValue} allowFontScaling={false}>
                  {formatProRemaining(remainingMs)}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel} allowFontScaling={false}>
                  Expires
                </Text>
                <Text style={styles.detailValue} allowFontScaling={false}>
                  {formatProExpiresAt(proExpiresAt)}
                </Text>
              </View>
            </View>
          ) : (
            <Text style={styles.hint} allowFontScaling={false}>
              Watch a rewarded ad to unlock Pro for 2 hours.
            </Text>
          )}

          {__DEV__ ? (
            <View style={styles.devActions}>
              <TouchableOpacity
                style={[styles.devButton, styles.devButtonOff]}
                activeOpacity={0.85}
                onPress={activateProFromReward}
              >
                <Text
                  style={[styles.devButtonText, styles.devButtonTextLight]}
                  allowFontScaling={false}
                >
                  Turn ON (debug)
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.devButton, styles.devButtonOn]}
                activeOpacity={0.85}
                onPress={clearProMode}
              >
                <Text style={styles.devButtonText} allowFontScaling={false}>
                  Turn OFF (debug)
                </Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}
