import type { StoryNode } from "./cyberquestMission";

type MissionImage = number;

export type CyberQuestSceneVisual = {
  background: MissionImage;
  foreground: MissionImage;
  caption: string;
  overlayTint?: string;
};

/* ================================================================
   New art-style assets (from /UI_Assets/New Assets/)
   ================================================================ */
const ASSETS = {
  /* Backgrounds */
  computerLab: require("../../public/UI_Assets/New Assets/Computer Lab.png") as MissionImage,
  computerLabDark: require("../../public/UI_Assets/New Assets/Computer lab Dark.png") as MissionImage,
  school: require("../../public/UI_Assets/CodeWorldSchool.png") as MissionImage,
  scienceHallway: require("../../public/UI_Assets/Science Hallway.png") as MissionImage,

  /* Dara poses */
  daraFoldingArms: require("../../public/UI_Assets/New Assets/Dara Folding Arms.png") as MissionImage,
  daraOhWell: require("../../public/UI_Assets/New Assets/Dara Oh Well.png") as MissionImage,
  daraSurprised: require("../../public/UI_Assets/New Assets/Dara Surprised.png") as MissionImage,
  daraThinking: require("../../public/UI_Assets/New Assets/Dara Thinking.png") as MissionImage,
  daraThumbsUp: require("../../public/UI_Assets/New Assets/Dara Thumbs Up.png") as MissionImage,
  daraWorried: require("../../public/UI_Assets/New Assets/Dara Worried.png") as MissionImage,

  /* Amina poses */
  aminaFoldingArms: require("../../public/UI_Assets/New Assets/Amina Folding Arms.png") as MissionImage,
  aminaHandsOnWaist: require("../../public/UI_Assets/New Assets/Amina Hands On Waist.png") as MissionImage,
  aminaOhWell: require("../../public/UI_Assets/New Assets/Amina Oh Well.png") as MissionImage,
  aminaSurprised: require("../../public/UI_Assets/New Assets/Amina Surprised.png") as MissionImage,
  aminaThinking: require("../../public/UI_Assets/New Assets/Amina Thinking.png") as MissionImage,
  aminaThumbsUp: require("../../public/UI_Assets/New Assets/Amina Thumbs Up.png") as MissionImage,
  aminaWorried: require("../../public/UI_Assets/New Assets/Amina Worried.png") as MissionImage,

  /* Mr Okafor (teacher) poses */
  okaforHmmm: require("../../public/UI_Assets/New Assets/Mr Okafor Hmmm_You Sure.png") as MissionImage,
  okaforOhWell: require("../../public/UI_Assets/New Assets/Mr Okafor Oh Well.png") as MissionImage,
  okaforOkay: require("../../public/UI_Assets/New Assets/Mr Okafor Okay.png") as MissionImage,
  okaforSurprised: require("../../public/UI_Assets/New Assets/Mr Okafor Surprised_You Seeee.png") as MissionImage,
  okaforThinking: require("../../public/UI_Assets/New Assets/Mr Okafor Thinking.png") as MissionImage,
  okaforWorried: require("../../public/UI_Assets/New Assets/Mr Okafor Worried.png") as MissionImage,
  okaforYouThink: require("../../public/UI_Assets/New Assets/Mr Okafor You Think_.png") as MissionImage,
};

const DEFAULT_VISUAL: CyberQuestSceneVisual = {
  background: ASSETS.computerLab,
  foreground: ASSETS.daraThinking,
  caption: "CodeWorld School Lab",
  overlayTint: "rgba(12, 18, 28, 0.26)",
};

/* ================================================================
   Background picker — scene context determines the background
   ================================================================ */
function pickBackgroundByScene(sceneHint?: string): MissionImage {
  switch (sceneHint) {
    case "alert":
      return ASSETS.computerLabDark;
    case "investigation":
    case "email":
    case "logs":
    case "secure":
      return ASSETS.computerLab;
    case "tension":
      return ASSETS.scienceHallway;
    default:
      return ASSETS.school;
  }
}

/* ================================================================
   Foreground picker — narration scenes (no specific character)
   ================================================================ */
function pickNarrationForeground(sceneHint?: string): MissionImage {
  switch (sceneHint) {
    case "alert":
      return ASSETS.daraWorried;
    case "investigation":
    case "email":
    case "logs":
      return ASSETS.daraThinking;
    case "tension":
      return ASSETS.daraFoldingArms;
    case "secure":
      return ASSETS.daraThumbsUp;
    default:
      return ASSETS.daraThinking;
  }
}

/* ================================================================
   Foreground picker — dialogue scenes (character-aware)
   ================================================================ */
