"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { FeedItem } from "@/lib/types";
import {
  STORAGE_KEY,
  parseState,
  seedState,
  uid,
  type Board,
  type BoardColor,
  type BulletinState,
  type IdeaPin,
  type NotePin,
  type Pin,
  type SourcePin,
} from "@/lib/bulletin";

type BoardInput = { name: string; description?: string; color?: BoardColor };

type BulletinApi = {
  /** False until localStorage has been read. The server never knows what's saved. */
  ready: boolean;
  boards: Board[];
  pins: Pin[];
  pinsFor: (boardId: string) => Pin[];
  boardsWithItem: (itemId: string) => string[];
  createBoard: (input: BoardInput) => Board;
  updateBoard: (id: string, patch: Partial<BoardInput>) => void;
  deleteBoard: (id: string) => void;
  toggleItem: (boardId: string, item: FeedItem) => void;
  addNote: (boardId: string, text: string) => void;
  addIdea: (boardId: string, idea: { title: string; body: string; linkedPinIds: string[] }) => void;
  updatePin: (id: string, patch: Partial<Pick<SourcePin, "note">> & Partial<Pick<NotePin, "text">> & Partial<Pick<IdeaPin, "title" | "body">>) => void;
  removePin: (id: string) => void;
  movePin: (id: string, boardId: string) => void;
  /** Moves a pin so it sits just before another pin (used by drag and drop). */
  reorderPin: (id: string, beforeId: string) => void;
};

const BulletinContext = createContext<BulletinApi | null>(null);

export function useBulletin(): BulletinApi {
  const api = useContext(BulletinContext);
  if (!api) throw new Error("useBulletin must be used inside <BulletinProvider>");
  return api;
}

/**
 * Holds every board and pin, and saves them to localStorage on each change.
 * It's mounted once in Providers, so the Save button on any card and the
 * Brain Bulletin pages all share the same state.
 */
export default function BulletinProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<BulletinState>({ version: 1, boards: [], pins: [] });
  const [ready, setReady] = useState(false);
  const skipNextSave = useRef(false);

  // Load once in the browser. Also listen for edits made in another tab.
  useEffect(() => {
    setState(parseState(localStorage.getItem(STORAGE_KEY)) ?? seedState());
    setReady(true);

    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return;
      const next = parseState(e.newValue);
      if (next) {
        skipNextSave.current = true; // it's already saved; don't echo it back
        setState(next);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage can be full or blocked (private browsing). The board still works for this visit.
    }
  }, [state, ready]);

  const update = useCallback((fn: (s: BulletinState) => BulletinState) => setState(fn), []);

  const createBoard = useCallback(
    (input: BoardInput) => {
      const board: Board = {
        id: uid(),
        name: input.name.trim() || "Untitled board",
        description: input.description?.trim() ?? "",
        color: input.color ?? "yellow",
        createdAt: new Date().toISOString(),
      };
      update((s) => ({ ...s, boards: [...s.boards, board] }));
      return board;
    },
    [update],
  );

  const api = useMemo<BulletinApi>(() => {
    const addPin = (pin: Pin) => update((s) => ({ ...s, pins: [pin, ...s.pins] })); // newest first
    const base = (boardId: string) => ({ id: uid(), boardId, addedAt: new Date().toISOString() });

    return {
      ready,
      boards: state.boards,
      pins: state.pins,
      pinsFor: (boardId) => state.pins.filter((p) => p.boardId === boardId),
      boardsWithItem: (itemId) =>
        state.pins.filter((p) => p.kind === "source" && p.item.id === itemId).map((p) => p.boardId),
      createBoard,
      updateBoard: (id, patch) =>
        update((s) => ({
          ...s,
          boards: s.boards.map((b) =>
            b.id === id
              ? {
                  ...b,
                  ...patch,
                  name: patch.name !== undefined ? patch.name.trim() || b.name : b.name,
                  description: patch.description?.trim() ?? b.description,
                }
              : b,
          ),
        })),
      deleteBoard: (id) =>
        update((s) => ({
          ...s,
          boards: s.boards.filter((b) => b.id !== id),
          pins: s.pins.filter((p) => p.boardId !== id),
        })),
      toggleItem: (boardId, item) =>
        update((s) => {
          const existing = s.pins.find((p) => p.boardId === boardId && p.kind === "source" && p.item.id === item.id);
          if (existing) return { ...s, pins: s.pins.filter((p) => p !== existing) };
          const pin: SourcePin = { ...base(boardId), kind: "source", item };
          return { ...s, pins: [pin, ...s.pins] };
        }),
      addNote: (boardId, text) => addPin({ ...base(boardId), kind: "note", text: text.trim() }),
      addIdea: (boardId, idea) =>
        addPin({ ...base(boardId), kind: "idea", title: idea.title.trim(), body: idea.body.trim(), linkedPinIds: idea.linkedPinIds }),
      updatePin: (id, patch) =>
        update((s) => ({ ...s, pins: s.pins.map((p) => (p.id === id ? ({ ...p, ...patch } as Pin) : p)) })),
      removePin: (id) =>
        update((s) => ({
          ...s,
          pins: s.pins
            .filter((p) => p.id !== id)
            // Ideas forget links to pins that no longer exist.
            .map((p) => (p.kind === "idea" ? { ...p, linkedPinIds: p.linkedPinIds.filter((l) => l !== id) } : p)),
        })),
      movePin: (id, boardId) =>
        update((s) => ({ ...s, pins: s.pins.map((p) => (p.id === id ? { ...p, boardId } : p)) })),
      reorderPin: (id, beforeId) =>
        update((s) => {
          if (id === beforeId) return s;
          const moving = s.pins.find((p) => p.id === id);
          if (!moving) return s;
          const rest = s.pins.filter((p) => p.id !== id);
          const at = rest.findIndex((p) => p.id === beforeId);
          if (at === -1) return s;
          return { ...s, pins: [...rest.slice(0, at), moving, ...rest.slice(at)] };
        }),
    };
  }, [state, ready, update, createBoard]);

  return <BulletinContext.Provider value={api}>{children}</BulletinContext.Provider>;
}
