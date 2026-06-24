"use client";

import { useState } from "react";
import { PageForm } from "@/components/admin/PageForm";
import { createSuperPageAction } from "@/actions/pages";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";

export function AddSuperPageClient() {
  const [created, setCreated] = useState<{ id: string; shortCode: string } | null>(null);

  if (created) {
    return (
      <div className="max-w-xl space-y-6">
        <Alert variant="success" message="Page created! The QR code is ready to print." />

        <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
          <h3 className="font-semibold text-gray-900">QR Code Ready</h3>
          <p className="text-sm text-gray-600">
            The landing page is live. Print the poster or open the page to review it.
          </p>
          <div className="flex flex-wrap gap-3">
            <a href={`/api/qr/${created.shortCode}?download=1`}>
              <Button size="lg">Download Poster</Button>
            </a>
            <a href={`/api/superadmin/card/${created.shortCode}`}>
              <Button size="lg">Download Visiting Card</Button>
            </a>
            <a href={`/p/${created.shortCode}`} target="_blank" rel="noopener noreferrer">
              <Button variant="secondary" size="lg">View Page</Button>
            </a>
          </div>
        </div>

        <Button variant="ghost" onClick={() => setCreated(null)}>
          Create Another Page
        </Button>
      </div>
    );
  }

  return (
    <PageForm
      action={createSuperPageAction}
      submitLabel="Generate Page"
      manualContent
      allowSlug
      onSuccess={(data) => setCreated(data)}
    />
  );
}
