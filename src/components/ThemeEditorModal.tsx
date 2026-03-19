import React from "react";
import { Modal, View, Text, StyleSheet, ScrollView, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useAppState } from "../context/AppStateContext";
import Pressable from "./SoundPressable";
import { colors, radius, shadow, spacing, typography } from "../theme/tokens";
import type { AppTheme } from "../types/models";

const PRESET_COLORS = [
    "#FFFFFF", "#000000", "#E3F2FD", "#F3E8FF", "#FCE4EC", "#E8F5E9",
    "#FFF3E0", "#FFEBEE", "#E0F7FA", "#FEF08A", "#A7F3D0", "#DDD6FE", "#FECACA"
];
const PRESET_BG_COLORS = [
    "#FFFFFF", "#F8FAFC", "#F1F5F9", "#FFF7ED", "#F0FDF4",
    "#1E293B", "#0F172A", "#18181B", "#312E81"
];
const PRESET_PRIMARIES = [
    "#FFFFFF", "#000000", "#0284C7", "#7C3AED", "#DB2777", "#16A34A",
    "#EA580C", "#DC2626", "#0891B2", "#D97706", "#4F46E5", "#059669"
];
const PRESET_IMAGES = [
    "https://images.unsplash.com/photo-1534796636918-9f1d0ca1c166?q=80&w=400&fit=crop", // Space
    "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=400&fit=crop", // Abstract
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=400&fit=crop", // Nature/Leaves
    "https://images.unsplash.com/photo-1506744626753-1fa44df31c78?q=80&w=400&fit=crop", // Mountains
    "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=400&fit=crop", // Circuit/Tech
    "https://images.unsplash.com/photo-1620121692029-d088224ddc74?q=80&w=400&fit=crop", // Gradient
];

const getContrastColor = (hex: string) => {
    if (!hex || hex.length < 7) return "#1E293B";
    const r = parseInt(hex.substring(1, 3), 16);
    const g = parseInt(hex.substring(3, 5), 16);
    const b = parseInt(hex.substring(5, 7), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.6 ? "#1E293B" : "#FFFFFF";
};

type Props = {
    visible: boolean;
    onClose: () => void;
};

export default function ThemeEditorModal({ visible, onClose }: Props) {
    const { state, updateTheme } = useAppState();
    const theme = state.theme;

    const handleUpdate = (updates: Partial<AppTheme>) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        updateTheme(updates);
    };

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <View style={s.overlay}>
                <Pressable style={s.dismissArea} onPress={onClose} />
                <View style={s.sheet}>
                    <View style={s.handle} />
                    <Text style={s.title}>Customize Theme</Text>

                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>

                        {/* Avatar Background */}
                        <Text style={s.sectionTitle}>Avatar Background</Text>

                        <Text style={s.subsectionLabel}>Solid Colors</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.pickerScroll}>
                            {PRESET_COLORS.map((color) => {
                                const isSelected = theme.avatarBgType === "color" && theme.avatarBgValue === color;
                                return (
                                    <Pressable
                                        key={color}
                                        style={[
                                            s.swatch,
                                            { backgroundColor: color },
                                            color.toUpperCase() === "#FFFFFF" && !isSelected && { borderWidth: 1, borderColor: colors.borderSoft },
                                            isSelected && s.swatchSelected
                                        ]}
                                        onPress={() => handleUpdate({ avatarBgType: "color", avatarBgValue: color })}
                                    >
                                        {isSelected && <Ionicons name="checkmark" size={20} color={getContrastColor(color)} />}
                                    </Pressable>
                                );
                            })}
                        </ScrollView>

                        <Text style={s.subsectionLabel}>Images</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.pickerScroll}>
                            {PRESET_IMAGES.map((url) => {
                                const isSelected = theme.avatarBgType === "image" && theme.avatarBgValue === url;
                                return (
                                    <Pressable
                                        key={url}
                                        style={[s.imageBox, isSelected && s.swatchSelected]}
                                        onPress={() => handleUpdate({ avatarBgType: "image", avatarBgValue: url })}
                                    >
                                        <Image source={{ uri: url }} style={StyleSheet.absoluteFill} />
                                        {isSelected && (
                                            <View style={s.checkBg}>
                                                <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                                            </View>
                                        )}
                                    </Pressable>
                                );
                            })}
                        </ScrollView>

                        {/* App Primary Color */}
                        <Text style={s.sectionTitle}>App Accent Color</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.pickerScroll}>
                            {PRESET_PRIMARIES.map((color) => {
                                const isSelected = theme.primaryColor === color;
                                return (
                                    <Pressable
                                        key={color}
                                        style={[
                                            s.swatch,
                                            { backgroundColor: color },
                                            color.toUpperCase() === "#FFFFFF" && !isSelected && { borderWidth: 1, borderColor: colors.borderSoft },
                                            isSelected && s.swatchSelected
                                        ]}
                                        onPress={() => handleUpdate({ primaryColor: color })}
                                    >
                                        {isSelected && <Ionicons name="checkmark" size={20} color={getContrastColor(color)} />}
                                    </Pressable>
                                );
                            })}
                        </ScrollView>

                        {/* App Base Background Color */}
                        <Text style={s.sectionTitle}>App Background</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.pickerScroll}>
                            {PRESET_BG_COLORS.map((color) => {
                                const isSelected = theme.appBgColor === color;
                                return (
                                    <Pressable
                                        key={color}
                                        style={[
                                            s.swatch,
                                            { backgroundColor: color },
                                            color.toUpperCase() === "#FFFFFF" && !isSelected && { borderWidth: 1, borderColor: colors.borderSoft },
                                            isSelected && s.swatchSelected
                                        ]}
                                        onPress={() => handleUpdate({ appBgColor: color })}
                                    >
                                        {isSelected && <Ionicons name="checkmark" size={20} color={getContrastColor(color)} />}
                                    </Pressable>
                                );
                            })}
                        </ScrollView>

                        {/* Icon Style */}
                        <Text style={s.sectionTitle}>Icon Style</Text>
                        <View style={s.iconStyleRow}>
                            <Pressable
                                style={[s.iconStyleBtn, theme.iconType === "outline" && s.iconStyleBtnActive]}
                                onPress={() => handleUpdate({ iconType: "outline" })}
                            >
                                <Ionicons name="star-outline" size={24} color={theme.iconType === "outline" ? theme.primaryColor : colors.textSecondary} />
                                <Text style={[s.iconStyleText, theme.iconType === "outline" && { color: theme.primaryColor }]}>Outline</Text>
                            </Pressable>

                            <Pressable
                                style={[s.iconStyleBtn, theme.iconType === "filled" && s.iconStyleBtnActive]}
                                onPress={() => handleUpdate({ iconType: "filled" })}
                            >
                                <Ionicons name="star" size={24} color={theme.iconType === "filled" ? theme.primaryColor : colors.textSecondary} />
                                <Text style={[s.iconStyleText, theme.iconType === "filled" && { color: theme.primaryColor }]}>Filled</Text>
                            </Pressable>
                        </View>

                    </ScrollView>

                    <Pressable style={s.closeBtn} onPress={onClose}>
                        <Text style={s.closeBtnText}>Done</Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
    );
}

