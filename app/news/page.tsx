import PageHeader from "@/components/PageHeader";
import SectionFeed from "@/components/SectionFeed";
import { NEWS } from "@/lib/mockData";
import { LEANS, SECTIONS } from "@/lib/sources";

export const metadata = { title: "News | Folio" };

export default function NewsPage() {
  return (
    <>
      <PageHeader
        title="News"
        blurb={SECTIONS.news.blurb}
        accent="bg-news"
        note="Showing sample stories. Live feeds are connected in Phase 2."
      />
      <SectionFeed
        items={NEWS}
        filterKey="lean"
        filterLabel="Filter by outlet lean"
        options={LEANS.map((l) => ({ value: l.value, label: l.label }))}
      />
    </>
  );
}
