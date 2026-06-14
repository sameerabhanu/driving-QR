"use server";

import { revalidatePath } from "next/cache";
import { eq, desc, sql } from "drizzle-orm";
import { db } from "@/db";
import { schools, type School } from "@/db/schema";
import { schoolSchema } from "@/lib/validations";
import { isAuthenticated } from "@/lib/auth";
import { generateQrCode } from "@/lib/qr";
import {
  calculateExpiryDate,
  formatDateISO,
  updateSchoolStatus,
} from "@/lib/utils";

export type ActionResult<T = undefined> = {
  success: boolean;
  error?: string;
  data?: T;
};

async function requireAuth(): Promise<void> {
  const authed = await isAuthenticated();
  if (!authed) {
    throw new Error("Unauthorized");
  }
}

export async function createSchoolAction(
  _prevState: ActionResult<{ id: string; slug: string; qrCodePath: string }> | ActionResult,
  formData: FormData
): Promise<ActionResult<{ id: string; slug: string; qrCodePath: string }>> {
  try {
    await requireAuth();

    const parsed = schoolSchema.safeParse({
      schoolName: formData.get("schoolName"),
      phoneNumber: formData.get("phoneNumber"),
      whatsappNumber: formData.get("whatsappNumber"),
      googleMapsUrl: formData.get("googleMapsUrl"),
      slug: formData.get("slug"),
    });

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.errors[0]?.message ?? "Invalid input",
      };
    }

    const existing = await db
      .select({ id: schools.id })
      .from(schools)
      .where(eq(schools.slug, parsed.data.slug))
      .limit(1);

    if (existing.length > 0) {
      return { success: false, error: "This slug is already in use" };
    }

    const createdAt = new Date();
    const expiryDate = calculateExpiryDate(createdAt);
    const { path: qrCodePath } = await generateQrCode(parsed.data.slug);

    const [school] = await db
      .insert(schools)
      .values({
        schoolName: parsed.data.schoolName,
        slug: parsed.data.slug,
        phoneNumber: parsed.data.phoneNumber,
        whatsappNumber: parsed.data.whatsappNumber,
        googleMapsUrl: parsed.data.googleMapsUrl,
        qrCodePath,
        expiryDate: formatDateISO(expiryDate),
        status: "active",
      })
      .returning();

    revalidatePath("/admin");
    revalidatePath("/admin/schools/new");
    revalidatePath("/admin/renewals");

    return {
      success: true,
      data: {
        id: school.id,
        slug: school.slug,
        qrCodePath: school.qrCodePath,
      },
    };
  } catch (error) {
    console.error("Create school error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create school",
    };
  }
}

export async function updateSchoolAction(
  id: string,
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  try {
    await requireAuth();

    const parsed = schoolSchema.safeParse({
      schoolName: formData.get("schoolName"),
      phoneNumber: formData.get("phoneNumber"),
      whatsappNumber: formData.get("whatsappNumber"),
      googleMapsUrl: formData.get("googleMapsUrl"),
      slug: formData.get("slug"),
    });

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.errors[0]?.message ?? "Invalid input",
      };
    }

    const existing = await db
      .select({ id: schools.id })
      .from(schools)
      .where(eq(schools.slug, parsed.data.slug))
      .limit(1);

    if (existing.length > 0 && existing[0].id !== id) {
      return { success: false, error: "This slug is already in use" };
    }

    const [current] = await db
      .select()
      .from(schools)
      .where(eq(schools.id, id))
      .limit(1);

    if (!current) {
      return { success: false, error: "School not found" };
    }

    let qrCodePath = current.qrCodePath;
    if (current.slug !== parsed.data.slug) {
      const { path } = await generateQrCode(parsed.data.slug);
      qrCodePath = path;
    }

    const status = updateSchoolStatus(current.expiryDate);

    await db
      .update(schools)
      .set({
        schoolName: parsed.data.schoolName,
        slug: parsed.data.slug,
        phoneNumber: parsed.data.phoneNumber,
        whatsappNumber: parsed.data.whatsappNumber,
        googleMapsUrl: parsed.data.googleMapsUrl,
        qrCodePath,
        status,
      })
      .where(eq(schools.id, id));

    revalidatePath("/admin");
    revalidatePath(`/admin/schools/${id}/edit`);
    revalidatePath(`/${parsed.data.slug}`);
    revalidatePath("/admin/renewals");

    return { success: true };
  } catch (error) {
    console.error("Update school error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update school",
    };
  }
}

export async function deleteSchoolAction(id: string): Promise<ActionResult> {
  try {
    await requireAuth();

    const [school] = await db
      .select()
      .from(schools)
      .where(eq(schools.id, id))
      .limit(1);

    if (!school) {
      return { success: false, error: "School not found" };
    }

    await db.delete(schools).where(eq(schools.id, id));

    revalidatePath("/admin");
    revalidatePath("/admin/renewals");

    return { success: true };
  } catch (error) {
    console.error("Delete school error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete school",
    };
  }
}

export async function syncSchoolStatuses(): Promise<void> {
  const allSchools = await db.select().from(schools);

  for (const school of allSchools) {
    const status = updateSchoolStatus(school.expiryDate);
    if (status !== school.status) {
      await db
        .update(schools)
        .set({ status })
        .where(eq(schools.id, school.id));
    }
  }
}

export async function getDashboardStats() {
  await requireAuth();
  await syncSchoolStatuses();

  const allSchools = await db.select().from(schools);

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const expiringThisMonth = allSchools.filter((s) => {
    const expiry = new Date(s.expiryDate);
    return expiry >= startOfMonth && expiry < endOfMonth && s.status === "active";
  });

  return {
    total: allSchools.length,
    active: allSchools.filter((s) => s.status === "active").length,
    expired: allSchools.filter((s) => s.status === "expired").length,
    expiringThisMonth: expiringThisMonth.length,
  };
}

export async function getAllSchools(): Promise<School[]> {
  await requireAuth();
  await syncSchoolStatuses();

  return db.select().from(schools).orderBy(desc(schools.createdAt));
}

export async function getSchoolById(id: string): Promise<School | null> {
  await requireAuth();

  const [school] = await db
    .select()
    .from(schools)
    .where(eq(schools.id, id))
    .limit(1);

  return school ?? null;
}

export async function getSchoolBySlug(slug: string): Promise<School | null> {
  const [school] = await db
    .select()
    .from(schools)
    .where(eq(schools.slug, slug))
    .limit(1);

  if (school) {
    const status = updateSchoolStatus(school.expiryDate);
    if (status !== school.status) {
      await db.update(schools).set({ status }).where(eq(schools.id, school.id));
      school.status = status;
    }
  }

  return school ?? null;
}

export async function getSchoolsExpiringInMonth(
  monthIndex: number
): Promise<School[]> {
  await requireAuth();
  await syncSchoolStatuses();

  const month = monthIndex + 1;

  return db
    .select()
    .from(schools)
    .where(sql`EXTRACT(MONTH FROM ${schools.expiryDate}) = ${month}`)
    .orderBy(schools.expiryDate);
}
