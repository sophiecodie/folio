import PageHeader from "@/components/PageHeader";
import BoardsOverview from "@/components/BoardsOverview";

export const metadata = { title: "Brain Bulletin | Folio" };

/**
 * Boards are stored in the browser (localStorage), so the server renders only
 * the header and BoardsOverview fills in the boards once the page loads.
 */
export default function BulletinPage() {
  return (
    <>
      <PageHeader
        title="Brain Bulletin"
        blurb="Make a board for each project or train of thought. Pin sources from any feed, jot notes beside them, and connect a few pins into a new idea."
        accent="bg-brand-yellow"
      />
      <BoardsOverview />
    </>
  );
}
