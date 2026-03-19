import { mentorshipStoryImageById } from "./mentorshipStoryImages";

export type StoryGender = "female" | "male";

export type StoryHeritageFocus =
  | "nigerian"
  | "african"
  | "global_african_descent"
  | "global";

export type MentorshipStoryTriviaQuestion = {
  id: string;
  prompt: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
};

export type MentorshipStory = {
  id: string;
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
  triviaPool: MentorshipStoryTriviaQuestion[];
};

type StorySeed = [
  string,
  string,
  StoryGender,
  string,
  StoryHeritageFocus,
  string,
  string,
  string,
];

export const heritageLabel: Record<StoryHeritageFocus, string> = {
  nigerian: "Nigerian-descent priority",
  african: "African-descent priority",
  global_african_descent: "Global African-descent influence",
  global: "Global influence",
};

const lessonByDomain: Record<string, string> = {
  Science: "Use evidence, curiosity, and persistence to solve real problems.",
  Technology: "Design with users in mind and iterate based on feedback.",
  Engineering: "Break big challenges into practical systems that can scale.",
  Medicine: "Center people first, then optimize process and technology.",
  Arts: "Stories and creativity can shift culture and public thinking.",
  Invention: "Prototype boldly and improve steadily through testing.",
  Leadership: "Create structures that help others succeed long after you.",
  Economics: "Sustainable growth comes from inclusion and accountability.",
  Education: "Teaching multiplies impact across generations.",
  Sustainability: "Long-term thinking turns local action into global resilience.",
  Civic: "Consistent civic participation strengthens institutions.",
  Strategy: "Preparation and clarity improve outcomes under pressure.",
  Diplomacy: "Dialogue and coalition-building unlock durable progress.",
};

const challengeByDomain: Record<string, string> = {
  Science: "limited research funding, weak lab infrastructure, and underrepresentation",
  Technology: "technology access gaps, trust barriers, and scaling constraints",
  Engineering: "infrastructure complexity, cost pressure, and delivery risk",
  Medicine: "patient safety pressure, urgent response windows, and uneven access",
  Arts: "narrative stereotypes, distribution barriers, and visibility gaps",
  Invention: "prototype risk, limited manufacturing pathways, and adoption friction",
  Leadership: "institutional resistance, policy delays, and fragmented coordination",
  Economics: "resource constraints, governance friction, and inclusion trade-offs",
  Education: "uneven learning access, quality gaps, and teacher support limits",
  Sustainability: "long timelines, climate uncertainty, and local capacity constraints",
  Civic: "public distrust, participation fatigue, and accountability pushback",
  Strategy: "fast-changing conditions, uncertainty, and high-stakes decisions",
  Diplomacy: "competing interests, trust deficits, and difficult negotiations",
};

const methodByDomain: Record<string, string> = {
  Science: "building evidence, publishing insights, and mentoring younger researchers",
  Technology: "iterating products, listening to users, and forming capable teams",
  Engineering: "designing robust systems, testing continuously, and improving execution discipline",
  Medicine: "combining clinical rigor, public communication, and service redesign",
  Arts: "crafting compelling narratives and connecting culture to social learning",
  Invention: "prototyping, validating quickly, and refining for practical adoption",
  Leadership: "aligning people around clear goals and creating durable structures",
  Economics: "using policy tools, transparent systems, and long-horizon planning",
  Education: "teaching, institution-building, and practical curriculum development",
  Sustainability: "mobilizing communities and translating climate goals into local action",
  Civic: "organizing collective voice and sustaining participation over time",
  Strategy: "scenario planning, disciplined priorities, and adaptive execution",
  Diplomacy: "patient negotiation and coalition-building across diverse stakeholders",
};

const legacyByFocus: Record<StoryHeritageFocus, string> = {
  nigerian:
    "The profile is prioritized in Daraverse to give Nigerian learners stronger mirrors of possibility, especially for girls and young women.",
  african:
    "The profile is prioritized to strengthen African-centered examples of excellence, agency, and long-term positive influence.",
  global_african_descent:
    "The profile extends African-descent impact across the world and shows how heritage-linked leadership can shape global systems.",
  global:
    "The profile broadens the library with global reference points that complement Nigerian and African-centered leadership stories.",
};

const contextByFocus: Record<StoryHeritageFocus, string> = {
  nigerian:
    "The profile is framed with direct relevance for Nigerian learners who are building confidence in local problem-solving, institution-building, and long-term leadership responsibility.",
  african:
    "The profile is framed as an African-centered example of positive influence, showing how continental leadership can respond to structural constraints with strategy and discipline.",
  global_african_descent:
    "The profile is framed to show how African-descent excellence has shaped global systems while still carrying cultural memory, representation value, and community-focused responsibility.",
  global:
    "The profile is framed as a global benchmark that complements African and Nigerian examples, helping learners compare methods across different institutional and cultural contexts.",
};

