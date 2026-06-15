import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getSchoolBySlug } from "@/actions/schools";

const BENEFITS = [
  "Complete Beginners Welcome",
  "License Assistance Available",
  "Flexible Timings",
  "Experienced Instructors",
  "Affordable Training Packages",
];

interface SchoolPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: SchoolPageProps): Promise<Metadata> {
  const { slug } = await params;
  const school = await getSchoolBySlug(slug);

  if (!school) {
    return { title: "School Not Found" };
  }

  return {
    title: school.schoolName,
    description: `Learn car driving with confidence at ${school.schoolName}. Contact us via WhatsApp, phone, or get directions.`,
  };
}

export default async function SchoolLandingPage({ params }: SchoolPageProps) {
  const { slug } = await params;
  const school = await getSchoolBySlug(slug);

  if (!school || school.status === "expired") {
    notFound();
  }

  const whatsappMessage = encodeURIComponent(
    "Hi, I would like to know more about your driving classes."
  );
  const whatsappNumber = school.whatsappNumber.replace(/\D/g, "");
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;
  const phoneUrl = `tel:${school.phoneNumber.replace(/\s/g, "")}`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col items-center px-4 py-8">
      <div className="w-full max-w-[500px]">
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
          <div className="px-6 pt-10 pb-6 text-center">
            <div className="reveal mx-auto mb-6 w-36 h-20 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-950 flex items-center justify-center shadow-lg shadow-slate-900/30 ring-1 ring-white/10">
              <svg className="h-14 w-auto text-white" viewBox="2 14 60 26" fill="none">
                <path
                  d="M10 32h44"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  opacity={0.35}
                />
                <path
                  d="M8 32c-1.6 0-2.6-1.4-2.2-2.9l1.3-4.7c.4-1.4 1.6-2.4 3.1-2.6l6.4-.7 5.2-4.7c1.2-1.1 2.7-1.7 4.3-1.7h10.8c1.9 0 3.7.8 4.9 2.3l3 3.6 8 1.4c2 .4 3.5 2.1 3.5 4.2v3.6c0 1.3-1 2.4-2.3 2.4"
                  fill="currentColor"
                  fillOpacity={0.16}
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinejoin="round"
                />
                <path
                  d="M24 16.7 25.5 23M37 15.5 39.5 23"
                  stroke="currentColor"
                  strokeWidth={1.6}
                  strokeLinecap="round"
                  opacity={0.6}
                />
                <g className="wheel-spin">
                  <circle cx="20" cy="32" r="6" fill="#0f172a" stroke="currentColor" strokeWidth={2} />
                  <circle cx="20" cy="32" r="1.6" fill="currentColor" />
                  <path d="M20 27.5v9M15.5 32h9M16.8 28.8l6.4 6.4M23.2 28.8l-6.4 6.4" stroke="currentColor" strokeWidth={1.2} strokeLinecap="round" />
                </g>
                <g className="wheel-spin">
                  <circle cx="46" cy="32" r="6" fill="#0f172a" stroke="currentColor" strokeWidth={2} />
                  <circle cx="46" cy="32" r="1.6" fill="currentColor" />
                  <path d="M46 27.5v9M41.5 32h9M42.8 28.8l6.4 6.4M49.2 28.8l-6.4 6.4" stroke="currentColor" strokeWidth={1.2} strokeLinecap="round" />
                </g>
              </svg>
            </div>

            <h1 className="reveal text-2xl sm:text-3xl font-bold text-gray-900 leading-tight" style={{ animationDelay: "0.08s" }}>
              {school.schoolName}
            </h1>
            <p className="reveal mt-3 text-base text-gray-500 font-medium" style={{ animationDelay: "0.16s" }}>
              Learn Car Driving With Confidence
            </p>
          </div>

          <div className="reveal px-6 py-6 bg-gray-50/80 border-y border-gray-100" style={{ animationDelay: "0.24s" }}>
            <ul className="space-y-4">
              {BENEFITS.map((benefit) => (
                <li key={benefit} className="flex items-center gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </span>
                  <span className="text-sm font-medium text-gray-700">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="px-6 pb-8 space-y-3">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="reveal flex items-center justify-center gap-3 w-full py-4 px-6 bg-whatsapp text-white text-lg font-semibold rounded-2xl hover:bg-whatsapp-dark transition-colors"
              style={{ animationDelay: "0.32s" }}
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Message Us Now
            </a>

            <a
              href={phoneUrl}
              className="reveal flex items-center justify-center gap-3 w-full py-4 px-6 bg-brand-600 text-white text-lg font-semibold rounded-2xl hover:bg-brand-700 transition-colors"
              style={{ animationDelay: "0.4s" }}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
              </svg>
              Call to Enroll
            </a>

            <a
              href={school.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="reveal flex items-center justify-center gap-3 w-full py-4 px-6 bg-gray-900 text-white text-lg font-semibold rounded-2xl hover:bg-gray-800 transition-colors"
              style={{ animationDelay: "0.48s" }}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
              Visit Our Center
            </a>
          </div>

          <div className="px-6 pb-8 text-center">
            <div className="border-t border-gray-100 pt-6">
              <p className="text-sm font-semibold text-gray-400 tracking-wide uppercase">
                Scan. Connect. Learn.
              </p>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-gray-400">
          Powered by QR Driving Pages
        </p>
      </div>
    </div>
  );
}
