"use client";

import { useState } from "react";
import { SchoolForm } from "./SchoolForm";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";

export function AddSchoolClient() {
  const [createdSchool, setCreatedSchool] = useState<{
    id: string;
    slug: string;
    qrCodePath: string;
  } | null>(null);

  if (createdSchool) {
    return (
      <div className="max-w-xl space-y-6">
        <Alert variant="success" message="School created successfully! QR code has been generated." />

        <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
          <h3 className="font-semibold text-gray-900">QR Code Ready</h3>
          <p className="text-sm text-gray-600">
            The landing page is live and the QR code points to your school&apos;s unique URL.
          </p>
          <div className="flex flex-wrap gap-3">
            <a href={`/api/qr/${createdSchool.slug}?download=1`}>
              <Button size="lg">Download QR</Button>
            </a>
            <a href={`/${createdSchool.slug}`} target="_blank" rel="noopener noreferrer">
              <Button variant="secondary" size="lg">View Landing Page</Button>
            </a>
          </div>
        </div>

        <Button
          variant="ghost"
          onClick={() => setCreatedSchool(null)}
        >
          Add Another School
        </Button>
      </div>
    );
  }

  return (
    <SchoolForm
      submitLabel="Generate School"
      onSuccess={(data) => setCreatedSchool(data)}
    />
  );
}
