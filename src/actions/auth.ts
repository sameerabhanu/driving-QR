"use server";

import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { shops } from "@/db/schema";
import { shopLoginSchema, pinLoginSchema } from "@/lib/validations";
import {
  setShopSession,
  clearShopSession,
  verifySuperPin,
  setSuperSession,
  clearSuperSession,
} from "@/lib/auth";

export type ActionResult = {
  success: boolean;
  error?: string;
};

// Reseller shop logs in with their owner name + PIN. A PIN is only unique per
// owner name, so both must match the same shop record.
export async function shopLoginAction(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const parsed = shopLoginSchema.safeParse({
    ownerName: formData.get("ownerName"),
    pin: formData.get("pin"),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid details" };
  }

  const [shop] = await db
    .select()
    .from(shops)
    .where(
      and(eq(shops.ownerName, parsed.data.ownerName), eq(shops.pin, parsed.data.pin))
    )
    .limit(1);

  if (!shop) {
    return { success: false, error: "Invalid name or PIN" };
  }

  if (shop.status !== "active") {
    return {
      success: false,
      error: "Your subscription is suspended. Please contact support.",
    };
  }

  await setShopSession(shop.id);
  redirect("/admin");
}

export async function shopLogoutAction(): Promise<void> {
  await clearShopSession();
  redirect("/admin/login");
}

// Super admin (platform owner) logs in with the env PIN.
export async function superLoginAction(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const parsed = pinLoginSchema.safeParse({ pin: formData.get("pin") });

  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid PIN" };
  }

  if (!verifySuperPin(parsed.data.pin)) {
    return { success: false, error: "Incorrect PIN" };
  }

  await setSuperSession();
  redirect("/superadmin");
}

export async function superLogoutAction(): Promise<void> {
  await clearSuperSession();
  redirect("/superadmin/login");
}
