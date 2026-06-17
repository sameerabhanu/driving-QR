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
              className="rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700"
            >
              Download CSV
            </a>
          )}
        </div>
      </div>

      {pages.length === 0 ? (
        <p className="py-6 text-center text-sm text-gray-500">
          No pages expiring in {formatMonthKey(monthKey)}.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Business</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Code</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Phone</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Expires</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pages.map((p) => (
                <tr key={p.id}>
                  <td className="px-3 py-2 text-sm text-gray-900">
                    {p.businessName}
                    <span className="block text-xs text-gray-400">{p.businessType}</span>
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-600">
                    <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">{p.shortCode}</code>
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-600">{p.phoneNumber || p.whatsappNumber || "—"}</td>
                  <td className="px-3 py-2 text-sm text-gray-600">{formatDate(p.expiresAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
