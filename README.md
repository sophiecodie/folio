# Folio

"Pinterest for all kinds of literature." News from across the political spectrum,
preprints from arXiv/medRxiv/bioRxiv, pop culture, and a Brain Bulletin board for ideas.

Built with Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Framer Motion,
and next/font. Deploys to Vercel.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Where things live

- `app/` pages (`app/news/page.tsx` is `/news`)
- `components/` UI pieces (cards, grid, modal, filters)
- `lib/types.ts` the shared `FeedItem` shape
- `lib/sources.ts` every source, its section, and its approximate lean
- `lib/mockData.ts` Phase 1 sample data (replaced by live feeds in Phase 2)
- `tailwind.config.ts` colors and fonts

## Build phases

1. Scaffold, theme, navbar, masonry grid, cards, modal (sample data) — done
2. Live fetchers for RSS, arXiv, medRxiv/bioRxiv
3. News balance features (compare coverage, balance meter)
4. Brain Bulletin (pins, notes, Idea cards, boards, saved in localStorage)
5. Polish and Vercel deploy
# folio
