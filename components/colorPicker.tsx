import { StyleSheet, TouchableOpacity, View } from "react-native";

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

const styles = StyleSheet.create({
  colorPickerContainer: {
    gap: 10,
    marginHorizontal: 15,
    marginBottom: 5,
  },
  colorPickerRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  colorPickerItemButton: {
    // flex: 1,
    position: 'relative',
  },
  colorPickerItem: {
    width: 32,
    height: 32,
    borderRadius: 50,
  },
  colorPickerItemActive: {
    position: 'absolute',
    top: -4,
    left: -4,
    borderWidth: 2.5,
    borderColor: 'black',
    width: 40,
    height: 40,
    borderRadius: 50,
  }
});