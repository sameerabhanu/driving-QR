// Billing rule: a shop's first 5 client pages in a month are free; the 6th page
// (and beyond) makes that month billable at the flat monthly fee.
export const BILLING_FREE_LIMIT = 5;
export const MONTHLY_FEE = 1000;

const SHORT_CODE_ALPHABET = "abcdefghijkmnpqrstuvwxyz23456789"; // no look-alikes
const SHORT_CODE_LENGTH = 7;

// Generates a random URL-safe short code for a page (e.g. "k7m2p9q").
export function generateShortCode(length: number = SHORT_CODE_LENGTH): string {
  let code = "";
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  for (let i = 0; i < length; i++) {
    code += SHORT_CODE_ALPHABET[bytes[i] % SHORT_CODE_ALPHABET.length];
  }
  return code;
}

// "YYYY-MM" key for a given date, used as the billing period identifier.
export function getMonthKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

// A page is billable in a month once the shop exceeds the free page limit.
export function isBillable(pageCount: number): boolean {
  return pageCount > BILLING_FREE_LIMIT;
}

export function computeAmountDue(pageCount: number): number {
  return isBillable(pageCount) ? MONTHLY_FEE : 0;
}

export function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

export function formatMonthKey(monthKey: string): string {
  const [year, month] = monthKey.split("-").map((n) => parseInt(n, 10));
  if (!year || !month) return monthKey;
  return `${MONTHS[month - 1]} ${year}`;
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function getBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_BASE_URL;
  if (!url) {
    throw new Error("NEXT_PUBLIC_BASE_URL is not configured");
  }
  return url.replace(/\/$/, "");
}

// Public URL of a landing page from its short code, e.g. https://host/p/k7m2p9q
export function getPageUrl(shortCode: string): string {
  return `${getBaseUrl()}/p/${shortCode}`;
}

export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}
