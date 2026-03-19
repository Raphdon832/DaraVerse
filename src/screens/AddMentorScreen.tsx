import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useEffect, useMemo, useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AnimatedButton from "../components/AnimatedButton";
import AppHeader from "../components/AppHeader";
import Pressable from "../components/SoundPressable";
import { useAuth } from "../context/AuthContext";
import { addMentorAsAdmin } from "../services/mentorshipService";
import {
    subscribeAppUsers,
    subscribeUserRole,
    type AppUserSummary,
    type UserRole,
} from "../services/userService";
import { colors, radius, shadow, spacing, typography } from "../theme/tokens";
import type { MentorshipStackParamList } from "../types/navigation";

type Props = NativeStackScreenProps<MentorshipStackParamList, "AddMentor">;

export default function AddMentorScreen({ navigation }: Props) {
    const { user } = useAuth();
    const [userRole, setUserRole] = useState<UserRole>("learner");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [name, setName] = useState("");
    const [specialty, setSpecialty] = useState("");
    const [description, setDescription] = useState("");
    const [openSlotsLabel, setOpenSlotsLabel] = useState("");
    const [availabilityCsv, setAvailabilityCsv] = useState("");
    const [expertiseCsv, setExpertiseCsv] = useState("");
    const [userSearch, setUserSearch] = useState("");
    const [showUserDropdown, setShowUserDropdown] = useState(false);
    const [appUsers, setAppUsers] = useState<AppUserSummary[]>([]);
    const [selectedUser, setSelectedUser] = useState<AppUserSummary | null>(null);
    const [userDirectoryError, setUserDirectoryError] = useState<string | null>(null);

    const isAdmin = userRole === "admin";

    useEffect(() => {
        if (!user) {
            setUserRole("learner");
            return;
        }

        const unsubscribe = subscribeUserRole(user.uid, (role) => {
            setUserRole(role);
        });
        return unsubscribe;
    }, [user]);

    useEffect(() => {
        if (!isAdmin) {
            setAppUsers([]);
            setUserDirectoryError(null);
            return;
        }

        const unsubscribe = subscribeAppUsers((users) => {
            setAppUsers(users.filter((item) => item.isRegistered));
            setUserDirectoryError(null);
        }, (error) => {
            if (error.code === "permission-denied") {
                setUserDirectoryError(
                    "Permission denied when loading users. Update Firestore rules to allow admin user-directory reads.",
                );
            } else {
                setUserDirectoryError("Unable to load users right now.");
            }
        });

        return unsubscribe;
    }, [isAdmin]);

    const canSubmit = useMemo(
        () => isAdmin && !isSubmitting,
        [isAdmin, isSubmitting],
    );

    const filteredUsers = useMemo(() => {
        const term = userSearch.trim().toLowerCase();
        if (!term) {
            return appUsers;
        }
        return appUsers.filter((item) =>
            item.firstName.toLowerCase().includes(term) ||
            item.uid.toLowerCase().includes(term),
        );
    }, [appUsers, userSearch]);

    const handleSubmit = async () => {
        if (!user) {
            Alert.alert("Authentication required", "Please sign in as an admin.");
            return;
        }

        if (!isAdmin) {
            Alert.alert("Permission denied", "Only admin users can create mentors.");
            return;
        }

        const missingFields: string[] = [];
        if (name.trim().length < 2) missingFields.push("Mentor Name");
        if (specialty.trim().length < 2) missingFields.push("Specialty");
        if (description.trim().length < 8) missingFields.push("Description");
        if (openSlotsLabel.trim().length < 1) missingFields.push("Open Slots Label");
        if (!selectedUser) missingFields.push("Linked User");

        if (missingFields.length > 0) {
            Alert.alert(
                "Incomplete form",
                `Please complete: ${missingFields.join(", ")}`,
            );
            return;
        }
        const linkedUser = selectedUser;
        if (!linkedUser) {
            Alert.alert("Incomplete form", "Please select a linked user.");
            return;
        }

        setIsSubmitting(true);
        try {
            await addMentorAsAdmin(user.uid, {
                name,
                linkedUserId: linkedUser.uid,
                linkedUserName: linkedUser.firstName,
                specialty,
                description,
                openSlotsLabel,
                expertiseTags: expertiseCsv.split(",").map((item) => item.trim()).filter(Boolean),
                availabilitySlots: availabilityCsv
                    .split(",")
                    .map((item) => item.trim())
                    .filter(Boolean),
            });
            Alert.alert("Mentor added", "The mentor is now available in live mentorship data.");
            navigation.goBack();
        } catch (error) {
            Alert.alert(
                "Unable to add mentor",
                error instanceof Error ? error.message : "Please try again.",
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <SafeAreaView edges={["top"]} style={styles.safeArea}>
            <KeyboardAvoidingView
                style={styles.keyboardAvoiding}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 24 : 0}
            >
            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
            >
                <AppHeader
                    title="Add Mentor"
                    subtitle="Admin only"
                    showHomeAction
                    onPressHome={() => navigation.goBack()}
                />

                {userRole !== "admin" ? (
                    <View style={styles.lockedCard}>
                        <Text style={styles.lockedTitle}>Admin access required</Text>
                        <Text style={styles.lockedText}>
                            Only users with `role = admin` can add mentors.
                        </Text>
                    </View>
                ) : (
                    <View style={styles.formCard}>
                        <Text style={styles.label}>Link App User (Required)</Text>
                        <Pressable
                            accessibilityRole="button"
                            accessibilityLabel="Open user dropdown"
                            onPress={() => setShowUserDropdown((prev) => !prev)}
                            style={({ pressed }) => [
                                styles.userPickerButton,
                                pressed && styles.userPickerButtonPressed,
                            ]}
                        >
                            <Text style={styles.userPickerText}>
                                {selectedUser
                                    ? `${selectedUser.firstName} (${selectedUser.uid.slice(0, 8)}...)`
                                    : "Select a user account to link"}
                            </Text>
                        </Pressable>

                        {showUserDropdown ? (
                            <View style={styles.userDropdownCard}>
                                <TextInput
                                    value={userSearch}
                                    onChangeText={setUserSearch}
                                    placeholder="Search by name or UID"
                                    placeholderTextColor={colors.textMuted}
                                    style={styles.input}
                                />

                                <ScrollView
                                    style={styles.userList}
                                    nestedScrollEnabled
                                    keyboardShouldPersistTaps="handled"
                                >
                                    {filteredUsers.length === 0 ? (
                                        <Text style={styles.emptyUsersText}>No matching users found.</Text>
                                    ) : (
                                        filteredUsers.map((appUser) => (
                                            <Pressable
                                                key={appUser.uid}
                                                accessibilityRole="button"
                                                accessibilityLabel={`Select ${appUser.firstName}`}
                                                onPress={() => {
                                                    setSelectedUser(appUser);
                                                    setShowUserDropdown(false);
                                                }}
                                                style={({ pressed }) => [
                                                    styles.userOption,
                                                    selectedUser?.uid === appUser.uid && styles.userOptionSelected,
                                                    pressed && styles.userOptionPressed,
                                                ]}
                                            >
                                                <Text style={styles.userOptionName}>{appUser.firstName}</Text>
                                                <Text style={styles.userOptionMeta}>
                                                    {appUser.role} • {appUser.uid.slice(0, 10)}...
                                                </Text>
                                            </Pressable>
                                        ))
                                    )}
                                </ScrollView>
                            </View>
                        ) : null}

                        {userDirectoryError ? (
                            <Text style={styles.userErrorText}>{userDirectoryError}</Text>
                        ) : null}

                        <Text style={styles.label}>Mentor Name</Text>
                        <TextInput
                            value={name}
                            onChangeText={setName}
                            placeholder="e.g. Grace"
                            placeholderTextColor={colors.textMuted}
                            style={styles.input}
                        />

                        <Text style={styles.label}>Specialty</Text>
                        <TextInput
                            value={specialty}
                            onChangeText={setSpecialty}
                            placeholder="e.g. Robotics Mentor"
                            placeholderTextColor={colors.textMuted}
                            style={styles.input}
                        />

                        <Text style={styles.label}>Description</Text>
                        <TextInput
                            value={description}
                            onChangeText={setDescription}
                            placeholder="Short summary of mentoring support"
                            placeholderTextColor={colors.textMuted}
                            style={[styles.input, styles.textArea]}
                            multiline
                        />

                        <Text style={styles.label}>Open Slots Label</Text>
                        <TextInput
                            value={openSlotsLabel}
                            onChangeText={setOpenSlotsLabel}
                            placeholder="e.g. 3 open slots this week"
                            placeholderTextColor={colors.textMuted}
                            style={styles.input}
                        />

                        <Text style={styles.label}>Availability (comma-separated)</Text>
                        <TextInput
                            value={availabilityCsv}
                            onChangeText={setAvailabilityCsv}
                            placeholder="Tue 4PM, Thu 6PM"
                            placeholderTextColor={colors.textMuted}
                            style={styles.input}
                        />

                        <Text style={styles.label}>Expertise Tags (comma-separated)</Text>
                        <TextInput
                            value={expertiseCsv}
                            onChangeText={setExpertiseCsv}
                            placeholder="Cybersecurity, Leadership"
                            placeholderTextColor={colors.textMuted}
                            style={styles.input}
                        />
                    </View>
                )}

                {userRole === "admin" ? (
                    <AnimatedButton
                        label={isSubmitting ? "Saving..." : "Create Mentor"}
                        onPress={handleSubmit}
                        disabled={!canSubmit}
                        style={styles.submitButton}
                        textStyle={styles.submitText}
                    />
                ) : null}
            </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.pastelPurple,
    },
    keyboardAvoiding: {
        flex: 1,
    },
    content: {
        padding: spacing.md,
        paddingBottom: spacing.xxl,
    },
    lockedCard: {
        backgroundColor: colors.bgSurface,
        borderRadius: radius.xxl,
        padding: spacing.lg,
        ...shadow.card,
    },
    lockedTitle: {
        color: colors.textPrimary,
        fontSize: typography.subheading,
        fontWeight: "900",
        marginBottom: spacing.xs,
    },
    lockedText: {
        color: colors.textSecondary,
        fontSize: typography.body,
        lineHeight: 22,
    },
    formCard: {
        backgroundColor: colors.bgSurface,
        borderRadius: radius.xxl,
        padding: spacing.lg,
        ...shadow.card,
    },
    label: {
        color: colors.textPrimary,
        fontSize: typography.caption,
        fontWeight: "800",
        marginBottom: spacing.xs,
        marginTop: spacing.sm,
    },
    input: {
        backgroundColor: colors.bgSoft,
        borderRadius: radius.lg,
        color: colors.textPrimary,
        fontSize: typography.body,
        fontWeight: "600",
        minHeight: 48,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.sm,
    },
    userPickerButton: {
        backgroundColor: colors.bgSoft,
        borderRadius: radius.lg,
        minHeight: 48,
        justifyContent: "center",
        paddingHorizontal: spacing.sm,
        marginBottom: spacing.sm,
    },
    userPickerButtonPressed: {
        opacity: 0.85,
    },
    userPickerText: {
        color: colors.textPrimary,
        fontSize: typography.body,
        fontWeight: "600",
    },
    userDropdownCard: {
        backgroundColor: colors.bgCanvas,
        borderRadius: radius.lg,
        padding: spacing.sm,
        marginBottom: spacing.sm,
        borderWidth: 1,
        borderColor: colors.borderSoft,
    },
    userList: {
        maxHeight: 220,
        marginTop: spacing.sm,
    },
    emptyUsersText: {
        color: colors.textSecondary,
        fontSize: typography.caption,
        fontWeight: "600",
        paddingVertical: spacing.sm,
    },
    userOption: {
        backgroundColor: colors.bgSurface,
        borderRadius: radius.md,
        padding: spacing.sm,
        marginBottom: spacing.xs,
    },
    userOptionSelected: {
        borderWidth: 1,
        borderColor: colors.ctaPrimary,
        backgroundColor: colors.pastelPeach,
    },
    userOptionPressed: {
        opacity: 0.85,
    },
    userOptionName: {
        color: colors.textPrimary,
        fontSize: typography.body,
        fontWeight: "700",
    },
    userOptionMeta: {
        color: colors.textSecondary,
        fontSize: typography.caption,
        fontWeight: "600",
        marginTop: spacing.xxs,
        textTransform: "capitalize",
    },
    userErrorText: {
        color: "#C33A2E",
        fontSize: typography.caption,
        fontWeight: "600",
        marginBottom: spacing.sm,
    },
    textArea: {
        minHeight: 96,
        textAlignVertical: "top",
    },
    submitButton: {
        marginTop: spacing.md,
    },
    submitText: {
        fontSize: typography.subheading,
    },
});
