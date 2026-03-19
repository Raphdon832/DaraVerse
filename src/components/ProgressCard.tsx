import { StyleSheet, Text, View } from "react-native";

import { colors, radius, shadow, spacing, typography } from "../theme/tokens";

type ProgressCardProps = {
  label: string;
  value: string;
  helperText: string;
};

export default function ProgressCard({ label, value, helperText }: ProgressCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.helper}>{helperText}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bgSoft,
    borderRadius: 24,
    flex: 1,
    minHeight: 96,
    padding: spacing.md,
    ...shadow.soft,
  },
  label: {
    color: colors.textSecondary,
    fontSize: typography.caption,
  },
  value: {
    color: colors.textPrimary,
    fontSize: typography.subheading,
    fontWeight: "700",
    marginTop: spacing.xs,
  },
  helper: {
    color: colors.textMuted,
    fontSize: typography.caption,
    marginTop: spacing.xs,
  },
});
