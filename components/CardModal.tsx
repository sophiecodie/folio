"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { FeedItem } from "@/lib/types";
import { LEAN_NOTE, SECTIONS } from "@/lib/sources";
import { formatDate } from "@/lib/format";
import CardCover from "./CardCover";
import SpectrumBar from "./SpectrumBar";
import PinButton from "./PinButton";
import { PreprintBadge } from "./FeedCard";

type Props = {
  item: FeedItem | null;
  onClose: () => void;
};

/**
 * The expanded view of a card. Closes on Escape, on the close button,
 * or by clicking the dimmed background.
 */
export default function CardModal({ item, onClose }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null);

  // useEffect runs after render. Here it wires up keyboard handling and
  // scroll locking while the modal is open, and cleans up when it closes.
  useEffect(() => {
    if (!item) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      previouslyFocused?.focus();
    };
  }, [item, onClose]);

  return (
    <AnimatePresence>
      {item && (
        <motion.div
          key="overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 p-0 sm:items-center sm:p-6"
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="card-modal-title"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 380, damping: 34 }}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-card sm:rounded-3xl"
          >
            <div className="relative">
              <CardCover item={item} aspect="aspect-[21/9]" large />
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-card text-ink"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            <div className="p-6 sm:p-8">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
                <span className={`font-semibold ${SECTIONS[item.section].text}`}>
                  {item.subsection ?? SECTIONS[item.section].label}
                </span>
                <span className="font-semibold text-ink">{item.source}</span>
                <time dateTime={item.publishedAt}>{formatDate(item.publishedAt)}</time>
              </div>

              <h2 id="card-modal-title" className="mt-3 text-2xl font-bold leading-tight sm:text-3xl">
                {item.title}
              </h2>

              {item.authors && (
                <p className="mt-3 text-sm text-muted">{item.authors.join(", ")}</p>
              )}

              {item.summary && (
                <p className="mt-4 max-w-prose text-base leading-relaxed">{item.summary}</p>
              )}

              {item.lean && (
                <div className="mt-6 rounded-2xl bg-paper p-4">
                  <SpectrumBar lean={item.lean} />
                  <p className="mt-2 text-xs leading-relaxed text-muted">{LEAN_NOTE}</p>
                </div>
              )}

              {item.isPreprint && (
                <div className="mt-6 flex flex-wrap items-center gap-3 rounded-2xl bg-paper p-4">
                  <PreprintBadge />
                  <p className="text-xs leading-relaxed text-muted">
                    Preprints are shared before peer review, so treat findings as early results.
                  </p>
                </div>
              )}

              <div className="mt-8 flex flex-wrap items-center gap-3">
                {item.isSample ? (
                  <span className="rounded-full bg-paper px-4 py-2 text-sm text-muted">
                    This is a sample story, so there is no article to open yet.
                  </span>
                ) : (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white hover:bg-ink/85"
                  >
                    Read at {item.source}
                  </a>
                )}
                <PinButton item={item} />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
