import Link from "next/link";
import SectionFeed from "@/components/SectionFeed";
import SourceTicker from "@/components/SourceTicker";
import { mixedFeed } from "@/lib/mockData";
import { SECTIONS } from "@/lib/sources";

// This is a Server Component (no "use client"), so it runs on the server and
// sends finished HTML. In Phase 2 it will fetch live feeds right here.
export default function HomePage() {
  const items = mixedFeed();
  const sectionOptions = (Object.keys(SECTIONS) as (keyof typeof SECTIONS)[]).map((key) => ({
    value: key,
    label: SECTIONS[key].label,
  }));

  return (
    <>
      <section className="pb-10 pt-12 sm:pb-14 sm:pt-20">
        <h1 className="max-w-4xl text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
          Read across the spectrum. Pin what sparks an idea.
        </h1>
        <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">
          News, research, and culture from dozens of sources on one board. Save anything to your
          Brain Bulletin and build on it.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/news"
            className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white hover:bg-ink/85"
          >
            Browse the news
          </Link>
          <Link
            href="/bulletin"
            className="rounded-full border border-ink bg-brand-yellow px-5 py-2.5 text-sm font-semibold text-ink hover:brightness-95"
          >
            Open Brain Bulletin
          </Link>
        </div>
      </section>

      <SourceTicker />

      <div className="pt-10">
        <SectionFeed
          items={items}
          filterKey="section"
          filterLabel="Filter by section"
          options={sectionOptions}
        />
      </div>
    </>
  );
}
