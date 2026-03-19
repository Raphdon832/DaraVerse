import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import type { ComponentProps } from "react";
import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import MotiPressable from "./SoundMotiPressable";

import { colors, radius, shadow, spacing, typography } from "../theme/tokens";

type IconName = ComponentProps<typeof Ionicons>["name"];

type QuickLinkCardProps = {
  title: string;
  subtitle: string;
  iconName: IconName;
  tone: "blue" | "green" | "purple" | "peach";
  onPress: () => void;
};

const toneMap = {
  blue: colors.pastelBlue,
  green: colors.pastelGreen,
  purple: colors.pastelPurple,
  peach: colors.pastelPeach,
} as const;

export default function QuickLinkCard({
  title,
  subtitle,
  iconName,
  tone,
  onPress,
}: QuickLinkCardProps) {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <MotiPressable
      accessibilityRole="button"
      accessibilityLabel={`Go to ${title}`}
      onPress={handlePress}
      animate={useMemo(
        () =>
          ({ pressed }) => {
            "worklet";
            return {
              scale: pressed ? 0.95 : 1,
            };
          },
        []
      )}
      transition={{
        type: "spring",
        damping: 15,
        mass: 0.8,
        stiffness: 250,
      }}
      style={[styles.card, { backgroundColor: toneMap[tone] }]}
    >
      <View style={styles.iconWrap}>
        <Ionicons name={iconName} size={24} color={colors.textPrimary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </MotiPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 30,
    flexBasis: "48%",
    marginBottom: spacing.md,
    minHeight: 128,
    padding: spacing.lg,
  },
  iconWrap: {
    alignItems: "center",
    backgroundColor: colors.bgSurface,
    borderRadius: 24,
    height: 48,
    justifyContent: "center",
    marginBottom: spacing.sm,
    width: 48,
    ...shadow.soft,
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.body,
    fontWeight: "800",
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    fontWeight: "600",
    marginTop: spacing.xxs,
  },
});

