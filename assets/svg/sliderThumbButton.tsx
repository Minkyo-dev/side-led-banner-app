import { StyleSheet, View } from "react-native";
import Svg, { Rect } from "react-native-svg";

export const SliderThumbButton = () => {
    return (
        <View style={styles.SliderThumbButton}>
            <Svg width="46" height="31" viewBox="0 0 46 31" fill="none">
                <Rect x="4" y="3" width="38" height="23" rx="11.5" fill="white" />
            </Svg>
        </View>
    );
};

const styles = StyleSheet.create({
    SliderThumbButton: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    }
});