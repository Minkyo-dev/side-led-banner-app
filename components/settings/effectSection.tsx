import { btnStyles } from "@/constants/btnStyles";
import { styles } from "@/constants/styles";
import React from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSettings } from "../../contexts/settingsContext";

interface EffectSectionProps {
  onLayout: (e: any) => void;
}

export const EffectSection = ({ onLayout }: EffectSectionProps) => {
  // Context에서 필요한 상태와 핸들러 가져오기
  const {
    effectItems,
    effectSelectedItem,
    setEffectSelectedItem
  } = useSettings();

  return (
    <View onLayout={onLayout}>
      {/* effect - effect select */}
      <View style={[styles.settingsRow, { borderBottomWidth: 0, marginBottom: 0 }]}>
        <Text>Effect</Text>
      </View>
      <ScrollView
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        style={styles.effectContainer}
      >
        {effectItems.map((effect, index) => (
          <TouchableOpacity
            key={`effect-item-${index}`}
            style={[
              btnStyles.effectItemButton,
              effectSelectedItem === effect && btnStyles.effectItemButtonActive,
            ]}
            onPress={() => setEffectSelectedItem(effect)}
          >
            <Text
              style={[
                btnStyles.effectItemButtonText,
                effectSelectedItem === effect && btnStyles.effectItemButtonTextActive,
              ]}
            >
              {effect}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* effect - background effect select */}
      <View style={[styles.settingsRow, { borderBottomWidth: 0, marginBottom: 0 }]}>
        <Text>Background Effect</Text>
      </View>
      <ScrollView
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        style={styles.effectImageContainer}
      >
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num, index) => (
          <Image
            key={`effect-image-${index}`}
            source={require(`@/assets/images/effectSample.png`)}
            style={styles.effectImage}
          />
        ))}
      </ScrollView>
    </View>
  );
};