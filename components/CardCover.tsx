"use client";

import { useEffect, useRef, useState } from "react";
import type { FeedItem } from "@/lib/types";
import { SECTIONS } from "@/lib/sources";

/**
 * The top of a card. Uses the article's image when one exists; otherwise
 * (or if the image fails to load) draws a cover in the section's color with
 * the source name in VT323.
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
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // A cached image can finish loading before React attaches onLoad,
  // so check once after mounting too.
  useEffect(() => {
    if (imgRef.current?.complete && imgRef.current.naturalWidth > 0) setLoaded(true);
  }, []);

  if (item.imageUrl && !failed) {
    return (
      <div className={`relative w-full overflow-hidden ${section.bg} ${aspect}`} style={section.pattern}>
        {/* A plain <img> is used because feed images come from many unknown domains. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={imgRef}
          src={item.imageUrl}
          alt=""
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          draggable={false}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
        />
      </div>
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
