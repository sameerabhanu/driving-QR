"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import type { Page } from "@/db/schema";
import { deletePageAction, renewPageAction } from "@/actions/pages";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

interface PagesTableProps {
  pages: Page[];
}

export function PagesTable({ pages }: PagesTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleDelete = (id: string) => {
    setError(null);
    startTransition(async () => {
      const result = await deletePageAction(id);
      if (result.success) {
        setDeleteId(null);
      } else {
        setError(result.error ?? "Failed to delete page");
      }
    });
  };

  const handleRenew = (id: string) => {
    setError(null);
    startTransition(async () => {
      const result = await renewPageAction(id);
      if (!result.success) {
        setError(result.error ?? "Failed to renew page");
      }
    });
  };

  if (pages.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900">No pages yet</h3>
        <p className="mt-1 text-sm text-gray-500">Create your first client landing page.</p>
        <Link
          href="/admin/pages/new"
          className="inline-flex mt-4 items-center px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition-colors"
        >
          Create Page
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
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Business</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Code</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Created</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Expires</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {pages.map((page) => (
              <tr key={page.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{page.businessName}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{page.businessType}</td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">{page.shortCode}</code>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{formatDate(page.createdAt)}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{formatDate(page.expiresAt)}</td>
                <td className="px-4 py-3 text-right">
                  <PageActions
                    page={page}
                    deleteId={deleteId}
                    setDeleteId={setDeleteId}
                    onDelete={handleDelete}
                    onRenew={handleRenew}
                    isPending={isPending}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="md:hidden space-y-4">
        {pages.map((page) => (
          <div key={page.id} className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">{page.businessName}</h3>
                <p className="text-sm text-gray-500">{page.businessType}</p>
              </div>
              <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">{page.shortCode}</code>
            </div>
            <p className="text-sm text-gray-600">
              <span className="text-gray-400">Created:</span> {formatDate(page.createdAt)}
            </p>
            <p className="text-sm text-gray-600">
              <span className="text-gray-400">Expires:</span> {formatDate(page.expiresAt)}
            </p>
            <PageActions
              page={page}
              deleteId={deleteId}
              setDeleteId={setDeleteId}
              onDelete={handleDelete}
              onRenew={handleRenew}
              isPending={isPending}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function PageActions({
  page,
  deleteId,
  setDeleteId,
  onDelete,
  onRenew,
  isPending,
}: {
  page: Page;
  deleteId: string | null;
  setDeleteId: (id: string | null) => void;
  onDelete: (id: string) => void;
  onRenew: (id: string) => void;
  isPending: boolean;
}) {
  if (deleteId === page.id) {
    return (
      <div className="flex flex-wrap items-center gap-2 justify-end">
        <span className="text-sm text-gray-600">Delete this page?</span>
        <Button variant="danger" size="sm" loading={isPending} onClick={() => onDelete(page.id)}>
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
      <Link href={`/admin/pages/${page.id}/edit`}>
        <Button variant="secondary" size="sm">Edit</Button>
      </Link>
      <Button variant="primary" size="sm" loading={isPending} onClick={() => onRenew(page.id)}>
        Renew (1 Credit)
      </Button>
      <Button variant="danger" size="sm" onClick={() => setDeleteId(page.id)}>
        Delete
      </Button>
      <a href={`/api/qr/${page.shortCode}?download=1`}>
        <Button variant="primary" size="sm">Download QR</Button>
      </a>
    </div>
  );
}
