"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

type LoginResult = { success: boolean; error?: string };

interface PinLoginFormProps {
  action: (prevState: LoginResult, formData: FormData) => Promise<LoginResult>;
  label?: string;
  maxLength?: number;
}

const initialState: LoginResult = { success: false };

export function PinLoginForm({ action, label = "PIN", maxLength = 6 }: PinLoginFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-5">
      {state.error && <Alert variant="error" message={state.error} />}

      <div className="space-y-1.5">
        <label htmlFor="pin" className="block text-sm font-medium text-gray-700">
          {label}
        </label>
        <input
          id="pin"
          name="pin"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="\d*"
          maxLength={maxLength}
          required
          placeholder="••••"
          className="block w-full rounded-lg border border-gray-300 px-3 py-3 text-center text-2xl tracking-[0.5em] font-semibold placeholder:tracking-[0.3em] focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        />
      </div>

      <Button type="submit" loading={isPending} className="w-full" size="lg">
        Sign In
      </Button>
    </form>
  );
}
