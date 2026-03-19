import { StyleSheet, type PressableProps, type StyleProp, type ViewStyle } from "react-native";
import Svg, { Path, Rect } from "react-native-svg";
import Pressable from "./SoundPressable";

type BackButtonProps = {
  onPress?: PressableProps["onPress"];
  accessibilityLabel?: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
};

// Mirrors the vector shape in /public/Buttons/BackButton.svg
export default function BackButton({
  onPress,
  accessibilityLabel = "Go back",
  size = 40,
  style,
}: BackButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [
        styles.pressable,
        { width: size, height: size },
        style,
        pressed && styles.pressed,
      ]}
    >
      <Svg width={size} height={size} viewBox="0 0 231 231" fill="none">
        <Rect x="6" y="6" width="219" height="219" rx="109.5" stroke="white" strokeWidth="12" />
        <Path
          d="M150 67L83.3123 113.391C82.1818 114.178 82.1658 115.845 83.2808 116.653L150 165"
          stroke="#E3CF91"
          strokeWidth="21"
          strokeLinecap="round"
        />
      </Svg>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.97 }],
  },
});
