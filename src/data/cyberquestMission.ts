/**
 * Dara and the CyberQuest — Episode 1: The Missing Files
 *
 * A comic-style, decision-tree interactive mission.
 * Each node has a type dictating how the UI renders it.
 */

/* ------------------------------------------------------------------
   Types
   ------------------------------------------------------------------ */

export type StoryCharacter = "dara" | "amina" | "teacher" | "system" | "narrator" | "student";

export type StoryNodeType =
    | "dialogue"
    | "narration"
    | "choice"
    | "feedback"
    | "minigame_sort"
    | "minigame_match"
    | "reflection"
    | "badge"
    | "cliffhanger";

export type DialogueNode = {
    type: "dialogue";
    id: string;
    character: StoryCharacter;
    characterName: string;
    text: string;
    mood?: "neutral" | "worried" | "excited" | "thinking" | "confident" | "scared";
    next: string;
};

export type NarrationNode = {
    type: "narration";
    id: string;
    text: string;
    sceneHint?: string; // short label for background tint
    next: string;
};

export type ChoiceOption = {
    id: string;
    text: string;
    points: number;
    next: string; // node id to jump to
};

export type ChoiceNode = {
    type: "choice";
    id: string;
    character: StoryCharacter;
    characterName: string;
    prompt: string;
    options: ChoiceOption[];
};

export type FeedbackNode = {
    type: "feedback";
    id: string;
    isCorrect: boolean;
    title: string;
    text: string;
    learningSummary?: string;
    next: string;
};

export type SortItem = {
    id: string;
    label: string;
    category: "safe" | "risky";
};

export type MinigameSortNode = {
    type: "minigame_sort";
    id: string;
    title: string;
    instruction: string;
    items: SortItem[];
    next: string;
};

export type MatchPair = {
    id: string;
    left: string;
    right: string;
};

export type MinigameMatchNode = {
    type: "minigame_match";
    id: string;
    title: string;
    instruction: string;
    pairs: MatchPair[];
    next: string;
};

export type ReflectionNode = {
    type: "reflection";
    id: string;
    prompt: string;
    next: string;
};

export type BadgeNode = {
    type: "badge";
    id: string;
    badgeId: string;
    badgeName: string;
    message: string;
    xp: number;
    next: string;
};

export type CliffhangerNode = {
    type: "cliffhanger";
    id: string;
    text: string;
    teaserTitle?: string;
};

export type StoryNode =
    | DialogueNode
    | NarrationNode
    | ChoiceNode
    | FeedbackNode
    | MinigameSortNode
    | MinigameMatchNode
    | ReflectionNode
    | BadgeNode
    | CliffhangerNode;

export type MissionScript = {
    missionId: string;
    title: string;
    subtitle: string;
    startNodeId: string;
    nodes: Record<string, StoryNode>;
};

/* ------------------------------------------------------------------
   The Script
   ------------------------------------------------------------------ */

