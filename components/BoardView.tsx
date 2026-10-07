"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import type { FeedItem } from "@/lib/types";
import { BOARD_COLORS, pinLabel, type Pin } from "@/lib/bulletin";
import { useBulletin } from "./BulletinProvider";
import BoardForm from "./BoardForm";
import BoardPin from "./BoardPin";
import CardModal from "./CardModal";
import FilterChips from "./FilterChips";
import MasonryGrid from "./MasonryGrid";

const KIND_OPTIONS = [
  { value: "source", label: "Sources" },
  { value: "note", label: "Notes" },
  { value: "idea", label: "Ideas" },
];

/** One board: its pins on a corkboard, plus tools to add notes and ideas. */
export default function BoardView({ boardId }: { boardId: string }) {
  const { ready, boards, pinsFor, updateBoard, deleteBoard, reorderPin } = useBulletin();
  const router = useRouter();
  const [filter, setFilter] = useState("all");
  const [composer, setComposer] = useState<"note" | "idea" | null>(null);
  const [editingBoard, setEditingBoard] = useState(false);
  const [openItem, setOpenItem] = useState<FeedItem | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const closeModal = useCallback(() => setOpenItem(null), []);

  const board = boards.find((b) => b.id === boardId);
  const pins = useMemo(() => (board ? pinsFor(board.id) : []), [board, pinsFor]);
  const visible = filter === "all" ? pins : pins.filter((p) => p.kind === filter);
  const byId = useMemo(() => new Map(pins.map((p) => [p.id, p])), [pins]);

  if (!ready) {
    return <div aria-busy="true" className="mt-10 h-96 animate-pulse rounded-3xl bg-line/60" />;
  }

  if (!board) {
    return (
      <div className="mt-14 rounded-2xl border border-dashed border-line p-10 text-center">
        <p className="font-semibold">This board doesn&apos;t exist on this device.</p>
        <p className="mt-1 text-sm text-muted">Boards are saved in this browser, so they don&apos;t follow you to other devices.</p>
        <Link href="/bulletin" className="mt-4 inline-block rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white">
          Back to all boards
        </Link>
      </div>
    );
  }

  const color = BOARD_COLORS[board.color];

  return (
    <>
      <header className="pb-8 pt-8 sm:pt-12">
        <Link href="/bulletin" className="rounded text-sm font-semibold text-muted hover:text-ink">
          ← All boards
        </Link>

        {editingBoard ? (
          <div className="mt-4 max-w-lg rounded-2xl border border-line bg-card p-5">
            <BoardForm
              initial={board}
              submitLabel="Save changes"
              onSubmit={(v) => {
                updateBoard(board.id, v);
                setEditingBoard(false);
              }}
              onCancel={() => setEditingBoard(false)}
              onDelete={() => {
                const msg =
                  pins.length > 0
                    ? `Delete “${board.name}” and its ${pins.length} ${pins.length === 1 ? "pin" : "pins"}? This can't be undone.`
                    : `Delete “${board.name}”?`;
                if (window.confirm(msg)) {
                  deleteBoard(board.id);
                  router.push("/bulletin");
                }
              }}
            />
          </div>
        ) : (
          <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <span aria-hidden className={`h-4 w-4 shrink-0 rotate-6 rounded-[4px] ${color.bg}`} />
                <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">{board.name}</h1>
              </div>
              {board.description && (
                <p className="mt-3 max-w-2xl text-lg leading-relaxed text-muted">{board.description}</p>
              )}
              <p className="mt-2 text-sm text-muted">
                {pins.length} {pins.length === 1 ? "pin" : "pins"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setEditingBoard(true)}
              className="rounded-full border border-line bg-card px-4 py-2 text-sm font-semibold hover:border-ink"
            >
              Edit board
            </button>
          </div>
        )}
      </header>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <FilterChips label="Show pins of type" groupId="pin-kind" options={KIND_OPTIONS} value={filter} onChange={setFilter} />
        <div className="flex gap-2">
          <button
            type="button"
            aria-expanded={composer === "note"}
            onClick={() => setComposer((c) => (c === "note" ? null : "note"))}
            className="rounded-full border border-ink bg-brand-yellow px-4 py-2 text-sm font-semibold hover:brightness-95"
          >
            + Note
          </button>
          <button
            type="button"
            aria-expanded={composer === "idea"}
            onClick={() => setComposer((c) => (c === "idea" ? null : "idea"))}
            className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-ink/85"
          >
            + Idea
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {composer && (
          <motion.div
            key={composer}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <Composer kind={composer} boardId={board.id} pins={pins} onDone={() => setComposer(null)} />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="rounded-3xl border border-line bg-card/60 p-4 sm:p-8">
        {visible.length === 0 ? (
          <EmptyBoard filtered={filter !== "all"} onShowAll={() => setFilter("all")} />
        ) : (
          <MasonryGrid>
            {visible.map((pin) => (
              <BoardPin
                key={pin.id}
                pin={pin}
                board={board}
                linked={pin.kind === "idea" ? pin.linkedPinIds.map((id) => byId.get(id)).filter((p): p is Pin => !!p) : []}
                onOpen={setOpenItem}
                drag={{
                  dragging: dragId === pin.id,
                  over: overId === pin.id && dragId !== null && dragId !== pin.id,
                  onStart: () => setDragId(pin.id),
                  onEnter: () => setOverId(pin.id),
                  onDrop: () => {
                    if (dragId) reorderPin(dragId, pin.id);
                    setDragId(null);
                    setOverId(null);
                  },
                  onEnd: () => {
                    setDragId(null);
                    setOverId(null);
                  },
                }}
              />
            ))}
          </MasonryGrid>
        )}
      </div>

      <CardModal item={openItem} onClose={closeModal} />
    </>
  );
}

function EmptyBoard({ filtered, onShowAll }: { filtered: boolean; onShowAll: () => void }) {
  if (filtered) {
    return (
      <div className="py-10 text-center">
        <p className="font-semibold">No pins of this type yet.</p>
        <button type="button" onClick={onShowAll} className="mt-3 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white">
          Show all pins
        </button>
      </div>
    );
  }
  return (
    <div className="py-12 text-center">
      <p className="font-pixel text-4xl leading-none text-muted">Nothing pinned yet</p>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted">
        Add a note above, or save stories here from{" "}
        <Link href="/news" className="font-semibold text-ink underline">News</Link>,{" "}
        <Link href="/science" className="font-semibold text-ink underline">Science</Link>, or{" "}
        <Link href="/culture" className="font-semibold text-ink underline">Culture</Link> with the Save button.
      </p>
    </div>
  );
}

/** The form for a new note or idea. Ideas can link to pins already on the board. */
function Composer({
  kind,
  boardId,
  pins,
  onDone,
}: {
  kind: "note" | "idea";
  boardId: string;
  pins: Pin[];
  onDone: () => void;
}) {
  const { addNote, addIdea } = useBulletin();
  const [text, setText] = useState("");
  const [title, setTitle] = useState("");
  const [linked, setLinked] = useState<string[]>([]);
  const linkable = pins.filter((p) => p.kind !== "idea");
  const canSave = kind === "note" ? text.trim().length > 0 : title.trim().length > 0;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSave) return;
    if (kind === "note") addNote(boardId, text);
    else addIdea(boardId, { title, body: text, linkedPinIds: linked });
    onDone();
  };

  return (
    <form
      onSubmit={submit}
      onKeyDown={(e) => e.key === "Escape" && onDone()}
      className={`mb-6 rounded-2xl p-5 ${kind === "note" ? "bg-brand-yellow shadow-[3px_3px_0_#1C1F2A]" : "border-2 border-ink bg-card"}`}
    >
      {kind === "idea" && (
        <input
          aria-label="Idea title"
          autoFocus
          maxLength={120}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Name your idea"
          className="mb-3 w-full rounded-xl border border-line bg-paper px-3 py-2 text-lg font-bold placeholder:font-semibold placeholder:text-muted"
        />
      )}
      <textarea
        aria-label={kind === "note" ? "Note" : "Idea details"}
        autoFocus={kind === "note"}
        rows={3}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit(e);
        }}
        placeholder={kind === "note" ? "Jot something down…" : "What's the idea? How do the pins connect?"}
        className={`w-full resize-y rounded-xl border px-3 py-2 text-[15px] leading-relaxed placeholder:text-ink/50 ${
          kind === "note" ? "border-ink/20 bg-white/70" : "border-line bg-paper"
        }`}
      />

      {kind === "idea" && linkable.length > 0 && (
        <fieldset className="mt-3">
          <legend className="text-sm font-semibold">Built from (optional)</legend>
          <div className="mt-2 flex max-h-40 flex-wrap gap-2 overflow-y-auto">
            {linkable.map((p) => {
              const on = linked.includes(p.id);
              return (
                <button
                  key={p.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setLinked((l) => (on ? l.filter((x) => x !== p.id) : [...l, p.id]))}
                  className={`max-w-[16rem] truncate rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                    on ? "border-ink bg-ink text-white" : "border-line bg-card hover:border-ink"
                  }`}
                >
                  {pinLabel(p)}
                </button>
              );
            })}
          </div>
        </fieldset>
      )}

      <div className="mt-3 flex gap-2">
        <button
          type="submit"
          disabled={!canSave}
          className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
        >
          {kind === "note" ? "Pin note" : "Pin idea"}
        </button>
        <button type="button" onClick={onDone} className="rounded-full px-4 py-2 text-sm font-semibold hover:bg-ink/10">
          Cancel
        </button>
      </div>
    </form>
  );
}
