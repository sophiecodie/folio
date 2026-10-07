import PageHeader from "@/components/PageHeader";
import MasonryGrid from "@/components/MasonryGrid";

export const metadata = { title: "Brain Bulletin | Folio" };

/**
 * Phase 1 preview of the board's look. Phase 4 replaces these static pins
 * with real ones saved from the feeds, plus notes, Idea cards, and boards.
 */
const PREVIEW = [
  { kind: "note", text: "What if the news page grouped stories by event, so you could compare five outlets at once?", tilt: "-rotate-1" },
  { kind: "source", source: "arXiv", title: "Sample paper: Smaller language models that explain their own reasoning", tilt: "rotate-1" },
  { kind: "idea", title: "Idea: a study app that quizzes you on what you pinned this week", links: 3, tilt: "rotate-2" },
  { kind: "source", source: "Book Riot", title: "Sample list: New novels to read this month", tilt: "-rotate-2" },
  { kind: "note", text: "Ask the class: do bias labels help, or do they make people skip stories?", tilt: "rotate-1" },
] as const;

export default function BulletinPage() {
  return (
    <>
      <PageHeader
        title="Brain Bulletin"
        blurb="Collect sources from any feed, jot notes beside them, and connect a few pins into a new idea."
        accent="bg-brand-yellow"
        note="This is a preview of the board. Saving pins arrives in Phase 4."
      />

      <div className="rounded-3xl border border-line bg-card/60 p-4 sm:p-8">
        <MasonryGrid>
          {PREVIEW.map((pin, i) => (
            <div key={i} className={`relative mb-6 break-inside-avoid pt-2 ${pin.tilt}`}>
              {/* the pushpin */}
              <span aria-hidden className="absolute left-1/2 top-0 z-10 h-4 w-4 -translate-x-1/2 rounded-full border-2 border-ink bg-brand-yellow" />
              {pin.kind === "note" && (
                <div className="bg-brand-yellow p-5 pt-6 shadow-[3px_3px_0_#1C1F2A]">
                  <p className="text-[15px] font-medium leading-relaxed">{pin.text}</p>
                </div>
              )}
              {pin.kind === "source" && (
                <div className="rounded-xl border border-line bg-card p-5 pt-6">
                  <p className="font-pixel text-2xl leading-none text-muted">{pin.source}</p>
                  <p className="mt-2 font-semibold leading-snug">{pin.title}</p>
                </div>
              )}
              {pin.kind === "idea" && (
                <div className="rounded-xl border-2 border-ink bg-card p-5 pt-6">
                  <p className="text-lg font-bold leading-snug">{pin.title}</p>
                  <p className="mt-2 text-sm text-muted">Built from {pin.links} pins</p>
                </div>
              )}
            </div>
          ))}
        </MasonryGrid>
      </div>
    </>
  );
}
