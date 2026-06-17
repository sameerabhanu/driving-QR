import { cn } from "@/lib/utils";

/**
 * A shimmering placeholder block used while server data is loading.
 */
export function Skeleton({ className }: { className?: string }) {
    return (
        <div
            className={cn("animate-pulse rounded-md bg-gray-200", className)}
            aria-hidden="true"
        />
    );
}

/**
 * A centered spinner for full-section or full-page loading states.
 */
export function Spinner({ className }: { className?: string }) {
    return (
        <svg
            className={cn("animate-spin text-brand-600", className)}
            viewBox="0 0 24 24"
            fill="none"
            role="status"
            aria-label="Loading"
        >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
        </svg>
    );
}
