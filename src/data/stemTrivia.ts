import type {
  AgeBracketId,
  StemCategoryId,
  StemCategoryMeta,
  StemTriviaQuestion,
} from "../types/models";

const ageBracketsForTrivia: AgeBracketId[] = ["0_7", "8_10", "11_13", "14_16", "17_plus"];

export const stemCategoryCatalog: StemCategoryMeta[] = [
  {
    id: "coding",
    title: "Coding",
    summary:
      "Build logic and problem-solving skills by choosing the strongest coding decisions for real project scenarios.",
    howToPlay: [
      "Each session gives 10 random questions from a 100+ question pool.",
      "Select one answer per question. Correct answers give 10 points.",
      "Score 80% or higher in 3 sessions to unlock the mastery badge.",
    ],
  },
  {
    id: "ai_literacy",
    title: "AI Literacy",
    summary:
      "Learn how AI systems work, where they fail, and how to use AI responsibly in school and everyday life.",
    howToPlay: [
      "Questions are randomized every time you press Play.",
      "Read each scenario carefully and choose the most responsible action.",
      "Complete sessions consistently to earn starter and mastery badges.",
    ],
  },
  {
    id: "cybersecurity",
    title: "Cybersecurity",
    summary:
      "Practice digital safety decisions, threat detection, and secure behavior under pressure.",
    howToPlay: [
      "You get 10 randomized cybersecurity questions per run.",
      "Aim for high scores by picking safe and evidence-based actions.",
      "High performance unlocks cybersecurity STEM badges.",
    ],
  },
  {
    id: "data_skills",
    title: "Data Skills",
    summary:
      "Strengthen your ability to read data, question assumptions, and make decisions using evidence.",
    howToPlay: [
      "Each play session pulls random questions from a large data-skills bank.",
      "Choose the answer that best applies data thinking and interpretation.",
      "Repeat sessions to improve average and best scores.",
    ],
  },
  {
    id: "robotics_climate_tech",
    title: "Robotics/Climate Tech",
    summary:
      "Explore systems thinking, robotics fundamentals, and climate-focused technology choices.",
    howToPlay: [
      "Play includes 10 random questions from a 100+ question pool.",
      "Choose practical, safe, and climate-smart engineering decisions.",
      "Complete multiple high-scoring sessions for mastery badge unlock.",
    ],
  },
];

