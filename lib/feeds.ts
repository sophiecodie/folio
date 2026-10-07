import { XMLParser } from "fast-xml-parser";
import type { FeedItem, Section, Source } from "./types";
import { SOURCES } from "./sources";
import { hash } from "./format";
import { CULTURE, NEWS, SCIENCE } from "./mockData";

/**
 * Live fetchers. Server-only: pages call these while rendering, and Next caches
 * each response for REVALIDATE_SECONDS, so outlets are asked at most once
 * every half hour no matter how many people load the page.
 *
 * Every source is converted into the same FeedItem shape (lib/types.ts).
 * If one source fails it is skipped; if a whole section fails we fall back
 * to the sample data so the page never comes up empty.
 */

export const REVALIDATE_SECONDS = 1800;
const PER_SOURCE = 8;
const TIMEOUT_MS = 8000;
const USER_AGENT = "Mozilla/5.0 (compatible; FolioReader/0.1)";

const SAMPLES: Record<Section, FeedItem[]> = { news: NEWS, science: SCIENCE, culture: CULTURE };

export type SectionResult = {
  items: FeedItem[];
  live: boolean; // false means we fell back to sample data
  sourceCount: number; // how many sources actually answered
};

export async function getSection(section: Section): Promise<SectionResult> {
  const jobs = SOURCES.filter((s) => s.section === section && s.feedUrl).map((s) =>
    settle(fetchRss(s), s.name),
  );
  if (section === "science") {
    for (const q of ARXIV_QUERIES) jobs.push(settle(fetchArxiv(q), `arXiv ${q.subsection}`));
    jobs.push(settle(fetchRxiv("medrxiv"), "medRxiv"), settle(fetchRxiv("biorxiv"), "bioRxiv"));
  }

  const lists = (await Promise.all(jobs)).filter((l) => l.length > 0);
  if (lists.length === 0) return { items: SAMPLES[section], live: false, sourceCount: 0 };

  const sources = new Set(lists.flat().map((i) => i.source));
  return { items: interleave(lists), live: true, sourceCount: sources.size };
}

/** The home feed: all three sections woven together. */
export async function getMixed(limit = 36): Promise<SectionResult> {
  const results = await Promise.all((["news", "science", "culture"] as const).map(getSection));
  return {
    items: interleave(results.map((r) => r.items)).slice(0, limit),
    live: results.some((r) => r.live),
    sourceCount: results.reduce((n, r) => n + r.sourceCount, 0),
  };
}

/**
 * Round-robin across sources (newest first within each), so one outlet that
 * posts fifty times a day can't push everyone else off the page.
 */
function interleave(lists: FeedItem[][]): FeedItem[] {
  const sorted = lists.map((l) => [...l].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)));
  const longest = Math.max(0, ...sorted.map((l) => l.length));
  const seen = new Set<string>();
  const out: FeedItem[] = [];
  for (let i = 0; i < longest; i++) {
    for (const list of sorted) {
      const item = list[i];
      if (item && !seen.has(item.id)) {
        seen.add(item.id);
        out.push(item);
      }
    }
  }
  return out;
}

function settle(job: Promise<FeedItem[]>, label: string): Promise<FeedItem[]> {
  return job.catch((err: Error) => {
    console.warn(`[feeds] ${label} failed: ${err.message}`);
    return [];
  });
}

async function fetchText(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT },
    signal: AbortSignal.timeout(TIMEOUT_MS),
    next: { revalidate: REVALIDATE_SECONDS },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

/* ---------------------------------------------------------------- RSS / Atom */

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@",
  textNodeName: "#text",
  parseTagValue: false, // keep "2026" as a string, not a number
  // Entities are decoded by decode() below instead. The parser's own decoder
  // has a safety cap that big feeds (Fox News) go over.
  processEntities: false,
  // Tags that can repeat are always arrays, so the code below never has to guess.
  isArray: (name) =>
    ["item", "entry", "link", "author", "media:content", "media:thumbnail", "enclosure"].includes(name),
});

type XmlNode = Record<string, unknown>;

async function fetchRss(source: Source): Promise<FeedItem[]> {
  const doc = parser.parse(await fetchText(source.feedUrl!)) as XmlNode;
  const rss = doc.rss as XmlNode | undefined;
  const channel = rss?.channel as XmlNode | undefined;
  const atom = doc.feed as XmlNode | undefined;
  const nodes = (channel?.item ?? atom?.entry ?? []) as XmlNode[];

  const items = nodes
    .slice(0, PER_SOURCE)
    .map((n) => rssToItem(source, n))
    .filter((i): i is FeedItem => i !== null);

  // Some feeds (Washington Post, Rolling Stone...) ship no images at all.
  // For those, read the article's social preview image instead.
  await Promise.all(
    items.map(async (item) => {
      if (!item.imageUrl) item.imageUrl = await ogImage(item.url);
    }),
  );
  return items;
}

