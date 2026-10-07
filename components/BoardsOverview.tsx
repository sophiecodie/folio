"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { BOARD_COLORS, type Board, type Pin } from "@/lib/bulletin";
import { SECTIONS } from "@/lib/sources";
import { useBulletin } from "./BulletinProvider";
import BoardForm from "./BoardForm";

/** The Brain Bulletin home: every board as a tile, plus a tile for making a new one. */
export default function BoardsOverview() {
  const { ready, boards, pins, pinsFor, createBoard } = useBulletin();
  const [creating, setCreating] = useState(false);

  if (!ready) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
        {[0, 1, 2].map((i) => (
          <div key={i} className="aspect-[3/2] animate-pulse rounded-2xl bg-line/60" />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="mb-6 flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="text-xl font-bold">Your boards</h2>
        <p className="text-sm text-muted">
          {boards.length} {boards.length === 1 ? "board" : "boards"} · {pins.length}{" "}
          {pins.length === 1 ? "pin" : "pins"} · saved on this device
        </p>
      </div>

      <ul className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
        {boards.map((board, i) => (
          <motion.li
            key={board.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: Math.min(i, 8) * 0.04 }}
          >
            <BoardTile board={board} pins={pinsFor(board.id)} />
          </motion.li>
        ))}

        <li>
          {creating ? (
            <div className="rounded-2xl border border-line bg-card p-5">
              <BoardForm
                submitLabel="Create board"
                onSubmit={(v) => {
                  createBoard(v);
                  setCreating(false);
                }}
                onCancel={() => setCreating(false)}
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setCreating(true)}
              className="flex aspect-[3/2] w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-line text-muted transition-colors hover:border-ink hover:text-ink"
            >
              <span aria-hidden className="text-4xl leading-none">+</span>
              <span className="font-semibold">New board</span>
            </button>
          )}
        </li>
      </ul>

      <p className="mt-12 max-w-xl text-sm leading-relaxed text-muted">
        Tap <span className="font-semibold text-ink">Save</span> on any story in News, Science, or Culture to
        pin it to a board. Inside a board you can add notes, connect pins into an idea, and drag pins to
        rearrange them.
      </p>
    </>
  );
}

function BoardTile({ board, pins }: { board: Board; pins: Pin[] }) {
  const color = BOARD_COLORS[board.color];
  const [first, second, third] = pins;

  return (
    <Link href={`/bulletin/${board.id}`} className="group block rounded-2xl">
      {/* Pinterest-style collage: one big pin on the left, two small ones stacked on the right. */}
      <div className="grid aspect-[3/2] grid-cols-3 grid-rows-2 gap-0.5 overflow-hidden rounded-2xl bg-line transition-transform group-hover:-translate-y-1">
        {pins.length === 0 ? (
          <div className={`col-span-3 row-span-2 flex items-end p-4 ${color.bg} ${color.text}`}>
            <span className="font-pixel text-3xl leading-none opacity-80">Empty board</span>
          </div>
        ) : (
          <>
            <Thumb pin={first} className="col-span-2 row-span-2" />
            <Thumb pin={second} className="" />
            <Thumb pin={third} className="" />
          </>
        )}
      </div>
      <div className="mt-3 flex items-start gap-2.5">
        <span aria-hidden className={`mt-1.5 h-3 w-3 shrink-0 rotate-6 rounded-[3px] ${color.bg}`} />
        <div className="min-w-0">
          <h3 className="truncate text-lg font-bold leading-tight group-hover:underline">{board.name}</h3>
          <p className="text-sm text-muted">
            {pins.length} {pins.length === 1 ? "pin" : "pins"}
            {board.description && <> · {board.description}</>}
          </p>
        </div>
      </div>
    </Link>
  );
}

/** A tiny preview of one pin for the board collage. */
function Thumb({ pin, className }: { pin?: Pin; className: string }) {
  if (!pin) return <div className={`bg-paper ${className}`} />;

  if (pin.kind === "note") {
    return (
      <div className={`overflow-hidden bg-brand-yellow p-3 ${className}`}>
        <p className="line-clamp-4 text-xs font-medium leading-snug">{pin.text}</p>
      </div>
    );
  }
  if (pin.kind === "idea") {
    return (
      <div className={`overflow-hidden bg-card p-3 ${className}`}>
        <p className="font-pixel text-lg leading-none text-muted">Idea</p>
        <p className="mt-1 line-clamp-3 text-xs font-bold leading-snug">{pin.title}</p>
      </div>
    );
  }

  const section = SECTIONS[pin.item.section];
  return (
    <div className={`relative overflow-hidden ${section.bg} ${className}`} style={section.pattern}>
      <span className="absolute bottom-2 left-2 right-2 font-pixel text-xl leading-none text-white">
        {pin.item.source}
      </span>
      {pin.item.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={pin.item.imageUrl}
          alt=""
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={(e) => (e.currentTarget.style.display = "none")}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
    </div>
  );
}
