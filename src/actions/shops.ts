"use server";

import { revalidatePath } from "next/cache";
import { eq, and, gte, lt, sql } from "drizzle-orm";
import { db } from "@/db";
import { shops, pages, billing, type Shop } from "@/db/schema";
import { shopSchema } from "@/lib/validations";
import { isSuperAuthenticated } from "@/lib/auth";
import { computeAmountDue, getMonthKey, isBillable } from "@/lib/utils";

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
  pagesThisMonth: number;
  pagesLastMonth: number;
  pagesTotal: number;
  billable: boolean;
  amountDue: number;
  paid: boolean;
}

async function generateUniqueShopPin(): Promise<string> {
  // 4-digit PIN space: 1000-9999. Retry to avoid collisions.
  for (let attempt = 0; attempt < 200; attempt++) {
    const pin = String(Math.floor(1000 + Math.random() * 9000));
    const [existing] = await db
      .select({ id: shops.id })
      .from(shops)
      .where(eq(shops.pin, pin))
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
    });

    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid input" };
    }

    const pin = await generateUniqueShopPin();

    const [shop] = await db
      .insert(shops)
      .values({
        shopName: parsed.data.shopName,
        ownerName: parsed.data.ownerName,
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

export async function setShopStatusAction(
  id: string,
  status: "active" | "suspended"
): Promise<ActionResult> {
  try {
    await requireSuper();
    await db.update(shops).set({ status }).where(eq(shops.id, id));
    revalidatePath("/superadmin");
    return { success: true };
  } catch (error) {
    console.error("Set shop status error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update shop",
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

// Marks (or unmarks) the current month as paid for a shop. The amount is a
// snapshot of what the shop owes this month based on its page activity.
export async function setBillingPaidAction(
  shopId: string,
  paid: boolean
): Promise<ActionResult> {
  try {
    await requireSuper();

    const month = getMonthKey();
    const { startOfMonth, startOfNextMonth } = monthBounds(new Date());

    const [row] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(pages)
      .where(
        and(
          eq(pages.shopId, shopId),
          gte(pages.createdAt, startOfMonth),
          lt(pages.createdAt, startOfNextMonth)
        )
      );

    const pagesCount = row?.count ?? 0;
    const amountDue = computeAmountDue(pagesCount);

    await db
      .insert(billing)
      .values({
        shopId,
        month,
        pagesCount,
        amountDue,
        paid,
        paidAt: paid ? new Date() : null,
      })
      .onConflictDoUpdate({
        target: [billing.shopId, billing.month],
        set: { pagesCount, amountDue, paid, paidAt: paid ? new Date() : null },
      });

    revalidatePath("/superadmin");
    return { success: true };
  } catch (error) {
    console.error("Set billing paid error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update billing",
    };
  }
}

function monthBounds(now: Date) {
  return {
    startOfMonth: new Date(now.getFullYear(), now.getMonth(), 1),
    startOfNextMonth: new Date(now.getFullYear(), now.getMonth() + 1, 1),
    startOfLastMonth: new Date(now.getFullYear(), now.getMonth() - 1, 1),
  };
}

export async function getShopsWithStats(): Promise<ShopWithStats[]> {
  await requireSuper();

  const now = new Date();
  const { startOfMonth, startOfNextMonth, startOfLastMonth } = monthBounds(now);
  const month = getMonthKey(now);

  const allShops = await db.select().from(shops).orderBy(shops.createdAt);

  const thisMonthCounts = await db
    .select({ shopId: pages.shopId, count: sql<number>`count(*)::int` })
    .from(pages)
    .where(and(gte(pages.createdAt, startOfMonth), lt(pages.createdAt, startOfNextMonth)))
    .groupBy(pages.shopId);

  const lastMonthCounts = await db
    .select({ shopId: pages.shopId, count: sql<number>`count(*)::int` })
    .from(pages)
    .where(and(gte(pages.createdAt, startOfLastMonth), lt(pages.createdAt, startOfMonth)))
    .groupBy(pages.shopId);

  const totalCounts = await db
    .select({ shopId: pages.shopId, count: sql<number>`count(*)::int` })
    .from(pages)
    .groupBy(pages.shopId);

  const paidRows = await db
    .select({ shopId: billing.shopId, paid: billing.paid })
    .from(billing)
    .where(eq(billing.month, month));

  const thisMap = new Map(thisMonthCounts.map((r) => [r.shopId, r.count]));
  const lastMap = new Map(lastMonthCounts.map((r) => [r.shopId, r.count]));
  const totalMap = new Map(totalCounts.map((r) => [r.shopId, r.count]));
  const paidMap = new Map(paidRows.map((r) => [r.shopId, r.paid]));

  return allShops.map((shop) => {
    const pagesThisMonth = thisMap.get(shop.id) ?? 0;
    return {
      ...shop,
      pagesThisMonth,
      pagesLastMonth: lastMap.get(shop.id) ?? 0,
      pagesTotal: totalMap.get(shop.id) ?? 0,
      billable: isBillable(pagesThisMonth),
      amountDue: computeAmountDue(pagesThisMonth),
      paid: paidMap.get(shop.id) ?? false,
    };
  });
}

export async function getSuperDashboardStats() {
  const shopsWithStats = await getShopsWithStats();

  const totalShops = shopsWithStats.length;
  const activeShops = shopsWithStats.filter((s) => s.status === "active").length;
  const suspendedShops = shopsWithStats.filter((s) => s.status === "suspended").length;
  const billableShops = shopsWithStats.filter((s) => s.billable).length;
  const pagesThisMonth = shopsWithStats.reduce((sum, s) => sum + s.pagesThisMonth, 0);
  const revenueThisMonth = shopsWithStats.reduce((sum, s) => sum + s.amountDue, 0);
  const collectedThisMonth = shopsWithStats
    .filter((s) => s.paid)
    .reduce((sum, s) => sum + s.amountDue, 0);

  return {
    totalShops,
    activeShops,
    suspendedShops,
    billableShops,
    pagesThisMonth,
    revenueThisMonth,
    collectedThisMonth,
  };
}
