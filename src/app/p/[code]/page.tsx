import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPublicPageByCode } from "@/actions/pages";
import AnimatedQrMatrix from "@/components/ui/AnimatedQrMatrix";
import AutoFitText from "@/components/ui/AutoFitText";

interface PageProps {
  params: Promise<{ code: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { code } = await params;
  const page = await getPublicPageByCode(code);

  if (!page) {
    return { title: "Page Not Found" };
  }

  return {
    title: page.businessName,
    description: page.tagline ?? `Connect with ${page.businessName} instantly.`,
  };
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

export default async function BusinessLandingPage({ params }: PageProps) {
  const { code } = await params;
  const page = await getPublicPageByCode(code);

  if (!page) {
    notFound();
  }

  const whatsappNumber = page.whatsappNumber?.replace(/\D/g, "") ?? "";
  const whatsappUrl = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Hi, I'm interested in your services")}`
    : null;
  const phoneUrl = page.phoneNumber ? `tel:${page.phoneNumber.replace(/\s/g, "")}` : null;
  const instagramUrl = page.instagramUrl || null;
  const youtubeUrl = page.youtubeUrl || null;
  const mapsUrl = page.googleMapsUrl || null;

  const contactRows = [
    page.phoneNumber
      ? {
        key: "phone",
        value: page.phoneNumber,
        href: phoneUrl,
        icon: (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
          </svg>
        ),
      }
      : null,
    whatsappUrl
      ? {
        key: "whatsapp",
        value: page.whatsappNumber ?? whatsappNumber,
        href: whatsappUrl,
        icon: (
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
        ),
      }
      : null,
    instagramUrl
      ? {
        key: "instagram",
        value: extractInstagramHandle(instagramUrl),
        href: instagramUrl,
        icon: (
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1112.324 0 6.162 6.162 0 01-12.324 0zM12 16a4 4 0 110-8 4 4 0 010 8zm4.965-10.322a1.44 1.44 0 110-2.881 1.44 1.44 0 010 2.881z" />
          </svg>
        ),
      }
      : null,
    youtubeUrl
      ? {
        key: "youtube",
        value: extractYoutubeLabel(youtubeUrl),
        href: youtubeUrl,
        icon: (
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
          </svg>
        ),
      }
      : null,
  ].filter(Boolean) as Array<{
    key: string;
    value: string;
    href: string | null;
    icon: React.ReactNode;
  }>;

  const coreActions = [
    whatsappUrl
      ? {
        key: "whatsapp",
        href: whatsappUrl,
        label: "WhatsApp",
        className: "bg-[#25d366] text-white hover:bg-[#20be59]",
        icon: (
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884M12 0C5.373 0 0 5.373 0 12c0 2.117.549 4.107 1.51 5.842L0 24l6.335-1.652A11.93 11.93 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0" />
          </svg>
        ),
      }
      : null,
    phoneUrl
      ? {
        key: "phone",
        href: phoneUrl,
        label: "Call",
        className: "bg-[#2f66db] text-white hover:bg-[#2758c1]",
        icon: (
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
          </svg>
        ),
      }
      : null,
    mapsUrl
      ? {
        key: "maps",
        href: mapsUrl,
        label: "Directions",
        className: "bg-[#0f9d58] text-white hover:bg-[#0b8043]",
        icon: (
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
          </svg>
        ),
      }
      : null,
    instagramUrl
      ? {
        key: "instagram",
        href: instagramUrl,
        label: "Instagram",
        className: "bg-[#c13584] text-white hover:bg-[#a02d6e]",
        icon: (
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
          </svg>
        ),
      }
      : null,
    youtubeUrl
      ? {
        key: "youtube",
        href: youtubeUrl,
        label: "YouTube",
        className: "bg-[#ff0000] text-white hover:bg-[#cc0000]",
        icon: (
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
          </svg>
        ),
      }
      : null,
    ...(page.customButtons?.map((button, idx) => ({
      key: `custom-${idx}`,
      href: button.url,
      label: button.label,
      className: "bg-violet-600 text-white hover:bg-violet-700",
      icon: (
        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5a17.92 17.92 0 01-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
        </svg>
      ),
    })) ?? []),
  ].filter(Boolean) as Array<{
    key: string;
    href: string;
    label: string;
    className: string;
    icon: React.ReactNode;
  }>;

  return (
    <div className="relative min-h-screen bg-[linear-gradient(160deg,#0d0f14_0%,#111520_60%,#0b0d12_100%)] px-3 py-6 sm:px-5 sm:py-8">
      <div className="mx-auto w-full max-w-md px-1 py-1 sm:px-0 sm:py-0">

        {/* ── Business card ── */}
        <section className="reveal" style={{ animationDelay: "0.08s" }}>
          <div className="rounded-2xl border-2 border-white/30">
            <div className="gold-border-spin relative overflow-hidden rounded-[13px]">
              <div className="overflow-hidden rounded-[10px] bg-[radial-gradient(120%_120%_at_100%_0%,rgba(255,255,255,0.08),rgba(255,255,255,0)_46%),linear-gradient(130deg,#0f1012_0%,#171b22_58%,#0b0c0f_100%)] text-white shadow-[0_18px_40px_-24px_rgba(2,6,23,0.95)]">
                <div className="flex items-center justify-center border-b border-white/10 px-4 py-3">
                  <AutoFitText
                    text={page.businessName.toUpperCase()}
                    minSize={10}
                    maxSize={18}
                    className="w-full text-center font-semibold tracking-[0.18em] text-white"
                  />
                </div>
                <div className="grid min-h-[148px] grid-cols-5">
                  <div className="col-span-3 flex flex-col justify-center px-4 py-3">
                    {contactRows.length > 0 ? (
                      <ul className="space-y-1.5">
                        {contactRows.slice(0, 5).map((item) => {
                          const isExternal = item.href?.startsWith("http");
                          return (
                            <li key={item.key}>
                              <a
                                href={item.href ?? undefined}
                                target={isExternal ? "_blank" : undefined}
                                rel={isExternal ? "noopener noreferrer" : undefined}
                                className="group flex items-center gap-2 py-1 text-white/90 transition-colors hover:text-white"
                              >
                                <span className="text-white/70">{item.icon}</span>
                                <span className="truncate text-[11px] font-medium text-white/85">{item.value}</span>
                              </a>
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <div className="flex h-full min-h-[120px] items-center justify-center px-3 text-center text-xs font-medium text-white/70">
                        Add contact details.
                      </div>
                    )}
                  </div>
                  <div className="col-span-2 flex items-center justify-center pr-4">
                    <AnimatedQrMatrix seed={code} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Tagline ── */}
        {page.tagline && (
          <section className="reveal mt-5 text-center" style={{ animationDelay: "0.14s" }}>
            <p className="mx-auto max-w-xs text-base font-semibold text-white/70">{page.tagline}</p>
          </section>
        )}

        {/* ── Benefits ── */}
        {page.benefits && page.benefits.length > 0 && (
          <section className="reveal mt-5" style={{ animationDelay: "0.22s" }}>
            <ul className="space-y-2.5">
              {page.benefits.map((benefit, idx) => (
                <li key={idx} className="flex items-center gap-2.5 text-[15px] font-medium text-white/75">
                  <span className="inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* ── CTA buttons ── */}
        {coreActions.length > 0 && (
          <section className="mt-6">
            <div className="reveal grid grid-cols-3 gap-2.5" style={{ animationDelay: "0.3s" }}>
              {coreActions.map((action) => (
                <a
                  key={action.key}
                  href={action.href}
                  target={action.href.startsWith("http") ? "_blank" : undefined}
                  rel={action.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className={`inline-flex h-11 items-center justify-center gap-1.5 rounded-xl px-2 text-xs font-semibold transition-colors ${action.className}`}
                  aria-label={action.label}
                  title={action.label}
                >
                  {action.icon}
                  <span className="truncate">{action.label}</span>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* ── Footer ── */}
        <footer className="mt-7 border-t border-white/10 pt-4 text-center">
          <p className="reveal text-xs font-bold uppercase tracking-[0.18em] text-white/25" style={{ animationDelay: "0.46s" }}>
            Scan. Visit. Connect.
          </p>
        </footer>

      </div>
    </div>
  );
}