export const cyberquestMission1: MissionScript = {
    missionId: "cyberquest-m1",
    title: "Dara and the CyberQuest",
    subtitle: "The Missing Files",
    startNodeId: "opening-narration",
    nodes: {
        /* ============================================================
           ACT 1 — THE OPENING HOOK
           ============================================================ */
        "opening-narration": {
            type: "narration",
            id: "opening-narration",
            text: "School computer lab. The fluorescent lights hum. Students are settling in — until the screens flash red.",
            sceneHint: "alert",
            next: "amina-panic",
        },
        "amina-panic": {
            type: "dialogue",
            id: "amina-panic",
            character: "amina",
            characterName: "Amina",
            text: "Dara… my science project is gone. All the files just… disappeared!",
            mood: "worried",
            next: "system-alert",
        },
        "system-alert": {
            type: "dialogue",
            id: "system-alert",
            character: "system",
            characterName: "System Alert",
            text: "⚠️ UNAUTHORIZED ACCESS DETECTED.\nFILES COMPROMISED.",
            mood: "neutral",
            next: "dara-thinks-1",
        },
        "dara-thinks-1": {
            type: "dialogue",
            id: "dara-thinks-1",
            character: "dara",
            characterName: "Dara",
            text: "If this is a hack… and we don't act fast, everyone's work could be erased.",
            mood: "thinking",
            next: "teacher-warning",
        },
        "teacher-warning": {
            type: "dialogue",
            id: "teacher-warning",
            character: "teacher",
            characterName: "Mr. Okafor",
            text: "Listen up, everyone. If we can't secure this system, the lab may have to be shut down. The Digital Innovation Showcase is TOMORROW.",
            mood: "worried",
            next: "dara-catchphrase-1",
        },
        "dara-catchphrase-1": {
            type: "dialogue",
            id: "dara-catchphrase-1",
            character: "dara",
            characterName: "Dara",
            text: "Let's slow down. Tech problems need smart thinking — not panic.",
            mood: "confident",
            next: "mystery-narration",
        },

        /* ============================================================
           ACT 2 — INVESTIGATION
           ============================================================ */
        "mystery-narration": {
            type: "narration",
            id: "mystery-narration",
            text: "Dara notices three unusual things on the computer: a strange email notification, an unfamiliar login time logged at 2:47 AM, and a file labeled 'Admin_Access_TEMP'.",
            sceneHint: "investigation",
            next: "shadow-admin-spot",
        },
        "shadow-admin-spot": {
            type: "dialogue",
            id: "shadow-admin-spot",
            character: "dara",
            characterName: "Dara",
            text: "Wait… look at the system logs. There's a username I've never seen before: ShadowAdmin. This person was here last night.",
            mood: "thinking",
            next: "amina-react",
        },
        "amina-react": {
            type: "dialogue",
            id: "amina-react",
            character: "amina",
            characterName: "Amina",
            text: "ShadowAdmin? That sounds super shady. Who is that?",
            mood: "scared",
            next: "dara-phishing-discover",
        },
        "dara-phishing-discover": {
            type: "dialogue",
            id: "dara-phishing-discover",
            character: "dara",
            characterName: "Dara",
            text: "I don't know yet. But check this — there's also an email here that looks suspicious...",
            mood: "thinking",
            next: "phishing-narration",
        },

        /* ============================================================
           CHALLENGE 1 — PHISHING DECISION
           ============================================================ */
        "phishing-narration": {
            type: "narration",
            id: "phishing-narration",
            text: "An email sits in the inbox. The subject reads: 'URGENT: Verify your password to restore missing files.' It has a bright blue button that says 'Click Here Now'.",
            sceneHint: "email",
            next: "phishing-choice",
        },
        "phishing-choice": {
            type: "choice",
            id: "phishing-choice",
            character: "dara",
            characterName: "Dara",
            prompt: "This email says I can restore everything by verifying my password. What should I do?",
            options: [
                {
                    id: "click-link",
                    text: "Click the link right away — we need those files back!",
                    points: 0,
                    next: "phishing-bad",
                },
                {
                    id: "share-teacher",
                    text: "Share the password with Mr. Okafor so he can check.",
                    points: 30,
                    next: "phishing-ok",
                },
                {
                    id: "report-dont-click",
                    text: "Don't click anything. Report it as suspicious.",
                    points: 90,
                    next: "phishing-great",
                },
            ],
        },
        "phishing-bad": {
            type: "feedback",
            id: "phishing-bad",
            isCorrect: false,
            title: "Oops! That was risky.",
            text: "Clicking unknown links can give hackers access to your account. Phishing emails are designed to look urgent — but the urgency is fake.",
            learningSummary: "Never click links in unexpected emails. Always verify first.",
            next: "minigame-intro",
        },
        "phishing-ok": {
            type: "feedback",
            id: "phishing-ok",
            isCorrect: false,
            title: "Good instinct, but not quite safe.",
            text: "Asking a teacher is smart! But sharing passwords — even with trusted adults — isn't the safest approach. Instead, report the suspicious email directly.",
            learningSummary: "Report suspicious emails instead of sharing passwords.",
            next: "minigame-intro",
        },
        "phishing-great": {
            type: "feedback",
            id: "phishing-great",
            isCorrect: true,
            title: "Excellent call! 🎯",
            text: "Phishing emails try to rush you into clicking. By slowing down and reporting it, you stopped the attack from spreading.",
            learningSummary: "Phishing red flags: urgency, unknown sender, suspicious links.",
            next: "minigame-intro",
        },

        /* ============================================================
           MINI-GAME 1 — SAFE vs RISKY SORT
           ============================================================ */
        "minigame-intro": {
            type: "dialogue",
            id: "minigame-intro",
            character: "dara",
            characterName: "Dara",
            text: "Let's check how good our cyber-safety instincts are. Sort these actions into SAFE or RISKY!",
            mood: "excited",
            next: "minigame-sort-1",
        },
        "minigame-sort-1": {
            type: "minigame_sort",
            id: "minigame-sort-1",
            title: "Safe or Risky?",
            instruction: "Tap each action and sort it into the correct category.",
            items: [
                { id: "s1", label: "Reusing the same password everywhere", category: "risky" },
                { id: "s2", label: "Turning on two-factor authentication", category: "safe" },
                { id: "s3", label: "Clicking a link from an unknown sender", category: "risky" },
                { id: "s4", label: "Updating your apps when new updates appear", category: "safe" },
                { id: "s5", label: "Using a strong, unique password for each account", category: "safe" },
                { id: "s6", label: "Sharing your password with a friend", category: "risky" },
            ],
            next: "minigame-result",
        },
        "minigame-result": {
            type: "dialogue",
            id: "minigame-result",
            character: "dara",
            characterName: "Dara",
            text: "Great work! The system is stabilizing. Now let's dig deeper into those login logs…",
            mood: "confident",
            next: "log-investigation",
        },

        /* ============================================================
           CHALLENGE 2 — LOG FILE PUZZLE
           ============================================================ */
        "log-investigation": {
            type: "narration",
            id: "log-investigation",
            text: "Dara pulls up the login logs and spots three suspicious entries among dozens of normal ones.",
            sceneHint: "logs",
            next: "log-match-game",
        },
        "log-match-game": {
            type: "minigame_match",
            id: "log-match-game",
            title: "Match the Clues",
            instruction: "Match each log entry to why it's suspicious.",
            pairs: [
                { id: "p1", left: "Login at 2:47 AM", right: "School is closed at night" },
                { id: "p2", left: "New device: unknown laptop", right: "Not a school-registered device" },
                { id: "p3", left: "5 failed login attempts", right: "Someone guessing passwords" },
            ],
            next: "log-discovery",
        },
        "log-discovery": {
            type: "dialogue",
            id: "log-discovery",
            character: "dara",
            characterName: "Dara",
            text: "This wasn't some super-hacker. It was a compromised account — someone's password got stolen, and ShadowAdmin used it to get in.",
            mood: "thinking",
            next: "dara-realization",
        },
        "dara-realization": {
            type: "dialogue",
            id: "dara-realization",
            character: "dara",
            characterName: "Dara",
            text: "This wasn't magic. It was a mistake someone didn't know they made. And that means we can fix it.",
            mood: "confident",
            next: "leadership-narration",
        },

        /* ============================================================
           ACT 3 — LEADERSHIP MOMENT
           ============================================================ */
        "leadership-narration": {
            type: "narration",
            id: "leadership-narration",
            text: "Some students start arguing about whose fault it is. Others look scared. The room feels tense.",
            sceneHint: "tension",
            next: "student-argument",
        },
        "student-argument": {
            type: "dialogue",
            id: "student-argument",
            character: "student",
            characterName: "Chidi",
            text: "It's obviously someone in this room! We need to find out who messed up!",
            mood: "worried",
            next: "leadership-choice",
        },
        "leadership-choice": {
            type: "choice",
            id: "leadership-choice",
            character: "dara",
            characterName: "Dara",
            prompt: "The class is getting upset. How should I handle this?",
            options: [
                {
                    id: "take-control",
                    text: "I'll fix everything myself. Everyone else, stay out of my way.",
                    points: 20,
                    next: "leadership-feedback-solo",
                },
                {
                    id: "blame-users",
                    text: "Whoever used a weak password caused this. They should admit it.",
                    points: 10,
                    next: "leadership-feedback-blame",
                },
                {
                    id: "organize-team",
                    text: "Let's work together. I'll organize a small team and give everyone a role.",
                    points: 90,
                    next: "leadership-feedback-team",
                },
            ],
        },
        "leadership-feedback-solo": {
            type: "feedback",
            id: "leadership-feedback-solo",
            isCorrect: false,
            title: "Brave, but risky.",
            text: "Taking charge is admirable, but one person can't catch everything. Real leaders empower their team.",
            learningSummary: "Leadership means lifting others up, not doing it all alone.",
            next: "account-protection-narration",
        },
        "leadership-feedback-blame": {
            type: "feedback",
            id: "leadership-feedback-blame",
            isCorrect: false,
            title: "That won't help right now.",
            text: "Blaming people makes them defensive and scared to speak up. Focus on solutions first, lessons after.",
            learningSummary: "Accountability without blame creates trust.",
            next: "account-protection-narration",
        },
        "leadership-feedback-team": {
            type: "feedback",
            id: "leadership-feedback-team",
            isCorrect: true,
            title: "Perfect leadership! 🌟",
            text: "\"We fix this together. Everyone matters.\" Organizing roles keeps people calm and productive in a crisis.",
            learningSummary: "Calm communication + teamwork = stronger crisis response.",
            next: "account-protection-narration",
        },

        /* ============================================================
           CHALLENGE 3 — ACCOUNT PROTECTION
           ============================================================ */
        "account-protection-narration": {
            type: "narration",
            id: "account-protection-narration",
            text: "The team is back on track. Now they need to lock down the accounts before any more damage happens.",
            sceneHint: "secure",
            next: "account-choice",
        },
        "account-choice": {
            type: "choice",
            id: "account-choice",
            character: "dara",
            characterName: "Dara",
            prompt: "We need to secure everyone's accounts right now. What's the best move?",
            options: [
                {
                    id: "strong-reset",
                    text: "Reset all passwords and turn on two-step verification.",
                    points: 80,
                    next: "account-feedback-great",
                },
                {
                    id: "shared-pass",
                    text: "Create one shared password for the whole team — it's easier.",
                    points: 0,
                    next: "account-feedback-bad",
                },
                {
                    id: "wait-tomorrow",
                    text: "Wait until tomorrow. We're all too stressed right now.",
                    points: 10,
                    next: "account-feedback-wait",
                },
            ],
        },
        "account-feedback-great": {
            type: "feedback",
            id: "account-feedback-great",
            isCorrect: true,
            title: "Strong defense! 🔒",
            text: "Unique passwords + two-step verification makes it much harder for anyone to break in again.",
            learningSummary: "Always use strong, unique passwords and enable 2FA.",
            next: "reflection-intro",
        },
        "account-feedback-bad": {
            type: "feedback",
            id: "account-feedback-bad",
            isCorrect: false,
            title: "Danger! Shared passwords are risky.",
            text: "If one person's account gets hacked, ALL accounts with the same password are compromised. Every person needs their own strong password.",
            learningSummary: "Never share passwords — each account needs its own.",
            next: "reflection-intro",
        },
        "account-feedback-wait": {
            type: "feedback",
            id: "account-feedback-wait",
            isCorrect: false,
            title: "Waiting increases the danger.",
            text: "Every minute the accounts stay unprotected, the attacker could do more damage. Act quickly but calmly.",
            learningSummary: "In a cyber incident, speed matters. Secure accounts ASAP.",
            next: "reflection-intro",
        },

        /* ============================================================
           REFLECTION
           ============================================================ */
        "reflection-intro": {
            type: "dialogue",
            id: "reflection-intro",
            character: "dara",
            characterName: "Dara",
            text: "We did it. The system is secure, Amina's project is recoverable, and the Showcase can go ahead. But before we celebrate — let's think about what we learned.",
            mood: "confident",
            next: "reflection-prompt",
        },
        "reflection-prompt": {
            type: "reflection",
            id: "reflection-prompt",
            prompt: "If your friend made a tech mistake that put their data at risk, how would you help them stay safe next time?",
            next: "badge-unlock",
        },

        /* ============================================================
           BADGE & REWARD
           ============================================================ */
        "badge-unlock": {
            type: "badge",
            id: "badge-unlock",
            badgeId: "cyber-defender",
            badgeName: "Cyber Defender",
            message: "You identified phishing, protected accounts, led a team through crisis, and reflected on helping others. You earned it!",
            xp: 100,
            next: "ending-1",
        },

        /* ============================================================
           ENDING & CLIFFHANGER
           ============================================================ */
        "ending-1": {
            type: "dialogue",
            id: "ending-1",
            character: "amina",
            characterName: "Amina",
            text: "Dara! Look — you have a new notification!",
            mood: "excited",
            next: "ending-message",
        },
        "ending-message": {
            type: "dialogue",
            id: "ending-message",
            character: "system",
            characterName: "Mentor Network",
            text: "Dara, your response today stood out.\nAre you ready to go deeper?",
            mood: "neutral",
            next: "shadow-tease",
        },
        "shadow-tease": {
            type: "dialogue",
            id: "shadow-tease",
            character: "system",
            characterName: "System Log",
            text: "ShadowAdmin status: ACTIVE 👁️",
            mood: "neutral",
            next: "cliffhanger-end",
        },
        "cliffhanger-end": {
            type: "cliffhanger",
            id: "cliffhanger-end",
            text: "To be continued…",
            teaserTitle: "Mission 2: The Network Test",
        },
    },
};

