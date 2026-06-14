"use server";

import { redirect } from "next/navigation";
import { loginSchema } from "@/lib/validations";
import { verifyPassword, setAuthSession, clearAuthSession } from "@/lib/auth";

export type ActionResult = {
  success: boolean;
  error?: string;
};

export async function loginAction(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const parsed = loginSchema.safeParse({
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }

  if (!verifyPassword(parsed.data.password)) {
    return { success: false, error: "Incorrect password" };
  }

  await setAuthSession();
  redirect("/admin");
}

export async function logoutAction(): Promise<void> {
  await clearAuthSession();
  redirect("/admin");
}
