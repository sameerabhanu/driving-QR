"use server";

import { revalidatePath } from "next/cache";
import { eq, and, desc, gte, lt, sql } from "drizzle-orm";
import { db, withRetry } from "@/db";
import { pages, shops, type Page, type CustomButton } from "@/db/schema";
import { pageSchema } from "@/lib/validations";
import { getCurrentShop } from "@/lib/auth";
import { generateQrCode } from "@/lib/qr";
import { generateShortCode, computeAmountDue, BILLING_FREE_LIMIT } from "@/lib/utils";
import { generateBusinessContent } from "@/lib/ai";
import type { Shop } from "@/db/schema";

export type ActionResult<T = undefined> = {
  success: boolean;
  error?: string;
  data?: T;
};

async function requireShop(): Promise<Shop> {
  const shop = await getCurrentShop();
  if (!shop) {
    throw new Error("Unauthorized");
  }
  return shop;
}

function parseCustomButtons(formData: FormData): CustomButton[] {
  const labels = formData.getAll("customButtonLabels");
  const urls = formData.getAll("customButtonUrls");
  const buttons: CustomButton[] = [];

  for (let i = 0; i < labels.length; i++) {
    const label = String(labels[i]).trim();
    const url = String(urls[i]).trim();
    if (label && url) {
      buttons.push({ label, url });
    }
  }

  return buttons;
}

async function generateUniqueShortCode(): Promise<string> {
  // Retry on the rare chance of a collision.
  for (let attempt = 0; attempt < 6; attempt++) {
    const code = generateShortCode();
    const [existing] = await db
      .select({ id: pages.id })
      .from(pages)
      .where(eq(pages.shortCode, code))
      .limit(1);
    if (!existing) return code;
  }
  throw new Error("Could not generate a unique code, please try again");
}

export async function createPageAction(
  _prevState: ActionResult<{ id: string; shortCode: string }> | ActionResult,
  formData: FormData
): Promise<ActionResult<{ id: string; shortCode: string }>> {
  try {
    const shop = await requireShop();
    const customButtons = parseCustomButtons(formData);

    const parsed = pageSchema.safeParse({
      businessName: formData.get("businessName"),
      businessType: formData.get("businessType"),
      phoneNumber: formData.get("phoneNumber"),
      whatsappNumber: formData.get("whatsappNumber"),
      instagramUrl: formData.get("instagramUrl"),
      youtubeUrl: formData.get("youtubeUrl"),
      googleMapsUrl: formData.get("googleMapsUrl"),
      customButtons,
    });

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.errors[0]?.message ?? "Invalid input",
      };
    }

    // Generate AI content
    const aiContent = await generateBusinessContent(
      parsed.data.businessName,
      parsed.data.businessType
    );

    const shortCode = await generateUniqueShortCode();
    const { path: qrCodePath } = await generateQrCode(shortCode);

    const [page] = await db
      .insert(pages)
      .values({
        shopId: shop.id,
        shortCode,
        businessName: parsed.data.businessName,
        businessType: parsed.data.businessType,
        tagline: aiContent.tagline,
        benefits: aiContent.benefits,
        phoneNumber: parsed.data.phoneNumber || null,
        whatsappNumber: parsed.data.whatsappNumber || null,
        instagramUrl: parsed.data.instagramUrl || null,
        youtubeUrl: parsed.data.youtubeUrl || null,
        googleMapsUrl: parsed.data.googleMapsUrl || null,
        customButtons,
        qrCodePath,
      })
      .returning();

    revalidatePath("/admin");

    return {
      success: true,
      data: { id: page.id, shortCode: page.shortCode },
    };
  } catch (error) {
    console.error("Create page error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create page",
    };
  }
}

