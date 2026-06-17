"use server";

import { revalidatePath } from "next/cache";
import { eq, and, gte, lt, sql } from "drizzle-orm";
import { db } from "@/db";
import { shops, pages, creditTransactions, type Shop } from "@/db/schema";
import { shopSchema } from "@/lib/validations";
import { isSuperAuthenticated } from "@/lib/auth";
import { amountFromCredits } from "@/lib/utils";

export type ActionResult<T = undefined> = {
  success: boolean;
  error?: string;
  data?: T;
};

async function requireSuper(): Promise<void> {
  if (!(await isSuperAuthenticated())) {
    throw new Error("Unauthorized");
  }
}

export interface ShopWithStats extends Shop {
  pagesTotal: number;
  expiringNextMonth: number;
}

async function generateUniqueShopPin(ownerName: string): Promise<string> {
  // 4-digit PIN space: 1000-9999. A PIN only needs to be unique per owner name,
  // so we only avoid collisions with the same owner.
  for (let attempt = 0; attempt < 200; attempt++) {
    const pin = String(Math.floor(1000 + Math.random() * 9000));
    const [existing] = await db
      .select({ id: shops.id })
      .from(shops)
      .where(and(eq(shops.ownerName, ownerName), eq(shops.pin, pin)))
      .limit(1);

    if (!existing) return pin;
  }

  throw new Error("Could not generate a unique PIN. Please try again.");
}

export async function createShopAction(
  _prevState: ActionResult<{ id: string; pin: string }> | ActionResult,
  formData: FormData
): Promise<ActionResult<{ id: string; pin: string }>> {
  try {
    await requireSuper();

    const parsed = shopSchema.safeParse({
      shopName: formData.get("shopName"),
      ownerName: formData.get("ownerName"),
      ownerPhone: formData.get("ownerPhone"),
    });

    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid input" };
    }

    const pin = await generateUniqueShopPin(parsed.data.ownerName);

    const [shop] = await db
      .insert(shops)
      .values({
        shopName: parsed.data.shopName,
        ownerName: parsed.data.ownerName,
        ownerPhone: parsed.data.ownerPhone,
        pin,
      })
      .returning();

    revalidatePath("/superadmin");

    return { success: true, data: { id: shop.id, pin: shop.pin } };
  } catch (error) {
    console.error("Create shop error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create shop",
    };
  }
}

export async function deleteShopAction(id: string): Promise<ActionResult> {
  try {
    await requireSuper();
    await db.delete(shops).where(eq(shops.id, id));
    revalidatePath("/superadmin");
    return { success: true };
  } catch (error) {
    console.error("Delete shop error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete shop",
    };
  }
}

// Adds prepaid credits to a shop and records a purchase in the ledger.
export async function addShopCreditsAction(
  shopId: string,
  credits: number
): Promise<ActionResult> {
  try {
    await requireSuper();

    if (!Number.isInteger(credits) || credits <= 0) {
      return { success: false, error: "Enter a positive number of credits" };
    }

    await db
      .update(shops)
      .set({ availableCredits: sql`${shops.availableCredits} + ${credits}` })
      .where(eq(shops.id, shopId));

    await db.insert(creditTransactions).values({
      shopId,
      kind: "purchase",
      creditsDelta: credits,
      amountInr: amountFromCredits(credits),
    });

    revalidatePath("/superadmin");
    return { success: true };
  } catch (error) {
    console.error("Add shop credits error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to add credits",
    };
  }
}

export async function getShopsWithStats(): Promise<ShopWithStats[]> {
  await requireSuper();

  const now = new Date();
  const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const startOfMonthAfter = new Date(now.getFullYear(), now.getMonth() + 2, 1);

  const allShops = await db.select().from(shops).orderBy(shops.createdAt);

  // Active (non-expired) page counts per shop.
  const totalCounts = await db
    .select({ shopId: pages.shopId, count: sql<number>`count(*)::int` })
    .from(pages)
    .where(gte(pages.expiresAt, now))
    .groupBy(pages.shopId);

  // Pages expiring during the next calendar month, per shop.
  const expiringCounts = await db
    .select({ shopId: pages.shopId, count: sql<number>`count(*)::int` })
    .from(pages)
    .where(
      and(gte(pages.expiresAt, startOfNextMonth), lt(pages.expiresAt, startOfMonthAfter))
    )
    .groupBy(pages.shopId);

  const totalMap = new Map(totalCounts.map((r) => [r.shopId, r.count]));
  const expiringMap = new Map(expiringCounts.map((r) => [r.shopId, r.count]));

  return allShops.map((shop) => ({
    ...shop,
    pagesTotal: totalMap.get(shop.id) ?? 0,
    expiringNextMonth: expiringMap.get(shop.id) ?? 0,
  }));
}

export async function getSuperDashboardStats() {
  const shopsWithStats = await getShopsWithStats();

  const [creditSalesRow] = await db
    .select({
      soldCredits: sql<number>`coalesce(sum(${creditTransactions.creditsDelta}), 0)::int`,
      revenue: sql<number>`coalesce(sum(${creditTransactions.amountInr}), 0)::int`,
    })
    .from(creditTransactions)
    .where(eq(creditTransactions.kind, "purchase"));

  const totalShops = shopsWithStats.length;
  const totalPages = shopsWithStats.reduce((sum, s) => sum + s.pagesTotal, 0);
  const totalCreditsAvailable = shopsWithStats.reduce(
    (sum, s) => sum + s.availableCredits,
    0
  );
  const expiringNextMonth = shopsWithStats.reduce(
    (sum, s) => sum + s.expiringNextMonth,
    0
  );

  return {
    totalShops,
    totalPages,
    totalCreditsAvailable,
    expiringNextMonth,
    soldCredits: creditSalesRow?.soldCredits ?? 0,
    lifetimeRevenue: creditSalesRow?.revenue ?? 0,
  };
}