function rssToItem(source: Source, n: XmlNode): FeedItem | null {
  const title = stripHtml(text(n.title));
  const url = linkOf(n);
  if (!title || !/^https?:\/\//.test(url)) return null;

  const rawSummary = text(n.description) || text(n.summary) || text(n["content:encoded"]) || text(n.content);
  const summary = clip(
    stripHtml(rawSummary).replace(/The post .+ appeared first on .+\.?$/, "").trim(),
  );

  return {
    id: `${slug(source.name)}-${hash(url).toString(36)}`,
    title,
    url,
    source: source.name,
    section: source.section,
    subsection: source.subsection ?? subsectionFromUrl(source, url),
    lean: source.lean,
    summary: summary && summary !== title ? summary : undefined,
    imageUrl: pickImage(n),
    publishedAt: toIso(text(n.pubDate) || text(n.published) || text(n.updated) || text(n["dc:date"])),
  };
}

function linkOf(n: XmlNode): string {
  for (const l of arr(n.link)) {
    if (typeof l === "string" && l.trim()) return decode(l.trim());
    if (l && typeof l === "object") {
      const o = l as XmlNode;
      if ((!o["@rel"] || o["@rel"] === "alternate") && o["@href"]) return decode(String(o["@href"]));
    }
  }
  const guid = decode(text(n.guid));
  return /^https?:\/\//.test(guid) ? guid : "";
}

/** Culture outlets cover several media, so guess the medium from the article path. */
function subsectionFromUrl(source: Source, url: string): string | undefined {
  if (source.section !== "culture") return undefined;
  const path = url.toLowerCase();
  if (/\/(tv|tv-movies\/tv)[-/]/.test(path) || path.includes("/tv/")) return "TV";
  if (/\/(film|movies?)[-/]/.test(path)) return "Film";
  if (path.includes("/music")) return "Music";
  if (path.includes("/books")) return "Books";
  return source.name === "Variety" ? "Film" : undefined;
}

/* ---------------------------------------------------------------- images */

/** Finds the best image in an RSS item: media tags first, then the first <img> in its HTML. */
function pickImage(n: XmlNode): string | undefined {
  const found: { url: string; width: number }[] = [];
  const collect = (value: unknown) => {
    for (const m of arr(value)) {
      if (!m || typeof m !== "object") continue;
      const o = m as XmlNode;
      const url = o["@url"];
      const type = String(o["@type"] ?? "");
      const medium = String(o["@medium"] ?? "");
      if (typeof url !== "string") continue;
      if (type && !type.startsWith("image")) continue;
      if (medium && medium !== "image") continue;
      found.push({ url, width: Number(o["@width"] ?? 0) });
    }
  };
  collect(n["media:content"]);
  for (const group of arr(n["media:group"])) collect((group as XmlNode)?.["media:content"]);
  collect(n["media:thumbnail"]);
  collect(n.enclosure);

  if (found.length > 0) {
    found.sort((a, b) => b.width - a.width);
    return cleanImageUrl(found[0].url);
  }

  const html = decode([n["content:encoded"], n.content, n.description, n.summary].map(text).join(" "));
  for (const match of Array.from(html.matchAll(/<img[^>]+src=["']([^"']+)["']/gi))) {
    const src = match[1];
    if (!/pixel|tracking|1x1|gravatar|avatar/i.test(src)) return cleanImageUrl(src);
  }
  return undefined;
}

function cleanImageUrl(url: string): string | undefined {
  const clean = decode(url.trim()).replace(/^http:\/\//, "https://");
  if (!clean.startsWith("https://")) return undefined;
  // BBC thumbnails are 240px wide; the same CDN serves an 800px version.
  return clean.replace(/(ichef\.bbci\.co\.uk\/ace\/standard\/)\d+\//, "$1800/");
}

// An article's preview image rarely changes, so cache these lookups for a day.
// The in-memory map also skips repeat requests within one server process.
const ogCache = new Map<string, string | undefined>();

async function ogImage(pageUrl: string): Promise<string | undefined> {
  if (ogCache.has(pageUrl)) return ogCache.get(pageUrl);
  let image: string | undefined;
  try {
    const res = await fetch(pageUrl, {
      headers: { "User-Agent": USER_AGENT },
      signal: AbortSignal.timeout(5000),
      next: { revalidate: 86_400 },
    });
    if (res.ok) {
      const head = (await res.text()).slice(0, 300_000);
      for (const tag of head.match(/<meta[^>]+>/gi) ?? []) {
        if (!/(property|name)=["'](og:image|twitter:image)(:src)?["']/i.test(tag)) continue;
        const content = tag.match(/content=["']([^"']+)["']/i);
        if (content) {
          image = cleanImageUrl(content[1]);
          break;
        }
      }
    }
  } catch {
    // A slow or blocked article just means no picture; the card draws a cover instead.
  }
  ogCache.set(pageUrl, image);
  return image;
}

/* ---------------------------------------------------------------- arXiv */

const ARXIV_QUERIES = [
  { subsection: "AI", query: "cat:cs.AI OR cat:cs.LG OR cat:cs.CL" },
  { subsection: "Physics", query: "cat:quant-ph OR cat:gr-qc OR cat:astro-ph.GA OR cat:cond-mat.supr-con" },
];

async function fetchArxiv({ subsection, query }: { subsection: string; query: string }): Promise<FeedItem[]> {
  const url =
    "https://export.arxiv.org/api/query?sortBy=submittedDate&sortOrder=descending" +
    `&max_results=${PER_SOURCE}&search_query=${encodeURIComponent(query)}`;
  const doc = parser.parse(await fetchText(url)) as XmlNode;
  const entries = ((doc.feed as XmlNode | undefined)?.entry ?? []) as XmlNode[];

  return entries.map((e) => {
    const link = linkOf(e) || text(e.id);
    return {
      id: `arxiv-${hash(text(e.id)).toString(36)}`,
      title: stripHtml(text(e.title)),
      url: link.replace(/^http:\/\//, "https://"),
      source: "arXiv",
      section: "science",
      subsection,
      authors: arr(e.author).map((a) => stripHtml(text((a as XmlNode).name))).filter(Boolean),
      summary: clip(stripHtml(text(e.summary))),
      publishedAt: toIso(text(e.published)),
      isPreprint: true,
    } satisfies FeedItem;
  });
}

/* ---------------------------------------------------------------- medRxiv / bioRxiv */

type RxivPaper = {
  doi: string;
  title: string;
  authors: string;
  date: string;
  version: string;
  category: string;
  abstract: string;
};

async function fetchRxiv(server: "medrxiv" | "biorxiv"): Promise<FeedItem[]> {
  // The API takes a date range; the last two days is plenty for a front page.
  const today = new Date();
  const start = new Date(today.getTime() - 2 * 86_400_000);
  const url = `https://api.biorxiv.org/details/${server}/${ymd(start)}/${ymd(today)}/0`;
  const data = JSON.parse(await fetchText(url)) as { collection?: RxivPaper[] };

  // The same paper can appear once per revised version; keep the newest.
  const byDoi = new Map<string, RxivPaper>();
  for (const p of data.collection ?? []) {
    const prev = byDoi.get(p.doi);
    if (!prev || Number(p.version) > Number(prev.version)) byDoi.set(p.doi, p);
  }

  const name = server === "medrxiv" ? "medRxiv" : "bioRxiv";
  return Array.from(byDoi.values())
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, PER_SOURCE / 2)
    .map((p) => ({
      id: `${server}-${hash(p.doi).toString(36)}`,
      title: stripHtml(p.title),
      url: `https://www.${server}.org/content/${p.doi}v${p.version}`,
      source: name,
      section: "science",
      subsection: "Health",
      authors: p.authors.split(";").map((a) => a.trim()).filter(Boolean),
      summary: clip(stripHtml(p.abstract)),
      publishedAt: toIso(`${p.date}T12:00:00Z`),
      isPreprint: true,
    }));
}

/* ---------------------------------------------------------------- small helpers */

/** Reads the text out of whatever shape the XML parser produced. */
function text(v: unknown): string {
  if (v == null) return "";
  if (typeof v === "string") return v;
  if (typeof v === "number") return String(v);
  if (Array.isArray(v)) return text(v[0]);
  if (typeof v === "object") return text((v as XmlNode)["#text"]);
  return "";
}

function arr(v: unknown): unknown[] {
  if (v == null) return [];
  return Array.isArray(v) ? v : [v];
}

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", hellip: "…",
  mdash: "—", ndash: "–", rsquo: "’", lsquo: "‘", rdquo: "”", ldquo: "“",
};

function decode(s: string): string {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, e: string) => {
    if (e[0] === "#") {
      const code = e[1] === "x" || e[1] === "X" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(code) && code > 0 && code < 0x110000 ? String.fromCodePoint(code) : match;
    }
    return NAMED_ENTITIES[e.toLowerCase()] ?? match;
  });
}

/** Feed text is often HTML. React escapes whatever we render, so plain text is safe. */
function stripHtml(html: string): string {
  // Decode first too: some feeds escape their HTML (&lt;p&gt;) instead of using CDATA.
  return decode(decode(html).replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim();
}

function clip(s: string, max = 320): string {
  if (s.length <= max) return s;
  return s.slice(0, s.lastIndexOf(" ", max)).replace(/[,.;:]$/, "") + "…";
}

function toIso(raw: string): string {
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

function ymd(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

/** The small line under each page title saying where the cards came from. */
export function liveNote(result: SectionResult): string {
  return result.live
    ? `Live from ${result.sourceCount} sources, refreshed every ${REVALIDATE_SECONDS / 60} minutes.`
    : "The live feeds could not be reached just now, so these are sample stories.";
}
