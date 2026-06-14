"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import type { School } from "@/db/schema";
import { deleteSchoolAction } from "@/actions/schools";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

interface SchoolsTableProps {
  schools: School[];
}

export function SchoolsTable({ schools }: SchoolsTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleDelete = (id: string) => {
    setError(null);
    startTransition(async () => {
      const result = await deleteSchoolAction(id);
      if (result.success) {
        setDeleteId(null);
      } else {
        setError(result.error ?? "Failed to delete school");
      }
    });
  };

  if (schools.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900">No schools yet</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by adding your first driving school.</p>
        <Link
          href="/admin/schools/new"
          className="inline-flex mt-4 items-center px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition-colors"
        >
          Add School
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && <Alert variant="error" message={error} />}

      <div className="hidden md:block rounded-xl border border-gray-200 bg-white overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">School Name</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Phone</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Slug</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Created</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Expiry</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {schools.map((school) => (
              <tr key={school.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{school.schoolName}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{school.phoneNumber}</td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">{school.slug}</code>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{formatDate(school.createdAt)}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{formatDate(school.expiryDate)}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={school.status} />
                </td>
                <td className="px-4 py-3 text-right">
                  <SchoolActions
                    school={school}
                    deleteId={deleteId}
                    setDeleteId={setDeleteId}
                    onDelete={handleDelete}
                    isPending={isPending}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="md:hidden space-y-4">
        {schools.map((school) => (
          <div key={school.id} className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">{school.schoolName}</h3>
                <p className="text-sm text-gray-500">{school.phoneNumber}</p>
              </div>
              <StatusBadge status={school.status} />
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <p><span className="text-gray-400">Slug:</span> {school.slug}</p>
              <p><span className="text-gray-400">Created:</span> {formatDate(school.createdAt)}</p>
              <p><span className="text-gray-400">Expiry:</span> {formatDate(school.expiryDate)}</p>
            </div>
            <SchoolActions
              school={school}
              deleteId={deleteId}
              setDeleteId={setDeleteId}
              onDelete={handleDelete}
              isPending={isPending}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const isActive = status === "active";
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
      }`}
    >
      {isActive ? "Active" : "Expired"}
    </span>
  );
}

function SchoolActions({
  school,
  deleteId,
  setDeleteId,
  onDelete,
  isPending,
}: {
  school: School;
  deleteId: string | null;
  setDeleteId: (id: string | null) => void;
  onDelete: (id: string) => void;
  isPending: boolean;
}) {
  if (deleteId === school.id) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-gray-600">Delete this school?</span>
        <Button
          variant="danger"
          size="sm"
          loading={isPending}
          onClick={() => onDelete(school.id)}
        >
          Confirm
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setDeleteId(null)} disabled={isPending}>
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2 justify-end">
      <Link href={`/admin/schools/${school.id}/edit`}>
        <Button variant="secondary" size="sm">Edit</Button>
      </Link>
      <Button variant="danger" size="sm" onClick={() => setDeleteId(school.id)}>
        Delete
      </Button>
      <a href={`/api/qr/${school.slug}?download=1`}>
        <Button variant="primary" size="sm">Download QR</Button>
      </a>
    </div>
  );
}
