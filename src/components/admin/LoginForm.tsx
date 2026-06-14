"use client";

import { useActionState } from "react";
import { loginAction } from "@/actions/auth";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

const initialState = { success: false, error: undefined as string | undefined };

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="space-y-5">
      {state.error && <Alert variant="error" message={state.error} />}

      <Input
        label="Admin Password"
        name="password"
        type="password"
        required
        autoComplete="current-password"
        placeholder="Enter admin password"
      />

      <Button type="submit" loading={isPending} className="w-full" size="lg">
        Sign In
      </Button>
    </form>
  );
}
