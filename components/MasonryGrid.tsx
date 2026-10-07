/**
 * Pinterest-style layout using CSS columns. No library needed.
 * Each child should have `break-inside-avoid` so a card never splits
 * across two columns. Items flow top to bottom, then into the next column.
 */
export default function MasonryGrid({ children }: { children: React.ReactNode }) {
  return <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4">{children}</div>;
}
