"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";

type Props = {
  anchor: React.RefObject<HTMLElement>;
  onClose: () => void;
  label: string;
  width?: number;
  children: React.ReactNode;
};

/**
 * A small floating panel attached to a button. It renders into <body> (a
 * "portal") so it isn't clipped by cards with overflow-hidden, and it sits
 * above the card modal. Follows its button on scroll, and closes on Escape,
 * outside click, or when the button scrolls off screen.
 */
export default function Popover({ anchor, onClose, label, width = 264, children }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  // Keep the latest onClose in a ref so the listeners below are set up once,
  // instead of re-running (and stealing focus) every time the parent re-renders.
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  // Below the button if it fits, otherwise above. Right edges line up.
  const place = useCallback(() => {
    const a = anchor.current?.getBoundingClientRect();
    const panel = panelRef.current;
    if (!a || !panel) return;
    if (a.bottom < 0 || a.top > window.innerHeight) return closeRef.current();
    const h = panel.offsetHeight;
    const below = a.bottom + 8;
    const top = below + h > window.innerHeight - 8 && a.top - 8 - h > 8 ? a.top - 8 - h : below;
    const left = Math.min(Math.max(8, a.right - width), window.innerWidth - width - 8);
    setPos({ top, left });
  }, [anchor, width]);

  // Measure before paint so the panel never flashes in the wrong spot.
  useLayoutEffect(place, [place]);

  useEffect(() => {
    const anchorEl = anchor.current;
    const close = () => closeRef.current();
    panelRef.current?.querySelector<HTMLElement>("button, input, textarea, select")?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      // Capture phase + stopPropagation, so Escape closes only this, not the card modal behind it.
      e.stopPropagation();
      close();
      anchorEl?.focus();
    };
    const onPointer = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!panelRef.current?.contains(t) && !anchorEl?.contains(t)) close();
    };
    const onScroll = (e: Event) => {
      if (!panelRef.current?.contains(e.target as Node)) place();
    };
    window.addEventListener("keydown", onKey, true);
    document.addEventListener("pointerdown", onPointer, true);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", place);
    return () => {
      window.removeEventListener("keydown", onKey, true);
      document.removeEventListener("pointerdown", onPointer, true);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", place);
    };
  }, [anchor, place]);

  return createPortal(
    <motion.div
      ref={panelRef}
      role="dialog"
      aria-label={label}
      initial={{ opacity: 0, y: -4, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.14 }}
      // React events bubble through portals to the component tree, so stop
      // clicks here from also opening the card or closing the modal behind.
      onClick={(e) => e.stopPropagation()}
      style={{ position: "fixed", top: pos?.top ?? -9999, left: pos?.left ?? -9999, width }}
      className="z-[60] rounded-2xl border border-line bg-card p-2 text-ink shadow-[0_12px_40px_-12px_rgba(28,31,42,0.35)]"
    >
      {children}
    </motion.div>,
    document.body,
  );
}
