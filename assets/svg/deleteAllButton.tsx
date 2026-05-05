import Svg, { Line, Rect } from "react-native-svg";

export const DeleteAllButton = () => {
  return (
    <Svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <Rect width="36" height="36" rx="18" fill="#787878" fillOpacity="0.3" />
      <Line
        x1="12.7071"
        y1="12.707"
        x2="24.0208"
        y2="24.0207"
        stroke="#787878"
        strokeLinecap="round"
      />
      <Line
        x1="24.0205"
        y1="12.7071"
        x2="12.7068"
        y2="24.0208"
        stroke="#787878"
        strokeLinecap="round"
      />
    </Svg>
  );
};
