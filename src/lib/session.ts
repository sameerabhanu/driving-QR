const SHOP_SESSION_COOKIE = "shop_session";
const SUPER_SESSION_COOKIE = "super_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET is not configured");
  }
  return secret;
}

async function sign(payload: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Creates a signed session token bound to a subject (e.g. a shop id, or "super").
export async function createSessionToken(subject: string): Promise<string> {
  const expires = Date.now() + SESSION_MAX_AGE * 1000;
  const payload = `${encodeURIComponent(subject)}:${expires}`;
  const signature = await sign(payload);
  return `${payload}:${signature}`;
}

// Verifies a token and returns its subject, or null if invalid/expired.
export async function readSessionSubject(token: string): Promise<string | null> {
  const parts = token.split(":");
  if (parts.length !== 3) return null;

  const [subjectEncoded, expiresStr, signature] = parts;

  const expires = parseInt(expiresStr, 10);
  if (isNaN(expires) || Date.now() > expires) return null;

  const expectedSignature = await sign(`${subjectEncoded}:${expiresStr}`);
  if (signature !== expectedSignature) return null;

  return decodeURIComponent(subjectEncoded);
}

export { SHOP_SESSION_COOKIE, SUPER_SESSION_COOKIE, SESSION_MAX_AGE };
