import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  type FirestoreError,
  type Unsubscribe,
} from "firebase/firestore";

import {
  mentorshipStoryCatalog,
  type MentorshipStory,
  type MentorshipStoryTriviaQuestion,
  type StoryGender,
  type StoryHeritageFocus,
} from "../data/mentorshipStories";
import { db } from "../config/firebase";
import { loadUserRole } from "./userService";

const MENTORSHIP_STORIES_COLLECTION = "catalogs_mentorshipStories";
let hasLoggedMentorshipStoryPermissionWarning = false;

const BASE_STORY_ID_SET = new Set(mentorshipStoryCatalog.map((story) => story.id));

const HERITAGE_FOCUS_VALUES: StoryHeritageFocus[] = [
  "nigerian",
  "african",
  "global_african_descent",
  "global",
];

const STORY_GENDER_VALUES: StoryGender[] = ["female", "male"];

export type MentorshipStoryOverrideDoc = {
  id: string;
  hidden?: boolean;
  deleted?: boolean;
  source?: "custom" | "override";
  story?: Partial<MentorshipStory>;
};

export type MentorshipStoryCatalogItem = MentorshipStory & {
  adminHidden: boolean;
  adminSource: "base" | "custom";
};

export type UpsertMentorshipStoryInput = {
  id?: string;
  name: string;
  gender: StoryGender;
  origin: string;
  heritageFocus: StoryHeritageFocus;
  domains: string[];
  signature: string;
  contribution: string;
  impact: string;
  lesson: string;
  title: string;
  shortBlurb: string;
  imageUrl?: string;
  imageSourceUrl?: string;
  imageSourceTitle?: string;
  storyParagraphs: string[];
  triviaPool?: MentorshipStoryTriviaQuestion[];
  hidden?: boolean;
};

function asString(value: unknown) {
  if (typeof value !== "string") return "";
  return value.trim();
}

function parseGender(value: unknown): StoryGender {
  return STORY_GENDER_VALUES.includes(value as StoryGender) ? (value as StoryGender) : "female";
}

function parseHeritageFocus(value: unknown): StoryHeritageFocus {
  return HERITAGE_FOCUS_VALUES.includes(value as StoryHeritageFocus)
    ? (value as StoryHeritageFocus)
    : "global";
}

function parseDomains(value: unknown) {
  if (!Array.isArray(value)) {
    return ["Leadership", "Education"];
  }

  const cleaned = value
    .map((item) => asString(item))
    .filter(Boolean);

  if (cleaned.length >= 2) {
    return [cleaned[0], cleaned[1]];
  }
  if (cleaned.length === 1) {
    return [cleaned[0], "Leadership"];
  }
  return ["Leadership", "Education"];
}

function parseParagraphs(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map((item) => asString(item))
    .filter(Boolean);
}

function hashString(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
}

function seededShuffle<T>(items: T[], seed: number) {
  const arr = [...items];
  let state = seed || 1;
  for (let index = arr.length - 1; index > 0; index -= 1) {
    state = (state * 1664525 + 1013904223) >>> 0;
    const next = state % (index + 1);
    [arr[index], arr[next]] = [arr[next], arr[index]];
  }
  return arr;
}

function buildOptions(correct: string, pool: string[], seed: number) {
  const uniquePool = Array.from(
    new Set(pool.filter((entry) => entry !== correct && entry.trim().length > 0)),
  );
  const distractors = seededShuffle(uniquePool, seed).slice(0, 3);
  const options = seededShuffle([correct, ...distractors], seed + 97);
  return {
    options,
    correctOptionIndex: options.findIndex((entry) => entry === correct),
  };
}

