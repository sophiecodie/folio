import PageHeader from "@/components/PageHeader";
import SectionFeed from "@/components/SectionFeed";
import { getSection, liveNote } from "@/lib/feeds";
import { SECTIONS } from "@/lib/sources";

export const metadata = { title: "Science | Folio" };
export const revalidate = 1800; // seconds; Next needs a plain number here (matches REVALIDATE_SECONDS)

const TOPICS = ["AI", "Tech", "Physics", "Health"];

export default async function SciencePage() {
  const feed = await getSection("science");

  return (
    <>
      <PageHeader
        title="Science"
        blurb={SECTIONS.science.blurb}
        accent="bg-science"
        note={liveNote(feed)}
      />
      <SectionFeed
        items={feed.items}
        filterKey="subsection"
        filterLabel="Filter by topic"
        options={TOPICS.map((t) => ({ value: t, label: t }))}
      />
    </>
  );
}
