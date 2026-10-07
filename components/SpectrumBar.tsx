import type { Lean } from "@/lib/types";
import { LEANS, leanInfo } from "@/lib/sources";

/**
 * Five small segments from left to right, with the outlet's lean highlighted.
 * The text label is always shown too, so the meaning never depends on color alone.
 */
export default function SpectrumBar({ lean }: { lean: Lean }) {
  const info = leanInfo(lean);
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5" aria-hidden>
        {LEANS.map((l) => (
          <span
            key={l.value}
            className={`h-1.5 w-3.5 rounded-full ${l.value === lean ? l.bg : "bg-line"}`}
          />
        ))}
      </div>
      <span className="text-xs text-muted">
        <span className="sr-only">Outlet lean: </span>
        {info.label}
      </span>
    </div>
  );
}
