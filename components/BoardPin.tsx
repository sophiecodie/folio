"use client";

import { useRef, useState } from "react";
import type { FeedItem } from "@/lib/types";
import { BOARD_COLORS, pinLabel, type Board, type Pin } from "@/lib/bulletin";
import { formatDate, hash } from "@/lib/format";
import { SECTIONS } from "@/lib/sources";
import { useBulletin } from "./BulletinProvider";
import CardCover from "./CardCover";
import { coverShape } from "./FeedCard";
import Popover from "./Popover";

const TILTS = ["-rotate-1", "rotate-1", "rotate-0", "-rotate-2", "rotate-2"];

type Props = {
  pin: Pin;
  board: Board;
  linked: Pin[]; // for ideas: the pins it was built from
  onOpen: (item: FeedItem) => void;
  drag: {
    dragging: boolean;
    over: boolean;
    onStart: () => void;
    onEnter: () => void;
    onDrop: () => void;
    onEnd: () => void;
  };
};

/**
 * One pin on a board. Tilted like a real corkboard, straightens on hover.
 * Drag it onto another pin to move it in front of that one.
 */
export default function BoardPin({ pin, board, linked, onOpen, drag }: Props) {
  const { updatePin } = useBulletin();
  const [editing, setEditing] = useState(false);
  const tilt = TILTS[hash(pin.id) % TILTS.length];

  return (
    <div
      draggable={!editing}
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", pin.id); // Firefox won't start a drag without data
        drag.onStart();
      }}
      onDragEnter={drag.onEnter}
      onDragOver={(e) => e.preventDefault()} // allows dropping here
      onDrop={(e) => {
        e.preventDefault();
        drag.onDrop();
      }}
      onDragEnd={drag.onEnd}
      className={`group relative mb-6 break-inside-avoid pt-2 transition duration-200 hover:rotate-0 focus-within:rotate-0 ${
        editing ? "rotate-0" : tilt
      } ${drag.dragging ? "opacity-40" : ""} ${drag.over ? "translate-y-2" : ""}`}
    >
      {/* drop marker: shows where the dragged pin will land */}
      {drag.over && <span aria-hidden className="absolute -top-2 left-2 right-2 h-1 rounded-full bg-ink" />}
      {/* the pushpin */}
      <span
        aria-hidden
        className={`absolute left-1/2 top-0 z-10 h-4 w-4 -translate-x-1/2 rounded-full border-2 border-ink ${BOARD_COLORS[board.color].bg}`}
      />

      <div className="absolute right-2 top-4 z-10 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100 [@media(hover:none)]:opacity-100">
        <PinMenu pin={pin} board={board} onEdit={() => setEditing(true)} />
      </div>

      {pin.kind === "note" && (
        <div className="bg-brand-yellow p-5 pt-6 shadow-[3px_3px_0_#1C1F2A]">
          {editing ? (
            <InlineEditor
              label="Edit note"
              value={pin.text}
              onSave={(text) => {
                if (text.trim()) updatePin(pin.id, { text: text.trim() });
                setEditing(false);
              }}
              onCancel={() => setEditing(false)}
            />
          ) : (
            <p className="whitespace-pre-wrap pr-6 text-[15px] font-medium leading-relaxed">{pin.text}</p>
          )}
        </div>
      )}

      {pin.kind === "idea" && (
        <div className="rounded-xl border-2 border-ink bg-card p-5 pt-6 shadow-[3px_3px_0_#FFD23F]">
          <p className="font-pixel text-2xl leading-none text-muted">Idea</p>
          {editing ? (
            <IdeaEditor
              title={pin.title}
              body={pin.body}
              onSave={(title, body) => {
                if (title.trim()) updatePin(pin.id, { title: title.trim(), body: body.trim() });
                setEditing(false);
              }}
              onCancel={() => setEditing(false)}
            />
          ) : (
            <>
              <p className="mt-1.5 pr-6 text-lg font-bold leading-snug">{pin.title}</p>
              {pin.body && <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">{pin.body}</p>}
            </>
          )}
          {linked.length > 0 && (
            <div className="mt-4 border-t border-dashed border-line pt-3">
              <p className="text-xs font-semibold text-muted">Built from {linked.length} {linked.length === 1 ? "pin" : "pins"}</p>
              <ul className="mt-1.5 space-y-1">
                {linked.map((l) => (
                  <li key={l.id} className="flex items-center gap-1.5 text-xs">
                    <span aria-hidden className={`h-1.5 w-1.5 shrink-0 rounded-full ${l.kind === "source" ? SECTIONS[l.item.section].bg : "bg-brand-yellow ring-1 ring-ink"}`} />
                    <span className="truncate">{pinLabel(l)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {pin.kind === "source" && (
        <div className="overflow-hidden rounded-xl border border-line bg-card">
          {coverShape(pin.item) && <CardCover item={pin.item} aspect={coverShape(pin.item)!} />}
          <div className="p-4">
            <div className="flex items-center gap-2 text-xs text-muted">
              <span aria-hidden className={`h-2 w-2 shrink-0 rounded-full ${SECTIONS[pin.item.section].bg}`} />
              <span className="truncate font-semibold text-ink">{pin.item.source}</span>
              <time dateTime={pin.item.publishedAt} className="shrink-0">
                {formatDate(pin.item.publishedAt)}
              </time>
            </div>
            <h3 className="mt-2 text-[15px] font-semibold leading-snug">
              <button type="button" onClick={() => onOpen(pin.item)} className="rounded text-left hover:underline">
                {pin.item.title}
              </button>
            </h3>
            {editing ? (
              <div className="mt-3">
                <InlineEditor
                  label="Note on this pin"
                  value={pin.note ?? ""}
                  placeholder="Why did you save this?"
                  onSave={(note) => {
                    updatePin(pin.id, { note: note.trim() || undefined });
                    setEditing(false);
                  }}
                  onCancel={() => setEditing(false)}
                />
              </div>
            ) : (
              pin.note && (
                <p className="mt-3 whitespace-pre-wrap rounded-lg bg-brand-yellow/60 px-3 py-2 text-sm leading-relaxed">
                  {pin.note}
                </p>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function PinMenu({ pin, board, onEdit }: { pin: Pin; board: Board; onEdit: () => void }) {
  const { boards, movePin, removePin } = useBulletin();
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const others = boards.filter((b) => b.id !== board.id);
  const editLabel = pin.kind === "source" ? (pin.note ? "Edit note" : "Add a note") : "Edit";

  const item = "flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-left text-sm hover:bg-paper";

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={`Options for “${pinLabel(pin).slice(0, 60)}”`}
        onClick={() => setOpen((o) => !o)}
        className="flex h-8 w-8 items-center justify-center rounded-full border border-line bg-card text-ink shadow-sm hover:border-ink"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden fill="currentColor">
          <circle cx="5" cy="12" r="2" />
          <circle cx="12" cy="12" r="2" />
          <circle cx="19" cy="12" r="2" />
        </svg>
      </button>
      {open && (
        <Popover anchor={buttonRef} onClose={() => setOpen(false)} label="Pin options" width={232}>
          <button
            type="button"
            className={item}
            onClick={() => {
              setOpen(false);
              onEdit();
            }}
          >
            {editLabel}
          </button>
          {others.length > 0 && (
            <>
              <p className="px-2 pb-1 pt-2 text-xs font-semibold text-muted">Move to</p>
              <ul className="max-h-44 overflow-y-auto">
                {others.map((b) => (
                  <li key={b.id}>
                    <button type="button" className={item} onClick={() => movePin(pin.id, b.id)}>
                      <span aria-hidden className={`h-4 w-4 shrink-0 rotate-3 rounded ${BOARD_COLORS[b.color].bg}`} />
                      <span className="truncate">{b.name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
          <div className="mt-1 border-t border-line pt-1">
            <button type="button" className={item} onClick={() => removePin(pin.id)}>
              Remove from board
            </button>
          </div>
        </Popover>
      )}
    </>
  );
}

function InlineEditor({
  label,
  value,
  placeholder,
  onSave,
  onCancel,
}: {
  label: string;
  value: string;
  placeholder?: string;
  onSave: (v: string) => void;
  onCancel: () => void;
}) {
  const [text, setText] = useState(value);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(text);
      }}
    >
      <textarea
        aria-label={label}
        autoFocus
        rows={4}
        value={text}
        placeholder={placeholder}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape") onCancel();
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) onSave(text);
        }}
        className="w-full resize-y rounded-lg border border-ink/30 bg-white/80 p-2 text-[15px] leading-relaxed placeholder:text-muted"
      />
      <EditorButtons onCancel={onCancel} />
    </form>
  );
}

function IdeaEditor({
  title: initialTitle,
  body: initialBody,
  onSave,
  onCancel,
}: {
  title: string;
  body: string;
  onSave: (title: string, body: string) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(initialTitle);
  const [body, setBody] = useState(initialBody);
  return (
    <form
      className="mt-2 space-y-2"
      onSubmit={(e) => {
        e.preventDefault();
        onSave(title, body);
      }}
      onKeyDown={(e) => e.key === "Escape" && onCancel()}
    >
      <input
        aria-label="Idea title"
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full rounded-lg border border-line bg-paper px-2 py-1.5 font-bold"
      />
      <textarea
        aria-label="Idea details"
        rows={3}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        className="w-full resize-y rounded-lg border border-line bg-paper p-2 text-sm"
      />
      <EditorButtons onCancel={onCancel} />
    </form>
  );
}

function EditorButtons({ onCancel }: { onCancel: () => void }) {
  return (
    <div className="mt-2 flex gap-2">
      <button type="submit" className="rounded-full bg-ink px-3.5 py-1 text-xs font-semibold text-white">
        Save
      </button>
      <button type="button" onClick={onCancel} className="rounded-full px-3 py-1 text-xs font-semibold hover:bg-ink/10">
        Cancel
      </button>
    </div>
  );
}
