import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { StyleSheet, Text, View, Image, ImageSourcePropType } from "react-native";
import MotiPressable from "./SoundMotiPressable";
import { useMemo } from "react";

import { colors, radius, shadow, spacing, typography } from "../theme/tokens";

type FeatureCardProps = {
  title: string;
  subtitle: string;
  meta: string;
  accentColor?: string;
  backgroundImage?: ImageSourcePropType;
  onPress: () => void;
  onPressCTA?: () => void;
};

export default function FeatureCard({
  title,
  subtitle,
  meta,
  accentColor = colors.pastelBlue,
  backgroundImage,
  onPress,
  onPressCTA,
}: FeatureCardProps) {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onPressCTA) {
      onPressCTA();
    } else {
      onPress();
    }
  };

  return (
    <MotiPressable
      onPress={handlePress}
      animate={useMemo(
        () =>
          ({ pressed }) => {
            "worklet";
            return {
              scale: pressed ? 0.96 : 1,
              opacity: pressed ? 0.95 : 1,
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
      style={styles.card}
    >
      <View style={[styles.media, { backgroundColor: accentColor }]}>
        {backgroundImage && (
          <Image
            source={backgroundImage}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
          />
        )}
        <View style={backgroundImage ? styles.overlay : undefined}>
          <Text style={[styles.mediaText, backgroundImage ? styles.mediaTextWithBg : null]}>{subtitle}</Text>
        </View>
      </View>
      <View style={styles.content}>
        <View style={styles.textWrap}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.meta}>{meta}</Text>
        </View>
        <View style={styles.cta}>
          <Ionicons name="play" size={20} color={colors.textInverse} style={{ marginLeft: 3 }} />
        </View>
      </View>
    </MotiPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bgSurface,
    borderRadius: 30,
    marginBottom: spacing.md,
    overflow: "hidden",
    ...shadow.card,
  },
  media: {
    height: 120,
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  mediaText: {
    color: colors.textPrimary,
    fontSize: typography.caption,
    fontWeight: "700",
  },
  content: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  textWrap: {
    flex: 1,
    paddingRight: spacing.md,
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.subheading,
    fontWeight: "800",
  },
  meta: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    fontWeight: "600",
    marginTop: spacing.xxs,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  mediaTextWithBg: {
    color: "#FFFFFF",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  cta: {
    alignItems: "center",
    backgroundColor: colors.ctaPrimary,
    borderRadius: 24,
    height: 48,
    justifyContent: "center",
    width: 48,
    ...shadow.fab,
  },
});

