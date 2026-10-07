import PageHeader from "@/components/PageHeader";
import SectionFeed from "@/components/SectionFeed";
import { CULTURE } from "@/lib/mockData";
import { SECTIONS } from "@/lib/sources";

export const metadata = { title: "Culture | Folio" };

const TOPICS = ["Film", "Music", "Books", "TV"];

export default function CulturePage() {
  return (
    <>
      <PageHeader
        title="Culture"
        blurb={SECTIONS.culture.blurb}
        accent="bg-culture"
        note="Showing sample stories. Live feeds are connected in Phase 2."
      />
      <SectionFeed
        items={CULTURE}
        filterKey="subsection"
        filterLabel="Filter by medium"
        options={TOPICS.map((t) => ({ value: t, label: t }))}
      />
    </>
  );
}
