import { cn } from "@/lib/utils";

type AlertVariant = "success" | "error" | "info";

interface AlertProps {
  variant: AlertVariant;
  message: string;
  className?: string;
}

const variantStyles: Record<AlertVariant, string> = {
  success: "bg-green-50 text-green-800 border-green-200",
  error: "bg-red-50 text-red-800 border-red-200",
  info: "bg-blue-50 text-blue-800 border-blue-200",
};

export function Alert({ variant, message, className }: AlertProps) {
  return (
    <div
      role="alert"
      className={cn(
        "rounded-lg border px-4 py-3 text-sm font-medium",
        variantStyles[variant],
        className
      )}
    >
      {message}
    </div>
  );
}