const categoryTopics: Record<StemCategoryId, string[]> = {
  coding: [
    "storing information in boxes (variables)",
    "making choices with if/else",
    "repeating steps with loops",
    "giving instructions to a computer",
    "finding and fixing mistakes (bugs)",
    "checking what the user types in",
    "what to do when something goes wrong",
    "planning steps to solve a puzzle",
    "putting things in order (sorting)",
    "working with lists of items",
    "working with words and letters",
    "remembering things while a program runs",
    "making things happen when you click",
    "checking if your code works correctly",
    "saving your work safely",
    "writing code others can read",
    "breaking big problems into small parts",
    "getting info from the internet",
    "making a simple game",
    "keeping your code safe from hackers",
  ],
  ai_literacy: [
    "how computers learn from examples",
    "when AI treats people unfairly",
    "checking if an AI is doing a good job",
    "when AI makes things up (hallucinations)",
    "asking AI clear questions",
    "why humans should check AI work",
    "keeping your info private from AI",
    "using AI to help not hurt",
    "how sure is the AI really?",
    "teaching a computer with labeled pictures",
    "understanding why AI chose an answer",
    "when AI memorizes instead of learning",
    "stopping people from misusing AI",
    "letting robots help with boring tasks",
    "making sure AI is fair to everyone",
    "spotting fake pictures or videos",
    "who is responsible when AI makes mistakes",
    "giving AI the right instructions",
    "knowing when to trust AI and when not to",
    "making sure AI is safe before sharing it",
  ],
  cybersecurity: [
    "spotting fake emails and messages",
    "creating strong passwords",
    "using extra login protection (2FA)",
    "staying safe while browsing the web",
    "keeping your apps and devices updated",
    "signs that a file might be dangerous",
    "telling an adult when something seems wrong",
    "keeping your home Wi-Fi safe",
    "backing up your important files",
    "when strangers try to trick you online",
    "getting back into your account safely",
    "checking if an email is real or fake",
    "dangers of public Wi-Fi",
    "who can see your files",
    "protecting your online identity",
    "setting up privacy on apps",
    "downloading apps and files safely",
    "what to do if your password gets leaked",
    "which online problems to fix first",
    "rules for using school computers safely",
  ],
  data_skills: [
    "cleaning up messy information",
    "reading a table of numbers",
    "choosing the right chart or graph",
    "finding the average of numbers",
    "spotting numbers that don't belong",
    "noticing patterns over time",
    "why asking more people gives better answers",
    "does one thing really cause another?",
    "telling a story with numbers",
    "asking the right questions about data",
    "comparing two experiments fairly",
    "measuring things the same way each time",
    "making charts easy to understand",
    "why predictions can be wrong",
    "which facts are most trustworthy",
    "what to do when data is missing",
    "making sure surveys are fair",
    "reading a dashboard of information",
    "how sure should you be about a result?",
    "double-checking your answers with data",
  ],
  robotics_climate_tech: [
    "how sensors detect the world around them",
    "making robot parts move (motors)",
    "how robots correct their own mistakes",
    "building and improving prototypes",
    "saving energy in machines",
    "measuring weather and climate",
    "keeping robots safe around people",
    "fixing broken robot parts",
    "connecting different parts of a robot",
    "teaching a robot to follow a path",
    "how batteries store energy",
    "choosing earth-friendly materials",
    "reducing waste when building things",
    "testing your inventions outside",
    "thinking about what could go wrong",
    "tracking how we help the planet",
    "taking care of machines and robots",
    "robots and humans working together",
    "using sensors to watch the environment",
    "building things that last a long time",
  ],
};

const stemCategoryById = stemCategoryCatalog.reduce<Record<StemCategoryId, StemCategoryMeta>>(
  (acc, category) => {
    acc[category.id] = category;
    return acc;
  },
  {} as Record<StemCategoryId, StemCategoryMeta>
);

export const stemStarterBadgeByCategory: Record<StemCategoryId, string> = {
  coding: "coding-quiz-starter",
  ai_literacy: "ai-literacy-starter",
  cybersecurity: "cybersecurity-starter",
  data_skills: "data-skills-starter",
  robotics_climate_tech: "robotics-climate-starter",
};

export const stemMasteryBadgeByCategory: Record<StemCategoryId, string> = {
  coding: "coding-quiz-mastery",
  ai_literacy: "ai-literacy-mastery",
  cybersecurity: "cybersecurity-mastery",
  data_skills: "data-skills-mastery",
  robotics_climate_tech: "robotics-climate-mastery",
};

export const stemAllCategoryBadgeId = "stem-spectrum";

function placeCorrectOption(
  correct: string,
  wrongOptions: [string, string, string],
  seed: number
) {
  const insertionIndex = seed % 4;
  const options = [...wrongOptions];
  options.splice(insertionIndex, 0, correct);
  return {
    options,
    correctOptionIndex: insertionIndex,
  };
}

