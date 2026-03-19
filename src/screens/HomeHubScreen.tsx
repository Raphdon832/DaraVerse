import { Ionicons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import * as Haptics from "expo-haptics";
import { AnimatePresence, MotiImage, MotiView } from "moti";
import MotiPressable from "../components/SoundMotiPressable";
import { useEffect, useRef, useState } from "react";
import {
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import NetInfo from "@react-native-community/netinfo";
import { SafeAreaView } from "react-native-safe-area-context";

import AppHeader from "../components/AppHeader";
import SearchField from "../components/SearchField";
import Pressable from "../components/SoundPressable";
import ThemeEditorModal from "../components/ThemeEditorModal";
import { useAppState } from "../context/AppStateContext";
import { useResponsiveLayout } from "../hooks/useResponsiveLayout";
import { avatarOptions, getAvatarById } from "../data/avatars";
import { colors, radius, shadow, spacing, typography } from "../theme/tokens";
import type { MainTabKey, RootStackParamList } from "../types/navigation";
import type { StemCategoryId } from "../types/models";

type Props = NativeStackScreenProps<RootStackParamList, "HomeHub">;

type HubCategory = {
  tab: MainTabKey;
  title: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  color: string;
  iconColor: string;
};

type ContinueCard = {
  title: string;
  subtitle: string;
  actionLabel: string;
  onPress: () => void;
};

type PlanTask = {
  id: string;
  title: string;
  subtitle: string;
  durationLabel: string;
  actionLabel: string;
  onPress: () => void;
};

type ProgressTile = {
  id: string;
  label: string;
  value: string;
  helper: string;
  color: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
};

type QuickAction = {
  id: string;
  label: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  color: string;
  onPress: () => void;
};

type PersonalizedRecommendation = {
  id: string;
  title: string;
  reason: string;
  cta: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  onPress: () => void;
};

type ActivityFeedItem = {
  id: string;
  title: string;
  detail: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  iso: string;
  timestamp: number;
};

type SearchResultItem = {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  sectionLabel: string;
  ctaLabel: string;
  score: number;
  onPress: () => void;
};

const SEARCH_MIN_QUERY_LENGTH = 2;
const SEARCH_MAX_QUERY_LENGTH = 80;
const CONTROL_CHARS_REGEX = /[\u0000-\u001F\u007F]/g;
const COMBINING_MARKS_REGEX = /[\u0300-\u036f]/g;
const NON_ALNUM_SPACE_REGEX = /[^a-z0-9\s]/g;
const MULTI_SPACE_REGEX = /\s+/g;

const hubCategories: HubCategory[] = [
  {
    tab: "STEM",
    title: "STEM",
    icon: "flask-outline",
    color: colors.pastelPink,
    iconColor: "#FF5F86",
  },
  {
    tab: "Missions",
    title: "Missions",
    icon: "rocket-outline",
    color: colors.pastelBlue,
    iconColor: "#5A8AE5",
  },
  {
    tab: "Mentorship",
    title: "Mentorship",
    icon: "people-outline",
    color: colors.pastelPurple,
    iconColor: "#9B63F8",
  },
  {
    tab: "Projects",
    title: "Projects",
    icon: "construct-outline",
    color: colors.pastelPeach,
    iconColor: "#FF9966",
  },
  {
    tab: "Achievements",
    title: "Achievements",
    icon: "ribbon-outline",
    color: colors.pastelGreen,
    iconColor: "#2E9F6E",
  },
];

function getCurrentWeekRange(reference: Date) {
  const dayIndex = reference.getDay();
  const daysSinceMonday = (dayIndex + 6) % 7;
  const weekStart = new Date(reference);
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(reference.getDate() - daysSinceMonday);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);
  return { weekStart, weekEnd };
}

function isIsoInCurrentWeek(
  isoDate: string | undefined,
  weekStart: Date,
  weekEnd: Date,
) {
  if (!isoDate) return false;
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) return false;
  return parsed >= weekStart && parsed < weekEnd;
}

function toTimestamp(isoDate: string | undefined): number {
  if (!isoDate) return 0;
  const parsed = new Date(isoDate);
  const value = parsed.getTime();
  return Number.isNaN(value) ? 0 : value;
}

