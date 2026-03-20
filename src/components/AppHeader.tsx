import { Ionicons } from "@expo/vector-icons";
import { Image, Platform, StyleSheet, Text, View, type ImageSourcePropType } from "react-native";

import BackButton from "./BackButton";
import Pressable from "./SoundPressable";
import { useRootNavigation } from "../hooks/useRootNavigation";
import { colors, radius, spacing, typography } from "../theme/tokens";
import { useNotifications } from "../hooks/useNotifications";

type AppHeaderProps = {
  title: string;
  subtitle?: string;
  showHomeAction?: boolean;
  onPressHome?: () => void;
  showNotification?: boolean;
  onPressNotification?: () => void;
  showSearch?: boolean;
  onPressSearch?: () => void;
  avatarSource?: ImageSourcePropType;
  onPressAvatar?: () => void;
  textColor?: string;
  showLogo?: boolean;
  subtitleTop?: boolean;
};

export default function AppHeader({
  title,
  subtitle,
  showHomeAction = false,
  onPressHome,
  showNotification = false,
  onPressNotification,
  showSearch = showHomeAction,
  onPressSearch,
  avatarSource,
  onPressAvatar,
  textColor = colors.textPrimary,
  showLogo = false,
  subtitleTop = false,
}: AppHeaderProps) {
  const rootNavigation = useRootNavigation();
  const { unreadCount } = useNotifications();

  const handleBackPress = () => {
    if (onPressHome) {
      onPressHome();
      return;
    }
    rootNavigation.navigate("HomeHub");
  };

  const handleSearchPress = () => {
    if (onPressSearch) {
      onPressSearch();
      return;
    }
    rootNavigation.navigate("HomeHub");
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.row}>
        <View style={styles.leftSide}>
          {showHomeAction ? (
            <BackButton accessibilityLabel="Go to previous screen" onPress={handleBackPress} />
          ) : (
            <Pressable
              onPress={onPressAvatar}
              style={({ pressed }) => [styles.avatar, pressed && styles.pressedButton]}
              accessibilityRole="button"
              accessibilityLabel="Open profile"
            >
              {avatarSource ? (
                <Image source={avatarSource} style={styles.avatarImage} />
              ) : (
                <Ionicons name="happy-outline" size={28} color={colors.statusWarning} />
              )}
            </Pressable>
          )}

          <View style={styles.textBlock}>
            {subtitle && subtitleTop ? (
              <Text style={[styles.subtitle, { color: textColor }]} numberOfLines={1}>
                {subtitle}
              </Text>
            ) : null}
            <View style={styles.titleRow}>
              {showLogo && (
                <Image
                  source={require("../../assets/Daraverse Logo New Main.png")}
                  style={styles.logoMini}
                  resizeMode="contain"
                />
              )}
              <Text style={[styles.title, { color: textColor }]} numberOfLines={1}>
                {title}
              </Text>
            </View>
            {subtitle && !subtitleTop ? (
              <Text style={[styles.subtitle, { color: textColor }]} numberOfLines={2}>
                {subtitle}
              </Text>
            ) : null}
          </View>
        </View>

        <View style={styles.rightSlot}>
          {showSearch ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Search across the app"
              onPress={handleSearchPress}
              style={({ pressed }) => [styles.iconOnlyButton, pressed && styles.pressedButton]}
            >
              <Ionicons name="search-outline" size={22} color={textColor} />
            </Pressable>
          ) : null}
          {showNotification ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Open notifications"
              onPress={onPressNotification}
              style={({ pressed }) => [styles.iconOnlyButton, pressed && styles.pressedButton]}
            >
              <Ionicons name="notifications-outline" size={24} color={textColor} />
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unreadCount > 9 ? "9+" : unreadCount}</Text>
                </View>
              )}
            </Pressable>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingTop: Platform.OS === "web" ? spacing.lg : spacing.sm,
    marginBottom: spacing.md,
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  leftSide: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  rightSlot: {
    minWidth: 44,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: spacing.xs,
  },
  textBlock: {
    flex: 1,
    minWidth: 0,
    paddingHorizontal: spacing.sm,
    justifyContent: "center",
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.heading,
    fontWeight: "800",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoMini: {
    width: 28,
    height: 28,
    marginRight: 6,
  },
  subtitle: {
    color: colors.textPrimary,
    fontSize: typography.caption,
    fontWeight: "600",
    marginTop: 2,
  },
  iconOnlyButton: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  pressedButton: {
    opacity: 0.75,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.statusSuccess,
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  badge: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: colors.statusError,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: colors.bgSurface,
  },
  badgeText: {
    color: colors.bgSurface,
    fontSize: 8,
    fontWeight: "900",
  },
});
