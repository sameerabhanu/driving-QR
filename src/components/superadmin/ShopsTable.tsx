"use client";

import { useState, useTransition } from "react";
import type { ShopWithStats } from "@/actions/shops";
import {
  addShopCreditsAction,
  deleteShopAction,
} from "@/actions/shops";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";

interface ShopsTableProps {
  shops: ShopWithStats[];
}

export function ShopsTable({ shops }: ShopsTableProps) {
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [pinQuery, setPinQuery] = useState("");
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

  const query = pinQuery.trim();
  const filteredShops = query
    ? shops.filter((shop) => shop.pin.includes(query))
    : shops;

  return (
    <div className="space-y-4">
      {error && <Alert variant="error" message={error} />}

      <div className="max-w-xs">
        <Input
          type="search"
          inputMode="numeric"
          value={pinQuery}
          onChange={(e) => setPinQuery(e.target.value)}
          placeholder="Search by PIN…"
          aria-label="Search shops by PIN"
        />
      </div>

      {filteredShops.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-10 text-center">
          <p className="text-sm text-gray-500">No shop matches PIN “{query}”.</p>
        </div>
      ) : (
        <>
          <div className="hidden lg:block rounded-xl border border-gray-200 bg-white overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Shop</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">PIN</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Pages</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Credits</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Expiring Next Month</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredShops.map((shop) => (
                  <tr key={shop.id} className="hover:bg-gray-50 align-top">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-900">{shop.shopName}</p>
                      <p className="text-xs text-gray-500">{shop.ownerName}</p>
                      <p className="text-xs text-gray-400">{shop.ownerPhone || "—"}</p>
                    </td>
                    <td className="px-4 py-3">
                      <code className="text-sm bg-gray-100 px-1.5 py-0.5 rounded">{shop.pin}</code>
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-gray-700">
                      {shop.pagesTotal}
                    </td>
                    <td className="px-4 py-3 text-center text-sm font-semibold text-gray-900">
                      {shop.availableCredits}
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-gray-700">
                      {shop.expiringNextMonth}
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
            {filteredShops.map((shop) => (
              <div key={shop.id} className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{shop.shopName}</h3>
                    <p className="text-sm text-gray-500">{shop.ownerName}</p>
                  </div>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><span className="text-gray-400">PIN:</span> <code className="bg-gray-100 px-1.5 rounded">{shop.pin}</code></p>
                  <p><span className="text-gray-400">Phone:</span> {shop.ownerPhone || "—"}</p>
                  <p><span className="text-gray-400">Pages:</span> {shop.pagesTotal}</p>
                  <p><span className="text-gray-400">Credits:</span> {shop.availableCredits}</p>
                  <p><span className="text-gray-400">Expiring next month:</span> {shop.expiringNextMonth}</p>
                </div>
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
        </>
      )}
    </div>
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
      <AddCreditsForm shopId={shop.id} isPending={isPending} run={run} />
      <Button variant="danger" size="sm" onClick={() => setDeleteId(shop.id)}>
        Delete
      </Button>
    </div>
  );
}

function AddCreditsForm({
  shopId,
  isPending,
  run,
}: {
  shopId: string;
  isPending: boolean;
  run: (fn: () => Promise<{ success: boolean; error?: string }>) => void;
}) {
  const [open, setOpen] = useState(false);
  const [credits, setCredits] = useState("");

  if (!open) {
    return (
      <Button variant="primary" size="sm" onClick={() => setOpen(true)}>
        Add Credits
      </Button>
    );
  }

  const submit = () => {
    const amount = Number.parseInt(credits, 10);
    if (!Number.isInteger(amount) || amount <= 0) return;
    run(() => addShopCreditsAction(shopId, amount));
    setCredits("");
    setOpen(false);
  };

  return (
    <div className="flex items-center gap-1.5">
      <input
        type="number"
        min={1}
        autoFocus
        value={credits}
        onChange={(e) => setCredits(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") submit();
          if (e.key === "Escape") {
            setOpen(false);
            setCredits("");
          }
        }}
        placeholder="Credits"
        className="w-24 rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
      />
      <Button variant="primary" size="sm" loading={isPending} onClick={submit}>
        Add
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          setOpen(false);
          setCredits("");
        }}
      >
        Cancel
      </Button>
    </div>
  );
}