const s = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: "flex-end",
    },
    dismissArea: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
    },
    sheet: {
        backgroundColor: colors.bgSurface,
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        padding: spacing.lg,
        maxHeight: "85%",
        ...shadow.card,
    },
    handle: {
        width: 40,
        height: 5,
        borderRadius: 3,
        backgroundColor: colors.bgSoft,
        alignSelf: "center",
        marginBottom: spacing.md,
    },
    title: {
        fontSize: 22,
        fontWeight: "900",
        color: colors.textPrimary,
        marginBottom: spacing.md,
    },
    content: {
        paddingBottom: spacing.xl,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "800",
        color: colors.textPrimary,
        marginTop: spacing.lg,
        marginBottom: spacing.sm,
    },
    subsectionLabel: {
        fontSize: 13,
        fontWeight: "600",
        color: colors.textSecondary,
        marginBottom: spacing.xs,
        marginTop: spacing.sm,
    },
    pickerScroll: {
        flexDirection: "row",
        paddingVertical: spacing.xs,
    },
    swatch: {
        width: 48,
        height: 48,
        borderRadius: 24,
        marginRight: spacing.sm,
        borderWidth: 3,
        borderColor: "transparent",
        alignItems: "center",
        justifyContent: "center",
    },
    swatchSelected: {
        borderColor: colors.textPrimary,
    },
    imageBox: {
        width: 80,
        height: 80,
        borderRadius: 16,
        marginRight: spacing.sm,
        overflow: "hidden",
        borderWidth: 3,
        borderColor: "transparent",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.bgSoft,
    },
    checkBg: {
        backgroundColor: "rgba(0,0,0,0.5)",
        padding: 4,
        borderRadius: 12,
    },
    iconStyleRow: {
        flexDirection: "row",
        gap: spacing.md,
    },
    iconStyleBtn: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: spacing.sm,
        padding: spacing.md,
        backgroundColor: colors.bgCanvas,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: "transparent",
    },
    iconStyleBtnActive: {
        borderColor: colors.borderSoft,
        backgroundColor: colors.bgSoft,
    },
    iconStyleText: {
        fontSize: 14,
        fontWeight: "700",
        color: colors.textSecondary,
    },
    closeBtn: {
        backgroundColor: colors.textPrimary,
        paddingVertical: 16,
        borderRadius: radius.pill,
        alignItems: "center",
        marginTop: spacing.md,
    },
    closeBtnText: {
        fontSize: typography.body,
        fontWeight: "800",
        color: "#FFFFFF",
    },
});