const executionDetailByDomain: Record<string, string> = {
  Science:
    "turning questions into evidence pathways, validating results rigorously, and translating findings into decisions people can trust",
  Technology:
    "designing user-centered systems, shipping iterative improvements, and using real feedback to strengthen reliability and adoption",
  Engineering:
    "converting abstract ideas into robust operating systems, balancing cost and quality, and maintaining technical performance under pressure",
  Medicine:
    "combining clinical judgment, safety standards, and communication discipline so interventions remain effective in high-risk environments",
  Arts:
    "shaping narrative, identity, and public imagination through craft quality, cultural relevance, and sustained audience engagement",
  Invention:
    "prototyping quickly, learning from failure cycles, and refining products until they become useful, accessible, and trusted",
  Leadership:
    "aligning teams around a shared mission, clarifying roles, and institutionalizing standards that outlive one individual",
  Economics:
    "building transparent systems, improving incentives, and linking policy execution to practical improvements in livelihoods",
  Education:
    "creating learning pathways, mentoring at scale, and strengthening institutions that multiply opportunity across generations",
  Sustainability:
    "moving from awareness to implementation through local partnerships, measurable targets, and durable stewardship practices",
  Civic:
    "organizing people around accountability, translating public voice into action, and defending participation over time",
  Strategy:
    "prioritizing the right battles, sequencing action carefully, and adapting plans without losing core purpose",
  Diplomacy:
    "building coalitions across competing interests, sustaining dialogue, and converting negotiation into workable commitments",
};

const institutionLeverByDomain: Record<string, string> = {
  Science: "research communities, data culture, peer review, and learner pipelines",
  Technology: "product teams, deployment standards, and platform governance",
  Engineering: "design systems, quality assurance routines, and delivery operations",
  Medicine: "care protocols, public health trust, and service coordination models",
  Arts: "creative communities, distribution channels, and culture-shaping platforms",
  Invention: "prototype labs, manufacturing pathways, and user adoption loops",
  Leadership: "decision frameworks, accountability structures, and talent systems",
  Economics: "public finance processes, market access tools, and policy feedback loops",
  Education: "curriculum systems, teacher support networks, and learning access channels",
  Sustainability: "community coalitions, long-horizon planning, and resilience metrics",
  Civic: "grassroots networks, advocacy institutions, and rights-based accountability",
  Strategy: "scenario planning tools, priority matrices, and execution checkpoints",
  Diplomacy: "multilateral forums, negotiation channels, and trust-repair mechanisms",
};

const outcomeSignalByDomain: Record<string, string> = {
  Science:
    "stronger evidence-led decision making, better research confidence, and clearer pathways for the next generation of investigators",
  Technology:
    "wider digital inclusion, improved service quality, and stronger confidence in locally relevant technology solutions",
  Engineering:
    "more resilient infrastructure, safer operations, and higher execution standards across complex delivery environments",
  Medicine:
    "improved health outcomes, better patient trust, and stronger prevention or response capacity in critical moments",
  Arts:
    "deeper public reflection, broader representation, and narratives that shift culture toward dignity and possibility",
  Invention:
    "practical tools that solve real constraints, stronger local production confidence, and repeatable innovation habits",
  Leadership:
    "more effective institutions, better coordinated teams, and higher accountability for public or organizational outcomes",
  Economics:
    "more inclusive growth conditions, stronger policy credibility, and better alignment between resources and social priorities",
  Education:
    "expanded learning access, improved capability pipelines, and compounding intergenerational opportunity",
  Sustainability:
    "stronger local resilience, more credible climate action, and shared ownership of long-term environmental outcomes",
  Civic:
    "deeper civic participation, stronger rights awareness, and greater pressure for transparent public service",
  Strategy:
    "clearer decisions under uncertainty, stronger prioritization discipline, and better long-term positioning",
  Diplomacy:
    "reduced conflict risk, stronger cooperative outcomes, and institutional trust that supports stability",
};

const skillStackByDomain: Record<string, string> = {
  Science: "inquiry design, disciplined observation, and evidence communication",
  Technology: "product thinking, iteration cadence, and user empathy",
  Engineering: "systems design, constraint management, and operational precision",
  Medicine: "diagnostic reasoning, risk triage, and patient-centered communication",
  Arts: "creative expression, narrative structure, and audience insight",
  Invention: "prototype mindset, testing discipline, and practical refinement",
  Leadership: "mission clarity, team alignment, and governance discipline",
  Economics: "resource allocation, policy analysis, and accountability tracking",
  Education: "teaching craft, curriculum design, and mentorship structure",
  Sustainability: "ecosystem thinking, community mobilization, and long-horizon planning",
  Civic: "organizing strategy, rights literacy, and collective action design",
  Strategy: "problem framing, option evaluation, and adaptive planning",
  Diplomacy: "listening depth, negotiation craft, and coalition stewardship",
};

