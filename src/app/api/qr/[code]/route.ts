import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { pages } from "@/db/schema";
import { generateQrBuffer } from "@/lib/qr";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;

  const [page] = await db
    .select()
    .from(pages)
    .where(eq(pages.shortCode, code))
    .limit(1);

  if (!page) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }

  const download = request.nextUrl.searchParams.get("download") === "1";

  let buffer: Buffer;

  try {
    const filePath = path.join(process.cwd(), "public", page.qrCodePath.replace(/^\//, ""));
    buffer = await readFile(filePath);
  } catch {
    buffer = await generateQrBuffer(code);
  }

  const headers: HeadersInit = {
    "Content-Type": "image/png",
  };

  if (download) {
    // Deliver only the plain QR code (which redirects to the slug page URL).
    headers["Content-Disposition"] = `attachment; filename="qr-${code}.png"`;
    headers["Cache-Control"] = "no-store";
  } else {
    headers["Cache-Control"] = "public, max-age=31536000, immutable";
  }

  return new NextResponse(new Uint8Array(buffer), { headers });
}