function buildFallbackTriviaPool(story: MentorshipStory): MentorshipStoryTriviaQuestion[] {
  const [domainA, domainB] = story.domains;
  const heritageOptions = [
    "Nigerian-descent priority",
    "African-descent priority",
    "Global African-descent influence",
    "Global influence",
  ];
  const domainOptions = [
    domainA,
    domainB,
    "Science",
    "Technology",
    "Engineering",
    "Medicine",
    "Arts",
    "Invention",
    "Leadership",
    "Economics",
    "Education",
    "Sustainability",
    "Civic",
    "Strategy",
    "Diplomacy",
  ];
  const recapSentence = `${story.name} from ${story.origin} is recognized for ${story.signature}.`;
  const pool = [
    `${story.name} advanced positive change through ${domainA}.`,
    `${story.name} is connected to ${domainB} practice.`,
    `${story.name} emphasizes ${story.lesson}`,
    recapSentence,
  ];

  const questions: MentorshipStoryTriviaQuestion[] = [];

  for (let round = 0; round < 5; round += 1) {
    const seed = hashString(`${story.id}-${round}`);
    const q1 = buildOptions(story.name, [story.name, "Amina Bello", "Grace Daniel", "Lina Yusuf"], seed + 1);
    questions.push({
      id: `${story.id}-custom-q-${round * 10 + 1}`,
      prompt: "Who is the focus of this mentorship story?",
      options: q1.options,
      correctOptionIndex: q1.correctOptionIndex,
      explanation: `${story.name} is the profile highlighted in this story.`,
    });

    const q2 = buildOptions(story.origin, [story.origin, "Nigeria", "Kenya", "United States", "Ghana"], seed + 2);
    questions.push({
      id: `${story.id}-custom-q-${round * 10 + 2}`,
      prompt: "What origin is associated with this profile?",
      options: q2.options,
      correctOptionIndex: q2.correctOptionIndex,
      explanation: `${story.name}'s profile is set in ${story.origin}.`,
    });

    const q3 = buildOptions(domainA, domainOptions, seed + 3);
    questions.push({
      id: `${story.id}-custom-q-${round * 10 + 3}`,
      prompt: "Which primary domain is highlighted first?",
      options: q3.options,
      correctOptionIndex: q3.correctOptionIndex,
      explanation: `${domainA} is the primary domain in this story.`,
    });

    const q4 = buildOptions(domainB, domainOptions, seed + 4);
    questions.push({
      id: `${story.id}-custom-q-${round * 10 + 4}`,
      prompt: "Which secondary domain supports this profile?",
      options: q4.options,
      correctOptionIndex: q4.correctOptionIndex,
      explanation: `${domainB} is paired with ${domainA} in this story.`,
    });

    const q5 = buildOptions(story.signature, [story.signature, "policy execution", "market expansion", "systems optimization"], seed + 5);
    questions.push({
      id: `${story.id}-custom-q-${round * 10 + 5}`,
      prompt: "Which signature area best matches this profile?",
      options: q5.options,
      correctOptionIndex: q5.correctOptionIndex,
      explanation: `Signature area: ${story.signature}.`,
    });

    const q6 = buildOptions(story.contribution, [story.contribution, ...pool], seed + 6);
    questions.push({
      id: `${story.id}-custom-q-${round * 10 + 6}`,
      prompt: "Which contribution statement matches this story?",
      options: q6.options,
      correctOptionIndex: q6.correctOptionIndex,
      explanation: `Correct contribution: ${story.contribution}.`,
    });

    const q7 = buildOptions(story.impact, [story.impact, ...pool], seed + 7);
    questions.push({
      id: `${story.id}-custom-q-${round * 10 + 7}`,
      prompt: "Which impact statement is tied to this profile?",
      options: q7.options,
      correctOptionIndex: q7.correctOptionIndex,
      explanation: `Correct impact: ${story.impact}.`,
    });

    const q8 = buildOptions(story.lesson, [story.lesson, "Consistency builds trust.", "Mentorship requires action.", "Systems change takes time."], seed + 8);
    questions.push({
      id: `${story.id}-custom-q-${round * 10 + 8}`,
      prompt: "What core lesson does this profile emphasize?",
      options: q8.options,
      correctOptionIndex: q8.correctOptionIndex,
      explanation: `Core lesson: ${story.lesson}`,
    });

    const q9 = buildOptions(story.heritageFocus.replace(/_/g, " "), heritageOptions, seed + 9);
    questions.push({
      id: `${story.id}-custom-q-${round * 10 + 9}`,
      prompt: "Which priority category best fits this story?",
      options: q9.options,
      correctOptionIndex: q9.correctOptionIndex,
      explanation: `This story is categorized as ${story.heritageFocus.replace(/_/g, " ")}.`,
    });

    const q10 = buildOptions(recapSentence, [recapSentence, ...pool], seed + 10);
    questions.push({
      id: `${story.id}-custom-q-${round * 10 + 10}`,
      prompt: "Which recap sentence accurately matches this profile?",
      options: q10.options,
      correctOptionIndex: q10.correctOptionIndex,
      explanation: recapSentence,
    });
  }

  return questions;
}

