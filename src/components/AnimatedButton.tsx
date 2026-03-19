import * as Haptics from "expo-haptics";
import { useMemo } from "react";
import { Text, StyleSheet, type ViewStyle, type TextStyle } from "react-native";
import MotiPressable from "./SoundMotiPressable";
import { colors, radius, typography, shadow } from "../theme/tokens";

type Props = {
    label: string;
    onPress: () => void;
    style?: ViewStyle;
    textStyle?: TextStyle;
    disabled?: boolean;
    hapticFeedback?: "light" | "success" | "none";
};

export default function AnimatedButton({
    label,
    onPress,
    style,
    textStyle,
    disabled = false,
    hapticFeedback = "light",
}: Props) {
    const handlePress = () => {
        if (disabled) return;

        if (hapticFeedback === "light") {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } else if (hapticFeedback === "success") {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }

        onPress();
    };

    return (
        <MotiPressable
            onPress={handlePress}
            disabled={disabled}
            animate={useMemo(
                () =>
                    ({ pressed, hovered }) => {
                        "worklet";
                        return {
                            scale: pressed ? 0.95 : hovered ? 1.02 : 1,
                            opacity: disabled ? 0.5 : pressed ? 0.95 : 1,
                        };
                    },
                [disabled]
            )}
            transition={{
                type: "spring",
                damping: 15,
                mass: 0.5,
                stiffness: 250,
            }}
            style={[styles.button, style]}
        >
            <Text style={[styles.text, textStyle]}>{label}</Text>
        </MotiPressable>
    );
}

const styles = StyleSheet.create({
    button: {
        backgroundColor: colors.ctaPrimary,
        borderRadius: 30,
        paddingVertical: 16,
        paddingHorizontal: 24,
        alignItems: "center",
        justifyContent: "center",
        ...shadow.fab,
    },
    text: {
        color: colors.textInverse,
        fontSize: typography.heading,
        fontWeight: "800",
        textAlign: "center",
    },
});

