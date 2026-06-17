"use server";

import { revalidatePath } from "next/cache";
import { eq, and, desc, gte, lt, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  pages,
  shops,
  creditTransactions,
  usedSlugs,
  type Page,
  type CustomButton,
} from "@/db/schema";
import { pageSchema } from "@/lib/validations";
import { getCurrentShop } from "@/lib/auth";
import { generateQrCode } from "@/lib/qr";
import { generateShortCode, computeExpiryDate } from "@/lib/utils";
import { generateBusinessContent } from "@/lib/ai";
import type { Shop } from "@/db/schema";

export type ActionResult<T = undefined> = {
  success: boolean;
  error?: string;
  data?: T;
};

export interface ExpiringPageRecord {
  id: string;
  businessName: string;
  businessType: string;
  shortCode: string;
  phoneNumber: string | null;
  whatsappNumber: string | null;
  expiresAt: Date;
}

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
  // Reserve from a permanent slug registry so a code is never reused, even
  // after its page expires or is deleted.
  for (let attempt = 0; attempt < 6; attempt++) {
    const code = generateShortCode();
    const [existing] = await db
      .select({ shortCode: usedSlugs.shortCode })
      .from(usedSlugs)
      .where(eq(usedSlugs.shortCode, code))
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

    // Require at least one credit before doing any expensive work.
    if (shop.availableCredits < 1) {
      return {
        success: false,
        error: "You have no credits left. Please contact your provider to add credits.",
      };
    }

    // Generate AI content
    const aiContent = await generateBusinessContent(
      parsed.data.businessName,
      parsed.data.businessType
    );

    const shortCode = await generateUniqueShortCode();
    const { path: qrCodePath } = await generateQrCode(shortCode);
    const expiresAt = computeExpiryDate(new Date());

    // neon-http has no transactions; consume the credit with a guarded update
    // first, then create the page. Roll the credit back if a later step fails.
    const decremented = await db
      .update(shops)
      .set({ availableCredits: sql`${shops.availableCredits} - 1` })
      .where(and(eq(shops.id, shop.id), gte(shops.availableCredits, 1)))
      .returning({ id: shops.id });

    if (decremented.length === 0) {
      return {
        success: false,
        error: "You have no credits left. Please contact your provider to add credits.",
      };
    }

    try {
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
          expiresAt,
        })
        .returning();

      await db.insert(usedSlugs).values({ shortCode, firstPageId: page.id });

      await db.insert(creditTransactions).values({
        shopId: shop.id,
        kind: "consume_create",
        creditsDelta: -1,
        notes: `Created page ${shortCode}`,
      });

      revalidatePath("/admin");

      return {
        success: true,
        data: { id: page.id, shortCode: page.shortCode },
      };
    } catch (innerError) {
      // Best-effort refund of the consumed credit.
      await db
        .update(shops)
        .set({ availableCredits: sql`${shops.availableCredits} + 1` })
        .where(eq(shops.id, shop.id));
      throw innerError;
    }
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

// Extends a page's life by another 2-year window, consuming 1 credit. The new
// anchor is whichever is later: the current expiry or now (so renewing early
// stacks time rather than losing it).
export async function renewPageAction(id: string): Promise<ActionResult> {
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

    if (shop.availableCredits < 1) {
      return {
        success: false,
        error: "You have no credits left. Please contact your provider to add credits.",
      };
    }

    const now = new Date();
    const anchor = page.expiresAt > now ? page.expiresAt : now;
    const nextExpiry = computeExpiryDate(anchor);

    const decremented = await db
      .update(shops)
      .set({ availableCredits: sql`${shops.availableCredits} - 1` })
      .where(and(eq(shops.id, shop.id), gte(shops.availableCredits, 1)))
      .returning({ id: shops.id });

    if (decremented.length === 0) {
      return {
        success: false,
        error: "You have no credits left. Please contact your provider to add credits.",
      };
    }

    try {
      await db
        .update(pages)
        .set({ expiresAt: nextExpiry })
        .where(and(eq(pages.id, id), eq(pages.shopId, shop.id)));

      await db.insert(creditTransactions).values({
        shopId: shop.id,
        kind: "consume_renew",
        creditsDelta: -1,
        notes: `Renewed page ${page.shortCode}`,
      });

      revalidatePath("/admin");
      revalidatePath(`/p/${page.shortCode}`);

      return { success: true };
    } catch (innerError) {
      await db
        .update(shops)
        .set({ availableCredits: sql`${shops.availableCredits} + 1` })
        .where(eq(shops.id, shop.id));
      throw innerError;
    }
  } catch (error) {
    console.error("Renew page error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to renew page",
    };
  }
}

export async function getShopPages(): Promise<Page[]> {
  const shop = await requireShop();
  return db
    .select()
    .from(pages)
    .where(and(eq(pages.shopId, shop.id), gte(pages.expiresAt, new Date())))
    .orderBy(desc(pages.createdAt));
}

export async function getPageById(id: string): Promise<Page | null> {
  const shop = await requireShop();
  const [page] = await db
    .select()
    .from(pages)
    .where(
      and(eq(pages.id, id), eq(pages.shopId, shop.id), gte(pages.expiresAt, new Date()))
    )
    .limit(1);
  return page ?? null;
}

// Public lookup for the master template. Returns null if the page does not
// exist or has expired.
export async function getPublicPageByCode(shortCode: string): Promise<Page | null> {
  const [row] = await db
    .select({ page: pages })
    .from(pages)
    .where(and(eq(pages.shortCode, shortCode), gte(pages.expiresAt, new Date())))
    .limit(1);

  if (!row) return null;
  return row.page;
}

// Pages belonging to the current shop that expire within the given "YYYY-MM".
export async function getShopExpiringPagesByMonth(
  monthKey: string
): Promise<ExpiringPageRecord[]> {
  const shop = await requireShop();

  const [year, month] = monthKey.split("-").map((n) => parseInt(n, 10));
  if (!year || !month) return [];

  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);

  return db
    .select({
      id: pages.id,
      businessName: pages.businessName,
      businessType: pages.businessType,
      shortCode: pages.shortCode,
      phoneNumber: pages.phoneNumber,
      whatsappNumber: pages.whatsappNumber,
      expiresAt: pages.expiresAt,
    })
    .from(pages)
    .where(
      and(
        eq(pages.shopId, shop.id),
        gte(pages.expiresAt, start),
        lt(pages.expiresAt, end)
      )
    )
    .orderBy(pages.expiresAt);
}

// Deletes every page whose expiry has passed. Used by the cleanup cron.
export async function deleteExpiredPagesAction(): Promise<number> {
  const deleted = await db
    .delete(pages)
    .where(lt(pages.expiresAt, new Date()))
    .returning({ id: pages.id });
  return deleted.length;
}

// Per-shop dashboard counts for the reseller panel.
export async function getShopDashboardStats() {
  const shop = await requireShop();

  const now = new Date();
  const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const startOfMonthAfter = new Date(now.getFullYear(), now.getMonth() + 2, 1);

  const [activeRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(pages)
    .where(and(eq(pages.shopId, shop.id), gte(pages.expiresAt, now)));

  const [expiringRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(pages)
    .where(
      and(
        eq(pages.shopId, shop.id),
        gte(pages.expiresAt, startOfNextMonth),
        lt(pages.expiresAt, startOfMonthAfter)
      )
    );

  return {
    totalActivePages: activeRow?.count ?? 0,
    availableCredits: shop.availableCredits,
    expiringNextMonth: expiringRow?.count ?? 0,
  };
}