function normalizeTriviaPool(value: unknown, fallbackStory: MentorshipStory) {
  if (!Array.isArray(value) || value.length === 0) {
    return buildFallbackTriviaPool(fallbackStory);
  }

  const parsed = value
    .map((item, index) => {
      if (!item || typeof item !== "object") return null;
      const entry = item as Partial<MentorshipStoryTriviaQuestion>;
      if (typeof entry.prompt !== "string" || !Array.isArray(entry.options)) {
        return null;
      }
      const options = entry.options.map((option) => asString(option)).filter(Boolean);
      if (options.length < 2) return null;
      const correctOptionIndex =
        typeof entry.correctOptionIndex === "number" &&
        entry.correctOptionIndex >= 0 &&
        entry.correctOptionIndex < options.length
          ? entry.correctOptionIndex
          : 0;

      return {
        id: asString(entry.id) || `${fallbackStory.id}-q-${index + 1}`,
        prompt: asString(entry.prompt),
        options,
        correctOptionIndex,
        explanation: asString(entry.explanation) || "Review this story and try again.",
      } satisfies MentorshipStoryTriviaQuestion;
    })
    .filter((entry): entry is MentorshipStoryTriviaQuestion => entry !== null);

  if (parsed.length > 0) {
    return parsed;
  }
  return buildFallbackTriviaPool(fallbackStory);
}

function normalizeStoryFromPartial(storyId: string, partialStory: Partial<MentorshipStory>): MentorshipStory | null {
  const name = asString(partialStory.name);
  if (name.length < 2) return null;

  const domains = parseDomains(partialStory.domains);
  const heritageFocus = parseHeritageFocus(partialStory.heritageFocus);

  const defaultStory: MentorshipStory = {
    id: storyId,
    name,
    gender: parseGender(partialStory.gender),
    origin: asString(partialStory.origin) || "Global",
    heritageFocus,
    domains,
    signature: asString(partialStory.signature) || `${domains[0].toLowerCase()} leadership`,
    contribution:
      asString(partialStory.contribution) ||
      `used ${domains[0].toLowerCase()} and ${domains[1].toLowerCase()} practice to create positive change`,
    impact:
      asString(partialStory.impact) ||
      `expanded positive influence in ${domains[0].toLowerCase()} through practical leadership`,
    lesson:
      asString(partialStory.lesson) ||
      "Purpose-driven work creates lasting impact when paired with consistent execution.",
    title: asString(partialStory.title) || `${name}: Positive Change Through ${domains[0]}`,
    shortBlurb:
      asString(partialStory.shortBlurb) ||
      `${name} is featured for positive influence across ${domains[0]} and ${domains[1]}.`,
    imageUrl: asString(partialStory.imageUrl) || undefined,
    imageSourceUrl: asString(partialStory.imageSourceUrl) || undefined,
    imageSourceTitle: asString(partialStory.imageSourceTitle) || undefined,
    storyParagraphs:
      parseParagraphs(partialStory.storyParagraphs).length > 0
        ? parseParagraphs(partialStory.storyParagraphs)
        : [
            `Profile overview: ${name} is highlighted for impactful work across ${domains[0]} and ${domains[1]}.`,
            "Formative context: This profile emphasizes practical leadership under real-world constraints.",
            "Mentorship translation: Learners should study this journey, apply one method, and track progress weekly.",
          ],
    triviaPool: [],
  };

  defaultStory.triviaPool = normalizeTriviaPool(partialStory.triviaPool, defaultStory);
  return defaultStory;
}