const storySeeds: StorySeed[] = [
  ["funmilayo-ransome-kuti", "Funmilayo Ransome-Kuti", "female", "Nigeria", "nigerian", "Leadership", "Education", "women-led civic reform"],
  ["dora-akunyili", "Dora Akunyili", "female", "Nigeria", "nigerian", "Medicine", "Leadership", "medicine safety and public trust"],
  ["stella-adadevoh", "Stella Adadevoh", "female", "Nigeria", "nigerian", "Medicine", "Leadership", "emergency outbreak containment"],
  ["ngozi-okonjo-iweala", "Ngozi Okonjo-Iweala", "female", "Nigeria", "nigerian", "Economics", "Leadership", "transparent economic governance"],
  ["amina-j-mohammed", "Amina J. Mohammed", "female", "Nigeria", "nigerian", "Leadership", "Sustainability", "global development partnerships"],
  ["grace-alele-williams", "Grace Alele-Williams", "female", "Nigeria", "nigerian", "Science", "Education", "mathematics leadership and access"],
  ["ladi-kwali", "Ladi Kwali", "female", "Nigeria", "nigerian", "Arts", "Invention", "modernized heritage craft"],
  ["chimamanda-adichie", "Chimamanda Ngozi Adichie", "female", "Nigeria", "nigerian", "Arts", "Leadership", "narrative equity in literature"],
  ["nnedi-okorafor", "Nnedi Okorafor", "female", "Nigeria", "nigerian", "Arts", "Science", "african futures storytelling"],
  ["oby-ezekwesili", "Oby Ezekwesili", "female", "Nigeria", "nigerian", "Leadership", "Economics", "governance accountability"],
  ["olufunmilayo-olopade", "Olufunmilayo Olopade", "female", "Nigeria", "nigerian", "Medicine", "Science", "precision oncology inclusion"],
  ["christianah-adeyeye", "Christianah Adeyeye", "female", "Nigeria", "nigerian", "Medicine", "Science", "pharmaceutical quality standards"],
  ["francisca-okeke", "Francisca Nneka Okeke", "female", "Nigeria", "nigerian", "Science", "Education", "physics mentorship pathways"],
  ["ola-orekunrin", "Ola Orekunrin", "female", "Nigeria", "nigerian", "Medicine", "Invention", "faster emergency care models"],
  ["temie-giwa-tubosun", "Temie Giwa-Tubosun", "female", "Nigeria", "nigerian", "Medicine", "Technology", "health logistics innovation"],
  ["mo-abudu", "Mo Abudu", "female", "Nigeria", "nigerian", "Arts", "Leadership", "global african media platforms"],
  ["ifeoma-fafunwa", "Ifeoma Fafunwa", "female", "Nigeria", "nigerian", "Arts", "Civic", "community theatre for social change"],
  ["joke-silva", "Joke Silva", "female", "Nigeria", "nigerian", "Arts", "Education", "creative industry mentorship"],
  ["onyeka-onwenu", "Onyeka Onwenu", "female", "Nigeria", "nigerian", "Arts", "Leadership", "music and civic storytelling"],
  ["nike-davies-okundaye", "Nike Davies-Okundaye", "female", "Nigeria", "nigerian", "Arts", "Education", "textile heritage enterprise"],
  ["hafsat-abiola", "Hafsat Abiola", "female", "Nigeria", "nigerian", "Leadership", "Education", "youth civic leadership"],
  ["kudirat-abiola", "Kudirat Abiola", "female", "Nigeria", "nigerian", "Leadership", "Civic", "democracy resilience"],
  ["margaret-ekpo", "Margaret Ekpo", "female", "Nigeria", "nigerian", "Leadership", "Civic", "women political representation"],
  ["gambo-sawaba", "Gambo Sawaba", "female", "Nigeria", "nigerian", "Leadership", "Civic", "social inclusion advocacy"],
  ["queen-amina-zazzau", "Queen Amina of Zazzau", "female", "Nigeria", "nigerian", "Leadership", "Strategy", "historical strategic governance"],
  ["ndidi-nwuneli", "Ndidi Nwuneli", "female", "Nigeria", "nigerian", "Leadership", "Invention", "social enterprise growth"],
  ["genevieve-nnaji", "Genevieve Nnaji", "female", "Nigeria", "nigerian", "Arts", "Leadership", "global nollywood visibility"],
  ["tara-fela-durotoye", "Tara Fela-Durotoye", "female", "Nigeria", "nigerian", "Invention", "Leadership", "beauty entrepreneurship systems"],
  ["adenike-oladosu", "Adenike Oladosu", "female", "Nigeria", "nigerian", "Sustainability", "Leadership", "youth climate action"],
  ["bolanle-olukanni", "Bolanle Olukanni", "female", "Nigeria", "nigerian", "Arts", "Civic", "media for social impact"],

  ["wole-soyinka", "Wole Soyinka", "male", "Nigeria", "nigerian", "Arts", "Leadership", "literature and freedom advocacy"],
  ["chinua-achebe", "Chinua Achebe", "male", "Nigeria", "nigerian", "Arts", "Education", "african narrative reframing"],
  ["fela-kuti", "Fela Kuti", "male", "Nigeria", "nigerian", "Arts", "Civic", "music-driven accountability culture"],
  ["ben-enwonwu", "Ben Enwonwu", "male", "Nigeria", "nigerian", "Arts", "Leadership", "modern african sculpture"],
  ["philip-emeagwali", "Philip Emeagwali", "male", "Nigeria", "nigerian", "Science", "Technology", "large-scale computing inspiration"],
  ["jelani-aliyu", "Jelani Aliyu", "male", "Nigeria", "nigerian", "Engineering", "Invention", "automotive industrial design"],
  ["bart-nnaji", "Bart Nnaji", "male", "Nigeria", "nigerian", "Engineering", "Leadership", "infrastructure engineering systems"],
  ["olikoye-ransome-kuti", "Olikoye Ransome-Kuti", "male", "Nigeria", "nigerian", "Medicine", "Leadership", "child and maternal health policy"],
  ["beko-ransome-kuti", "Beko Ransome-Kuti", "male", "Nigeria", "nigerian", "Leadership", "Civic", "human rights defense"],
  ["akinwumi-adesina", "Akinwumi Adesina", "male", "Nigeria", "nigerian", "Economics", "Leadership", "agricultural transformation finance"],
  ["nnamdi-azikiwe", "Nnamdi Azikiwe", "male", "Nigeria", "nigerian", "Leadership", "Education", "nation-building institutions"],
  ["herbert-macaulay", "Herbert Macaulay", "male", "Nigeria", "nigerian", "Leadership", "Civic", "organized nationalist politics"],
  ["obafemi-awolowo", "Obafemi Awolowo", "male", "Nigeria", "nigerian", "Leadership", "Education", "education-focused governance"],
  ["ken-saro-wiwa", "Ken Saro-Wiwa", "male", "Nigeria", "nigerian", "Leadership", "Sustainability", "environmental justice advocacy"],
  ["silas-adekunle", "Silas Adekunle", "male", "Nigeria", "nigerian", "Technology", "Invention", "robotics entrepreneurship"],
  ["iyinoluwa-aboyeji", "Iyinoluwa Aboyeji", "male", "Nigeria", "nigerian", "Technology", "Leadership", "digital access platforms"],
  ["tony-elumelu", "Tony Elumelu", "male", "Nigeria", "nigerian", "Economics", "Leadership", "entrepreneurship financing"],
  ["innocent-chukwuma", "Innocent Chukwuma", "male", "Nigeria", "nigerian", "Engineering", "Invention", "local vehicle manufacturing"],
  ["kunle-olukotun", "Kunle Olukotun", "male", "Nigeria", "nigerian", "Science", "Technology", "parallel computing architecture"],
  ["samuel-ajayi-crowther", "Samuel Ajayi Crowther", "male", "Nigeria", "nigerian", "Education", "Arts", "language and literacy access"],

  ["wangari-maathai", "Wangari Maathai", "female", "Kenya", "african", "Sustainability", "Leadership", "community climate restoration"],
  ["ellen-johnson-sirleaf", "Ellen Johnson Sirleaf", "female", "Liberia", "african", "Leadership", "Economics", "post-conflict institutional rebuilding"],
  ["leymah-gbowee", "Leymah Gbowee", "female", "Liberia", "african", "Leadership", "Civic", "women-led peace coalitions"],
  ["graca-machel", "Graca Machel", "female", "Mozambique", "african", "Leadership", "Education", "child rights policy"],
  ["miriam-makeba", "Miriam Makeba", "female", "South Africa", "african", "Arts", "Leadership", "music for justice advocacy"],
  ["ama-ata-aidoo", "Ama Ata Aidoo", "female", "Ghana", "african", "Arts", "Education", "african feminist literature"],
  ["yaa-asantewaa", "Yaa Asantewaa", "female", "Ghana", "african", "Leadership", "Strategy", "historical resistance leadership"],
  ["queen-nzinga", "Queen Nzinga", "female", "Angola", "african", "Leadership", "Strategy", "diplomatic state defense"],
  ["fatima-al-fihri", "Fatima al-Fihri", "female", "Morocco", "african", "Education", "Leadership", "long-running learning institutions"],
  ["sameera-moussa", "Sameera Moussa", "female", "Egypt", "african", "Science", "Medicine", "atomic science for health applications"],
  ["nawal-el-saadawi", "Nawal El Saadawi", "female", "Egypt", "african", "Arts", "Leadership", "rights-centered writing"],
  ["quarraisha-abdool-karim", "Quarraisha Abdool Karim", "female", "South Africa", "african", "Science", "Medicine", "hiv prevention research"],
  ["tebello-nyokong", "Tebello Nyokong", "female", "South Africa", "african", "Science", "Medicine", "photochemistry for health tools"],
  ["raja-cherkaoui", "Raja Cherkaoui El Moursli", "female", "Morocco", "african", "Science", "Education", "physics research leadership"],
  ["juliana-rotich", "Juliana Rotich", "female", "Kenya", "african", "Technology", "Leadership", "civic crisis-mapping platforms"],
  ["bethlehem-alemu", "Bethlehem Tilahun Alemu", "female", "Ethiopia", "african", "Invention", "Leadership", "ethical manufacturing models"],
  ["agnes-kalibata", "Agnes Kalibata", "female", "Rwanda", "african", "Economics", "Leadership", "food system transformation"],
  ["nadine-gordimer", "Nadine Gordimer", "female", "South Africa", "african", "Arts", "Civic", "literature against injustice"],
  ["lupita-nyongo", "Lupita Nyongo", "female", "Kenya", "african", "Arts", "Leadership", "screen representation and identity"],
  ["wanjira-mathai", "Wanjira Mathai", "female", "Kenya", "african", "Sustainability", "Leadership", "youth climate partnerships"],

  ["nelson-mandela", "Nelson Mandela", "male", "South Africa", "african", "Leadership", "Civic", "reconciliation-led nation building"],
  ["desmond-tutu", "Desmond Tutu", "male", "South Africa", "african", "Leadership", "Civic", "restorative justice advocacy"],
  ["kofi-annan", "Kofi Annan", "male", "Ghana", "african", "Leadership", "Diplomacy", "multilateral peace coordination"],
  ["thomas-sankara", "Thomas Sankara", "male", "Burkina Faso", "african", "Leadership", "Economics", "self-reliance policy reforms"],
  ["kwame-nkrumah", "Kwame Nkrumah", "male", "Ghana", "african", "Leadership", "Education", "pan-african institution building"],
  ["julius-nyerere", "Julius Nyerere", "male", "Tanzania", "african", "Leadership", "Education", "literacy and nation planning"],
  ["patrice-lumumba", "Patrice Lumumba", "male", "Democratic Republic of the Congo", "african", "Leadership", "Civic", "sovereignty and civic courage"],
  ["cheikh-anta-diop", "Cheikh Anta Diop", "male", "Senegal", "african", "Science", "Arts", "interdisciplinary african scholarship"],
  ["mo-ibrahim", "Mo Ibrahim", "male", "Sudan", "african", "Technology", "Leadership", "governance performance metrics"],
  ["strive-masiyiwa", "Strive Masiyiwa", "male", "Zimbabwe", "african", "Technology", "Leadership", "telecom access and philanthropy"],

  ["mae-jemison", "Mae Jemison", "female", "United States", "global_african_descent", "Science", "Medicine", "space science and medicine integration"],
  ["katherine-johnson", "Katherine Johnson", "female", "United States", "global_african_descent", "Science", "Engineering", "orbital mission mathematics"],
  ["gladys-west", "Gladys West", "female", "United States", "global_african_descent", "Science", "Invention", "satellite geospatial modeling"],
  ["shirley-ann-jackson", "Shirley Ann Jackson", "female", "United States", "global_african_descent", "Science", "Technology", "telecom physics leadership"],
  ["valerie-thomas", "Valerie Thomas", "female", "United States", "global_african_descent", "Invention", "Engineering", "3d imaging systems"],
  ["patricia-bath", "Patricia Bath", "female", "United States", "global_african_descent", "Medicine", "Invention", "vision-restoring medical techniques"],
  ["toni-morrison", "Toni Morrison", "female", "United States", "global_african_descent", "Arts", "Education", "literary memory and identity"],
  ["maya-angelou", "Maya Angelou", "female", "United States", "global_african_descent", "Arts", "Leadership", "poetry and civic voice"],
  ["nina-simone", "Nina Simone", "female", "United States", "global_african_descent", "Arts", "Civic", "civil-rights music activism"],
  ["alice-walker", "Alice Walker", "female", "United States", "global_african_descent", "Arts", "Leadership", "justice-centered writing"],

  ["george-washington-carver", "George Washington Carver", "male", "United States", "global_african_descent", "Science", "Invention", "agricultural chemistry innovation"],
  ["granville-woods", "Granville Woods", "male", "United States", "global_african_descent", "Invention", "Engineering", "rail and electrical safety systems"],
  ["lewis-latimer", "Lewis Latimer", "male", "United States", "global_african_descent", "Invention", "Engineering", "electric lighting improvements"],
  ["mark-dean", "Mark Dean", "male", "United States", "global_african_descent", "Technology", "Engineering", "personal computing architecture"],
  ["james-west", "James West", "male", "United States", "global_african_descent", "Invention", "Science", "microphone technology foundations"],

  ["marie-curie", "Marie Curie", "female", "Poland and France", "global", "Science", "Medicine", "radioactivity and medical science"],
  ["ada-lovelace", "Ada Lovelace", "female", "United Kingdom", "global", "Science", "Technology", "early computing theory"],
  ["hedy-lamarr", "Hedy Lamarr", "female", "Austria and United States", "global", "Invention", "Technology", "wireless communication concepts"],
  ["rosalind-franklin", "Rosalind Franklin", "female", "United Kingdom", "global", "Science", "Medicine", "molecular imaging evidence"],
  ["tu-youyou", "Tu Youyou", "female", "China", "global", "Medicine", "Science", "anti-malarial treatment breakthroughs"],
];

