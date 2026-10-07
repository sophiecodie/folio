import PageHeader from "@/components/PageHeader";
import SectionFeed from "@/components/SectionFeed";
import { getSection, liveNote } from "@/lib/feeds";
import { LEANS, SECTIONS } from "@/lib/sources";

export const metadata = { title: "News | Folio" };
export const revalidate = 1800; // seconds; Next needs a plain number here (matches REVALIDATE_SECONDS)

export default async function NewsPage() {
  const feed = await getSection("news");

  return (
    <>
      <PageHeader
        title="News"
        blurb={SECTIONS.news.blurb}
        accent="bg-news"
        note={liveNote(feed)}
      />
      <SectionFeed
        items={feed.items}
        filterKey="lean"
        filterLabel="Filter by outlet lean"
        options={LEANS.map((l) => ({ value: l.value, label: l.label }))}
      />
    </>
  );
}
