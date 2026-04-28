import { backgroundColorPalette } from "@/constants/colorPalette";
import { styles as base } from "@/constants/styles";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import React, { useCallback, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSettings } from "../../contexts/settingsContext";
import { BackgroundPhotoSheet } from "./backgroundPhotoSheet";
import { SettingsSliderBlock } from "./settingsSliderBlock";

interface BackgroundSectionProps {}

const COLS = 9;
const ROW1_SWATCHES = COLS - 1;

const chip = StyleSheet.create({
  colorPickerContainer: {
    gap: 10,
    marginHorizontal: 15,
    marginBottom: 5,
  },
  colorPickerRow: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  colorPickerItemButton: {
    position: "relative",
  },
  colorPickerItem: {
    width: 32,
    height: 32,
    borderRadius: 50,
  },
  colorPickerItemActive: {
    position: "absolute",
    top: -4,
    left: -4,
    borderWidth: 2.5,
    borderColor: "black",
    width: 40,
    height: 40,
    borderRadius: 50,
  },
  photoEmpty: {
    backgroundColor: "#E8E8E8",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#B0B0B0",
  },
});

export const BackgroundSection = ({}: BackgroundSectionProps) => {
  const [photoSheet, setPhotoSheet] = useState(false);
  const { config, updateConfig } = useSettings();
  const {
    backgroundColor,
    backgroundBlur,
    backgroundImageUri,
  } =
    config.background;

  const setBackgroundBlur = (value: number) =>
    updateConfig("background", { backgroundBlur: value });

  const setBgColor = (color: string) =>
    updateConfig("background", {
      backgroundColor: color,
      backgroundImageUri: null,
    });

  const openAlbum = useCallback(async () => {
    const { status } =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission",
        "Allow photo library access to choose a background image.",
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.85,
      aspect: [16, 9],
    });
    if (result.canceled || !result.assets[0]) return;
    updateConfig("background", {
      backgroundImageUri: result.assets[0].uri,
    });
  }, [updateConfig]);

  const clearBgPhoto = useCallback(
    () => updateConfig("background", { backgroundImageUri: null }),
    [updateConfig],
  );

  const colors = backgroundColorPalette;
  const row1 = colors.slice(0, ROW1_SWATCHES);
  const tail = colors.slice(ROW1_SWATCHES);
  const moreRows: string[][] = [];
  for (let i = 0; i < tail.length; i += COLS) {
    moreRows.push(tail.slice(i, i + COLS));
  }

  const hasBgPhoto =
    backgroundImageUri != null && backgroundImageUri !== "";

  return (
    <>
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={base.scrollViewContainer}
    >
      <View
        style={[
          base.settingsRow,
          { borderBottomWidth: 0, marginBottom: 0 },
        ]}
      >
        <Text style={base.settingsRowLabel} allowFontScaling={false}>
          Background
        </Text>
      </View>

      <View style={chip.colorPickerContainer}>
        <View style={chip.colorPickerRow}>
          <TouchableOpacity
            style={chip.colorPickerItemButton}
            onPress={() => setPhotoSheet(true)}
            accessibilityLabel="Background photo"
          >
            {hasBgPhoto ? (
              <Image
                source={{ uri: backgroundImageUri! }}
                style={[chip.colorPickerItem, { overflow: "hidden" }]}
                contentFit="cover"
              />
            ) : (
              <View
                style={[chip.colorPickerItem, chip.photoEmpty]}
              >
                <Ionicons name="image-outline" size={18} color="#555" />
              </View>
            )}
            {hasBgPhoto ? <View style={chip.colorPickerItemActive} /> : null}
          </TouchableOpacity>
          {row1.map((color, index) => (
            <TouchableOpacity
              key={`bg-color-first-${index}`}
              style={chip.colorPickerItemButton}
              onPress={() => setBgColor(color)}
            >
              {!hasBgPhoto && backgroundColor === color ? (
                <View style={chip.colorPickerItemActive} />
              ) : null}
              <View
                style={[chip.colorPickerItem, { backgroundColor: color }]}
              />
            </TouchableOpacity>
          ))}
        </View>

        {moreRows.map((row, rowIndex) => (
          <View
            key={`bg-color-row-${rowIndex}`}
            style={chip.colorPickerRow}
          >
            {row.map((color, index) => (
              <TouchableOpacity
                key={`bg-color-${rowIndex}-${index}`}
                style={chip.colorPickerItemButton}
                onPress={() => setBgColor(color)}
              >
                {!hasBgPhoto && backgroundColor === color ? (
                  <View style={chip.colorPickerItemActive} />
                ) : null}
                <View
                  style={[
                    chip.colorPickerItem,
                    { backgroundColor: color },
                  ]}
                />
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>

      <SettingsSliderBlock
        label="Background Blur"
        value={backgroundBlur}
        onChange={setBackgroundBlur}
        minimumValue={0}
        maximumValue={100}
        step={1}
      />
    </ScrollView>
    <BackgroundPhotoSheet
      visible={photoSheet}
      onClose={() => setPhotoSheet(false)}
      onGallery={() => void openAlbum()}
      onDefault={clearBgPhoto}
    />
    </>
  );
};
