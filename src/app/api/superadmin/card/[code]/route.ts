import { NextResponse } from "next/server";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { pages } from "@/db/schema";
import { isSuperAuthenticated } from "@/lib/auth";
import { generateVisitingCard } from "@/lib/visiting-card";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  if (!(await isSuperAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { code } = await params;

  // Scope to super admin pages only (no owning shop).
  const [page] = await db
    .select()
    .from(pages)
    .where(and(eq(pages.shortCode, code), isNull(pages.shopId)))
    .limit(1);

  if (!page) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }

  return generateVisitingCard(page);
}
