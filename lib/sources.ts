import type { CSSProperties } from "react";
import type { Lean, Section, Source } from "./types";

/**
 * Display settings for each section. Tailwind class names are written out in
 * full (not built with string templates) so Tailwind can detect them.
 */
export const SECTIONS: Record<
  Section,
  {
    label: string;
    href: string;
    blurb: string;
    bg: string;
    text: string;
    pattern: CSSProperties;
  }
> = {
  news: {
    label: "News",
    href: "/news",
    blurb:
      "Headlines from outlets across the political spectrum, so you can see who is covering what.",
    bg: "bg-news",
    text: "text-news",
    pattern: {
      backgroundImage:
        "repeating-linear-gradient(0deg, rgba(255,255,255,0.13) 0 1px, transparent 1px 14px)",
    },
  },
  science: {
    label: "Science",
    href: "/science",
    blurb:
      "New research in AI, tech, physics, and medicine, mostly preprints straight from arXiv, medRxiv, and bioRxiv.",
    bg: "bg-science",
    text: "text-science",
    pattern: {
      backgroundImage:
        "linear-gradient(rgba(255,255,255,0.14) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.14) 1px, transparent 1px)",
      backgroundSize: "18px 18px",
    },
  },
  culture: {
    label: "Culture",
    href: "/culture",
    blurb: "Film, music, books, and TV from the critics and magazines that follow them.",
    bg: "bg-culture",
    text: "text-culture",
    pattern: {
      backgroundImage: "radial-gradient(rgba(255,255,255,0.24) 1.5px, transparent 1.5px)",
      backgroundSize: "14px 14px",
    },
  },
};

/** The lean scale, in order from left to right. */
export const LEANS: { value: Lean; label: string; bg: string }[] = [
  { value: "left", label: "Left", bg: "bg-lean-left" },
  { value: "lean-left", label: "Lean left", bg: "bg-lean-lean-left" },
  { value: "center", label: "Center", bg: "bg-lean-center" },
  { value: "lean-right", label: "Lean right", bg: "bg-lean-lean-right" },
  { value: "right", label: "Right", bg: "bg-lean-right" },
];

export const LEAN_NOTE =
  "Lean labels are approximate and describe the outlet, not the individual story. They are based on publicly available media-bias ratings and can be edited in lib/sources.ts.";

/**
 * Every source in one place. Lean ratings are rough, editable estimates.
 * Feed URLs get added and verified in Phase 2.
 */
export const SOURCES: Source[] = [
  // News
  { name: "The Guardian", section: "news", lean: "left" },
  { name: "The New York Times", section: "news", lean: "lean-left" },
  { name: "The Washington Post", section: "news", lean: "lean-left" },
  { name: "NPR", section: "news", lean: "lean-left" },
  { name: "AP News", section: "news", lean: "lean-left" },
  { name: "Reuters", section: "news", lean: "center" },
  { name: "BBC News", section: "news", lean: "center" },
  { name: "The Hill", section: "news", lean: "center" },
  { name: "The Wall Street Journal", section: "news", lean: "center" },
  { name: "New York Post", section: "news", lean: "lean-right" },
  { name: "Fox News", section: "news", lean: "right" },
  { name: "National Review", section: "news", lean: "right" },
  // Science
  { name: "arXiv", section: "science" },
  { name: "medRxiv", section: "science", subsection: "Health" },
  { name: "bioRxiv", section: "science", subsection: "Health" },
  { name: "Ars Technica", section: "science", subsection: "Tech" },
  { name: "The Verge", section: "science", subsection: "Tech" },
  { name: "MIT Technology Review", section: "science", subsection: "Tech" },
  // Culture
  { name: "Variety", section: "culture" },
  { name: "Rolling Stone", section: "culture", subsection: "Music" },
  { name: "Pitchfork", section: "culture", subsection: "Music" },
  { name: "Book Riot", section: "culture", subsection: "Books" },
];

export function leanOf(sourceName: string): Lean | undefined {
  return SOURCES.find((s) => s.name === sourceName)?.lean;
}

export function leanInfo(lean: Lean) {
  return LEANS.find((l) => l.value === lean) ?? LEANS[2];
}
