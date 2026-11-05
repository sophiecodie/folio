<h1 align="center">📚 Folio</h1>

<p align="center">
  <strong>Pinterest for all kinds of literature.</strong><br>
  News from across the political spectrum, fresh science preprints, pop culture, and a bulletin board to connect the ideas.
</p>

<p align="center">
  <a href="https://folio-ivory-mu.vercel.app"><strong>🌐 Try it live → folio-ivory-mu.vercel.app</strong></a>
</p>

<p align="center">
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-14-black?logo=next.js">
  <img alt="React" src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white">
  <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwindcss&logoColor=white">
  <img alt="Deployed on Vercel" src="https://img.shields.io/badge/Deployed%20on-Vercel-000?logo=vercel">
</p>

---

## What it is

Folio pulls live headlines, papers and reviews into one visual, masonry-style feed. Every news card shows where its
outlet sits on the political spectrum, so you can see who is covering what. Pin anything that catches your eye to a
**Brain Bulletin** board, then add notes and ideas that link pins together.

## Features

| | |
| --- | --- |
| 📰 **News** | Headlines from 12 outlets, from The Guardian and NPR through Reuters, BBC and the WSJ to the New York Post and Fox News. Each card has a **lean spectrum bar**, and you can filter by lean. |
| 🔬 **Science** | New preprints straight from the **arXiv, medRxiv and bioRxiv** APIs, plus Ars Technica, The Verge and MIT Technology Review. |
| 🎬 **Culture** | Film, music, books and TV from Variety, Rolling Stone, Pitchfork and Book Riot. |
| 📌 **Brain Bulletin** | Make color-coded boards, pin stories to them, jot notes, and write **idea pins** that link several pins together. Saved in your browser, so no account is needed. |
| ⚡ **Always fresh, never empty** | Feeds are fetched on the server and cached for 30 minutes. If one source fails it's skipped, and if a whole section is down the page falls back to sample stories. |

## How it works

```
RSS / Atom feeds ─┐
arXiv API ────────┼─► lib/feeds.ts ─► one FeedItem shape ─► Next.js server render (cached 30 min) ─► masonry feed
medRxiv/bioRxiv ──┘                                                                                   │
                                                                         Pin ▼
                                                     Brain Bulletin (React context + localStorage)
```

- **`lib/sources.ts`** is the one place every source lives, with its section, lean rating and feed URL.
- **`lib/feeds.ts`** fetches everything server-side with timeouts, normalizes it, and dedupes it.
- **`lib/bulletin.ts`** and **`components/BulletinProvider.tsx`** hold boards and pins and persist them locally.

> Lean labels are approximate and describe the outlet, not the individual story. They're based on publicly
> available media-bias ratings and can be edited in `lib/sources.ts`.

## Tech stack

Next.js 14 (App Router) · React 18 · TypeScript · Tailwind CSS · Framer Motion · fast-xml-parser · next/font ·
Vercel

## Run it locally

```bash
npm install
npm run dev      # http://localhost:3000
```

No API keys are needed. Every feed is public.

## Project structure

```
app/
├── page.tsx              Mixed home feed
├── news/ science/ culture/   Section feeds
└── bulletin/             Boards overview + individual boards
components/               Cards, masonry grid, filters, spectrum bar, board UI
lib/
├── sources.ts            Every source, its section and lean
├── feeds.ts              Live fetchers + fallback
├── bulletin.ts           Board / pin model
└── mockData.ts           Sample stories for offline fallback
```

## Add a source

Add a line to `SOURCES` in `lib/sources.ts`:

```ts
{ name: "Your Outlet", section: "news", lean: "center", feedUrl: "https://example.com/rss" }
```

## About

Built by **[Sophie Shih](https://sophieshih.com)**. Ideas and feedback are welcome:
[open an issue](https://github.com/sophiecodie/folio/issues).