function buildAgeSpecificQuestionStrings(
  categoryTitle: string,
  topic: string,
  templateIndex: number,
  ageBracket: AgeBracketId
) {
  if (ageBracket === "0_7") {
    if (templateIndex === 0) {
      return {
        prompt: `You're a little scientist learning about ${topic}! What should you do first?`,
        correct: `Start slowly, try one small thing, and see what happens!`,
        wrongs: [
          `Do everything at once without looking.`,
          `Close your eyes and press random buttons.`,
          `Skip it because it looks too hard.`,
        ] as [string, string, string],
        explanation: "Great scientists start small and watch carefully!",
        difficulty: "easy" as const,
      };
    }
    if (templateIndex === 1) {
      return {
        prompt: `Your friend is confused about ${topic}. How can you help?`,
        correct: `Show them step by step and be patient.`,
        wrongs: [
          `Tell them to figure it out alone.`,
          `Do it so fast they can't see what you did.`,
          `Say it's too easy and walk away.`,
        ] as [string, string, string],
        explanation: "Being patient and showing steps makes you a great helper!",
        difficulty: "easy" as const,
      };
    }
    if (templateIndex === 2) {
      return {
        prompt: `Oh no! Something went wrong while you were trying ${topic}. What now?`,
        correct: `Stay calm, look at what happened, and try again.`,
        wrongs: [
          `Give up and never try again.`,
          `Get upset and press all the buttons.`,
          `Pretend nothing went wrong.`,
        ] as [string, string, string],
        explanation: "Mistakes help us learn when we stay calm!",
        difficulty: "easy" as const,
      };
    }
    if (templateIndex === 3) {
      return {
        prompt: `What is the SAFEST way to explore ${topic}?`,
        correct: `Ask a grown-up for help and follow the rules.`,
        wrongs: [
          `Do it in secret without telling anyone.`,
          `Touch everything without asking.`,
          `Ignore the safety rules because they're boring.`,
        ] as [string, string, string],
        explanation: "Staying safe means you can keep exploring and learning!",
        difficulty: "easy" as const,
      };
    }
    return {
      prompt: `Why is it fun to learn about ${topic} with friends?`,
      correct: `Friends can share ideas and you learn together!`,
      wrongs: [
        `Working alone is always better.`,
        `Friends will mess up your work.`,
        `It's not fun to share ideas.`,
      ] as [string, string, string],
      explanation: "Teamwork makes learning twice as fun!",
      difficulty: "easy" as const,
    };
  }

  if (ageBracket === "8_10") {
    if (templateIndex === 0) {
      return {
        prompt: `Detective challenge! You're investigating ${topic}. What's your best first move?`,
        correct: `Gather clues, write down what you notice, and test one idea at a time.`,
        wrongs: [
          `Jump to the answer without collecting any clues.`,
          `Ignore the clues and just guess.`,
          `Only look at the last thing that happened.`,
        ] as [string, string, string],
        explanation: "Good detectives always gather clues before making a decision!",
        difficulty: "easy" as const,
      };
    }
    if (templateIndex === 1) {
      return {
        prompt: `You're building a project about ${topic}. What makes your project stronger?`,
        correct: `Testing it, asking friends for feedback, and improving it.`,
        wrongs: [
          `Never testing it and hoping it works.`,
          `Refusing to change anything once you start.`,
          `Copying someone else's work without understanding it.`,
        ] as [string, string, string],
        explanation: "Testing and improving makes every project better!",
        difficulty: "medium" as const,
      };
    }
    if (templateIndex === 2) {
      return {
        prompt: `Your experiment with ${topic} gave a weird result. What should you do?`,
        correct: `Write it down and try the experiment again to check.`,
        wrongs: [
          `Ignore it and pretend it didn't happen.`,
          `Change the result to what you expected.`,
          `Stop experimenting forever.`,
        ] as [string, string, string],
        explanation: "Unexpected results are chances to discover something new!",
        difficulty: "medium" as const,
      };
    }
    if (templateIndex === 3) {
      return {
        prompt: `How should you use ${topic} to be helpful to others?`,
        correct: `Think about how it affects people and use it kindly and safely.`,
        wrongs: [
          `Only think about what's fun for you.`,
          `Use it even if it might hurt someone's feelings.`,
          `Don't worry about other people.`,
        ] as [string, string, string],
        explanation: "Tech and science are best when they help people!",
        difficulty: "medium" as const,
      };
    }
    return {
      prompt: `Why is it smart to explain ${topic} to a friend?`,
      correct: `When you explain it, you understand it better yourself!`,
      wrongs: [
        `Explaining wastes your time.`,
        `Your friend won't understand anyway.`,
        `It's better to keep knowledge to yourself.`,
      ] as [string, string, string],
      explanation: "Teaching others is one of the best ways to learn!",
      difficulty: "easy" as const,
    };
  }

  if (ageBracket === "11_13") {
    if (templateIndex === 0) {
      return {
        prompt: `You're starting a project on ${topic}. What's the smartest approach?`,
        correct: `Plan your steps, start with a small test, and build from there.`,
        wrongs: [
          `Start the biggest part first without any planning.`,
          `Skip testing and go straight to the final version.`,
          `Don't write anything down, just remember it all.`,
        ] as [string, string, string],
        explanation: "Planning and small tests prevent big problems later.",
        difficulty: "medium" as const,
      };
    }
    if (templateIndex === 1) {
      return {
        prompt: `Which statement about ${topic} is TRUE?`,
        correct: `Good results come from checking facts and using real evidence.`,
        wrongs: [
          `The first answer you think of is usually correct.`,
          `Evidence doesn't matter as long as you feel confident.`,
          `Checking your work is a waste of time.`,
        ] as [string, string, string],
        explanation: "Evidence and fact-checking lead to trustworthy results.",
        difficulty: "medium" as const,
      };
    }
    if (templateIndex === 2) {
      return {
        prompt: `Your team gets different results on ${topic}. What should you do?`,
        correct: `Compare what each person did differently and run the test again carefully.`,
        wrongs: [
          `Pick whoever's result looks nicest.`,
          `Argue until someone gives up.`,
          `Just average everything and call it done.`,
        ] as [string, string, string],
        explanation: "Finding differences helps you discover what really matters.",
        difficulty: "medium" as const,
      };
    }
    if (templateIndex === 3) {
      return {
        prompt: `What's the most responsible way to work on ${topic}?`,
        correct: `Think about safety, fairness, and how it affects real people.`,
        wrongs: [
          `Speed is all that matters.`,
          `Only your own opinion counts.`,
          `Rules are for beginners, not for you.`,
        ] as [string, string, string],
        explanation: "Responsible creators care about people, not just speed.",
        difficulty: "hard" as const,
      };
    }
    return {
      prompt: `How does getting feedback help your work on ${topic}?`,
      correct: `Others can spot mistakes you missed and suggest improvements.`,
      wrongs: [
        `Feedback just slows you down.`,
        `Your first draft is always the best.`,
        `Only experts can give useful feedback.`,
      ] as [string, string, string],
      explanation: "Fresh eyes catch things you might have overlooked!",
      difficulty: "medium" as const,
    };
  }

  if (ageBracket === "14_16") {
    if (templateIndex === 0) {
      return {
        prompt: `You're leading a real-world project on ${topic}. What should you do first?`,
        correct: `Define clear goals, create a test plan, and set measurable checkpoints.`,
        wrongs: [
          `Jump into building without any goals.`,
          `Wait until the project is finished to check if it works.`,
          `Focus only on speed and skip the planning phase.`,
        ] as [string, string, string],
        explanation: "Clear goals and checkpoints keep real-world projects on track.",
        difficulty: "medium" as const,
      };
    }
    if (templateIndex === 1) {
      return {
        prompt: `Which practice leads to the most reliable results in ${topic}?`,
        correct: `Making decisions based on data, testing carefully, and documenting everything.`,
        wrongs: [
          `Going with your gut feeling and skipping documentation.`,
          `Avoiding measurements so you stay flexible.`,
          `Assuming things work once you've seen one good result.`,
        ] as [string, string, string],
        explanation: "Data-driven decisions are more reliable than guesswork.",
        difficulty: "hard" as const,
      };
    }
    if (templateIndex === 2) {
      return {
        prompt: `Your tests on ${topic} show conflicting results. What's the right move?`,
        correct: `Identify what changed between tests and run a controlled comparison.`,
        wrongs: [
          `Pick the result you like best and ignore the rest.`,
          `Blame the tools and move on.`,
          `Stop testing because it's taking too long.`,
        ] as [string, string, string],
        explanation: "Controlled comparisons reveal the real cause of differences.",
        difficulty: "hard" as const,
      };
    }
    if (templateIndex === 3) {
      return {
        prompt: `How do you make sure your work on ${topic} is ethical?`,
        correct: `Consider who's affected, test for fairness, and include safety checks.`,
        wrongs: [
          `Ethics only matter for big companies, not personal projects.`,
          `If it works, it's fine — no need to check for fairness.`,
          `Safety checks slow things down too much.`,
        ] as [string, string, string],
        explanation: "Ethical work considers impact on all people, not just outcomes.",
        difficulty: "hard" as const,
      };
    }
    return {
      prompt: `Why is peer review important when working on ${topic}?`,
      correct: `It catches blind spots, improves quality, and builds team confidence.`,
      wrongs: [
        `It's just a formality that doesn't change anything.`,
        `Working alone always produces better results.`,
        `Review is only needed when something breaks.`,
      ] as [string, string, string],
      explanation: "Peer review strengthens work by adding diverse perspectives.",
      difficulty: "medium" as const,
    };
  }

  // 17_plus
  if (templateIndex === 0) {
    return {
      prompt: `In a professional context, what's the best first step for ${topic}?`,
      correct: `Establish measurable baselines and a validation plan before scaling.`,
      wrongs: [
        `Scale immediately and fix problems as they appear.`,
        `Assume stability without pre-deployment checks.`,
        `Prioritize delivery speed over validation.`,
      ] as [string, string, string],
      explanation: "Baselines and validation plans support evidence-backed scaling.",
      difficulty: "hard" as const,
    };
  }
  if (templateIndex === 1) {
    return {
      prompt: `What distinguishes professional-grade work in ${topic}?`,
      correct: `Measurable evidence, reproducible results, and clear documentation.`,
      wrongs: [
        `Intuition alone is enough once you have experience.`,
        `Documentation can be skipped when outcomes look good.`,
        `Minimizing measurement keeps things moving faster.`,
      ] as [string, string, string],
      explanation: "Reproducibility and documentation are hallmarks of quality work.",
      difficulty: "hard" as const,
    };
  }
  if (templateIndex === 2) {
    return {
      prompt: `Results in ${topic} conflict across different conditions. What do you do?`,
      correct: `Isolate the variables and run controlled tests in comparable conditions.`,
      wrongs: [
        `Generalize from one successful test to all conditions.`,
        `Ignore conflicting data if the average looks acceptable.`,
        `Reduce testing depth to maintain speed.`,
      ] as [string, string, string],
      explanation: "Controlled testing is essential for reliable conclusions.",
      difficulty: "hard" as const,
    };
  }
  if (templateIndex === 3) {
    return {
      prompt: `How do you demonstrate professional accountability in ${topic}?`,
      correct: `Apply safety controls, fairness checks, and clear accountability paths.`,
      wrongs: [
        `Optimize for output and minimize safeguards.`,
        `Treat the work as context-neutral and skip impact review.`,
        `Bypass oversight when timelines are tight.`,
      ] as [string, string, string],
      explanation: "Professional accountability requires explicit controls and review.",
      difficulty: "hard" as const,
    };
  }
  return {
    prompt: `Why is cross-team review valuable in ${topic}?`,
    correct: `It improves reliability, catches blind spots, and builds broader trust.`,
    wrongs: [
      `Cross-team review is unnecessary after initial tests pass.`,
      `Individual ownership alone maximizes quality.`,
      `Review processes add little value after a pilot succeeds.`,
    ] as [string, string, string],
    explanation: "Multiple perspectives strengthen quality and reduce risk.",
    difficulty: "hard" as const,
  };
}

