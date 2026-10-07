import BoardView from "@/components/BoardView";

export const metadata = { title: "Board | Brain Bulletin | Folio" };

// The board's contents live in the browser, so this page just hands the id
// from the URL (/bulletin/<boardId>) to the client component.
export default function BoardPage({ params }: { params: { boardId: string } }) {
  return <BoardView boardId={params.boardId} />;
}
