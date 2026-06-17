import QRCode from "qrcode";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { getPageUrl } from "./utils";

export async function generateQrCode(shortCode: string): Promise<{
  buffer: Buffer;
  path: string;
}> {
  const url = getPageUrl(shortCode);
  const buffer = await QRCode.toBuffer(url, {
    type: "png",
    width: 512,
    margin: 2,
    color: {
      dark: "#0f172a",
      light: "#ffffff",
    },
  });

  const fileName = `${shortCode}.png`;
  const relativePath = `/qr-codes/${fileName}`;

  try {
    const qrDir = path.join(process.cwd(), "public", "qr-codes");
    await mkdir(qrDir, { recursive: true });
    const filePath = path.join(qrDir, fileName);
    await writeFile(filePath, buffer);
  } catch {
    // Filesystem may be read-only on serverless hosts (e.g. Vercel).
    // QR images are served via /api/qr/[code] which regenerates on demand.
  }

  return {
    buffer,
    path: relativePath,
  };
}

export async function generateQrBuffer(shortCode: string): Promise<Buffer> {
  const url = getPageUrl(shortCode);
  return QRCode.toBuffer(url, {
    type: "png",
    width: 512,
    margin: 2,
    color: {
      dark: "#0f172a",
      light: "#ffffff",
    },
  });
}
