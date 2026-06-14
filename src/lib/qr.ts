import QRCode from "qrcode";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { getSchoolUrl } from "./utils";

export async function generateQrCode(slug: string): Promise<{
  buffer: Buffer;
  path: string;
}> {
  const url = getSchoolUrl(slug);
  const buffer = await QRCode.toBuffer(url, {
    type: "png",
    width: 512,
    margin: 2,
    color: {
      dark: "#1e3a8a",
      light: "#ffffff",
    },
  });

  const fileName = `${slug}.png`;
  const relativePath = `/qr-codes/${fileName}`;

  try {
    const qrDir = path.join(process.cwd(), "public", "qr-codes");
    await mkdir(qrDir, { recursive: true });
    const filePath = path.join(qrDir, fileName);
    await writeFile(filePath, buffer);
  } catch {
    // Filesystem may be read-only on serverless hosts (e.g. Vercel).
    // QR images are served via /api/qr/[slug] which regenerates on demand.
  }

  return {
    buffer,
    path: relativePath,
  };
}

export async function generateQrBuffer(slug: string): Promise<Buffer> {
  const url = getSchoolUrl(slug);
  return QRCode.toBuffer(url, {
    type: "png",
    width: 512,
    margin: 2,
    color: {
      dark: "#1e3a8a",
      light: "#ffffff",
    },
  });
}
