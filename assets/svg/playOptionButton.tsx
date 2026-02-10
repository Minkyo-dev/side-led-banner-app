import Svg, {
    Circle, Defs,
    Line, LinearGradient,
    Rect, Stop
} from "react-native-svg";


export const MultipleLinePlayButton = ({ isActive }: { isActive: boolean }) => {
    if (isActive) {
        return (
            <Svg width="53" height="53" viewBox="0 0 53 53" fill="none">
                <Rect width="53" height="53" rx="15" fill="#EBEBEB" />
                <Circle cx="26.5" cy="26.5" r="23" fill="url(#paint0_linear_103_4805)" stroke="url(#paint1_linear_103_4805)" />
                <Line x1="19" y1="23" x2="35" y2="23" stroke="#787878" strokeWidth="2" strokeLinecap="round" />
                <Line x1="19" y1="27" x2="35" y2="27" stroke="#787878" strokeWidth="2" strokeLinecap="round" />
                <Line x1="19" y1="31" x2="35" y2="31" stroke="#787878" strokeWidth="2" strokeLinecap="round" />
                <Defs>
                    <LinearGradient id="paint0_linear_103_4805" x1="10.8333" y1="45.5937" x2="50" y2="6.91667" gradientUnits="userSpaceOnUse">
                        <Stop stopColor="#DBDBDB" offset="0" />
                        <Stop offset="1" stopColor="#D0D0D0" />
                    </LinearGradient>
                    <LinearGradient id="paint1_linear_103_4805" x1="26.5" y1="3" x2="26.5" y2="50" gradientUnits="userSpaceOnUse">
                        <Stop stopColor="#F3F3F3" offset="0" />
                        <Stop offset="1" stopColor="#DADADA" />
                    </LinearGradient>
                </Defs>
            </Svg>
        )
    } else {
        return (
            <Svg width="53" height="53" viewBox="0 0 53 53" fill="none">
                <Rect width="53" height="53" rx="15" fill="#EBEBEB" />
                <Circle cx="26.5" cy="26.5" r="23" fill="url(#paint0_linear_193_892)" stroke="url(#paint1_linear_193_892)" />
                <Line x1="19" y1="23" x2="35" y2="23" stroke="#787878" strokeWidth="2" strokeLinecap="round" />
                <Line x1="19" y1="27" x2="35" y2="27" stroke="#787878" strokeWidth="2" strokeLinecap="round" />
                <Line x1="19" y1="31" x2="35" y2="31" stroke="#787878" strokeWidth="2" strokeLinecap="round" />
                <Defs>
                    <LinearGradient id="paint0_linear_193_892" x1="10.8333" y1="45.5937" x2="50" y2="6.91667" gradientUnits="userSpaceOnUse">
                        <Stop stopColor="#FDFDFD" offset="0" />
                        <Stop stopColor="#DEDEDE" offset="1" />
                    </LinearGradient>
                    <LinearGradient id="paint1_linear_193_892" x1="26.5" y1="3" x2="26.5" y2="50" gradientUnits="userSpaceOnUse">
                        <Stop stopColor="#F3F3F3" offset="0" />
                        <Stop stopColor="#DADADA" offset="1" />
                    </LinearGradient>
                </Defs>
            </Svg>
        )
    }
}
export const OneLinePlayButton = ({ isActive }: { isActive: boolean }) => {
    if (isActive) {
        return (<Svg width="53" height="53" viewBox="0 0 53 53" fill="none">
            <Rect width="53" height="53" rx="15" fill="#EBEBEB" />
            <Circle cx="26.5" cy="26.5" r="23" fill="url(#paint0_linear_103_4795)" stroke="url(#paint1_linear_103_4795)" />
            <Line x1="19" y1="27" x2="35" y2="27" stroke="#787878" strokeWidth="2" strokeLinecap="round" />
            <Defs>
                <LinearGradient id="paint0_linear_103_4795" x1="10.8333" y1="45.5937" x2="50" y2="6.91667" gradientUnits="userSpaceOnUse">
                    <Stop stopColor="#DBDBDB" offset="0" />
                    <Stop offset="1" stopColor="#D0D0D0" />
                </LinearGradient>
                <LinearGradient id="paint1_linear_103_4795" x1="26.5" y1="3" x2="26.5" y2="50" gradientUnits="userSpaceOnUse">
                    <Stop stopColor="#F3F3F3" offset="0" />
                    <Stop offset="1" stopColor="#DADADA" />
                </LinearGradient>
            </Defs>
        </Svg>);
    } else {
        return (
            <Svg width="53" height="53" viewBox="0 0 53 53" fill="none">
                <Rect width="53" height="53" rx="15" fill="#EBEBEB" />
                <Circle cx="26.5" cy="26.5" r="23" fill="url(#paint0_linear_193_1120)" stroke="url(#paint1_linear_193_1120)" />
                <Line x1="19" y1="27" x2="35" y2="27" stroke="#787878" strokeWidth="2" strokeLinecap="round" />
                <Defs>
                    <LinearGradient id="paint0_linear_193_1120" x1="10.8333" y1="45.5937" x2="50" y2="6.91667" gradientUnits="userSpaceOnUse">
                        <Stop stopColor="#FDFDFD" offset="0" />
                        <Stop stopColor="#DEDEDE" offset="1" />
                    </LinearGradient>
                    <LinearGradient id="paint1_linear_193_1120" x1="26.5" y1="3" x2="26.5" y2="50" gradientUnits="userSpaceOnUse">
                        <Stop stopColor="#F3F3F3" offset="0" />
                        <Stop stopColor="#DADADA" offset="1" />
                    </LinearGradient>
                </Defs>
            </Svg>
        );
    }
}