import type { FeedItem } from "@/lib/types";
import { SECTIONS } from "@/lib/sources";

/**
 * The top of a card. Uses the article's image when one exists; otherwise
 * draws a cover in the section's color with the source name in VT323.
 */
export default function CardCover({
  item,
  aspect,
  large = false,
}: {
  item: FeedItem;
  aspect: string;
  large?: boolean;
}) {
  const section = SECTIONS[item.section];

  if (item.imageUrl) {
    return (
      // A plain <img> is used because feed images come from many unknown domains.
      // eslint-disable-next-line @next/next/no-img-element
      <img src={item.imageUrl} alt="" className={`w-full object-cover ${aspect}`} loading="lazy" />
    );
  }

  return (
    <div
      aria-hidden
      className={`relative flex w-full flex-col justify-between p-4 text-white ${section.bg} ${aspect}`}
      style={section.pattern}
    >
      <span className="text-xs font-semibold opacity-90">{item.subsection ?? section.label}</span>
      <span className={`font-pixel leading-[0.9] ${large ? "text-6xl" : "text-4xl"}`}>
        {item.source}
      </span>
    </div>
  );
}