export async function updatePageAction(
  id: string,
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  try {
    const shop = await requireShop();
    const customButtons = parseCustomButtons(formData);

    const parsed = pageSchema.safeParse({
      businessName: formData.get("businessName"),
      businessType: formData.get("businessType"),
      phoneNumber: formData.get("phoneNumber"),
      whatsappNumber: formData.get("whatsappNumber"),
      instagramUrl: formData.get("instagramUrl"),
      youtubeUrl: formData.get("youtubeUrl"),
      googleMapsUrl: formData.get("googleMapsUrl"),
      customButtons,
    });

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.errors[0]?.message ?? "Invalid input",
      };
    }

    // Scope by shop id to enforce tenant isolation.
    const [current] = await db
      .select()
      .from(pages)
      .where(and(eq(pages.id, id), eq(pages.shopId, shop.id)))
      .limit(1);

    if (!current) {
      return { success: false, error: "Page not found" };
    }

    // Regenerate AI content on every update to match current business details.
    const aiContent = await generateBusinessContent(
      parsed.data.businessName,
      parsed.data.businessType
    );

    await db
      .update(pages)
      .set({
        businessName: parsed.data.businessName,
        businessType: parsed.data.businessType,
        tagline: aiContent.tagline,
        benefits: aiContent.benefits,
        phoneNumber: parsed.data.phoneNumber || null,
        whatsappNumber: parsed.data.whatsappNumber || null,
        instagramUrl: parsed.data.instagramUrl || null,
        youtubeUrl: parsed.data.youtubeUrl || null,
        googleMapsUrl: parsed.data.googleMapsUrl || null,
        customButtons,
      })
      .where(and(eq(pages.id, id), eq(pages.shopId, shop.id)));

    revalidatePath("/admin");
    revalidatePath(`/p/${current.shortCode}`);

    return { success: true };
  } catch (error) {
    console.error("Update page error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update page",
    };
  }
}

export async function deletePageAction(id: string): Promise<ActionResult> {
  try {
    const shop = await requireShop();

    const [page] = await db
      .select()
      .from(pages)
      .where(and(eq(pages.id, id), eq(pages.shopId, shop.id)))
      .limit(1);

    if (!page) {
      return { success: false, error: "Page not found" };
    }

    await db.delete(pages).where(and(eq(pages.id, id), eq(pages.shopId, shop.id)));

    revalidatePath("/admin");
    revalidatePath(`/p/${page.shortCode}`);

    return { success: true };
  } catch (error) {
    console.error("Delete page error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete page",
    };
  }
}

export async function getShopPages(): Promise<Page[]> {
  const shop = await requireShop();
  return db
    .select()
    .from(pages)
    .where(eq(pages.shopId, shop.id))
    .orderBy(desc(pages.createdAt));
}

export async function getPageById(id: string): Promise<Page | null> {
  const shop = await requireShop();
  const [page] = await db
    .select()
    .from(pages)
    .where(and(eq(pages.id, id), eq(pages.shopId, shop.id)))
    .limit(1);
  return page ?? null;
}

// Public lookup for the master template. Returns null if the page does not
// exist OR if its parent shop is suspended (subscription enforcement).
export async function getPublicPageByCode(shortCode: string): Promise<Page | null> {
  const [row] = await withRetry(() =>
    db
      .select({ page: pages, shopStatus: shops.status })
      .from(pages)
      .innerJoin(shops, eq(pages.shopId, shops.id))
      .where(eq(pages.shortCode, shortCode))
      .limit(1)
      .then((rows) => rows)
  ).then((rows) => rows);

  if (!row || row.shopStatus !== "active") return null;
  return row.page;
}

// Per-shop dashboard counts for the reseller panel.
export async function getShopDashboardStats() {
  const shop = await requireShop();

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const [totalRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(pages)
    .where(eq(pages.shopId, shop.id));

  const [thisMonthRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(pages)
    .where(
      and(
        eq(pages.shopId, shop.id),
        gte(pages.createdAt, startOfMonth),
        lt(pages.createdAt, startOfNextMonth)
      )
    );

  const [lastMonthRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(pages)
    .where(
      and(
        eq(pages.shopId, shop.id),
        gte(pages.createdAt, startOfLastMonth),
        lt(pages.createdAt, startOfMonth)
      )
    );

  const thisMonth = thisMonthRow?.count ?? 0;

  return {
    total: totalRow?.count ?? 0,
    thisMonth,
    lastMonth: lastMonthRow?.count ?? 0,
    freeRemaining: Math.max(0, BILLING_FREE_LIMIT - thisMonth),
    amountDue: computeAmountDue(thisMonth),
  };
}