function hashString(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function seededShuffle<T>(items: T[], seed: number) {
  const arr = [...items];
  let s = seed || 1;
  for (let i = arr.length - 1; i > 0; i -= 1) {
    s = (s * 1664525 + 1013904223) >>> 0;
    const j = s % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function buildOptions(correct: string, pool: string[], seed: number) {
  const uniquePool = Array.from(
    new Set(pool.filter((item) => item !== correct && item.trim().length > 0)),
  );
  const distractors = seededShuffle(uniquePool, seed).slice(0, 3);
  const options = seededShuffle([correct, ...distractors], seed + 97);
  return {
    options,
    correctOptionIndex: options.findIndex((option) => option === correct),
  };
}

function deriveContribution(domainA: string, domainB: string, signature: string) {
  return `used ${domainA.toLowerCase()} and ${domainB.toLowerCase()} practice to advance ${signature}`;
}

function deriveImpact(domainA: string, signature: string) {
  return `expanded positive influence in ${domainA.toLowerCase()} through ${signature}`;
}

function deriveLesson(domainA: string, domainB: string) {
  return (
    lessonByDomain[domainA] ??
    lessonByDomain[domainB] ??
    "Purpose-driven work creates lasting impact."
  );
}

function toStory(seed: StorySeed): Omit<MentorshipStory, "triviaPool"> {
  const [id, name, gender, origin, heritageFocus, domainA, domainB, signature] = seed;
  const domains = [domainA, domainB];
  const pronounSubject = gender === "female" ? "she" : "he";
  const pronounObject = gender === "female" ? "her" : "him";
  const pronounPossessive = gender === "female" ? "her" : "his";
  const contribution = deriveContribution(domainA, domainB, signature);
  const impact = deriveImpact(domainA, signature);
  const lesson = deriveLesson(domainA, domainB);
  const challengeA = challengeByDomain[domainA] ?? "resource limits and institutional resistance";
  const challengeB = challengeByDomain[domainB] ?? "resource limits and institutional resistance";
  const methodA = methodByDomain[domainA] ?? "consistent execution and practical collaboration";
  const methodB = methodByDomain[domainB] ?? "consistent execution and practical collaboration";
  const executionA =
    executionDetailByDomain[domainA] ??
    "clear priorities, practical execution, and steady quality control";
  const executionB =
    executionDetailByDomain[domainB] ??
    "clear priorities, practical execution, and steady quality control";
  const institutionA =
    institutionLeverByDomain[domainA] ?? "institutional memory, team routines, and accountability";
  const institutionB =
    institutionLeverByDomain[domainB] ?? "institutional memory, team routines, and accountability";
  const outcomeA =
    outcomeSignalByDomain[domainA] ??
    "stronger systems, better trust, and more pathways for future contributors";
  const outcomeB =
    outcomeSignalByDomain[domainB] ??
    "stronger systems, better trust, and more pathways for future contributors";
  const skillA =
    skillStackByDomain[domainA] ?? "discipline, communication, and consistent follow-through";
  const skillB =
    skillStackByDomain[domainB] ?? "discipline, communication, and consistent follow-through";
  const focusContext = contextByFocus[heritageFocus];
  const storySeed = hashString(id);
  const growthPattern =
    storySeed % 2 === 0
      ? "steady compounding through disciplined repetition"
      : "iterative growth through experimentation, feedback, and adaptation";
  const pressurePattern =
    storySeed % 3 === 0
      ? "public scrutiny and low tolerance for error"
      : storySeed % 3 === 1
        ? "resource pressure and institutional inertia"
        : "high expectations with complex coordination demands";
  const missionCadence =
    storySeed % 2 === 0
      ? "a seven-day prototype plus a twenty-one-day refinement cycle"
      : "a thirty-day mission with weekly checkpoints and visible deliverables";
  const title = `${name}: Positive Change Through ${domainA}`;
  const shortBlurb = `${name} (${origin}) is featured with ${heritageLabel[heritageFocus].toLowerCase()} emphasis across ${domainA} and ${domainB}. This long-form profile covers formation, defining constraints, execution strategy, institutional impact, and practical lessons learners can apply immediately.`;
  const storyParagraphs = [
    `Profile overview: ${name} is included because ${pronounSubject} ${contribution}. In this mentorship narrative, ${pronounPossessive} life and work are treated as a full leadership case study rather than a short biography note. The emphasis is on how expertise in ${domainA} and ${domainB} was translated into durable public value through decisions, routines, and measurable follow-through. The signature focus on ${signature} is presented as the central through-line that shaped priorities, partnerships, and long-term direction.`,
    `Formative context: The profile places ${name}'s journey in ${origin}, where progress in high-impact fields often required navigating social expectations, uneven access to resources, and high pressure to produce visible results. Instead of separating personal excellence from community relevance, this story shows how both dimensions reinforced each other. ${name} built influence by taking local realities seriously and designing work that could survive beyond one moment or one role. That framing helps learners see impact as a process built across seasons, not a single breakthrough.`,
    `Challenge analysis: A persistent obstacle in ${name}'s pathway was ${challengeA}, while the cross-domain expansion into ${domainB} added related pressure around ${challengeB}. These are the same types of constraints many young innovators face today: limited support, unclear systems, and skepticism about new approaches. The story explains that the critical move was not waiting for perfect conditions, but building momentum with practical actions that reduced risk and increased trust. This transformed constraint into a design parameter rather than a stopping point.`,
    `Execution model: In ${domainA}, ${name} drove progress by ${methodA}. In ${domainB}, ${pronounSubject} reinforced the work by ${methodB}. The detailed execution pattern includes ${executionA} together with ${executionB}, creating a bridge between vision and operations. This section is intentionally explicit so learners can identify repeatable methods: define a problem clearly, set quality thresholds early, communicate decisions transparently, and review outcomes consistently.`,
    `Capability stack: The profile also explains the skill architecture behind the outcomes. For ${domainA}, the key capabilities were ${skillA}. For ${domainB}, the capabilities were ${skillB}. The story emphasizes that skill growth came from deliberate practice, not only talent, and that credibility increased each time ${name} delivered on commitments under real constraints. Over time, peers, institutions, and communities trusted ${pronounObject} with more responsibility because execution quality remained consistent.`,
    `Setbacks/turning points: Like most high-impact careers, this path included stalled initiatives, resistance to change, and moments where progress looked uncertain. The narrative does not hide those periods; it uses them to show decision quality under pressure, including ${pressurePattern}. What matters most is that ${name} stayed mission-aligned, adjusted tactics without losing purpose, and treated feedback as operational data. This section is designed to normalize setbacks as part of meaningful growth rather than proof of failure.`,
    `Institution building: Beyond personal achievement, ${name} strengthened the systems around the work. In practical terms, this involved improving ${institutionA} and reinforcing ${institutionB}. That systems focus is why the profile is categorized as world-shaping: impact was embedded in teams, processes, and structures that could continue after immediate projects ended. Learners can see that lasting influence depends on institution quality as much as individual visibility.`,
    `Outcome depth: The cumulative effect of ${name}'s work was not abstract recognition alone. In ${domainA}, the pattern created ${outcomeA}. In ${domainB}, the spillover produced ${outcomeB}. This is the practical meaning of impact in Daraverse: stronger trust, broader participation, better standards, and more pathways for others to enter and contribute. In short, ${name}'s contribution ${impact}, and the benefits were designed to compound over time.`,
    `Prioritization rationale: ${legacyByFocus[heritageFocus]} ${focusContext} This section directly supports the product goal of placing greater emphasis on women, African-descent contributors, and especially Nigerian-descent role models. The narrative is therefore both historical and strategic: it helps learners identify role models who are aspirational, culturally relevant, and instructionally useful.`,
    `Mentorship translation: The practical playbook for learners is to copy process, not personality. Start with one clear problem in your school, neighborhood, or team. Apply ${growthPattern} by setting a concrete objective, selecting two measurable indicators, and building a weekly review rhythm. Then combine one ${domainA} habit and one ${domainB} habit from this story to create your own execution routine. Core lesson: ${lesson}`,
    `Daraverse mission link: To use this profile in-game, run ${missionCadence}. Week one should focus on problem framing and stakeholder mapping. The middle phase should focus on iterative delivery and quality checks, and the final phase should focus on documenting impact and teaching one younger learner what worked. This structure mirrors how ${name} converted intention into durable progress and turns inspiration into accountable action.`,
    `Reflection prompt: If you were mentoring a younger student with ${name}'s example, what exact standard would you ask them to uphold first, how would you track it weekly, and what evidence would prove growth after thirty days?`,
  ];

  return {
    id,
    name,
    gender,
    origin,
    heritageFocus,
    domains,
    signature,
    contribution,
    impact,
    lesson,
    title,
    shortBlurb,
    storyParagraphs,
  };
}

function createTriviaPool(
  story: Omit<MentorshipStory, "triviaPool">,
  allStories: Array<Omit<MentorshipStory, "triviaPool">>,
): MentorshipStoryTriviaQuestion[] {
  const namePool = allStories.map((entry) => entry.name);
  const originPool = allStories.map((entry) => entry.origin);
  const domainPool = Array.from(new Set(allStories.flatMap((entry) => entry.domains)));
  const contributionPool = allStories.map((entry) => entry.contribution);
  const impactPool = allStories.map((entry) => entry.impact);
  const lessonPool = allStories.map((entry) => entry.lesson);
  const heritagePool = Object.values(heritageLabel);

  const questions: MentorshipStoryTriviaQuestion[] = [];

  for (let round = 0; round < 5; round += 1) {
    const seed = hashString(`${story.id}-${round}`);

    const q1 = buildOptions(story.name, namePool, seed + 1);
    questions.push({
      id: `${story.id}-q-${round * 10 + 1}`,
      prompt: "Who is the focus of this story profile?",
      options: q1.options,
      correctOptionIndex: q1.correctOptionIndex,
      explanation: `${story.name} is the featured figure in this story.`,
    });

    const q2 = buildOptions(story.origin, originPool, seed + 2);
    questions.push({
      id: `${story.id}-q-${round * 10 + 2}`,
      prompt: `What origin is associated with ${story.name} in this profile?`,
      options: q2.options,
      correctOptionIndex: q2.correctOptionIndex,
      explanation: `This profile places ${story.name}'s story in ${story.origin}.`,
    });

    const q3 = buildOptions(story.domains[0], domainPool, seed + 3);
    questions.push({
      id: `${story.id}-q-${round * 10 + 3}`,
      prompt: "Which primary domain is highlighted first in this story?",
      options: q3.options,
      correctOptionIndex: q3.correctOptionIndex,
      explanation: `${story.domains[0]} is the lead domain in this profile.`,
    });

    const q4 = buildOptions(story.domains[1], domainPool, seed + 4);
    questions.push({
      id: `${story.id}-q-${round * 10 + 4}`,
      prompt: "Which secondary domain is paired with the profile?",
      options: q4.options,
      correctOptionIndex: q4.correctOptionIndex,
      explanation: `${story.domains[1]} is paired with ${story.domains[0]} here.`,
    });

    const q5 = buildOptions(story.contribution, contributionPool, seed + 5);
    questions.push({
      id: `${story.id}-q-${round * 10 + 5}`,
      prompt: "What contribution statement matches this story?",
      options: q5.options,
      correctOptionIndex: q5.correctOptionIndex,
      explanation: `Correct contribution: ${story.contribution}.`,
    });

    const q6 = buildOptions(story.impact, impactPool, seed + 6);
    questions.push({
      id: `${story.id}-q-${round * 10 + 6}`,
      prompt: "Which impact statement is linked to this profile?",
      options: q6.options,
      correctOptionIndex: q6.correctOptionIndex,
      explanation: `Profile impact: ${story.impact}.`,
    });

    const q7 = buildOptions(story.lesson, lessonPool, seed + 7);
    questions.push({
      id: `${story.id}-q-${round * 10 + 7}`,
      prompt: "What mentorship takeaway does this story emphasize?",
      options: q7.options,
      correctOptionIndex: q7.correctOptionIndex,
      explanation: `Story takeaway: ${story.lesson}`,
    });

    const q8 = buildOptions(heritageLabel[story.heritageFocus], heritagePool, seed + 8);
    questions.push({
      id: `${story.id}-q-${round * 10 + 8}`,
      prompt: "What priority focus category is assigned to this story?",
      options: q8.options,
      correctOptionIndex: q8.correctOptionIndex,
      explanation: `This story is tagged as ${heritageLabel[story.heritageFocus].toLowerCase()}.`,
    });

    const pairCorrect = `${story.domains[0]} + ${story.domains[1]}`;
    const pairPool = allStories.map((entry) => `${entry.domains[0]} + ${entry.domains[1]}`);
    const q9 = buildOptions(pairCorrect, pairPool, seed + 9);
    questions.push({
      id: `${story.id}-q-${round * 10 + 9}`,
      prompt: "Which domain pair matches this profile?",
      options: q9.options,
      correctOptionIndex: q9.correctOptionIndex,
      explanation: `This profile pairs ${pairCorrect}.`,
    });

    const recapCorrect = `${story.name} from ${story.origin} is recognized for ${story.signature}.`;
    const recapPool = allStories.map(
      (entry) => `${entry.name} from ${entry.origin} is recognized for ${entry.signature}.`,
    );
    const q10 = buildOptions(recapCorrect, recapPool, seed + 10);
    questions.push({
      id: `${story.id}-q-${round * 10 + 10}`,
      prompt: "Which recap sentence accurately matches this story?",
      options: q10.options,
      correctOptionIndex: q10.correctOptionIndex,
      explanation: recapCorrect,
    });
  }

  return questions;
}

const storyCoreCatalog = storySeeds.map(toStory);

export const mentorshipStoryCatalog: MentorshipStory[] = storyCoreCatalog.map((story) => ({
  ...story,
  imageUrl: mentorshipStoryImageById[story.id]?.imageUrl,
  imageSourceUrl: mentorshipStoryImageById[story.id]?.sourceUrl,
  imageSourceTitle: mentorshipStoryImageById[story.id]?.sourceTitle,
  triviaPool: createTriviaPool(story, storyCoreCatalog),
}));

const storyById = mentorshipStoryCatalog.reduce<Record<string, MentorshipStory>>((acc, story) => {
  acc[story.id] = story;
  return acc;
}, {});

export function getMentorshipStoryById(storyId: string) {
  return storyById[storyId];
}

export function getMentorshipStoryCounts() {
  return {
    total: mentorshipStoryCatalog.length,
    female: mentorshipStoryCatalog.filter((story) => story.gender === "female").length,
    nigerian: mentorshipStoryCatalog.filter((story) => story.heritageFocus === "nigerian").length,
    africanFocus: mentorshipStoryCatalog.filter(
      (story) =>
        story.heritageFocus === "nigerian" ||
        story.heritageFocus === "african" ||
        story.heritageFocus === "global_african_descent",
    ).length,
  };
}