function templateQuestion(
  categoryId: StemCategoryId,
  topic: string,
  topicIndex: number,
  templateIndex: number,
  ageBracket: AgeBracketId
): StemTriviaQuestion {
  const categoryTitle = stemCategoryById[categoryId].title;
  const parts = buildAgeSpecificQuestionStrings(categoryTitle, topic, templateIndex, ageBracket);
  const { options, correctOptionIndex } = placeCorrectOption(
    parts.correct,
    parts.wrongs,
    topicIndex + templateIndex
  );

  return {
    id: `${categoryId}-${ageBracket}-${topicIndex + 1}-${templateIndex + 1}`,
    categoryId,
    ageBracket,
    prompt: parts.prompt,
    options,
    correctOptionIndex,
    explanation: parts.explanation,
    difficulty: parts.difficulty,
    tags: [topic, ageBracket],
  };
}

function buildCategoryQuestionsForAge(categoryId: StemCategoryId, ageBracket: AgeBracketId) {
  const topics = categoryTopics[categoryId];
  return topics.flatMap((topic, topicIndex) =>
    [0, 1, 2, 3, 4].map((templateIndex) =>
      templateQuestion(categoryId, topic, topicIndex, templateIndex, ageBracket)
    )
  );
}

export const stemQuestionPoolByCategoryAndAge: Record<
  StemCategoryId,
  Record<AgeBracketId, StemTriviaQuestion[]>
