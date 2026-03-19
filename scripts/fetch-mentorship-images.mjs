import { readFile, writeFile } from "node:fs/promises";

const SOURCE_PATH = "src/data/mentorshipStories.ts";
const OUTPUT_PATH = "src/data/mentorshipStoryImages.ts";

/**
 * @typedef {Object} StorySeed
 * @property {string} id
 * @property {string} name
 * @property {"female"|"male"} gender
 * @property {string} origin
 * @property {string} heritageFocus
 * @property {string} domainA
 * @property {string} domainB
 * @property {string} signature
 */

function normalize(value) {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeTsString(value) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/"/g, "\\\"");
}

function splitTokens(value) {
  return normalize(value)
    .split(" ")
    .filter((part) => part.length > 2);
}

async function fetchJson(url, retries = 4) {
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    let timeout;
    try {
      const controller = new AbortController();
      timeout = setTimeout(() => controller.abort(), 12_000);
      const response = await fetch(url, {
        headers: {
          "user-agent": "DaraverseMentorshipImageFetcher/1.0 (educational app)",
          accept: "application/json",
        },
        signal: controller.signal,
      });
      if (!response.ok) {
        if (response.status === 429 && attempt < retries) {
          const retryDelay = 900 * (attempt + 1);
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
          continue;
        }
        throw new Error(`HTTP ${response.status} for ${url}`);
      }
      return await response.json();
    } catch (error) {
      lastError = error;
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, 250 * (attempt + 1)));
      }
    } finally {
      clearTimeout(timeout);
    }
  }
  throw lastError;
}

/**
 * @param {string} sourceText
 * @returns {StorySeed[]}
 */
function parseSeeds(sourceText) {
  const blockStart = sourceText.indexOf("const storySeeds: StorySeed[] = [");
  if (blockStart < 0) {
    throw new Error("Could not find storySeeds declaration.");
  }
  const listStart = sourceText.indexOf("[", blockStart);
  const listEnd = sourceText.indexOf("\n];", listStart);
  if (listStart < 0 || listEnd < 0) {
    throw new Error("Could not parse storySeeds list boundaries.");
  }

  const block = sourceText.slice(listStart, listEnd);
  const entryPattern = /\[\s*"([^"]+)",\s*"([^"]+)",\s*"(female|male)",\s*"([^"]+)",\s*"([^"]+)",\s*"([^"]+)",\s*"([^"]+)",\s*"([^"]+)"\s*\]/g;

  /** @type {StorySeed[]} */
  const seeds = [];
  let match = entryPattern.exec(block);
  while (match) {
    seeds.push({
      id: match[1],
      name: match[2],
      gender: /** @type {"female"|"male"} */ (match[3]),
      origin: match[4],
      heritageFocus: match[5],
      domainA: match[6],
      domainB: match[7],
      signature: match[8],
    });
    match = entryPattern.exec(block);
  }

  if (seeds.length < 90) {
    throw new Error(`Expected around 100 story seeds, parsed ${seeds.length}.`);
  }
  return seeds;
}

/** @typedef {{ title: string; snippet: string }} SearchHit */
/** @typedef {{ title: string; imageUrl: string | null; pageUrl: string | null; description: string; extract: string; type: string }} SummaryHit */

const searchCache = new Map();
const summaryCache = new Map();
const wikidataSearchCache = new Map();
const wikidataEntityCache = new Map();

const titleOverridesById = {
  "stella-adadevoh": ["Ameyo Adadevoh", "Stella Adadevoh"],
  "bart-nnaji": ["Barth Nnaji", "Bart Nnaji"],
  "wangari-maathai": ["Wangari Maathai", "Wangari Muta Maathai"],
  "yaa-asantewaa": ["Yaa Asantewaa"],
  "queen-nzinga": ["Nzinga of Ndongo and Matamba", "Queen Nzinga"],
  "fatima-al-fihri": ["Fatima al-Fihriya", "Fatima al-Fihri"],
  "lupita-nyongo": ["Lupita Nyong'o", "Lupita Nyongo"],
  "lewis-latimer": ["Lewis Latimer", "Lewis Howard Latimer"],
  "mark-dean": ["Mark Dean (computer scientist)", "Mark Dean"],
};

