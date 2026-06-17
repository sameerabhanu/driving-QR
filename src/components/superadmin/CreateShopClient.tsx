"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { createShopAction } from "@/actions/shops";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

type FormResult = { success: boolean; error?: string; data?: { id: string; pin: string } };
const initialState: FormResult = { success: false };

export function CreateShopClient() {
  const [state, formAction, isPending] = useActionState(createShopAction, initialState);
  const [copied, setCopied] = useState(false);

  const pin = state.data?.pin ?? "";

  const copyPin = async () => {
    if (!pin) return;
    await navigator.clipboard.writeText(pin);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (state.success) {
    return (
      <div className="max-w-xl space-y-6">
        <Alert variant="success" message="Shop created successfully." />
        <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-3">
          <p className="text-sm text-gray-600">
            Share this PIN with the shop. They use it to log in at{" "}
            <code className="bg-gray-100 px-1 rounded">/admin</code>.
          </p>
          <div className="flex items-center gap-3">
            <p className="text-3xl font-bold tracking-widest text-gray-900">{pin}</p>
            <Button type="button" variant="secondary" onClick={copyPin}>
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
        </div>
        <div className="flex gap-3">
          <Link href="/superadmin">
            <Button variant="secondary">Back to Shops</Button>
          </Link>
          <Button onClick={() => window.location.reload()}>Add Another Shop</Button>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5 max-w-xl">
      {state.error && <Alert variant="error" message={state.error} />}

      <Input label="Shop Name" name="shopName" required placeholder="e.g. Sri Sai Xerox & Prints" />
      <Input label="Owner Name" name="ownerName" required placeholder="e.g. Ramesh Kumar" />
      <Input label="Owner Phone Number" name="ownerPhone" type="tel" required placeholder="e.g. +91 98765 43210" />

      <p className="text-xs text-gray-500">
        A unique 4-digit login PIN will be auto-generated when you create the shop.
      </p>

      <Button type="submit" loading={isPending} size="lg">
        Create Shop
      </Button>
    </form>
  );
}