> = {
  coding: {
    "0_7": buildCategoryQuestionsForAge("coding", "0_7"),
    "8_10": buildCategoryQuestionsForAge("coding", "8_10"),
    "11_13": buildCategoryQuestionsForAge("coding", "11_13"),
    "14_16": buildCategoryQuestionsForAge("coding", "14_16"),
    "17_plus": buildCategoryQuestionsForAge("coding", "17_plus"),
  },
  ai_literacy: {
    "0_7": buildCategoryQuestionsForAge("ai_literacy", "0_7"),
    "8_10": buildCategoryQuestionsForAge("ai_literacy", "8_10"),
    "11_13": buildCategoryQuestionsForAge("ai_literacy", "11_13"),
    "14_16": buildCategoryQuestionsForAge("ai_literacy", "14_16"),
    "17_plus": buildCategoryQuestionsForAge("ai_literacy", "17_plus"),
  },
  cybersecurity: {
    "0_7": buildCategoryQuestionsForAge("cybersecurity", "0_7"),
    "8_10": buildCategoryQuestionsForAge("cybersecurity", "8_10"),
    "11_13": buildCategoryQuestionsForAge("cybersecurity", "11_13"),
    "14_16": buildCategoryQuestionsForAge("cybersecurity", "14_16"),
    "17_plus": buildCategoryQuestionsForAge("cybersecurity", "17_plus"),
  },
  data_skills: {
    "0_7": buildCategoryQuestionsForAge("data_skills", "0_7"),
    "8_10": buildCategoryQuestionsForAge("data_skills", "8_10"),
    "11_13": buildCategoryQuestionsForAge("data_skills", "11_13"),
    "14_16": buildCategoryQuestionsForAge("data_skills", "14_16"),
    "17_plus": buildCategoryQuestionsForAge("data_skills", "17_plus"),
  },
  robotics_climate_tech: {
    "0_7": buildCategoryQuestionsForAge("robotics_climate_tech", "0_7"),
    "8_10": buildCategoryQuestionsForAge("robotics_climate_tech", "8_10"),
    "11_13": buildCategoryQuestionsForAge("robotics_climate_tech", "11_13"),
    "14_16": buildCategoryQuestionsForAge("robotics_climate_tech", "14_16"),
    "17_plus": buildCategoryQuestionsForAge("robotics_climate_tech", "17_plus"),
  },
};

