import type { FeedItem, Section } from "./types";
import { leanOf } from "./sources";

/**
 * SAMPLE DATA for Phase 1. These are placeholder stories, not real articles.
 * Each one is flagged with isSample so the card shows a "Sample" tag, and the
 * url is "#" so nothing links to a story the outlet never published.
 * Phase 2 replaces this file with live fetchers.
 */

type Draft = Omit<FeedItem, "id" | "url" | "isSample" | "section" | "lean">;

function make(section: Section, drafts: Draft[]): FeedItem[] {
  return drafts.map((d, i) => ({
    ...d,
    id: `${section}-${i}`,
    url: "#",
    section,
    lean: section === "news" ? leanOf(d.source) : undefined,
    isSample: true,
  }));
}

export const NEWS: FeedItem[] = make("news", [
  {
    source: "Reuters",
    title: "Sample story: Lawmakers return to talks on a stalled spending bill",
    summary:
      "A placeholder summary describing negotiations, the main sticking points, and the deadline both sides are working toward.",
    publishedAt: "2026-10-07T13:00:00Z",
  },
  {
    source: "Fox News",
    title: "Sample story: Governors push back on a proposed federal energy rule",
    summary:
      "Placeholder text about state officials, their objections, and what the rule would change for utilities.",
    publishedAt: "2026-10-07T11:30:00Z",
  },
  {
    source: "The New York Times",
    title: "Sample story: How one city rebuilt its downtown after the pandemic",
    summary:
      "A longer placeholder summary for a feature story. It mentions housing, small businesses, and transit, and runs long enough to show how the card clamps text after three lines.",
    publishedAt: "2026-10-07T09:15:00Z",
  },
  {
    source: "BBC News",
    title: "Sample story: Leaders meet ahead of an international climate summit",
    summary: "Placeholder text describing who attended and what is on the agenda.",
    publishedAt: "2026-10-06T22:00:00Z",
  },
  {
    source: "National Review",
    title: "Sample story: The case for rethinking federal education funding",
    summary: "A placeholder for an opinion-leaning piece from a right-of-center outlet.",
    publishedAt: "2026-10-06T19:45:00Z",
  },
  {
    source: "NPR",
    title: "Sample story: Rural hospitals look for new ways to keep their doors open",
    summary:
      "Placeholder summary about staffing, funding, and the communities that depend on small hospitals.",
    publishedAt: "2026-10-06T17:20:00Z",
  },
  {
    source: "The Wall Street Journal",
    title: "Sample story: Markets react to the latest interest rate signal",
    summary: "Placeholder text about stocks, bonds, and what analysts expect next.",
    publishedAt: "2026-10-06T15:00:00Z",
  },
  {
    source: "The Guardian",
    title: "Sample story: Coastal towns weigh the cost of managed retreat",
    summary:
      "Placeholder summary on rising seas and the hard choices facing residents and local governments.",
    publishedAt: "2026-10-06T12:10:00Z",
  },
  {
    source: "New York Post",
    title: "Sample story: Commuters react to a new round of transit fare changes",
    summary: "Placeholder text quoting riders and city officials.",
    publishedAt: "2026-10-06T10:00:00Z",
  },
  {
    source: "The Hill",
    title: "Sample story: What to watch in this week's committee hearings",
    summary: "A placeholder explainer listing hearings, witnesses, and stakes.",
    publishedAt: "2026-10-05T20:30:00Z",
  },
  {
    source: "The Washington Post",
    title: "Sample story: Inside the race to modernize air traffic control",
    summary: "Placeholder text about aging systems, new technology, and the timeline for upgrades.",
    publishedAt: "2026-10-05T16:00:00Z",
  },
  {
    source: "AP News",
    title: "Sample story: Storm season forecast updated as ocean temperatures stay high",
    summary: "Placeholder summary of the forecast and what it means for coastal states.",
    publishedAt: "2026-10-05T13:40:00Z",
  },
]);

