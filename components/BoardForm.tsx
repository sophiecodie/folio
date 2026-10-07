"use client";

import { useId, useState } from "react";
import { BOARD_COLORS, type BoardColor } from "@/lib/bulletin";

type Values = { name: string; description: string; color: BoardColor };

type Props = {
  initial?: Partial<Values>;
  submitLabel: string;
  onSubmit: (values: Values) => void;
  onCancel: () => void;
  onDelete?: () => void;
};

/** Name, description, and color for a board. Used to create and to edit. */
export default function BoardForm({ initial, submitLabel, onSubmit, onCancel, onDelete }: Props) {
  const id = useId();
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [color, setColor] = useState<BoardColor>(initial?.color ?? "yellow");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (name.trim()) onSubmit({ name, description, color });
      }}
      onKeyDown={(e) => e.key === "Escape" && onCancel()}
      className="space-y-4"
    >
      <div>
        <label htmlFor={`${id}-name`} className="text-sm font-semibold">
          Board name
        </label>
        <input
          id={`${id}-name`}
          autoFocus
          required
          maxLength={60}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Climate essay, Sci-fi reading list"
          className="mt-1.5 w-full rounded-xl border border-line bg-paper px-3 py-2 placeholder:text-muted"
        />
      </div>
      <div>
        <label htmlFor={`${id}-desc`} className="text-sm font-semibold">
          Description <span className="font-normal text-muted">(optional)</span>
        </label>
        <textarea
          id={`${id}-desc`}
          rows={2}
          maxLength={200}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What is this board for?"
          className="mt-1.5 w-full resize-none rounded-xl border border-line bg-paper px-3 py-2 placeholder:text-muted"
        />
      </div>
      <fieldset>
        <legend className="text-sm font-semibold">Color</legend>
        <div className="mt-2 flex gap-2.5">
          {(Object.keys(BOARD_COLORS) as BoardColor[]).map((c) => (
            <label key={c} className="cursor-pointer">
              <input
                type="radio"
                name={`${id}-color`}
                value={c}
                checked={color === c}
                onChange={() => setColor(c)}
                className="peer sr-only"
              />
              <span
                className={`block h-8 w-8 rounded-lg border-2 border-transparent ring-offset-2 transition peer-checked:border-ink peer-checked:ring-2 peer-checked:ring-ink peer-focus-visible:outline peer-focus-visible:outline-[3px] peer-focus-visible:outline-offset-4 peer-focus-visible:outline-ink ${BOARD_COLORS[c].bg}`}
              />
              <span className="sr-only">{BOARD_COLORS[c].label}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <button
          type="submit"
          disabled={!name.trim()}
          className="rounded-full bg-ink px-5 py-2 text-sm font-semibold text-white hover:bg-ink/85 disabled:opacity-40"
        >
          {submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full border border-line bg-card px-5 py-2 text-sm font-semibold hover:border-ink"
        >
          Cancel
        </button>
        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="ml-auto rounded-full px-4 py-2 text-sm font-semibold text-ink underline-offset-2 hover:bg-culture/10 hover:underline"
          >
            Delete board
          </button>
        )}
      </div>
    </form>
  );
}
