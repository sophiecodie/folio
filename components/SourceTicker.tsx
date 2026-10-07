import { SOURCES, leanInfo, SECTIONS } from "@/lib/sources";

/**
 * A slow scrolling strip of every source, colored by lean (news) or section.
 * The list is rendered twice so the loop is seamless: the animation moves
 * left by exactly half its width, then starts again.
 * It stops moving for users who prefer reduced motion.
 */
export default function SourceTicker() {
  const names = SOURCES.map((s) => s.name);

  const row = SOURCES.map((s) => (
    <span key={s.name} className="flex items-center gap-2 whitespace-nowrap px-5">
      <span
        className={`h-2.5 w-2.5 rounded-full ${s.lean ? leanInfo(s.lean).bg : SECTIONS[s.section].bg}`}
      />
      {s.name}
    </span>
  ));

  return (
    <div className="relative -mx-4 overflow-hidden border-y border-line bg-card py-3 sm:-mx-6 lg:-mx-8">
      <p className="sr-only">Sources include {names.join(", ")}.</p>
      <div aria-hidden className="flex w-max animate-marquee font-pixel text-2xl motion-reduce:animate-none">
        <div className="flex">{row}</div>
        <div className="flex">{row}</div>
      </div>
    </div>
  );
}
