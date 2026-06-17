import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { pages } from "@/db/schema";
import { generateQrBuffer } from "@/lib/qr";
import { generatePoster } from "@/lib/poster";

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

  // For downloads, deliver a finished, white-label marketing poster with the
  // QR code embedded instead of the bare QR image.
  if (download) {
    return generatePoster(code, page.businessName, page.tagline);
  }

  let buffer: Buffer;

  try {
    const filePath = path.join(process.cwd(), "public", page.qrCodePath.replace(/^\//, ""));
    buffer = await readFile(filePath);
  } catch {
    buffer = await generateQrBuffer(code);
  }

  const headers: HeadersInit = {
    "Content-Type": "image/png",
    "Cache-Control": "public, max-age=31536000, immutable",
  };

  return new NextResponse(new Uint8Array(buffer), { headers });
}
