import type {
    Badge,
    Certificate,
    Mentor,
    Mission,
    ProjectTemplate,
    STEMTrack,
} from "../types/models";

export const missionCatalog: Mission[] = [
    {
        id: "cyberquest-m1",
        title: "Dara and the CyberQuest",
        subtitle: "The Missing Files",
        theme: "Cybersecurity and Leadership",
        durationMinutes: 20,
        objective:
            "Investigate a school cyber incident, protect data, and lead calm response decisions.",
        reflectionPrompt:
            "What is one leadership decision you made that helped reduce panic in the story?",
        badgeRewardId: "cyber-defender",
        steps: [
            {
                id: "alert-scene",
                prompt:
                    "The lab flashes red warnings. What should Dara do first before touching any system?",
                choices: [
                    {
                        id: "ask-for-calm",
                        text: "Calm classmates and isolate affected computers.",
                        scoreDelta: 80,
                        consequence: "Great leadership. Panic drops and response becomes organized.",
                    },
                    {
                        id: "restart-all",
                        text: "Restart every computer immediately.",
                        scoreDelta: 20,
                        consequence: "Some evidence may be lost. The team can still recover with caution.",
                    },
                    {
                        id: "ignore-alert",
                        text: "Ignore the warning and continue normal work.",
                        scoreDelta: 0,
                        consequence: "Risk increases because the incident continues unchecked.",
                    },
                ],
            },
            {
                id: "phishing-check",
                prompt: "Dara finds a suspicious email. What is the safest next action?",
                choices: [
                    {
                        id: "report-email",
                        text: "Report and verify sender with IT before clicking.",
                        scoreDelta: 90,
                        consequence: "Correct. You prevented a phishing escalation.",
                    },
                    {
                        id: "forward-friend",
                        text: "Forward it to a friend to ask if it looks real.",
                        scoreDelta: 30,
                        consequence: "Helpful intent, but still spreads a potential threat.",
                    },
                    {
                        id: "open-link",
                        text: "Open the link quickly to check the account.",
                        scoreDelta: 0,
                        consequence: "Unsafe action. Threat exposure increases.",
                    },
                ],
            },
            {
                id: "account-protection",
                prompt: "The team needs to secure accounts now. Which action should happen next?",
                choices: [
                    {
                        id: "change-passwords",
                        text: "Enable strong resets and 2-step verification.",
                        scoreDelta: 80,
                        consequence: "Strong defense. Account risk drops significantly.",
                    },
                    {
                        id: "share-password",
                        text: "Share one password for all team members.",
                        scoreDelta: 0,
                        consequence: "Unsafe. Shared credentials create bigger risk.",
                    },
                    {
                        id: "wait-for-tomorrow",
                        text: "Wait until tomorrow to avoid stress now.",
                        scoreDelta: 10,
                        consequence: "Delay creates unnecessary exposure.",
                    },
                ],
            },
        ],
    },
    {
        id: "cyberquest-m2",
        title: "Dara and the CyberQuest",
        subtitle: "The Network Test",
        theme: "Network Security and Incident Response",
        durationMinutes: 22,
        objective:
            "Detect a rogue hotspot, contain suspicious network traffic, and lead secure team communication.",
        reflectionPrompt:
            "What sequence of actions would you use to contain a suspicious school network issue quickly and safely?",
        badgeRewardId: "network-guardian",
        steps: [
            {
                id: "network-triage",
                prompt:
                    "The school network becomes unstable. What should Dara do first?",
                choices: [
                    {
                        id: "targeted-isolation",
                        text: "Isolate affected devices, preserve logs, and keep clean systems online.",
                        scoreDelta: 90,
                        consequence: "Excellent triage. Risk is reduced while evidence is preserved.",
                    },
                    {
                        id: "shutdown-everything",
                        text: "Power down all devices immediately with no logging.",
                        scoreDelta: 20,
                        consequence: "Disruptive and may erase useful evidence.",
                    },
                    {
                        id: "wait-and-watch",
                        text: "Wait to see whether the issue disappears on its own.",
                        scoreDelta: 0,
                        consequence: "Unsafe delay while attackers can keep moving.",
                    },
                ],
            },
            {
                id: "rogue-hotspot",
                prompt:
                    "A new Wi-Fi network appears: CodeWorld_FreeFast. What is safest?",
                choices: [
                    {
                        id: "verify-and-block",
                        text: "Verify SSID against approved IT list and block unknown networks.",
                        scoreDelta: 90,
                        consequence: "Correct. You prevent accidental rogue connections.",
                    },
                    {
                        id: "connect-to-test",
                        text: "Connect quickly to test whether it is harmless.",
                        scoreDelta: 0,
                        consequence: "Risky action that can expose credentials.",
                    },
                    {
                        id: "ask-passwords",
                        text: "Ask classmates to share passwords so you can investigate.",
                        scoreDelta: 20,
                        consequence: "Creates a second security risk by collecting passwords.",
                    },
                ],
            },
            {
                id: "containment-plan",
                prompt:
                    "Logs show ongoing suspicious movement. Which containment plan is strongest?",
                choices: [
                    {
                        id: "segment-rotate-mfa",
                        text: "Segment affected devices, rotate credentials, and enforce MFA on admin accounts.",
                        scoreDelta: 100,
                        consequence: "Strong containment with durable account protection.",
                    },
                    {
                        id: "factory-reset-all",
                        text: "Factory reset every machine without backup or evidence capture.",
                        scoreDelta: 20,
                        consequence: "Too destructive and can cause avoidable data loss.",
                    },
                    {
                        id: "monitor-only",
                        text: "Only monitor traffic and postpone any direct action.",
                        scoreDelta: 10,
                        consequence: "Passive response leaves live risk in place.",
                    },
                ],
            },
        ],
    },
    {
        id: "robot-relay-m1",
        title: "Amina and the Robot Relay",
        subtitle: "Circuit Sprint Challenge",
        theme: "Engineering and Teamwork",
        durationMinutes: 12,
        objective: "Diagnose a relay failure and coordinate a fast team recovery plan.",
        reflectionPrompt:
            "How did your troubleshooting approach help your team move from confusion to action?",
        badgeRewardId: "relay-strategist",
        steps: [
            {
                id: "failure-detect",
                prompt: "The robot stops during practice. What is the best first move?",
                choices: [
                    {
                        id: "check-power",
                        text: "Check power and connection points before rewriting code.",
                        scoreDelta: 80,
                        consequence: "Strong troubleshooting order. Root cause appears faster.",
                    },
                    {
                        id: "rewrite-now",
                        text: "Rewrite all code before checking hardware.",
                        scoreDelta: 25,
                        consequence: "Possible, but inefficient and time-costly.",
                    },
                    {
                        id: "switch-robot",
                        text: "Swap to a different robot and ignore diagnostics.",
                        scoreDelta: 10,
                        consequence: "Temporary workaround without learning the real fault.",
                    },
                ],
            },
            {
                id: "team-plan",
                prompt: "The team is split on next steps. How should Amina lead?",
                choices: [
                    {
                        id: "assign-roles",
                        text: "Assign focused roles and a 5-minute check-in timeline.",
                        scoreDelta: 90,
                        consequence: "Excellent coordination. Team efficiency improves quickly.",
                    },
                    {
                        id: "everyone-everything",
                        text: "Ask everyone to test everything at once.",
                        scoreDelta: 20,
                        consequence: "Effort increases but duplication causes confusion.",
                    },
                    {
                        id: "one-person-fix",
                        text: "Do all tasks alone to save time.",
                        scoreDelta: 10,
                        consequence: "Bottleneck risk rises and team learning drops.",
                    },
                ],
            },
        ],
    },
    {
        id: "chess-tactics-m1",
        title: "Chess Tactics Arena",
        subtitle: "Opening Shield Challenge",
        theme: "Strategy and Critical Thinking",
        durationMinutes: 10,
        objective: "Strengthen tactical thinking and decision-making through chess scenarios.",
        reflectionPrompt:
            "Which chess tactic helped you think ahead most effectively, and why?",
        badgeRewardId: "chess-strategist",
        steps: [
            {
                id: "center-control",
                prompt: "In the opening, what usually gives you the strongest board position?",
                choices: [
                    {
                        id: "control-center",
                        text: "Develop pieces and control the center squares.",
                        scoreDelta: 80,
                        consequence: "Strong choice. Your pieces gain flexibility and pressure.",
                    },
                    {
                        id: "edge-pawns",
                        text: "Push only edge pawns quickly.",
                        scoreDelta: 20,
                        consequence: "Limited impact. You lose central influence.",
                    },
                    {
                        id: "queen-rush",
                        text: "Bring queen out too early.",
                        scoreDelta: 10,
                        consequence: "Risky. The queen can be chased repeatedly.",
                    },
                ],
            },
            {
                id: "defensive-priority",
                prompt: "Your king is in check. What should happen first?",
                choices: [
                    {
                        id: "solve-check",
                        text: "Respond to check immediately with a legal defense.",
                        scoreDelta: 90,
                        consequence: "Correct. King safety always comes first.",
                    },
                    {
                        id: "attack-anyway",
                        text: "Ignore the check and continue your attack.",
                        scoreDelta: 0,
                        consequence: "Illegal move. Check must be addressed immediately.",
                    },
                    {
                        id: "trade-pawn",
                        text: "Capture a side pawn first.",
                        scoreDelta: 10,
                        consequence: "Not valid when your king is in check.",
                    },
                ],
            },
        ],
    },
    {
        id: "sudoku-sprint-m1",
        title: "Sudoku Sprint",
        subtitle: "Logic Grid Rush",
        theme: "Pattern Recognition and Logic",
        durationMinutes: 9,
        objective: "Use elimination logic to complete mini Sudoku constraints accurately.",
        reflectionPrompt:
            "What elimination method helped you solve Sudoku clues faster?",
        badgeRewardId: "sudoku-solver",
        steps: [
            {
                id: "row-elimination",
                prompt: "A row has 1, 2, and 4. Which number is missing?",
                choices: [
                    {
                        id: "missing-3",
                        text: "3",
                        scoreDelta: 90,
                        consequence: "Correct. The missing value is 3.",
                    },
                    {
                        id: "repeat-2",
                        text: "2",
                        scoreDelta: 0,
                        consequence: "Rows cannot repeat values in Sudoku.",
                    },
                    {
                        id: "repeat-4",
                        text: "4",
                        scoreDelta: 0,
                        consequence: "4 is already in the row.",
                    },
                ],
            },
            {
                id: "candidate-filter",
                prompt: "If row allows {2,4} and column already contains 4, what fits?",
                choices: [
                    {
                        id: "fit-2",
                        text: "2",
                        scoreDelta: 80,
                        consequence: "Excellent elimination logic.",
                    },
                    {
                        id: "fit-4",
                        text: "4",
                        scoreDelta: 0,
                        consequence: "Column rule removes 4.",
                    },
                    {
                        id: "fit-1",
                        text: "1",
                        scoreDelta: 10,
                        consequence: "This value does not match row candidates.",
                    },
                ],
            },
        ],
    },
    {
        id: "code-debug-dash-m1",
        title: "Code Debug Dash",
        subtitle: "Fix Before Launch",
        theme: "Coding and Debugging",
        durationMinutes: 11,
        objective: "Identify and fix common code bugs using logic and test thinking.",
        reflectionPrompt:
            "Which debugging habit made the biggest difference in your score?",
        badgeRewardId: "code-debugger",
        steps: [
            {
                id: "condition-fix",
                prompt: "A bug compares values incorrectly in an if statement. Best fix?",
                choices: [
                    {
                        id: "equality-check",
                        text: "Use equality comparison instead of assignment.",
                        scoreDelta: 90,
                        consequence: "Correct. Condition logic now evaluates properly.",
                    },
                    {
                        id: "print-more",
                        text: "Add random print statements only.",
                        scoreDelta: 20,
                        consequence: "Helpful for tracing, but not the root fix.",
                    },
                    {
                        id: "rename-file",
                        text: "Rename the file and run again.",
                        scoreDelta: 0,
                        consequence: "No logical bug fix was applied.",
                    },
                ],
            },
            {
                id: "loop-stop",
                prompt: "A loop never stops because counter is unchanged. What should you do?",
                choices: [
                    {
                        id: "update-counter",
                        text: "Increment/decrement counter inside loop.",
                        scoreDelta: 80,
                        consequence: "Correct. The loop can now terminate.",
                    },
                    {
                        id: "delete-loop",
                        text: "Remove loop entirely.",
                        scoreDelta: 20,
                        consequence: "Possible, but often removes needed behavior.",
                    },
                    {
                        id: "ignore-warning",
                        text: "Ignore it and continue testing.",
                        scoreDelta: 0,
                        consequence: "Infinite loop risk remains.",
                    },
                ],
            },
        ],
    },
    {
        id: "loop-lab-m1",
        title: "Loop Lab Challenge",
        subtitle: "Algorithm Flow Builder",
        theme: "Algorithms and Iteration",
        durationMinutes: 10,
        objective: "Predict loop behavior and choose efficient control flow patterns.",
        reflectionPrompt:
            "How did understanding loop conditions help you avoid logic errors?",
        badgeRewardId: "loop-master",
        steps: [
            {
                id: "for-vs-while",
                prompt: "When is a `for` loop generally a better choice?",
                choices: [
                    {
                        id: "known-iterations",
                        text: "When iteration count is known ahead of time.",
                        scoreDelta: 90,
                        consequence: "Correct. This is ideal for a for-loop.",
                    },
                    {
                        id: "unknown-forever",
                        text: "When no stop condition exists.",
                        scoreDelta: 0,
                        consequence: "Loops should always have termination logic.",
                    },
                    {
                        id: "no-counter",
                        text: "When you never track position.",
                        scoreDelta: 15,
                        consequence: "Not usually the strongest reason for a for-loop.",
                    },
                ],
            },
            {
                id: "break-continue",
                prompt: "What does `continue` do in many languages?",
                choices: [
                    {
                        id: "skip-current",
                        text: "Skip current iteration and move to the next one.",
                        scoreDelta: 80,
                        consequence: "Correct. Continue jumps forward in the loop.",
                    },
                    {
                        id: "end-program",
                        text: "Ends the whole program immediately.",
                        scoreDelta: 0,
                        consequence: "That is not what continue does.",
                    },
                    {
                        id: "create-array",
                        text: "Creates a new array automatically.",
                        scoreDelta: 0,
                        consequence: "Continue is flow control, not data creation.",
                    },
                ],
            },
        ],
    },
    {
        id: "binary-bridge-m1",
        title: "Binary Bridge",
        subtitle: "Logic Gate Crossing",
        theme: "Computational Thinking",
        durationMinutes: 9,
        objective: "Solve binary and logic-gate puzzles that power digital systems.",
        reflectionPrompt:
            "Which binary or logic concept became clearer to you after this mission?",
        badgeRewardId: "binary-architect",
        steps: [
            {
                id: "binary-convert",
                prompt: "Binary 101 equals which decimal number?",
                choices: [
                    {
                        id: "decimal-5",
                        text: "5",
                        scoreDelta: 90,
                        consequence: "Correct conversion: 4 + 1 = 5.",
                    },
                    {
                        id: "decimal-4",
                        text: "4",
                        scoreDelta: 20,
                        consequence: "Close, but misses the final bit.",
                    },
                    {
                        id: "decimal-6",
                        text: "6",
                        scoreDelta: 10,
                        consequence: "This does not match the bit values.",
                    },
                ],
            },
            {
                id: "logic-gate-rule",
                prompt: "An AND gate outputs 1 when:",
                choices: [
                    {
                        id: "both-true",
                        text: "Both inputs are 1.",
                        scoreDelta: 80,
                        consequence: "Correct. AND needs all inputs true.",
                    },
                    {
                        id: "either-true",
                        text: "At least one input is 1.",
                        scoreDelta: 10,
                        consequence: "That rule belongs to OR.",
                    },
                    {
                        id: "both-zero",
                        text: "Both inputs are 0.",
                        scoreDelta: 0,
                        consequence: "AND with zeros outputs 0.",
                    },
                ],
            },
        ],
    },
];

