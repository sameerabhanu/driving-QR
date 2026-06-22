import { ImageResponse } from "next/og";
import QRCode from "qrcode";
import { getPageUrl } from "./utils";
import type { Page } from "@/db/schema";

// Canvas size for the downloadable visiting card. The card itself is centered
// on a dark backdrop that mirrors the public landing page theme.
const CARD_WIDTH = 1080;
const CARD_HEIGHT = 720;

async function loadGoogleFont(family: string, weight: number): Promise<ArrayBuffer> {
  const css = await (
    await fetch(`https://fonts.googleapis.com/css2?family=${family}:wght@${weight}`, {
      headers: {
        // Request TTF (not woff2) so Satori can parse it.
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    })
  ).text();

  const url = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/)?.[1];
  if (!url) {
    throw new Error(`Failed to load font: ${family}`);
  }
  return (await fetch(url)).arrayBuffer();
}

function extractInstagramHandle(url: string): string {
  try {
    const pathname = new URL(url).pathname.replace(/^\/+|\/+$/g, "");
    const first = pathname.split("/")[0]?.trim();
    return first ? `@${first}` : "Instagram";
  } catch {
    return "Instagram";
  }
}

function extractYoutubeLabel(url: string): string {
  try {
    const pathname = new URL(url).pathname.replace(/^\/+|\/+$/g, "");
    const last = pathname.split("/").filter(Boolean).slice(-1)[0]?.trim();
    return last || "YouTube";
  } catch {
    return "YouTube";
  }
}

const ICON_COLOR = "rgba(255,255,255,0.7)";

function PhoneIcon() {
  return (
    <svg width={30} height={30} viewBox="0 0 24 24" fill="none" stroke={ICON_COLOR} strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
    </svg>
  );
}

function WhatsappIcon() {
  return (
    <svg width={30} height={30} viewBox="0 0 24 24" fill={ICON_COLOR}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width={30} height={30} viewBox="0 0 24 24" fill={ICON_COLOR}>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

function YoutubeIcon() {
  return (
    <svg width={30} height={30} viewBox="0 0 24 24" fill={ICON_COLOR}>
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

interface ContactRow {
  key: string;
  value: string;
  icon: React.ReactNode;
}

function buildContactRows(page: Page): ContactRow[] {
  const whatsappNumber = page.whatsappNumber?.replace(/\D/g, "") ?? "";

  const rows: (ContactRow | null)[] = [
    page.phoneNumber
      ? { key: "phone", value: page.phoneNumber, icon: <PhoneIcon /> }
      : null,
    page.whatsappNumber || whatsappNumber
      ? { key: "whatsapp", value: page.whatsappNumber ?? whatsappNumber, icon: <WhatsappIcon /> }
      : null,
    page.instagramUrl
      ? { key: "instagram", value: extractInstagramHandle(page.instagramUrl), icon: <InstagramIcon /> }
      : null,
    page.youtubeUrl
      ? { key: "youtube", value: extractYoutubeLabel(page.youtubeUrl), icon: <YoutubeIcon /> }
      : null,
  ];

  return rows.filter(Boolean).slice(0, 5) as ContactRow[];
}

// Picks a business-name font size that fits the card header.
function nameFontSize(name: string): number {
  const len = name.length;
  if (len <= 12) return 56;
  if (len <= 18) return 46;
  if (len <= 26) return 38;
  if (len <= 36) return 30;
  return 24;
}

/**
 * Generates the page's digital visiting card (PNG) — the same gold-bordered card
 * shown on the public landing page, but with the real, scannable QR code.
 */
export async function generateVisitingCard(page: Page): Promise<ImageResponse> {
  const url = getPageUrl(page.shortCode);

  const qrDataUrl = await QRCode.toDataURL(url, {
    width: 460,
    margin: 1,
    color: {
      dark: "#0a0f1f",
      light: "#ffffff",
    },
  });

  const [interSemibold, interBold] = await Promise.all([
    loadGoogleFont("Inter", 600),
    loadGoogleFont("Inter", 700),
  ]);

  const contactRows = buildContactRows(page);
  const headline = page.businessName.toUpperCase();

  const element = (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(160deg,#0d0f14 0%,#111520 60%,#0b0d12 100%)",
        padding: 48,
        fontFamily: "Inter",
      }}
    >
      {/* Gold border wrapper */}
      <div
        style={{
          display: "flex",
          padding: 6,
          borderRadius: 22,
          background:
            "linear-gradient(130deg,#bf953f 0%,#fcf6ba 28%,#b38728 52%,#fbf5b7 74%,#aa771c 100%)",
          boxShadow: "0 30px 60px -28px rgba(2,6,23,0.95)",
        }}
      >
        {/* Inner dark card */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: 940,
            borderRadius: 16,
            overflow: "hidden",
            background:
              "linear-gradient(130deg,#0f1012 0%,#171b22 58%,#0b0c0f 100%)",
            color: "#ffffff",
          }}
        >
          {/* Header — business name */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "26px 32px",
              borderBottom: "1px solid rgba(255,255,255,0.12)",
            }}
          >
            <div
              style={{
                display: "flex",
                fontFamily: "Inter",
                fontWeight: 600,
                fontSize: nameFontSize(headline),
                letterSpacing: 6,
                color: "#ffffff",
                textAlign: "center",
              }}
            >
              {headline}
            </div>
          </div>

          {/* Body — contacts + QR */}
          <div style={{ display: "flex", flexDirection: "row", minHeight: 340 }}>
            {/* Left — contact rows */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                width: 560,
                padding: "28px 36px",
                gap: 14,
              }}
            >
              {contactRows.length > 0 ? (
                contactRows.map((row) => (
                  <div
                    key={row.key}
                    style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 14 }}
                  >
                    {row.icon}
                    <div
                      style={{
                        display: "flex",
                        fontFamily: "Inter",
                        fontWeight: 600,
                        fontSize: 26,
                        color: "rgba(255,255,255,0.88)",
                      }}
                    >
                      {row.value}
                    </div>
                  </div>
                ))
              ) : (
                <div
                  style={{
                    display: "flex",
                    fontSize: 26,
                    color: "rgba(255,255,255,0.7)",
                  }}
                >
                  Add contact details.
                </div>
              )}
            </div>

            {/* Right — real scannable QR */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flex: 1,
                padding: "28px 36px 28px 0",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrDataUrl}
                width={230}
                height={230}
                alt="QR code"
                style={{ borderRadius: 16, background: "#ffffff" }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return new ImageResponse(element, {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    fonts: [
      { name: "Inter", data: interSemibold, weight: 600, style: "normal" },
      { name: "Inter", data: interBold, weight: 700, style: "normal" },
    ],
    headers: {
      "Content-Disposition": `attachment; filename="${page.shortCode}-visiting-card.png"`,
      "Cache-Control": "no-store",
    },
  });
}
