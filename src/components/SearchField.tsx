import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, TextInput, View } from "react-native";

import Pressable from "./SoundPressable";
import { colors, radius, shadow, spacing, typography } from "../theme/tokens";

type SearchFieldProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  onSearchPress?: (query: string) => void;
  onSubmitEditing?: (query: string) => void;
  onClearPress?: () => void;
  onVoicePress?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  textColor?: string;
  bgColor?: string;
};

export default function SearchField({
  value,
  onChangeText,
  placeholder,
  onSearchPress,
  onSubmitEditing,
  onClearPress,
  onVoicePress,
  onFocus,
  onBlur,
  textColor = colors.textPrimary,
  bgColor = colors.bgSoft,
}: SearchFieldProps) {
  const hasValue = value.trim().length > 0;
  const hasSubmitHandler = Boolean(onSearchPress || onSubmitEditing);

  const submitSearch = (source: "button" | "keyboard") => {
    const query = value.trim();
    if (!query) return;
    if (source === "button") {
      if (onSearchPress) {
        onSearchPress(query);
      } else {
        onSubmitEditing?.(query);
      }
      return;
    }
    if (onSubmitEditing) {
      onSubmitEditing(query);
    } else {
      onSearchPress?.(query);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <Ionicons name="search-outline" size={20} color={colors.ctaPrimary} />
      <TextInput
        accessibilityLabel={placeholder}
        onChangeText={onChangeText}
        onFocus={onFocus}
        onBlur={onBlur}
        onSubmitEditing={() => {
          submitSearch("keyboard");
        }}
        placeholder={placeholder}
        placeholderTextColor={textColor === colors.textPrimary ? colors.textMuted : "rgba(255,255,255,0.6)"}
        returnKeyType="search"
        style={[styles.input, { color: textColor }]}
        value={value}
      />
      <View style={styles.actionsRow}>
        {hasValue && onClearPress ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Clear search"
            onPress={onClearPress}
            style={({ pressed }) => [
              styles.clearButton,
              pressed && styles.clearPressed,
            ]}
          >
            <Ionicons name="close-outline" size={18} color={colors.textPrimary} />
          </Pressable>
        ) : null}
        {hasSubmitHandler ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Search now"
            onPress={() => submitSearch("button")}
            style={({ pressed }) => [
              styles.searchButton,
              pressed && styles.searchPressed,
            ]}
          >
            <Ionicons name="arrow-forward-outline" size={18} color={colors.textInverse} />
          </Pressable>
        ) : null}
      </View>
      {onVoicePress ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Voice search"
          onPress={onVoicePress}
          style={({ pressed }) => [
            styles.voiceButton,
            pressed && styles.voicePressed,
          ]}
        >
          <Ionicons name="mic-outline" size={20} color={colors.textInverse} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: colors.bgSoft,
    borderRadius: radius.pill,
    flexDirection: "row",
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    height: 56,
  },
  input: {
    color: colors.textPrimary,
    flex: 1,
    fontSize: typography.body,
    marginHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  actionsRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs,
  },
  clearButton: {
    alignItems: "center",
    backgroundColor: colors.bgSurface,
    borderRadius: radius.pill,
    height: 32,
    justifyContent: "center",
    width: 32,
  },
  clearPressed: {
    opacity: 0.8,
  },
  searchButton: {
    alignItems: "center",
    backgroundColor: colors.ctaPrimary,
    borderRadius: radius.pill,
    height: 32,
    justifyContent: "center",
    width: 32,
  },
  searchPressed: {
    backgroundColor: colors.ctaPrimaryPressed,
  },
  voiceButton: {
    alignItems: "center",
    backgroundColor: colors.ctaPrimary,
    borderRadius: radius.pill,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  voicePressed: {
    backgroundColor: colors.ctaPrimaryPressed,
  },
});
