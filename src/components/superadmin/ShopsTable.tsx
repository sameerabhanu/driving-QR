"use client";

import { useState, useTransition } from "react";
import type { ShopWithStats } from "@/actions/shops";
import {
  setShopStatusAction,
  setBillingPaidAction,
  deleteShopAction,
} from "@/actions/shops";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

interface ShopsTableProps {
  shops: ShopWithStats[];
}

export function ShopsTable({ shops }: ShopsTableProps) {
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const run = (fn: () => Promise<{ success: boolean; error?: string }>) => {
    setError(null);
    startTransition(async () => {
      const result = await fn();
      if (!result.success) setError(result.error ?? "Action failed");
      else setDeleteId(null);
    });
  };

  if (shops.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
        <h3 className="text-lg font-semibold text-gray-900">No shops yet</h3>
        <p className="mt-1 text-sm text-gray-500">Onboard your first reseller shop.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && <Alert variant="error" message={error} />}

      <div className="hidden lg:block rounded-xl border border-gray-200 bg-white overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Shop</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">PIN</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">This / Last / Total</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Bill</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {shops.map((shop) => (
              <tr key={shop.id} className="hover:bg-gray-50 align-top">
                <td className="px-4 py-3">
                  <p className="text-sm font-medium text-gray-900">{shop.shopName}</p>
                  <p className="text-xs text-gray-500">{shop.ownerName}</p>
                </td>
                <td className="px-4 py-3">
                  <code className="text-sm bg-gray-100 px-1.5 py-0.5 rounded">{shop.pin}</code>
                </td>
                <td className="px-4 py-3 text-center text-sm text-gray-700">
                  {shop.pagesThisMonth} / {shop.pagesLastMonth} / {shop.pagesTotal}
                </td>
                <td className="px-4 py-3">
                  <BillCell shop={shop} />
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={shop.status} />
                </td>
                <td className="px-4 py-3 text-right">
                  <ShopActions
                    shop={shop}
                    deleteId={deleteId}
                    setDeleteId={setDeleteId}
                    isPending={isPending}
                    run={run}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="lg:hidden space-y-4">
        {shops.map((shop) => (
          <div key={shop.id} className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">{shop.shopName}</h3>
                <p className="text-sm text-gray-500">{shop.ownerName}</p>
              </div>
              <StatusBadge status={shop.status} />
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <p><span className="text-gray-400">PIN:</span> <code className="bg-gray-100 px-1.5 rounded">{shop.pin}</code></p>
              <p><span className="text-gray-400">Pages (this/last/total):</span> {shop.pagesThisMonth} / {shop.pagesLastMonth} / {shop.pagesTotal}</p>
            </div>
            <BillCell shop={shop} />
            <ShopActions
              shop={shop}
              deleteId={deleteId}
              setDeleteId={setDeleteId}
              isPending={isPending}
              run={run}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function BillCell({ shop }: { shop: ShopWithStats }) {
  if (!shop.billable) {
    return <span className="text-sm text-gray-400">Free</span>;
  }
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-semibold text-gray-900">{formatCurrency(shop.amountDue)}</span>
      {shop.paid ? (
        <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Paid</span>
      ) : (
        <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Due</span>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const isActive = status === "active";
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isActive ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
        }`}
    >
      {isActive ? "Active" : "Suspended"}
    </span>
  );
}

function ShopActions({
  shop,
  deleteId,
  setDeleteId,
  isPending,
  run,
}: {
  shop: ShopWithStats;
  deleteId: string | null;
  setDeleteId: (id: string | null) => void;
  isPending: boolean;
  run: (fn: () => Promise<{ success: boolean; error?: string }>) => void;
}) {
  if (deleteId === shop.id) {
    return (
      <div className="flex flex-wrap items-center gap-2 justify-end">
        <span className="text-sm text-gray-600">Delete shop & all its pages?</span>
        <Button variant="danger" size="sm" loading={isPending} onClick={() => run(() => deleteShopAction(shop.id))}>
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
      {shop.billable && (
        <Button
          variant={shop.paid ? "ghost" : "primary"}
          size="sm"
          onClick={() => run(() => setBillingPaidAction(shop.id, !shop.paid))}
        >
          {shop.paid ? "Mark Unpaid" : "Mark Paid"}
        </Button>
      )}
      {shop.status === "active" ? (
        <Button variant="secondary" size="sm" onClick={() => run(() => setShopStatusAction(shop.id, "suspended"))}>
          Suspend
        </Button>
      ) : (
        <Button variant="primary" size="sm" onClick={() => run(() => setShopStatusAction(shop.id, "active"))}>
          Activate
        </Button>
      )}
      <Button variant="danger" size="sm" onClick={() => setDeleteId(shop.id)}>
        Delete
      </Button>
    </div>
  );
}
