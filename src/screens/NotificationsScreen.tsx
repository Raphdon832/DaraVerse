import { Ionicons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AnimatePresence, MotiView } from "moti";
import { useEffect, useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AppHeader from "../components/AppHeader";
import MotiPressable from "../components/SoundMotiPressable";
import { useNotifications } from "../hooks/useNotifications";
import { useResponsiveLayout } from "../hooks/useResponsiveLayout";
import { colors, radius, shadow, spacing, typography } from "../theme/tokens";
import type { RootStackParamList } from "../types/navigation";

type Props = NativeStackScreenProps<RootStackParamList, "Notifications">;

export default function NotificationsScreen({ navigation }: Props) {
    const { notifications, markNotificationsRead } = useNotifications();
    const { contentMaxWidth, horizontalPadding } = useResponsiveLayout();

    useEffect(() => {
        markNotificationsRead();
    }, []);

    const formatRelativeTime = (ts: number): string => {
        if (!ts) return "Milestone";
        const diffMs = Date.now() - ts;
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        if (diffMinutes < 1) return "Just now";
        if (diffMinutes < 60) return `${diffMinutes}m ago`;
        const diffHours = Math.floor(diffMinutes / 60);
        if (diffHours < 24) return `${diffHours}h ago`;
        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays}d ago`;
    };

    const pressScale98 = { scale: 0.98 };

    const contentContainerStyle = useMemo(
        () => [
            styles.content,
            {
                alignSelf: "center" as const,
                maxWidth: contentMaxWidth,
                paddingHorizontal: horizontalPadding,
                width: "100%" as const,
            },
        ],
        [contentMaxWidth, horizontalPadding],
    );

    return (
        <SafeAreaView edges={["top"]} style={styles.safeArea}>
            <View
                style={{
                    alignSelf: "center",
                    maxWidth: contentMaxWidth,
                    paddingHorizontal: horizontalPadding,
                    width: "100%" as const,
                }}
            >
                <AppHeader
                    title="Notifications"
                    subtitle="Live updates from your Daraverse journey"
                    showHomeAction
                    onPressHome={() => navigation.goBack()}
                />
            </View>

            <ScrollView contentContainerStyle={contentContainerStyle} showsVerticalScrollIndicator={false}>
                {notifications.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="notifications-off-outline" size={48} color={colors.textSecondary} />
                        <Text style={styles.emptyTitle}>All caught up!</Text>
                        <Text style={styles.emptySubtitle}>You'll see mission completions, badge unlocks, and mentor updates here.</Text>
                    </View>
                ) : (
                    <View style={styles.list}>
                        <AnimatePresence>
                            {notifications.map((notif, idx) => (
                                <MotiView
                                    key={notif.id}
                                    from={{ opacity: 0, translateY: 10 }}
                                    animate={{ opacity: 1, translateY: 0 }}
                                    transition={{ delay: idx * 50 }}
                                >
                                    <MotiPressable
                                        onPress={() => navigation.navigate("MainTabs", notif.onPressParams)}
                                        style={styles.card}
                                        animate={pressScale98}
                                    >
                                        <View style={[styles.iconWrap, { backgroundColor: notif.color }]}>
                                            <Ionicons name={notif.icon as any} size={20} color={colors.textPrimary} />
                                        </View>
                                        <View style={styles.textWrap}>
                                            <View style={styles.headerRow}>
                                                <Text style={styles.notifTitle}>{notif.title}</Text>
                                                <Text style={styles.timeText}>
                                                    {notif.isMilestone ? "Milestone" : formatRelativeTime(notif.timestamp)}
                                                </Text>
                                            </View>
                                            <Text style={styles.bodyText} numberOfLines={2}>{notif.body}</Text>
                                        </View>
                                    </MotiPressable>
                                </MotiView>
                            ))}
                        </AnimatePresence>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.bgCanvas,
    },
    content: {
        padding: spacing.md,
        paddingBottom: spacing.xl,
    },
    emptyState: {
        alignItems: "center",
        marginTop: 100,
        padding: spacing.xl,
    },
    emptyTitle: {
        fontSize: typography.subheading,
        fontWeight: "800",
        color: colors.textPrimary,
        marginTop: spacing.md,
    },
    emptySubtitle: {
        fontSize: typography.body,
        color: colors.textSecondary,
        textAlign: "center",
        marginTop: spacing.sm,
    },
    list: {
        gap: spacing.sm,
    },
    card: {
        backgroundColor: colors.bgSurface,
        borderRadius: radius.lg,
        padding: spacing.md,
        flexDirection: "row",
        gap: spacing.md,
        ...shadow.soft,
    },
    iconWrap: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    textWrap: {
        flex: 1,
    },
    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 2,
    },
    notifTitle: {
        fontSize: 14,
        fontWeight: "800",
        color: colors.textPrimary,
    },
    timeText: {
        fontSize: 11,
        fontWeight: "600",
        color: colors.textSecondary,
    },
    bodyText: {
        fontSize: 13,
        color: colors.textSecondary,
        lineHeight: 18,
    },
});
