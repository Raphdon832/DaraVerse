import { useMemo } from "react";
import { useAppState } from "../context/AppStateContext";
import { colors } from "../theme/tokens";
import type { StemCategoryId } from "../types/models";

export type AppNotification = {
    id: string;
    title: string;
    body: string;
    time: string;
    icon: string;
    color: string;
    onPressParams: any;
    timestamp: number;
    isMilestone?: boolean;
};

export function useNotifications() {
    const { state, markNotificationsRead } = useAppState();

    const notifications = useMemo(() => {
        const list: AppNotification[] = [];

        // 1. Unlocked Badges (Milestones)
        state.unlockedBadgeIds.forEach((badgeId) => {
            const badge = state.catalogs.badges.find(b => b.id === badgeId);
            if (!badge) return;
            list.push({
                id: `badge-${badgeId}`,
                title: "Badge Unlocked!",
                body: `You've earned the ${badge.name}.`,
                time: "Milestone",
                icon: "ribbon",
                color: colors.pastelGreen,
                onPressParams: {
                    initialTab: "Achievements",
                    screen: "Achievements",
                    params: { screen: "BadgeDetail", params: { badgeId } }
                },
                timestamp: 0,
                isMilestone: true,
            });
        });

        // 2. Mentorship
        Object.entries(state.mentorshipRequests).forEach(([mentorId, request]) => {
            if (!request || request.status !== "accepted") return;
            const mentor = state.catalogs.mentors.find(m => m.id === mentorId);
            if (!mentor) return;

            const ts = new Date(request.respondedAtIso || request.requestedAtIso).getTime();
            list.push({
                id: `mentor-acc-${mentorId}`,
                title: "Mentorship Accepted",
                body: `${mentor.name} is now your mentor!`,
                time: "Recently", // Placeholder for actual calc
                icon: "people",
                color: colors.pastelPurple,
                onPressParams: {
                    initialTab: "Mentorship",
                    screen: "Mentorship",
                    params: { screen: "MentorChat", params: { mentorId } }
                },
                timestamp: ts,
            });
        });

        // 3. Missions
        Object.entries(state.missionProgress).forEach(([missionId, progress]) => {
            if (progress.status === "completed" && progress.completedAtIso) {
                const mission = state.catalogs.missions.find(m => m.id === missionId);
                if (!mission) return;
                const ts = new Date(progress.completedAtIso).getTime();
                list.push({
                    id: `mission-comp-${missionId}`,
                    title: "Mission Completed",
                    body: `Finished ${mission.title}!`,
                    time: "Recently",
                    icon: "rocket",
                    color: colors.pastelBlue,
                    onPressParams: {
                        initialTab: "Missions",
                        screen: "Missions",
                        params: { screen: "MissionDetail", params: { missionId } }
                    },
                    timestamp: ts,
                });
            }
        });

        return list.sort((a, b) => b.timestamp - a.timestamp);
    }, [state.unlockedBadgeIds, state.mentorshipRequests, state.missionProgress, state.catalogs]);

    const unreadCount = useMemo(() => {
        const lastSeen = state.learner.lastSeenNotificationsAtIso
            ? new Date(state.learner.lastSeenNotificationsAtIso).getTime()
            : 0;

        return notifications.filter(n => {
            if (n.isMilestone) return false; // Don't count milestones as "unread" forever if we want to be strict
            return n.timestamp > lastSeen;
        }).length;
    }, [notifications, state.learner.lastSeenNotificationsAtIso]);

    return {
        notifications,
        unreadCount,
        markNotificationsRead,
    };
}
