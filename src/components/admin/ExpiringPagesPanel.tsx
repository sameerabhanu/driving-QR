import { formatDate, formatMonthKey, getMonthKey, MONTHS } from "@/lib/utils";
import type { ExpiringPageRecord } from "@/actions/pages";

interface ExpiringPagesPanelProps {
    monthKey: string;
    pages: ExpiringPageRecord[];
}

// Builds the next 12 month options starting from the current month.
function buildMonthOptions(): { key: string; label: string }[] {
    const now = new Date();
    const options: { key: string; label: string }[] = [];
    for (let i = 0; i < 12; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
        const key = getMonthKey(d);
        options.push({ key, label: `${MONTHS[d.getMonth()]} ${d.getFullYear()}` });
    }
    return options;
}

function csvEscape(value: string): string {
    if (/[",\n]/.test(value)) {
        return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
}

function buildCsvHref(pages: ExpiringPageRecord[]): string {
    const header = ["Business", "Type", "Code", "Phone", "WhatsApp", "Expires"];
    const rows = pages.map((p) =>
        [
            p.businessName,
            p.businessType,
            p.shortCode,
            p.phoneNumber ?? "",
            p.whatsappNumber ?? "",
            formatDate(p.expiresAt),
        ]
            .map((v) => csvEscape(String(v)))
            .join(",")
    );
    const csv = [header.join(","), ...rows].join("\n");
    return `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`;
}

export function ExpiringPagesPanel({ monthKey, pages }: ExpiringPagesPanelProps) {
    const options = buildMonthOptions();

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5 mb-8">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div>
                    <h2 className="text-base font-semibold text-gray-900">Expiring Pages</h2>
                    <p className="text-sm text-gray-500">{formatMonthKey(monthKey)}</p>
                </div>

                <div className="flex items-center gap-2">
                    <form method="GET" className="flex items-center gap-2">
                        <label htmlFor="expMonth" className="sr-only">
                            Select month
                        </label>
                        <select
                            id="expMonth"
                            name="expMonth"
                            defaultValue={monthKey}
                            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                        >
                            {options.map((o) => (
                                <option key={o.key} value={o.key}>
                                    {o.label}
                                </option>
                            ))}
                        </select>
                        <button
                            type="submit"
                            className="rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
                        >
                            View
                        </button>
                    </form>

                    {pages.length > 0 && (
                        <a
                            href={buildCsvHref(pages)}
                            download={`expiring-${monthKey}.csv`}
                            title="Download CSV"
                            aria-label="Download CSV"
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-700"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                            </svg>
                            <span>CSV</span>
                        </a>
                    )}
                </div>
            </div>

            {pages.length === 0 ? (
                <p className="py-6 text-center text-sm text-gray-500">
                    No pages expiring in {formatMonthKey(monthKey)}.
                </p>
            ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {pages.map((p) => (
                        <div key={p.id} className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
                            <div className="flex items-start justify-between gap-2">
                                <h3 className="font-semibold text-gray-900">{p.businessName}</h3>
                                <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">{p.shortCode}</code>
                            </div>
                            <p className="text-sm text-gray-600">
                                <span className="text-gray-400">Phone:</span> {p.phoneNumber || p.whatsappNumber || "—"}
                            </p>
                            <p className="text-sm text-gray-600">
                                <span className="text-gray-400">Expires:</span> {formatDate(p.expiresAt)}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
