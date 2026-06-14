"use client";

import { useActionState, useEffect, useState } from "react";
import { slugify } from "@/lib/utils";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { createSchoolAction, type ActionResult } from "@/actions/schools";

interface SchoolFormProps {
  submitLabel: string;
  onSuccess?: (data: { id: string; slug: string; qrCodePath: string }) => void;
}

type CreateSchoolResult = ActionResult<{ id: string; slug: string; qrCodePath: string }>;

const initialState: CreateSchoolResult = {
  success: false,
};

export function SchoolForm({ submitLabel, onSuccess }: SchoolFormProps) {
  const [state, formAction, isPending] = useActionState(createSchoolAction, initialState);
  const [schoolName, setSchoolName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);

  useEffect(() => {
    if (!slugTouched && schoolName) {
      setSlug(slugify(schoolName));
    }
  }, [schoolName, slugTouched]);

  useEffect(() => {
    if (state.success && state.data && onSuccess) {
      onSuccess(state.data);
    }
  }, [state, onSuccess]);

  return (
    <form action={formAction} className="space-y-5 max-w-xl">
      {state.error && <Alert variant="error" message={state.error} />}

      <Input
        label="School Name"
        name="schoolName"
        value={schoolName}
        onChange={(e) => setSchoolName(e.target.value)}
        required
        placeholder="ABC Driving School"
      />

      <Input
        label="Phone Number"
        name="phoneNumber"
        type="tel"
        required
        placeholder="+91 98765 43210"
      />

      <Input
        label="WhatsApp Number"
        name="whatsappNumber"
        type="tel"
        required
        placeholder="+91 98765 43210"
      />

      <Input
        label="Google Maps URL"
        name="googleMapsUrl"
        type="url"
        required
        placeholder="https://maps.google.com/..."
      />

      <Input
        label="Slug"
        name="slug"
        value={slug}
        onChange={(e) => {
          setSlugTouched(true);
          setSlug(e.target.value);
        }}
        required
        placeholder="abc-driving-school"
      />

      <Button type="submit" loading={isPending} size="lg">
        {submitLabel}
      </Button>
    </form>
  );
}
