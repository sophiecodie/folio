"use client";

import { MotionConfig } from "framer-motion";
import BulletinProvider from "./BulletinProvider";

/**
 * Wraps the app in client-side settings.
 * reducedMotion="user" tells Framer Motion to skip movement animations for
 * anyone who has "reduce motion" turned on in their operating system.
 * BulletinProvider shares Brain Bulletin boards with every page.
 */
export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <BulletinProvider>{children}</BulletinProvider>
    </MotionConfig>
  );
}
