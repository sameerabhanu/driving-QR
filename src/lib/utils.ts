// Credit model: shops buy prepaid credits in packs. Each page create OR renew
// consumes 1 credit. 100 credits = ₹2000 (₹20 per credit).
export const CREDITS_PER_PACK = 100;
export const PACK_PRICE_INR = 2000;
export const CREDIT_UNIT_PRICE_INR = PACK_PRICE_INR / CREDITS_PER_PACK; // ₹20

export function creditsFromPacks(packs: number): number {
  return packs * CREDITS_PER_PACK;
}

export function amountFromPacks(packs: number): number {
  return packs * PACK_PRICE_INR;
}

export function amountFromCredits(credits: number): number {
  return credits * CREDIT_UNIT_PRICE_INR;
}

// Computes a page's expiry: 2 years after the anchor, snapped to the 1st of a
// month (UTC). If the anchor is already the 1st, keep that month; otherwise roll
// to the 1st of the next month — then add 2 years.
export function computeExpiryDate(anchor: Date = new Date()): Date {
  const year = anchor.getUTCFullYear();
  const month = anchor.getUTCMonth();
  const day = anchor.getUTCDate();
  const baseMonth = day === 1 ? month : month + 1;
  return new Date(Date.UTC(year + 2, baseMonth, 1, 0, 0, 0, 0));
}

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

// "YYYY-MM" key for a given date, used as the month identifier.
export function getMonthKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
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