/**
 * @param {string} query
 * @returns {Promise<SearchHit[]>}
 */
async function searchWiki(query) {
  if (searchCache.has(query)) {
    return searchCache.get(query);
  }
  const url = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
    query,
  )}&srlimit=8&utf8=1&format=json`;
  const json = await fetchJson(url);
  const hits = (json?.query?.search ?? []).map((entry) => ({
    title: String(entry.title || ""),
    snippet: String(entry.snippet || ""),
  }));
  searchCache.set(query, hits);
  return hits;
}

/**
 * @param {string} title
 * @returns {Promise<SummaryHit | null>}
 */
async function getSummary(title) {
  if (summaryCache.has(title)) {
    return summaryCache.get(title);
  }
  const safeTitle = encodeURIComponent(title.replace(/ /g, "_"));
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${safeTitle}`;
  try {
    const json = await fetchJson(url);
    const hit = {
      title: String(json?.title || title),
      imageUrl: json?.originalimage?.source || json?.thumbnail?.source || null,
      pageUrl: json?.content_urls?.desktop?.page || null,
      description: String(json?.description || ""),
      extract: String(json?.extract || ""),
      type: String(json?.type || ""),
    };
    summaryCache.set(title, hit);
    return hit;
  } catch {
    summaryCache.set(title, null);
    return null;
  }
}

async function searchWikidata(query) {
  if (wikidataSearchCache.has(query)) {
    return wikidataSearchCache.get(query);
  }
  const url = `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(
    query,
  )}&language=en&limit=8&format=json&type=item`;
  const json = await fetchJson(url);
  const hits = (json?.search ?? []).map((entry) => ({
    id: String(entry.id || ""),
    label: String(entry.label || ""),
    description: String(entry.description || ""),
  }));
  wikidataSearchCache.set(query, hits);
  return hits;
}

async function getWikidataEntities(ids) {
  const uncachedIds = ids.filter((id) => !wikidataEntityCache.has(id));
  if (uncachedIds.length > 0) {
    const url = `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${encodeURIComponent(
      uncachedIds.join("|"),
    )}&props=claims|labels|descriptions|sitelinks&languages=en&format=json`;
    const json = await fetchJson(url);
    const entities = json?.entities ?? {};
    for (const id of uncachedIds) {
      wikidataEntityCache.set(id, entities[id] || null);
    }
  }
  return ids.map((id) => wikidataEntityCache.get(id)).filter(Boolean);
}