export const cyberquestMission2: MissionScript = {
    missionId: "cyberquest-m2",
    title: "Dara and the CyberQuest",
    subtitle: "The Network Test",
    startNodeId: "m2-opening-narration",
    nodes: {
        /* ============================================================
           ACT 1 - NEW THREAT
           ============================================================ */
        "m2-opening-narration": {
            type: "narration",
            id: "m2-opening-narration",
            text: "The morning after the showcase rescue, the lab seems calm. Then every connection drops for two seconds and returns with strange lag spikes.",
            sceneHint: "alert",
            next: "m2-mentor-brief",
        },
        "m2-mentor-brief": {
            type: "dialogue",
            id: "m2-mentor-brief",
            character: "system",
            characterName: "Mentor Network",
            text: "Mission 2 unlocked: Network Test. Detect and contain suspicious traffic before the school demo starts.",
            mood: "neutral",
            next: "m2-dara-focus",
        },
        "m2-dara-focus": {
            type: "dialogue",
            id: "m2-dara-focus",
            character: "dara",
            characterName: "Dara",
            text: "No panic. We map the problem, isolate risk, and protect everyone first.",
            mood: "confident",
            next: "m2-amina-report",
        },
        "m2-amina-report": {
            type: "dialogue",
            id: "m2-amina-report",
            character: "amina",
            characterName: "Amina",
            text: "The 3D printers are offline, and someone created a new Wi-Fi name called CodeWorld_FreeFast.",
            mood: "worried",
            next: "m2-network-map",
        },
        "m2-network-map": {
            type: "narration",
            id: "m2-network-map",
            text: "Dara sketches a quick network map: student devices, teacher consoles, printers, and one unknown hotspot source.",
            sceneHint: "investigation",
            next: "m2-triage-choice",
        },

        /* ============================================================
           CHALLENGE 1 - TRIAGE DECISION
           ============================================================ */
        "m2-triage-choice": {
            type: "choice",
            id: "m2-triage-choice",
            character: "dara",
            characterName: "Dara",
            prompt: "What should the team do first?",
            options: [
                {
                    id: "m2-unplug-all",
                    text: "Unplug every device immediately so nothing can spread.",
                    points: 20,
                    next: "m2-triage-feedback-rush",
                },
                {
                    id: "m2-isolate-and-log",
                    text: "Isolate affected devices, capture logs, and keep clean systems running.",
                    points: 90,
                    next: "m2-triage-feedback-best",
                },
                {
                    id: "m2-ignore-lag",
                    text: "Ignore the lag and continue work until it gets worse.",
                    points: 0,
                    next: "m2-triage-feedback-risky",
                },
            ],
        },
        "m2-triage-feedback-rush": {
            type: "feedback",
            id: "m2-triage-feedback-rush",
            isCorrect: false,
            title: "Fast action, but too disruptive.",
            text: "Shutting everything down can remove useful evidence and stop important activity. Isolation is better than total blackout.",
            learningSummary: "Contain targeted risk first, then expand response if needed.",
            next: "m2-hotspot-narration",
        },
        "m2-triage-feedback-best": {
            type: "feedback",
            id: "m2-triage-feedback-best",
            isCorrect: true,
            title: "Strong incident triage.",
            text: "You kept the team productive while preserving evidence and reducing exposure.",
            learningSummary: "Smart incident response balances speed, safety, and evidence.",
            next: "m2-hotspot-narration",
        },
        "m2-triage-feedback-risky": {
            type: "feedback",
            id: "m2-triage-feedback-risky",
            isCorrect: false,
            title: "Waiting increases risk.",
            text: "A live network issue can spread quickly. Delay gives attackers more time.",
            learningSummary: "Act early with a clear containment plan.",
            next: "m2-hotspot-narration",
        },

        /* ============================================================
           CHALLENGE 2 - ROGUE HOTSPOT
           ============================================================ */
        "m2-hotspot-narration": {
            type: "narration",
            id: "m2-hotspot-narration",
            text: "A new hotspot called CodeWorld_FreeFast is strongest near the hallway. Several students almost auto-joined it.",
            sceneHint: "email",
            next: "m2-hotspot-choice",
        },
        "m2-hotspot-choice": {
            type: "choice",
            id: "m2-hotspot-choice",
            character: "dara",
            characterName: "Dara",
            prompt: "How should we handle the suspicious network?",
            options: [
                {
                    id: "m2-connect-test",
                    text: "Connect quickly to test whether it looks normal.",
                    points: 0,
                    next: "m2-hotspot-feedback-bad",
                },
                {
                    id: "m2-verify-ssid",
                    text: "Compare SSID details with the approved IT network list and block unknown ones.",
                    points: 90,
                    next: "m2-hotspot-feedback-good",
                },
                {
                    id: "m2-share-password",
                    text: "Ask classmates for passwords so we can check who connected.",
                    points: 20,
                    next: "m2-hotspot-feedback-mid",
                },
            ],
        },
        "m2-hotspot-feedback-bad": {
            type: "feedback",
            id: "m2-hotspot-feedback-bad",
            isCorrect: false,
            title: "Do not connect first.",
            text: "Rogue access points are built to collect data. Connecting can expose credentials and traffic.",
            learningSummary: "Verify network identity before joining any Wi-Fi.",
            next: "m2-sort-intro",
        },
        "m2-hotspot-feedback-good": {
            type: "feedback",
            id: "m2-hotspot-feedback-good",
            isCorrect: true,
            title: "Excellent network hygiene.",
            text: "Verification and blocking unknown networks prevents accidental compromise.",
            learningSummary: "Trusted network lists reduce rogue hotspot attacks.",
            next: "m2-sort-intro",
        },
        "m2-hotspot-feedback-mid": {
            type: "feedback",
            id: "m2-hotspot-feedback-mid",
            isCorrect: false,
            title: "Good intent, wrong method.",
            text: "Collecting passwords creates a second security problem. Use logs and device policy checks instead.",
            learningSummary: "Never ask others to share passwords in incident response.",
            next: "m2-sort-intro",
        },

        /* ============================================================
           MINI-GAME 1 - SAFE VS RISKY (NETWORK EDITION)
           ============================================================ */
        "m2-sort-intro": {
            type: "dialogue",
            id: "m2-sort-intro",
            character: "dara",
            characterName: "Dara",
            text: "Quick drill. Sort these network actions before we move to containment.",
            mood: "excited",
            next: "m2-sort-game",
        },
        "m2-sort-game": {
            type: "minigame_sort",
            id: "m2-sort-game",
            title: "Network Moves: Safe or Risky?",
            instruction: "Sort each action correctly.",
            items: [
                { id: "m2-s1", label: "Disable auto-join for unknown Wi-Fi", category: "safe" },
                { id: "m2-s2", label: "Install updates from trusted admin channels", category: "safe" },
                { id: "m2-s3", label: "Use open Wi-Fi for account login", category: "risky" },
                { id: "m2-s4", label: "Share admin password in group chat", category: "risky" },
                { id: "m2-s5", label: "Segment guest devices from school systems", category: "safe" },
                { id: "m2-s6", label: "Ignore repeated login failures", category: "risky" },
            ],
            next: "m2-sort-result",
        },
        "m2-sort-result": {
            type: "dialogue",
            id: "m2-sort-result",
            character: "teacher",
            characterName: "Mr. Okafor",
            text: "Great. The team now speaks the same safety language.",
            mood: "confident",
            next: "m2-match-intro",
        },

        /* ============================================================
           MINI-GAME 2 - MATCH CLUES
           ============================================================ */
        "m2-match-intro": {
            type: "narration",
            id: "m2-match-intro",
            text: "Traffic logs reveal three anomalies that point to the attack path.",
            sceneHint: "logs",
            next: "m2-match-game",
        },
        "m2-match-game": {
            type: "minigame_match",
            id: "m2-match-game",
            title: "Trace the Clues",
            instruction: "Match each clue with the likely meaning.",
            pairs: [
                { id: "m2-p1", left: "Many DNS requests to random domains", right: "Possible command-and-control beaconing" },
                { id: "m2-p2", left: "Unknown MAC address on admin VLAN", right: "Unauthorized device on restricted segment" },
                { id: "m2-p3", left: "Repeated failed login bursts", right: "Credential guessing attempt" },
            ],
            next: "m2-leadership-setup",
        },

        /* ============================================================
           CHALLENGE 3 - COMMUNICATION LEADERSHIP
           ============================================================ */
        "m2-leadership-setup": {
            type: "dialogue",
            id: "m2-leadership-setup",
            character: "student",
            characterName: "Chidi",
            text: "Everyone is asking what happened. Should we post screenshots of the logs in the class group?",
            mood: "worried",
            next: "m2-leadership-choice",
        },
        "m2-leadership-choice": {
            type: "choice",
            id: "m2-leadership-choice",
            character: "dara",
            characterName: "Dara",
            prompt: "How do we communicate during the incident?",
            options: [
                {
                    id: "m2-hide-everything",
                    text: "Say nothing until everything is fixed.",
                    points: 20,
                    next: "m2-leadership-feedback-silent",
                },
                {
                    id: "m2-share-verified",
                    text: "Share verified updates, clear safety steps, and assigned roles.",
                    points: 90,
                    next: "m2-leadership-feedback-best",
                },
                {
                    id: "m2-post-logs",
                    text: "Post raw logs publicly so everyone can inspect them.",
                    points: 0,
                    next: "m2-leadership-feedback-overshare",
                },
            ],
        },
        "m2-leadership-feedback-silent": {
            type: "feedback",
            id: "m2-leadership-feedback-silent",
            isCorrect: false,
            title: "Silence creates confusion.",
            text: "People need trusted instructions during incidents. No communication can increase mistakes.",
            learningSummary: "Share timely, verified guidance without exposing sensitive details.",
            next: "m2-containment-narration",
        },
        "m2-leadership-feedback-best": {
            type: "feedback",
            id: "m2-leadership-feedback-best",
            isCorrect: true,
            title: "Excellent crisis communication.",
            text: "You kept everyone informed, calm, and focused on useful actions.",
            learningSummary: "Clear communication is a core security control.",
            next: "m2-containment-narration",
        },
        "m2-leadership-feedback-overshare": {
            type: "feedback",
            id: "m2-leadership-feedback-overshare",
            isCorrect: false,
            title: "Too much detail can cause harm.",
            text: "Raw logs may expose private data and can spread panic when misread.",
            learningSummary: "Communicate safely: enough to guide, not enough to leak.",
            next: "m2-containment-narration",
        },

        /* ============================================================
           FINAL DECISION - CONTAINMENT PLAN
           ============================================================ */
        "m2-containment-narration": {
            type: "narration",
            id: "m2-containment-narration",
            text: "The team confirms ShadowAdmin attempted lateral movement. Final containment must happen now.",
            sceneHint: "secure",
            next: "m2-containment-choice",
        },
        "m2-containment-choice": {
            type: "choice",
            id: "m2-containment-choice",
            character: "dara",
            characterName: "Dara",
            prompt: "Choose the best containment plan.",
            options: [
                {
                    id: "m2-segment-rotate-mfa",
                    text: "Segment affected devices, rotate credentials, and enforce MFA on admin accounts.",
                    points: 100,
                    next: "m2-containment-feedback-best",
                },
                {
                    id: "m2-reset-all-no-backup",
                    text: "Factory reset every machine immediately without preserving data.",
                    points: 20,
                    next: "m2-containment-feedback-disruptive",
                },
                {
                    id: "m2-monitor-only",
                    text: "Keep all systems online and only monitor traffic for now.",
                    points: 10,
                    next: "m2-containment-feedback-weak",
                },
            ],
        },
        "m2-containment-feedback-best": {
            type: "feedback",
            id: "m2-containment-feedback-best",
            isCorrect: true,
            title: "Network secured.",
            text: "You reduced attacker movement, protected privileged access, and kept recovery manageable.",
            learningSummary: "Containment works best with segmentation, credential hygiene, and MFA.",
            next: "m2-reflection-intro",
        },
        "m2-containment-feedback-disruptive": {
            type: "feedback",
            id: "m2-containment-feedback-disruptive",
            isCorrect: false,
            title: "Too destructive for first response.",
            text: "Large resets without backups can cause major data loss and operational downtime.",
            learningSummary: "Protect data and evidence while containing threats.",
            next: "m2-reflection-intro",
        },
        "m2-containment-feedback-weak": {
            type: "feedback",
            id: "m2-containment-feedback-weak",
            isCorrect: false,
            title: "Monitoring alone is not enough.",
            text: "Active threats need active containment, not passive observation.",
            learningSummary: "Monitor plus immediate controls is the safer response.",
            next: "m2-reflection-intro",
        },

        /* ============================================================
           REFLECTION, BADGE, ENDING
           ============================================================ */
        "m2-reflection-intro": {
            type: "dialogue",
            id: "m2-reflection-intro",
            character: "dara",
            characterName: "Dara",
            text: "We kept the network online and safer than before. Time to lock in the lesson.",
            mood: "confident",
            next: "m2-reflection-prompt",
        },
        "m2-reflection-prompt": {
            type: "reflection",
            id: "m2-reflection-prompt",
            prompt: "If your school had a suspicious Wi-Fi hotspot, what 3-step response would you lead first?",
            next: "m2-badge-unlock",
        },
        "m2-badge-unlock": {
            type: "badge",
            id: "m2-badge-unlock",
            badgeId: "network-guardian",
            badgeName: "Network Guardian",
            message: "You identified rogue access risk, led secure communication, and executed strong containment.",
            xp: 120,
            next: "m2-ending-1",
        },
        "m2-ending-1": {
            type: "dialogue",
            id: "m2-ending-1",
            character: "teacher",
            characterName: "Mr. Okafor",
            text: "The demo can proceed. You did not just fix a problem, you built a safer system.",
            mood: "confident",
            next: "m2-ending-message",
        },
        "m2-ending-message": {
            type: "dialogue",
            id: "m2-ending-message",
            character: "system",
            characterName: "Mentor Network",
            text: "Mission 2 complete. Next challenge queued: deeper defense strategy.",
            mood: "neutral",
            next: "m2-cliffhanger-end",
        },
        "m2-cliffhanger-end": {
            type: "cliffhanger",
            id: "m2-cliffhanger-end",
            text: "To be continued...",
            teaserTitle: "Mission 3: Firewall Face-Off",
        },
    },
};