function shuffledCopy<T>(arr: T[]) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = copy[i];
    copy[i] = copy[j];
    copy[j] = temp;
  }
  return copy;
}

export function getStemCategoryById(categoryId: StemCategoryId) {
  return stemCategoryById[categoryId];
}

export function getStemQuestionPoolSize(categoryId: StemCategoryId, ageBracket: AgeBracketId) {
  return stemQuestionPoolByCategoryAndAge[categoryId][ageBracket].length;
}

export function getRandomStemTriviaQuestions(
  categoryId: StemCategoryId,
  count: number,
  ageBracket: AgeBracketId,
  excludedQuestionIds: string[] = []
) {
  const allQuestions = stemQuestionPoolByCategoryAndAge[categoryId][ageBracket];
  const excluded = new Set(excludedQuestionIds);
  const filtered = allQuestions.filter((question) => !excluded.has(question.id));
  const source = filtered.length >= count ? filtered : allQuestions;
  return shuffledCopy(source).slice(0, Math.min(count, source.length));
}

for (const category of stemCategoryCatalog) {
  for (const ageBracket of ageBracketsForTrivia) {
    const count = stemQuestionPoolByCategoryAndAge[category.id][ageBracket].length;
    if (count < 100) {
      throw new Error(`${category.id} (${ageBracket}) has only ${count} questions. Minimum is 100.`);
    }
  }
}
