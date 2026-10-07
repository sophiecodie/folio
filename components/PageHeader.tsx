type Props = {
  title: string;
  blurb: string;
  accent: string; // a Tailwind bg class, e.g. "bg-news"
  note?: string;
};

export default function PageHeader({ title, blurb, accent, note }: Props) {
  return (
    <header className="pb-8 pt-10 sm:pt-14">
      <div className="flex items-center gap-3">
        <span aria-hidden className={`h-4 w-4 rotate-6 rounded-[4px] ${accent}`} />
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">{title}</h1>
      </div>
      <p className="mt-3 max-w-2xl text-lg leading-relaxed text-muted">{blurb}</p>
      {note && <p className="mt-4 text-sm text-muted">{note}</p>}
    </header>
  );
}
