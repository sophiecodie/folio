"use client";

import { useCallback, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { FeedItem } from "@/lib/types";
import { BOARD_COLORS } from "@/lib/bulletin";
import { useBulletin } from "./BulletinProvider";
import Popover from "./Popover";

/**
 * Saves a card to one or more Brain Bulletin boards. Opens a picker where each
 * board toggles on or off, plus a field to make a new board on the spot.
 */
export default function PinButton({ item }: { item: FeedItem }) {
  const { ready, boards, boardsWithItem, toggleItem, createBoard } = useBulletin();
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const buttonRef = useRef<HTMLButtonElement>(null);
  const close = useCallback(() => setOpen(false), []);

  const savedOn = ready ? boardsWithItem(item.id) : [];
  const saved = savedOn.length > 0;

  const create = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const board = createBoard({ name: newName });
    toggleItem(board.id, item);
    setNewName("");
  };

  return (
    <>
      <motion.button
        ref={buttonRef}
        type="button"
        whileTap={{ scale: 0.9 }}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={saved ? `Saved to ${savedOn.length} board${savedOn.length > 1 ? "s" : ""}. Change boards for “${item.title}”` : `Save “${item.title}” to a board`}
        onClick={(e) => {
          e.stopPropagation(); // don't also open the card
          setOpen((o) => !o);
        }}
        className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
          saved ? "border-ink bg-brand-yellow text-ink" : "border-line bg-card text-ink hover:border-ink"
        }`}
      >
        <PinIcon />
        {saved ? "Saved" : "Save"}
      </motion.button>

      {open && (
        <Popover anchor={buttonRef} onClose={close} label="Save to a board">
          <p className="px-2 pb-1.5 pt-1 text-xs font-semibold text-muted">Save to board</p>
          <ul className="max-h-56 overflow-y-auto">
            {boards.map((b) => {
              const on = savedOn.includes(b.id);
              return (
                <li key={b.id}>
                  <button
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggleItem(b.id, item)}
                    className="flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-left text-sm hover:bg-paper"
                  >
                    <span aria-hidden className={`h-6 w-6 shrink-0 rotate-3 rounded-md ${BOARD_COLORS[b.color].bg}`} />
                    <span className="min-w-0 flex-1 truncate font-medium">{b.name}</span>
                    <span
                      aria-hidden
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[11px] ${
                        on ? "border-ink bg-ink text-white" : "border-line"
                      }`}
                    >
                      {on && "✓"}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          <form onSubmit={create} className="mt-1 flex gap-1.5 border-t border-line px-1 pt-2">
            <label htmlFor={`new-board-${item.id}`} className="sr-only">
              New board name
            </label>
            <input
              id={`new-board-${item.id}`}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="New board…"
              maxLength={60}
              className="min-w-0 flex-1 rounded-lg border border-line bg-paper px-2.5 py-1.5 text-sm placeholder:text-muted"
            />
            <button
              type="submit"
              disabled={!newName.trim()}
              className="rounded-lg bg-ink px-3 text-sm font-semibold text-white disabled:opacity-40"
            >
              Add
            </button>
          </form>
        </Popover>
      )}
    </>
  );
}

export function PinIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden fill="currentColor">
      <path d="M16 3a1 1 0 0 1 .7 1.7L15 6.4v4.2l2.7 2.7a1 1 0 0 1-.7 1.7h-4v6a1 1 0 0 1-2 0v-6H7a1 1 0 0 1-.7-1.7L9 10.6V6.4L7.3 4.7A1 1 0 0 1 8 3h8Z" />
    </svg>
  );
}
