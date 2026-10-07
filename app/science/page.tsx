import PageHeader from "@/components/PageHeader";
import SectionFeed from "@/components/SectionFeed";
import { SCIENCE } from "@/lib/mockData";
import { SECTIONS } from "@/lib/sources";

export const metadata = { title: "Science | Folio" };

const TOPICS = ["AI", "Tech", "Physics", "Health"];

export default function SciencePage() {
  return (
    <>
      <PageHeader
        title="Science"
        blurb={SECTIONS.science.blurb}
        accent="bg-science"
        note="Showing sample papers. Live feeds are connected in Phase 2."
      />
      <SectionFeed
        items={SCIENCE}
        filterKey="subsection"
        filterLabel="Filter by topic"
        options={TOPICS.map((t) => ({ value: t, label: t }))}
      />
    </>
  );
}
