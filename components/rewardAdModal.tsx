import { appFontFamilyForText } from "@/constants/appFonts";
import { APP_EXPO_ICON } from "@/constants/appModalIcon";
import { rewardAdModalStyles as styles } from "@/constants/styles";
import { useSettings } from "@/contexts/settingsContext";
import type { RewardAdLabelKey } from "@/language/rewardAdLabels";
import {
  Canvas,
  Group,
  Path,
  Rect,
  Skia,
} from "@shopify/react-native-skia";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React, { useEffect, useMemo } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import {
  cancelAnimation,
  Easing,
  useDerivedValue,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from "react-native-reanimated";

const CHECK_ICON = require("../assets/images/Check.png");
const WATCH_AD_BUTTON = require("../assets/images/Watch Ad Button.png");
const PLAY_BG = require("../assets/images/Play Bg.png");

// FireworksBurst
const N = 45;

const createStarPath = (size: number) => {
  const path = Skia.Path.Make();
  const half = size / 2;
  const inner = size * 0.15;

  path.moveTo(0, -half);
  path.quadTo(0, 0, inner, -inner);
  path.lineTo(half, 0);
  path.quadTo(0, 0, inner, inner);
  path.lineTo(0, half);
  path.quadTo(0, 0, -inner, inner);
  path.lineTo(-half, 0);
  path.quadTo(0, 0, -inner, -inner);
  path.close();

  return path;
};

const PARTICLE_DATA = Array.from({ length: N }, (_, i) => {
  const angle = (i / N) * Math.PI * 2 + ((i * 13) % 5) * 0.15;
  const maxDistance = 140 + ((i * 73) % 160);
  const size = 10 + ((i * 23) % 14);
  const type = i % 2 === 0 ? "rect" : "star";
  const colors = ["#FF6B00", "#FF9E00", "#e59e6b", "#e7b22d", "#f3cf8d", "#ecc330"];
  const color = colors[i % colors.length];
  const baseOpacity = 0.5 + ((i * 7) % 6) * 0.1;
  const rotationSpeed = ((i * 11) % 4) + 4;
  const spinDirection = i % 3 === 0 ? 1 : -1;

  return { angle, maxDistance, size, type, color, baseOpacity, rotationSpeed, spinDirection };
});

function FireworksBurst({ visible }: { visible: boolean }) {
  const { width: W, height: H } = useWindowDimensions();
  const cx = W / 2;
  const cy = H / 2;

  const progress = useSharedValue(0);
  const alpha = useSharedValue(0);

  const starPaths = useMemo(() => {
    return PARTICLE_DATA.map(p => p.type === "star" ? createStarPath(p.size) : null);
  }, []);

  useEffect(() => {
    if (visible) {
      progress.value = 0;
      alpha.value = 0;

      progress.value = withTiming(1, {
        duration: 1200,
        easing: Easing.out(Easing.back(1.2)),
      });

      alpha.value = withSequence(
        withTiming(1, { duration: 50 }),
        withDelay(700, withTiming(0, { duration: 500 }))
      );
    } else {
      cancelAnimation(progress);
      cancelAnimation(alpha);
      progress.value = 0;
      alpha.value = 0;
    }
  }, [visible, progress, alpha]);

  return (
    <Canvas style={StyleSheet.absoluteFill} pointerEvents="none">
      {PARTICLE_DATA.map((particle, index) => {
        const transform = useDerivedValue(() => {
          const currentDist = particle.maxDistance * progress.value;
          const x = cx + Math.cos(particle.angle) * currentDist;
          const y = cy + Math.sin(particle.angle) * currentDist;
          const rotation = progress.value * particle.rotationSpeed * particle.spinDirection;

          return [
            { translateX: x },
            { translateY: y },
            { rotate: rotation },
          ];
        });

        const opacity = useDerivedValue(() => alpha.value * particle.baseOpacity);

        return (
          <Group key={index} transform={transform} opacity={opacity}>
            {particle.type === "rect" ? (
              <Rect
                x={-particle.size / 2}
                y={-particle.size / 2}
                width={particle.size}
                height={particle.size}
                color={particle.color}
              />
            ) : (
              <Path
                path={starPaths[index]!}
                color={particle.color}
                style="fill"
              />
            )}
          </Group>
        );
      })}
    </Canvas>
  );
}

type BenefitRow = {
  labelKey: RewardAdLabelKey;
};

const BENEFIT_ROWS: BenefitRow[] = [
  { labelKey: "rewardBenefitColors" },
  { labelKey: "rewardBenefitEffects" },
  { labelKey: "rewardBenefitFavorites" },
  { labelKey: "rewardBenefitOutlineShadow" },
];

type Props = {
  visible: boolean;
  onClose: () => void;
  onWatchAd?: () => void;
};

export function RewardAdModal({ visible, onClose, onWatchAd }: Props) {
  const { rewardAdLabel, resolvedAppLocale } = useSettings();
  const watchAdFontFamily =
    resolvedAppLocale === "ko" || resolvedAppLocale === "en"
      ? appFontFamilyForText("noto_sans_kr", "bold")
      : undefined;

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
        <FireworksBurst visible={visible} />

        <View style={styles.card}>
          <View style={styles.appIconContainer}>
            <Image
              source={APP_EXPO_ICON}
              style={styles.appIconImage}
              contentFit="cover"
              accessibilityIgnoresInvertColors
            />
          </View>

          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
            accessibilityRole="button"
            accessibilityLabel="Close"
          >
            <Ionicons name="close" size={22} color="#8A8A8A" />
          </TouchableOpacity>

          <View style={styles.contentContainer}>
            <Text style={styles.headerBadge} allowFontScaling={false} numberOfLines={2}>
              {rewardAdLabel("rewardHeaderBadge")}
            </Text>

            <View style={styles.benefitContainer}>
              {BENEFIT_ROWS.map(({ labelKey }) => (
                <View key={labelKey} style={styles.benefitRow}>
                  <Image
                    source={CHECK_ICON}
                    style={styles.checkIcon}
                    contentFit="contain"
                    accessibilityIgnoresInvertColors
                  />
                  <Text style={styles.benefitText} allowFontScaling={false}>
                    {rewardAdLabel(labelKey)}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleWatchAd}
            accessibilityRole="button"
            accessibilityLabel={rewardAdLabel("rewardWatchAd")}
            style={styles.ctaButton}
          >
            <Image
              source={WATCH_AD_BUTTON}
              style={styles.ctaButtonBg}
              contentFit="fill"
              accessibilityIgnoresInvertColors
            />
            <View style={styles.ctaButtonContent}>
              <Image
                source={PLAY_BG}
                style={styles.ctaPlayBg}
                contentFit="contain"
                accessibilityIgnoresInvertColors
              />
              <Text
                style={[
                  styles.ctaButtonText,
                  watchAdFontFamily ? { fontFamily: watchAdFontFamily } : undefined,
                ]}
                allowFontScaling={false}
                numberOfLines={1}
              >
                {rewardAdLabel("rewardWatchAd")}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
