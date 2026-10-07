"use client";

import { motion } from "framer-motion";
import type { FeedItem } from "@/lib/types";
import { SECTIONS } from "@/lib/sources";
import { formatAuthors, formatDate, hash } from "@/lib/format";
import CardCover from "./CardCover";
import SpectrumBar from "./SpectrumBar";
import PinButton from "./PinButton";

// Cover shapes. Mixing them (and some cards with no cover) is what gives the
// masonry grid its staggered Pinterest look. Photos lean tall, like Pinterest;
// drawn covers stay short so text-only stories don't take over the page.
const IMAGE_SHAPES = [
  "aspect-[3/4]",
  "aspect-[4/5]",
  "aspect-square",
  "aspect-[2/3]",
  "aspect-[4/3]",
  "aspect-[5/6]",
] as const;
const COVER_SHAPES = [null, "aspect-[4/3]", "aspect-square", "aspect-[16/9]"] as const;

/** Picks a stable cover shape for an item, or null for no cover. */
export function coverShape(item: FeedItem): string | null {
  const h = hash(item.id);
  return item.imageUrl ? IMAGE_SHAPES[h % IMAGE_SHAPES.length] : COVER_SHAPES[h % COVER_SHAPES.length];
}

type Props = {
  item: FeedItem;
  index: number;
  onOpen: (item: FeedItem) => void;
};

export default function FeedCard({ item, index, onOpen }: Props) {
  const section = SECTIONS[item.section];
  const shape = coverShape(item);

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index, 12) * 0.03 }}
      whileHover={{ y: -4 }}
      onClick={() => onOpen(item)}
      className="mb-4 cursor-pointer break-inside-avoid overflow-hidden rounded-2xl border border-line bg-card transition-colors hover:border-ink/40"
    >
      {shape && <CardCover item={item} aspect={shape} />}

      <div className="p-4">
        <div className="flex items-center gap-2 text-xs text-muted">
          <span aria-hidden className={`h-2 w-2 shrink-0 rounded-full ${section.bg}`} />
          <span className="truncate font-semibold text-ink">{item.source}</span>
          <time dateTime={item.publishedAt} className="shrink-0">
            {formatDate(item.publishedAt)}
          </time>
          {item.isSample && (
            <span className="ml-auto shrink-0 rounded-md bg-paper px-1.5 py-0.5 text-[11px]">
              Sample
            </span>
          )}
        </div>

        <h3 className="mt-2 text-[15px] font-semibold leading-snug">
          {/* The title is a real button so keyboard users can Tab to it and press Enter. */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpen(item);
            }}
            className="rounded text-left hover:underline"
          >
            {item.title}
          </button>
        </h3>

        {item.summary && <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">{item.summary}</p>}

        {item.authors && (
          <p className="mt-2 text-xs text-muted">{formatAuthors(item.authors)}</p>
        )}

        <div className="mt-4 flex items-center justify-between gap-3">
          {item.lean ? (
            <SpectrumBar lean={item.lean} />
          ) : item.isPreprint ? (
            <PreprintBadge />
          ) : (
            <span />
          )}
          <PinButton item={item} />
        </div>
      </div>
    </motion.article>
  );
}

export function PreprintBadge() {
  return (
    <span className="rounded-md border border-dashed border-muted/60 px-1.5 py-0.5 text-[11px] text-muted">
      Preprint, not peer reviewed
    </span>
  );
}
