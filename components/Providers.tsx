"use client";

import { MotionConfig } from "framer-motion";

/**
 * Wraps the app in client-side settings.
 * reducedMotion="user" tells Framer Motion to skip movement animations for
 * anyone who has "reduce motion" turned on in their operating system.
 */
export default function Providers({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
