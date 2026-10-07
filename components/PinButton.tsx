"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { FeedItem } from "@/lib/types";

/**
 * Phase 1: toggles visually only, nothing is saved yet.
 * Phase 4 will connect this to lib/storage.ts so pins land on the Brain Bulletin.
 */
export default function PinButton({ item }: { item: FeedItem }) {
  const [pinned, setPinned] = useState(false);

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.9 }}
      aria-pressed={pinned}
      aria-label={pinned ? `Unpin “${item.title}”` : `Pin “${item.title}”`}
      onClick={(e) => {
        e.stopPropagation(); // don't also open the card
        setPinned((p) => !p);
      }}
      className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
        pinned
          ? "border-ink bg-brand-yellow text-ink"
          : "border-line bg-card text-ink hover:border-ink"
      }`}
    >
      <svg width="12" height="12" viewBox="0 0 24 24" aria-hidden fill="currentColor">
        <path d="M16 3a1 1 0 0 1 .7 1.7L15 6.4v4.2l2.7 2.7a1 1 0 0 1-.7 1.7h-4v6a1 1 0 0 1-2 0v-6H7a1 1 0 0 1-.7-1.7L9 10.6V6.4L7.3 4.7A1 1 0 0 1 8 3h8Z" />
      </svg>
      {pinned ? "Pinned" : "Pin"}
    </motion.button>
  );
}
