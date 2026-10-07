/**
 * Small formatting helpers.
 * Dates are formatted in UTC so the server and the browser produce the exact
 * same text. If they differed, React would warn about a "hydration mismatch".
 */
const dateFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

export function formatDate(iso: string): string {
  return dateFormat.format(new Date(iso));
}

export function formatAuthors(authors: string[], max = 3): string {
  if (authors.length <= max) return authors.join(", ");
  return `${authors.slice(0, max).join(", ")} and ${authors.length - max} more`;
}

/** Turns a string into a stable number, used to vary card cover shapes. */
export function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) | 0; // "| 0" keeps it a 32-bit int, like Java int overflow
  }
  return Math.abs(h);
}
