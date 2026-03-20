import { useEffect, useMemo, useState } from "react";

import { useAuth } from "../context/AuthContext";
import { mentorshipStoryCatalog } from "../data/mentorshipStories";
import {
  mergeMentorshipStoryCatalog,
  subscribeToMentorshipStoryOverrides,
  type MentorshipStoryCatalogItem,
  type MentorshipStoryOverrideDoc,
} from "../services/mentorshipStoryService";

type Options = {
  includeHidden?: boolean;
};

type MentorshipStoryCounts = {
  total: number;
  female: number;
  nigerian: number;
  africanFocus: number;
};

function deriveCounts(stories: MentorshipStoryCatalogItem[]): MentorshipStoryCounts {
  return {
    total: stories.length,
    female: stories.filter((story) => story.gender === "female").length,
    nigerian: stories.filter((story) => story.heritageFocus === "nigerian").length,
    africanFocus: stories.filter(
      (story) =>
        story.heritageFocus === "nigerian" ||
        story.heritageFocus === "african" ||
        story.heritageFocus === "global_african_descent",
    ).length,
  };
}

export function useMentorshipStoryCatalog(options: Options = {}) {
  const { user, isLoading: isAuthLoading } = useAuth();
  const includeHidden = options.includeHidden ?? false;
  const [overrides, setOverrides] = useState<MentorshipStoryOverrideDoc[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isAuthLoading) {
      setIsLoading(true);
      return;
    }

    if (!user) {
      setOverrides([]);
      setIsLoading(false);
      return;
    }

    const unsubscribe = subscribeToMentorshipStoryOverrides(
      (entries) => {
        setOverrides(entries);
        setIsLoading(false);
      },
      () => {
        setOverrides([]);
        setIsLoading(false);
      },
    );

    return unsubscribe;
  }, [isAuthLoading, user]);

  const allStories = useMemo(
    () => mergeMentorshipStoryCatalog(mentorshipStoryCatalog, overrides),
    [overrides],
  );

  const stories = useMemo(
    () => (includeHidden ? allStories : allStories.filter((story) => !story.adminHidden)),
    [allStories, includeHidden],
  );

  const storyById = useMemo(
    () =>
      allStories.reduce<Record<string, MentorshipStoryCatalogItem>>((acc, story) => {
        acc[story.id] = story;
        return acc;
      }, {}),
    [allStories],
  );

  const counts = useMemo(() => deriveCounts(stories), [stories]);

  return {
    stories,
    allStories,
    storyById,
    counts,
    isLoading,
  };
}
