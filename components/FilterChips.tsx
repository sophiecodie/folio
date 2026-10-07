"use client";

import { motion } from "framer-motion";

export type ChipOption = { value: string; label: string };

type Props = {
  label: string; // read by screen readers, e.g. "Filter by section"
  groupId: string; // keeps the sliding highlight separate per chip group
  options: ChipOption[];
  value: string;
  onChange: (value: string) => void;
};

export default function FilterChips({ label, groupId, options, value, onChange }: Props) {
  const all: ChipOption[] = [{ value: "all", label: "All" }, ...options];

  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-2">
      {all.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(opt.value)}
            className={`relative isolate rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
              active ? "border-ink text-white" : "border-line bg-card text-ink hover:border-ink/50"
            }`}
          >
            {active && (
              <motion.span
                layoutId={`chip-${groupId}`}
                className="absolute inset-0 -z-10 rounded-full bg-ink"
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
              />
            )}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
