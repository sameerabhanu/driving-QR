"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import type { ActionResult } from "@/actions/schools";

interface EditSchoolFormProps {
  action: (
    prevState: ActionResult,
    formData: FormData
  ) => Promise<ActionResult>;
  initialData: {
    schoolName: string;
    phoneNumber: string;
    whatsappNumber: string;
    googleMapsUrl: string;
    slug: string;
  };
}

const initialState: ActionResult = { success: false };

export function EditSchoolForm({ action, initialData }: EditSchoolFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-5 max-w-xl">
      {state.error && <Alert variant="error" message={state.error} />}
      {state.success && <Alert variant="success" message="School updated successfully." />}

      <Input
        label="School Name"
        name="schoolName"
        defaultValue={initialData.schoolName}
        required
      />

      <Input
        label="Phone Number"
        name="phoneNumber"
        type="tel"
        defaultValue={initialData.phoneNumber}
        required
      />

      <Input
        label="WhatsApp Number"
        name="whatsappNumber"
        type="tel"
        defaultValue={initialData.whatsappNumber}
        required
      />

      <Input
        label="Google Maps URL"
        name="googleMapsUrl"
        type="url"
        defaultValue={initialData.googleMapsUrl}
        required
      />

      <Input
        label="Slug"
        name="slug"
        defaultValue={initialData.slug}
        required
      />

      <Button type="submit" loading={isPending} size="lg">
        Save Changes
      </Button>
    </form>
  );
}