function mergeStoryPatch(baseStory: MentorshipStory, patch: Partial<MentorshipStory>) {
  const patchedName = asString(patch.name);
  const patchedOrigin = asString(patch.origin);
  const patchedSignature = asString(patch.signature);
  const patchedContribution = asString(patch.contribution);
  const patchedImpact = asString(patch.impact);
  const patchedLesson = asString(patch.lesson);
  const patchedTitle = asString(patch.title);
  const patchedShortBlurb = asString(patch.shortBlurb);
  const patchedImageUrl = asString(patch.imageUrl);
  const patchedImageSourceUrl = asString(patch.imageSourceUrl);
  const patchedImageSourceTitle = asString(patch.imageSourceTitle);
  const patchedParagraphs = parseParagraphs(patch.storyParagraphs);
  const patchedDomains = parseDomains(patch.domains);

  const mergedStory: MentorshipStory = {
    ...baseStory,
    id: baseStory.id,
    name: patchedName || baseStory.name,
    gender: patch.gender ? parseGender(patch.gender) : baseStory.gender,
    origin: patchedOrigin || baseStory.origin,
    heritageFocus: patch.heritageFocus ? parseHeritageFocus(patch.heritageFocus) : baseStory.heritageFocus,
    domains: patch.domains ? patchedDomains : baseStory.domains,
    signature: patchedSignature || baseStory.signature,
    contribution: patchedContribution || baseStory.contribution,
    impact: patchedImpact || baseStory.impact,
    lesson: patchedLesson || baseStory.lesson,
    title: patchedTitle || baseStory.title,
    shortBlurb: patchedShortBlurb || baseStory.shortBlurb,
    imageUrl: patchedImageUrl || baseStory.imageUrl,
    imageSourceUrl: patchedImageSourceUrl || baseStory.imageSourceUrl,
    imageSourceTitle: patchedImageSourceTitle || baseStory.imageSourceTitle,
    storyParagraphs: patchedParagraphs.length > 0 ? patchedParagraphs : baseStory.storyParagraphs,
    triviaPool:
      Array.isArray(patch.triviaPool) && patch.triviaPool.length > 0
        ? normalizeTriviaPool(patch.triviaPool, baseStory)
        : baseStory.triviaPool,
  };

  return mergedStory;
}