function extractWikidataImage(entity) {
  const imageClaim = entity?.claims?.P18?.[0]?.mainsnak?.datavalue?.value;
  if (!imageClaim || typeof imageClaim !== "string") {
    return null;
  }
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(imageClaim)}`;
}

function entityIsHuman(entity) {
  const p31Claims = entity?.claims?.P31 ?? [];
  return p31Claims.some((claim) => claim?.mainsnak?.datavalue?.value?.id === "Q5");
}

function scoreWikidataCandidate(seed, entity) {
  const label = String(entity?.labels?.en?.value || "");
  const description = String(entity?.descriptions?.en?.value || "").toLowerCase();
  const text = `${label} ${description}`.toLowerCase();
  const nameNorm = normalize(seed.name);
  const labelNorm = normalize(label);

  let score = 0;
  if (labelNorm === nameNorm) score += 130;
  if (labelNorm.includes(nameNorm)) score += 80;
  if (entityIsHuman(entity)) score += 40;
  if (extractWikidataImage(entity)) score += 35;

  for (const token of splitTokens(seed.name)) {
    if (labelNorm.includes(token)) score += 12;
    if (text.includes(token)) score += 5;
  }
  for (const token of splitTokens(seed.origin)) {
    if (text.includes(token)) score += 8;
  }
  if (text.includes(seed.domainA.toLowerCase())) score += 5;
  if (text.includes(seed.domainB.toLowerCase())) score += 5;

  return score;
}

async function resolveViaWikidata(seed) {
  const querySet = new Set([seed.name, `${seed.name} ${seed.origin}`]);
  const ids = new Set();
  for (const query of querySet) {
    const results = await searchWikidata(query);
    for (const hit of results.slice(0, 6)) {
      if (hit.id) ids.add(hit.id);
    }
  }
  if (ids.size === 0) {
    return null;
  }

  const entities = await getWikidataEntities(Array.from(ids));
  let best = null;
  for (const entity of entities) {
    const imageUrl = extractWikidataImage(entity);
    if (!imageUrl) continue;
    const score = scoreWikidataCandidate(seed, entity);
    const label = String(entity?.labels?.en?.value || seed.name);
    const wikiTitle = entity?.sitelinks?.enwiki?.title || label;
    const sourceUrl = `https://en.wikipedia.org/wiki/${encodeURIComponent(
      String(wikiTitle).replace(/ /g, "_"),
    )}`;
    const candidate = {
      title: label,
      imageUrl,
      sourceUrl,
      description: String(entity?.descriptions?.en?.value || ""),
      score,
    };
    if (!best || candidate.score > best.score) {
      best = candidate;
    }
  }

  if (!best || best.score < 85) {
    return null;
  }
  return best;
}

const personHints = [
  "politician",
  "writer",
  "artist",
  "scientist",
  "physicist",
  "economist",
  "doctor",
  "activist",
  "leader",
  "engineer",
  "inventor",
  "poet",
  "actress",
  "actor",
  "mathematician",
  "queen",
  "king",
  "president",
  "philosopher",
  "diplomat",
  "educator",
  "professor",
  "entrepreneur",
  "musician",
  "journalist",
];

const nonPersonHints = [
  "village",
  "city",
  "district",
  "company",
  "album",
  "song",
  "film",
  "television",
  "novel",
  "book",
  "software",
  "river",
  "constituency",
  "surname",
  "election",
  "school",
  "highway",
  "football club",
  "airport",
];

const blockedProfileHints = [
  "murderer",
  "serial killer",
  "convicted",
  "criminal",
];

/**
 * @param {StorySeed} seed
 * @param {SummaryHit} summary
 * @param {string} snippet
 */
function scoreCandidate(seed, summary, snippet) {
  const titleNorm = normalize(summary.title);
  const nameNorm = normalize(seed.name);
  const descText = `${summary.description} ${summary.extract} ${snippet}`.toLowerCase();

  const nameTokens = splitTokens(seed.name);
  const originTokens = splitTokens(seed.origin);
  const signatureTokens = splitTokens(seed.signature);
  const domainTokens = [seed.domainA.toLowerCase(), seed.domainB.toLowerCase()];

  let score = 0;

  if (titleNorm === nameNorm) score += 120;
  if (titleNorm.includes(nameNorm)) score += 80;

  for (const token of nameTokens) {
    if (titleNorm.includes(token)) score += 18;
    if (descText.includes(token)) score += 7;
  }

  for (const token of originTokens) {
    if (descText.includes(token)) score += 10;
  }

  for (const token of signatureTokens.slice(0, 4)) {
    if (descText.includes(token)) score += 5;
  }

  for (const token of domainTokens) {
    if (descText.includes(token)) score += 4;
  }

  for (const hint of personHints) {
    if (descText.includes(hint)) {
      score += 10;
      break;
    }
  }

  for (const hint of nonPersonHints) {
    if (descText.includes(hint)) {
      score -= 45;
      break;
    }
  }

  for (const hint of blockedProfileHints) {
    if (descText.includes(hint)) {
      score -= 250;
      break;
    }
  }

  if (summary.type === "disambiguation") score -= 220;
  if (descText.includes("may refer to")) score -= 180;
  if (summary.title.toLowerCase().includes("disambiguation")) score -= 200;
  if (!summary.imageUrl) score -= 95;

  const hasManyNameTokens = nameTokens.filter((token) => titleNorm.includes(token)).length;
  if (hasManyNameTokens >= Math.min(2, nameTokens.length)) score += 25;

  return score;
}

/**
 * @param {StorySeed} seed
 */
async function resolveImage(seed) {
  const overrideTitles = titleOverridesById[seed.id] ?? [];
  for (const title of overrideTitles) {
    const forced = await getSummary(title);
    if (forced?.imageUrl && forced?.pageUrl) {
      return {
        title: forced.title,
        imageUrl: forced.imageUrl,
        sourceUrl: forced.pageUrl,
        description: forced.description,
        score: 1_000,
      };
    }
  }

  const querySet = new Set([seed.name, `${seed.name} ${seed.origin}`]);

  /** @type {Array<{summary: SummaryHit, snippet: string, score: number}>} */
  const candidates = [];
  const seenTitles = new Set();

  const direct = await getSummary(seed.name);
  if (direct) {
    const directScore = scoreCandidate(seed, direct, "");
    candidates.push({ summary: direct, snippet: "", score: directScore });
    seenTitles.add(direct.title.toLowerCase());
  }

  for (const query of querySet) {
    const hits = await searchWiki(query);
    for (const hit of hits.slice(0, 3)) {
      const key = hit.title.toLowerCase();
      if (seenTitles.has(key)) continue;
      seenTitles.add(key);

      const summary = await getSummary(hit.title);
      if (!summary) continue;

      const score = scoreCandidate(seed, summary, hit.snippet);
      candidates.push({ summary, snippet: hit.snippet, score });
    }
  }

  candidates.sort((a, b) => b.score - a.score);
  const best = candidates[0];
  if (best && best.score >= 55 && best.summary.imageUrl) {
    return {
      title: best.summary.title,
      imageUrl: best.summary.imageUrl,
      sourceUrl: best.summary.pageUrl,
      description: best.summary.description,
      score: best.score,
    };
  }
  return resolveViaWikidata(seed);
}

async function main() {
  const sourceText = await readFile(SOURCE_PATH, "utf8");
  const seeds = parseSeeds(sourceText);

  /** @type {Record<string, { imageUrl: string; sourceUrl: string; sourceTitle: string }>} */
  const mapping = {};
  /** @type {Array<{id: string; name: string}>} */
  const unresolved = [];

  const concurrency = 2;
  let cursor = 0;

  async function worker() {
    while (cursor < seeds.length) {
      const index = cursor;
      cursor += 1;
      const seed = seeds[index];
      let result = null;
      try {
        result = await resolveImage(seed);
      } catch {
        result = null;
      }

      if (result?.imageUrl && result?.sourceUrl) {
        mapping[seed.id] = {
          imageUrl: result.imageUrl,
          sourceUrl: result.sourceUrl,
          sourceTitle: result.title,
        };
        process.stdout.write(
          `[${String(index + 1).padStart(3, "0")}/${seeds.length}] OK   ${seed.name} -> ${result.title} (score ${result.score})\n`,
        );
      } else {
        unresolved.push({ id: seed.id, name: seed.name });
        process.stdout.write(
          `[${String(index + 1).padStart(3, "0")}/${seeds.length}] MISS ${seed.name}\n`,
        );
      }

      await new Promise((resolve) => setTimeout(resolve, 110));
    }
  }

  await Promise.all(Array.from({ length: concurrency }, () => worker()));

  const lines = [];
  lines.push("// Auto-generated by scripts/fetch-mentorship-images.mjs");
  lines.push("// Sources: Wikipedia/Wikimedia public pages and images");
  lines.push("\nexport type MentorshipStoryImageMeta = {");
  lines.push("  imageUrl: string;");
  lines.push("  sourceUrl: string;");
  lines.push("  sourceTitle: string;");
  lines.push("};\n");
  lines.push(
    "export const mentorshipStoryImageById: Partial<Record<string, MentorshipStoryImageMeta>> = {",
  );

  for (const id of Object.keys(mapping).sort()) {
    const entry = mapping[id];
    lines.push(`  \"${id}\": {`);
    lines.push(`    imageUrl: \"${escapeTsString(entry.imageUrl)}\",`);
    lines.push(`    sourceUrl: \"${escapeTsString(entry.sourceUrl)}\",`);
    lines.push(`    sourceTitle: \"${escapeTsString(entry.sourceTitle)}\",`);
    lines.push("  },");
  }

  lines.push("};\n");

  await writeFile(OUTPUT_PATH, `${lines.join("\n")}`, "utf8");

  process.stdout.write(`\nResolved ${Object.keys(mapping).length}/${seeds.length} images.\n`);
  if (unresolved.length > 0) {
    process.stdout.write("Unresolved entries:\n");
    for (const item of unresolved) {
      process.stdout.write(`- ${item.id} (${item.name})\n`);
    }
  }
}

await main();
