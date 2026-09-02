import { Text, TextInput } from "react-native";

function mergeDefaultProps<T extends { defaultProps?: Record<string, unknown> }>(
  component: T,
) {
  component.defaultProps = {
    ...component.defaultProps,
    allowFontScaling: false,
  };
}

export function disableAppTextScaling() {
  mergeDefaultProps(Text as unknown as { defaultProps?: Record<string, unknown> });
  mergeDefaultProps(TextInput as unknown as { defaultProps?: Record<string, unknown> });
}
