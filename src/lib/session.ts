const SESSION_COOKIE = "admin_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

function getSecret(): string {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    throw new Error("ADMIN_PASSWORD is not configured");
  }
  return password;
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

export async function createSessionToken(): Promise<string> {
  const expires = Date.now() + SESSION_MAX_AGE * 1000;
  const payload = `authenticated:${expires}`;
  const signature = await sign(payload);
  return `${payload}:${signature}`;
}

export async function verifySessionToken(token: string): Promise<boolean> {
  const parts = token.split(":");
  if (parts.length !== 3) return false;

  const [label, expiresStr, signature] = parts;
  if (label !== "authenticated") return false;

  const expires = parseInt(expiresStr, 10);
  if (isNaN(expires) || Date.now() > expires) return false;

  const expectedSignature = await sign(`${label}:${expiresStr}`);
  return signature === expectedSignature;
}

export { SESSION_COOKIE, SESSION_MAX_AGE };
