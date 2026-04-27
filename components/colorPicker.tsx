import { TouchableOpacity, View } from "react-native";
import { colorPickerStyles as styles } from "@/constants/styles";

export const ColorPicker = ({ colorList, selectedColor, onColorSelect }: {
  colorList: string[],
  selectedColor: string,
  onColorSelect: (color: string) => void,
}) => {
  const paletteRow = Math.ceil(colorList.length / 9);
  return (
    <View style={styles.colorPickerContainer}>
      {Array.from({ length: paletteRow }).map((_, rowIndex) => (
        <View key={`color-picker-row-${rowIndex}`} style={styles.colorPickerRow}>
          {colorList.slice(rowIndex * 9, (rowIndex + 1) * 9).map((color, index) => (
            <TouchableOpacity 
            key={`color-picker-item-${rowIndex}-${index}`} 
            style={styles.colorPickerItemButton}
            onPress={() => onColorSelect(color)}
            >
              {selectedColor === color && (
                <View style={styles.colorPickerItemActive} />
              )}
              <View style={[
                styles.colorPickerItem,
                { backgroundColor: color }]} />
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </View>
  );
}