export const stemTrackCatalog: STEMTrack[] = [
    {
        id: "coding",
        title: "Coding",
        subtitle: "Logic, conditions, debugging, and building mini apps",
        difficulty: "Beginner",
    },
    {
        id: "ai-literacy",
        title: "AI Literacy",
        subtitle: "Responsible AI use, bias awareness, and safe prompting",
        difficulty: "Intermediate",
    },
    {
        id: "cybersecurity",
        title: "Cybersecurity",
        subtitle: "Phishing defense, account security, and incident response",
        difficulty: "Beginner",
    },
    {
        id: "data-skills",
        title: "Data Skills",
        subtitle: "Interpret charts, clean data, and evidence-based decisions",
        difficulty: "Beginner",
    },
    {
        id: "robotics-climate-tech",
        title: "Robotics/Climate Tech",
        subtitle: "Systems thinking, automation, and sustainability design",
        difficulty: "Beginner",
    },
];

export const mentorCatalog: Mentor[] = [
    {
        id: "ada-cyber",
        name: "Ada",
        role: "mentor",
        isAcceptingMentees: true,
        specialty: "Cybersecurity Mentor",
        description: "Incident response, digital safety habits, and calm leadership.",
        openSlotsLabel: "Open slots this week",
        bio: "Cybersecurity analyst and youth mentor focused on safe digital habits and incident response.",
        expertiseTags: ["Cybersecurity", "Digital Safety", "Leadership"],
        languages: ["English"],
        yearsExperience: 7,
        responseTimeLabel: "Usually replies in under 6 hours",
        rating: 4.9,
        totalReviews: 38,
        availabilitySlots: [
            "Tuesday, 4:00 PM",
            "Thursday, 6:00 PM",
            "Saturday, 11:00 AM",
        ],
    },
    {
        id: "maya-eng",
        name: "Maya",
        role: "mentor",
        isAcceptingMentees: true,
        specialty: "Engineering Mentor",
        description: "Rapid prototyping, robotics teamwork, and project reviews.",
        openSlotsLabel: "2 upcoming live sessions",
        bio: "Mechanical engineer supporting student teams with prototyping, debugging, and design reviews.",
        expertiseTags: ["Engineering", "Robotics", "Prototyping"],
        languages: ["English", "French"],
        yearsExperience: 9,
        responseTimeLabel: "Usually replies in under 12 hours",
        rating: 4.8,
        totalReviews: 27,
        availabilitySlots: [
            "Monday, 5:30 PM",
            "Wednesday, 3:00 PM",
            "Friday, 7:00 PM",
        ],
    },
];

