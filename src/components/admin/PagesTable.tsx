"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import type { Page } from "@/db/schema";
import { deletePageAction, renewPageAction } from "@/actions/pages";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";

interface PagesTableProps {
  pages: Page[];
}

export function PagesTable({ pages }: PagesTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [codeQuery, setCodeQuery] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleDelete = (id: string) => {
    setError(null);
    setPendingId(id);
    startTransition(async () => {
      const result = await deletePageAction(id);
      if (result.success) {
        setDeleteId(null);
      } else {
        setError(result.error ?? "Failed to delete page");
      }
      setPendingId(null);
    });
  };

  const handleRenew = (id: string) => {
    setError(null);
    setPendingId(id);
    startTransition(async () => {
      const result = await renewPageAction(id);
      if (!result.success) {
        setError(result.error ?? "Failed to renew page");
      }
      setPendingId(null);
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

  const query = codeQuery.trim().toLowerCase();
  const filteredPages = query
    ? pages.filter((page) => page.shortCode.toLowerCase().includes(query))
    : pages;

  return (
    <div className="space-y-4">
      {error && <Alert variant="error" message={error} />}

      <div className="max-w-xs">
        <Input
          type="search"
          value={codeQuery}
          onChange={(e) => setCodeQuery(e.target.value)}
          placeholder="Search by code…"
          aria-label="Search pages by code"
        />
      </div>

      {filteredPages.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-10 text-center">
          <p className="text-sm text-gray-500">No page matches code “{codeQuery.trim()}”.</p>
        </div>
      ) : (
        <>
          <div className="hidden md:block rounded-xl border border-gray-200 bg-white overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Business</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Code</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Expires</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredPages.map((page) => (
                  <tr key={page.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{page.businessName}</td>
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
                        isPending={isPending && pendingId === page.id}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-4">
            {filteredPages.map((page) => (
              <div key={page.id} className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-gray-900">{page.businessName}</h3>
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
                  isPending={isPending && pendingId === page.id}
                />
              </div>
            ))}
          </div>
        </>
      )}
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
      <Button variant="primary" size="sm" loading={isPending} onClick={() => onRenew(page.id)}>
        Renew
      </Button>
      <Link href={`/admin/pages/${page.id}/edit`} title="Edit page" aria-label="Edit page">
        <Button variant="secondary" size="sm" aria-label="Edit page" title="Edit page">
          <EditIcon />
        </Button>
      </Link>
      <a
        href={`/api/qr/${page.shortCode}?download=1`}
        title="Download QR"
        aria-label="Download QR"
      >
        <Button variant="primary" size="sm" aria-label="Download QR" title="Download QR">
          <QrIcon />
        </Button>
      </a>
      <Button
        variant="danger"
        size="sm"
        onClick={() => setDeleteId(page.id)}
        aria-label="Delete page"
        title="Delete page"
      >
        <DeleteIcon />
      </Button>
    </div>
  );
}

function EditIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
    </svg>
  );
}

function DeleteIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  );
}

function QrIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75v-.75zM16.5 6.75h.75v.75h-.75v-.75zM13.5 13.5h.75v.75h-.75v-.75zM13.5 19.5h.75v.75h-.75v-.75zM19.5 13.5h.75v.75h-.75v-.75zM19.5 19.5h.75v.75h-.75v-.75zM16.5 16.5h.75v.75h-.75v-.75z" />
    </svg>
  );
}
