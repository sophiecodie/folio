"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/news", label: "News" },
  { href: "/science", label: "Science" },
  { href: "/culture", label: "Culture" },
  { href: "/bulletin", label: "Brain Bulletin" },
];

export default function Navbar() {
  // usePathname only works in client components, which is why this file
  // starts with "use client".
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-paper/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2 rounded-md">
          <span aria-hidden className="h-5 w-5 rotate-6 rounded-[4px] bg-brand-yellow shadow-[2px_2px_0_#1C1F2A]" />
          <span className="font-pixel text-3xl leading-none">Folio</span>
        </Link>

        <nav aria-label="Main" className="-mx-2 overflow-x-auto">
          <ul className="flex items-center gap-1 px-2">
            {NAV.map((item) => {
              const active =
                item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`relative isolate block whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                      active ? "text-ink" : "text-muted hover:text-ink"
                    }`}
                  >
                    {active && (
                      // layoutId makes this pill slide between links when the page changes
                      <motion.span
                        layoutId="nav-active"
                        className="absolute inset-0 -z-10 rounded-full bg-brand-yellow"
                        transition={{ type: "spring", stiffness: 400, damping: 32 }}
                      />
                    )}
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </header>
  );
}
