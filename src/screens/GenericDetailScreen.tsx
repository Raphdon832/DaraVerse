import { useRoute } from "@react-navigation/native";
import { MotiView } from "moti";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AppHeader from "../components/AppHeader";
import { useResponsiveLayout } from "../hooks/useResponsiveLayout";
import { useRootNavigation } from "../hooks/useRootNavigation";
import { colors, radius, shadow, spacing, typography } from "../theme/tokens";

export default function GenericDetailScreen() {
  const route = useRoute();
  const rootNavigation = useRootNavigation();
  const { contentMaxWidth, horizontalPadding } = useResponsiveLayout();
  const responsiveContainerStyle = {
    alignSelf: "center" as const,
    maxWidth: contentMaxWidth,
    paddingHorizontal: horizontalPadding,
    width: "100%" as const,
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <ScrollView contentContainerStyle={[styles.content, responsiveContainerStyle]}>
        <AppHeader
          title={route.name}
          subtitle="Detail view"
          showHomeAction
          onPressHome={() => rootNavigation.goBack()}
        />
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "spring", delay: 100 }}
          style={styles.card}
        >
          <Text style={styles.label}>Route Params</Text>
          <Text style={styles.value}>
            {route.params ? JSON.stringify(route.params, null, 2) : "No params provided."}
          </Text>
        </MotiView>
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: "timing", duration: 400, delay: 300 }}
        >
          <Text style={styles.note}>
            This detail page is scaffolded and ready for feature-specific content implementation.
          </Text>
        </MotiView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.pastelPurple,
  },
  content: {
    padding: spacing.md,
  },
  card: {
    backgroundColor: colors.bgSurface,
    borderRadius: 30,
    padding: spacing.xl,
    ...shadow.card,
  },
  label: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    marginBottom: spacing.sm,
  },
  value: {
    color: colors.textPrimary,
    fontSize: typography.body,
    fontFamily: "monospace",
    fontWeight: "600",
  },
  note: {
    color: colors.textMuted,
    fontSize: typography.caption,
    marginTop: spacing.md,
  },
});
