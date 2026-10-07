import type { Metadata } from "next";
import { Plus_Jakarta_Sans, VT323 } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Providers from "@/components/Providers";

// next/font downloads the fonts at build time and serves them from your own
// domain. `variable` exposes each font as a CSS variable used in tailwind.config.ts.
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

const vt323 = VT323({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-vt323",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Folio",
  description: "News, research, and culture from across the spectrum, plus a board for your ideas.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${jakarta.variable} ${vt323.variable}`}>
      <body className="min-h-screen bg-paper font-sans text-ink antialiased">
        <Providers>
          <a
            href="#main"
            className="sr-only z-50 rounded-md bg-brand-yellow px-3 py-2 font-semibold focus:not-sr-only focus:fixed focus:left-3 focus:top-3"
          >
            Skip to content
          </a>
          <Navbar />
          <main id="main" className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
