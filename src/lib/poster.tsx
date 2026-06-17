import { ImageResponse } from "next/og";
import QRCode from "qrcode";
import { getPageUrl } from "./utils";

const POSTER_WIDTH = 1080;
const POSTER_HEIGHT = 1350;

/**
 * Generates a clean, white-label marketing poster (PNG) with the page's QR code
 * embedded, ready to print or share. Driven by the business name and tagline so
 * it works for any kind of business.
 */
async function loadGoogleFont(family: string, weight: number): Promise<ArrayBuffer> {
  const css = await (
    await fetch(
      `https://fonts.googleapis.com/css2?family=${family}:wght@${weight}`,
      {
        headers: {
          // Request TTF (not woff2) so Satori can parse it.
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      }
    )
  ).text();

  const url = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/)?.[1];
  if (!url) {
    throw new Error(`Failed to load font: ${family}`);
  }
  return (await fetch(url)).arrayBuffer();
}

export async function generatePoster(
  shortCode: string,
  businessName: string,
  tagline?: string | null
): Promise<ImageResponse> {
  const url = getPageUrl(shortCode);

  const qrDataUrl = await QRCode.toDataURL(url, {
    width: 560,
    margin: 2,
    color: {
      dark: "#0a0f1f",
      light: "#ffffff",
    },
  });

  const [antonFont, interFont] = await Promise.all([
    loadGoogleFont("Anton", 400),
    loadGoogleFont("Inter", 600),
  ]);

  const headline = businessName.toUpperCase();
  const subline = tagline?.trim() || "Scan to connect with us instantly.";

  const element = (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#0a0f1f",
        fontFamily: "sans-serif",
        padding: "96px 64px",
      }}
    >
      {/* Business name */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          color: "#ffffff",
          fontFamily: "Anton",
          fontSize: 64,
          lineHeight: 1.2,
          letterSpacing: 1,
          textTransform: "uppercase",
          maxWidth: "100%",
        }}
      >
        {headline}
      </div>

      {/* Divider */}
      <div
        style={{
          display: "flex",
          width: 120,
          height: 2,
          background: "rgba(255,255,255,0.35)",
          marginTop: 56,
          marginBottom: 56,
        }}
      />

      {/* Sub line / tagline */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          fontFamily: "Inter",
          fontSize: 38,
          fontWeight: 600,
          color: "#ffffff",
          textAlign: "center",
        }}
      >
        {subline}
      </div>

      {/* QR code */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={qrDataUrl}
        width={460}
        height={460}
        alt="QR code"
        style={{ marginTop: 90, borderRadius: 16 }}
      />

      {/* Scan caption */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          fontFamily: "Inter",
          fontSize: 30,
          fontWeight: 600,
          color: "#ffffff",
          letterSpacing: 4,
          marginTop: 56,
          textAlign: "center",
        }}
      >
        SCAN TO CONNECT
      </div>
    </div>
  );

  return new ImageResponse(element, {
    width: POSTER_WIDTH,
    height: POSTER_HEIGHT,
    fonts: [
      { name: "Anton", data: antonFont, weight: 400, style: "normal" },
      { name: "Inter", data: interFont, weight: 600, style: "normal" },
    ],
    headers: {
      "Content-Disposition": `attachment; filename="${shortCode}-poster.png"`,
      "Cache-Control": "no-store",
    },
  });
}
