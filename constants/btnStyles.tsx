import { StyleSheet } from "react-native";

// const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const btnStyles = StyleSheet.create({
    presetButtonActive: {
        flex: 1,
        marginHorizontal: 4,  // 버튼 간 간격
        backgroundColor: '#CCCCCC',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    presetButton: {
        flex: 1,
        marginHorizontal: 4,  // 버튼 간 간격
        backgroundColor: '#727272',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    presetButtonGradient: {
        flex: 1,
        width: '100%',
        height: '100%',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        // shadow
        shadowColor: 'white',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    presetButtonActiveText: {
        color: '#000000',
    },
    presetButtonText: {
        color: '#B1B1AF',
    },
    contentsInputResetButton: {
        width: '60%',
        aspectRatio: 1,
        borderRadius: 999,
        backgroundColor: 'rgba(120, 120, 120, 0.30)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    contentsInputResetButtonText: {
        color: 'white',
        fontSize: 25,
    },
    playResumeButton: {
        flex: 0.7,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#EBEBEB',
        borderRadius: 15,
    },
    settingsRowValueButton: {
        fontSize:0,
        color: "black",
        fontWeight: "400",
    },
    effectItemButton: {
        padding: 10,
        minWidth: 82,
        backgroundColor: '#F6F6F6',
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#DDDDDD',
        marginRight: 5,
        marginBottom: 5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    effectItemButtonActive: {
        borderColor: "#FF6E00",
    },
    effectItemButtonText: {
        fontSize: 16,
        color: 'black',
        fontWeight: '400',
    },
    effectItemButtonTextActive: {
        color: "#FF6E00",
    },
});