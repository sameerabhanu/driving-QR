"use client";

import { logoutAction } from "@/actions/auth";

interface LogoutFormProps {
  className?: string;
  children: React.ReactNode;
}

export function LogoutForm({ className, children }: LogoutFormProps) {
  return (
    <form action={logoutAction} className={className}>
      {children}
    </form>
  );
}
