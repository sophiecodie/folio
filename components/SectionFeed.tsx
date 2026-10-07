"use client";

import { useCallback, useMemo, useState } from "react";
import type { FeedItem } from "@/lib/types";
import FilterChips, { type ChipOption } from "./FilterChips";
import MasonryGrid from "./MasonryGrid";
import FeedCard from "./FeedCard";
import CardModal from "./CardModal";

type FilterKey = "section" | "subsection" | "lean";

type Props = {
  items: FeedItem[];
  filterKey?: FilterKey;
  filterLabel?: string;
  options?: ChipOption[];
};

/**
 * A filterable masonry feed. Pages are server components that pass data in;
 * this client component owns the interactive state (selected filter, open card).
 */
export default function SectionFeed({ items, filterKey, filterLabel = "Filter", options = [] }: Props) {
  // useState is like a field on an object, except changing it re-renders the UI.
  const [filter, setFilter] = useState("all");
  const [openItem, setOpenItem] = useState<FeedItem | null>(null);

  // useMemo caches the filtered list and only recalculates when inputs change.
  const visible = useMemo(() => {
    if (!filterKey || filter === "all") return items;
    return items.filter((item) => item[filterKey] === filter);
  }, [items, filterKey, filter]);

  // useCallback keeps the same function between renders, so the modal's
  // useEffect doesn't re-run every time this component re-renders.
  const close = useCallback(() => setOpenItem(null), []);

  return (
    <section>
      {filterKey && options.length > 0 && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <FilterChips
            label={filterLabel}
            groupId={filterKey}
            options={options}
            value={filter}
            onChange={setFilter}
          />
          <p aria-live="polite" className="text-sm text-muted">
            {visible.length} {visible.length === 1 ? "item" : "items"}
          </p>
        </div>
      )}

      {visible.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line p-10 text-center">
          <p className="font-semibold">Nothing here for this filter yet.</p>
          <button
            type="button"
            onClick={() => setFilter("all")}
            className="mt-3 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white"
          >
            Show everything
          </button>
        </div>
      ) : (
        <MasonryGrid>
          {visible.map((item, i) => (
            <FeedCard key={item.id} item={item} index={i} onOpen={setOpenItem} />
          ))}
        </MasonryGrid>
      )}

      <CardModal item={openItem} onClose={close} />
    </section>
  );
}