export const cyberquestMissionScripts: Record<string, MissionScript> = {
    [cyberquestMission1.missionId]: cyberquestMission1,
    [cyberquestMission2.missionId]: cyberquestMission2,
};

const DEFAULT_CYBERQUEST_MISSION_ID = cyberquestMission1.missionId;
const CYBERQUEST_MISSION_ID_SET = new Set(Object.keys(cyberquestMissionScripts));

export function isCyberQuestMissionId(missionId: string): boolean {
    return CYBERQUEST_MISSION_ID_SET.has(missionId);
}

function getCyberQuestEpisodeNumber(missionId: string): number {
    const match = missionId.match(/^cyberquest-m(\d+)$/);
    return match ? Number(match[1]) : Number.POSITIVE_INFINITY;
}

export function getNextCyberQuestMissionId(missionId: string): string | null {
    const orderedMissionIds = Object.keys(cyberquestMissionScripts).sort(
        (a, b) => getCyberQuestEpisodeNumber(a) - getCyberQuestEpisodeNumber(b),
    );
    const currentIndex = orderedMissionIds.indexOf(missionId);
    if (currentIndex < 0 || currentIndex >= orderedMissionIds.length - 1) {
        return null;
    }
    return orderedMissionIds[currentIndex + 1];
}

export function getCyberQuestMissionScript(missionId: string): MissionScript {
    return cyberquestMissionScripts[missionId] ?? cyberquestMission1;
}

/** Helper: get a node by id */
export function getNode(
    nodeId: string,
    missionId: string = DEFAULT_CYBERQUEST_MISSION_ID,
): StoryNode | undefined {
    return getCyberQuestMissionScript(missionId).nodes[nodeId];
}

/** Count total nodes for progress tracking */
export function getTotalNodeCount(
    missionId: string = DEFAULT_CYBERQUEST_MISSION_ID,
): number {
    return Object.keys(getCyberQuestMissionScript(missionId).nodes).length;
}