function formatRelativeTime(isoDate: string): string {
  const ts = toTimestamp(isoDate);
  if (!ts) return "Recently";
  const diffMs = Date.now() - ts;
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

function sanitizeSearchInput(value: string): string {
  return value
    .replace(CONTROL_CHARS_REGEX, "")
    .slice(0, SEARCH_MAX_QUERY_LENGTH);
}

function normalizeSearchText(value: string): string {
  return value
    .normalize("NFD")
    .replace(COMBINING_MARKS_REGEX, "")
    .toLowerCase()
    .replace(NON_ALNUM_SPACE_REGEX, " ")
    .replace(MULTI_SPACE_REGEX, " ")
    .trim();
}

function scoreSearchMatch(
  query: string,
  queryTokens: string[],
  normalizedTitle: string,
  normalizedSearchBlob: string,
  boost = 0,
) {
  if (!query) return 0;
  let score = boost;
  const paddedTitle = ` ${normalizedTitle} `;

  if (normalizedTitle === query) score += 180;
  if (normalizedTitle.startsWith(query)) score += 120;
  if (paddedTitle.includes(` ${query} `)) score += 95;
  else if (normalizedSearchBlob.includes(query)) score += 55;

  let matchedTokens = 0;
  queryTokens.forEach((token) => {
    if (!token) return;
    if (normalizedTitle.startsWith(token)) {
      score += 26;
      matchedTokens += 1;
      return;
    }
    if (paddedTitle.includes(` ${token} `)) {
      score += 21;
      matchedTokens += 1;
      return;
    }
    if (normalizedSearchBlob.includes(token)) {
      score += 12;
      matchedTokens += 1;
    }
  });

  if (queryTokens.length > 0) {
    if (matchedTokens === queryTokens.length) {
      score += 30;
    } else {
      score -= (queryTokens.length - matchedTokens) * 24;
    }
  }

  return score;
}

const pressScale98 = ({ pressed }: { pressed: boolean }) => {
  "worklet";
  return { scale: pressed ? 0.98 : 1 };
};

const pressScale96 = ({ pressed }: { pressed: boolean }) => {
  "worklet";
  return { scale: pressed ? 0.96 : 1 };
};

const pressScale95 = ({ pressed }: { pressed: boolean }) => {
  "worklet";
  return { scale: pressed ? 0.95 : 1 };
};

const pressScale94 = ({ pressed }: { pressed: boolean }) => {
  "worklet";
  return { scale: pressed ? 0.94 : 1 };
};

const pressScale92 = ({ pressed }: { pressed: boolean }) => {
  "worklet";
  return { scale: pressed ? 0.92 : 1 };
};

const pressScale90 = ({ pressed }: { pressed: boolean }) => {
  "worklet";
  return { scale: pressed ? 0.9 : 1 };
};

export default function HomeHubScreen({ navigation }: Props) {
  const { state, addSearchHistoryQuery, clearSearchHistory } = useAppState();
  const { contentMaxWidth, isDesktop, isTablet } = useResponsiveLayout();
  const {
    missions: missionCatalog,
    projects: projectCatalog,
    stemCategories: stemCategoryCatalog,
    mentors: mentorCatalog,
    badges: badgeCatalog,
  } = state.catalogs;
  const [search, setSearch] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMotionBoostActive, setIsMotionBoostActive] = useState(false);
  const [motionBeat, setMotionBeat] = useState(0);
  const [themeModalVisible, setThemeModalVisible] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState<string | null>(
    null,
  );
  const prevBadgeCountRef = useRef(state.unlockedBadgeIds.length);
  const prevCertificateCountRef = useRef(state.unlockedCertificateIds.length);
  const prevWeeklyGoalDoneRef = useRef(false);
  const hubScrollRef = useRef<ScrollView | null>(null);
  const motionBoostTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const selectedAvatar =
    getAvatarById(state.learner.avatarId) ?? avatarOptions[0];

  const isDarkBg = state.theme.appBgColor === "#1E293B";
  const adaptiveTextColor = isDarkBg ? "#FFFFFF" : colors.textPrimary;
  const adaptiveCardBg = isDarkBg ? "rgba(255,255,255,0.1)" : colors.bgSoft;
  const searchablePanelLift = isSearchFocused || isMotionBoostActive;
  const railCardWidth = isDesktop ? 280 : isTablet ? 250 : 220;
  const categoryCardWidth = isDesktop ? 148 : isTablet ? 136 : 120;

  const triggerMotionBeat = () => {
    setMotionBeat((prev) => prev + 1);
    setIsMotionBoostActive(true);
    if (motionBoostTimerRef.current) {
      clearTimeout(motionBoostTimerRef.current);
    }
    motionBoostTimerRef.current = setTimeout(() => {
      setIsMotionBoostActive(false);
    }, 260);
  };

  const openTab = (tab: MainTabKey) => {
    triggerMotionBeat();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate("MainTabs", { screen: tab, initialTab: tab });
  };

  const openMissionDetail = (missionId: string) => {
    triggerMotionBeat();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate("MainTabs", {
      initialTab: "Missions",
      screen: "Missions",
      params: { screen: "MissionDetail", params: { missionId } },
    });
  };

  const openProjectDetail = (projectId: string) => {
    triggerMotionBeat();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate("MainTabs", {
      initialTab: "Projects",
      screen: "Projects",
      params: { screen: "ProjectDetail", params: { projectId } },
    });
  };

  const openStemCategory = (categoryId: StemCategoryId) => {
    triggerMotionBeat();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate("MainTabs", {
      initialTab: "STEM",
      screen: "STEM",
      params: { screen: "STEMCategory", params: { categoryId } },
    });
  };

  const openStemTriviaPlayer = (categoryId: StemCategoryId) => {
    triggerMotionBeat();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate("MainTabs", {
      initialTab: "STEM",
      screen: "STEM",
      params: { screen: "STEMTriviaPlayer", params: { categoryId } },
    });
  };

  const openMentorProfile = (mentorId: string) => {
    triggerMotionBeat();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate("MainTabs", {
      initialTab: "Mentorship",
      screen: "Mentorship",
      params: { screen: "MentorProfile", params: { mentorId } },
    });
  };

  const openMentorChat = (mentorId: string) => {
    triggerMotionBeat();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate("MainTabs", {
      initialTab: "Mentorship",
      screen: "Mentorship",
      params: { screen: "MentorChat", params: { mentorId } },
    });
  };

  const openMentorCall = (mentorId: string) => {
    triggerMotionBeat();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate("MainTabs", {
      initialTab: "Mentorship",
      screen: "Mentorship",
      params: { screen: "MentorCall", params: { mentorId } },
    });
  };

  const openBadgeDetail = (badgeId: string) => {
    triggerMotionBeat();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate("MainTabs", {
      initialTab: "Achievements",
      screen: "Achievements",
      params: { screen: "BadgeDetail", params: { badgeId } },
    });
  };

  const inProgressMission = missionCatalog.find(
    (mission) => state.missionProgress[mission.id]?.status === "in_progress",
  );
  const nextNewMission = missionCatalog.find(
    (mission) => state.missionProgress[mission.id]?.status === "new",
  );
  const inProgressProject = projectCatalog.find(
    (project) => state.projectProgress[project.id]?.status === "in_progress",
  );
  const nextProject = projectCatalog.find(
    (project) => state.projectProgress[project.id]?.status !== "submitted",
  );

  const latestMissionActivity = missionCatalog.reduce<{
    mission: (typeof missionCatalog)[number];
    progress: NonNullable<(typeof state.missionProgress)[string]>;
    activityTimestamp: number;
  } | null>((latest, mission) => {
    const progress = state.missionProgress[mission.id];
    if (!progress) return latest;

    const activityIso =
      progress.lastPlayedAtIso ??
      progress.resumeState?.updatedAtIso ??
      progress.completedAtIso;
    const activityTimestamp = toTimestamp(activityIso);
    const current = { mission, progress, activityTimestamp };
    const qualifies =
      activityTimestamp > 0 ||
      progress.status === "in_progress" ||
      progress.attempts > 0;
    if (!qualifies) return latest;
    if (!latest) return current;
    if (current.activityTimestamp !== latest.activityTimestamp) {
      return current.activityTimestamp > latest.activityTimestamp
        ? current
        : latest;
    }
    const statusWeight = (status: typeof progress.status) => {
      if (status === "in_progress") return 2;
      if (status === "completed") return 1;
      return 0;
    };
    const currentStatusWeight = statusWeight(current.progress.status);
    const latestStatusWeight = statusWeight(latest.progress.status);
    if (currentStatusWeight !== latestStatusWeight) {
      return currentStatusWeight > latestStatusWeight ? current : latest;
    }
    return current.progress.attempts > latest.progress.attempts ? current : latest;
  }, null);

  const latestTriviaActivity = stemCategoryCatalog.reduce<{
    category: (typeof stemCategoryCatalog)[number];
    progress: NonNullable<(typeof state.stemTriviaProgress)[StemCategoryId]>;
    activityTimestamp: number;
  } | null>((latest, category) => {
    const progress = state.stemTriviaProgress[category.id];
    if (!progress || progress.sessionsPlayed <= 0) {
      return latest;
    }
    const activityTimestamp = toTimestamp(progress.lastPlayedAtIso);
    const current = { category, progress, activityTimestamp };
    if (!latest) return current;
    if (current.activityTimestamp !== latest.activityTimestamp) {
      return current.activityTimestamp > latest.activityTimestamp
        ? current
        : latest;
    }
    return current.progress.sessionsPlayed > latest.progress.sessionsPlayed
      ? current
      : latest;
  }, null);

  const triviaByLeastPlayed = [...stemCategoryCatalog].sort((a, b) => {
    const aSessions = state.stemTriviaProgress[a.id]?.sessionsPlayed ?? 0;
    const bSessions = state.stemTriviaProgress[b.id]?.sessionsPlayed ?? 0;
    return aSessions - bSessions;
  });
  const recommendedTrivia = triviaByLeastPlayed[0];

  const today = new Date();
  const todayDateKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const streakAtRisk =
    state.learner.streakDays > 0 &&
    state.learner.lastActivityDate !== todayDateKey;

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    if (hour < 21) return "Good evening";
    return "Good night";
  };

  const handleSearchChange = (value: string) => {
    setSearch(sanitizeSearchInput(value));
  };
  const clearSearch = () => {
    triggerMotionBeat();
    setSearch("");
  };
  const normalizedSearchQuery = normalizeSearchText(search);
  const searchTokens = normalizedSearchQuery
    .split(" ")
    .filter((token) => token.length >= SEARCH_MIN_QUERY_LENGTH);
  const isSearchActive = normalizedSearchQuery.length > 0;
  const isSearchQueryTooShort =
    isSearchActive && normalizedSearchQuery.length < SEARCH_MIN_QUERY_LENGTH;
  const recentSearchHistory = state.searchHistory.slice(0, 8);
  const showRecentSearchHistory =
    isSearchFocused && !isSearchActive && recentSearchHistory.length > 0;

  const persistSearchQuery = (rawQuery: string) => {
    const candidate = sanitizeSearchInput(rawQuery);
    if (normalizeSearchText(candidate).length < SEARCH_MIN_QUERY_LENGTH) {
      return;
    }
    addSearchHistoryQuery(candidate);
  };

  const applyHistorySearch = (query: string) => {
    triggerMotionBeat();
    setSearch(sanitizeSearchInput(query));
    Haptics.selectionAsync();
    hubScrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  const continueCard: ContinueCard = (() => {
    const missionTimestamp = latestMissionActivity?.activityTimestamp ?? 0;
    const triviaTimestamp = latestTriviaActivity?.activityTimestamp ?? 0;
    const shouldContinueMission =
      Boolean(latestMissionActivity) &&
      (!latestTriviaActivity || missionTimestamp >= triviaTimestamp);

    if (shouldContinueMission && latestMissionActivity) {
      const { mission, progress } = latestMissionActivity;
      if (progress.status === "completed") {
        return {
          title: "Replay Mission",
          subtitle: `You last played ${mission.title}`,
          actionLabel: "Replay Mission",
          onPress: () => openMissionDetail(mission.id),
        };
      }
      return {
        title: "Continue Mission",
        subtitle: `Resume where you stopped in ${mission.title}`,
        actionLabel: "Resume Mission",
        onPress: () => openMissionDetail(mission.id),
      };
    }

    if (latestTriviaActivity) {
      return {
        title: "Continue Trivia",
        subtitle: `Resume your latest ${latestTriviaActivity.category.title} session`,
        actionLabel: "Resume Trivia",
        onPress: () => openStemTriviaPlayer(latestTriviaActivity.category.id),
      };
    }

    if (inProgressProject) {
      return {
        title: "Continue Project",
        subtitle: `${inProgressProject.title} is waiting for your next update`,
        actionLabel: "Resume Project",
        onPress: () => openProjectDetail(inProgressProject.id),
      };
    }

    if (recommendedTrivia) {
      return {
        title: "Continue Learning",
        subtitle: `Build momentum in ${recommendedTrivia.title}`,
        actionLabel: "Start Trivia",
        onPress: () => openStemCategory(recommendedTrivia.id),
      };
    }

    return {
      title: "Continue Learning",
      subtitle: "Pick your next challenge and keep your streak going",
      actionLabel: "Explore Missions",
      onPress: () => openTab("Missions"),
    };
  })();

  const todaysPlan: PlanTask[] = [];
  if (streakAtRisk && recommendedTrivia) {
    todaysPlan.push({
      id: "streak-guard",
      title: "Protect Your Streak",
      subtitle: `Play a quick ${recommendedTrivia.title} trivia session`,
      durationLabel: "~10 min",
      actionLabel: "Play",
      onPress: () => openStemCategory(recommendedTrivia.id),
    });
  }
  if (inProgressMission) {
    todaysPlan.push({
      id: `mission-${inProgressMission.id}`,
      title: "Complete In-Progress Mission",
      subtitle: inProgressMission.title,
      durationLabel: `~${inProgressMission.durationMinutes} min`,
      actionLabel: "Resume",
      onPress: () => openMissionDetail(inProgressMission.id),
    });
  } else if (nextNewMission) {
    todaysPlan.push({
      id: `mission-${nextNewMission.id}`,
      title: "Start a New Mission",
      subtitle: nextNewMission.title,
      durationLabel: `~${nextNewMission.durationMinutes} min`,
      actionLabel: "Start",
      onPress: () => openMissionDetail(nextNewMission.id),
    });
  }
  if (inProgressProject) {
    todaysPlan.push({
      id: `project-${inProgressProject.id}`,
      title: "Move Project Forward",
      subtitle: inProgressProject.title,
      durationLabel: "~20 min",
      actionLabel: "Continue",
      onPress: () => openProjectDetail(inProgressProject.id),
    });
  } else if (nextProject) {
    todaysPlan.push({
      id: `project-${nextProject.id}`,
      title: "Advance Next Project",
      subtitle: nextProject.title,
      durationLabel: "~20 min",
      actionLabel: "Open",
      onPress: () => openProjectDetail(nextProject.id),
    });
  }

  const visiblePlanTasks = todaysPlan.slice(0, 2);
  const liveMentors = mentorCatalog
    .filter((mentor) => mentor.isAcceptingMentees)
    .slice(0, 8);

  const completedMissions = missionCatalog.filter(
    (mission) => state.missionProgress[mission.id]?.status === "completed",
  ).length;
  const submittedProjects = projectCatalog.filter(
    (project) => state.projectProgress[project.id]?.status === "submitted",
  ).length;
  const totalTriviaSessions = stemCategoryCatalog.reduce(
    (sum, category) =>
      sum + (state.stemTriviaProgress[category.id]?.sessionsPlayed ?? 0),
    0,
  );
  const startedTriviaCategories = stemCategoryCatalog.filter(
    (category) =>
      (state.stemTriviaProgress[category.id]?.sessionsPlayed ?? 0) > 0,
  ).length;
  const unlockedBadges = state.unlockedBadgeIds.length;

  const progressTiles: ProgressTile[] = [
    {
      id: "missions",
      label: "Missions",
      value: `${completedMissions}/${missionCatalog.length}`,
      helper:
        completedMissions >= missionCatalog.length && missionCatalog.length > 0
          ? "All mission goals complete"
          : `Next milestone: ${Math.min(completedMissions + 1, Math.max(missionCatalog.length, 1))}/${Math.max(missionCatalog.length, 1)}`,
      color: colors.pastelBlue,
      icon: "rocket-outline",
    },
    {
      id: "trivia",
      label: "Trivia",
      value: `${totalTriviaSessions} sessions`,
      helper: `${startedTriviaCategories}/${stemCategoryCatalog.length} categories started`,
      color: colors.pastelPink,
      icon: "flask-outline",
    },
    {
      id: "projects",
      label: "Projects",
      value: `${submittedProjects}/${projectCatalog.length}`,
      helper:
        submittedProjects >= projectCatalog.length && projectCatalog.length > 0
          ? "All projects submitted"
          : `Next milestone: ${Math.min(submittedProjects + 1, Math.max(projectCatalog.length, 1))}/${Math.max(projectCatalog.length, 1)}`,
      color: colors.pastelPeach,
      icon: "construct-outline",
    },
    {
      id: "badges",
      label: "Badges",
      value: `${unlockedBadges}/${badgeCatalog.length}`,
      helper:
        unlockedBadges >= badgeCatalog.length && badgeCatalog.length > 0
          ? "Badge collection complete"
          : `${Math.max(badgeCatalog.length - unlockedBadges, 0)} to next set`,
      color: colors.pastelGreen,
      icon: "ribbon-outline",
    },
  ];

  const quickActions: QuickAction[] = [
    {
      id: "quick-trivia",
      label: "Start Trivia",
      icon: "flash-outline",
      color: colors.pastelPink,
      onPress: () => {
        if (recommendedTrivia) {
          openStemCategory(recommendedTrivia.id);
          return;
        }
        openTab("STEM");
      },
    },
    {
      id: "quick-mentor",
      label: "Open Mentorship",
      icon: "people-outline",
      color: colors.pastelPurple,
      onPress: () => openTab("Mentorship"),
    },
    {
      id: "quick-project",
      label: "Submit Project",
      icon: "checkmark-done-outline",
      color: colors.pastelPeach,
      onPress: () => {
        if (inProgressProject) {
          openProjectDetail(inProgressProject.id);
          return;
        }
        if (nextProject) {
          openProjectDetail(nextProject.id);
          return;
        }
        openTab("Projects");
      },
    },
    {
      id: "quick-achievements",
      label: "View Achievements",
      icon: "trophy-outline",
      color: colors.pastelGreen,
      onPress: () => openTab("Achievements"),
    },
  ];

  const { weekStart, weekEnd } = getCurrentWeekRange(today);
  const missionsThisWeek = missionCatalog.filter((mission) =>
    isIsoInCurrentWeek(
      state.missionProgress[mission.id]?.completedAtIso,
      weekStart,
      weekEnd,
    ),
  ).length;
  const projectsThisWeek = projectCatalog.filter((project) =>
    isIsoInCurrentWeek(
      state.projectProgress[project.id]?.submittedAtIso,
      weekStart,
      weekEnd,
    ),
  ).length;
  const requestsThisWeek = Object.values(state.mentorshipRequests).filter(
    (request) =>
      isIsoInCurrentWeek(request?.requestedAtIso, weekStart, weekEnd),
  ).length;

  const weeklyGoalTarget = 3;
  const weeklyGoalProgress =
    missionsThisWeek + projectsThisWeek + requestsThisWeek;
  const weeklyGoalRemaining = Math.max(
    weeklyGoalTarget - weeklyGoalProgress,
    0,
  );
  const weeklyGoalPercent = Math.min(
    100,
    Math.round((weeklyGoalProgress / weeklyGoalTarget) * 100),
  );

  const currentDailyGoal = badgeCatalog.find(
    (b) => b.id.includes("daily-goal") && !state.unlockedBadgeIds.includes(b.id)
  );

  const currentWeeklyGoal = badgeCatalog.find(
    (b) => b.id.includes("weekly-goal") && !state.unlockedBadgeIds.includes(b.id)
  );

  const acceptedMentor = mentorCatalog.find(
    (mentor) => state.mentorshipRequests[mentor.id]?.status === "accepted",
  );
  const pendingMentor = mentorCatalog.find(
    (mentor) => state.mentorshipRequests[mentor.id]?.status === "pending",
  );

  const personalizedRecommendations: PersonalizedRecommendation[] = [];
  if (inProgressMission) {
    personalizedRecommendations.push({
      id: `rec-mission-${inProgressMission.id}`,
      title: `Finish ${inProgressMission.title}`,
      reason: "You are close to earning points and badges from this mission.",
      cta: "Resume",
      icon: "rocket-outline",
      onPress: () => openMissionDetail(inProgressMission.id),
    });
  } else if (nextNewMission) {
    personalizedRecommendations.push({
      id: `rec-mission-${nextNewMission.id}`,
      title: `Start ${nextNewMission.title}`,
      reason: "This matches your current progression path.",
      cta: "Start",
      icon: "sparkles-outline",
      onPress: () => openMissionDetail(nextNewMission.id),
    });
  }

  if (recommendedTrivia) {
    const weakestLabel =
      (state.stemTriviaProgress[recommendedTrivia.id]?.sessionsPlayed ?? 0) ===
        0
        ? "not started yet"
        : "your least-played category";
    personalizedRecommendations.push({
      id: `rec-trivia-${recommendedTrivia.id}`,
      title: `${recommendedTrivia.title} Trivia`,
      reason: `This is ${weakestLabel}, so it is a strong next focus.`,
      cta: "Play",
      icon: "flask-outline",
      onPress: () => openStemCategory(recommendedTrivia.id),
    });
  }

  if (acceptedMentor) {
    personalizedRecommendations.push({
      id: `rec-mentor-${acceptedMentor.id}`,
      title: `Check in with ${acceptedMentor.name}`,
      reason:
        "Your mentorship is active. A short chat can unblock your next step.",
      cta: "Chat",
      icon: "chatbubble-ellipses-outline",
      onPress: () => openMentorChat(acceptedMentor.id),
    });
  } else if (liveMentors.length > 0) {
    personalizedRecommendations.push({
      id: `rec-mentor-live-${liveMentors[0].id}`,
      title: `${liveMentors[0].name} is available now`,
      reason: "Live mentor support is currently open.",
      cta: "Request",
      icon: "people-outline",
      onPress: () => openMentorProfile(liveMentors[0].id),
    });
  } else if (pendingMentor) {
    personalizedRecommendations.push({
      id: `rec-mentor-pending-${pendingMentor.id}`,
      title: "Mentorship request pending",
      reason: `You already requested ${pendingMentor.name}. Check status and prep questions.`,
      cta: "View",
      icon: "time-outline",
      onPress: () => openMentorProfile(pendingMentor.id),
    });
  }

  const visibleRecommendations = personalizedRecommendations.slice(0, 3);

  const activityFeedItems: ActivityFeedItem[] = [];
  missionCatalog.forEach((mission) => {
    const iso = state.missionProgress[mission.id]?.completedAtIso;
    const timestamp = toTimestamp(iso);
    if (!timestamp || !iso) return;
    activityFeedItems.push({
      id: `activity-mission-${mission.id}-${iso}`,
      title: "Mission completed",
      detail: mission.title,
      icon: "rocket-outline",
      iso,
      timestamp,
    });
  });

  projectCatalog.forEach((project) => {
    const iso = state.projectProgress[project.id]?.submittedAtIso;
    const timestamp = toTimestamp(iso);
    if (!timestamp || !iso) return;
    activityFeedItems.push({
      id: `activity-project-${project.id}-${iso}`,
      title: "Project submitted",
      detail: project.title,
      icon: "construct-outline",
      iso,
      timestamp,
    });
  });

  Object.values(state.mentorshipRequests).forEach((request) => {
    if (!request) return;
    const mentorName =
      mentorCatalog.find((mentor) => mentor.id === request.mentorId)?.name ??
      "mentor";
    const requestedTs = toTimestamp(request.requestedAtIso);
    if (requestedTs) {
      activityFeedItems.push({
        id: `activity-request-${request.mentorId}-${request.requestedAtIso}`,
        title: "Mentorship request sent",
        detail: `To ${mentorName}`,
        icon: "send-outline",
        iso: request.requestedAtIso,
        timestamp: requestedTs,
      });
    }
    const respondedTs = toTimestamp(request.respondedAtIso);
    if (respondedTs && request.respondedAtIso) {
      activityFeedItems.push({
        id: `activity-request-response-${request.mentorId}-${request.respondedAtIso}`,
        title: `Request ${request.status}`,
        detail: `Response from ${mentorName}`,
        icon:
          request.status === "accepted"
            ? "checkmark-circle-outline"
            : "close-circle-outline",
        iso: request.respondedAtIso,
        timestamp: respondedTs,
      });
    }
  });

  Object.entries(state.mentorshipMessages).forEach(([mentorId, thread]) => {
    if (!thread || thread.length === 0) return;
    const latest = thread[thread.length - 1];
    const ts = toTimestamp(latest.sentAtIso);
    if (!ts) return;
    const mentorName =
      mentorCatalog.find((mentor) => mentor.id === mentorId)?.name ?? "mentor";
    activityFeedItems.push({
      id: `activity-chat-${mentorId}-${latest.id}`,
      title: "New mentorship chat",
      detail: `Latest message in ${mentorName} thread`,
      icon: "chatbox-ellipses-outline",
      iso: latest.sentAtIso,
      timestamp: ts,
    });
  });

  const activityFeed = activityFeedItems
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 6);
  const sidebarActivityFeed = activityFeed.slice(0, 4);

  const searchResults: SearchResultItem[] = [];
  if (isSearchActive && !isSearchQueryTooShort) {
    const addResult = (item: SearchResultItem, threshold = 45) => {
      if (item.score >= threshold) {
        searchResults.push(item);
      }
    };

    missionCatalog.forEach((mission) => {
      const missionStatus = state.missionProgress[mission.id]?.status ?? "new";
      const missionStatusLabel =
        missionStatus === "in_progress"
          ? "In progress"
          : missionStatus === "completed"
            ? "Completed"
            : "New";
      const normalizedTitle = normalizeSearchText(mission.title);
      const normalizedBlob = normalizeSearchText(
        [
          mission.title,
          mission.subtitle,
          mission.theme,
          mission.objective,
          mission.reflectionPrompt,
          "mission",
        ].join(" "),
      );
      const score = scoreSearchMatch(
        normalizedSearchQuery,
        searchTokens,
        normalizedTitle,
        normalizedBlob,
        missionStatus === "in_progress" ? 18 : missionStatus === "new" ? 6 : 0,
      );

      addResult({
        id: `search-mission-${mission.id}`,
        title: mission.title,
        subtitle: `${missionStatusLabel} mission • ${mission.durationMinutes} min`,
        icon: "rocket-outline",
        sectionLabel: "Missions",
        ctaLabel: missionStatus === "in_progress" ? "Resume" : "Open",
        score,
        onPress: () => openMissionDetail(mission.id),
      });
    });

    projectCatalog.forEach((project) => {
      const projectStatus =
        state.projectProgress[project.id]?.status ?? "not_started";
      const projectStatusLabel =
        projectStatus === "submitted"
          ? "Submitted"
          : projectStatus === "in_progress"
            ? "In progress"
            : "Not started";
      const normalizedTitle = normalizeSearchText(project.title);
      const normalizedBlob = normalizeSearchText(
        [project.title, project.description, "project submit"].join(" "),
      );
      const score = scoreSearchMatch(
        normalizedSearchQuery,
        searchTokens,
        normalizedTitle,
        normalizedBlob,
        projectStatus === "in_progress"
          ? 15
          : projectStatus === "not_started"
            ? 4
            : 0,
      );

      addResult({
        id: `search-project-${project.id}`,
        title: project.title,
        subtitle: `${projectStatusLabel} project • ~${project.estimatedMinutes} min`,
        icon: "construct-outline",
        sectionLabel: "Projects",
        ctaLabel: projectStatus === "in_progress" ? "Continue" : "Open",
        score,
        onPress: () => openProjectDetail(project.id),
      });
    });

    stemCategoryCatalog.forEach((category) => {
      const sessionsPlayed =
        state.stemTriviaProgress[category.id]?.sessionsPlayed ?? 0;
      const normalizedTitle = normalizeSearchText(category.title);
      const normalizedBlob = normalizeSearchText(
        [
          category.title,
          category.summary,
          category.howToPlay.join(" "),
          "trivia stem",
        ].join(" "),
      );
      const score = scoreSearchMatch(
        normalizedSearchQuery,
        searchTokens,
        normalizedTitle,
        normalizedBlob,
        sessionsPlayed === 0 ? 8 : 4,
      );

      addResult({
        id: `search-stem-${category.id}`,
        title: category.title,
        subtitle:
          sessionsPlayed === 0
            ? "Not started yet • STEM trivia"
            : `${sessionsPlayed} session${sessionsPlayed > 1 ? "s" : ""} played`,
        icon: "flask-outline",
        sectionLabel: "STEM",
        ctaLabel: "Play",
        score,
        onPress: () => openStemCategory(category.id),
      });
    });

    mentorCatalog.forEach((mentor) => {
      const requestStatus =
        state.mentorshipRequests[mentor.id]?.status ?? "none";
      const canChatOrCall = requestStatus === "accepted";
      const statusLabel = canChatOrCall
        ? "Mentor accepted"
        : requestStatus === "pending"
          ? "Request pending"
          : mentor.isAcceptingMentees
            ? "Available now"
            : "Profile";
      const normalizedTitle = normalizeSearchText(mentor.name);
      const normalizedBlob = normalizeSearchText(
        [
          mentor.name,
          mentor.specialty,
          mentor.description,
          mentor.bio ?? "",
          mentor.expertiseTags?.join(" ") ?? "",
          mentor.languages?.join(" ") ?? "",
          mentor.openSlotsLabel,
          "mentor mentorship",
        ].join(" "),
      );
      const score = scoreSearchMatch(
        normalizedSearchQuery,
        searchTokens,
        normalizedTitle,
        normalizedBlob,
        canChatOrCall ? 16 : mentor.isAcceptingMentees ? 10 : 4,
      );

      addResult({
        id: `search-mentor-${mentor.id}`,
        title: mentor.name,
        subtitle: `${mentor.specialty} • ${statusLabel}`,
        icon: "people-outline",
        sectionLabel: "Mentorship",
        ctaLabel: canChatOrCall ? "Chat" : "Open",
        score,
        onPress: () => {
          if (canChatOrCall) {
            openMentorChat(mentor.id);
            return;
          }
          openMentorProfile(mentor.id);
        },
      });
    });

    const unlockedBadgeIdSet = new Set(state.unlockedBadgeIds);
    badgeCatalog.forEach((badge) => {
      const isUnlocked = unlockedBadgeIdSet.has(badge.id);
      const normalizedTitle = normalizeSearchText(badge.name);
      const normalizedBlob = normalizeSearchText(
        [
          badge.name,
          badge.description,
          badge.unlockCriteria ?? "",
          "badge achievement",
        ].join(" "),
      );
      const score = scoreSearchMatch(
        normalizedSearchQuery,
        searchTokens,
        normalizedTitle,
        normalizedBlob,
        isUnlocked ? 8 : 0,
      );

      addResult(
        {
          id: `search-badge-${badge.id}`,
          title: badge.name,
          subtitle: isUnlocked ? "Unlocked badge" : badge.description,
          icon: "ribbon-outline",
          sectionLabel: "Achievements",
          ctaLabel: "View",
          score,
          onPress: () => openBadgeDetail(badge.id),
        },
        48,
      );
    });

    const tabKeywords: Record<MainTabKey, string> = {
      STEM: "trivia coding ai cyber robotics data",
      Missions: "quests play practice learn",
      Mentorship: "mentor chat call guidance coach",
      Projects: "build create submit portfolio",
      Achievements: "badges certificates rewards progress",
    };
    hubCategories.forEach((category) => {
      const normalizedTitle = normalizeSearchText(category.title);
      const normalizedBlob = normalizeSearchText(
        `${category.title} ${tabKeywords[category.tab]}`,
      );
      const score = scoreSearchMatch(
        normalizedSearchQuery,
        searchTokens,
        normalizedTitle,
        normalizedBlob,
        5,
      );

      addResult(
        {
          id: `search-tab-${category.tab}`,
          title: category.title,
          subtitle: "Open section",
          icon: category.icon,
          sectionLabel: "Section",
          ctaLabel: "Open",
          score,
          onPress: () => openTab(category.tab),
        },
        58,
      );
    });
  }

  const rankedSearchResults = searchResults
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.title.localeCompare(b.title);
    })
    .slice(0, 12);

  const handleSubmitSearch = () => {
    if (!isSearchActive) return;
    if (isSearchQueryTooShort || rankedSearchResults.length === 0) {
      triggerMotionBeat();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      hubScrollRef.current?.scrollTo({ y: 0, animated: true });
      return;
    }
    persistSearchQuery(search);
    rankedSearchResults[0].onPress();
    setSearch("");
  };

  const handleRefresh = () => {
    triggerMotionBeat();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 900);
  };

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((netState) => {
      const connected = Boolean(
        netState.isConnected && (netState.isInternetReachable ?? true),
      );
      setIsOffline(!connected);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const badgeDelta =
      state.unlockedBadgeIds.length - prevBadgeCountRef.current;
    const certificateDelta =
      state.unlockedCertificateIds.length - prevCertificateCountRef.current;
    if (badgeDelta > 0 || certificateDelta > 0) {
      const parts: string[] = [];
      if (badgeDelta > 0)
        parts.push(`${badgeDelta} badge${badgeDelta > 1 ? "s" : ""}`);
      if (certificateDelta > 0) {
        parts.push(
          `${certificateDelta} certificate${certificateDelta > 1 ? "s" : ""}`,
        );
      }
      setCelebrationMessage(`Unlocked ${parts.join(" and ")}.`);
    }

    prevBadgeCountRef.current = state.unlockedBadgeIds.length;
    prevCertificateCountRef.current = state.unlockedCertificateIds.length;
  }, [state.unlockedBadgeIds.length, state.unlockedCertificateIds.length]);

  useEffect(() => {
    const goalNowComplete = weeklyGoalProgress >= weeklyGoalTarget;
    if (goalNowComplete && !prevWeeklyGoalDoneRef.current) {
      setCelebrationMessage("Weekly goal complete. Great consistency.");
    }
    prevWeeklyGoalDoneRef.current = goalNowComplete;
  }, [weeklyGoalProgress, weeklyGoalTarget]);

  useEffect(() => {
    if (!celebrationMessage) return;
    const timer = setTimeout(() => {
      setCelebrationMessage(null);
    }, 3600);
    return () => clearTimeout(timer);
  }, [celebrationMessage]);

  useEffect(() => {
    return () => {
      if (motionBoostTimerRef.current) {
        clearTimeout(motionBoostTimerRef.current);
      }
    };
  }, []);

  return (
    <SafeAreaView
      edges={["top"]}
      style={[styles.safeArea, { backgroundColor: state.theme.appBgColor }]}
    >
      <View pointerEvents="none" style={styles.motionAmbientLayer}>
        <MotiView
          animate={{
            opacity: isSearchActive
              ? 0.16
              : isSearchFocused
                ? 0.13
                : isMotionBoostActive
                  ? 0.12
                  : 0.08,
            scale: isMotionBoostActive ? 1.16 : 1,
            translateY: isSearchFocused ? -10 : 0,
            translateX: isSearchFocused ? 12 : 0,
          }}
          transition={{ type: "timing", duration: 260 }}
          style={[
            styles.motionAmbientOrb,
            { backgroundColor: state.theme.primaryColor },
          ]}
        />
        <AnimatePresence>
          {motionBeat > 0 ? (
            <MotiView
              key={`motion-ripple-${motionBeat}`}
              from={{ opacity: 0.2, scale: 0.78 }}
              animate={{ opacity: 0, scale: 1.14 }}
              exit={{ opacity: 0 }}
              transition={{ type: "timing", duration: 320 }}
              style={[
                styles.motionRipple,
                { borderColor: state.theme.primaryColor },
              ]}
            />
          ) : null}
        </AnimatePresence>
      </View>

      <View
        style={[
          styles.fixedHeader,
          {
            alignSelf: "center",
            maxWidth: contentMaxWidth,
            width: "100%",
          },
        ]}
      >
        <AppHeader
          title={state.learner.firstName || "Learner"}
          subtitle={getTimeGreeting()}
          subtitleTop={true}
          showNotification
          onPressNotification={() => navigation.navigate("Notifications")}
          avatarSource={selectedAvatar.thumbnail}
          onPressAvatar={() => navigation.navigate("Profile")}
          textColor={adaptiveTextColor}
          showLogo={false}
        />
      </View>
      <ScrollView
        ref={hubScrollRef}
        contentContainerStyle={[
          styles.content,
          {
            alignSelf: "center",
            maxWidth: contentMaxWidth,
            width: "100%",
          },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={state.theme.primaryColor}
            colors={[state.theme.primaryColor]}
          />
        }
      >
        <MotiView
          animate={{
            translateY: searchablePanelLift ? -2 : 0,
            scale: searchablePanelLift ? 1.008 : 1,
          }}
          transition={{ type: "timing", duration: 220 }}
          style={styles.searchFieldMotionWrap}
        >
          <SearchField
            value={search}
            onChangeText={handleSearchChange}
            onFocus={() => {
              setIsSearchFocused(true);
              triggerMotionBeat();
            }}
            onBlur={() => setIsSearchFocused(false)}
            placeholder="Search for tracks, missions, etc."
            onSearchPress={handleSubmitSearch}
            onSubmitEditing={handleSubmitSearch}
            onClearPress={clearSearch}
            textColor={adaptiveTextColor}
            bgColor={adaptiveCardBg}
          />
        </MotiView>

        {showRecentSearchHistory ? (
          <MotiView
            from={{ opacity: 0, translateY: -4 }}
            animate={{
              opacity: 1,
              translateY: 0,
              scale: isMotionBoostActive ? 1.01 : 1,
            }}
            style={[
              styles.searchHistoryCard,
              { backgroundColor: adaptiveCardBg },
            ]}
          >
            <View style={styles.searchHistoryHeader}>
              <Text
                style={[
                  styles.searchHistoryTitle,
                  { color: adaptiveTextColor },
                ]}
              >
                Recent Searches
              </Text>
              <Pressable
                onPress={() => {
                  triggerMotionBeat();
                  clearSearchHistory();
                }}
              >
                <Text
                  style={[
                    styles.searchHistoryClear,
                    { color: state.theme.primaryColor },
                  ]}
                >
                  Clear
                </Text>
              </Pressable>
            </View>
            <View style={styles.searchHistoryChips}>
              {recentSearchHistory.map((entry) => (
                <MotiPressable
                  key={`history-${entry.query}`}
                  onPress={() => applyHistorySearch(entry.query)}
                  animate={pressScale98}
                  style={[
                    styles.searchHistoryChip,
                    { borderColor: state.theme.primaryColor },
                  ]}
                >
                  <Ionicons
                    name="time-outline"
                    size={14}
                    color={state.theme.primaryColor}
                  />
                  <Text
                    style={[
                      styles.searchHistoryChipText,
                      { color: adaptiveTextColor },
                    ]}
                    numberOfLines={1}
                  >
                    {entry.query}
                  </Text>
                </MotiPressable>
              ))}
            </View>
          </MotiView>
        ) : null}

        {isOffline ? (
          <View style={styles.offlineBanner}>
            <Ionicons name="cloud-offline-outline" size={16} color="#92400E" />
            <Text style={styles.offlineText}>
              Offline mode: showing cached progress and content.
            </Text>
          </View>
        ) : null}

        {celebrationMessage ? (
          <MotiView
            from={{ opacity: 0, translateY: -8 }}
            animate={{ opacity: 1, translateY: 0 }}
            style={styles.celebrationBanner}
          >
            <Ionicons name="sparkles-outline" size={18} color="#065F46" />
            <Text style={styles.celebrationText}>{celebrationMessage}</Text>
          </MotiView>
        ) : null}

        <MotiView
          animate={{
            opacity: isSearchActive ? 0.55 : isSearchFocused ? 0.38 : 0.2,
            scaleX: isMotionBoostActive ? 1 : 0.82,
          }}
          transition={{ type: "timing", duration: 220 }}
          style={[
            styles.motionConnector,
            { backgroundColor: state.theme.primaryColor },
          ]}
        />
        <AnimatePresence>
          {isSearchActive ? (
            <MotiView
              key="search-results-panel"
              from={{ opacity: 0, translateY: -10 }}
              animate={{
                opacity: 1,
                translateY: 0,
                scale: isMotionBoostActive ? 1.004 : 1,
              }}
              exit={{ opacity: 0, translateY: -8 }}
              transition={{ type: "timing", duration: 220 }}
              style={styles.searchResultsContainer}
            >
              <View style={styles.sectionHeader}>
                <Text
                  style={[styles.sectionTitle, { color: adaptiveTextColor }]}
                >
                  Search Results
                </Text>
                <Text style={styles.planMeta}>
                  {isSearchQueryTooShort
                    ? "Type at least 2 letters"
                    : `${rankedSearchResults.length} result${rankedSearchResults.length === 1 ? "" : "s"}`}
                </Text>
              </View>
              <AnimatePresence>
                {isSearchQueryTooShort ? (
                  <MotiView
                    key="search-too-short"
                    from={{ opacity: 0, translateY: 6 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    exit={{ opacity: 0, translateY: -6 }}
                    transition={{ type: "timing", duration: 180 }}
                  >
                    <View
                      style={[
                        styles.searchEmptyCard,
                        { backgroundColor: adaptiveCardBg },
                      ]}
                    >
                      <Text
                        style={[
                          styles.emptyStateTitle,
                          { color: adaptiveTextColor },
                        ]}
                      >
                        Keep typing your query
                      </Text>
                      <Text style={styles.emptyStateSubtitle}>
                        Enter at least two letters to search missions, projects,
                        STEM, mentors, and badges.
                      </Text>
                    </View>
                  </MotiView>
                ) : rankedSearchResults.length === 0 ? (
                  <MotiView
                    key="search-no-results"
                    from={{ opacity: 0, translateY: 6 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    exit={{ opacity: 0, translateY: -6 }}
                    transition={{ type: "timing", duration: 180 }}
                  >
                    <View
                      style={[
                        styles.searchEmptyCard,
                        { backgroundColor: adaptiveCardBg },
                      ]}
                    >
                      <Text
                        style={[
                          styles.emptyStateTitle,
                          { color: adaptiveTextColor },
                        ]}
                      >
                        No matches found
                      </Text>
                      <Text style={styles.emptyStateSubtitle}>
                        Try a broader term like mission, mentor, coding,
                        project, or badge.
                      </Text>
                    </View>
                  </MotiView>
                ) : (
                  <MotiView
                    key="search-results-list"
                    from={{ opacity: 0, translateY: 8 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    exit={{ opacity: 0, translateY: -8 }}
                    transition={{ type: "timing", duration: 180 }}
                  >
                    <View style={styles.searchResultList}>
                      <AnimatePresence>
                        {rankedSearchResults.map((result, idx) => (
                          <MotiView
                            key={result.id}
                            from={{ opacity: 0, translateY: 8, scale: 0.985 }}
                            animate={{ opacity: 1, translateY: 0, scale: 1 }}
                            exit={{ opacity: 0, translateY: -6, scale: 0.985 }}
                            transition={{
                              type: "timing",
                              duration: 180,
                              delay: idx * 28,
                            }}
                          >
                            <MotiPressable
                              onPress={() => {
                                persistSearchQuery(search);
                                result.onPress();
                                setSearch("");
                              }}
                              animate={pressScale98}
                              style={[
                                styles.searchResultCard,
                                { backgroundColor: adaptiveCardBg },
                              ]}
                            >
                              <View style={styles.searchResultTopRow}>
                                <View style={styles.searchResultIconWrap}>
                                  <Ionicons
                                    name={result.icon}
                                    size={18}
                                    color={state.theme.primaryColor}
                                  />
                                </View>
                                <View style={styles.searchResultMeta}>
                                  <Text style={styles.searchResultSection}>
                                    {result.sectionLabel}
                                  </Text>
                                  <Text
                                    style={styles.searchResultSubtitle}
                                    numberOfLines={1}
                                  >
                                    {result.subtitle}
                                  </Text>
                                </View>
                                <View
                                  style={[
                                    styles.searchResultCta,
                                    { borderColor: state.theme.primaryColor },
                                  ]}
                                >
                                  <Text
                                    style={[
                                      styles.searchResultCtaText,
                                      { color: state.theme.primaryColor },
                                    ]}
                                  >
                                    {result.ctaLabel}
                                  </Text>
                                </View>
                              </View>
                              <Text
                                style={[
                                  styles.searchResultTitle,
                                  { color: adaptiveTextColor },
                                ]}
                                numberOfLines={1}
                              >
                                {result.title}
                              </Text>
                            </MotiPressable>
                          </MotiView>
                        ))}
                      </AnimatePresence>
                    </View>
                  </MotiView>
                )}
              </AnimatePresence>
            </MotiView>
          ) : null}
        </AnimatePresence>

        {!isSearchActive ? (
          <MotiView
            key="home-content-panel"
            from={{ opacity: 0.96, translateY: 4 }}
            animate={{
              opacity: isSearchFocused ? 0.95 : 1,
              translateY: isSearchFocused ? 5 : 0,
              scale: isSearchFocused ? 0.994 : isMotionBoostActive ? 1.002 : 1,
            }}
            transition={{ type: "timing", duration: 220 }}
          >
            <View
              style={[
                styles.avatarShowcase,
                state.theme.avatarBgType === "color" && {
                  backgroundColor: state.theme.avatarBgValue,
                },
              ]}
            >
              {state.theme.avatarBgType === "image" && (
                <View
                  style={[
                    StyleSheet.absoluteFill,
                    { borderRadius: radius.xxl, overflow: "hidden" },
                  ]}
                >
                  <Image
                    source={{ uri: state.theme.avatarBgValue }}
                    style={StyleSheet.absoluteFill}
                    resizeMode="cover"
                  />
                </View>
              )}

              <Pressable
                style={styles.editThemeBtn}
                onPress={() => {
                  triggerMotionBeat();
                  setThemeModalVisible(true);
                }}
              >
                <Ionicons
                  name={
                    state.theme.iconType === "filled"
                      ? "color-palette"
                      : "color-palette-outline"
                  }
                  size={20}
                  color="#FFFFFF"
                />
              </Pressable>
              <MotiImage
                source={selectedAvatar.full}
                style={styles.fullAvatar}
                resizeMode="contain"
                from={{ translateY: 5 }}
                animate={{ translateY: -15 }}
                transition={{ type: "timing", duration: 2500, loop: true }}
              />
              <View style={styles.avatarGradientOverlay} />

            </View>
            <MotiView
              animate={{
                translateY: isMotionBoostActive ? -2 : 0,
                opacity: isSearchFocused ? 0.97 : 1,
              }}
              transition={{ type: "timing", duration: 220 }}
              style={styles.lowerContent}
            >
              <View
                style={[
                  styles.continueCard,
                  { backgroundColor: adaptiveCardBg },
                ]}
              >
                <View style={styles.continueHeaderRow}>
                  <Text
                    style={[styles.continueLabel, { color: adaptiveTextColor }]}
                  >
                    Continue Learning
                  </Text>
                  <View style={styles.continuePill}>
                    <Ionicons
                      name={
                        state.theme.iconType === "filled"
                          ? "flash"
                          : "flash-outline"
                      }
                      size={13}
                      color={state.theme.primaryColor}
                    />
                    <Text
                      style={[
                        styles.continuePillText,
                        { color: state.theme.primaryColor },
                      ]}
                    >
                      Smart Resume
                    </Text>
                  </View>
                </View>
                <Text
                  style={[styles.continueTitle, { color: adaptiveTextColor }]}
                >
                  {continueCard.title}
                </Text>
                <Text style={styles.continueSubtitle}>
                  {continueCard.subtitle}
                </Text>
                <MotiPressable
                  onPress={continueCard.onPress}
                  animate={pressScale96}
                  style={[
                    styles.continueButton,
                    { backgroundColor: state.theme.primaryColor },
                  ]}
                >
                  <Text style={styles.continueButtonText}>
                    {continueCard.actionLabel}
                  </Text>
                </MotiPressable>
              </View>
              <View style={isDesktop ? styles.desktopHubShell : undefined}>
                <View style={isDesktop ? styles.desktopHubMain : undefined}>
              <Text style={[styles.sectionTitle, { color: adaptiveTextColor }]}>
                Explore Topics
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoriesScroll}
                style={styles.fullWidthScroll}
              >
                {hubCategories.map((cat, idx) => (
                  <MotiView
                    key={cat.tab}
                    from={{ translateY: 20, opacity: 0 }}
                    animate={{ translateY: 0, opacity: 1 }}
                    transition={{ delay: idx * 50, type: "spring" }}
                  >
                    <MotiPressable
                      onPress={() => openTab(cat.tab)}
                      animate={pressScale92}
                      style={[
                        styles.categoryCard,
                        { width: categoryCardWidth },
                        { backgroundColor: cat.color },
                      ]}
                    >
                      <View style={styles.categoryIconCircle}>
                        <Ionicons
                          name={
                            (state.theme.iconType === "filled"
                              ? cat.icon.replace("-outline", "")
                              : cat.icon) as any
                          }
                          size={24}
                          color={cat.iconColor}
                        />
                      </View>
                      <Text style={styles.categoryCardTitle}>{cat.title}</Text>
                      <View style={styles.categoryArrow}>
                        <Ionicons
                          name="chevron-forward"
                          size={14}
                          color={cat.iconColor}
                        />
                      </View>
                    </MotiPressable>
                  </MotiView>
                ))}
              </ScrollView>
              <View style={styles.sectionHeader}>
                <Text
                  style={[styles.sectionTitle, { color: adaptiveTextColor }]}
                >
                  Today's Plan
                </Text>
                <Text style={styles.planMeta}>
                  {visiblePlanTasks.length} tasks
                </Text>
              </View>
              <View style={styles.planList}>
                {visiblePlanTasks.map((task) => (
                  <View
                    key={task.id}
                    style={[
                      styles.planCard,
                      { backgroundColor: adaptiveCardBg },
                    ]}
                  >
                    <View style={styles.planCardTop}>
                      <Text
                        style={[
                          styles.planDuration,
                          { color: state.theme.primaryColor },
                        ]}
                      >
                        {task.durationLabel}
                      </Text>
                      <MotiPressable
                        onPress={task.onPress}
                        animate={pressScale94}
                        style={[
                          styles.planActionButton,
                          { borderColor: state.theme.primaryColor },
                        ]}
                      >
                        <Text
                          style={[
                            styles.planActionText,
                            { color: state.theme.primaryColor },
                          ]}
                        >
                          {task.actionLabel}
                        </Text>
                      </MotiPressable>
                    </View>
                    <Text
                      style={[styles.planTitle, { color: adaptiveTextColor }]}
                    >
                      {task.title}
                    </Text>
                    <Text style={styles.planSubtitle}>{task.subtitle}</Text>
                  </View>
                ))}
              </View>
              {!isDesktop ? (
                <>
                  <View style={styles.sectionHeader}>
                    <Text
                      style={[styles.sectionTitle, { color: adaptiveTextColor }]}
                    >
                      Quick Actions
                    </Text>
                  </View>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.quickActionsScroll}
                    style={styles.fullWidthScroll}
                  >
                    {quickActions.map((action) => (
                      <MotiPressable
                        key={action.id}
                        onPress={action.onPress}
                        animate={pressScale95}
                        style={[
                          styles.quickActionPill,
                          { backgroundColor: action.color },
                        ]}
                      >
                        <Ionicons
                          name={
                            (state.theme.iconType === "filled"
                              ? action.icon.replace("-outline", "")
                              : action.icon) as any
                          }
                          size={18}
                          color={colors.textPrimary}
                        />
                        <Text style={styles.quickActionLabelPill}>
                          {action.label}
                        </Text>
                      </MotiPressable>
                    ))}
                  </ScrollView>
                </>
              ) : null}
              <View style={styles.sectionHeader}>
                <Text
                  style={[styles.sectionTitle, { color: adaptiveTextColor }]}
                >
                  Mentor Live
                </Text>
                <Pressable onPress={() => openTab("Mentorship")}>
                  <Text
                    style={[
                      styles.seeAllText,
                      { color: state.theme.primaryColor },
                    ]}
                  >
                    Open mentorship
                  </Text>
                </Pressable>
              </View>
              {liveMentors.length === 0 ? (
                <View
                  style={[
                    styles.emptyMentorsCard,
                    { backgroundColor: adaptiveCardBg },
                  ]}
                >
                  <Text
                    style={[
                      styles.emptyMentorsTitle,
                      { color: adaptiveTextColor },
                    ]}
                  >
                    No mentors online right now
                  </Text>
                  <Text style={styles.emptyMentorsSubtitle}>
                    You can still browse all mentors and send a request from
                    mentorship.
                  </Text>
                </View>
              ) : (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.mentorScroll}
                  style={styles.fullWidthScroll}
                >
                  {liveMentors.map((mentor) => {
                    const requestStatus =
                      state.mentorshipRequests[mentor.id]?.status ?? "none";
                    const canChatOrCall = requestStatus === "accepted";
                    return (
                      <View key={mentor.id} style={[styles.mentorCard, { width: railCardWidth }]}>
                        <View style={styles.mentorTopRow}>
                          <View style={styles.mentorAvatar}>
                            <Ionicons
                              name="person-outline"
                              size={18}
                              color={colors.textPrimary}
                            />
                          </View>
                          <View style={styles.liveBadge}>
                            <View style={styles.liveDot} />
                            <Text style={styles.liveText}>Live</Text>
                          </View>
                        </View>
                        <Text style={styles.mentorName} numberOfLines={1}>
                          {mentor.name}
                        </Text>
                        <Text style={styles.mentorSpecialty} numberOfLines={1}>
                          {mentor.specialty}
                        </Text>
                        <Text style={styles.mentorSlots} numberOfLines={1}>
                          {mentor.openSlotsLabel}
                        </Text>
                        <View style={styles.mentorActionRow}>
                          {!canChatOrCall ? (
                            <MotiPressable
                              onPress={() => openMentorProfile(mentor.id)}
                              style={[
                                styles.mentorPrimaryBtn,
                                { backgroundColor: state.theme.primaryColor },
                              ]}
                            >
                              <Text style={styles.mentorPrimaryBtnText}>
                                Request
                              </Text>
                            </MotiPressable>
                          ) : (
                            <>
                              <MotiPressable
                                onPress={() => openMentorChat(mentor.id)}
                                style={[
                                  styles.mentorSecondaryBtn,
                                  { borderColor: state.theme.primaryColor },
                                ]}
                              >
                                <Text
                                  style={[
                                    styles.mentorSecondaryBtnText,
                                    { color: state.theme.primaryColor },
                                  ]}
                                >
                                  Chat
                                </Text>
                              </MotiPressable>
                              <MotiPressable
                                onPress={() => openMentorCall(mentor.id)}
                                style={[
                                  styles.mentorPrimaryBtn,
                                  { backgroundColor: state.theme.primaryColor },
                                ]}
                              >
                                <Text style={styles.mentorPrimaryBtnText}>
                                  Call
                                </Text>
                              </MotiPressable>
                            </>
                          )}
                        </View>
                      </View>
                    );
                  })}
                </ScrollView>
              )}

              {!isDesktop ? (
                <>
                  <View style={styles.sectionHeader}>
                    <Text
                      style={[styles.sectionTitle, { color: adaptiveTextColor }]}
                    >
                      Momentum
                    </Text>
                    <Text style={styles.planMeta}>
                      {weeklyGoalProgress}/{weeklyGoalTarget} done
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.weeklyGoalCard,
                      { backgroundColor: adaptiveCardBg },
                    ]}
                  >
                    <Text
                      style={[styles.weeklyGoalTitle, { color: adaptiveTextColor }]}
                    >
                      {weeklyGoalRemaining === 0
                        ? "Target complete. Great progress!"
                        : `${weeklyGoalRemaining} activities to reach your weekly milestone.`}
                    </Text>
                    <View style={styles.weeklyBarTrack}>
                      <View
                        style={[
                          styles.weeklyBarFill,
                          {
                            width: `${weeklyGoalPercent}%`,
                            backgroundColor: state.theme.primaryColor,
                          },
                        ]}
                      />
                    </View>
                    <View style={styles.weeklyStatsRow}>
                      {progressTiles.slice(0, 3).map((tile) => (
                        <View key={tile.id} style={styles.weeklyStatChip}>
                          <Text style={styles.weeklyStatValue}>
                            {tile.value.split(" ")[0]}
                          </Text>
                          <Text style={styles.weeklyStatLabel}>{tile.label}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </>
              ) : null}
              <View style={styles.sectionHeader}>
                <Text
                  style={[styles.sectionTitle, { color: adaptiveTextColor }]}
                >
                  For You
                </Text>
                <Text style={styles.planMeta}>Personalized picks</Text>
              </View>
              {visibleRecommendations.length === 0 ? (
                <View
                  style={[
                    styles.emptyStateCard,
                    { backgroundColor: adaptiveCardBg },
                  ]}
                >
                  <Text
                    style={[
                      styles.emptyStateTitle,
                      { color: adaptiveTextColor },
                    ]}
                  >
                    No personalized suggestions yet
                  </Text>
                  <Text style={styles.emptyStateSubtitle}>
                    Start a mission, trivia session, or mentorship request to
                    unlock smarter recommendations.
                  </Text>
                </View>
              ) : (
                <View style={styles.recommendationList}>
                  {visibleRecommendations.map((rec) => (
                    <View
                      key={rec.id}
                      style={[
                        styles.recommendationCard,
                        { backgroundColor: adaptiveCardBg },
                      ]}
                    >
                      <View style={styles.recommendationTopRow}>
                        <View style={styles.recommendationIconWrap}>
                          <Ionicons
                            name={rec.icon}
                            size={18}
                            color={state.theme.primaryColor}
                          />
                        </View>
                        <MotiPressable
                          onPress={rec.onPress}
                          style={[
                            styles.recommendationCtaBtn,
                            { borderColor: state.theme.primaryColor },
                          ]}
                        >
                          <Text
                            style={[
                              styles.recommendationCtaText,
                              { color: state.theme.primaryColor },
                            ]}
                          >
                            {rec.cta}
                          </Text>
                        </MotiPressable>
                      </View>
                      <Text
                        style={[
                          styles.recommendationTitle,
                          { color: adaptiveTextColor },
                        ]}
                      >
                        {rec.title}
                      </Text>
                      <Text style={styles.recommendationReason}>
                        {rec.reason}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              {!isDesktop ? (
                <>
                  <View style={styles.sectionHeader}>
                    <Text
                      style={[styles.sectionTitle, { color: adaptiveTextColor }]}
                    >
                      Recent Activity
                    </Text>
                    <Text style={styles.planMeta}>
                      {activityFeed.length} updates
                    </Text>
                  </View>
                  {activityFeed.length === 0 ? (
                    <View
                      style={[
                        styles.emptyStateCard,
                        { backgroundColor: adaptiveCardBg },
                      ]}
                    >
                      <Text
                        style={[
                          styles.emptyStateTitle,
                          { color: adaptiveTextColor },
                        ]}
                      >
                        No recent activity
                      </Text>
                      <Text style={styles.emptyStateSubtitle}>
                        Your mission, project, mentorship, and chat events will
                        show up here.
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.feedList}>
                      {activityFeed.map((item) => (
                        <View
                          key={item.id}
                          style={[
                            styles.feedItem,
                            { backgroundColor: adaptiveCardBg },
                          ]}
                        >
                          <View style={styles.feedIconWrap}>
                            <Ionicons
                              name={item.icon}
                              size={18}
                              color={state.theme.primaryColor}
                            />
                          </View>
                          <View style={styles.feedContent}>
                            <Text
                              style={[
                                styles.feedTitle,
                                { color: adaptiveTextColor },
                              ]}
                            >
                              {item.title}
                            </Text>
                            <Text style={styles.feedDetail}>{item.detail}</Text>
                          </View>
                          <Text style={styles.feedTime}>
                            {formatRelativeTime(item.iso)}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}
                </>
              ) : null}

              <View style={styles.sectionHeader}>
                <Text
                  style={[styles.sectionTitle, { color: adaptiveTextColor }]}
                >
                  Recommended Missions
                </Text>
                <Pressable onPress={() => openTab("Missions")}>
                  <Text
                    style={[
                      styles.seeAllText,
                      { color: state.theme.primaryColor },
                    ]}
                  >
                    See all
                  </Text>
                </Pressable>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.recommendedScroll}
                style={styles.fullWidthScroll}
              >
                {missionCatalog.slice(0, 2).map((mission, idx) => (
                  <MotiView
                    key={mission.id}
                    from={{ translateY: 40, opacity: 0 }}
                    animate={{ translateY: 0, opacity: 1 }}
                    transition={{ delay: 200 + idx * 100, type: "spring" }}
                    style={[
                      styles.recommendedCard,
                      { width: railCardWidth },
                      { backgroundColor: idx === 0 ? "#1D2338" : "#2B527A" },
                    ]}
                  >
                    <Text style={styles.recTitle}>{mission.title}</Text>
                    <View style={styles.recMeta}>
                      <Ionicons name="time-outline" size={12} color="#FFFFFF" />
                      <Text style={styles.recDuration}>
                        {mission.durationMinutes} mins
                      </Text>
                    </View>
                    <View style={styles.playButtonWrapper}>
                      <MotiPressable
                        onPress={() => openTab("Missions")}
                        animate={pressScale90}
                        style={[
                          styles.playButton,
                          { backgroundColor: state.theme.primaryColor },
                        ]}
                      >
                        <Ionicons
                          name={
                            state.theme.iconType === "filled"
                              ? "play"
                              : "play-outline"
                          }
                          size={20}
                          color={colors.textInverse}
                          style={styles.playIcon}
                        />
                      </MotiPressable>
                    </View>
                  </MotiView>
                ))}
              </ScrollView>
                </View>
                {isDesktop ? (
                  <View style={styles.desktopHubSidebar}>
                    <View
                      style={[
                        styles.desktopPanelCard,
                        { backgroundColor: adaptiveCardBg },
                      ]}
                    >
                      <Text
                        style={[
                          styles.desktopPanelTitle,
                          { color: adaptiveTextColor },
                        ]}
                      >
                        Quick Actions
                      </Text>
                      <View style={styles.desktopQuickActionList}>
                        {quickActions.map((action) => (
                          <MotiPressable
                            key={`desktop-${action.id}`}
                            onPress={action.onPress}
                            animate={pressScale96}
                            style={[
                              styles.desktopQuickActionButton,
                              { backgroundColor: action.color },
                            ]}
                          >
                            <Ionicons
                              name={
                                (state.theme.iconType === "filled"
                                  ? action.icon.replace("-outline", "")
                                  : action.icon) as any
                              }
                              size={16}
                              color={colors.textPrimary}
                            />
                            <Text
                              style={styles.desktopQuickActionButtonText}
                              numberOfLines={1}
                            >
                              {action.label}
                            </Text>
                          </MotiPressable>
                        ))}
                      </View>
                    </View>

                    <View
                      style={[
                        styles.desktopPanelCard,
                        { backgroundColor: adaptiveCardBg },
                      ]}
                    >
                      <View style={styles.desktopPanelHeaderRow}>
                        <Text
                          style={[
                            styles.desktopPanelTitle,
                            { color: adaptiveTextColor },
                          ]}
                        >
                          Momentum
                        </Text>
                        <Text style={styles.planMeta}>
                          {weeklyGoalProgress}/{weeklyGoalTarget}
                        </Text>
                      </View>
                      <View style={styles.weeklyBarTrack}>
                        <View
                          style={[
                            styles.weeklyBarFill,
                            {
                              width: `${weeklyGoalPercent}%`,
                              backgroundColor: state.theme.primaryColor,
                            },
                          ]}
                        />
                      </View>
                      <View style={styles.weeklyStatsRow}>
                        {progressTiles.slice(0, 3).map((tile) => (
                          <View key={`desktop-${tile.id}`} style={styles.weeklyStatChip}>
                            <Text style={styles.weeklyStatValue}>
                              {tile.value.split(" ")[0]}
                            </Text>
                            <Text style={styles.weeklyStatLabel}>{tile.label}</Text>
                          </View>
                        ))}
                      </View>
                    </View>

                    <View
                      style={[
                        styles.desktopPanelCard,
                        { backgroundColor: adaptiveCardBg },
                      ]}
                    >
                      <View style={styles.desktopPanelHeaderRow}>
                        <Text
                          style={[
                            styles.desktopPanelTitle,
                            { color: adaptiveTextColor },
                          ]}
                        >
                          Recent Activity
                        </Text>
                        <Text style={styles.planMeta}>
                          {sidebarActivityFeed.length}
                        </Text>
                      </View>
                      {sidebarActivityFeed.length === 0 ? (
                        <Text style={styles.emptyStateSubtitle}>
                          Activity will appear here as you complete tasks.
                        </Text>
                      ) : (
                        <View style={styles.desktopSidebarFeedList}>
                          {sidebarActivityFeed.map((item) => (
                            <View key={`desktop-${item.id}`} style={styles.desktopFeedRow}>
                              <Ionicons
                                name={item.icon}
                                size={14}
                                color={state.theme.primaryColor}
                              />
                              <View style={styles.desktopFeedTextWrap}>
                                <Text
                                  style={[
                                    styles.desktopFeedTitle,
                                    { color: adaptiveTextColor },
                                  ]}
                                  numberOfLines={1}
                                >
                                  {item.title}
                                </Text>
                                <Text
                                  style={styles.desktopFeedMeta}
                                  numberOfLines={1}
                                >
                                  {item.detail}
                                </Text>
                              </View>
                              <Text style={styles.desktopFeedTime}>
                                {formatRelativeTime(item.iso)}
                              </Text>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>
                  </View>
                ) : null}
              </View>
            </MotiView>
          </MotiView>
        ) : null}
      </ScrollView>
      <ThemeEditorModal
        visible={themeModalVisible}
        onClose={() => setThemeModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.bgCanvas,
    flex: 1,
  },
  motionAmbientLayer: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
    zIndex: 0,
  },
  motionAmbientOrb: {
    borderRadius: 240,
    height: 260,
    left: -90,
    opacity: 0.1,
    position: "absolute",
    top: -120,
    width: 260,
  },
  motionRipple: {
    borderRadius: 320,
    borderWidth: 1.5,
    height: 320,
    left: -120,
    opacity: 0,
    position: "absolute",
    top: -150,
    width: 320,
  },
  fixedHeader: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
    zIndex: 1,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
    zIndex: 1,
  },
  searchFieldMotionWrap: {
    marginTop: spacing.xs,
  },
  motionConnector: {
    borderRadius: radius.pill,
    height: 3,
    marginBottom: spacing.sm,
    marginTop: spacing.xs,
  },
  offlineBanner: {
    alignItems: "center",
    backgroundColor: "#FEF3C7",
    borderRadius: radius.lg,
    flexDirection: "row",
    gap: spacing.xs,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  offlineText: {
    color: "#92400E",
    flex: 1,
    fontSize: 12,
    fontWeight: "700",
  },
  celebrationBanner: {
    alignItems: "center",
    backgroundColor: "#D1FAE5",
    borderRadius: radius.lg,
    flexDirection: "row",
    gap: spacing.xs,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  celebrationText: {
    color: "#065F46",
    flex: 1,
    fontSize: 12,
    fontWeight: "800",
  },
  searchHistoryCard: {
    borderRadius: radius.xl,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
    padding: spacing.sm,
  },
  searchHistoryHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.xs,
  },
  searchHistoryTitle: {
    fontSize: typography.caption,
    fontWeight: "800",
  },
  searchHistoryClear: {
    fontSize: 12,
    fontWeight: "700",
  },
  searchHistoryChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  searchHistoryChip: {
    alignItems: "center",
    borderRadius: radius.pill,
    borderWidth: 1,
    flexDirection: "row",
    gap: 4,
    maxWidth: "100%",
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  searchHistoryChipText: {
    fontSize: 12,
    fontWeight: "600",
    maxWidth: 180,
  },
  searchResultsContainer: {
    marginTop: spacing.xs,
  },
  searchEmptyCard: {
    borderRadius: radius.xl,
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  searchResultList: {
    gap: spacing.sm,
  },
  searchResultCard: {
    borderRadius: radius.xl,
    padding: spacing.sm,
  },
  searchResultTopRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
  },
  searchResultIconWrap: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.65)",
    borderRadius: 14,
    height: 32,
    justifyContent: "center",
    width: 32,
  },
  searchResultMeta: {
    flex: 1,
  },
  searchResultSection: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  searchResultSubtitle: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2,
  },
  searchResultCta: {
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  searchResultCtaText: {
    fontSize: 11,
    fontWeight: "800",
  },
  searchResultTitle: {
    fontSize: typography.body,
    fontWeight: "800",
    marginTop: spacing.xs,
  },
  avatarShowcase: {
    alignItems: "center",
    backgroundColor: colors.bgSoft,
    borderRadius: radius.xxl,
    height: 240,
    justifyContent: "flex-end",
    marginTop: spacing.sm,
  },
  editThemeBtn: {
    position: "absolute",
    top: spacing.md,
    right: spacing.md,
    backgroundColor: "rgba(0,0,0,0.15)",
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  fullAvatar: {
    height: "100%",
    width: "100%",
    zIndex: 5,
  },
  lowerContent: {
    marginTop: spacing.xl,
  },
  desktopHubShell: {
    flexDirection: "row",
    gap: spacing.lg,
  },
  desktopHubMain: {
    flex: 1,
    minWidth: 0,
  },
  desktopHubSidebar: {
    width: 330,
    gap: spacing.md,
  },
  desktopPanelCard: {
    borderRadius: radius.xl,
    padding: spacing.md,
  },
  desktopPanelHeaderRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.xs,
  },
  desktopPanelTitle: {
    fontSize: typography.body,
    fontWeight: "800",
  },
  desktopQuickActionList: {
    gap: spacing.xs,
  },
  desktopQuickActionButton: {
    alignItems: "center",
    borderRadius: radius.lg,
    flexDirection: "row",
    gap: spacing.xs,
    minHeight: 42,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  desktopQuickActionButtonText: {
    color: colors.textPrimary,
    flex: 1,
    fontSize: 12,
    fontWeight: "700",
  },
  desktopSidebarFeedList: {
    gap: spacing.xs,
  },
  desktopFeedRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs,
  },
  desktopFeedTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  desktopFeedTitle: {
    fontSize: 12,
    fontWeight: "700",
  },
  desktopFeedMeta: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: "600",
  },
  desktopFeedTime: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: "700",
  },
  continueCard: {
    borderRadius: radius.xxl,
    marginBottom: spacing.lg,
    padding: spacing.lg,
  },
  continueHeaderRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  continueLabel: {
    fontSize: typography.caption,
    fontWeight: "800",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  continuePill: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.65)",
    borderRadius: radius.pill,
    flexDirection: "row",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  continuePillText: {
    fontSize: 11,
    fontWeight: "800",
  },
  continueTitle: {
    fontSize: typography.subheading,
    fontWeight: "900",
  },
  continueSubtitle: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    fontWeight: "600",
    marginTop: spacing.xs,
  },
  continueButton: {
    alignItems: "center",
    borderRadius: radius.pill,
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
  },
  continueButtonText: {
    color: colors.textInverse,
    fontSize: typography.caption,
    fontWeight: "800",
  },
  fullWidthScroll: {
    marginHorizontal: -spacing.md,
  },
  snapshotScroll: {
    gap: spacing.sm,
    marginBottom: spacing.sm,
    paddingLeft: spacing.md,
    paddingRight: spacing.md,
  },
  snapshotCard: {
    borderRadius: radius.xl,
    minHeight: 140,
    padding: spacing.md,
    width: 165,
    ...shadow.soft,
  },
  snapshotIconWrap: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.55)",
    borderRadius: 14,
    height: 32,
    justifyContent: "center",
    width: 32,
  },
  snapshotValue: {
    color: colors.textPrimary,
    fontSize: typography.subheading,
    fontWeight: "900",
    marginTop: spacing.sm,
  },
  snapshotLabel: {
    color: colors.textPrimary,
    fontSize: typography.caption,
    fontWeight: "800",
    marginTop: 2,
  },
  snapshotHelper: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: "600",
    marginTop: spacing.xs,
  },

  avatarGradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0)",
    borderRadius: radius.xxl,
  },
  heroProgressOverlay: {
    position: "absolute",
    bottom: spacing.md,
    left: spacing.md,
    right: spacing.md,
    backgroundColor: "transparent",
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  heroProgressLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.textPrimary,
  },
  heroProgressBar: {
    flex: 1,
    height: 6,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: radius.pill,
  },
  heroProgressFill: {
    height: "100%",
    borderRadius: radius.pill,
  },
  quickActionsScroll: {
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  quickActionPill: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 999,
  },
  quickActionLabelPill: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: "700",
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  quickActionCard: {
    alignItems: "center",
    borderRadius: radius.xl,
    flex: 1,
    minWidth: "47%",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.md,
    ...shadow.soft,
  },
  quickActionIconWrap: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.65)",
    borderRadius: 16,
    height: 34,
    justifyContent: "center",
    marginBottom: spacing.xs,
    width: 34,
  },
  quickActionLabel: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: "800",
    textAlign: "center",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
    marginTop: spacing.lg,
  },
  planMeta: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    fontWeight: "600",
  },
  planList: {
    gap: spacing.sm,
  },
  planCard: {
    borderRadius: radius.xl,
    padding: spacing.md,
  },
  planCardTop: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.xs,
  },
  planDuration: {
    fontSize: 12,
    fontWeight: "800",
  },
  planActionButton: {
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  planActionText: {
    fontSize: 12,
    fontWeight: "800",
  },
  planTitle: {
    fontSize: typography.body,
    fontWeight: "800",
  },
  planSubtitle: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    fontWeight: "600",
    marginTop: 2,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: typography.subheading,
    fontWeight: "800",
  },
  seeAllText: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    fontWeight: "600",
  },
  categoriesScroll: {
    gap: spacing.sm,
    marginBottom: spacing.xl,
    marginTop: spacing.md,
    paddingLeft: spacing.md,
    paddingRight: spacing.md,
  },
  emptyMentorsCard: {
    borderRadius: radius.xl,
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  emptyMentorsTitle: {
    fontSize: typography.body,
    fontWeight: "800",
  },
  emptyMentorsSubtitle: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    fontWeight: "600",
    marginTop: spacing.xs,
  },
  mentorScroll: {
    gap: spacing.sm,
    marginBottom: spacing.md,
    paddingLeft: spacing.md,
    paddingRight: spacing.md,
  },
  mentorCard: {
    backgroundColor: colors.bgSurface,
    borderRadius: radius.xl,
    padding: spacing.md,
    width: 220,
    ...shadow.soft,
  },
  mentorTopRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  mentorAvatar: {
    alignItems: "center",
    backgroundColor: colors.bgSoft,
    borderRadius: 16,
    height: 32,
    justifyContent: "center",
    width: 32,
  },
  liveBadge: {
    alignItems: "center",
    backgroundColor: "#DCFCE7",
    borderRadius: radius.pill,
    flexDirection: "row",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  liveDot: {
    backgroundColor: "#22C55E",
    borderRadius: 4,
    height: 8,
    width: 8,
  },
  liveText: {
    color: "#166534",
    fontSize: 11,
    fontWeight: "800",
  },
  mentorName: {
    color: colors.textPrimary,
    fontSize: typography.body,
    fontWeight: "800",
  },
  mentorSpecialty: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    fontWeight: "600",
    marginTop: 2,
  },
  mentorSlots: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
    marginTop: spacing.xs,
  },
  mentorActionRow: {
    flexDirection: "row",
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  mentorPrimaryBtn: {
    alignItems: "center",
    borderRadius: radius.pill,
    flex: 1,
    justifyContent: "center",
    paddingVertical: 8,
  },
  mentorPrimaryBtnText: {
    color: colors.textInverse,
    fontSize: 12,
    fontWeight: "800",
  },
  mentorSecondaryBtn: {
    alignItems: "center",
    borderRadius: radius.pill,
    borderWidth: 1,
    flex: 1,
    justifyContent: "center",
    paddingVertical: 8,
  },
  mentorSecondaryBtnText: {
    fontSize: 12,
    fontWeight: "800",
  },
  weeklyGoalCard: {
    borderRadius: radius.xl,
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  weeklyGoalTitle: {
    fontSize: typography.body,
    fontWeight: "800",
  },
  weeklyGoalSubtitle: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 17,
    marginTop: spacing.xs,
  },
  weeklyBarTrack: {
    backgroundColor: "rgba(148,163,184,0.3)",
    borderRadius: radius.pill,
    height: 10,
    marginTop: spacing.md,
    overflow: "hidden",
  },
  weeklyBarFill: {
    borderRadius: radius.pill,
    height: "100%",
  },
  weeklyStatsRow: {
    flexDirection: "row",
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  weeklyStatChip: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.6)",
    borderRadius: radius.lg,
    flex: 1,
    paddingVertical: 8,
  },
  weeklyStatLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: "700",
  },
  weeklyStatValue: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "900",
    marginTop: 2,
  },
  emptyStateCard: {
    borderRadius: radius.xl,
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  emptyStateTitle: {
    fontSize: typography.body,
    fontWeight: "800",
  },
  emptyStateSubtitle: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    fontWeight: "600",
    marginTop: spacing.xs,
  },
  recommendationList: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  recommendationCard: {
    borderRadius: radius.xl,
    padding: spacing.md,
  },
  recommendationTopRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.xs,
  },
  recommendationIconWrap: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.65)",
    borderRadius: 14,
    height: 30,
    justifyContent: "center",
    width: 30,
  },
  recommendationCtaBtn: {
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  recommendationCtaText: {
    fontSize: 12,
    fontWeight: "800",
  },
  recommendationTitle: {
    fontSize: typography.body,
    fontWeight: "800",
  },
  recommendationReason: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    fontWeight: "600",
    marginTop: spacing.xs,
  },
  feedList: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  feedItem: {
    alignItems: "center",
    borderRadius: radius.xl,
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.sm,
  },
  feedIconWrap: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.6)",
    borderRadius: 14,
    height: 30,
    justifyContent: "center",
    width: 30,
  },
  feedContent: {
    flex: 1,
  },
  feedTitle: {
    fontSize: typography.caption,
    fontWeight: "800",
  },
  feedDetail: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2,
  },
  feedTime: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: "700",
    marginLeft: spacing.xs,
  },
  categoryCard: {
    width: 120,
    borderRadius: 24,
    padding: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    alignItems: "center",
    ...shadow.soft,
  },
  categoryIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.6)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  categoryCardTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.textPrimary,
    textAlign: "center",
    marginBottom: spacing.xs,
  },
  categoryArrow: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  recommendedScroll: {
    gap: spacing.md,
    paddingLeft: spacing.md,
    paddingRight: spacing.md,
    overflow: "visible",
  },
  recommendedCard: {
    borderRadius: 30,
    height: 180,
    padding: spacing.md,
    paddingBottom: 40,
    position: "relative",
    width: 220,
  },
  recTitle: {
    color: colors.textInverse,
    fontSize: typography.heading,
    fontWeight: "800",
    lineHeight: 28,
    marginTop: spacing.sm,
  },
  recMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: spacing.xs,
  },
  recDuration: {
    color: colors.textInverse,
    fontSize: typography.caption,
    fontWeight: "500",
  },
  playButtonWrapper: {
    alignItems: "center",
    bottom: 10,
    left: 0,
    position: "absolute",
    right: 0,
  },
  playButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.ctaPrimary,
    alignItems: "center",
    justifyContent: "center",
    ...shadow.fab,
  },
  playIcon: {
    marginLeft: 3,
  },
});