export const projectCatalog: ProjectTemplate[] = [
    {
        id: "poster-cyber-safety",
        title: "Build a Cyber Safety Poster",
        description: "Create a school-ready visual guide to phishing prevention.",
        estimatedMinutes: 45,
    },
    {
        id: "robot-relay-proto",
        title: "Robot Relay Prototype",
        description: "Document your relay strategy with failure checks and improvements.",
        estimatedMinutes: 60,
    },
];

export const badgeCatalog: Badge[] = [
    {
        id: "cyber-defender",
        name: "Cyber Defender Badge",
        description: "Completed CyberQuest mission with secure response choices.",
        sourceMissionId: "cyberquest-m1",
        unlockCriteria: "Complete Dara and the CyberQuest mission.",
    },
    {
        id: "network-guardian",
        name: "Network Guardian Badge",
        description: "Completed CyberQuest Mission 2 with strong network defense decisions.",
        sourceMissionId: "cyberquest-m2",
        unlockCriteria: "Complete Dara and the CyberQuest Mission 2.",
    },
    {
        id: "relay-strategist",
        name: "Relay Strategist Badge",
        description: "Completed Robot Relay mission with effective troubleshooting.",
        sourceMissionId: "robot-relay-m1",
        unlockCriteria: "Complete Amina and the Robot Relay mission.",
    },
    {
        id: "chess-strategist",
        name: "Chess Strategist Badge",
        description: "Completed Chess Tactics Arena with strong tactical choices.",
        sourceMissionId: "chess-tactics-m1",
        unlockCriteria: "Complete Chess Tactics Arena mission.",
    },
    {
        id: "sudoku-solver",
        name: "Sudoku Solver Badge",
        description: "Completed Sudoku Sprint using elimination-based logic.",
        sourceMissionId: "sudoku-sprint-m1",
        unlockCriteria: "Complete Sudoku Sprint mission.",
    },
    {
        id: "code-debugger",
        name: "Code Debugger Badge",
        description: "Completed Code Debug Dash by fixing core coding bugs.",
        sourceMissionId: "code-debug-dash-m1",
        unlockCriteria: "Complete Code Debug Dash mission.",
    },
    {
        id: "loop-master",
        name: "Loop Master Badge",
        description: "Completed Loop Lab Challenge with accurate algorithm flow.",
        sourceMissionId: "loop-lab-m1",
        unlockCriteria: "Complete Loop Lab Challenge mission.",
    },
    {
        id: "binary-architect",
        name: "Binary Architect Badge",
        description: "Completed Binary Bridge by solving logic and binary challenges.",
        sourceMissionId: "binary-bridge-m1",
        unlockCriteria: "Complete Binary Bridge mission.",
    },
    {
        id: "coding-quiz-starter",
        name: "Coding Quiz Starter",
        description: "Completed your first Coding trivia session.",
        sourceStemCategoryId: "coding",
        unlockCriteria: "Complete 1 Coding trivia session.",
    },
    {
        id: "ai-literacy-starter",
        name: "AI Literacy Starter",
        description: "Completed your first AI Literacy trivia session.",
        sourceStemCategoryId: "ai_literacy",
        unlockCriteria: "Complete 1 AI Literacy trivia session.",
    },
    {
        id: "cybersecurity-starter",
        name: "Cybersecurity Starter",
        description: "Completed your first Cybersecurity trivia session.",
        sourceStemCategoryId: "cybersecurity",
        unlockCriteria: "Complete 1 Cybersecurity trivia session.",
    },
    {
        id: "data-skills-starter",
        name: "Data Skills Starter",
        description: "Completed your first Data Skills trivia session.",
        sourceStemCategoryId: "data_skills",
        unlockCriteria: "Complete 1 Data Skills trivia session.",
    },
    {
        id: "robotics-climate-starter",
        name: "Robotics/Climate Starter",
        description: "Completed your first Robotics/Climate Tech trivia session.",
        sourceStemCategoryId: "robotics_climate_tech",
        unlockCriteria: "Complete 1 Robotics/Climate Tech trivia session.",
    },
    {
        id: "coding-quiz-mastery",
        name: "Coding Quiz Mastery",
        description: "Scored 80% or higher in Coding trivia across 3 sessions.",
        sourceStemCategoryId: "coding",
        unlockCriteria: "Score at least 80% in 3 Coding sessions.",
    },
    {
        id: "ai-literacy-mastery",
        name: "AI Literacy Mastery",
        description: "Scored 80% or higher in AI Literacy trivia across 3 sessions.",
        sourceStemCategoryId: "ai_literacy",
        unlockCriteria: "Score at least 80% in 3 AI Literacy sessions.",
    },
    {
        id: "cybersecurity-mastery",
        name: "Cybersecurity Mastery",
        description: "Scored 80% or higher in Cybersecurity trivia across 3 sessions.",
        sourceStemCategoryId: "cybersecurity",
        unlockCriteria: "Score at least 80% in 3 Cybersecurity sessions.",
    },
    {
        id: "data-skills-mastery",
        name: "Data Skills Mastery",
        description: "Scored 80% or higher in Data Skills trivia across 3 sessions.",
        sourceStemCategoryId: "data_skills",
        unlockCriteria: "Score at least 80% in 3 Data Skills sessions.",
    },
    {
        id: "robotics-climate-mastery",
        name: "Robotics/Climate Mastery",
        description: "Scored 80% or higher in Robotics/Climate Tech trivia across 3 sessions.",
        sourceStemCategoryId: "robotics_climate_tech",
        unlockCriteria: "Score at least 80% in 3 Robotics/Climate Tech sessions.",
    },
    {
        id: "stem-spectrum",
        name: "STEM Spectrum Explorer",
        description: "Completed at least one trivia session in all five STEM categories.",
        unlockCriteria: "Complete 1 session in Coding, AI Literacy, Cybersecurity, Data Skills, and Robotics/Climate Tech.",
    },
  {
    id: "daily-goal-1",
    name: "Coding Primer",
    description: "Complete 1 Coding trivia session.",
    unlockCriteria: "Complete 1 Coding trivia session.",
  },
  {
    id: "daily-goal-2",
    name: "AI Explorer",
    description: "Complete 1 AI Literacy trivia session.",
    unlockCriteria: "Complete 1 AI Literacy trivia session.",
  },
  {
    id: "daily-goal-3",
    name: "Cyber Prep",
    description: "Complete 1 Cybersecurity trivia session.",
    unlockCriteria: "Complete 1 Cybersecurity trivia session.",
  },
  {
    id: "daily-goal-4",
    name: "Data Dive",
    description: "Complete 1 Data Skills trivia session.",
    unlockCriteria: "Complete 1 Data Skills trivia session.",
  },
  {
    id: "daily-goal-5",
    name: "Robotics Run",
    description: "Complete 1 Robotics/Climate trivia session.",
    unlockCriteria: "Complete 1 Robotics/Climate trivia session.",
  },
  {
    id: "daily-goal-6",
    name: "Mission Starter",
    description: "Start a new mission today.",
    unlockCriteria: "Start a new mission today.",
  },
  {
    id: "daily-goal-7",
    name: "Perfect Step",
    description: "Complete a mission step perfectly on the first try.",
    unlockCriteria: "Complete a mission step perfectly on the first try.",
  },
  {
    id: "daily-goal-8",
    name: "Theme Weaver",
    description: "Change your app theme or colors.",
    unlockCriteria: "Change your app theme or colors.",
  },
  {
    id: "daily-goal-9",
    name: "Mentor Match",
    description: "Review your mentor matches.",
    unlockCriteria: "Review your mentor matches.",
  },
  {
    id: "daily-goal-10",
    name: "Certificate Check",
    description: "Check out a certificate requirement.",
    unlockCriteria: "Check out a certificate requirement.",
  },
  {
    id: "daily-goal-11",
    name: "Badge Hunter",
    description: "View a locked badge in the gallery.",
    unlockCriteria: "View a locked badge in the gallery.",
  },
  {
    id: "daily-goal-12",
    name: "Double Play",
    description: "Play 2 trivia sessions in one day.",
    unlockCriteria: "Play 2 trivia sessions in one day.",
  },
  {
    id: "daily-goal-13",
    name: "Mission Complete",
    description: "Complete 1 mission from start to finish today.",
    unlockCriteria: "Complete 1 mission from start to finish today.",
  },
  {
    id: "daily-goal-14",
    name: "Knowledge Seeker",
    description: "Search for a specific STEM topic.",
    unlockCriteria: "Search for a specific STEM topic.",
  },
  {
    id: "daily-goal-15",
    name: "Cyber Review",
    description: "Revisit the CyberQuest mission.",
    unlockCriteria: "Revisit the CyberQuest mission.",
  },
  {
    id: "daily-goal-16",
    name: "Avatar Update",
    description: "Update your avatar background.",
    unlockCriteria: "Update your avatar background.",
  },
  {
    id: "daily-goal-17",
    name: "Robotics Explorer",
    description: "Explore the Robotics track.",
    unlockCriteria: "Explore the Robotics track.",
  },
  {
    id: "daily-goal-18",
    name: "Progress Check",
    description: "Check your weekly progress.",
    unlockCriteria: "Check your weekly progress.",
  },
  {
    id: "daily-goal-19",
    name: "Mentor Bio",
    description: "Read a mentor's full bio.",
    unlockCriteria: "Read a mentor's full bio.",
  },
  {
    id: "daily-goal-20",
    name: "Trivia Master",
    description: "Score 80% or higher today in any trivia.",
    unlockCriteria: "Score 80% or higher today in any trivia.",
  },
  {
    id: "weekly-goal-1",
    name: "Trivia Buff",
    description: "Play 5 trivia sessions this week.",
    unlockCriteria: "Play 5 trivia sessions this week.",
  },
  {
    id: "weekly-goal-2",
    name: "Mission Specialist",
    description: "Complete 3 missions this week.",
    unlockCriteria: "Complete 3 missions this week.",
  },
  {
    id: "weekly-goal-3",
    name: "Perfect Score",
    description: "Score 100% on 3 trivia sessions this week.",
    unlockCriteria: "Score 100% on 3 trivia sessions this week.",
  },
  {
    id: "weekly-goal-4",
    name: "STEM Generalist",
    description: "Try all 5 STEM categories in one week.",
    unlockCriteria: "Try all 5 STEM categories in one week.",
  },
  {
    id: "weekly-goal-5",
    name: "Dedicated Learner",
    description: "Spend at least 60 minutes learning this week.",
    unlockCriteria: "Spend at least 60 minutes learning this week.",
  },
  {
    id: "weekly-goal-6",
    name: "Reward Earner",
    description: "Unlock 2 new badges this week.",
    unlockCriteria: "Unlock 2 new badges this week.",
  },
  {
    id: "weekly-goal-7",
    name: "Project Builder",
    description: "Submit a project this week.",
    unlockCriteria: "Submit a project this week.",
  },
  {
    id: "weekly-goal-8",
    name: "Networker",
    description: "Schedule or complete a mentor call.",
    unlockCriteria: "Schedule or complete a mentor call.",
  },
  {
    id: "weekly-goal-9",
    name: "Consistent Learner",
    description: "Log in 5 different days this week.",
    unlockCriteria: "Log in 5 different days this week.",
  },
  {
    id: "weekly-goal-10",
    name: "Track Finisher",
    description: "Complete a full STEM track.",
    unlockCriteria: "Complete a full STEM track.",
  },
  {
    id: "weekly-goal-11",
    name: "Streak Keeper",
    description: "Reach a 3-week streak.",
    unlockCriteria: "Reach a 3-week streak.",
  },
  {
    id: "weekly-goal-12",
    name: "Vocab Builder",
    description: "View 10 different glossary terms.",
    unlockCriteria: "View 10 different glossary terms.",
  },
  {
    id: "weekly-goal-13",
    name: "Data Ace",
    description: "Earn a perfect score on a Data Skills mission.",
    unlockCriteria: "Earn a perfect score on a Data Skills mission.",
  },
  {
    id: "weekly-goal-14",
    name: "Cyber Ace",
    description: "Earn a perfect score on a Cybersecurity mission.",
    unlockCriteria: "Earn a perfect score on a Cybersecurity mission.",
  },
  {
    id: "weekly-goal-15",
    name: "Reaching Out",
    description: "Send a mentorship request.",
    unlockCriteria: "Send a mentorship request.",
  },
  {
    id: "weekly-goal-16",
    name: "Refresher",
    description: "Re-play 3 old missions to refresh memory.",
    unlockCriteria: "Re-play 3 old missions to refresh memory.",
  },
  {
    id: "weekly-goal-17",
    name: "High Achiever",
    description: "Achieve an average score of 90% in weekly trivia.",
    unlockCriteria: "Achieve an average score of 90% in weekly trivia.",
  },
  {
    id: "weekly-goal-18",
    name: "Deep Dive",
    description: "Spend 120 minutes learning this week.",
    unlockCriteria: "Spend 120 minutes learning this week.",
  },
  {
    id: "weekly-goal-19",
    name: "Weekend Warrior",
    description: "Log in on both Saturday and Sunday.",
    unlockCriteria: "Log in on both Saturday and Sunday.",
  },
  {
    id: "weekly-goal-20",
    name: "Certified",
    description: "Unlock your first Certificate.",
    unlockCriteria: "Unlock your first Certificate.",
  },
];

export const certificateCatalog: Certificate[] = [
  {
    id: "stem-leadership-p1",
    name: "STEM Leadership Pathway Certificate",
    description: "Complete mission and project milestones for pathway validation.",
    minCompletedMissions: 2,
    minSubmittedProjects: 1,
  },
];

export function getMissionById(missionId: string) {
  return missionCatalog.find((mission) => mission.id === missionId);
}

export function getBadgeById(badgeId: string) {
  return badgeCatalog.find((badge) => badge.id === badgeId);
}