function parseOverrideDoc(
  docId: string,
  value: Record<string, unknown>,
): MentorshipStoryOverrideDoc {
  const hidden = typeof value.hidden === "boolean" ? value.hidden : false;
  const deleted = typeof value.deleted === "boolean" ? value.deleted : false;
  const source =
    value.source === "custom" || value.source === "override"
      ? value.source
      : undefined;
  const story =
    value.story && typeof value.story === "object"
      ? (value.story as Partial<MentorshipStory>)
      : undefined;

  return {
    id: docId,
    hidden,
    deleted,
    source,
    story,
  };
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeStoryInput(storyId: string, input: UpsertMentorshipStoryInput): MentorshipStory {
  const name = asString(input.name);
  const domains = parseDomains(input.domains);
  const base: MentorshipStory = {
    id: storyId,
    name,
    gender: parseGender(input.gender),
    origin: asString(input.origin),
    heritageFocus: parseHeritageFocus(input.heritageFocus),
    domains,
    signature: asString(input.signature),
    contribution: asString(input.contribution),
    impact: asString(input.impact),
    lesson: asString(input.lesson),
    title: asString(input.title),
    shortBlurb: asString(input.shortBlurb),
    imageUrl: asString(input.imageUrl) || undefined,
    imageSourceUrl: asString(input.imageSourceUrl) || undefined,
    imageSourceTitle: asString(input.imageSourceTitle) || undefined,
    storyParagraphs: input.storyParagraphs.map((paragraph) => paragraph.trim()).filter(Boolean),
    triviaPool: [],
  };

  if (base.storyParagraphs.length === 0) {
    base.storyParagraphs = [
      `Profile overview: ${name} is included for positive influence through ${domains[0]} and ${domains[1]}.`,
      "Mentorship translation: Convert this story into weekly goals and measurable action.",
    ];
  }

  base.triviaPool = normalizeTriviaPool(input.triviaPool, base);
  return base;
}

export function mergeMentorshipStoryCatalog(
  baseStories: MentorshipStory[],
  overrides: MentorshipStoryOverrideDoc[],
) {
  const overrideMap = new Map<string, MentorshipStoryOverrideDoc>();
  overrides.forEach((entry) => {
    overrideMap.set(entry.id, entry);
  });

  const mergedStories: MentorshipStoryCatalogItem[] = [];

  baseStories.forEach((baseStory) => {
    const override = overrideMap.get(baseStory.id);
    if (override?.deleted) {
      return;
    }

    const mergedStory =
      override?.story && typeof override.story === "object"
        ? mergeStoryPatch(baseStory, override.story)
        : baseStory;

    mergedStories.push({
      ...mergedStory,
      adminHidden: Boolean(override?.hidden),
      adminSource: "base",
    });
  });

  overrides.forEach((override) => {
    if (BASE_STORY_ID_SET.has(override.id)) {
      return;
    }
    if (override.deleted || !override.story) {
      return;
    }

    const normalized = normalizeStoryFromPartial(override.id, override.story);
    if (!normalized) {
      return;
    }

    mergedStories.push({
      ...normalized,
      adminHidden: Boolean(override.hidden),
      adminSource: "custom",
    });
  });

  return mergedStories;
}

export function subscribeToMentorshipStoryOverrides(
  callback: (entries: MentorshipStoryOverrideDoc[]) => void,
  onError?: (error: FirestoreError) => void,
): Unsubscribe {
  const storiesQuery = query(collection(db, MENTORSHIP_STORIES_COLLECTION));

  return onSnapshot(
    storiesQuery,
    (snapshot) => {
      const entries = snapshot.docs.map((snap) => parseOverrideDoc(snap.id, snap.data()));
      callback(entries);
    },
    (error) => {
      if (error.code === "permission-denied") {
        if (!hasLoggedMentorshipStoryPermissionWarning) {
          hasLoggedMentorshipStoryPermissionWarning = true;
          console.warn(
            "Mentorship story overrides are not readable with the current Firestore permissions. Falling back to built-in story catalog.",
          );
        }
      } else {
        console.error("subscribeToMentorshipStoryOverrides error:", error);
      }
      callback([]);
      onError?.(error);
    },
  );
}

export async function upsertMentorshipStoryAsAdmin(
  adminUid: string,
  input: UpsertMentorshipStoryInput,
) {
  const role = await loadUserRole(adminUid);
  if (role !== "admin") {
    throw new Error("Only admin users can add or edit mentorship stories.");
  }

  const trimmedName = input.name.trim();
  if (trimmedName.length < 2) {
    throw new Error("Story name must be at least 2 characters.");
  }

  const candidateId = input.id?.trim();
  const storyId = candidateId && candidateId.length > 0 ? candidateId : `custom-${slugify(trimmedName) || Date.now().toString()}`;
  const story = normalizeStoryInput(storyId, input);
  const source: "custom" | "override" = BASE_STORY_ID_SET.has(storyId) ? "override" : "custom";

  await setDoc(
    doc(db, MENTORSHIP_STORIES_COLLECTION, storyId),
    {
      id: storyId,
      source,
      hidden: Boolean(input.hidden),
      deleted: false,
      story,
      updatedAt: serverTimestamp(),
      updatedBy: adminUid,
      createdBy: adminUid,
    },
    { merge: true },
  );

  return storyId;
}

export async function setMentorshipStoryHiddenAsAdmin(
  adminUid: string,
  storyId: string,
  hidden: boolean,
) {
  const role = await loadUserRole(adminUid);
  if (role !== "admin") {
    throw new Error("Only admin users can hide or unhide stories.");
  }

  const normalizedStoryId = storyId.trim();
  if (!normalizedStoryId) {
    throw new Error("Invalid story id.");
  }

  const source: "custom" | "override" = BASE_STORY_ID_SET.has(normalizedStoryId) ? "override" : "custom";

  await setDoc(
    doc(db, MENTORSHIP_STORIES_COLLECTION, normalizedStoryId),
    {
      id: normalizedStoryId,
      source,
      hidden,
      deleted: false,
      updatedAt: serverTimestamp(),
      updatedBy: adminUid,
      createdBy: adminUid,
    },
    { merge: true },
  );
}

export async function removeMentorshipStoryAsAdmin(
  adminUid: string,
  storyId: string,
  storySource: "base" | "custom",
) {
  const role = await loadUserRole(adminUid);
  if (role !== "admin") {
    throw new Error("Only admin users can remove stories.");
  }

  const normalizedStoryId = storyId.trim();
  if (!normalizedStoryId) {
    throw new Error("Invalid story id.");
  }

  const storyRef = doc(db, MENTORSHIP_STORIES_COLLECTION, normalizedStoryId);

  if (storySource === "custom") {
    await deleteDoc(storyRef);
    return;
  }

  await setDoc(
    storyRef,
    {
      id: normalizedStoryId,
      source: "override",
      hidden: true,
      deleted: true,
      updatedAt: serverTimestamp(),
      updatedBy: adminUid,
      createdBy: adminUid,
    },
    { merge: true },
  );
}
