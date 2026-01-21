/**
 * Helper to safely convert date to ISO string
 * Handles Date objects, strings, timestamps (numbers), MongoDB BSON dates, and other formats
 */
export const toISOString = (date: unknown): string => {
  if (!date) return "";
  if (typeof date === "string") return date;
  if (typeof date === "number") return new Date(date).toISOString();
  if (date instanceof Date) return date.toISOString();
  // Handle MongoDB date objects or other formats
  if (typeof date === "object" && date !== null) {
    // Try to convert to string if it has a toString method
    const str = String(date);
    if (str !== "[object Object]") return str;
  }
  return "";
};

/**
 * Format a date to German locale string
 */
export const formatDateDE = (date: unknown): string => {
  const isoString = toISOString(date);
  if (!isoString) return "";

  try {
    return new Date(isoString).toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return "";
  }
};

/**
 * Format a date to relative time (e.g., "vor 2 Stunden")
 */
export const formatRelativeTime = (date: unknown): string => {
  const isoString = toISOString(date);
  if (!isoString) return "";

  try {
    const now = new Date();
    const then = new Date(isoString);
    const diffMs = now.getTime() - then.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return "gerade eben";
    if (diffMin < 60) return `vor ${diffMin} Minute${diffMin !== 1 ? "n" : ""}`;
    if (diffHour < 24)
      return `vor ${diffHour} Stunde${diffHour !== 1 ? "n" : ""}`;
    if (diffDay < 7) return `vor ${diffDay} Tag${diffDay !== 1 ? "en" : ""}`;

    return formatDateDE(date);
  } catch {
    return "";
  }
};
