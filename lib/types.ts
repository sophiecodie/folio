/**
 * Shared types. Every source (RSS, arXiv, bioRxiv...) gets converted into a
 * FeedItem, so the UI only ever has to understand one shape.
 * Think of this like a Java record that every fetcher must produce.
 */

export type Section = "news" | "science" | "culture";

export type Lean = "left" | "lean-left" | "center" | "lean-right" | "right";

export type FeedItem = {
  id: string;
  title: string;
  url: string;
  source: string;
  section: Section;
  subsection?: string;
  lean?: Lean;
  authors?: string[];
  summary?: string;
  imageUrl?: string;
  publishedAt: string; // ISO date string
  isPreprint?: boolean;
  isSample?: boolean; // true for mock data, so the UI can label it honestly
};

export type Source = {
  name: string;
  section: Section;
  subsection?: string;
  lean?: Lean;
  feedUrl?: string; // filled in during Phase 2
};
