"use client";

import type { School } from "@/db/schema";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

interface RenewalsTableProps {
  schools: School[];
  month: string;
}

function exportToCsv(schools: School[], month: string) {
  const headers = ["School Name", "Phone Number", "WhatsApp Number", "Expiry Date"];
  const rows = schools.map((s) => [
    s.schoolName,
    s.phoneNumber,
    s.whatsappNumber,
    formatDate(s.expiryDate),
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `renewals-${month.toLowerCase()}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export function RenewalsTable({ schools, month }: RenewalsTableProps) {
  if (schools.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
        <h3 className="text-lg font-semibold text-gray-900">No renewals for {month}</h3>
        <p className="mt-1 text-sm text-gray-500">
          No schools are expiring during this month.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="secondary" onClick={() => exportToCsv(schools, month)}>
          Export CSV
        </Button>
      </div>

      <div className="hidden md:block rounded-xl border border-gray-200 bg-white overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">School Name</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Phone</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">WhatsApp</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Expiry Date</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {schools.map((school) => (
              <tr key={school.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{school.schoolName}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{school.phoneNumber}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{school.whatsappNumber}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{formatDate(school.expiryDate)}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      school.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {school.status === "active" ? "Active" : "Expired"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="md:hidden space-y-4">
        {schools.map((school) => (
          <div key={school.id} className="rounded-xl border border-gray-200 bg-white p-4 space-y-2">
            <div className="flex items-start justify-between">
              <h3 className="font-semibold text-gray-900">{school.schoolName}</h3>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  school.status === "active"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {school.status === "active" ? "Active" : "Expired"}
              </span>
            </div>
            <p className="text-sm text-gray-600">Phone: {school.phoneNumber}</p>
            <p className="text-sm text-gray-600">WhatsApp: {school.whatsappNumber}</p>
            <p className="text-sm text-gray-600">Expiry: {formatDate(school.expiryDate)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
