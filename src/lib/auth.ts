import { cookies } from "next/headers";
import { timingSafeEqual } from "crypto";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { shops, type Shop } from "@/db/schema";
import {
  SHOP_SESSION_COOKIE,
  SUPER_SESSION_COOKIE,
  SESSION_MAX_AGE,
  createSessionToken,
  readSessionSubject,
} from "./session";

const SHOP_SUBJECT_PREFIX = "shop:";
const SUPER_SUBJECT = "super";

function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: SESSION_MAX_AGE,
    path: "/",
  };
}

/* ----------------------------- Shop (reseller) ---------------------------- */

// Returns the authenticated shop's id from the session cookie, or null.
export async function getShopSessionId(): Promise<string | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get(SHOP_SESSION_COOKIE);
  if (!session?.value) return null;
  const subject = await readSessionSubject(session.value);
  if (!subject || !subject.startsWith(SHOP_SUBJECT_PREFIX)) return null;
  return subject.slice(SHOP_SUBJECT_PREFIX.length);
}

// Returns the authenticated shop, or null.
export async function getCurrentShop(): Promise<Shop | null> {
  const shopId = await getShopSessionId();
  if (!shopId) return null;
  const [shop] = await db.select().from(shops).where(eq(shops.id, shopId)).limit(1);
  if (!shop) return null;
  return shop;
}

export async function setShopSession(shopId: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(
    SHOP_SESSION_COOKIE,
    await createSessionToken(`${SHOP_SUBJECT_PREFIX}${shopId}`),
    sessionCookieOptions()
  );
}

export async function clearShopSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SHOP_SESSION_COOKIE);
}

/* ------------------------------ Super admin ------------------------------- */

export async function isSuperAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get(SUPER_SESSION_COOKIE);
  if (!session?.value) return false;
  const subject = await readSessionSubject(session.value);
  return subject === SUPER_SUBJECT;
}

export async function setSuperSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(
    SUPER_SESSION_COOKIE,
    await createSessionToken(SUPER_SUBJECT),
    sessionCookieOptions()
  );
}

export async function clearSuperSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SUPER_SESSION_COOKIE);
}

export function verifySuperPin(pin: string): boolean {
  const superPin = process.env.SUPER_ADMIN_PIN;
  if (!superPin) return false;
  try {
    const inputBuffer = Buffer.from(pin);
    const superBuffer = Buffer.from(superPin);
    if (inputBuffer.length !== superBuffer.length) return false;
    return timingSafeEqual(inputBuffer, superBuffer);
  } catch {
    return false;
  }
}
