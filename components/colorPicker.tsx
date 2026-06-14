import { Image, TouchableOpacity, View } from "react-native";
import { colorPickerStyles as styles, colorPickerLockStyles as lockStyles } from "@/constants/styles";

const LOCK_ICON = require("@/assets/images/icon_lock_type2.png");

export const ColorPicker = ({
  colorList,
  selectedColor,
  onColorSelect,
  lockedCount = 0,
  onLockedPress,
}: {
  colorList: string[];
  selectedColor: string;
  onColorSelect: (color: string) => void;
  lockedCount?: number;
  onLockedPress?: () => void;
}) => {
  const lockedStartIndex = lockedCount > 0 ? colorList.length - lockedCount : colorList.length;
  const paletteRow = Math.ceil(colorList.length / 9);
  return (
    <View style={styles.colorPickerContainer}>
      {Array.from({ length: paletteRow }).map((_, rowIndex) => (
        <View key={`color-picker-row-${rowIndex}`} style={styles.colorPickerRow}>
          {colorList.slice(rowIndex * 9, (rowIndex + 1) * 9).map((color, index) => {
            const globalIndex = rowIndex * 9 + index;
            const isLocked = globalIndex >= lockedStartIndex;
            return (
              <TouchableOpacity
                key={`color-picker-item-${rowIndex}-${index}`}
                style={styles.colorPickerItemButton}
                onPress={() => (isLocked ? onLockedPress?.() : onColorSelect(color))}
              >
                {!isLocked && selectedColor === color && (
                  <View style={styles.colorPickerItemActive} />
                )}
                <View style={[styles.colorPickerItem, { backgroundColor: color }]} />
                {isLocked && (
                  <>
                    <View style={lockStyles.overlay} />
                    <Image source={LOCK_ICON} style={lockStyles.icon} />
                  </>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );
};

