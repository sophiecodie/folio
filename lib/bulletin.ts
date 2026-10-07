import type { FeedItem } from "./types";

/**
 * Brain Bulletin data. Everything lives in the browser's localStorage, so
 * boards are private to this device and need no account or database.
 * components/BulletinProvider.tsx owns the state; this file holds the shapes.
 */

export type BoardColor = "yellow" | "news" | "science" | "culture" | "ink";

export type Board = {
  id: string;
  name: string;
  description: string;
  color: BoardColor;
  createdAt: string;
};

type PinBase = { id: string; boardId: string; addedAt: string };

/** A story or paper saved from one of the feeds. A copy is kept so it survives the feed moving on. */
export type SourcePin = PinBase & { kind: "source"; item: FeedItem; note?: string };
export type NotePin = PinBase & { kind: "note"; text: string };
/** An idea built from other pins on the same board. */
export type IdeaPin = PinBase & { kind: "idea"; title: string; body: string; linkedPinIds: string[] };

export type Pin = SourcePin | NotePin | IdeaPin;

export type BulletinState = { version: 1; boards: Board[]; pins: Pin[] };

export const STORAGE_KEY = "folio.bulletin.v1";

/** Tailwind classes per board color, written out in full so Tailwind can see them. */
export const BOARD_COLORS: Record<BoardColor, { label: string; bg: string; text: string }> = {
  yellow: { label: "Yellow", bg: "bg-brand-yellow", text: "text-ink" },
  news: { label: "Blue", bg: "bg-news", text: "text-white" },
  science: { label: "Teal", bg: "bg-science", text: "text-white" },
  culture: { label: "Pink", bg: "bg-culture", text: "text-white" },
  ink: { label: "Ink", bg: "bg-ink", text: "text-white" },
};

export function uid(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);
}

/** What a brand-new visitor sees: one board for quick saves and one with example notes. */
export function seedState(): BulletinState {
  const now = new Date().toISOString();
  const quick: Board = {
    id: uid(),
    name: "Quick saves",
    description: "Anything worth a second look. Sort it into boards later.",
    color: "yellow",
    createdAt: now,
  };
  const ideas: Board = {
    id: uid(),
    name: "Project ideas",
    description: "Half-formed thoughts worth coming back to.",
    color: "culture",
    createdAt: now,
  };
  const note = (text: string): NotePin => ({ id: uid(), boardId: ideas.id, addedAt: now, kind: "note", text });
  return {
    version: 1,
    boards: [quick, ideas],
    pins: [
      note("What if the news page grouped stories by event, so you could compare five outlets at once?"),
      note("Ask the class: do bias labels help, or do they make people skip stories?"),
    ],
  };
}

/** Accepts only data that looks like ours, so a corrupted entry can't crash the page. */
export function parseState(raw: string | null): BulletinState | null {
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as Partial<BulletinState>;
    if (data.version !== 1 || !Array.isArray(data.boards) || !Array.isArray(data.pins)) return null;
    return data as BulletinState;
  } catch {
    return null;
  }
}

/** A short label for a pin, used in idea links and menus. */
export function pinLabel(pin: Pin): string {
  if (pin.kind === "source") return pin.item.title;
  if (pin.kind === "idea") return pin.title;
  return pin.text;
}