function pickDialogueForeground(node: Extract<StoryNode, { type: "dialogue" }>): MissionImage {
  // Character-specific poses
  if (node.character === "amina") {
    switch (node.mood) {
      case "worried":
      case "scared":
        return ASSETS.aminaWorried;
      case "thinking":
        return ASSETS.aminaThinking;
      case "excited":
      case "confident":
        return ASSETS.aminaThumbsUp;
      default:
        return ASSETS.aminaSurprised;
    }
  }

  if (node.character === "teacher") {
    if (node.id.includes("warning")) return ASSETS.okaforWorried;
    switch (node.mood) {
      case "worried":
      case "scared":
        return ASSETS.okaforWorried;
      case "thinking":
        return ASSETS.okaforThinking;
      case "confident":
        return ASSETS.okaforOkay;
      default:
        return ASSETS.okaforHmmm;
    }
  }

  if (node.character === "student") {
    return ASSETS.aminaFoldingArms;
  }

  // Dara (default protagonist)
  if (node.id.includes("catchphrase")) return ASSETS.daraFoldingArms;
  if (node.id.includes("result")) return ASSETS.daraThumbsUp;

  switch (node.mood) {
    case "worried":
    case "scared":
      return ASSETS.daraWorried;
    case "thinking":
      return ASSETS.daraThinking;
    case "confident":
      return ASSETS.daraFoldingArms;
    case "excited":
      return ASSETS.daraThumbsUp;
    default:
      return node.character === "system" ? ASSETS.daraSurprised : ASSETS.daraThinking;
  }
}

/* ================================================================
   Main export — returns the scene visual for any node
   ================================================================ */
export function getCyberQuestSceneVisual(node: StoryNode): CyberQuestSceneVisual {
  if (node.type === "narration") {
    return {
      background: pickBackgroundByScene(node.sceneHint),
      foreground: pickNarrationForeground(node.sceneHint),
      caption: node.sceneHint ? `Scene: ${node.sceneHint}` : DEFAULT_VISUAL.caption,
      overlayTint:
        node.sceneHint === "alert"
          ? "rgba(68, 20, 20, 0.34)"
          : node.sceneHint === "tension"
            ? "rgba(56, 34, 10, 0.30)"
            : DEFAULT_VISUAL.overlayTint,
    };
  }

  if (node.type === "dialogue") {
    const useHallway =
      node.id.includes("ending") || node.id.includes("cliffhanger") || node.id.includes("message");
    const useDark = node.id.includes("alert") || node.character === "system";
    return {
      background: useHallway ? ASSETS.scienceHallway : useDark ? ASSETS.computerLabDark : ASSETS.computerLab,
      foreground: pickDialogueForeground(node),
      caption: `${node.characterName} speaking`,
      overlayTint: useDark ? "rgba(28, 10, 10, 0.34)" : DEFAULT_VISUAL.overlayTint,
    };
  }

  if (node.type === "choice") {
    return {
      background: ASSETS.computerLab,
      foreground: ASSETS.daraThinking,
      caption: `${node.characterName} — decision point`,
      overlayTint: DEFAULT_VISUAL.overlayTint,
    };
  }

  if (node.type === "feedback") {
    return {
      background: ASSETS.computerLab,
      foreground: node.isCorrect ? ASSETS.daraThumbsUp : ASSETS.daraOhWell,
      caption: node.isCorrect ? "Nice move" : "Learning moment",
      overlayTint: DEFAULT_VISUAL.overlayTint,
    };
  }

  if (node.type === "minigame_sort" || node.type === "minigame_match") {
    return {
      background: ASSETS.computerLabDark,
      foreground: ASSETS.daraThinking,
      caption: "Cyber training challenge",
      overlayTint: "rgba(10, 14, 20, 0.22)",
    };
  }

  if (node.type === "reflection") {
    return {
      background: ASSETS.scienceHallway,
      foreground: ASSETS.daraFoldingArms,
      caption: "Reflect and apply",
      overlayTint: "rgba(14, 14, 30, 0.24)",
    };
  }

  if (node.type === "badge") {
    return {
      background: ASSETS.scienceHallway,
      foreground: ASSETS.daraThumbsUp,
      caption: "Badge unlocked",
      overlayTint: "rgba(4, 22, 26, 0.24)",
    };
  }

  if (node.type === "cliffhanger") {
    return {
      background: ASSETS.computerLabDark,
      foreground: ASSETS.daraWorried,
      caption: "Threat still active",
      overlayTint: "rgba(38, 10, 28, 0.35)",
    };
  }

  return DEFAULT_VISUAL;
}
