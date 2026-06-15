import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { schools } from "@/db/schema";
import { generateQrBuffer } from "@/lib/qr";
import { generatePoster } from "@/lib/poster";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const [school] = await db
    .select()
    .from(schools)
    .where(eq(schools.slug, slug))
    .limit(1);

  if (!school) {
    return NextResponse.json({ error: "School not found" }, { status: 404 });
  }

  const download = request.nextUrl.searchParams.get("download") === "1";

  // For downloads, deliver a finished, lead-attracting marketing poster
  // with the QR code embedded instead of the bare QR image.
  if (download) {
    return generatePoster(slug, school.schoolName);
  }

  let buffer: Buffer;

  try {
    const filePath = path.join(process.cwd(), "public", school.qrCodePath.replace(/^\//, ""));
    buffer = await readFile(filePath);
  } catch {
    buffer = await generateQrBuffer(slug);
  }

  const headers: HeadersInit = {
    "Content-Type": "image/png",
    "Cache-Control": "public, max-age=31536000, immutable",
  };

  return new NextResponse(new Uint8Array(buffer), { headers });
}