export const SCIENCE: FeedItem[] = make("science", [
  {
    source: "arXiv",
    subsection: "AI",
    title: "Sample paper: Smaller language models that explain their own reasoning",
    authors: ["A. Rivera", "J. Chen", "S. Okafor", "M. Lindqvist"],
    summary:
      "Placeholder abstract. We study whether compact models can produce faithful explanations of their answers, and propose a training method that improves faithfulness on three benchmarks.",
    publishedAt: "2026-10-07T04:00:00Z",
    isPreprint: true,
  },
  {
    source: "medRxiv",
    subsection: "Health",
    title: "Sample paper: Sleep duration and recovery after minor surgery",
    authors: ["L. Haddad", "P. Novak"],
    summary:
      "Placeholder abstract describing a cohort study design, its main finding, and its limitations.",
    publishedAt: "2026-10-06T08:00:00Z",
    isPreprint: true,
  },
  {
    source: "arXiv",
    subsection: "Physics",
    title: "Sample paper: A tabletop test for tiny deviations in gravity",
    authors: ["K. Tanaka", "R. Mbeki", "E. Duarte"],
    summary: "Placeholder abstract about a precision measurement experiment.",
    publishedAt: "2026-10-06T04:00:00Z",
    isPreprint: true,
  },
  {
    source: "Ars Technica",
    subsection: "Tech",
    title: "Sample story: Why phone batteries are finally getting bigger",
    summary: "Placeholder tech-news summary about new battery chemistry reaching consumer devices.",
    publishedAt: "2026-10-05T18:00:00Z",
  },
  {
    source: "arXiv",
    subsection: "AI",
    title: "Sample paper: Teaching robots to fold laundry from a few demonstrations",
    authors: ["T. Moreau", "Y. Park"],
    summary:
      "Placeholder abstract. A data-efficient imitation learning approach for deformable objects.",
    publishedAt: "2026-10-05T04:00:00Z",
    isPreprint: true,
  },
  {
    source: "bioRxiv",
    subsection: "Health",
    title: "Sample paper: Mapping how gut bacteria respond to a high-fiber diet",
    authors: ["N. Alvarez", "D. Kim", "H. Osei", "F. Russo", "G. Patel"],
    summary: "Placeholder abstract about microbiome sequencing over twelve weeks.",
    publishedAt: "2026-10-04T08:00:00Z",
    isPreprint: true,
  },
  {
    source: "arXiv",
    subsection: "Physics",
    title: "Sample paper: Error rates in a new superconducting qubit design",
    authors: ["I. Novak", "C. Bauer"],
    summary: "Placeholder abstract about quantum computing hardware.",
    publishedAt: "2026-10-04T04:00:00Z",
    isPreprint: true,
  },
  {
    source: "MIT Technology Review",
    subsection: "Tech",
    title: "Sample story: The quiet comeback of nuclear-powered data centers",
    summary: "Placeholder feature summary on energy demand from AI computing.",
    publishedAt: "2026-10-03T14:00:00Z",
  },
]);

export const CULTURE: FeedItem[] = make("culture", [
  {
    source: "Variety",
    subsection: "Film",
    title: "Sample story: The fall festival films critics keep talking about",
    summary: "Placeholder roundup of festival favorites and awards-season buzz.",
    publishedAt: "2026-10-07T10:00:00Z",
  },
  {
    source: "Pitchfork",
    subsection: "Music",
    title: "Sample review: A debut album that rewards a second listen",
    summary: "Placeholder review summary with a few words on sound, lyrics, and production.",
    publishedAt: "2026-10-06T14:00:00Z",
  },
  {
    source: "Book Riot",
    subsection: "Books",
    title: "Sample list: New novels to read this month",
    summary: "Placeholder list intro describing a mix of literary fiction, fantasy, and memoir.",
    publishedAt: "2026-10-06T11:00:00Z",
  },
  {
    source: "Variety",
    subsection: "TV",
    title: "Sample story: Why limited series keep winning over audiences",
    summary: "Placeholder analysis of streaming trends and viewer habits.",
    publishedAt: "2026-10-05T19:00:00Z",
  },
  {
    source: "Rolling Stone",
    subsection: "Music",
    title: "Sample story: The small venues keeping live music alive",
    summary:
      "Placeholder feature about independent venues, the bands that play them, and the communities around them.",
    publishedAt: "2026-10-05T12:00:00Z",
  },
  {
    source: "Book Riot",
    subsection: "Books",
    title: "Sample story: How book clubs moved from living rooms to group chats",
    summary: "Placeholder text about reading communities online.",
    publishedAt: "2026-10-04T16:00:00Z",
  },
]);

/** Mixes the sections together for the home feed: news, science, culture, repeat. */
export function mixedFeed(): FeedItem[] {
  const lists = [NEWS, SCIENCE, CULTURE];
  const longest = Math.max(...lists.map((l) => l.length));
  const out: FeedItem[] = [];
  for (let i = 0; i < longest; i++) {
    for (const list of lists) {
      if (list[i]) out.push(list[i]);
    }
  }
  return out;
}
