import PageHeader from "@/components/PageHeader";
import SectionFeed from "@/components/SectionFeed";
import { getSection, liveNote } from "@/lib/feeds";
import { SECTIONS } from "@/lib/sources";

export const metadata = { title: "Culture | Folio" };
export const revalidate = 1800; // seconds; Next needs a plain number here (matches REVALIDATE_SECONDS)

const TOPICS = ["Film", "Music", "Books", "TV"];

export default async function CulturePage() {
  const feed = await getSection("culture");

  return (
    <>
      <PageHeader
        title="Culture"
        blurb={SECTIONS.culture.blurb}
        accent="bg-culture"
        note={liveNote(feed)}
      />
      <SectionFeed
        items={feed.items}
        filterKey="subsection"
        filterLabel="Filter by medium"
        options={TOPICS.map((t) => ({ value: t, label: t }))}
      />
    </>
  );
}
